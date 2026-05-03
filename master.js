const STORAGE_KEYS = {
  negotiations: "kvai_negotiation_threads",
  leakProofDeals: "kvai_leak_proof_deals",
  agentCobroke: "kvai_agent_cobroke",
  agentVault: "kvai_agent_document_vault",
  agentListings: "kvai_agent_listings",
  adminAgents: "rg_admin_agents",
  algorithmControls: "rg_master_algorithm_controls",
  killSwitches: "rg_master_kill_switches",
  ownerAudit: "rg_master_owner_audit",
  globalAlert: "rg_global_platform_alert",
  agencyBans: "rg_master_agency_bans"
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

const seedVoiceTranscripts = [
  {
    id: "voice-001",
    type: "voice",
    title: "AI Voice Agent cold call with landlord",
    participants: "AI Voice Agent -> Mr Lim",
    property: "Skyline Residence",
    createdAt: new Date(Date.now() - 34 * 60000).toISOString(),
    lines: [
      { speaker: "AI Voice", text: "Hi Mr Lim, I am calling from RealtyGenius about your Mont Kiara unit. Are you open to a verified agent viewing request this week?" },
      { speaker: "Landlord", text: "Only if the buyer is serious. I do not want window shoppers." },
      { speaker: "AI Voice", text: "Understood. The buyer passed DSR screening and the agent can confirm a Saturday slot." }
    ]
  },
  {
    id: "voice-002",
    type: "voice",
    title: "AI Voice Agent lead qualification",
    participants: "AI Voice Agent -> Buyer Alya",
    property: "Bangsar Hill Collection",
    createdAt: new Date(Date.now() - 78 * 60000).toISOString(),
    lines: [
      { speaker: "AI Voice", text: "Are you buying for own stay, investment, or both?" },
      { speaker: "Buyer", text: "Own stay, but I care about resale." },
      { speaker: "AI Voice", text: "I will route you to listings with stronger transaction history and agent verification." }
    ]
  }
];

const seedSubscriptions = [
  { id: "sub-1", agentName: "Alex Wong", agencyName: "PrimeNest Realty", amount: 299, paidAt: new Date().toISOString() },
  { id: "sub-2", agentName: "Sarah Lee", agencyName: "PrimeNest Realty", amount: 299, paidAt: new Date().toISOString() },
  { id: "sub-3", agentName: "Ben Tan", agencyName: "PrimeNest Realty", amount: 299, paidAt: new Date(Date.now() - 3 * 3600000).toISOString() }
];

const state = {
  section: "panopticon",
  activeLogId: null,
  search: "",
  logType: "all",
  algorithm: readStore(STORAGE_KEYS.algorithmControls, DEFAULT_ALGORITHM),
  killSwitches: readStore(STORAGE_KEYS.killSwitches, DEFAULT_KILL_SWITCHES),
  ownerAudit: readStore(STORAGE_KEYS.ownerAudit, []),
  subscriptions: seedSubscriptions
};

const els = {
  navItems: [...document.querySelectorAll("[data-section]")],
  sectionJumps: [...document.querySelectorAll("[data-section-jump]")],
  panels: [...document.querySelectorAll("[data-panel]")],
  liveEscrowMetric: document.getElementById("liveEscrowMetric"),
  saasMetric: document.getElementById("saasMetric"),
  bankReferralMetric: document.getElementById("bankReferralMetric"),
  logMetric: document.getElementById("logMetric"),
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

function money(value) {
  return `RM ${Math.round(Number(value || 0)).toLocaleString("en-MY")}`;
}

function dateTime(value) {
  return new Date(value).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" });
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

function getAllLogs() {
  return [
    ...buildNegotiationLogs(),
    ...seedVoiceTranscripts,
    ...buildCobrokeLogs(),
    ...buildEscrowLogs()
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

function switchSection(section) {
  state.section = section;
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.section === section));
  els.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === section));
  history.replaceState(null, "", `#${section}`);
}

function renderMetrics() {
  const moneyState = getMoneySnapshot();
  const logs = getAllLogs();
  els.liveEscrowMetric.textContent = money(moneyState.heldEscrow);
  els.saasMetric.textContent = money(moneyState.saasRevenue);
  els.bankReferralMetric.textContent = money(moneyState.bankReferral);
  els.logMetric.textContent = logs.length;
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
  const agencies = [...new Set([...listingAgencies, ...adminAgencies, "PrimeNest Realty", "Metro Axis Realty"])];
  els.agencySelect.innerHTML = agencies.map((agency) => `<option value="${agency}">${agency}</option>`).join("");
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
  if (!agency) return;
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
renderAll();
