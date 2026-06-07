const STORAGE_KEYS = {
  agents: "rg_admin_agents",
  verificationLogs: "rg_admin_agent_verification_logs",
  listings: "rg_admin_listings",
  reports: "rg_admin_reports",
  auditLogs: "rg_admin_audit_logs",
  notifications: "rg_admin_notifications",
  agentListings: "kvai_agent_listings",
  buyerLiveListings: "rg_live_buyer_listings",
  adminApiKey: "rg_admin_api_key"
};

const ADMIN_ID = "admin-gatekeeper-01";

const marketAverages = window.RealtyGeniusMarketAverages || {};

const seedAgents = [
  {
    id: "ag-arvind",
    name: "Arvind Govindasamy",
    email: "arvind@realtygenius.my",
    renNumber: "REN-PENDING",
    agencyName: "RealtyGenius IQI Project Desk",
    icDocumentUrl: "profile://owner-agent/arvind-govindasamy",
    icHash: "owner-agent-arvind-govindasamy",
    status: "approved",
    strikes: 0,
    createdAt: "2026-05-16T09:00:00+08:00"
  }
];

const seedListings = window.RealtyGeniusAdminListings || [];

const seedReports = window.RealtyGeniusAdminReports || [];

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
    title: "IQI project import ready",
    message: `${seedListings.length} uploaded IQI Global projects are waiting in the Listing QC desk.`,
    createdAt: new Date().toISOString()
  }
];

const state = {
  section: "agents",
  activeListingId: null,
  activeAiImportId: null,
  enhancerHydrated: false,
  aiImports: [],
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
  pushPermissionButton: document.getElementById("pushPermissionButton"),
  pushStatus: document.getElementById("pushStatus"),
  agentQueue: document.getElementById("agentQueue"),
  agentRiskList: document.getElementById("agentRiskList"),
  listingQueue: document.getElementById("listingQueue"),
  listingPreview: document.getElementById("listingPreview"),
  listingWarnings: document.getElementById("listingWarnings"),
  aiImportAccessForm: document.getElementById("aiImportAccessForm"),
  adminApiKeyInput: document.getElementById("adminApiKeyInput"),
  saveAdminApiKeyButton: document.getElementById("saveAdminApiKeyButton"),
  refreshAiImportsButton: document.getElementById("refreshAiImportsButton"),
  aiImportStatus: document.getElementById("aiImportStatus"),
  aiImportList: document.getElementById("aiImportList"),
  aiImportPreview: document.getElementById("aiImportPreview"),
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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

function adminApiBaseUrl() {
  if (window.REALTYGENIUS_API_BASE) return window.REALTYGENIUS_API_BASE.replace(/\/+$/, "");
  if (window.REALTYGENIUS_CONFIG?.API_BASE) return window.REALTYGENIUS_CONFIG.API_BASE.replace(/\/+$/, "");
  const stored = localStorage.getItem("realtygenius_api_base");
  if (stored) return stored.replace(/\/+$/, "");
  if (["realitygenius.company", "www.realitygenius.company"].includes(window.location.hostname)) {
    return "https://api.realitygenius.company/api";
  }
  if (window.location.protocol === "file:") return "http://localhost:3000/api";
  if (["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.port !== "3000") {
    return "http://localhost:3000/api";
  }
  return `${window.location.origin}/api`;
}

function adminToken() {
  return localStorage.getItem("rg_token") || "";
}

function normalizeAdminApiKey(value = "") {
  return String(value || "").trim().replace(/^ADMIN_API_KEY\s*=\s*/i, "").trim();
}

function adminReviewApiKey() {
  const stored = normalizeAdminApiKey(localStorage.getItem(STORAGE_KEYS.adminApiKey) || "");
  if (stored && stored !== localStorage.getItem(STORAGE_KEYS.adminApiKey)) {
    localStorage.setItem(STORAGE_KEYS.adminApiKey, stored);
  }
  return stored;
}

function adminJsonHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Admin-Api-Key": adminReviewApiKey()
  };
}

function listingKey(listing) {
  return String(listing?.agentListingId || listing?.id || listing?.enhancementId || "");
}

function estimateBedrooms(listing) {
  if (Number.isFinite(Number(listing?.bedrooms))) return Number(listing.bedrooms);
  if (/studio|soho|suite/i.test(`${listing?.title || ""} ${listing?.propertyType || ""}`)) return 1;
  if (/landed|terrace|semi|bungalow/i.test(`${listing?.propertyType || ""} ${listing?.title || ""}`)) return 4;
  return 3;
}

function estimateBathrooms(listing) {
  const bedrooms = estimateBedrooms(listing);
  return bedrooms >= 4 ? 3 : bedrooms <= 1 ? 1 : 2;
}

function estimateSqft(listing) {
  if (Number.isFinite(Number(listing?.sqft)) && Number(listing.sqft) > 0) return Number(listing.sqft);
  if (/industrial|warehouse|factory/i.test(`${listing?.propertyType || ""} ${listing?.title || ""}`)) return 3200;
  if (/landed|terrace|semi|bungalow/i.test(`${listing?.propertyType || ""} ${listing?.title || ""}`)) return 2200;
  return 950;
}

function findAgentListing(adminListing) {
  const key = listingKey(adminListing);
  return readStore(STORAGE_KEYS.agentListings, []).find((item) => String(item.id) === key) || null;
}

function updateAgentListingAfterReview(adminListing, status, extras = {}) {
  const key = listingKey(adminListing);
  const listings = readStore(STORAGE_KEYS.agentListings, []);
  writeStore(
    STORAGE_KEYS.agentListings,
    listings.map((listing) => String(listing.id) === key ? {
      ...listing,
      status,
      ...extras,
      updatedAt: new Date().toISOString()
    } : listing)
  );
}

function buildBuyerListingFromApproved(adminListing) {
  const agentListing = findAgentListing(adminListing);
  const storedPayload = adminListing.buyerPayload || {};
  const source = {
    ...storedPayload,
    ...(agentListing || {})
  };
  const sqft = estimateSqft(source);
  const propertyType = source.propertyType || source.type || "Condo";
  const type = slugify(propertyType) || "condo";
  const image = source.image || adminListing.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80";
  const gallery = Array.isArray(source.gallery) && source.gallery.length
    ? source.gallery.filter((item) => item?.url || item?.image || item?.display).map((item) => ({
      ...item,
      url: item.url || item.image || item.display
    }))
    : [{ label: "Front View", required: true, url: image, status: "verified" }];

  return {
    ...storedPayload,
    id: Number(source.id || adminListing.agentListingId || adminListing.id) || Date.now(),
    agentListingId: source.id || adminListing.agentListingId || adminListing.id,
    source: "admin_approved_agent_listing",
    title: source.title || adminListing.title,
    area: source.area || adminListing.location || "Malaysia",
    location: source.address || adminListing.location || source.area || "Malaysia",
    type,
    intent: /industrial|commercial|shop|office/i.test(`${propertyType} ${source.title || ""}`) ? "investment" : "family",
    price: Number(source.price || adminListing.price || 0),
    bedrooms: estimateBedrooms(source),
    bathrooms: estimateBathrooms(source),
    beds: estimateBedrooms(source),
    baths: estimateBathrooms(source),
    sqft,
    psf: sqft ? Math.round(Number(source.price || adminListing.price || 0) / sqft) : 0,
    image,
    gallery,
    galleryCount: gallery.length,
    liveNow: Math.max(3, Number(source.enquiries || 0) + 3),
    aiScore: Number(source.confidenceScore || storedPayload.confidenceScore || 92),
    yield: Number(source.yield || 4.3),
    growth: Number(source.growth || 5.2),
    summary: source.summary || `${propertyType} in ${source.area || adminListing.location}. Approved by RealityGenius admin QC before buyer visibility.`,
    vibe: source.vibe || "Admin-approved agent listing",
    tags: [type, slugify(source.area || adminListing.location), "admin-approved"].filter(Boolean),
    badge: "admin-approved",
    verifiedType: "agent",
    verificationSource: "admin_approved",
    adminApproved: true,
    approvalStatus: "approved",
    liveStatus: "approved_live",
    confidenceScore: Number(source.confidenceScore || storedPayload.confidenceScore || 92),
    freshnessStatus: "fresh",
    createdAt: source.createdAt || adminListing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mapLink: `https://www.google.com/maps/search/${encodeURIComponent(source.address || adminListing.location || source.area || source.title || "")}`,
    modelUrl: source.modelUrl || source.arLink || "",
    arLink: source.arLink || "",
    agentId: adminListing.agentId || source.agentId || "agent-live",
    agentName: adminListing.agentName || source.agentName || "RealityGenius Agent",
    agencyName: source.agencyName || "RealityGenius Agent Network"
  };
}

function publishApprovedListingToBuyer(adminListing) {
  const buyerListing = buildBuyerListingFromApproved(adminListing);
  const key = String(buyerListing.agentListingId || buyerListing.id);
  const existing = readStore(STORAGE_KEYS.buyerLiveListings, [])
    .filter((item) => String(item.agentListingId || item.id) !== key);
  writeStore(STORAGE_KEYS.buyerLiveListings, [buyerListing, ...existing]);
}

function removeBuyerListing(adminListing) {
  const key = listingKey(adminListing);
  writeStore(
    STORAGE_KEYS.buyerLiveListings,
    readStore(STORAGE_KEYS.buyerLiveListings, []).filter((item) => String(item.agentListingId || item.id) !== key)
  );
}

function enhancementStatusToListingStatus(status) {
  if (status === "approved_live") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "pending_admin_review") return "pending_qc";
  return "draft";
}

function mapEnhancementToAdminListing(enhancement) {
  const image = enhancement.imageAnalysis || {};
  const flags = [];
  if ((enhancement.imageScore || 0) < 70) {
    flags.push({
      flagType: "image_quality",
      severity: (enhancement.imageScore || 0) < 50 ? "high" : "medium",
      message: `Image quality score is ${enhancement.imageScore || 0}/100.`
    });
  }
  if ((enhancement.seoScore || 0) < 70) {
    flags.push({
      flagType: "seo_quality",
      severity: "medium",
      message: `SEO score is ${enhancement.seoScore || 0}/100.`
    });
  }
  if (image.duplicatePhotoCount) {
    flags.push({
      flagType: "duplicate_photos",
      severity: "medium",
      message: `${image.duplicatePhotoCount} duplicate photo${image.duplicatePhotoCount === 1 ? "" : "s"} detected.`
    });
  }
  if (Array.isArray(image.missingRoomPhotos) && image.missingRoomPhotos.length) {
    flags.push({
      flagType: "missing_room_photos",
      severity: "medium",
      message: `Missing room photos: ${image.missingRoomPhotos.join(", ")}.`
    });
  }

  return {
    id: enhancement.id,
    enhancementId: enhancement.id,
    agentId: enhancement.agentId || "agent-live",
    agentName: enhancement.agentEmail || "RealityGenius Agent",
    title: enhancement.optimizedTitle || enhancement.originalTitle,
    originalTitle: enhancement.originalTitle,
    price: 0,
    location: enhancement.location || "Malaysia",
    status: enhancementStatusToListingStatus(enhancement.status),
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
    imageResolution: enhancement.imageScore >= 70 ? 1280 : 640,
    blurScore: enhancement.imageScore >= 70 ? 0.1 : 0.5,
    imageHash: `enhancer-${enhancement.id}`,
    seoScore: enhancement.seoScore,
    imageScore: enhancement.imageScore,
    optimizedDescription: enhancement.optimizedDescription,
    originalDescription: enhancement.originalDescription,
    portalOutputs: enhancement.platformOptimizations || {},
    adminNotes: enhancement.adminNotes || "",
    aiFlags: flags,
    createdAt: enhancement.createdAt || new Date().toISOString(),
    updatedAt: enhancement.updatedAt || new Date().toISOString()
  };
}

async function hydrateListingEnhancements() {
  if (state.enhancerHydrated) return;
  const token = adminToken();
  if (!token) return;
  state.enhancerHydrated = true;

  try {
    const response = await fetch(`${adminApiBaseUrl()}/listing-enhancer?scope=admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return;
    const result = await response.json();
    const remoteListings = (result.enhancements || []).map(mapEnhancementToAdminListing);
    const remoteIds = new Set(remoteListings.map((listing) => String(listing.enhancementId || listing.id)));
    state.listings = [
      ...remoteListings,
      ...state.listings.filter((listing) => !remoteIds.has(String(listing.enhancementId || listing.id)))
    ];
    persistAll();
    renderAll();
  } catch {
    state.enhancerHydrated = false;
  }
}

async function reviewRemoteEnhancement(listing, status) {
  if (!listing?.enhancementId || String(listing.enhancementId).startsWith("local-")) return null;
  const token = adminToken();
  if (!token) return null;

  const response = await fetch(`${adminApiBaseUrl()}/listing-enhancer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      mode: "admin_review",
      id: listing.enhancementId,
      status,
      adminNotes: status === "approved_live" ? "Approved by admin QC desk." : "Rejected by admin QC desk."
    })
  });

  if (!response.ok) return null;
  const result = await response.json();
  return result.enhancement ? mapEnhancementToAdminListing(result.enhancement) : null;
}

function aiImportApiUrl(path) {
  return `${adminApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function setAiImportStatus(message, tone = "") {
  if (!els.aiImportStatus) return;
  els.aiImportStatus.textContent = message;
  els.aiImportStatus.dataset.tone = tone;
}

function renderAdminKeyState() {
  const hasKey = Boolean(adminReviewApiKey());
  if (els.aiImportAccessForm) {
    els.aiImportAccessForm.dataset.trustedDevice = hasKey ? "true" : "false";
  }
  if (els.adminApiKeyInput) {
    els.adminApiKeyInput.placeholder = hasKey
      ? "Admin key saved on this device"
      : "Paste admin API key once";
    els.adminApiKeyInput.value = "";
  }
  if (els.saveAdminApiKeyButton) {
    els.saveAdminApiKeyButton.innerHTML = hasKey
      ? '<i class="fa-solid fa-rotate"></i> Update Saved Key'
      : '<i class="fa-solid fa-lock"></i> Trust This Device';
  }
}

function splitLines(value) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function aiImportStatusClass(status) {
  if (status === "approved" || status === "live") return "confirmed";
  if (status === "rejected") return "rejected";
  return "pending";
}

async function loadAiImports() {
  if (!els.aiImportList) return;
  if (!adminReviewApiKey()) {
    state.aiImports = [];
    renderAdminKeyState();
    setAiImportStatus("Paste the admin API key once. This browser will remember it.", "warn");
    renderAiImports();
    return;
  }

  renderAdminKeyState();
  setAiImportStatus("Loading Telegram AI imports...");
  try {
    const response = await fetch(aiImportApiUrl("/admin/ai-imports"), {
      headers: adminJsonHeaders()
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Unable to load AI imports.");
    state.aiImports = Array.isArray(payload.items) ? payload.items : [];
    if (!state.activeAiImportId && state.aiImports[0]) state.activeAiImportId = state.aiImports[0].id;
    setAiImportStatus(`${state.aiImports.length} AI import${state.aiImports.length === 1 ? "" : "s"} loaded. Admin key is saved on this device.`);
    renderAiImports();
  } catch (error) {
    const message = error instanceof TypeError
      ? `Backend is unreachable at ${adminApiBaseUrl()}. Your saved admin key was not the problem.`
      : error.message;
    setAiImportStatus(message, "error");
    renderAiImports();
  }
}

function renderAiImports() {
  if (!els.aiImportList || !els.aiImportPreview) return;
  const imports = state.aiImports || [];
  if (!imports.length) {
    els.aiImportList.innerHTML = '<div class="empty-state">No Telegram imports loaded yet.</div>';
    els.aiImportPreview.innerHTML = '<div class="subtext">Select an imported listing to review its AI extraction.</div>';
    return;
  }

  els.aiImportList.innerHTML = imports.map((item) => `
    <article class="report-card ${state.activeAiImportId === item.id ? "active" : ""}">
      <div>
        <strong>${escapeHtml(item.title || "Untitled import")}</strong>
        <p>${escapeHtml(item.location || "Location pending")}</p>
        <span class="chip ${aiImportStatusClass(item.status)}">${escapeHtml(item.status || "needs_review")}</span>
      </div>
      <div class="report-meta">
        <span>${Number(item.confidence_score || 0)}% confidence</span>
        <span>${escapeHtml(item.source_chat_title || item.source_chat_id || "Telegram")}</span>
      </div>
      <button class="ghost-button" data-action="select-ai-import" data-id="${item.id}" type="button">Review</button>
    </article>
  `).join("");

  const active = imports.find((item) => item.id === state.activeAiImportId) || imports[0];
  state.activeAiImportId = active?.id || null;
  if (active) renderAiImportPreview(active);
}

function renderAiImportPreview(item) {
  const extraction = item.extraction_json || {};
  const imageUrls = Array.isArray(item.image_urls) ? item.image_urls : [];
  const highlights = Array.isArray(item.highlights) ? item.highlights.join("\n") : "";
  const facilities = Array.isArray(item.facilities) ? item.facilities.join("\n") : "";
  const landmarks = Array.isArray(item.nearby_landmarks) ? item.nearby_landmarks.join("\n") : "";
  const missing = Array.isArray(item.missing_fields) ? item.missing_fields.join(", ") : "";

  els.aiImportPreview.innerHTML = `
    <div class="preview-card">
      <div class="preview-media">
        <img src="${escapeHtml(imageUrls[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80")}" alt="${escapeHtml(item.title || "AI import")}">
      </div>
      <div class="preview-body">
        <div class="chip-row">
          <span class="chip ${aiImportStatusClass(item.status)}">${escapeHtml(item.status || "needs_review")}</span>
          <span class="chip">${Number(item.confidence_score || 0)}% confidence</span>
          <span class="chip">${escapeHtml(item.source || "telegram")}</span>
        </div>
        <div class="edit-grid">
          <input class="field" id="aiImportTitle" value="${escapeHtml(item.title || "")}" placeholder="Title">
          <input class="field" id="aiImportLocation" value="${escapeHtml(item.location || "")}" placeholder="Location">
          <input class="field" id="aiImportPrice" type="number" value="${Number(item.price || 0)}" placeholder="Price">
          <input class="field" id="aiImportSqft" type="number" value="${Number(item.built_up_sqft || 0)}" placeholder="Built-up sqft">
          <input class="field" id="aiImportBedrooms" type="number" value="${item.bedrooms ?? ""}" placeholder="Bedrooms">
          <input class="field" id="aiImportBathrooms" type="number" value="${item.bathrooms ?? ""}" placeholder="Bathrooms">
          <input class="field" id="aiImportType" value="${escapeHtml(item.property_type || "")}" placeholder="Property type">
          <input class="field" id="aiImportPhone" value="${escapeHtml(item.contact_phone || "")}" placeholder="Agent phone">
          <textarea class="field" id="aiImportDescription" rows="4" placeholder="Description">${escapeHtml(item.description || "")}</textarea>
          <textarea class="field" id="aiImportImages" rows="4" placeholder="Image URLs, one per line">${escapeHtml(imageUrls.join("\n"))}</textarea>
          <textarea class="field" id="aiImportHighlights" rows="3" placeholder="Highlights">${escapeHtml(highlights)}</textarea>
          <textarea class="field" id="aiImportFacilities" rows="3" placeholder="Facilities">${escapeHtml(facilities)}</textarea>
          <textarea class="field" id="aiImportLandmarks" rows="3" placeholder="Nearby landmarks">${escapeHtml(landmarks)}</textarea>
          <textarea class="field" id="aiImportNotes" rows="3" placeholder="Admin notes">${escapeHtml(item.admin_notes || extraction.adminReviewNote || "")}</textarea>
        </div>
        <p class="subtext"><strong>Missing:</strong> ${escapeHtml(missing || "None flagged")}<br><strong>Raw:</strong> ${escapeHtml(String(item.original_text || "").slice(0, 260))}</p>
        <div class="modal-actions">
          <button class="ghost-button" data-action="save-ai-import" data-id="${item.id}" type="button">Save Edit</button>
          <button class="primary-button" data-action="approve-ai-import" data-id="${item.id}" type="button">Approve</button>
          <button class="primary-button" data-action="live-ai-import" data-id="${item.id}" type="button">Approve + Live</button>
          <button class="danger-button" data-action="reject-ai-import" data-id="${item.id}" type="button">Reject</button>
        </div>
      </div>
    </div>
  `;
}

function collectAiImportEdits() {
  return {
    title: document.getElementById("aiImportTitle")?.value.trim(),
    location: document.getElementById("aiImportLocation")?.value.trim(),
    price: Number(document.getElementById("aiImportPrice")?.value || 0),
    builtUpSqft: Number(document.getElementById("aiImportSqft")?.value || 0),
    bedrooms: Number(document.getElementById("aiImportBedrooms")?.value || 0),
    bathrooms: Number(document.getElementById("aiImportBathrooms")?.value || 0),
    propertyType: document.getElementById("aiImportType")?.value.trim(),
    contactPhone: document.getElementById("aiImportPhone")?.value.trim(),
    description: document.getElementById("aiImportDescription")?.value.trim(),
    imageUrls: splitLines(document.getElementById("aiImportImages")?.value),
    highlights: splitLines(document.getElementById("aiImportHighlights")?.value),
    facilities: splitLines(document.getElementById("aiImportFacilities")?.value),
    nearbyLandmarks: splitLines(document.getElementById("aiImportLandmarks")?.value)
  };
}

async function reviewAiImport(id, action) {
  if (!adminReviewApiKey()) {
    renderAdminKeyState();
    setAiImportStatus("Paste the admin API key once. This browser will remember it.", "warn");
    return;
  }

  setAiImportStatus(`Saving ${action}...`);
  try {
    const response = await fetch(aiImportApiUrl("/admin/ai-imports/review"), {
      method: "POST",
      headers: adminJsonHeaders(),
      body: JSON.stringify({
        id,
        action,
        edits: collectAiImportEdits(),
        adminNotes: document.getElementById("aiImportNotes")?.value.trim() || "",
        reviewedBy: ADMIN_ID
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Unable to review AI import.");
    const item = payload.item;
    state.aiImports = state.aiImports.map((current) => current.id === id ? item : current);
    if (!state.aiImports.some((current) => current.id === id) && item) state.aiImports = [item, ...state.aiImports];
    state.activeAiImportId = item?.id || id;
    renderAiImports();
    setAiImportStatus(`Import ${action} saved.`);
    showToast(`AI import ${action} saved`);
  } catch (error) {
    const message = error instanceof TypeError
      ? `Backend is unreachable at ${adminApiBaseUrl()}. Your saved admin key was not the problem.`
      : error.message;
    setAiImportStatus(message, "error");
  }
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
  window.RealtyGeniusPush?.notify(title, message, {
    tag: `rg-admin-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    url: location.origin && location.origin !== "null"
      ? `${location.origin}/backend/admin.html`
      : new URL("admin.html", location.href).href
  });
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
  if (section === "ai-imports") loadAiImports();
}

function renderMetrics() {
  const pendingImports = state.aiImports.filter((item) => item.status === "needs_review").length;
  els.pendingAgentCount.textContent = state.agents.filter((agent) => agent.status === "pending").length;
  els.pendingListingCount.textContent = state.listings.filter((listing) => listing.status === "pending_qc").length + pendingImports;
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
    <p class="subtext">${listing.location} - Submitted by ${agent?.name || listing.agentName || "Unknown agent"}</p>
    <div class="listing-meta-grid">
      <div><span>Asking price</span><strong>${listing.price ? money(listing.price) : "Agent draft"}</strong></div>
      <div><span>Market average</span><strong>${money(average)}</strong></div>
      <div><span>Image quality</span><strong>${listing.imageScore ? `${listing.imageScore}/100` : `${listing.imageResolution}px`}</strong></div>
      <div><span>SEO score</span><strong>${listing.seoScore ?? "Manual QC"}</strong></div>
      <div><span>Status</span><strong>${listing.status.replace(/_/g, " ")}</strong></div>
    </div>
    ${listing.optimizedDescription ? `<article class="drawer-card"><strong>Enhanced description</strong><p>${listing.optimizedDescription}</p></article>` : ""}
  `;

  els.listingWarnings.innerHTML = `
    <div class="eyebrow">AI Warnings</div>
    <h4>${flags.length ? `${flags.length} warning${flags.length > 1 ? "s" : ""}` : "Clear for approval"}</h4>
    <div class="flag-list">
      ${flags.length ? flags.map((flag) => `
        <article class="flag-card">
          <span class="severity-pill ${flag.severity}">${flag.severity}</span>
          <strong>${(flag.flagType || flag.flag_type || "qc_flag").replace(/_/g, " ")}</strong>
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
  renderAiImports();
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

async function approveListing(id) {
  const listing = findListing(id);
  if (!listing) return;
  const remote = await reviewRemoteEnhancement(listing, "approved_live");
  const approvedListing = { ...listing, ...(remote || {}), status: "approved", approvedAt: new Date().toISOString() };
  state.listings = state.listings.map((item) => item.id === id ? approvedListing : item);
  if (remote) {
    state.listings = state.listings.map((item) => item.id === id ? { ...remote, status: "approved" } : item);
  }
  publishApprovedListingToBuyer(approvedListing);
  updateAgentListingAfterReview(approvedListing, "Live", {
    adminApproved: true,
    approvalStatus: "approved",
    liveStatus: "approved_live",
    verificationSource: "admin_approved",
    approvedAt: approvedListing.approvedAt
  });
  addAudit("listing_approved", "listing", id, `${listing.title} pushed to live feed.`);
  addNotification("Listing approved", `${listing.title} is live.`);
  persistAll();
  renderAll();
  showToast("Listing approved");
}

async function rejectListing(id) {
  const listing = findListing(id);
  if (!listing) return;
  const remote = await reviewRemoteEnhancement(listing, "rejected");
  const rejectedListing = { ...listing, ...(remote || {}), status: "rejected", rejectedAt: new Date().toISOString() };
  state.listings = state.listings.map((item) => item.id === id ? rejectedListing : item);
  if (remote) {
    state.listings = state.listings.map((item) => item.id === id ? { ...remote, status: "rejected" } : item);
  }
  removeBuyerListing(rejectedListing);
  updateAgentListingAfterReview(rejectedListing, "Rejected", {
    adminApproved: false,
    approvalStatus: "rejected",
    liveStatus: "rejected",
    verificationSource: "agent",
    rejectedAt: rejectedListing.rejectedAt
  });
  addAudit("listing_rejected", "listing", id, `${listing.title} rejected with QC feedback.`);
  addNotification("Listing rejected", `${listing.title} was rejected by QC.`);
  persistAll();
  renderAll();
  showToast("Listing rejected");
}

function suspendListingFromReport(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) return;
  const listing = state.listings.find((item) => item.id === report.listingId);
  state.listings = state.listings.map((listing) => listing.id === report.listingId ? { ...listing, status: "rejected" } : listing);
  state.reports = state.reports.map((item) => item.id === reportId ? { ...item, status: "investigating" } : item);
  if (listing) {
    removeBuyerListing(listing);
    updateAgentListingAfterReview(listing, "Rejected", {
      adminApproved: false,
      approvalStatus: "rejected",
      liveStatus: "rejected",
      verificationSource: "agent"
    });
  }
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
  window.RealtyGeniusPush?.installButton(els.pushPermissionButton, (result) => {
    if (result === "granted") showToast("Admin push notifications enabled");
    else if (result === "denied") showToast("Browser blocked push notifications");
    else showToast("Push notifications are unavailable here");
  });
  els.closeDrawerButton.addEventListener("click", closeDrawer);
  els.noticeForm.addEventListener("submit", submitNotice);
  els.aiImportAccessForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const key = normalizeAdminApiKey(els.adminApiKeyInput?.value);
    if (!key) {
      setAiImportStatus("Paste the admin API key once first.", "warn");
      return;
    }
    localStorage.setItem(STORAGE_KEYS.adminApiKey, key);
    renderAdminKeyState();
    setAiImportStatus("Trusted device saved. You will not need to re-enter the admin key on this browser.");
    loadAiImports();
  });
  els.refreshAiImportsButton?.addEventListener("click", loadAiImports);

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
    if (action === "select-ai-import") {
      state.activeAiImportId = id;
      renderAiImports();
    }
    if (action === "save-ai-import") reviewAiImport(id, "edit");
    if (action === "approve-ai-import") reviewAiImport(id, "approve");
    if (action === "live-ai-import") reviewAiImport(id, "live");
    if (action === "reject-ai-import") reviewAiImport(id, "reject");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });
}

runAiScan(false);
const initialSection = location.hash.replace("#", "") || "agents";
renderAdminKeyState();
switchSection(["agents", "listings", "ai-imports", "reports", "audit", "notifications"].includes(initialSection) ? initialSection : "agents");
bindEvents();
hydrateListingEnhancements();
