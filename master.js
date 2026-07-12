const STORAGE_KEYS = {
  negotiations: "kvai_negotiation_threads",
  leakProofDeals: "kvai_leak_proof_deals",
  agentCobroke: "kvai_agent_cobroke",
  agentVault: "kvai_agent_document_vault",
  agentListings: "kvai_agent_listings",
  listingAnalytics: "rg_listing_analytics",
  listingCollabs: "rg_listing_agent_collabs",
  collabRequests: "rg_agent_collab_requests",
  buyerLiveListings: "rg_live_buyer_listings",
  adminAgents: "rg_admin_agents",
  algorithmControls: "rg_master_algorithm_controls",
  killSwitches: "rg_master_kill_switches",
  ownerAudit: "rg_master_owner_audit",
  subscriptions: "rg_master_subscriptions",
  globalAlert: "rg_global_platform_alert",
  agencyBans: "rg_master_agency_bans",
  adminMasterTasks: "rg_master_admin_tasks"
};

const DEFAULT_ALGORITHM = {
  paidAdsBoost: 20,
  staleListingPenalty: -50,
  highYieldInvestorPriority: 35
};

const DEFAULT_KILL_SWITCHES = {
  escrowFrozen: false,
  frozenAt: null
};

const REAL_DATA_ONLY_NOTICE = "No real platform records yet.";

const state = {
  section: "panopticon",
  activeLogId: null,
  search: "",
  logType: "all",
  algorithm: readStore(STORAGE_KEYS.algorithmControls, DEFAULT_ALGORITHM),
  killSwitches: readStore(STORAGE_KEYS.killSwitches, DEFAULT_KILL_SWITCHES),
  ownerAudit: readStore(STORAGE_KEYS.ownerAudit, []),
  subscriptions: readStore(STORAGE_KEYS.subscriptions, [])
};

const els = {
  navItems: [...document.querySelectorAll("[data-section]")],
  sectionJumps: [...document.querySelectorAll("[data-section-jump]")],
  panels: [...document.querySelectorAll("[data-panel]")],
  liveEscrowMetric: document.getElementById("liveEscrowMetric"),
  saasMetric: document.getElementById("saasMetric"),
  bankReferralMetric: document.getElementById("bankReferralMetric"),
  logMetric: document.getElementById("logMetric"),
  terminalClock: document.getElementById("terminalClock"),
  tapeEscrow: document.getElementById("tapeEscrow"),
  tapeSaas: document.getElementById("tapeSaas"),
  tapeBank: document.getElementById("tapeBank"),
  tapeLogs: document.getElementById("tapeLogs"),
  tapeStatus: document.getElementById("tapeStatus"),
  refreshButton: document.getElementById("refreshButton"),
  searchInput: document.getElementById("searchInput"),
  logTypeFilter: document.getElementById("logTypeFilter"),
  logList: document.getElementById("logList"),
  logDetail: document.getElementById("logDetail"),
  escrowHeldValue: document.getElementById("escrowHeldValue"),
  escrowReleasedValue: document.getElementById("escrowReleasedValue"),
  subscriptionValue: document.getElementById("subscriptionValue"),
  subscriptionDetail: document.getElementById("subscriptionDetail"),
  bankPipelineValue: document.getElementById("bankPipelineValue"),
  financeLedger: document.getElementById("financeLedger"),
  paidAdsSlider: document.getElementById("paidAdsSlider"),
  stalePenaltySlider: document.getElementById("stalePenaltySlider"),
  yieldPrioritySlider: document.getElementById("yieldPrioritySlider"),
  paidAdsValue: document.getElementById("paidAdsValue"),
  stalePenaltyValue: document.getElementById("stalePenaltyValue"),
  yieldPriorityValue: document.getElementById("yieldPriorityValue"),
  saveAlgorithmButton: document.getElementById("saveAlgorithmButton"),
  resetAlgorithmButton: document.getElementById("resetAlgorithmButton"),
  algorithmPreview: document.getElementById("algorithmPreview"),
  agencySelect: document.getElementById("agencySelect"),
  banAgencyButton: document.getElementById("banAgencyButton"),
  freezeEscrowButton: document.getElementById("freezeEscrowButton"),
  unfreezeEscrowButton: document.getElementById("unfreezeEscrowButton"),
  globalAlertMessage: document.getElementById("globalAlertMessage"),
  pushAlertButton: document.getElementById("pushAlertButton"),
  clearAlertButton: document.getElementById("clearAlertButton"),
  killStatus: document.getElementById("killStatus"),
  ownerAudit: document.getElementById("ownerAudit"),
  globalAlertPreview: document.getElementById("globalAlertPreview"),
  toast: document.getElementById("toast")
};

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

function getListingAnalytics() {
  return readStore(STORAGE_KEYS.listingAnalytics, {});
}

function activeViewerCount(analytics = {}) {
  const cutoff = Date.now() - 5 * 60 * 1000;
  return Object.values(analytics.activeViewers || {}).filter((timestamp) => {
    const time = new Date(timestamp).getTime();
    return Number.isFinite(time) && time >= cutoff;
  }).length;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[character]));
}

function readListingCollabsStore() {
  return readStore(STORAGE_KEYS.listingCollabs, {});
}

function writeListingCollabsStore(store) {
  writeStore(STORAGE_KEYS.listingCollabs, store);
}

function readCollabRequests() {
  return readStore(STORAGE_KEYS.collabRequests, []);
}

function writeCollabRequests(requests) {
  writeStore(STORAGE_KEYS.collabRequests, requests);
}

function approvedAgents() {
  return getAdminAgents().filter((agent) => agent.status === "approved");
}

function collabsForListingId(listingId) {
  const record = readListingCollabsStore()[String(listingId)] || {};
  return Array.isArray(record.agents) ? record.agents : [];
}

function syncBuyerListingCollabs(listingId, agents) {
  const key = String(listingId);
  const buyerListings = readStore(STORAGE_KEYS.buyerLiveListings, []).map((item) => {
    const keys = [item.id, item.agentListingId, item.backendId].filter(Boolean).map(String);
    return keys.includes(key) ? { ...item, collabAgents: agents } : item;
  });
  writeStore(STORAGE_KEYS.buyerLiveListings, buyerListings);
}

function collabAgentFromRequest(request) {
  return {
    id: request.requesterAgentId || request.requesterEmail || request.id,
    name: request.requesterName || request.buyerAgent || "Buyer agent",
    email: request.requesterEmail || "",
    phone: request.requesterPhone || "",
    renNumber: request.requesterRenNumber || "",
    agencyName: request.requesterAgency || "",
    buyerAgent: request.buyerAgent || request.requesterName || "",
    assignedAt: new Date().toISOString(),
    assignedBy: "master",
    sourceRequestId: request.id
  };
}

function money(value) {
  return `RM ${Math.round(Number(value || 0)).toLocaleString("en-MY")}`;
}

function dateTime(value) {
  return new Date(value).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" });
}

function terminalTime() {
  return new Date().toLocaleTimeString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function statusText(value) {
  return String(value || "unknown").replace(/_/g, " ");
}

function getNegotiations() {
  return readStore(STORAGE_KEYS.negotiations, []);
}

function getDeals() {
  return readStore(STORAGE_KEYS.leakProofDeals, []);
}

function getCobrokeState() {
  return readStore(STORAGE_KEYS.agentCobroke, { matches: [] });
}

function getAgentListings() {
  return readStore(STORAGE_KEYS.agentListings, []);
}

function getAdminAgents() {
  return readStore(STORAGE_KEYS.adminAgents, []);
}

function getAdminMasterTasks() {
  return readStore(STORAGE_KEYS.adminMasterTasks, []);
}

function buildAdminTaskLogs() {
  return getAdminMasterTasks().map((task) => ({
    id: `admin-task-${task.id}`,
    type: "admin_task",
    title: task.title || "Admin task pushed to Master",
    participants: `Admin Gatekeeper -> Master`,
    property: task.agentName || task.agentEmail || "Owner review queue",
    createdAt: task.createdAt || new Date().toISOString(),
    summary: `${statusText(task.priority || "normal")} priority - ${statusText(task.status || "open")}`,
    lines: [
      { speaker: "Admin task", text: task.message || "Admin requested owner review." },
      { speaker: "Target", text: `${task.agentName || "Agent"} ${task.agentEmail ? `<${task.agentEmail}>` : ""}` },
      { speaker: "Status", text: `${statusText(task.status || "open")} - ${statusText(task.priority || "normal")} priority` }
    ]
  }));
}

function buildNegotiationLogs() {
  return getNegotiations().map((thread) => ({
    id: `negotiation-${thread.id}`,
    type: "negotiation",
    title: `Negotiation: ${thread.propertyTitle}`,
    participants: `${thread.buyerName || "Buyer"} -> Agent`,
    property: thread.propertyTitle,
    createdAt: thread.updatedAt || thread.createdAt || new Date().toISOString(),
    summary: `${thread.entries?.length || 0} entries. Status: ${thread.status}.`,
    lines: (thread.entries || []).map((entry) => ({
      speaker: entry.actorLabel || entry.actor || "Participant",
      text: `${entry.price ? `${money(entry.price)} - ` : ""}${entry.message}`
    }))
  }));
}

function buildCobrokeLogs() {
  const cobroke = getCobrokeState();
  return (cobroke.matches || []).map((match) => ({
    id: `cobroke-${match.id}`,
    type: "cobroke",
    title: `Co-Broke Agreement: ${match.propertyTitle}`,
    participants: `Listing Agent -> ${match.buyerAgent || "Buyer Agent"}`,
    property: match.propertyTitle,
    createdAt: match.createdAt || new Date().toISOString(),
    summary: `Status: ${match.status}. Match score: ${match.score || match.matchScore || 0}%.`,
    lines: [
      { speaker: "Agreement", text: `Commission split: ${match.agreement?.commissionSplit || "50/50"}` },
      { speaker: "Rationale", text: (match.reasons || []).join(", ") || match.rationale || "Private co-broke match generated." },
      { speaker: "E-Sign", text: `Listing agent signed: ${Boolean(match.agreement?.signatures?.listingAgent)}. Buyer agent signed: ${Boolean(match.agreement?.signatures?.buyerAgent)}.` }
    ]
  }));
}

function buildEscrowLogs() {
  return getDeals().flatMap((deal) => (deal.timeline || []).map((event) => ({
    id: `escrow-${deal.id}-${event.id}`,
    type: "escrow",
    title: event.title,
    participants: `${deal.buyerName || "Buyer"} -> RealtyGenius Holding Account`,
    property: deal.propertyTitle,
    createdAt: event.createdAt,
    summary: event.message,
    lines: [
      { speaker: "Deal", text: `${deal.propertyTitle} in ${deal.propertyArea}` },
      { speaker: "Escrow", text: `${money(deal.escrow?.amount || 0)} status: ${statusText(deal.escrow?.status)}` },
      { speaker: "Event", text: event.message }
    ]
  })));
}

function buildListingAnalyticsLogs() {
  return Object.values(getListingAnalytics()).map((analytics) => ({
    id: `listing-analytics-${analytics.listingId}`,
    type: "analytics",
    title: `Listing analytics: ${analytics.title || "Untitled listing"}`,
    participants: `${analytics.agentName || "Agent"} -> Buyer activity stream`,
    property: analytics.title || analytics.area || "Listing",
    createdAt: analytics.updatedAt || new Date().toISOString(),
    summary: `${Number(analytics.views || 0)} real views, ${activeViewerCount(analytics)} live viewing, ${Number(analytics.contacts || 0)} contacts, ${Number(analytics.bookings || 0)} bookings.`,
    lines: [
      { speaker: "Impressions", text: String(Number(analytics.impressions || 0)) },
      { speaker: "Real views", text: String(Number(analytics.views || 0)) },
      { speaker: "Live viewing", text: `${activeViewerCount(analytics)} active in the last 5 minutes` },
      { speaker: "Contacts", text: String(Number(analytics.contacts || 0)) },
      { speaker: "Bookings", text: String(Number(analytics.bookings || 0)) },
      { speaker: "Saves", text: String(Number(analytics.saves || 0)) }
    ]
  }));
}

function buildCollabRequestLogs() {
  return readCollabRequests().map((request) => ({
    id: `collab-request-${request.id}`,
    type: "collab_request",
    title: `Co-broke request: ${request.listingTitle || "Listing"}`,
    participants: `${request.requesterName || "Buyer agent"} -> Admin/Master approval`,
    property: request.listingTitle || request.listingId,
    createdAt: request.updatedAt || request.createdAt || new Date().toISOString(),
    summary: `${statusText(request.status)} - ${Number(request.matchScore || 0)}% match for ${request.requirements?.location || "buyer requirement"}.`,
    requestId: request.id,
    lines: [
      { speaker: "Requester", text: `${request.requesterName || "Agent"} ${request.requesterEmail ? `<${request.requesterEmail}>` : ""}` },
      { speaker: "Buyer agent", text: request.buyerAgent || request.requesterName || "Buyer agent" },
      { speaker: "Requirement", text: `${request.requirements?.location || "Any location"}, ${request.requirements?.propertyType || "Property"}, up to ${money(request.requirements?.budget || 0)}` },
      { speaker: "Reasons", text: (request.reasons || []).join(", ") || "Agent has a buyer and requested collaboration." },
      { speaker: "Status", text: statusText(request.status) }
    ]
  }));
}

function getAllLogs() {
  return [
    ...buildAdminTaskLogs(),
    ...buildNegotiationLogs(),
    ...buildCobrokeLogs(),
    ...buildEscrowLogs(),
    ...buildListingAnalyticsLogs(),
    ...buildCollabRequestLogs()
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function ensureMasterTaskPanel() {
  let panel = document.getElementById("masterTaskPanel");
  if (panel) return panel;
  panel = document.createElement("section");
  panel.id = "masterTaskPanel";
  panel.className = "section-panel master-task-panel";
  const anchor = document.querySelector(".hero");
  if (anchor?.parentElement) anchor.insertAdjacentElement("afterend", panel);
  else document.querySelector(".main")?.prepend(panel);
  return panel;
}

function updateMasterTaskStatus(taskId, status) {
  const tasks = getAdminMasterTasks().map((task) => task.id === taskId ? {
    ...task,
    status,
    updatedAt: new Date().toISOString()
  } : task);
  writeStore(STORAGE_KEYS.adminMasterTasks, tasks);
  addAudit(`admin_task_${status}`, `Owner marked admin task ${taskId} as ${status}.`);
  renderAll();
  showToast(`Task ${status}`);
}

function renderMasterTasks() {
  const panel = ensureMasterTaskPanel();
  const tasks = getAdminMasterTasks();
  panel.innerHTML = `
    <div class="panel-head">
      <div>
        <div class="eyebrow">Admin-To-Master Queue</div>
        <h3>Gatekeeper tasks pushed by admin</h3>
      </div>
      <div class="chip-row">
        <span class="chip">${tasks.filter((task) => task.status !== "done").length} open</span>
        <span class="chip">Owner review lane</span>
      </div>
    </div>
    <div class="master-task-grid">
      ${tasks.length ? tasks.slice(0, 6).map((task) => `
        <article class="master-task-card">
          <div class="pill-row">
            <span class="type-pill ${task.priority === "high" ? "escrow" : ""}">${statusText(task.priority || "normal")}</span>
            <span class="type-pill">${dateTime(task.createdAt)}</span>
          </div>
          <strong>${task.title}</strong>
          <p>${task.message}</p>
          <div class="terminal-board compact">
            <div><span>AGENT</span><strong>${task.agentName || "Unknown"}</strong></div>
            <div><span>EMAIL</span><strong>${task.agentEmail || "No email"}</strong></div>
            <div><span>STATUS</span><strong>${statusText(task.status || "open")}</strong></div>
          </div>
          <div class="row-actions">
            <button class="ghost-button" data-master-task-status="${task.id}" data-status="reviewing" type="button">Reviewing</button>
            <button class="primary-button" data-master-task-status="${task.id}" data-status="done" type="button">Done</button>
          </div>
        </article>
      `).join("") : `<article class="master-task-card"><strong>No admin tasks yet</strong><p>When admin clicks Push to Master on a new agent, it will appear here and in Panopticon.</p></article>`}
    </div>
  `;
}

function filteredLogs() {
  const search = state.search.toLowerCase();
  return getAllLogs().filter((log) => {
    const typeOk = state.logType === "all" || log.type === state.logType;
    const haystack = [
      log.title,
      log.participants,
      log.property,
      log.summary,
      ...(log.lines || []).flatMap((line) => [line.speaker, line.text])
    ].join(" ").toLowerCase();
    return typeOk && (!search || haystack.includes(search));
  });
}

function getMoneySnapshot() {
  const deals = getDeals();
  const heldEscrow = deals
    .filter((deal) => deal.escrow?.status === "held")
    .reduce((sum, deal) => sum + Number(deal.escrow?.amount || 0), 0);
  const releasedEscrow = deals
    .filter((deal) => deal.escrow?.status === "released")
    .reduce((sum, deal) => sum + Number(deal.escrow?.amount || 0), 0);
  const subscriptionsToday = state.subscriptions.filter((sub) => new Date(sub.paidAt).toDateString() === new Date().toDateString());
  const saasRevenue = subscriptionsToday.reduce((sum, sub) => sum + sub.amount, 0);
  const bankReferral = deals
    .filter((deal) => deal.loan?.status === "discount_secured")
    .reduce((sum, deal) => sum + Number(deal.loan?.referralFeeEstimate || (deal.askingPrice || 0) * 0.9 * 0.01), 0);

  return {
    heldEscrow,
    releasedEscrow,
    subscriptionsToday,
    saasRevenue,
    bankReferral,
    deals
  };
}

function addAudit(action, details) {
  state.ownerAudit = [
    {
      id: `owner-${Date.now()}`,
      action,
      details,
      createdAt: new Date().toISOString()
    },
    ...state.ownerAudit
  ];
  writeStore(STORAGE_KEYS.ownerAudit, state.ownerAudit);
}

function assignMasterCollabAgent(listingId) {
  const agentId = document.getElementById("masterCollabAgentSelect")?.value;
  const agent = approvedAgents().find((item) => item.id === agentId);
  const analytics = getListingAnalytics()[String(listingId)] || {};
  if (!agent) {
    showToast("Select an approved agent first");
    return;
  }

  const store = readListingCollabsStore();
  const record = store[String(listingId)] || {
    listingId: String(listingId),
    propertyTitle: analytics.title || "Listing",
    createdAt: new Date().toISOString(),
    agents: []
  };
  const nextAgent = {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    phone: agent.phone || agent.phoneNumber || "",
    renNumber: agent.renNumber,
    agencyName: agent.agencyName,
    assignedAt: new Date().toISOString(),
    assignedBy: "master"
  };
  const agents = [
    nextAgent,
    ...(record.agents || []).filter((item) => item.id !== agent.id)
  ];
  store[String(listingId)] = {
    ...record,
    agents,
    updatedAt: new Date().toISOString()
  };
  writeListingCollabsStore(store);
  syncBuyerListingCollabs(listingId, agents);
  addAudit("listing_collab_assigned", `Owner assigned ${agent.name} to ${analytics.title || listingId}.`);
  renderAll();
  showToast(`${agent.name} assigned`);
}

function approveMasterCollabRequest(requestId) {
  const requests = readCollabRequests();
  const request = requests.find((item) => item.id === requestId);
  if (!request) return;
  const store = readListingCollabsStore();
  const key = String(request.listingId);
  const record = store[key] || {
    listingId: key,
    propertyTitle: request.listingTitle,
    createdAt: new Date().toISOString(),
    agents: []
  };
  const nextAgent = collabAgentFromRequest(request);
  const agents = [
    nextAgent,
    ...(record.agents || []).filter((item) => item.id !== nextAgent.id)
  ];
  store[key] = {
    ...record,
    agents,
    updatedAt: new Date().toISOString()
  };
  writeListingCollabsStore(store);
  syncBuyerListingCollabs(key, agents);
  writeCollabRequests(requests.map((item) => item.id === requestId ? {
    ...item,
    status: "approved",
    reviewedBy: "master",
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } : item));
  addAudit("collab_request_approved", `Owner approved ${nextAgent.name} for ${request.listingTitle}.`);
  renderAll();
  showToast("Collab request approved");
}

function rejectMasterCollabRequest(requestId) {
  const requests = readCollabRequests();
  const request = requests.find((item) => item.id === requestId);
  writeCollabRequests(requests.map((item) => item.id === requestId ? {
    ...item,
    status: "rejected",
    reviewedBy: "master",
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } : item));
  addAudit("collab_request_rejected", `Owner rejected ${request?.requesterName || "agent"} for ${request?.listingTitle || requestId}.`);
  renderAll();
  showToast("Collab request rejected");
}

function switchSection(section) {
  state.section = section;
  els.navItems.forEach((item) => {
    const isActive = item.dataset.section === section;
    item.classList.toggle("active", isActive);
    if (isActive) item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  });
  els.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === section));
  history.replaceState(null, "", `#${section}`);
  showToast(`${section.replace(/-/g, " ")} opened`);
}

function renderMetrics() {
  const moneyState = getMoneySnapshot();
  const logs = getAllLogs();
  els.liveEscrowMetric.textContent = money(moneyState.heldEscrow);
  els.saasMetric.textContent = money(moneyState.saasRevenue);
  els.bankReferralMetric.textContent = money(moneyState.bankReferral);
  els.logMetric.textContent = logs.length;
  els.tapeEscrow.textContent = money(moneyState.heldEscrow);
  els.tapeSaas.textContent = money(moneyState.saasRevenue);
  els.tapeBank.textContent = money(moneyState.bankReferral);
  els.tapeLogs.textContent = logs.length;
  els.tapeStatus.textContent = state.killSwitches.escrowFrozen ? "ESCROW FROZEN" : "NORMAL";
  els.tapeStatus.parentElement.classList.toggle("is-risk", state.killSwitches.escrowFrozen);
}

function renderTerminalClock() {
  if (!els.terminalClock) return;
  els.terminalClock.textContent = `MYT ${terminalTime()}`;
}

function renderPanopticon() {
  const logs = filteredLogs();
  if (!logs.some((log) => log.id === state.activeLogId)) {
    state.activeLogId = logs[0]?.id || null;
  }

  els.logList.innerHTML = logs.length ? logs.map((log) => `
    <article class="log-card ${log.id === state.activeLogId ? "active" : ""}" data-log-id="${log.id}">
      <div class="pill-row">
        <span class="type-pill ${log.type}">${log.type}</span>
        <span class="type-pill">${dateTime(log.createdAt)}</span>
      </div>
      <strong>${log.title}</strong>
      <p>${log.participants}</p>
      <p>${log.summary}</p>
    </article>
  `).join("") : `<article class="log-card"><strong>No logs found</strong><p>Try another search or stream filter.</p></article>`;

  const selected = logs.find((log) => log.id === state.activeLogId);
  if (!selected) {
    els.logDetail.innerHTML = `<h4>No interaction selected</h4><p>Select a log to read the exact platform record.</p>`;
    return;
  }

  els.logDetail.innerHTML = `
    <div class="pill-row">
      <span class="type-pill ${selected.type}">${selected.type}</span>
      <span class="type-pill">Uneditable owner log</span>
    </div>
    <h4>${selected.title}</h4>
    <p>${selected.participants}</p>
    <p>${selected.property || "Platform record"} - ${dateTime(selected.createdAt)}</p>
    <div class="transcript">
      ${(selected.lines || []).map((line) => `
        <div class="transcript-line">
          <span>${line.speaker}</span>
          <p>${line.text}</p>
        </div>
      `).join("")}
    </div>
    ${selected.type === "analytics" ? renderMasterCollabControls(selected) : ""}
    ${selected.type === "collab_request" ? renderMasterCollabRequestControls(selected) : ""}
  `;
}

function renderMasterCollabRequestControls(selected) {
  const request = readCollabRequests().find((item) => item.id === selected.requestId);
  if (!request) return "";
  const locked = request.status !== "pending_admin";
  return `
    <div class="terminal-board compact">
      <div><span>REQUEST STATUS</span><strong>${escapeHtml(statusText(request.status))}</strong></div>
      <div><span>MATCH</span><strong>${Number(request.matchScore || 0)}%</strong></div>
    </div>
    <div class="row-actions">
      <button class="primary-button" data-master-approve-collab="${escapeHtml(request.id)}" type="button" ${locked ? "disabled" : ""}>Approve Collab</button>
      <button class="ghost-button" data-master-reject-collab="${escapeHtml(request.id)}" type="button" ${locked ? "disabled" : ""}>Reject</button>
    </div>
  `;
}

function renderMasterCollabControls(selected) {
  const listingId = String(selected.id || "").replace("listing-analytics-", "");
  const agents = approvedAgents();
  const assigned = collabsForListingId(listingId);
  return `
    <div class="terminal-board compact">
      <div><span>COLLAB ROUTING</span><strong>${assigned[0]?.name || "Primary agent"}</strong></div>
      <div><span>ASSIGNED</span><strong>${assigned.length}</strong></div>
    </div>
    <div class="row-actions">
      <select class="field" id="masterCollabAgentSelect" aria-label="Select collaboration agent">
        <option value="">Select approved agent</option>
        ${agents.map((agent) => `<option value="${escapeHtml(agent.id)}">${escapeHtml(agent.name)} - ${escapeHtml(agent.agencyName || "Agency")}</option>`).join("")}
      </select>
      <button class="primary-button" data-master-assign-listing="${escapeHtml(listingId)}" type="button">Assign Collab</button>
    </div>
    <div class="transcript">
      ${assigned.length ? assigned.map((agent) => `
        <div class="transcript-line">
          <span>${escapeHtml(agent.name)}</span>
          <p>${escapeHtml(agent.email || "No email")} - ${escapeHtml(agent.phone || agent.renNumber || "No phone")}</p>
        </div>
      `).join("") : `<div class="transcript-line"><span>No collab</span><p>Owner can assign an approved agent when this listing becomes hot.</p></div>`}
    </div>
  `;
}

function renderMoney() {
  const snapshot = getMoneySnapshot();
  els.escrowHeldValue.textContent = money(snapshot.heldEscrow);
  els.escrowReleasedValue.textContent = money(snapshot.releasedEscrow);
  els.subscriptionValue.textContent = money(snapshot.saasRevenue);
  els.subscriptionDetail.textContent = `${snapshot.subscriptionsToday.length} agents paid RM 299 today.`;
  els.bankPipelineValue.textContent = money(snapshot.bankReferral);

  const ledgerRows = [
    ...snapshot.deals.map((deal) => ({
      title: deal.propertyTitle,
      type: "Escrow",
      value: money(deal.escrow?.amount || 0),
      detail: `${deal.buyerName || "Buyer"} - ${statusText(deal.escrow?.status)} - ${deal.escrow?.reference || "No reference"}`
    })),
    ...state.subscriptions.map((sub) => ({
      title: sub.agentName,
      type: "SaaS",
      value: money(sub.amount),
      detail: `${sub.agencyName} paid at ${dateTime(sub.paidAt)}`
    })),
    ...snapshot.deals
      .filter((deal) => deal.loan?.status === "discount_secured")
      .map((deal) => ({
        title: deal.propertyTitle,
        type: "Bank Referral",
        value: money(deal.loan?.referralFeeEstimate || 0),
        detail: `${deal.loan?.bank || "Partner bank"} loan path submitted by ${deal.buyerName || "buyer"}`
      }))
  ];

  els.financeLedger.innerHTML = ledgerRows.length ? ledgerRows.map((row) => `
    <article class="ledger-card">
      <div class="pill-row"><span class="type-pill escrow">${row.type}</span><span class="type-pill">${row.value}</span></div>
      <strong>${row.title}</strong>
      <p>${row.detail}</p>
    </article>
  `).join("") : `<article class="ledger-card"><strong>No money records yet</strong><p>Escrow, subscriptions, and loan referrals will appear here.</p></article>`;
}

function syncAlgorithmInputs() {
  els.paidAdsSlider.value = state.algorithm.paidAdsBoost;
  els.stalePenaltySlider.value = state.algorithm.staleListingPenalty;
  els.yieldPrioritySlider.value = state.algorithm.highYieldInvestorPriority;
  renderAlgorithmValues();
}

function renderAlgorithmValues() {
  state.algorithm = {
    paidAdsBoost: Number(els.paidAdsSlider.value),
    staleListingPenalty: Number(els.stalePenaltySlider.value),
    highYieldInvestorPriority: Number(els.yieldPrioritySlider.value)
  };
  els.paidAdsValue.textContent = `${state.algorithm.paidAdsBoost >= 0 ? "+" : ""}${state.algorithm.paidAdsBoost}%`;
  els.stalePenaltyValue.textContent = `${state.algorithm.staleListingPenalty}%`;
  els.yieldPriorityValue.textContent = `${state.algorithm.highYieldInvestorPriority >= 0 ? "+" : ""}${state.algorithm.highYieldInvestorPriority}%`;
  els.algorithmPreview.innerHTML = `
    <strong>Current ranking formula override</strong>
    <p>Developer paid ads visibility ${els.paidAdsValue.textContent}; stale listings older than 60 days ${els.stalePenaltyValue.textContent}; investor quiz high-yield priority ${els.yieldPriorityValue.textContent}. Saved controls are read by user.html feed ranking immediately.</p>
  `;
}

function saveAlgorithm() {
  renderAlgorithmValues();
  writeStore(STORAGE_KEYS.algorithmControls, state.algorithm);
  addAudit("algorithm_controls_saved", JSON.stringify(state.algorithm));
  renderAudit();
  showToast("Algorithm controls saved");
}

function resetAlgorithm() {
  state.algorithm = { ...DEFAULT_ALGORITHM };
  syncAlgorithmInputs();
  writeStore(STORAGE_KEYS.algorithmControls, state.algorithm);
  addAudit("algorithm_controls_reset", "Feed algorithm controls reset to owner defaults.");
  renderAudit();
  showToast("Algorithm reset");
}

function renderAgencies() {
  const listingAgencies = getAgentListings().map((listing) => listing.agencyName).filter(Boolean);
  const adminAgencies = getAdminAgents().map((agent) => agent.agencyName).filter(Boolean);
  const agencies = [...new Set([...listingAgencies, ...adminAgencies])].filter(Boolean);
  els.agencySelect.innerHTML = agencies.length
    ? agencies.map((agency) => `<option value="${agency}">${agency}</option>`).join("")
    : `<option value="">${REAL_DATA_ONLY_NOTICE}</option>`;
}

function renderKillStatus() {
  const globalAlert = readStore(STORAGE_KEYS.globalAlert, null);
  const agencyBans = readStore(STORAGE_KEYS.agencyBans, []);
  els.globalAlertPreview.hidden = !(globalAlert?.active);
  els.globalAlertPreview.textContent = globalAlert?.message || "";
  els.killStatus.innerHTML = `
    <article class="status-card">
      <strong>Escrow freeze</strong>
      <p>${state.killSwitches.escrowFrozen ? `Frozen since ${dateTime(state.killSwitches.frozenAt)}` : "Escrow transfers are currently active."}</p>
    </article>
    <article class="status-card">
      <strong>Global alert</strong>
      <p>${globalAlert?.active ? globalAlert.message : "No active global alert."}</p>
    </article>
    <article class="status-card">
      <strong>Banned agencies</strong>
      <p>${agencyBans.length ? agencyBans.join(", ") : "No agencies banned."}</p>
    </article>
  `;
}

function banAgency() {
  const agency = els.agencySelect.value;
  if (!agency) {
    showToast("No real agency records available");
    return;
  }
  const bans = readStore(STORAGE_KEYS.agencyBans, []);
  writeStore(STORAGE_KEYS.agencyBans, [...new Set([agency, ...bans])]);

  const listings = getAgentListings().map((listing) =>
    listing.agencyName === agency ? { ...listing, status: "Offline", bannedByMaster: true } : listing
  );
  writeStore(STORAGE_KEYS.agentListings, listings);

  const adminAgents = getAdminAgents().map((agent) =>
    agent.agencyName === agency ? { ...agent, status: "suspended" } : agent
  );
  if (adminAgents.length) writeStore(STORAGE_KEYS.adminAgents, adminAgents);

  addAudit("agency_banned", `${agency} was banned. Agents suspended and listings pulled offline.`);
  renderKillStatus();
  renderAudit();
  showToast(`${agency} banned`);
}

function freezeEscrow() {
  state.killSwitches = {
    escrowFrozen: true,
    frozenAt: new Date().toISOString()
  };
  writeStore(STORAGE_KEYS.killSwitches, state.killSwitches);
  addAudit("escrow_frozen", "All escrow transfers halted by owner kill switch.");
  renderKillStatus();
  renderAudit();
  showToast("Escrow frozen");
}

function unfreezeEscrow() {
  state.killSwitches = {
    escrowFrozen: false,
    frozenAt: null
  };
  writeStore(STORAGE_KEYS.killSwitches, state.killSwitches);
  addAudit("escrow_unfrozen", "Escrow transfers re-enabled by owner.");
  renderKillStatus();
  renderAudit();
  showToast("Escrow unfrozen");
}

function pushGlobalAlert() {
  const message = els.globalAlertMessage.value.trim();
  if (!message) {
    showToast("Write an alert message first");
    return;
  }
  writeStore(STORAGE_KEYS.globalAlert, {
    active: true,
    message,
    pushedAt: new Date().toISOString()
  });
  addAudit("global_alert_pushed", message);
  renderKillStatus();
  renderAudit();
  showToast("Global alert pushed");
}

function clearGlobalAlert() {
  writeStore(STORAGE_KEYS.globalAlert, {
    active: false,
    message: "",
    clearedAt: new Date().toISOString()
  });
  addAudit("global_alert_cleared", "Owner cleared the global alert banner.");
  renderKillStatus();
  renderAudit();
  showToast("Global alert cleared");
}

function renderAudit() {
  els.ownerAudit.innerHTML = state.ownerAudit.length ? state.ownerAudit.map((entry) => `
    <article class="audit-card">
      <div class="pill-row"><span class="type-pill">${dateTime(entry.createdAt)}</span></div>
      <strong>${statusText(entry.action)}</strong>
      <p>${entry.details}</p>
    </article>
  `).join("") : `<article class="audit-card"><strong>No owner actions yet</strong><p>Algorithm changes, bans, freezes, and broadcasts will appear here.</p></article>`;
}

function renderAll() {
  renderMetrics();
  renderMasterTasks();
  renderPanopticon();
  renderMoney();
  renderAlgorithmValues();
  renderAgencies();
  renderKillStatus();
  renderAudit();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 2200);
}

function bindEvents() {
  els.navItems.forEach((button) => button.addEventListener("click", () => switchSection(button.dataset.section)));
  els.sectionJumps.forEach((button) => button.addEventListener("click", () => switchSection(button.dataset.sectionJump)));
  els.refreshButton.addEventListener("click", () => {
    renderAll();
    showToast("Streams refreshed");
  });
  window.RealtyGeniusPush?.installButton(document.getElementById("pushPermissionButton"), (result) => {
    if (result === "granted") showToast("Owner push notifications enabled");
    else if (result === "denied") showToast("Browser blocked push notifications");
    else showToast("Push notifications are unavailable here");
  });
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderPanopticon();
  });
  els.logTypeFilter.addEventListener("change", (event) => {
    state.logType = event.target.value;
    renderPanopticon();
  });
  els.logList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-log-id]");
    if (!card) return;
    state.activeLogId = card.dataset.logId;
    renderPanopticon();
  });

  [els.paidAdsSlider, els.stalePenaltySlider, els.yieldPrioritySlider].forEach((slider) => {
    slider.addEventListener("input", renderAlgorithmValues);
  });
  els.saveAlgorithmButton.addEventListener("click", saveAlgorithm);
  els.resetAlgorithmButton.addEventListener("click", resetAlgorithm);
  els.banAgencyButton.addEventListener("click", banAgency);
  els.freezeEscrowButton.addEventListener("click", freezeEscrow);
  els.unfreezeEscrowButton.addEventListener("click", unfreezeEscrow);
  els.pushAlertButton.addEventListener("click", pushGlobalAlert);
  els.clearAlertButton.addEventListener("click", clearGlobalAlert);

  document.addEventListener("click", (event) => {
    const quickTarget = event.target instanceof Element ? event.target.closest("[data-master-quick]") : null;
    if (quickTarget) {
      switchSection(quickTarget.dataset.masterQuick);
      return;
    }

    const target = event.target instanceof Element ? event.target.closest("[data-master-task-status]") : null;
    if (target) {
      updateMasterTaskStatus(target.dataset.masterTaskStatus, target.dataset.status || "reviewing");
      return;
    }
    const assignTarget = event.target instanceof Element ? event.target.closest("[data-master-assign-listing]") : null;
    if (assignTarget) {
      assignMasterCollabAgent(assignTarget.dataset.masterAssignListing);
      return;
    }
    const approveCollabTarget = event.target instanceof Element ? event.target.closest("[data-master-approve-collab]") : null;
    if (approveCollabTarget) {
      approveMasterCollabRequest(approveCollabTarget.dataset.masterApproveCollab);
      return;
    }
    const rejectCollabTarget = event.target instanceof Element ? event.target.closest("[data-master-reject-collab]") : null;
    if (rejectCollabTarget) rejectMasterCollabRequest(rejectCollabTarget.dataset.masterRejectCollab);
  });

  window.addEventListener("storage", (event) => {
    if (Object.values(STORAGE_KEYS).includes(event.key)) {
      state.killSwitches = readStore(STORAGE_KEYS.killSwitches, DEFAULT_KILL_SWITCHES);
      state.ownerAudit = readStore(STORAGE_KEYS.ownerAudit, []);
      renderAll();
    }
  });
}

syncAlgorithmInputs();
const initialSection = location.hash.replace("#", "") || "panopticon";
switchSection(["panopticon", "money", "algorithm", "killswitch", "audit"].includes(initialSection) ? initialSection : "panopticon");
bindEvents();
renderTerminalClock();
setInterval(renderTerminalClock, 1000);
renderAll();
