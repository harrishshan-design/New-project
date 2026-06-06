(function () {
  const script = document.currentScript;
  const surfaceRole = script?.dataset.accountRole || "admin";
  const apiUrl = "/api/admin/accounts";
  const masterTaskApiUrl = "/api/admin/master-task";
  const pendingNotifyKey = "rg_admin_notified_pending_agent_ids";
  const agentLoginNotifyKey = `rg_${surfaceRole}_notified_agent_login_event_ids`;
  const masterTaskCacheKey = "rg_master_admin_tasks";
  const masterTaskPushKey = "rg_admin_master_task_pushes";
  const state = {
    accounts: [],
    stats: {},
    query: "",
    loading: false,
    agentLoginPrimed: false
  };

  function readSession() {
    if (window.RealtyGeniusSession) return window.RealtyGeniusSession;
    try {
      return JSON.parse(localStorage.getItem("rg_session") || "null");
    } catch {
      return null;
    }
  }

  function safe(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[character]));
  }

  function dateTime(value) {
    if (!value) return "No record";
    try {
      return new Date(value).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return "Invalid date";
    }
  }

  function readStore(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function injectStyles() {
    if (document.getElementById("rgAccountAdminStyles")) return;
    const style = document.createElement("style");
    style.id = "rgAccountAdminStyles";
    style.textContent = `
      .rg-account-ledger{padding:20px;border:1px solid rgba(255,255,255,.1);border-radius:24px;background:rgba(17,26,46,.84);box-shadow:0 26px 70px rgba(0,0,0,.28);backdrop-filter:blur(18px)}
      .rg-account-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px}
      .rg-account-head h3{margin:5px 0 0;font-family:"Space Grotesk",Inter,sans-serif;font-size:1.45rem}
      .rg-account-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
      .rg-account-search{display:flex;align-items:center;gap:10px;min-width:min(340px,100%);padding:12px 14px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.04)}
      .rg-account-search i{color:#f8c471}.rg-account-search input{width:100%;border:0;outline:0;background:transparent;color:inherit}
      .rg-account-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}
      .rg-account-stat{padding:13px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(255,255,255,.04)}
      .rg-account-stat span{display:block;color:#94a8c4;font-size:.74rem;text-transform:uppercase;font-weight:900;letter-spacing:.08em}.rg-account-stat strong{display:block;margin-top:5px;font-size:1.35rem}
      .rg-account-table{display:grid;gap:10px}
      .rg-account-row{display:grid;grid-template-columns:1.3fr .7fr .7fr .85fr auto;gap:12px;align-items:center;padding:14px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(255,255,255,.04)}
      .rg-email-button{display:grid;gap:4px;text-align:left;border:0;background:transparent;color:inherit;padding:0;cursor:pointer}
      .rg-email-button strong{font-size:.98rem}.rg-email-button span,.rg-account-row small{color:#94a8c4}
      .rg-role-chip,.rg-status-chip{display:inline-flex;width:max-content;align-items:center;padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.1);font-size:.74rem;font-weight:900;text-transform:capitalize}
      .rg-role-chip.agent{color:#ffe2b8;background:rgba(245,158,11,.12)}.rg-role-chip.user{color:#cde3ff;background:rgba(96,165,250,.12)}
      .rg-status-chip.pending{color:#ffe2b8;background:rgba(245,158,11,.14)}.rg-status-chip.approved,.rg-status-chip.active{color:#c5f7d7;background:rgba(34,197,94,.14)}.rg-status-chip.rejected,.rg-status-chip.suspended{color:#ffd8de;background:rgba(244,63,94,.14)}
      .rg-account-empty{padding:16px;border:1px dashed rgba(255,255,255,.16);border-radius:16px;color:#94a8c4}
      .rg-account-drawer{position:fixed;inset:0 0 0 auto;width:min(560px,100%);z-index:95;transform:translateX(104%);transition:transform .24s ease;padding:22px;overflow:auto;border-left:1px solid rgba(255,255,255,.12);background:rgba(10,16,30,.98);box-shadow:0 30px 90px rgba(0,0,0,.45)}
      .rg-account-drawer.is-open{transform:translateX(0)}
      .rg-account-drawer-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:16px}
      .rg-account-drawer-head h3{margin:5px 0 0;font-family:"Space Grotesk",Inter,sans-serif}.rg-account-close{width:42px;height:42px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff}
      .rg-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:12px}
      .rg-detail-card,.rg-activity-card{padding:14px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(255,255,255,.04)}
      .rg-detail-card span,.rg-activity-card span{display:block;color:#94a8c4;font-size:.75rem;text-transform:uppercase;font-weight:900;letter-spacing:.08em}.rg-detail-card strong,.rg-activity-card strong{display:block;margin-top:5px;word-break:break-word}
      .rg-activity-list{display:grid;gap:10px;margin-top:12px}.rg-activity-card p{margin:6px 0 0;color:#94a8c4;line-height:1.45}
      .rg-account-master{border-color:rgba(214,179,89,.28);background:linear-gradient(180deg,rgba(10,12,9,.96),rgba(5,6,4,.92));color:#fff8df}
      .rg-account-master .rg-account-stat,.rg-account-master .rg-account-row,.rg-account-master .rg-account-search{border-color:rgba(214,179,89,.2)}
      .rg-pending-agent-alert{display:flex;justify-content:space-between;gap:14px;align-items:center;margin:0 0 14px;padding:14px;border:1px solid rgba(245,158,11,.26);border-radius:16px;background:linear-gradient(135deg,rgba(245,158,11,.16),rgba(255,255,255,.04))}
      .rg-pending-agent-alert strong{display:block}.rg-pending-agent-alert span{display:block;margin-top:4px;color:#ffe2b8;font-size:.88rem;line-height:1.45}.rg-pending-agent-alert .row-actions{flex:0 0 auto}
      .rg-master-pushed{opacity:.74}.rg-master-pushed::after{content:"Pushed";display:inline-flex;margin-left:6px;padding:4px 7px;border-radius:999px;background:rgba(214,179,89,.14);color:#f7d37a;font-size:.62rem;font-weight:900;text-transform:uppercase}
      @media(max-width:920px){.rg-account-stats{grid-template-columns:1fr 1fr}.rg-account-row{grid-template-columns:1fr}.rg-account-actions{width:100%}.rg-account-search{min-width:100%}}
      @media(max-width:560px){.rg-account-stats,.rg-detail-grid{grid-template-columns:1fr}.rg-pending-agent-alert{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  function createPanel() {
    injectStyles();
    let panel = document.getElementById("rgAccountLedger");
    if (panel) return panel;

    const copy = surfaceRole === "master"
      ? {
          eyebrow: "Owner Identity Panopticon",
          title: "Platform account intelligence",
          placeholder: "Search email, identity, REN, phone",
          refresh: "Refresh intelligence"
        }
      : {
          eyebrow: "Account Access Ledger",
          title: "User and agent login records",
          placeholder: "Search email, username, REN, phone",
          refresh: "Refresh"
        };

    panel = document.createElement("section");
    panel.id = "rgAccountLedger";
    panel.className = `rg-account-ledger ${surfaceRole === "master" ? "rg-account-master" : ""}`;
    panel.innerHTML = `
      <div class="rg-account-head">
        <div>
          <div class="eyebrow">${copy.eyebrow}</div>
          <h3>${copy.title}</h3>
        </div>
        <div class="rg-account-actions">
          <label class="rg-account-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input id="rgAccountSearch" type="search" placeholder="${copy.placeholder}">
          </label>
          <button class="ghost-button" id="rgAccountRefresh" type="button">
            <i class="fa-solid fa-rotate"></i>
            ${copy.refresh}
          </button>
        </div>
      </div>
      <div class="rg-pending-agent-alert" id="rgPendingAgentAlert" hidden></div>
      <div class="rg-account-stats" id="rgAccountStats"></div>
      <div class="rg-account-table" id="rgAccountTable"></div>
    `;

    const anchor = surfaceRole === "master"
      ? document.querySelector("[data-panel='audit']") || document.querySelector(".section-panel:last-of-type")
      : document.querySelector(".hero") || document.querySelector(".market-tape") || document.querySelector(".main");
    if (anchor?.parentElement) anchor.insertAdjacentElement("afterend", panel);
    else document.body.appendChild(panel);
    return panel;
  }

  function drawer() {
    let el = document.getElementById("rgAccountDrawer");
    if (el) return el;
    el = document.createElement("aside");
    el.id = "rgAccountDrawer";
    el.className = "rg-account-drawer";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    return el;
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function stat(label, value) {
    return `<article class="rg-account-stat"><span>${safe(label)}</span><strong>${safe(value)}</strong></article>`;
  }

  function pendingAgents() {
    return state.accounts.filter((account) => account.role === "agent" && account.status === "pending");
  }

  function pushedTaskMap() {
    return readStore(masterTaskPushKey, {});
  }

  function rememberMasterTask(account, task) {
    const existing = readStore(masterTaskCacheKey, []);
    const updated = [
      {
        id: task.taskId || `local-master-task-${Date.now()}`,
        type: task.taskType || "agent_review",
        title: task.title || `Review ${account.username}`,
        message: task.message || `${account.username} needs owner review.`,
        accountId: account.id,
        agentName: account.username,
        agentEmail: account.email,
        priority: task.priority || "high",
        status: "open",
        createdAt: task.createdAt || new Date().toISOString()
      },
      ...existing.filter((item) => item.accountId !== account.id).slice(0, 40)
    ];
    writeStore(masterTaskCacheKey, updated);

    const pushes = pushedTaskMap();
    pushes[account.id] = new Date().toISOString();
    writeStore(masterTaskPushKey, pushes);
  }

  function addAdminNotification(title, message, key) {
    if (surfaceRole !== "admin") return;
    const existing = readStore("rg_admin_notifications", []);
    if (key && existing.some((item) => item.key === key)) return;
    writeStore("rg_admin_notifications", [
      {
        id: `rg-account-${Date.now()}`,
        key,
        title,
        message,
        createdAt: new Date().toISOString()
      },
      ...existing
    ].slice(0, 50));

    window.RealtyGeniusPush?.notify(title, message, {
      tag: key || `rg-admin-${Date.now()}`,
      url: `${location.origin}/backend/admin.html#agents`
    });
  }

  function readSeenAgentLogins() {
    return new Set(readStore(agentLoginNotifyKey, []));
  }

  function writeSeenAgentLogins(seen) {
    writeStore(agentLoginNotifyKey, [...seen].slice(-250));
  }

  function isAgentLoginDeviceEvent(event) {
    return event?.metadata?.device_notification === "new_agent_login"
      || ((event?.type === "account_login" || event?.type === "account_login_blocked") && /^New agent:/i.test(event?.title || ""));
  }

  function agentLoginUrl() {
    return surfaceRole === "master"
      ? `${location.origin}/backend/master.html#panopticon`
      : `${location.origin}/backend/admin.html#agents`;
  }

  function notifyNewAgentLogins() {
    const seen = readSeenAgentLogins();
    const events = state.accounts
      .filter((account) => account.role === "agent")
      .flatMap((account) => (account.recentActivity || [])
        .filter(isAgentLoginDeviceEvent)
        .map((event) => ({ account, event })))
      .filter(({ event }) => event.id)
      .sort((a, b) => String(a.event.createdAt || "").localeCompare(String(b.event.createdAt || "")));

    if (!state.agentLoginPrimed) {
      events.forEach(({ event }) => seen.add(event.id));
      writeSeenAgentLogins(seen);
      state.agentLoginPrimed = true;
      return;
    }

    events.forEach(({ account, event }) => {
      if (seen.has(event.id)) return;
      seen.add(event.id);
      const title = event.title || `New agent: ${account.username}`;
      const message = event.body || `${account.username} logged in to RealityGenius.`;
      if (surfaceRole === "admin") addAdminNotification(title, message, `agent-login-${event.id}`);
      window.RealtyGeniusPush?.notify(title, message, {
        tag: `rg-${surfaceRole}-agent-login-${event.id}`,
        renotify: true,
        url: agentLoginUrl()
      });
    });

    writeSeenAgentLogins(seen);
  }

  function notifyNewPendingAgents() {
    if (surfaceRole !== "admin") return;
    const notified = readStore(pendingNotifyKey, []);
    const notifiedSet = new Set(notified);
    const fresh = pendingAgents().filter((agent) => !notifiedSet.has(agent.id));
    if (!fresh.length) return;

    fresh.forEach((agent) => {
      addAdminNotification(
        "New agent waiting for approval",
        `${agent.username} (${agent.email}) connected to the admin approval queue. REN: ${agent.renNumber || "pending"}.`,
        `pending-agent-${agent.id}`
      );
      notifiedSet.add(agent.id);
    });
    writeStore(pendingNotifyKey, [...notifiedSet]);
  }

  function renderPendingAgentAlert() {
    if (surfaceRole !== "admin") return;
    const alert = document.getElementById("rgPendingAgentAlert");
    if (!alert) return;
    const pending = pendingAgents();
    alert.hidden = !pending.length;
    if (!pending.length) {
      alert.innerHTML = "";
      return;
    }
    const newest = pending[0];
    alert.innerHTML = `
      <div>
        <strong>${pending.length} new agent${pending.length === 1 ? "" : "s"} waiting for approval</strong>
        <span>Latest: ${safe(newest.username)} - ${safe(newest.email)} - REN ${safe(newest.renNumber || "pending")}</span>
      </div>
      <div class="row-actions">
        <button class="primary-button" data-rg-open-agent-queue type="button">Open agent queue</button>
        <button class="ghost-button" data-account-push-master="${safe(newest.id)}" type="button">Push latest to Master</button>
      </div>
    `;
  }

  function filteredAccounts() {
    const query = state.query.trim().toLowerCase();
    if (!query) return state.accounts;
    return state.accounts.filter((account) => [
      account.email,
      account.username,
      account.fullName,
      account.phone,
      account.renNumber,
      account.role,
      account.status
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }

  function render() {
    createPanel();
    const stats = document.getElementById("rgAccountStats");
    const table = document.getElementById("rgAccountTable");
    if (!stats || !table) return;

    stats.innerHTML = (surfaceRole === "master" ? [
      stat("Accounts watched", state.stats.total || 0),
      stat("Buyer identities", state.stats.users || 0),
      stat("Agent identities", state.stats.agents || 0),
      stat("Admin queue", state.stats.pendingAgents || 0)
    ] : [
      stat("Total accounts", state.stats.total || 0),
      stat("Buyer users", state.stats.users || 0),
      stat("Agents", state.stats.agents || 0),
      stat("Pending agents", state.stats.pendingAgents || 0)
    ]).join("");

    const accounts = filteredAccounts();
    const pushes = pushedTaskMap();
    table.innerHTML = accounts.length ? accounts.map((account) => `
      <article class="rg-account-row" data-account-row="${safe(account.id)}">
        <button class="rg-email-button" data-account-open="${safe(account.id)}" type="button">
          <strong>${safe(account.username)}</strong>
          <span>${safe(account.email)}</span>
        </button>
        <span class="rg-role-chip ${safe(account.role)}">${safe(account.role === "user" ? "buyer" : account.role)}</span>
        <span class="rg-status-chip ${safe(account.status)}">${safe(account.status)}</span>
        <small>${safe(dateTime(account.latestRecordedLoginAt || account.lastSignInAt))}</small>
        <div class="row-actions">
          ${surfaceRole === "admin" && account.role === "agent" && account.status === "pending" ? `<button class="primary-button" data-account-approve="${safe(account.id)}" type="button">Approve</button>` : ""}
          ${surfaceRole === "admin" && account.role === "agent" ? `<button class="ghost-button ${pushes[account.id] ? "rg-master-pushed" : ""}" data-account-push-master="${safe(account.id)}" type="button">Push to Master</button>` : ""}
          <button class="ghost-button" data-account-open="${safe(account.id)}" type="button">Details</button>
        </div>
      </article>
    `).join("") : `<div class="rg-account-empty">${state.loading ? "Loading account records..." : "No user or agent accounts found."}</div>`;
    renderPendingAgentAlert();
    renderAgentQueueMirror();
  }

  function renderAgentQueueMirror() {
    if (surfaceRole !== "admin") return;
    const queue = document.getElementById("agentQueue");
    if (!queue) return;

    const agents = state.accounts
      .filter((account) => account.role === "agent")
      .sort((a, b) => (a.status === "pending" ? -1 : 1) - (b.status === "pending" ? -1 : 1));
    const pushes = pushedTaskMap();

    queue.innerHTML = agents.length ? agents.map((agent) => `
      <article class="table-card">
        <div class="person-cell">
          <div class="avatar"><i class="fa-solid fa-user-tie"></i></div>
          <div>
            <button class="rg-email-button" data-account-open="${safe(agent.id)}" type="button">
              <strong>${safe(agent.username)}</strong>
              <span>${safe(agent.email)}</span>
            </button>
          </div>
        </div>
        <div>
          <strong>${safe(agent.agencyName || "Agency not set")}</strong>
          <p>${safe(agent.renNumber || "REN pending")}</p>
        </div>
        <span class="status-pill ${safe(agent.status)}">${safe(agent.status)}</span>
        <div class="row-actions">
          ${agent.status === "pending" ? `<button class="primary-button" data-account-approve="${safe(agent.id)}" type="button">Approve</button>` : ""}
          <button class="ghost-button ${pushes[agent.id] ? "rg-master-pushed" : ""}" data-account-push-master="${safe(agent.id)}" type="button">Push to Master</button>
          <button class="ghost-button" data-account-open="${safe(agent.id)}" type="button">Details</button>
        </div>
      </article>
    `).join("") : `<div class="table-card"><strong>No agent accounts yet</strong><p>New agent signups will appear here for one-time approval.</p></div>`;

    const risk = document.getElementById("agentRiskList");
    if (risk) {
      const pendingAgents = agents.filter((agent) => agent.status === "pending");
      risk.innerHTML = pendingAgents.length ? pendingAgents.slice(0, 4).map((agent) => `
        <article class="risk-item">
          <strong>${safe(agent.username)}</strong>
          <p>${safe(agent.email)} needs one-time approval before dashboard access.</p>
        </article>
      `).join("") : `<div class="risk-item"><strong>No pending agent approvals</strong><p>All current agent accounts are already approved, suspended, or inactive.</p></div>`;
    }
  }

  function detailCard(label, value) {
    return `<article class="rg-detail-card"><span>${safe(label)}</span><strong>${safe(value || "No record")}</strong></article>`;
  }

  function openDetails(id) {
    const account = state.accounts.find((item) => item.id === id);
    if (!account) return;
    const el = drawer();
    el.innerHTML = `
      <div class="rg-account-drawer-head">
        <div>
          <div class="eyebrow">Account Details</div>
          <h3>${safe(account.username)}</h3>
        </div>
        <button class="rg-account-close" id="rgAccountClose" type="button" aria-label="Close account details">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="rg-detail-grid">
        ${detailCard("Email", account.email)}
        ${detailCard("Role", account.role === "user" ? "Buyer" : account.role)}
        ${detailCard("Status", account.status)}
        ${detailCard("Phone", account.phone)}
        ${detailCard("REN ID", account.renNumber)}
        ${detailCard("Date of birth", account.dateOfBirth)}
        ${detailCard("Created", dateTime(account.createdAt))}
        ${detailCard("Last Supabase sign-in", dateTime(account.lastSignInAt))}
        ${detailCard("Last recorded login", dateTime(account.latestRecordedLoginAt))}
        ${detailCard("Login count", account.loginCount)}
        ${detailCard("Blocked login count", account.blockedLoginCount)}
        ${detailCard("Last IP", account.latestLoginIp)}
      </div>
      <div class="drawer-actions">
        ${surfaceRole === "admin" && account.role === "agent" && account.status === "pending" ? `<button class="primary-button" data-account-approve="${safe(account.id)}" type="button">Approve Agent Once</button>` : ""}
        ${surfaceRole === "admin" && account.role === "agent" ? `<button class="ghost-button" data-account-push-master="${safe(account.id)}" type="button">Push Task to Master</button>` : ""}
        ${surfaceRole === "admin" && account.role === "agent" && account.status !== "suspended" ? `<button class="danger-button" data-account-suspend="${safe(account.id)}" type="button">Suspend Agent</button>` : ""}
      </div>
      <div class="rg-activity-list">
        ${(account.recentActivity || []).length ? account.recentActivity.map((event) => `
          <article class="rg-activity-card">
            <span>${safe(event.type)}</span>
            <strong>${safe(event.title)}</strong>
            <p>${safe(event.body)}</p>
            <p>${safe(dateTime(event.createdAt))}</p>
          </article>
        `).join("") : `<article class="rg-activity-card"><strong>No recorded login events yet</strong><p>Future user and agent logins will appear here.</p></article>`}
      </div>
    `;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
  }

  function closeDetails() {
    const el = drawer();
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
  }

  async function fetchAccounts() {
    const session = readSession();
    if (!session?.token) return;
    state.loading = true;
    render();

    try {
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Account ledger failed");
      state.accounts = data.accounts || [];
      state.stats = data.stats || {};
      notifyNewAgentLogins();
      notifyNewPendingAgents();
      if (document.getElementById("pendingAgentCount")) {
        document.getElementById("pendingAgentCount").textContent = String(state.stats.pendingAgents || 0);
      }
    } catch (error) {
      if (window.RGLogError) window.RGLogError(error, { feature: "account_admin_fetch" });
      const table = document.getElementById("rgAccountTable");
      if (table) table.innerHTML = `<div class="rg-account-empty">${safe(error.message || "Account ledger unavailable")}</div>`;
    } finally {
      state.loading = false;
      render();
    }
  }

  async function setAgentStatus(userId, status) {
    const session = readSession();
    if (!session?.token) return;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ userId, status })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Agent approval failed");
      showToast(status === "approved" ? "Agent approved once" : `Agent ${status}`);
      closeDetails();
      await fetchAccounts();
    } catch (error) {
      showToast(error.message || "Agent update failed");
      if (window.RGLogError) window.RGLogError(error, { feature: "account_admin_status", status });
    }
  }

  async function pushAgentToMaster(userId) {
    const session = readSession();
    const account = state.accounts.find((item) => item.id === userId);
    if (!account) return;
    if (!session?.token) {
      showToast("Admin session required");
      return;
    }

    const title = `Master review: ${account.username}`;
    const message = `${account.username} (${account.email}) is ${account.status}. REN: ${account.renNumber || "pending"}. Phone: ${account.phone || "not set"}.`;

    try {
      const response = await fetch(masterTaskApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          accountId: userId,
          taskType: "agent_review",
          priority: account.status === "pending" ? "high" : "normal",
          title,
          message
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Master task push failed");
      rememberMasterTask(account, data.task || { title, message, taskType: "agent_review" });
      addAdminNotification("Task pushed to Master", `${account.username} is now in the owner review queue.`, `master-task-${account.id}`);
      render();
      showToast("Task pushed to Master");
    } catch (error) {
      showToast(error.message || "Master task push failed");
      if (window.RGLogError) window.RGLogError(error, { feature: "admin_push_to_master", accountId: userId });
    }
  }

  function bindEvents() {
    document.addEventListener("input", (event) => {
      if (event.target?.id !== "rgAccountSearch") return;
      state.query = event.target.value || "";
      render();
    });

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const openButton = target.closest("[data-account-open]");
      const approveButton = target.closest("[data-account-approve]");
      const suspendButton = target.closest("[data-account-suspend]");
      const pushMasterButton = target.closest("[data-account-push-master]");

      if (target.closest("#rgAccountRefresh")) fetchAccounts();
      if (target.closest("#rgAccountClose")) closeDetails();
      if (target.closest("[data-rg-open-agent-queue]")) {
        document.querySelector("[data-section='agents']")?.click();
        location.hash = "agents";
      }
      if (openButton) openDetails(openButton.dataset.accountOpen);
      if (approveButton) setAgentStatus(approveButton.dataset.accountApprove, "approved");
      if (suspendButton) setAgentStatus(suspendButton.dataset.accountSuspend, "suspended");
      if (pushMasterButton) pushAgentToMaster(pushMasterButton.dataset.accountPushMaster);
    });
  }

  function start() {
    createPanel();
    bindEvents();
    fetchAccounts();
    setInterval(() => {
      if (document.visibilityState !== "hidden") fetchAccounts();
    }, 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
