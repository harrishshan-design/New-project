const STORAGE_KEYS = {
  agents: "rg_admin_agents",
  verificationLogs: "rg_admin_agent_verification_logs",
  listings: "rg_admin_listings",
  reports: "rg_admin_reports",
  auditLogs: "rg_admin_audit_logs",
  notifications: "rg_admin_notifications"
};

const ADMIN_ID = "admin-gatekeeper-01";

const marketAverages = {
  "Mont Kiara": 1180000,
  Bangsar: 1420000,
  "Bukit Jalil": 710000,
  "Petaling Jaya": 780000,
  "Desa ParkCity": 1650000
};

const seedAgents = [
  {
    id: "ag-100",
    name: "Alex Wong",
    email: "alex@agency.my",
    renNumber: "REN12345",
    agencyName: "PrimeNest Realty",
    icDocumentUrl: "s3://agent-kyc/alex-wong-ic.pdf",
    icHash: "ic-700101-14-5512",
    status: "approved",
    strikes: 0,
    createdAt: "2026-04-18T09:15:00+08:00"
  },
  {
    id: "ag-101",
    name: "Sarah Lee",
    email: "sarah.lee@agency.my",
    renNumber: "REN88421",
    agencyName: "PrimeNest Realty",
    icDocumentUrl: "s3://agent-kyc/sarah-lee-ic.pdf",
    icHash: "ic-880412-10-1098",
    status: "pending",
    strikes: 0,
    createdAt: "2026-05-01T10:30:00+08:00"
  },
  {
    id: "ag-102",
    name: "Darren Lim",
    email: "darren.lim@fastmail.my",
    renNumber: "REN12345",
    agencyName: "Metro Axis Realty",
    icDocumentUrl: "s3://agent-kyc/darren-lim-ic.pdf",
    icHash: "ic-850909-14-6220",
    status: "pending",
    strikes: 0,
    createdAt: "2026-05-01T11:45:00+08:00"
  },
  {
    id: "ag-103",
    name: "Maya Tan",
    email: "maya.tan@agency.my",
    renNumber: "REN77200",
    agencyName: "PrimeNest Realty",
    icDocumentUrl: "s3://agent-kyc/maya-tan-ic.pdf",
    icHash: "ic-880412-10-1098",
    status: "pending",
    strikes: 0,
    createdAt: "2026-05-02T08:20:00+08:00"
  },
  {
    id: "ag-104",
    name: "Ben Tan",
    email: "ben@agency.my",
    renNumber: "REN67890",
    agencyName: "PrimeNest Realty",
    icDocumentUrl: "s3://agent-kyc/ben-tan-ic.pdf",
    icHash: "ic-780222-10-4450",
    status: "approved",
    strikes: 2,
    createdAt: "2026-04-10T15:10:00+08:00"
  }
];

const seedListings = [
  {
    id: "ls-201",
    agentId: "ag-101",
    title: "Skyline Residence Below Market",
    price: 790000,
    location: "Mont Kiara",
    status: "pending_qc",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    imageResolution: 680,
    blurScore: 0.42,
    imageHash: "img-skyline-a",
    createdAt: "2026-05-02T09:10:00+08:00"
  },
  {
    id: "ls-202",
    agentId: "ag-100",
    title: "Bangsar Hill Collection",
    price: 1410000,
    location: "Bangsar",
    status: "pending_qc",
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    imageResolution: 1280,
    blurScore: 0.08,
    imageHash: "img-bangsar-1",
    createdAt: "2026-05-01T17:30:00+08:00"
  },
  {
    id: "ls-203",
    agentId: "ag-102",
    title: "Skyline Residence Duplicate",
    price: 800000,
    location: "Mont Kiara",
    status: "pending_qc",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    imageResolution: 640,
    blurScore: 0.51,
    imageHash: "img-skyline-a",
    createdAt: "2026-05-02T10:05:00+08:00"
  }
];

const seedReports = [
  {
    id: "rp-301",
    userId: "usr-9001",
    listingId: "ls-201",
    agentId: "ag-101",
    type: "fake_listing",
    description: "Buyer says the unit photos were reused from another portal and price looked too low.",
    status: "open",
    createdAt: "2026-05-02T12:15:00+08:00"
  },
  {
    id: "rp-302",
    userId: "usr-9002",
    listingId: "ls-203",
    agentId: "ag-102",
    type: "scam",
    description: "Agent asked for direct booking fee outside RealtyGenius escrow.",
    status: "investigating",
    createdAt: "2026-05-02T14:45:00+08:00"
  },
  {
    id: "rp-303",
    userId: "usr-9003",
    listingId: "ls-202",
    agentId: "ag-104",
    type: "unresponsive",
    description: "Agent missed two confirmed viewing windows.",
    status: "open",
    createdAt: "2026-05-03T09:00:00+08:00"
  }
];

const seedAuditLogs = [
  {
    id: "al-1",
    actor: ADMIN_ID,
    action: "system_scan",
    targetType: "marketplace",
    targetId: "initial",
    notes: "Initial gatekeeper scan completed.",
    timestamp: "2026-05-03T09:05:00+08:00"
  }
];

const seedNotifications = [
  {
    id: "nt-1",
    title: "High risk listing detected",
    message: "Skyline Residence Below Market has price and image-quality flags.",
    createdAt: "2026-05-03T09:10:00+08:00"
  }
];

const state = {
  section: "agents",
  activeListingId: null,
  agents: readStore(STORAGE_KEYS.agents, seedAgents),
  verificationLogs: readStore(STORAGE_KEYS.verificationLogs, []),
  listings: readStore(STORAGE_KEYS.listings, seedListings),
  reports: readStore(STORAGE_KEYS.reports, seedReports),
  auditLogs: readStore(STORAGE_KEYS.auditLogs, seedAuditLogs),
  notifications: readStore(STORAGE_KEYS.notifications, seedNotifications)
};

const els = {
  navItems: [...document.querySelectorAll("[data-section]")],
  panels: [...document.querySelectorAll("[data-panel]")],
  pendingAgentCount: document.getElementById("pendingAgentCount"),
  pendingListingCount: document.getElementById("pendingListingCount"),
  openReportCount: document.getElementById("openReportCount"),
  suspendedCount: document.getElementById("suspendedCount"),
  runScanButton: document.getElementById("runScanButton"),
  resetDemoButton: document.getElementById("resetDemoButton"),
  agentQueue: document.getElementById("agentQueue"),
  agentRiskList: document.getElementById("agentRiskList"),
  listingQueue: document.getElementById("listingQueue"),
  listingPreview: document.getElementById("listingPreview"),
  listingWarnings: document.getElementById("listingWarnings"),
  reportList: document.getElementById("reportList"),
  strikeBoard: document.getElementById("strikeBoard"),
  auditList: document.getElementById("auditList"),
  notificationList: document.getElementById("notificationList"),
  noticeForm: document.getElementById("noticeForm"),
  noticeTitle: document.getElementById("noticeTitle"),
  noticeMessage: document.getElementById("noticeMessage"),
  reviewDrawer: document.getElementById("reviewDrawer"),
  drawerEyebrow: document.getElementById("drawerEyebrow"),
  drawerTitle: document.getElementById("drawerTitle"),
  drawerBody: document.getElementById("drawerBody"),
  closeDrawerButton: document.getElementById("closeDrawerButton"),
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

function persistAll() {
  writeStore(STORAGE_KEYS.agents, state.agents);
  writeStore(STORAGE_KEYS.verificationLogs, state.verificationLogs);
  writeStore(STORAGE_KEYS.listings, state.listings);
  writeStore(STORAGE_KEYS.reports, state.reports);
  writeStore(STORAGE_KEYS.auditLogs, state.auditLogs);
  writeStore(STORAGE_KEYS.notifications, state.notifications);
}

function money(value) {
  return `RM ${Number(value).toLocaleString("en-MY")}`;
}

function dateTime(value) {
  return new Date(value).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" });
}

function findAgent(id) {
  return state.agents.find((agent) => agent.id === id);
}

function findListing(id) {
  return state.listings.find((listing) => listing.id === id);
}

function addAudit(action, targetType, targetId, notes) {
  state.auditLogs = [
    {
      id: `al-${Date.now()}`,
      actor: ADMIN_ID,
      action,
      targetType,
      targetId,
      notes,
      timestamp: new Date().toISOString()
    },
    ...state.auditLogs
  ];
}

function addNotification(title, message) {
  state.notifications = [
    {
      id: `nt-${Date.now()}`,
      title,
      message,
      createdAt: new Date().toISOString()
    },
    ...state.notifications
  ];
}

function scanAgent(agent) {
  const flags = [];
  const renMatches = state.agents.filter((item) => item.id !== agent.id && item.renNumber === agent.renNumber);
  const icMatches = state.agents.filter((item) => item.id !== agent.id && item.icHash === agent.icHash);

  if (renMatches.length) {
    flags.push({
      type: "duplicate_ren",
      severity: "high",
      message: `REN number also appears on ${renMatches.map((item) => item.name).join(", ")}.`
    });
  }

  if (icMatches.length) {
    flags.push({
      type: "duplicate_ic",
      severity: "high",
      message: `Same IC document signature used by ${icMatches.map((item) => item.name).join(", ")}.`
    });
  }

  if (!agent.renNumber || !agent.icDocumentUrl) {
    flags.push({
      type: "missing_kyc",
      severity: "medium",
      message: "REN or IC document is missing."
    });
  }

  return flags;
}

function scanListing(listing) {
  const flags = [];
  const average = marketAverages[listing.location] || listing.price;
  const delta = average ? ((listing.price - average) / average) * 100 : 0;
  const duplicates = state.listings.filter((item) =>
    item.id !== listing.id &&
    item.location === listing.location &&
    item.imageHash === listing.imageHash
  );

  if (delta <= -25) {
    flags.push({
      flagType: "low_price",
      severity: "high",
      message: `Price is ${Math.abs(delta).toFixed(0)}% below ${listing.location} market average.`
    });
  }

  if (listing.imageResolution < 720 || listing.blurScore > 0.4) {
    flags.push({
      flagType: "blurry_image",
      severity: listing.blurScore > 0.5 ? "high" : "medium",
      message: `${listing.imageResolution}px image quality is below QC threshold.`
    });
  }

  if (duplicates.length) {
    flags.push({
      flagType: "duplicate_listing",
      severity: "high",
      message: `Same image/location fingerprint found on ${duplicates.map((item) => item.title).join(", ")}.`
    });
  }

  return flags;
}

function runAiScan(shouldLog = true) {
  state.agents = state.agents.map((agent) => ({ ...agent, aiFlags: scanAgent(agent) }));
  state.listings = state.listings.map((listing) => ({ ...listing, aiFlags: scanListing(listing) }));
  if (shouldLog) {
    addAudit("ai_scan", "marketplace", "all", "AI duplicate identity and listing QC scan completed.");
    addNotification("AI scan completed", "Agent identity and listing QC flags were refreshed.");
  }
  persistAll();
  renderAll();
  if (shouldLog) showToast("AI scan completed");
}

function switchSection(section) {
  state.section = section;
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.section === section));
  els.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === section));
  history.replaceState(null, "", `#${section}`);
}

function renderMetrics() {
  els.pendingAgentCount.textContent = state.agents.filter((agent) => agent.status === "pending").length;
  els.pendingListingCount.textContent = state.listings.filter((listing) => listing.status === "pending_qc").length;
  els.openReportCount.textContent = state.reports.filter((report) => ["open", "investigating"].includes(report.status)).length;
  els.suspendedCount.textContent = state.agents.filter((agent) => agent.status === "suspended").length;
}

function renderAgents() {
  const agents = [...state.agents].sort((a, b) => {
    const order = { pending: 0, suspended: 1, rejected: 2, approved: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  els.agentQueue.innerHTML = agents.map((agent) => {
    const flags = agent.aiFlags || scanAgent(agent);
    return `
      <article class="table-card">
        <div class="person-cell">
          <div class="avatar"><i class="fa-solid fa-user-tie"></i></div>
          <div>
            <strong>${agent.name}</strong>
            <p>${agent.email}</p>
          </div>
        </div>
        <div>
          <strong>${agent.renNumber}</strong>
          <p>${agent.agencyName}</p>
        </div>
        <div>
          <span class="status-pill ${agent.status}">${agent.status}</span>
          <p>${flags.length ? `${flags.length} AI flag${flags.length > 1 ? "s" : ""}` : "Clear scan"}</p>
        </div>
        <div class="row-actions">
          <button class="ghost-button" data-action="review-agent" data-id="${agent.id}" type="button">Review</button>
        </div>
      </article>
    `;
  }).join("");

  const risks = state.agents
    .flatMap((agent) => (agent.aiFlags || scanAgent(agent)).map((flag) => ({ agent, flag })))
    .filter((item) => item.agent.status === "pending");

  els.agentRiskList.innerHTML = risks.length ? risks.map(({ agent, flag }) => `
    <article class="risk-item">
      <span class="severity-pill ${flag.severity}">${flag.severity}</span>
      <strong>${agent.name}</strong>
      <p>${flag.message}</p>
    </article>
  `).join("") : `<div class="risk-item"><strong>No suspicious pending identities</strong><p>Latest scan did not find duplicate REN or duplicate IC usage.</p></div>`;
}

function setActiveListing(id) {
  state.activeListingId = id;
  renderListings();
}

function renderListings() {
  const listings = [...state.listings].sort((a, b) => {
    const order = { pending_qc: 0, rejected: 1, approved: 2, draft: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });
  if (!state.activeListingId || !state.listings.some((listing) => listing.id === state.activeListingId)) {
    state.activeListingId = listings[0]?.id || null;
  }

  els.listingQueue.innerHTML = listings.map((listing) => {
    const flags = listing.aiFlags || scanListing(listing);
    return `
      <article class="listing-card ${listing.id === state.activeListingId ? "active" : ""}" data-action="select-listing" data-id="${listing.id}">
        <span class="status-pill ${listing.status}">${listing.status}</span>
        <h4>${listing.title}</h4>
        <p>${listing.location} - ${money(listing.price)}</p>
        <p>${flags.length ? `${flags.length} QC warning${flags.length > 1 ? "s" : ""}` : "No QC warnings"}</p>
      </article>
    `;
  }).join("");

  const listing = findListing(state.activeListingId);
  if (!listing) {
    els.listingPreview.innerHTML = `<div class="subtext">No listings in QC.</div>`;
    els.listingWarnings.innerHTML = "";
    return;
  }

  const agent = findAgent(listing.agentId);
  const average = marketAverages[listing.location] || listing.price;
  const flags = listing.aiFlags || scanListing(listing);
  els.listingPreview.innerHTML = `
    <img class="listing-image" src="${listing.imageUrl}" alt="${listing.title}">
    <h4>${listing.title}</h4>
    <p class="subtext">${listing.location} - Submitted by ${agent?.name || "Unknown agent"}</p>
    <div class="listing-meta-grid">
      <div><span>Asking price</span><strong>${money(listing.price)}</strong></div>
      <div><span>Market average</span><strong>${money(average)}</strong></div>
      <div><span>Image quality</span><strong>${listing.imageResolution}px</strong></div>
      <div><span>Status</span><strong>${listing.status.replace(/_/g, " ")}</strong></div>
    </div>
  `;

  els.listingWarnings.innerHTML = `
    <div class="eyebrow">AI Warnings</div>
    <h4>${flags.length ? `${flags.length} warning${flags.length > 1 ? "s" : ""}` : "Clear for approval"}</h4>
    <div class="flag-list">
      ${flags.length ? flags.map((flag) => `
        <article class="flag-card">
          <span class="severity-pill ${flag.severity}">${flag.severity}</span>
          <strong>${flag.flagType.replace(/_/g, " ")}</strong>
          <p>${flag.message}</p>
        </article>
      `).join("") : `<article class="flag-card"><strong>No AI flags</strong><p>Price, image quality, and duplicate checks are within threshold.</p></article>`}
    </div>
    <div class="drawer-actions">
      <button class="primary-button" data-action="approve-listing" data-id="${listing.id}" type="button">Approve</button>
      <button class="danger-button" data-action="reject-listing" data-id="${listing.id}" type="button">Reject</button>
    </div>
  `;
}

function renderReports() {
  const reports = [...state.reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  els.reportList.innerHTML = reports.map((report) => {
    const listing = findListing(report.listingId);
    const agent = findAgent(report.agentId);
    return `
      <article class="report-card">
        <div class="report-topline">
          <div>
            <span class="status-pill ${report.status}">${report.status}</span>
            <h4>${report.type.replace(/_/g, " ")}</h4>
            <p>${report.description}</p>
          </div>
          <time class="subtext">${dateTime(report.createdAt)}</time>
        </div>
        <p>Listing: ${listing?.title || report.listingId} - Agent: ${agent?.name || report.agentId}</p>
        <div class="row-actions">
          <button class="ghost-button" data-action="warn-agent" data-id="${report.id}" type="button">Send Warning</button>
          <button class="danger-button" data-action="suspend-listing" data-id="${report.id}" type="button">Suspend Listing</button>
          <button class="danger-button" data-action="suspend-agent-report" data-id="${report.id}" type="button">Suspend Agent</button>
          <button class="primary-button" data-action="close-report" data-id="${report.id}" type="button">Close Case</button>
        </div>
      </article>
    `;
  }).join("");

  renderStrikeBoard();
}

function renderStrikeBoard() {
  els.strikeBoard.innerHTML = state.agents.map((agent) => `
    <article class="strike-item">
      <strong>${agent.name}</strong>
      <p>${agent.status} - ${agent.strikes || 0}/3 strikes</p>
      <div class="strike-meter">
        ${[1, 2, 3].map((step) => `<span class="strike-dot ${(agent.strikes || 0) >= step ? "active" : ""}"></span>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderAuditLogs() {
  els.auditList.innerHTML = state.auditLogs.length ? state.auditLogs.map((log) => `
    <article class="audit-item">
      <div class="audit-topline">
        <strong>${log.action.replace(/_/g, " ")}</strong>
        <time>${dateTime(log.timestamp)}</time>
      </div>
      <p>${log.targetType}:${log.targetId} - ${log.notes}</p>
      <p>Admin: ${log.actor}</p>
    </article>
  `).join("") : `<div class="audit-item"><strong>No audit logs</strong><p>Admin actions will appear here.</p></div>`;
}

function renderNotifications() {
  els.notificationList.innerHTML = state.notifications.length ? state.notifications.map((notice) => `
    <article class="notification-item">
      <strong>${notice.title}</strong>
      <p>${notice.message}</p>
      <time>${dateTime(notice.createdAt)}</time>
    </article>
  `).join("") : `<div class="notification-item"><strong>No notifications</strong><p>Trust operation alerts will appear here.</p></div>`;
}

function renderAll() {
  renderMetrics();
  renderAgents();
  renderListings();
  renderReports();
  renderAuditLogs();
  renderNotifications();
}

function openDrawer(eyebrow, title, body) {
  els.drawerEyebrow.textContent = eyebrow;
  els.drawerTitle.textContent = title;
  els.drawerBody.innerHTML = body;
  els.reviewDrawer.classList.add("is-open");
  els.reviewDrawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  els.reviewDrawer.classList.remove("is-open");
  els.reviewDrawer.setAttribute("aria-hidden", "true");
}

function reviewAgent(id) {
  const agent = findAgent(id);
  if (!agent) return;
  const flags = agent.aiFlags || scanAgent(agent);
  openDrawer(
    "Agent verification",
    agent.name,
    `
      <div class="document-preview">
        <div>
          <i class="fa-solid fa-id-card"></i>
          <strong>IC document preview</strong>
          <p>${agent.icDocumentUrl}</p>
        </div>
      </div>
      <article class="drawer-card">
        <strong>REN status</strong>
        <p>${agent.renNumber} - ${agent.agencyName}</p>
        <p>Status: ${agent.status}</p>
      </article>
      <article class="drawer-card">
        <strong>AI identity flags</strong>
        ${flags.length ? flags.map((flag) => `<p><span class="severity-pill ${flag.severity}">${flag.severity}</span> ${flag.message}</p>`).join("") : `<p>No duplicate REN or IC detected.</p>`}
      </article>
      <article class="drawer-card">
        <strong>Admin note</strong>
        <textarea id="agentDecisionNote" placeholder="Required for rejection or suspension"></textarea>
      </article>
      <div class="drawer-actions">
        <button class="primary-button" data-action="approve-agent" data-id="${agent.id}" type="button">Approve</button>
        <button class="danger-button" data-action="reject-agent" data-id="${agent.id}" type="button">Reject</button>
        <button class="ghost-button" data-action="suspend-agent" data-id="${agent.id}" type="button">Suspend</button>
      </div>
    `
  );
}

function recordVerification(agentId, action, notes) {
  state.verificationLogs = [
    {
      id: `vl-${Date.now()}`,
      agentId,
      adminId: ADMIN_ID,
      action,
      notes,
      timestamp: new Date().toISOString()
    },
    ...state.verificationLogs
  ];
}

function updateAgentStatus(id, status) {
  const note = document.getElementById("agentDecisionNote")?.value.trim() || "";
  const agent = findAgent(id);
  if (!agent) return;
  state.agents = state.agents.map((item) => item.id === id ? { ...item, status } : item);
  recordVerification(id, status, note || `${status} by admin`);
  addAudit(`agent_${status}`, "agent", id, note || `${agent.name} marked ${status}.`);
  addNotification("Agent verification updated", `${agent.name} was marked ${status}.`);
  persistAll();
  renderAll();
  closeDrawer();
  showToast(`Agent ${status}`);
}

function approveListing(id) {
  const listing = findListing(id);
  if (!listing) return;
  state.listings = state.listings.map((item) => item.id === id ? { ...item, status: "approved" } : item);
  addAudit("listing_approved", "listing", id, `${listing.title} pushed to live feed.`);
  addNotification("Listing approved", `${listing.title} is live.`);
  persistAll();
  renderAll();
  showToast("Listing approved");
}

function rejectListing(id) {
  const listing = findListing(id);
  if (!listing) return;
  state.listings = state.listings.map((item) => item.id === id ? { ...item, status: "rejected" } : item);
  addAudit("listing_rejected", "listing", id, `${listing.title} rejected with QC feedback.`);
  addNotification("Listing rejected", `${listing.title} was rejected by QC.`);
  persistAll();
  renderAll();
  showToast("Listing rejected");
}

function suspendListingFromReport(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) return;
  state.listings = state.listings.map((listing) => listing.id === report.listingId ? { ...listing, status: "rejected" } : listing);
  state.reports = state.reports.map((item) => item.id === reportId ? { ...item, status: "investigating" } : item);
  addAudit("listing_suspended", "listing", report.listingId, `Suspended from report ${reportId}.`);
  addNotification("Listing suspended", `Listing ${report.listingId} was suspended from report review.`);
  persistAll();
  renderAll();
  showToast("Listing suspended");
}

function warnAgent(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) return;
  const agent = findAgent(report.agentId);
  if (!agent) return;
  const strikes = (agent.strikes || 0) + 1;
  const autoSuspend = strikes >= 3;
  state.agents = state.agents.map((item) =>
    item.id === agent.id ? { ...item, strikes, status: autoSuspend ? "suspended" : item.status } : item
  );
  state.reports = state.reports.map((item) => item.id === reportId ? { ...item, status: autoSuspend ? "resolved" : "investigating" } : item);
  addAudit(autoSuspend ? "agent_auto_suspended" : "agent_warning", "agent", agent.id, `${agent.name} now has ${strikes}/3 strikes.`);
  addNotification(autoSuspend ? "Agent auto-suspended" : "Agent warning sent", `${agent.name}: ${strikes}/3 strikes.`);
  persistAll();
  renderAll();
  showToast(autoSuspend ? "Agent auto-suspended" : "Warning sent");
}

function suspendAgentFromReport(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) return;
  updateAgentStatus(report.agentId, "suspended");
}

function closeReport(id) {
  const report = state.reports.find((item) => item.id === id);
  if (!report) return;
  state.reports = state.reports.map((item) => item.id === id ? { ...item, status: "resolved" } : item);
  addAudit("report_closed", "report", id, `${report.type} case resolved.`);
  addNotification("Report closed", `${report.type.replace(/_/g, " ")} case was closed.`);
  persistAll();
  renderAll();
  showToast("Case closed");
}

function submitNotice(event) {
  event.preventDefault();
  addNotification(els.noticeTitle.value.trim(), els.noticeMessage.value.trim());
  addAudit("notification_sent", "admin_notification", "manual", els.noticeTitle.value.trim());
  els.noticeForm.reset();
  persistAll();
  renderAll();
  showToast("Admin notice sent");
}

function resetDemo() {
  localStorage.removeItem(STORAGE_KEYS.agents);
  localStorage.removeItem(STORAGE_KEYS.verificationLogs);
  localStorage.removeItem(STORAGE_KEYS.listings);
  localStorage.removeItem(STORAGE_KEYS.reports);
  localStorage.removeItem(STORAGE_KEYS.auditLogs);
  localStorage.removeItem(STORAGE_KEYS.notifications);
  state.agents = structuredClone(seedAgents);
  state.verificationLogs = [];
  state.listings = structuredClone(seedListings);
  state.reports = structuredClone(seedReports);
  state.auditLogs = structuredClone(seedAuditLogs);
  state.notifications = structuredClone(seedNotifications);
  addAudit("demo_reset", "admin", ADMIN_ID, "Admin demo data was reset.");
  runAiScan(false);
  showToast("Admin demo reset");
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
  els.navItems.forEach((button) => {
    button.addEventListener("click", () => switchSection(button.dataset.section));
  });

  els.runScanButton.addEventListener("click", runAiScan);
  els.resetDemoButton.addEventListener("click", resetDemo);
  els.closeDrawerButton.addEventListener("click", closeDrawer);
  els.noticeForm.addEventListener("submit", submitNotice);

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-action]") : null;
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === "review-agent") reviewAgent(id);
    if (action === "approve-agent") updateAgentStatus(id, "approved");
    if (action === "reject-agent") updateAgentStatus(id, "rejected");
    if (action === "suspend-agent") updateAgentStatus(id, "suspended");
    if (action === "select-listing") setActiveListing(id);
    if (action === "approve-listing") approveListing(id);
    if (action === "reject-listing") rejectListing(id);
    if (action === "suspend-listing") suspendListingFromReport(id);
    if (action === "suspend-agent-report") suspendAgentFromReport(id);
    if (action === "warn-agent") warnAgent(id);
    if (action === "close-report") closeReport(id);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });
}

runAiScan(false);
const initialSection = location.hash.replace("#", "") || "agents";
switchSection(["agents", "listings", "reports", "audit", "notifications"].includes(initialSection) ? initialSection : "agents");
bindEvents();
