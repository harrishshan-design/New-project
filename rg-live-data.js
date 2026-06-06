(function () {
  const CONFIG = {
    supabaseUrl: "",
    publishableKey: "",
    tables: [
      "profiles",
      "properties",
      "leads",
      "admin_reports",
      "platform_events",
      "escrow_transactions",
      "commissions",
      "agent_reviews",
      "buyer_behavior_events",
      "audit_logs"
    ],
    primaryAgentId: "22222222-2222-4222-8222-222222222222"
  };

  const script = document.currentScript;
  const liveRole = script?.dataset.liveRole || document.body?.dataset.liveRole || "agent";
  const money = (value) => `RM ${Math.round(Number(value || 0)).toLocaleString("en-MY")}`;
  const dateTime = (value) => value ? new Date(value).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" }) : "No timestamp";
  const safe = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[character]));
  const byCreated = (items) => [...(items || [])].sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0));
  const uniqueCount = (items, keyFn) => new Set((items || []).map(keyFn).filter(Boolean)).size;

  const state = {
    role: liveRole,
    ready: false,
    session: null,
    client: null,
    profile: null,
    tables: Object.fromEntries(CONFIG.tables.map((table) => [table, []])),
    errors: {},
    pushPrimed: false,
    seenRows: Object.fromEntries(CONFIG.tables.map((table) => [table, new Set()]))
  };

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function injectStyles() {
    if ($("rgLiveDataStyles")) return;
    const style = document.createElement("style");
    style.id = "rgLiveDataStyles";
    style.textContent = `
      .rg-live-pill{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border-radius:999px;border:1px solid rgba(20,184,166,.28);background:rgba(20,184,166,.1);color:inherit;font-weight:900;font-size:.82rem}
      .rg-live-pill i{color:#14b8a6}.rg-live-pill.is-warn{border-color:rgba(245,158,11,.28);background:rgba(245,158,11,.12)}.rg-live-pill.is-warn i{color:#f59e0b}
      .rg-live-panel{margin:18px 0;padding:18px;border:1px solid rgba(20,184,166,.18);border-radius:18px;background:linear-gradient(180deg,rgba(20,184,166,.1),rgba(15,23,42,.04));box-shadow:0 18px 46px rgba(15,23,42,.08)}
      .rg-live-panel h3{margin:0 0 6px;font-size:1.05rem}.rg-live-panel p{margin:0;color:var(--muted,#94a3b8);line-height:1.55}.rg-live-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}
      .rg-live-card{padding:14px;border:1px solid rgba(148,163,184,.18);border-radius:14px;background:rgba(255,255,255,.06)}.rg-live-card span{display:block;color:var(--muted,#94a3b8);font-size:.76rem;text-transform:uppercase;font-weight:900;letter-spacing:.08em}.rg-live-card strong{display:block;margin-top:6px;font-size:1.25rem}
      .rg-live-list{display:grid;gap:10px;margin-top:14px}.rg-live-row{padding:13px;border:1px solid rgba(148,163,184,.18);border-radius:14px;background:rgba(255,255,255,.06)}.rg-live-row strong{display:block}.rg-live-row span{display:block;margin-top:4px;color:var(--muted,#94a3b8);font-size:.88rem;line-height:1.45}
      .rg-live-empty{padding:16px;border:1px dashed rgba(148,163,184,.3);border-radius:14px;color:var(--muted,#94a3b8);margin-top:14px}
      .rg-owner-revenue-dock{position:fixed;right:18px;bottom:18px;z-index:90;width:min(320px,calc(100vw - 36px));padding:15px;border:1px solid rgba(214,179,89,.38);border-radius:12px;background:linear-gradient(180deg,rgba(10,12,9,.96),rgba(5,6,4,.98));box-shadow:0 24px 70px rgba(0,0,0,.42);color:#fff8df;font-family:Inter,system-ui,sans-serif}
      .rg-owner-revenue-dock span{display:block;color:#d6b359;font-family:"JetBrains Mono",monospace;font-size:.72rem;font-weight:900;letter-spacing:.12em}.rg-owner-revenue-dock strong{display:block;margin:4px 0;font-size:1.55rem}.rg-owner-revenue-dock small{display:block;color:#94a3b8;line-height:1.4}.rg-owner-revenue-dock div{display:flex;justify-content:space-between;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(214,179,89,.14)}.rg-owner-revenue-dock b{color:#f7d37a}.rg-owner-revenue-dock em{font-style:normal;color:#94a3b8}
      .rg-master-task-dock{margin:16px 0 0;padding:15px;border:1px solid rgba(214,179,89,.24);border-radius:14px;background:linear-gradient(135deg,rgba(214,179,89,.14),rgba(255,255,255,.04))}
      .rg-master-task-dock h4{margin:0 0 8px;color:#fff8df}.rg-master-task-dock article{display:grid;gap:5px;padding:12px;border:1px solid rgba(214,179,89,.18);border-radius:12px;background:rgba(0,0,0,.16)}.rg-master-task-dock article+article{margin-top:8px}.rg-master-task-dock strong{color:#fff8df}.rg-master-task-dock span{color:#94a3b8;font-size:.86rem;line-height:1.45}
      @media (max-width:900px){.rg-live-grid{grid-template-columns:1fr 1fr}}@media (max-width:560px){.rg-live-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureStatusPill() {
    injectStyles();
    let pill = $("rgLiveStatusPill");
    if (pill) return pill;
    pill = document.createElement("div");
    pill.id = "rgLiveStatusPill";
    pill.className = "rg-live-pill is-warn";
    pill.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Connecting live data</span>';
    const target = document.querySelector(".top-actions") || document.querySelector(".market-tape") || document.querySelector(".main") || document.body;
    target.appendChild(pill);
    return pill;
  }

  function setStatus(text, ok = false) {
    const pill = ensureStatusPill();
    pill.classList.toggle("is-warn", !ok);
    pill.innerHTML = `<i class="fa-solid ${ok ? "fa-bolt" : "fa-triangle-exclamation"}"></i><span>${safe(text)}</span>`;
  }

  function ensurePanel() {
    injectStyles();
    let panel = $("rgLivePanel");
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = "rgLivePanel";
    panel.className = "rg-live-panel";
    const anchor = document.querySelector(".hero") || document.querySelector(".hero-panel") || document.querySelector(".market-tape");
    if (anchor?.parentElement) anchor.insertAdjacentElement("afterend", panel);
    else document.querySelector(".main")?.prepend(panel);
    return panel;
  }

  function table(name) {
    return state.tables[name] || [];
  }

  function reviewStats(reviews) {
    const published = (reviews || []).filter((review) => review.status !== "hidden");
    const count = published.length;
    const average = count
      ? published.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count
      : 0;

    return {
      count,
      average,
      label: count ? `${average.toFixed(1)}/5 (${count})` : "No reviews"
    };
  }

  function reviewRows(reviews, limit = 5) {
    return byCreated(reviews).slice(0, limit).map((review) => ({
      title: `${Number(review.rating || 0)}/5 agent review`,
      body: `${review.property_title || "General agent review"} - ${review.review_text || "No written review"}`
    }));
  }

  function behaviorLabel(eventType = "") {
    return String(eventType).replace(/_/g, " ");
  }

  function behaviorTitle(event) {
    return `${Number(event.intent_score || 0)} intent - ${behaviorLabel(event.event_type)}`;
  }

  function behaviorBody(event) {
    const target = event.property_title || event.search_query || "No target captured";
    const buyer = event.buyer_name || event.buyer_phone || "Signed-in buyer";
    const area = event.area || "No area";
    return `${buyer} - ${target} - ${area} - ${event.status || "new"} - ${dateTime(event.created_at)}`;
  }

  function isScopedEvent(event, role) {
    return ["all", role].includes(event.scope_role);
  }

  function eventNotifyRoles(event) {
    const roles = event?.metadata?.notify_roles;
    return Array.isArray(roles) ? roles : [];
  }

  function isNewAgentLoginEvent(event) {
    return event?.metadata?.device_notification === "new_agent_login";
  }

  function canNotifyPlatformEvent(event, role) {
    const roles = eventNotifyRoles(event);
    if (roles.length) return roles.includes(role);
    return isScopedEvent(event, role);
  }

  function agentLoginSeenKey(role) {
    return `rg_${role}_notified_agent_login_event_ids`;
  }

  function readSeenAgentLoginIds(role) {
    try {
      return new Set(JSON.parse(localStorage.getItem(agentLoginSeenKey(role)) || "[]"));
    } catch {
      return new Set();
    }
  }

  function writeSeenAgentLoginIds(role, seen) {
    localStorage.setItem(agentLoginSeenKey(role), JSON.stringify([...seen].slice(-250)));
  }

  function claimAgentLoginNotification(event, role) {
    if (!event?.id) return true;
    const seen = readSeenAgentLoginIds(role);
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    writeSeenAgentLoginIds(role, seen);
    return true;
  }

  function platformEventUrl(role, event) {
    if (role === "admin") return `${location.origin}/backend/admin.html#agents`;
    if (role === "master") return `${location.origin}/backend/master.html#panopticon`;
    if (role === "agent") return `${location.origin}/agent.html`;
    return location.href;
  }

  function notifyLiveRow(tableName, row) {
    if (!state.pushPrimed || !window.RealtyGeniusPush) return;

    if (state.role === "admin") {
      if (tableName === "buyer_behavior_events" && row.status === "new") {
        window.RealtyGeniusPush.notify("New buyer intent signal", behaviorBody(row), {
          tag: `rg-admin-behavior-${row.id}`,
          url: `${location.origin}/backend/admin.html#notifications`
        });
      }

      if (tableName === "admin_reports") {
        window.RealtyGeniusPush.notify("New user report", `${row.type || "Report"} - ${row.description || "Review required"}`, {
          tag: `rg-admin-report-${row.id}`,
          url: `${location.origin}/backend/admin.html#reports`
        });
      }

      if (tableName === "profiles" && row.role === "agent" && row.status === "pending") {
        window.RealtyGeniusPush.notify("Agent verification waiting", `${row.full_name || "New agent"} needs REN and IC review.`, {
          tag: `rg-admin-agent-${row.id}`,
          url: `${location.origin}/backend/admin.html#agents`
        });
      }
    }

    if (state.role === "agent") {
      const belongsToAgent = !row.agent_id || row.agent_id === state.session?.user?.id;
      if (tableName === "leads" && belongsToAgent) {
        window.RealtyGeniusPush.notify("New lead in your pipeline", `${row.name || "Buyer"} - ${row.preferred_area || "Malaysia"} - ${Number(row.score || 0)} score`, {
          tag: `rg-agent-lead-${row.id}`,
          url: `${location.origin}/agent.html`
        });
      }

      if (tableName === "buyer_behavior_events" && row.pushed_to_agent_id === state.session?.user?.id) {
        window.RealtyGeniusPush.notify("Admin pushed a buyer signal", behaviorBody(row), {
          tag: `rg-agent-behavior-${row.id}`,
          url: `${location.origin}/agent.html`
        });
      }
    }

    if (tableName === "platform_events" && canNotifyPlatformEvent(row, state.role)) {
      if (isNewAgentLoginEvent(row) && !claimAgentLoginNotification(row, state.role)) return;
      const roleUrl = platformEventUrl(state.role, row);
      window.RealtyGeniusPush.notify(row.title || "RealityGenius live update", row.body || row.event_type || "New platform event", {
        tag: `rg-${state.role}-event-${row.id}`,
        url: roleUrl
      });
    }
  }

  function trackNewRows(tableName, rows) {
    const seen = state.seenRows[tableName] || new Set();
    (rows || []).forEach((row) => {
      if (!row?.id) return;
      if (!seen.has(row.id)) notifyLiveRow(tableName, row);
      seen.add(row.id);
    });
    state.seenRows[tableName] = seen;
  }

  function behaviorRows(events, limit = 5) {
    return byCreated(events).slice(0, limit).map((event) => ({
      title: behaviorTitle(event),
      body: behaviorBody(event)
    }));
  }

  function behaviorCardHtml(event, includeAction = false) {
    const pushed = event.status === "pushed_to_agent";
    return `
      <article class="rg-live-row">
        <strong>${safe(behaviorTitle(event))}</strong>
        <span>${safe(behaviorBody(event))}</span>
        ${event.search_query ? `<span>Search: ${safe(event.search_query)}</span>` : ""}
        ${event.buyer_phone ? `<span>Buyer phone: ${safe(event.buyer_phone)}</span>` : ""}
        ${includeAction ? `
          <button class="ghost-button" data-action="push-behavior-agent" data-id="${safe(event.id)}" type="button" ${pushed ? "disabled" : ""}>
            ${pushed ? "Pushed to agent" : "Push to agent"}
          </button>
        ` : ""}
      </article>
    `;
  }

  function defaultAgentId(behavior = {}) {
    const normalize = (value) => String(value || "").trim().toLowerCase();
    const title = normalize(behavior.property_title);
    const area = normalize(behavior.area || behavior.search_query);
    const listings = table("properties").filter((property) => property.agent_id);

    const titleMatch = title
      ? listings.find((property) => {
        const propertyTitle = normalize(property.title);
        return propertyTitle && (propertyTitle === title || propertyTitle.includes(title) || title.includes(propertyTitle));
      })
      : null;
    if (titleMatch?.agent_id) return titleMatch.agent_id;

    const areaMatch = area
      ? listings.find((property) => {
        const location = normalize(property.location);
        const propertyTitle = normalize(property.title);
        return (location && (location.includes(area) || area.includes(location))) || (propertyTitle && propertyTitle.includes(area));
      })
      : null;
    if (areaMatch?.agent_id) return areaMatch.agent_id;

    const approvedAgent = table("profiles").find((profile) => profile.role === "agent" && profile.status !== "suspended");
    return approvedAgent?.id || CONFIG.primaryAgentId;
  }

  async function pushBehaviorToAgent(eventId) {
    if (!state.client || state.role !== "admin") return;
    const behavior = table("buyer_behavior_events").find((item) => item.id === eventId);
    if (!behavior || behavior.status === "pushed_to_agent") return;

    const agentId = defaultAgentId(behavior);
    const title = behavior.property_title || behavior.search_query || "Buyer behavior signal";
    const area = behavior.area || behavior.search_query || "Malaysia";
    const budget = Number(behavior.property_price || 0);

    const { error: leadError } = await state.client.from("leads").insert({
      agent_id: agentId,
      buyer_user_id: behavior.buyer_user_id || null,
      name: behavior.buyer_name || "Behavior signal buyer",
      phone: behavior.buyer_phone || null,
      preferred_area: area,
      property_type: behavior.metadata?.property_type || null,
      budget_min: budget ? Math.round(budget * 0.9) : null,
      budget_max: budget ? Math.round(budget * 1.05) : null,
      source: "admin_behavior_push",
      status: Number(behavior.intent_score || 0) >= 80 ? "qualified" : "new",
      score: Number(behavior.intent_score || 50),
      notes: `Admin pushed buyer behavior: ${behaviorLabel(behavior.event_type)} for ${title}. Search: ${behavior.search_query || "none"}.`
    });

    if (leadError) {
      setStatus(`Push failed: ${leadError.message}`);
      return;
    }

    await state.client.from("buyer_behavior_events").update({
      status: "pushed_to_agent",
      pushed_to_agent_id: agentId,
      admin_notes: `Pushed to agent from admin dashboard on ${new Date().toISOString()}`,
      updated_at: new Date().toISOString()
    }).eq("id", eventId);

    await state.client.from("platform_events").insert({
      event_type: "behavior_pushed_to_agent",
      actor_user_id: state.session?.user?.id || null,
      actor_role: "admin",
      scope_role: "agent",
      title: "New buyer signal pushed by admin",
      body: `${title} - ${area} - ${Number(behavior.intent_score || 0)} intent score`,
      entity_table: "buyer_behavior_events",
      entity_id: eventId,
      metadata: { pushed_to_agent_id: agentId, behavior_event_type: behavior.event_type }
    });

    await state.client.from("audit_logs").insert({
      actor_user_id: state.session?.user?.id || null,
      actor_role: "admin",
      action: "buyer_behavior_pushed_to_agent",
      entity_type: "buyer_behavior_events",
      entity_id: eventId,
      notes: `${title} pushed to agent lead queue.`
    });

    await refreshAll(state.client);
  }

  function liveSummaryHtml(cards, rows, emptyCopy) {
    const title = state.role === "master" ? "Owner Live Treasury Stream" : "Live Supabase Operations";
    const intro = state.role === "master"
      ? "Revenue, escrow, buyer intent, agent trust, audit rows, and platform events stream here for the owner terminal."
      : "These numbers come from Supabase tables and update through Realtime. Buyer/user pages remain demo-led for now.";
    return `
      <h3>${title}</h3>
      <p>${intro}</p>
      <div class="rg-live-grid">
        ${cards.map((card) => `<article class="rg-live-card"><span>${safe(card.label)}</span><strong>${safe(card.value)}</strong></article>`).join("")}
      </div>
      ${rows.length ? `<div class="rg-live-list">${rows.map((row) => `<article class="rg-live-row"><strong>${safe(row.title)}</strong><span>${safe(row.body)}</span></article>`).join("")}</div>` : `<div class="rg-live-empty">${safe(emptyCopy)}</div>`}
    `;
  }

  function renderAgent() {
    const leads = table("leads");
    const properties = table("properties").filter((item) => !item.agent_id || item.agent_id === state.session?.user?.id);
    const commissions = table("commissions").filter((item) => !item.agent_id || item.agent_id === state.session?.user?.id);
    const reviews = table("agent_reviews").filter((item) => !item.agent_id || item.agent_id === state.session?.user?.id);
    const behavior = table("buyer_behavior_events").filter((item) => item.pushed_to_agent_id === state.session?.user?.id);
    const stats = reviewStats(reviews);
    const events = byCreated(table("platform_events").filter((item) => ["all", "agent"].includes(item.scope_role))).slice(0, 5);
    const hotLeads = leads.filter((lead) => Number(lead.score || 0) >= 80 || ["qualified", "viewing", "negotiating"].includes(lead.status));
    const pendingCommission = commissions
      .filter((item) => ["pending", "earned"].includes(item.status))
      .reduce((sum, item) => sum + Number(item.agent_amount || item.gross_amount || 0), 0);

    ensurePanel().innerHTML = liveSummaryHtml(
      [
        { label: "Live leads", value: String(leads.length) },
        { label: "Live listings", value: String(properties.length) },
        { label: "Commission pipeline", value: money(pendingCommission) },
        { label: "Pushed signals", value: String(behavior.length) }
      ],
      [...behaviorRows(behavior), ...reviewRows(reviews), ...events.map((event) => ({ title: event.title, body: `${event.event_type} - ${dateTime(event.created_at)}` }))].slice(0, 5),
      "No live agent reviews or events yet. Your full Agent dashboard stays intact while Supabase updates stream here."
    );
    return;

    setText("hotLeadCount", hotLeads.length);
    setText("clientCount", uniqueCount(leads, (lead) => lead.buyer_user_id || lead.phone || lead.email || lead.name));
    setText("pendingCommission", money(pendingCommission));
    setText("listingCount", properties.length);

    if ($("leadList")) {
      $("leadList").innerHTML = leads.length ? byCreated(leads).slice(0, 20).map((lead) => `
        <article class="lead-card">
          <div class="lead-head"><div><div class="lead-name">${safe(lead.name)}</div><div class="subtext">${safe(lead.preferred_area || "No area")} - ${safe(lead.phone || "No phone")}</div></div><span class="status-pill">${safe(lead.status)}</span></div>
          <p class="subtext">${safe(lead.notes || "Live Supabase lead")}</p>
          <div class="meta-row"><span class="meta-pill">${Number(lead.score || 0)} score</span><span class="meta-pill">${money(lead.budget_max || lead.budget_min || 0)}</span><span class="meta-pill">${dateTime(lead.updated_at || lead.created_at)}</span></div>
        </article>
      `).join("") : `<div class="subtext">No live Supabase leads yet.</div>`;
    }

    if ($("leadPipeline")) {
      const stages = ["new", "qualified", "viewing", "negotiating", "closed"];
      $("leadPipeline").innerHTML = stages.map((stage) => {
        const rows = leads.filter((lead) => lead.status === stage);
        return `<div class="pipeline-stage"><h4>${safe(stage)} (${rows.length})</h4>${rows.slice(0, 4).map((lead) => `<article class="lead-card"><div class="lead-name">${safe(lead.name)}</div><div class="subtext">${safe(lead.preferred_area || "")}</div></article>`).join("") || `<div class="subtext">No live leads.</div>`}</div>`;
      }).join("");
    }

    if ($("listingGrid")) {
      $("listingGrid").innerHTML = properties.length ? byCreated(properties).slice(0, 24).map((property) => `
        <article class="listing-card">
          <div class="listing-media"><img src="${safe(property.image_url || property.image_drive_link || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80")}" alt="${safe(property.title)}" loading="lazy"></div>
          <div class="listing-head"><div><div class="listing-title">${safe(property.title)}</div><div class="subtext">${safe(property.location || "Malaysia")}</div></div><span class="meta-pill">${safe(property.status || "live")}</span></div>
          <div class="listing-price">${money(property.price)}</div>
          <div class="meta-row"><span class="meta-pill">${safe(property.property_type || "Property")}</span><span class="meta-pill">${Number(property.beds || 0)} beds</span><span class="meta-pill">${Number(property.baths || 0)} baths</span></div>
        </article>
      `).join("") : `<div class="subtext">No live Supabase listings assigned yet.</div>`;
    }

    if ($("commissionSummary")) {
      const paid = commissions.filter((item) => item.status === "paid").reduce((sum, item) => sum + Number(item.agent_amount || item.gross_amount || 0), 0);
      $("commissionSummary").innerHTML = `
        <article class="revenue-card"><span>Live pending commission</span><strong>${money(pendingCommission)}</strong></article>
        <article class="revenue-card"><span>Live collected commission</span><strong>${money(paid)}</strong></article>
      `;
    }

    if ($("commissionTable")) {
      $("commissionTable").innerHTML = commissions.length ? byCreated(commissions).map((row) => `
        <article class="commission-row"><strong>${safe(row.source_type)}</strong><span>${money(row.agent_amount || row.gross_amount)} - ${safe(row.status)} - ${dateTime(row.created_at)}</span></article>
      `).join("") : `<div class="subtext">No live commission rows yet.</div>`;
    }

    if ($("commandBrief")) {
      $("commandBrief").innerHTML = `<strong>Live mode active</strong><p>Leads, listings, commissions, and buyer reviews are reading from Supabase. Current agent trust score: ${safe(stats.label)}.</p>`;
    }

    setText("notificationCount", events.length);
    if ($("notificationList")) {
      $("notificationList").innerHTML = events.length ? events.map((event) => `
        <article class="notification-card">
          <strong>${safe(event.title)}</strong>
          <p>${safe(event.body || event.event_type)} - ${dateTime(event.created_at)}</p>
        </article>
      `).join("") : `<article class="notification-card"><strong>No live notifications yet</strong><p>Supabase platform_events rows for agents will appear here.</p></article>`;
    }

    ensurePanel().innerHTML = liveSummaryHtml(
      [
        { label: "Live leads", value: String(leads.length) },
        { label: "Live listings", value: String(properties.length) },
        { label: "Commission pipeline", value: money(pendingCommission) },
        { label: "Pushed signals", value: String(behavior.length) }
      ],
      [...behaviorRows(behavior), ...reviewRows(reviews), ...events.map((event) => ({ title: event.title, body: `${event.event_type} - ${dateTime(event.created_at)}` }))].slice(0, 5),
      "No live agent reviews or events yet. Buyer reviews, leads, listings, and commission rows will appear here instantly."
    );
  }

  function renderAdmin() {
    const profiles = table("profiles");
    const agents = profiles.filter((profile) => profile.role === "agent");
    const listings = table("properties");
    const reports = table("admin_reports");
    const reviews = table("agent_reviews");
    const behavior = table("buyer_behavior_events");
    const newBehavior = behavior.filter((event) => event.status === "new");
    const audit = byCreated(table("audit_logs"));
    const openReports = reports.filter((report) => ["open", "investigating"].includes(report.status));

    ensurePanel().innerHTML = liveSummaryHtml(
      [
        { label: "Agent profiles", value: String(agents.length) },
        { label: "Listing records", value: String(listings.length) },
        { label: "New buyer signals", value: String(newBehavior.length) },
        { label: "Pushed to agents", value: String(behavior.filter((event) => event.status === "pushed_to_agent").length) }
      ],
      [
        ...byCreated(newBehavior).slice(0, 8).map((event) => ({
          title: behaviorTitle(event),
          body: behaviorBody(event) + " | Use the live signal buttons below to push."
        })),
        ...reviewRows(reviews),
        ...byCreated(table("platform_events")).slice(0, 5).map((event) => ({ title: event.title, body: `${event.event_type} - ${dateTime(event.created_at)}` }))
      ].slice(0, 5),
      "No live admin events yet. Your full Admin Gatekeeper dashboard stays intact while Supabase updates stream here."
    );

    const livePanel = $("rgLivePanel");
    if (livePanel && newBehavior.length) {
      livePanel.insertAdjacentHTML("beforeend", `<div class="rg-live-list">${byCreated(newBehavior).slice(0, 6).map((event) => behaviorCardHtml(event, true)).join("")}</div>`);
    }
    return;

    setText("pendingAgentCount", agents.filter((agent) => agent.status === "pending").length);
    setText("pendingListingCount", listings.filter((listing) => listing.status !== "approved").length);
    setText("openReportCount", openReports.length);
    setText("suspendedCount", agents.filter((agent) => agent.status === "suspended").length);

    if ($("agentQueue")) {
      $("agentQueue").innerHTML = agents.length ? agents.map((agent) => `
        <article class="queue-row">
          <div><strong>${safe(agent.full_name || "Unnamed agent")}</strong><p>${safe(agent.agency_name || "No agency")} - ${safe(agent.ren_number || "REN pending")} - ${safe(reviewStats(reviews.filter((review) => review.agent_id === agent.id)).label)}</p></div>
          <span class="status-pill ${safe(agent.status)}">${safe(agent.status || "active")}</span>
        </article>
      `).join("") : `<div class="queue-row"><strong>No live agent profiles yet</strong><p>Agent signups will appear here from Supabase.</p></div>`;
    }

    if ($("listingQueue")) {
      $("listingQueue").innerHTML = listings.length ? byCreated(listings).map((listing) => `
        <article class="listing-card">
          <span class="status-pill ${safe(listing.status)}">${safe(listing.status || "pending_qc")}</span>
          <h4>${safe(listing.title)}</h4>
          <p>${safe(listing.location || "No location")} - ${money(listing.price)}</p>
        </article>
      `).join("") : `<div class="subtext">No live listings in Supabase yet.</div>`;
    }

    if ($("listingPreview")) {
      const listing = byCreated(listings)[0];
      $("listingPreview").innerHTML = listing ? `
        <img class="listing-image" src="${safe(listing.image_url || listing.image_drive_link || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80")}" alt="${safe(listing.title)}">
        <h4>${safe(listing.title)}</h4>
        <p class="subtext">${safe(listing.location || "No location")} - Supabase listing record</p>
        <div class="listing-meta-grid"><div><span>Asking price</span><strong>${money(listing.price)}</strong></div><div><span>Status</span><strong>${safe(listing.status || "pending_qc")}</strong></div></div>
      ` : `<div class="subtext">No live listing selected.</div>`;
    }

    if ($("listingWarnings")) {
      $("listingWarnings").innerHTML = `<h4>Live QC source</h4><p>QC warnings now depend on Supabase listing rows. Add real listing records to populate risk checks.</p>`;
    }

    if ($("reportList")) {
      $("reportList").innerHTML = reports.length ? byCreated(reports).map((report) => `
        <article class="report-card">
          <div class="report-topline"><div><span class="status-pill ${safe(report.status)}">${safe(report.status)}</span><h4>${safe(report.type)}</h4><p>${safe(report.description)}</p></div><time class="subtext">${dateTime(report.created_at)}</time></div>
          <p>Severity: ${safe(report.severity)}</p>
        </article>
      `).join("") : `<div class="report-card"><strong>No live reports</strong><p>User report records from Supabase will appear here.</p></div>`;
    }

    if ($("auditList")) {
      $("auditList").innerHTML = audit.length ? audit.slice(0, 30).map((log) => `
        <article class="audit-item"><div class="audit-topline"><strong>${safe(log.action)}</strong><time>${dateTime(log.created_at)}</time></div><p>${safe(log.notes || log.entity_type || "Live audit event")}</p></article>
      `).join("") : `<div class="audit-item"><strong>No live audit logs</strong><p>Admin actions written to Supabase will appear here.</p></div>`;
    }

    if ($("notificationList")) {
      $("notificationList").innerHTML = [
        ...byCreated(newBehavior).slice(0, 8).map((event) => `
          <article class="notification-item">
            <strong>${safe(behaviorTitle(event))}</strong>
            <p>${safe(behaviorBody(event))}</p>
            <button class="ghost-button" data-action="push-behavior-agent" data-id="${safe(event.id)}" type="button">Push to agent</button>
          </article>
        `),
        ...byCreated(table("platform_events")).slice(0, 12).map((event) => `
        <article class="notification-item"><strong>${safe(event.title)}</strong><p>${safe(event.body || event.event_type)} - ${dateTime(event.created_at)}</p></article>
        `)
      ].join("") || `<div class="notification-item"><strong>No live notifications</strong><p>Platform events will appear here in real time.</p></div>`;
    }

    ensurePanel().innerHTML = liveSummaryHtml(
      [
        { label: "Agent profiles", value: String(agents.length) },
        { label: "Listing records", value: String(listings.length) },
        { label: "New buyer signals", value: String(newBehavior.length) },
        { label: "Pushed to agents", value: String(behavior.filter((event) => event.status === "pushed_to_agent").length) }
      ],
      [
        ...byCreated(newBehavior).slice(0, 8).map((event) => ({
          title: behaviorTitle(event),
          body: behaviorBody(event) + " | Use Notifications tab to push."
        })),
        ...reviewRows(reviews),
        ...byCreated(table("platform_events")).slice(0, 5).map((event) => ({ title: event.title, body: `${event.event_type} - ${dateTime(event.created_at)}` }))
      ].slice(0, 5),
      "No live admin events yet. Agent verification, listing QC, reports, and audit rows will update from Supabase."
    );

    const panel = $("rgLivePanel");
    if (panel && newBehavior.length) {
      panel.insertAdjacentHTML("beforeend", `<div class="rg-live-list">${byCreated(newBehavior).slice(0, 6).map((event) => behaviorCardHtml(event, true)).join("")}</div>`);
    }
  }

  function ensureMasterRevenueDock(values) {
    if (state.role !== "master") return;
    let dock = $("rgOwnerRevenueDock");
    if (!dock) {
      dock = document.createElement("aside");
      dock.id = "rgOwnerRevenueDock";
      dock.className = "rg-owner-revenue-dock";
      document.body.appendChild(dock);
    }

    dock.innerHTML = `
      <span>OWNER LIVE</span>
      <strong>${safe(money(values.operatingRevenue))}</strong>
      <small>Revenue: SaaS + bank + platform fees</small>
      <div><b>${safe(money(values.heldEscrow))}</b><em>held escrow</em></div>
      <div><b>${safe(values.reviewLabel)}</b><em>agent trust</em></div>
    `;
  }

  function ensureMasterTaskDock(tasks) {
    if (state.role !== "master") return;
    const panel = ensurePanel();
    let dock = $("rgLiveMasterTaskDock");
    if (!dock) {
      dock = document.createElement("div");
      dock.id = "rgLiveMasterTaskDock";
      dock.className = "rg-master-task-dock";
      panel.insertAdjacentElement("afterend", dock);
    }

    dock.innerHTML = `
      <h4>Admin tasks pushed to Master</h4>
      ${tasks.length ? tasks.slice(0, 5).map((task) => `
        <article>
          <strong>${safe(task.title || "Admin task")}</strong>
          <span>${safe(task.body || task.event_type)} - ${dateTime(task.created_at)}</span>
          <span>Priority: ${safe(task.metadata?.priority || "normal")} - Agent: ${safe(task.metadata?.target_agent_email || "not linked")}</span>
        </article>
      `).join("") : `<article><strong>No pushed admin tasks</strong><span>Admin can push a pending agent task from the Gatekeeper account ledger.</span></article>`}
    `;
  }

  function renderMaster() {
    const events = byCreated(table("platform_events"));
    const audit = byCreated(table("audit_logs"));
    const escrow = table("escrow_transactions");
    const commissions = table("commissions");
    const reviews = table("agent_reviews");
    const behavior = table("buyer_behavior_events");
    const stats = reviewStats(reviews);
    const heldEscrow = escrow.filter((item) => item.status === "held").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const releasedEscrow = escrow.filter((item) => item.status === "released").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const saasRevenue = commissions.filter((item) => item.source_type === "saas_subscription" && ["earned", "paid"].includes(item.status)).reduce((sum, item) => sum + Number(item.platform_amount || item.gross_amount || 0), 0);
    const bankReferral = commissions.filter((item) => item.source_type === "bank_referral" && ["pending", "earned"].includes(item.status)).reduce((sum, item) => sum + Number(item.platform_amount || item.gross_amount || 0), 0);
    const platformFees = commissions.filter((item) => item.source_type === "escrow_fee" && ["earned", "paid", "pending"].includes(item.status)).reduce((sum, item) => sum + Number(item.platform_amount || item.gross_amount || 0), 0);
    const operatingRevenue = saasRevenue + bankReferral + platformFees;
    const masterTasks = events.filter((event) => event.event_type === "admin_task_pushed_to_master");

    setText("tapeEscrow", money(heldEscrow));
    setText("tapeSaas", money(saasRevenue));
    setText("tapeBank", money(bankReferral));
    setText("tapeLogs", audit.length + events.length + behavior.length);
    setText("liveEscrowMetric", money(heldEscrow));
    setText("saasMetric", money(saasRevenue));
    setText("bankReferralMetric", money(bankReferral));
    setText("logMetric", audit.length + events.length + behavior.length);
    setText("escrowHeldValue", money(heldEscrow));
    setText("escrowReleasedValue", money(releasedEscrow));
    setText("subscriptionValue", money(saasRevenue));
    setText("subscriptionDetail", `${commissions.filter((item) => item.source_type === "saas_subscription").length} live subscription rows.`);
    setText("bankPipelineValue", money(bankReferral));
    ensureMasterRevenueDock({ operatingRevenue, heldEscrow, reviewLabel: stats.label });
    ensureMasterTaskDock(masterTasks);

    if ($("logList")) {
      const masterLogs = [
        ...behavior.map((event) => ({
          kind: "Buyer behavior",
          title: behaviorTitle(event),
          body: behaviorBody(event),
          created_at: event.created_at
        })),
        ...events.map((event) => ({
          kind: event.event_type,
          title: event.title,
          body: event.body || event.event_type,
          created_at: event.created_at
        }))
      ];
      $("logList").innerHTML = byCreated(masterLogs).length ? byCreated(masterLogs).slice(0, 40).map((event) => `
        <article class="log-card"><div><strong>${safe(event.title)}</strong><p>${safe(event.kind)} - ${safe(event.body)}</p></div><time>${dateTime(event.created_at)}</time></article>
      `).join("") : `<article class="log-card"><strong>No live platform events yet</strong><p>Buyer behavior and platform_events rows will stream here.</p></article>`;
    }

    if ($("logDetail")) {
      const latestBehavior = byCreated(behavior)[0];
      const latest = latestBehavior || events[0];
      $("logDetail").innerHTML = latestBehavior
        ? `<h4>${safe(behaviorTitle(latestBehavior))}</h4><p>${safe(behaviorBody(latestBehavior))}</p><p class="subtext">Metadata: ${safe(JSON.stringify(latestBehavior.metadata || {}))}</p><p class="subtext">${dateTime(latestBehavior.created_at)}</p>`
        : latest ? `<h4>${safe(latest.title)}</h4><p>${safe(latest.body || latest.event_type)}</p><p class="subtext">${dateTime(latest.created_at)}</p>` : `<h4>Live Panopticon</h4><p>No live event selected yet.</p>`;
    }

    if ($("financeLedger")) {
      const ledger = [
        ...escrow.map((item) => ({ type: `Escrow ${item.status}`, value: money(item.amount), detail: item.reference || item.source, created_at: item.created_at })),
        ...commissions.map((item) => ({ type: item.source_type, value: money(item.platform_amount || item.agent_amount || item.gross_amount), detail: item.status, created_at: item.created_at }))
      ];
      $("financeLedger").innerHTML = byCreated(ledger).slice(0, 30).map((row) => `
        <article class="finance-row"><div><strong>${safe(row.type)}</strong><p>${safe(row.detail || "")}</p></div><span>${safe(row.value)}</span></article>
      `).join("") || `<article class="finance-row"><strong>No live finance rows</strong><p>Escrow and commission records will appear here.</p></article>`;
    }

    if ($("ownerAudit")) {
      $("ownerAudit").innerHTML = audit.length ? audit.slice(0, 30).map((entry) => `
        <article class="audit-card"><strong>${safe(entry.action)}</strong><p>${safe(entry.notes || entry.entity_type || "Live owner audit")}</p><time>${dateTime(entry.created_at)}</time></article>
      `).join("") : `<article class="audit-card"><strong>No live owner actions yet</strong><p>Algorithm changes, bans, freezes, and broadcasts written to Supabase will appear here.</p></article>`;
    }

    ensurePanel().innerHTML = liveSummaryHtml(
      [
        { label: "Held escrow", value: money(heldEscrow) },
        { label: "Operating revenue", value: money(operatingRevenue) },
        { label: "Buyer signals", value: String(behavior.length) },
        { label: "Agent trust", value: stats.label }
      ],
      [...behaviorRows(behavior), ...reviewRows(reviews), ...events.slice(0, 5).map((event) => ({ title: event.title, body: `${event.event_type} - ${dateTime(event.created_at)}` }))].slice(0, 5),
      "No live master events yet. Buyer behavior, escrow, commission, audit, and platform event rows will update here."
    );
  }

  function render() {
    if (state.role === "admin") renderAdmin();
    else if (state.role === "master") renderMaster();
    else renderAgent();
  }

  async function fetchTable(client, tableName) {
    const { data, error } = await client.from(tableName).select("*").limit(200);
    if (error) {
      state.errors[tableName] = error.message;
      state.tables[tableName] = [];
      return;
    }
    delete state.errors[tableName];
    trackNewRows(tableName, data || []);
    state.tables[tableName] = data || [];
  }

  async function refreshAll(client) {
    await Promise.all(CONFIG.tables.map((tableName) => fetchTable(client, tableName)));
    const errorCount = Object.keys(state.errors).length;
    setStatus(errorCount ? `Live with ${errorCount} table warning${errorCount === 1 ? "" : "s"}` : "Live Supabase", true);
    render();
    state.pushPrimed = true;
  }

  function subscribe(client) {
    CONFIG.tables.forEach((tableName) => {
      if (state.errors[tableName]) return;
      client
        .channel(`rg-${state.role}-${tableName}`)
        .on("postgres_changes", { event: "*", schema: "public", table: tableName }, async () => {
          await fetchTable(client, tableName);
          render();
        })
        .subscribe();
    });
  }

  async function start() {
    ensureStatusPill();
    if (!window.supabase) {
      setStatus("Supabase client missing");
      return;
    }

    const runtime = window.REALTYGENIUS_CONFIG || {};
    const supabaseUrl = runtime.SUPABASE_URL || CONFIG.supabaseUrl;
    const publishableKey = runtime.SUPABASE_PUBLISHABLE_KEY || runtime.SUPABASE_ANON_KEY || CONFIG.publishableKey;
    if (!supabaseUrl || !publishableKey) {
      setStatus("Supabase client not configured");
      return;
    }
    const client = window.supabase.createClient(
      supabaseUrl,
      publishableKey
    );
    state.client = client;
    window.RealtyGeniusLiveData = { client, state, refresh: () => refreshAll(client) };

    const { data: { session } } = await client.auth.getSession();
    state.session = session;
    if (!session?.user) {
      setStatus("Real login required for live data");
      render();
      ensurePanel().innerHTML = `
        <h3>Live Supabase Operations</h3>
        <p>Agent, Admin, and Master dashboards now require a real Supabase session for operational updates. Demo/local sessions stay available only for buyer exploration.</p>
        <div class="rg-live-empty">Log in with a real Supabase account for this role to stream live data.</div>
      `;
      return;
    }

    const { data: profile } = await client.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    state.profile = profile || null;
    await refreshAll(client);
    subscribe(client);

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-action='push-behavior-agent']") : null;
      if (!target) return;
      pushBehaviorToAgent(target.dataset.id);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
