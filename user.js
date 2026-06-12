const STORAGE_KEYS = {
  favorites: "kvai_user_favorites",
  views: "kvai_user_views",
  bookings: "kvai_user_bookings",
  notifications: "kvai_user_notifications",
  buyerProfile: "kvai_user_buyer_profile",
  feedMode: "kvai_user_feed_mode",
  guessGame: "kvai_user_guess_game",
  communityNotes: "kvai_user_community_notes",
  savedSearches: "kvai_user_saved_searches",
  gamification: "rg_user_gamification",
  leakProofDeals: "kvai_leak_proof_deals",
  buyerLiveListings: "rg_live_buyer_listings",
  backendBuyerListings: "rg_backend_buyer_listings",
  globalAlert: "rg_global_platform_alert",
  algorithmControls: "rg_master_algorithm_controls"
};

const DEFAULT_MASTER_ALGORITHM = {
  paidAdsBoost: 20,
  staleListingPenalty: -50,
  highYieldInvestorPriority: 35
};

const BASE_PROPERTIES = window.RealtyGeniusPropertyListings || [];
const FORCE_BACKEND_BUYER_FEED = ["realitygenius.company", "www.realitygenius.company"].includes(window.location.hostname);
let backendListingFeedReady = FORCE_BACKEND_BUYER_FEED;

function readJsonStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function isAdminApprovedLiveListing(item) {
  const approvalStatus = String(item?.approvalStatus || item?.liveStatus || item?.status || "").toLowerCase();
  return Boolean(
    item?.adminApproved === true
    || item?.verificationSource === "admin_approved"
    || approvalStatus === "approved"
    || approvalStatus === "approved_live"
  );
}

function mergeLiveProperties(baseProperties = BASE_PROPERTIES) {
  const liveSourceKey = backendListingFeedReady ? STORAGE_KEYS.backendBuyerListings : STORAGE_KEYS.buyerLiveListings;
  const liveListings = readJsonStore(liveSourceKey, [])
    .filter((item) => item && item.title && Number(item.price || 0) > 0 && isAdminApprovedLiveListing(item))
    .map((item) => ({
      ...item,
      source: item.source || "admin_approved_agent_listing",
      verifiedType: item.verifiedType || "agent",
      verificationSource: item.verificationSource || "admin_approved",
      freshnessStatus: item.freshnessStatus || "fresh",
      confidenceScore: Number(item.confidenceScore || item.aiScore || 88),
      aiScore: Number(item.aiScore || item.confidenceScore || 88),
      liveNow: Number(item.liveNow || 4),
      adminApproved: true,
      approvalStatus: "approved",
      liveStatus: "approved_live",
      summary: item.summary || "Fresh live listing approved by RealityGenius admin QC."
    }));
  if (backendListingFeedReady) return liveListings;
  const liveIds = new Set(liveListings.map((item) => String(item.id)));
  return [
    ...liveListings,
    ...baseProperties.filter((item) => !liveIds.has(String(item.id)))
  ];
}

let properties = mergeLiveProperties();

const PROPERTY_GALLERY_SLOTS = [
  { label: "Front View", required: true },
  { label: "Top View", required: true },
  { label: "Room 1", required: true },
  { label: "Bathroom", required: true },
  { label: "Kitchen", required: true },
  { label: "Living Area", required: false },
  { label: "Room 2", required: false },
  { label: "Facilities", required: false },
  { label: "Parking / Lobby", required: false },
  { label: "Balcony / View", required: false }
];

const state = {
  filter: "all",
  search: "",
  sort: "recommended",
  feedMode: readStore(STORAGE_KEYS.feedMode, "grid"),
  activePropertyId: null,
  visibleCount: 6,
  pageSize: 4,
  favorites: readStore(STORAGE_KEYS.favorites, []),
  views: readStore(STORAGE_KEYS.views, {}),
  bookings: readStore(STORAGE_KEYS.bookings, []),
  notifications: readStore(STORAGE_KEYS.notifications, seedNotifications()),
  buyerProfile: readStore(STORAGE_KEYS.buyerProfile, { name: "", phone: "" }),
  guessGame: readStore(STORAGE_KEYS.guessGame, {}),
  communityNotes: readStore(STORAGE_KEYS.communityNotes, seedCommunityNotes()),
  savedSearches: readStore(STORAGE_KEYS.savedSearches, []),
  gamification: readStore(STORAGE_KEYS.gamification, seedGamification()),
  locationFallbacks: {},
  locationFallbackPending: {},
  locationView: "maps"
};

const els = {
  favoritesButton: document.getElementById("favoritesButton"),
  notificationsButton: document.getElementById("notificationsButton"),
  favoritesCount: document.getElementById("favoritesCount"),
  notificationsCount: document.getElementById("notificationsCount"),
  propertyCount: document.getElementById("propertyCount"),
  savedCount: document.getElementById("savedCount"),
  bookingCount: document.getElementById("bookingCount"),
  searchInput: document.getElementById("searchInput"),
  sortSelect: document.getElementById("sortSelect"),
  saveSearchButton: document.getElementById("saveSearchButton"),
  searchAlertStrip: document.getElementById("searchAlertStrip"),
  gridFeedButton: document.getElementById("gridFeedButton"),
  videoFeedButton: document.getElementById("videoFeedButton"),
  propertyGrid: document.getElementById("propertyGrid"),
  videoFeed: document.getElementById("videoFeed"),
  recommendationGrid: document.getElementById("recommendationGrid"),
  personalizedSection: document.getElementById("personalizedSection"),
  personalizedGrid: document.getElementById("personalizedGrid"),
  personalizedReason: document.getElementById("personalizedReason"),
  savedGrid: document.getElementById("savedGrid"),
  favoritesDrawerList: document.getElementById("favoritesDrawerList"),
  notificationsDrawerList: document.getElementById("notificationsDrawerList"),
  favoritesDrawer: document.getElementById("favoritesDrawer"),
  notificationsDrawer: document.getElementById("notificationsDrawer"),
  recommendationTitle: document.getElementById("recommendationTitle"),
  recommendationText: document.getElementById("recommendationText"),
  recommendationMeta: document.getElementById("recommendationMeta"),
  brainProgressLabel: document.getElementById("brainProgressLabel"),
  brainUnlockLabel: document.getElementById("brainUnlockLabel"),
  brainProgressFill: document.getElementById("brainProgressFill"),
  engagementList: document.getElementById("engagementList"),
  pushPermissionButton: document.getElementById("pushPermissionButton"),
  pushStatus: document.getElementById("pushStatus"),
  gamificationPanel: document.getElementById("gamificationPanel"),
  xpValue: document.getElementById("xpValue"),
  levelValue: document.getElementById("levelValue"),
  streakValue: document.getElementById("streakValue"),
  questList: document.getElementById("questList"),
  badgeList: document.getElementById("badgeList"),
  achievementMeter: document.getElementById("achievementMeter"),
  signalBadge: document.getElementById("signalBadge"),
  feedLoading: document.getElementById("feedLoading"),
  feedSentinel: document.getElementById("feedSentinel"),
  propertyModal: document.getElementById("propertyModal"),
  modalBadge: document.getElementById("modalBadge"),
  modalTitle: document.getElementById("modalTitle"),
  modalLocation: document.getElementById("modalLocation"),
  modalSummary: document.getElementById("modalSummary"),
  modalImage: document.getElementById("modalImage"),
  modalGallery: document.getElementById("modalGallery"),
  modalStats: document.getElementById("modalStats"),
  modalAiReasons: document.getElementById("modalAiReasons"),
  modalRisk: document.getElementById("modalRisk"),
  modalOffer: document.getElementById("modalOffer"),
  modalRoi: document.getElementById("modalRoi"),
  modalSaveAction: document.getElementById("modalSaveAction"),
  modalContactAction: document.getElementById("modalContactAction"),
  toggleArButton: document.getElementById("toggleArButton"),
  resetArButton: document.getElementById("resetArButton"),
  arViewer: document.getElementById("arViewer"),
  arFallback: document.getElementById("arFallback"),
  arStatus: document.getElementById("arStatus"),
  arTooltip: document.getElementById("arTooltip"),
  hiddenArLaunch: document.getElementById("hiddenArLaunch"),
  bookingForm: document.getElementById("bookingForm"),
  bookingName: document.getElementById("bookingName"),
  bookingPhone: document.getElementById("bookingPhone"),
  bookingDate: document.getElementById("bookingDate"),
  bookingTime: document.getElementById("bookingTime"),
  bookingStatus: document.getElementById("bookingStatus"),
  negotiationState: document.getElementById("negotiationState"),
  negotiationSuggestion: document.getElementById("negotiationSuggestion"),
  negotiationLocked: document.getElementById("negotiationLocked"),
  negotiationForm: document.getElementById("negotiationForm"),
  negotiationName: document.getElementById("negotiationName"),
  negotiationPhone: document.getElementById("negotiationPhone"),
  negotiationOffer: document.getElementById("negotiationOffer"),
  acceptNegotiationButton: document.getElementById("acceptNegotiationButton"),
  rejectNegotiationButton: document.getElementById("rejectNegotiationButton"),
  negotiationThread: document.getElementById("negotiationThread"),
  dealRoomStatus: document.getElementById("dealRoomStatus"),
  escrowStatus: document.getElementById("escrowStatus"),
  escrowAmount: document.getElementById("escrowAmount"),
  escrowReference: document.getElementById("escrowReference"),
  payBookingFeeButton: document.getElementById("payBookingFeeButton"),
  loanStatus: document.getElementById("loanStatus"),
  startLoanPackButton: document.getElementById("startLoanPackButton"),
  submitPartnerBankButton: document.getElementById("submitPartnerBankButton"),
  offerStatus: document.getElementById("offerStatus"),
  offerPreview: document.getElementById("offerPreview"),
  generateOfferButton: document.getElementById("generateOfferButton"),
  buyerSignOfferButton: document.getElementById("buyerSignOfferButton"),
  dealRoomTimeline: document.getElementById("dealRoomTimeline"),
  timelineButton: document.getElementById("timelineButton"),
  roastButton: document.getElementById("roastButton"),
  timelineOutput: document.getElementById("timelineOutput"),
  roastOutput: document.getElementById("roastOutput"),
  notesList: document.getElementById("notesList"),
  notesForm: document.getElementById("notesForm"),
  noteInput: document.getElementById("noteInput"),
  toast: document.getElementById("toast")
};

let feedProperties = properties.filter((property) => !property.secretOnly);
const AREA_NEARBY_MAP = {
  "Bagan Serai": ["Bukit Mertajam", "Nibong Tebal", "Simpang Ampat"],
  "Bayan Lepas": ["Pulau Pinang", "Simpang Ampat", "Seberang Perai"],
  "Petaling Jaya": ["Subang Jaya", "Seri Kembangan", "Bayan Lepas"],
  "Seri Kembangan": ["Petaling Jaya", "Subang Jaya", "Simpang Ampat"],
  "Subang Jaya": ["Petaling Jaya", "Seri Kembangan", "Bayan Lepas"],
  "Seberang Perai": ["Simpang Ampat", "Bukit Mertajam", "Pulau Pinang"],
  "Simpang Ampat": ["Seberang Perai", "Bukit Mertajam", "Nibong Tebal"],
  "Pulau Pinang": ["Bayan Lepas", "Simpang Ampat", "Seberang Perai"],
  "Bukit Mertajam": ["Simpang Ampat", "Seberang Perai", "Nibong Tebal"],
  "Nibong Tebal": ["Simpang Ampat", "Bukit Mertajam", "Bagan Serai"]
};
const LOCATION_INTENT_RULES = [
  {
    terms: ["mrt", "lrt", "station", "komuter", "monorail"],
    label: "Transit insight",
    body: "This looks transit-led. Compare against our commuter stock first so you can judge rental depth, daily travel friction, and resale demand before waiting for an exact match."
  },
  {
    terms: ["school", "hospital", "mall", "university", "college", "office", "landmark"],
    label: "Landmark insight",
    body: "This looks landmark-led. The right move is to benchmark surrounding homes against the landmark, then shortlist nearby stock that already has verified listing data."
  },
  {
    terms: ["jalan", "jln", "taman", "lorong", "persiaran", "residence", "residensi", "condo", "apartment"],
    label: "Address insight",
    body: "This looks like a specific address. We should treat it as a sourcing request and use nearby verified listings as price and lifestyle anchors while agents chase exact supply."
  }
];
const PROPERTY_CLIP_LIBRARY = [
  "https://cdn.coverr.co/videos/coverr-aerial-view-of-a-neighborhood-1560085184544?download=1080p",
  "https://cdn.coverr.co/videos/coverr-modern-apartment-building-1566976771716?download=1080p",
  "https://cdn.coverr.co/videos/coverr-city-skyline-at-sunset-1576767609835?download=1080p",
  "https://cdn.coverr.co/videos/coverr-looking-up-at-modern-buildings-1566976777763?download=1080p"
];
let feedObserver = null;
let feedLoadingTimer = null;
let negotiationTypingTimer = null;
let arPromptTimer = null;
let arPromptShown = false;
let videoFeedObserver = null;

const arModule = new window.PropertyARModule({
  viewer: els.arViewer,
  fallback: els.arFallback,
  launchButton: els.toggleArButton,
  resetButton: els.resetArButton,
  status: els.arStatus,
  hiddenLaunch: els.hiddenArLaunch
});

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function userApiBaseUrl() {
  if (window.REALTYGENIUS_API_BASE) return window.REALTYGENIUS_API_BASE.replace(/\/+$/, "");
  if (window.REALTYGENIUS_CONFIG?.API_BASE) return window.REALTYGENIUS_CONFIG.API_BASE.replace(/\/+$/, "");
  const stored = localStorage.getItem("realtygenius_api_base");
  if (stored) return stored.replace(/\/+$/, "");
  if (["realitygenius.company", "www.realitygenius.company"].includes(window.location.hostname)) {
    return "https://hh-empire.onrender.com/api";
  }
  if (window.location.protocol === "file:") return "http://localhost:3000/api";
  if (["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.port !== "3000") {
    return "http://localhost:3000/api";
  }
  return `${window.location.origin}/api`;
}

function userApiUrl(path) {
  const base = userApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${base}${normalizedPath.slice(4)}`;
  }
  return `${base}${normalizedPath}`;
}

async function hydrateBackendLiveListings() {
  try {
    const response = await fetch(userApiUrl("/properties"), { headers: { "Accept": "application/json" } });
    if (!response.ok) return;
    const payload = await response.json();
    backendListingFeedReady = true;
    const remoteLive = (Array.isArray(payload) ? payload : payload.items || [])
      .filter((item) => {
        if (item?.source === "telegram_ai_import") return isAdminApprovedLiveListing(item);
        return item?.source === "agent_live_upload" || item?.badge === "live-agent" || isAdminApprovedLiveListing(item);
      });
    writeStore(STORAGE_KEYS.backendBuyerListings, remoteLive);
    writeStore(STORAGE_KEYS.buyerLiveListings, remoteLive);
    refreshLiveBuyerListings(false);
    resetFeedWindow();
    renderDashboard();
  } catch (error) {
    if (window.RGLogError) window.RGLogError(error, { feature: "buyer_live_listing_hydration" });
  }
}

function refreshLiveBuyerListings(shouldRender = false) {
  properties = mergeLiveProperties();
  feedProperties = properties.filter((property) => !property.secretOnly);
  state.favorites = state.favorites.filter((id) => properties.some((property) => property.id === id));
  if (!shouldRender) return;
  resetFeedWindow();
  renderDashboard();
  showToast("Live agent listings updated");
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem("rg_session") || "null");
  } catch {
    return null;
  }
}

function hasBuyerSession() {
  const session = readSession();
  const token = String(session?.token || "");
  return Boolean(session && token && session.role === "user");
}

function loginForCurrentExplore() {
  const next = `${window.location.pathname || "/user.html"}${window.location.search || ""}${window.location.hash || ""}`;
  const query = new URLSearchParams({
    role: "user",
    next
  });
  window.location.assign(`/login.html?${query.toString()}`);
}

function requireBuyerSessionForExplore() {
  if (hasBuyerSession()) return true;
  loginForCurrentExplore();
  return false;
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderGlobalPlatformAlert() {
  const alert = readStore(STORAGE_KEYS.globalAlert, null);
  let banner = document.getElementById("globalPlatformAlert");
  if (!alert?.active) {
    banner?.remove();
    return;
  }

  if (!banner) {
    banner = document.createElement("div");
    banner.id = "globalPlatformAlert";
    banner.className = "global-platform-alert";
    document.body.prepend(banner);
  }
  banner.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i><span>${alert.message}</span>`;
}

function seedNotifications() {
  return [
    {
      id: Date.now() - 10000,
      title: "Buyer feed activated",
      message: "Open a few listings, save the strongest ones, and the recommendation engine will sharpen your next moves.",
      createdAt: new Date().toISOString(),
      read: false
    }
  ];
}

function seedCommunityNotes() {
  return window.RealtyGeniusCommunityNotes || {
    1: [
      { id: 101, author: "Source check", text: "Imported from the IQI Global CSV. Confirm current package, unit type, and developer promo before booking.", createdAt: new Date(Date.now() - 86400000).toISOString() }
    ],
    3: [
      { id: 103, author: "PJ buyer", text: "Useful Klang Valley benchmark because the CSV includes starting price, built-up size, and completion timing.", createdAt: new Date(Date.now() - 54000000).toISOString() }
    ],
    6: [
      { id: 104, author: "Industrial buyer", text: "Large built-up projects need a different lens: access, loading, business use, and financing terms matter more than bedrooms.", createdAt: new Date(Date.now() - 42000000).toISOString() }
    ],
    10: [
      { id: 105, author: "Family shortlist", text: "Garden Villa style projects should be checked for layout, maintenance, and township amenities before final comparison.", createdAt: new Date(Date.now() - 26000000).toISOString() }
    ]
  };
}

function seedGamification() {
  return {
    xp: 0,
    streak: 0,
    lastActiveDate: "",
    awarded: {}
  };
}

function money(value) {
  return value >= 1000000 ? `RM ${(value / 1000000).toFixed(2)}M` : `RM ${(value / 1000).toFixed(0)}K`;
}

function fullMoney(value) {
  return `RM ${Number(value).toLocaleString("en-MY")}`;
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

function escapeAttr(value = "") {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function getPropertyGallery(property) {
  const sourceGallery = Array.isArray(property.gallery) ? property.gallery : [];
  const sourceByLabel = sourceGallery.reduce((map, item) => {
    if (item?.label) map.set(String(item.label).toLowerCase(), item);
    return map;
  }, new Map());

  const normalized = PROPERTY_GALLERY_SLOTS.map((slot, index) => {
    const source = sourceByLabel.get(slot.label.toLowerCase()) || sourceGallery[index] || {};
    const fallbackFrontImage = index === 0 ? property.image : "";
    const url = String(source.url || source.display || source.image || fallbackFrontImage || "").trim();
    const status = url ? (source.status || "verified") : "pending_agent_upload";
    return {
      ...slot,
      ...source,
      label: source.label || slot.label,
      required: slot.required,
      url,
      status,
      verified: Boolean(url) && status !== "pending_agent_upload"
    };
  });

  const extras = sourceGallery.slice(PROPERTY_GALLERY_SLOTS.length).map((item, index) => ({
    label: item.label || `Extra ${index + 1}`,
    required: false,
    url: String(item.url || item.display || item.image || "").trim(),
    status: item.status || (item.url ? "verified" : "pending_agent_upload"),
    verified: Boolean(item.url)
  }));

  return [...normalized, ...extras];
}

function getGalleryCompleteness(property) {
  const gallery = getPropertyGallery(property);
  const verified = gallery.filter((item) => item.url && item.status !== "pending_agent_upload").length;
  const requiredMissing = gallery.filter((item) => item.required && (!item.url || item.status === "pending_agent_upload")).length;
  return { gallery, verified, requiredMissing, total: gallery.length };
}

function getHeroImage(property) {
  const { gallery } = getGalleryCompleteness(property);
  return gallery.find((item) => item.url)?.url || property.image || "";
}

function renderGallerySlot(slot, index, activeIndex = 0) {
  const isActive = index === activeIndex;
  const pending = !slot.url || slot.status === "pending_agent_upload";
  return `
    <button class="gallery-thumb ${isActive ? "is-active" : ""} ${pending ? "is-pending" : ""}" data-action="select-gallery-image" data-index="${index}" type="button">
      ${slot.url ? `<img src="${escapeAttr(slot.url)}" alt="${escapeAttr(slot.label)}">` : `<span class="gallery-thumb-placeholder"><i class="fa-solid fa-image"></i></span>`}
      <span>${escapeHtml(slot.label)}</span>
      ${slot.required ? `<strong>Required</strong>` : ""}
    </button>
  `;
}

function renderFeedGalleryMarkup(property) {
  const { gallery, verified, requiredMissing, total } = getGalleryCompleteness(property);
  return `
    <div class="feed-gallery-summary">
      <span><i class="fa-solid fa-images"></i> ${verified}/${total} photos ready</span>
      <span>${requiredMissing ? `${requiredMissing} required pending` : "Main 5 complete"}</span>
    </div>
    <div class="feed-gallery-strip" aria-label="Main property photo labels">
      ${gallery.slice(0, 5).map((slot) => `
        <div class="feed-gallery-chip ${slot.url && slot.status !== "pending_agent_upload" ? "" : "is-pending"}">
          ${slot.url ? `<img src="${escapeAttr(slot.url)}" alt="${escapeAttr(slot.label)}">` : `<i class="fa-solid fa-image"></i>`}
          <span>${escapeHtml(slot.label)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderModalGallery(property, activeIndex = 0) {
  const { gallery, verified, requiredMissing, total } = getGalleryCompleteness(property);
  const activeSlot = gallery[activeIndex] || gallery.find((item) => item.url) || gallery[0];
  els.modalImage.src = activeSlot?.url || property.image || "";
  els.modalImage.alt = `${property.title} - ${activeSlot?.label || "Property preview"}`;

  if (els.modalGallery) {
    els.modalGallery.innerHTML = `
      <div class="modal-gallery-head">
        <strong>${verified}/${total} photos ready</strong>
        <span>${requiredMissing ? `${requiredMissing} required agent uploads pending` : "Required front, top, room, bath, kitchen uploaded"}</span>
      </div>
      <div class="modal-gallery-grid">
        ${gallery.map((slot, index) => renderGallerySlot(slot, index, activeIndex)).join("")}
      </div>
    `;
  }
}

function selectModalGalleryImage(index) {
  if (state.activePropertyId == null) return;
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property) return;
  renderModalGallery(property, index);
}

function getMapsQuery(query) {
  const trimmed = query.trim();
  return /malaysia/i.test(trimmed) ? trimmed : `${trimmed}, Malaysia`;
}

function getGoogleMapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getMapsQuery(query))}`;
}

function getGoogleMapsEmbedUrl(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(getMapsQuery(query))}&output=embed`;
}

function getGoogleEarthUrl(query) {
  return `https://earth.google.com/web/search/${encodeURIComponent(getMapsQuery(query))}`;
}

function getLocationFallbackCacheKey(query) {
  return `${state.filter}:${query.trim().toLowerCase()}`;
}

function getApiBaseUrl() {
  if (window.REALTYGENIUS_API_BASE) return window.REALTYGENIUS_API_BASE;
  if (window.REALTYGENIUS_CONFIG?.API_BASE) return window.REALTYGENIUS_CONFIG.API_BASE;
  const stored = localStorage.getItem("realtygenius_api_base");
  if (stored) return stored;
  if (["realitygenius.company", "www.realitygenius.company"].includes(window.location.hostname)) {
    return "https://hh-empire.onrender.com/api";
  }
  return window.location.protocol === "file:" ? "http://localhost:3000" : window.location.origin;
}

function getApiUrl(path) {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${base}${normalizedPath.slice(4)}`;
  }
  return `${base}${normalizedPath}`;
}

async function sendLeadAutomation(payload) {
  try {
    const response = await fetch(getApiUrl("/api/leads"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    });
    if (!response.ok) throw new Error(`Lead automation failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[RealityGenius] Lead automation queued locally only:", error.message);
    return null;
  }
}

function buildLeadAutomationPayload(property, overrides = {}) {
  const profile = getInterestProfile();
  return {
    propertyId: property?.id,
    propertyTitle: property?.title,
    propertyArea: property?.area || property?.location,
    propertyPrice: property?.price,
    buyerName: state.buyerProfile.name || overrides.buyerName || "Website visitor",
    buyerPhone: state.buyerProfile.phone || overrides.buyerPhone || "",
    message: overrides.message || `Interested in ${property?.title || "a RealityGenius property"}.`,
    inquiryType: overrides.inquiryType || "property_inquiry",
    source: overrides.source || "user_dashboard",
    bookingDate: overrides.bookingDate || "",
    bookingTime: overrides.bookingTime || "",
    offerPrice: overrides.offerPrice || null,
    behaviorIntent: profile.intent || state.filter,
    behaviorPreference: getPreferenceLine(),
    viewedCount: Object.values(state.views).reduce((sum, count) => sum + count, 0),
    savedCount: state.favorites.length
  };
}

async function requestBackendLocationFallback(query) {
  const normalized = query.trim();
  if (normalized.length < 2) return;
  const key = getLocationFallbackCacheKey(normalized);
  if (state.locationFallbacks[key] || state.locationFallbackPending[key]) return;

  state.locationFallbackPending[key] = true;
  try {
    const response = await fetch(getApiUrl("/api/search/location-fallback"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: normalized,
        filter: state.filter,
        source: "user.html"
      })
    });
    if (!response.ok) throw new Error(`Location fallback failed: ${response.status}`);
    state.locationFallbacks[key] = await response.json();
  } catch (error) {
    state.locationFallbacks[key] = { error: true, message: error.message };
  } finally {
    delete state.locationFallbackPending[key];
    if (state.search.trim() === normalized && !filteredProperties().length) {
      renderProperties();
    }
  }
}

function getPropertyClipUrl(property) {
  return PROPERTY_CLIP_LIBRARY[(property.id - 1) % PROPERTY_CLIP_LIBRARY.length];
}

function getPropertyClipLabel(property) {
  if (property.intent === "luxury") return "Luxury walkthrough reel";
  if (property.intent === "investment") return "AI yield and neighborhood reel";
  if (property.intent === "family") return "Family-lifestyle tour";
  return "Street-to-suite property reel";
}

function getInteractionScore() {
  const saved = state.favorites.length;
  const viewed = Object.values(state.views).reduce((sum, count) => sum + count, 0);
  return Math.min(100, saved * 22 + viewed * 6);
}

function hasUnlockedHiddenGem() {
  return state.favorites.length >= 3;
}

function getHiddenGemProperty() {
  return properties.find((property) => property.secretOnly) || null;
}

function resetFeedWindow() {
  state.visibleCount = 6;
}

function getVisibleFeedProperties() {
  return filteredProperties().slice(0, state.visibleCount);
}

function queueFeedReveal(count) {
  const maxCount = filteredProperties().length;
  if (state.visibleCount >= maxCount) return;
  state.visibleCount = Math.min(maxCount, state.visibleCount + count);
  els.feedLoading.hidden = false;
  clearTimeout(feedLoadingTimer);
  feedLoadingTimer = setTimeout(() => {
    els.feedLoading.hidden = true;
  }, 700);
  renderProperties();
  renderMetrics();
  setupInfiniteFeed();
}

function animateCounterBadge(element) {
  element.classList.remove("is-bouncing");
  void element.offsetWidth;
  element.classList.add("is-bouncing");
}

function typeSuggestion(element, title, body) {
  clearInterval(negotiationTypingTimer);
  element.innerHTML = `<strong>${title}</strong><p class="typing-line"></p>`;
  const line = element.querySelector(".typing-line");
  let index = 0;
  negotiationTypingTimer = setInterval(() => {
    line.textContent = body.slice(0, index);
    index += 1;
    if (index > body.length) {
      clearInterval(negotiationTypingTimer);
      line.classList.add("typing-complete");
    }
  }, 16);
}

function pulseSaveFeedback(card) {
  if (!card) return;
  card.classList.remove("property-card--saved-pop");
  void card.offsetWidth;
  card.classList.add("property-card--saved-pop");
}

function setFeedMode(mode) {
  state.feedMode = mode;
  writeStore(STORAGE_KEYS.feedMode, state.feedMode);
  els.gridFeedButton.classList.toggle("active", mode === "grid");
  els.videoFeedButton.classList.toggle("active", mode === "video");
  resetFeedWindow();
  renderDashboard();
}

function getGuessChoices(property) {
  const low = Math.round(property.price * 0.82 / 10000) * 10000;
  const medium = Math.round(property.price / 10000) * 10000;
  const high = Math.round(property.price * 1.16 / 10000) * 10000;
  return [low, medium, high].sort((a, b) => a - b);
}

function getGuessResult(propertyId) {
  return state.guessGame[String(propertyId)] || null;
}

function renderPropertyCardMarkup(property, index) {
  const pack = getDecision(property);
  const saved = state.favorites.includes(property.id);
  const { verified, total } = getGalleryCompleteness(property);
  const heroImage = getHeroImage(property);
  return `
    <article class="property-card property-card--reveal" style="animation-delay:${index * 70}ms" data-tilt-card data-click-card data-id="${property.id}" tabindex="0" aria-label="Explore ${property.title}">
      <div class="feed-media">
        <img src="${heroImage}" alt="${property.title}" loading="lazy">
        <span class="area-pill">${property.area}</span>
        <span class="score-pill score-pill--match">AI ${property.aiScore}% Match</span>
        <span class="photo-count-pill"><i class="fa-solid fa-images"></i> ${verified}/${total}</span>
      </div>
      <div class="card-body">
        <div class="price-row">
          <div>
            <div class="price">${money(property.price)}</div>
            <div class="title">${property.title}</div>
          </div>
          <button class="ghost-button save-button ${saved ? "is-saved" : ""}" data-action="toggle-save" data-id="${property.id}" type="button">
            <i class="fa-solid fa-heart"></i>
            ${saved ? "Saved" : "Save"}
          </button>
        </div>
        <div class="location"><i class="fa-solid fa-location-dot"></i> ${property.location}</div>
        <div class="mini-stats">
          <span class="mini-stat"><i class="fa-solid fa-bed"></i> ${property.bedrooms} bed</span>
          <span class="mini-stat"><i class="fa-solid fa-ruler-combined"></i> ${property.sqft} sqft</span>
          <span class="mini-stat"><i class="fa-solid fa-chart-line"></i> ${property.yield}% yield</span>
        </div>
        ${renderFeedGalleryMarkup(property)}
        <p class="summary">${property.summary}</p>
        <div class="card-tags">
          <span class="tag">${pack.roi}% ROI</span>
          <span class="tag">${pack.risk} Risk</span>
        </div>
        <div class="card-actions">
          <button class="ghost-button" data-action="open-details" data-id="${property.id}" type="button">Explore</button>
          <a class="primary-button quick-contact-card" href="${getWhatsAppLink(property, "feed")}" target="_blank" rel="noopener noreferrer">
            <i class="fa-brands fa-whatsapp"></i>
            Contact
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderGuessCardMarkup(property) {
  const result = getGuessResult(property.id);
  const decision = getDecision(property);
  const choices = getGuessChoices(property);
  const accuracy = result ? Math.abs(result.guess - property.price) / property.price : null;
  const closeHit = accuracy != null && accuracy <= 0.06;

  return `
    <article class="guess-card ${closeHit ? "guess-card--celebrate" : ""}">
      <div class="guess-card-head">
        <span class="guess-card-tag">Guess the Price</span>
        <strong>${property.title}</strong>
      </div>
      <p class="guess-card-copy">Could you price this from the specs alone, or would the market humble you?</p>
      <div class="guess-card-stats">
        <span>${property.bedrooms} bed</span>
        <span>${property.sqft} sqft</span>
        <span>${property.area}</span>
      </div>
      ${result ? `
        <div class="guess-reveal">
          <div class="guess-reveal-price">
            <span>You guessed</span>
            <strong>${fullMoney(result.guess)}</strong>
          </div>
          <div class="guess-reveal-price">
            <span>Actual price</span>
            <strong>${fullMoney(property.price)}</strong>
          </div>
          <p>${closeHit ? "That was dangerously accurate. The market cannot hide from you today." : `Not bad. The AI fair value here is ${fullMoney(decision.fairValue)}, so your instinct is still useful.`}</p>
        </div>
      ` : `
        <div class="guess-choice-row">
          ${choices.map((choice) => `
            <button class="guess-choice" data-action="guess-price" data-id="${property.id}" data-guess="${choice}" type="button">${money(choice)}</button>
          `).join("")}
        </div>
      `}
    </article>
  `;
}

function renderVideoFeedMarkup(property) {
  const saved = state.favorites.includes(property.id);
  const decision = getDecision(property);
  const heroImage = getHeroImage(property);
  return `
    <article class="video-feed-card">
      <video
        class="property-reel"
        poster="${heroImage}"
        muted
        loop
        playsinline
        preload="metadata"
        data-video-id="${property.id}"
      >
        <source src="${getPropertyClipUrl(property)}" type="video/mp4">
      </video>
      <div class="video-feed-overlay">
        <div class="video-feed-topline">
          <span class="reel-pill">${getPropertyClipLabel(property)}</span>
          <span class="reel-pill">Verified listing</span>
        </div>
        <div class="video-feed-copy">
          <span class="video-feed-location">${property.area}</span>
          <h4>${property.title}</h4>
          <p>${property.summary}</p>
          <div class="video-feed-tags">
            <span>${money(property.price)}</span>
            <span>${decision.roi}% ROI</span>
            <span>${property.aiScore}% AI match</span>
          </div>
        </div>
        <div class="video-feed-actions">
          <button class="ghost-button" data-action="toggle-save" data-id="${property.id}" type="button">
            <i class="fa-solid fa-heart"></i>
            ${saved ? "Saved" : "Save"}
          </button>
          <button class="primary-button" data-action="open-details" data-id="${property.id}" type="button">Explore</button>
        </div>
      </div>
    </article>
  `;
}

function teardownVideoFeedPlayback() {
  if (videoFeedObserver) {
    videoFeedObserver.disconnect();
    videoFeedObserver = null;
  }

  els.videoFeed?.querySelectorAll("video").forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
}

function setupVideoFeedPlayback() {
  teardownVideoFeedPlayback();
  if (state.feedMode !== "video" || !els.videoFeed) return;

  videoFeedObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (!(video instanceof HTMLVideoElement)) return;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, {
    root: els.videoFeed,
    threshold: [0.25, 0.6, 0.9]
  });

  els.videoFeed.querySelectorAll("video").forEach((video) => {
    videoFeedObserver.observe(video);
  });
}

function getCommunityNotes(propertyId) {
  return [...(state.communityNotes[String(propertyId)] || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderCommunityNotes(property) {
  const notes = getCommunityNotes(property.id);
  els.notesList.innerHTML = notes.length
    ? notes.map((note) => `
        <article class="note-card">
          <div class="note-card-head">
            <strong>${note.author}</strong>
            <span>${new Date(note.createdAt).toLocaleDateString("en-MY", { month: "short", day: "numeric" })}</span>
          </div>
          <p>${note.text}</p>
        </article>
      `).join("")
    : `<div class="empty-state">No anonymous notes yet. Be the first person to drop the tea on this building.</div>`;
}

function buildAnonymousHandle(property) {
  const pool = [
    `Anon from ${property.area}`,
    `Quiet buyer ${property.bedrooms}B`,
    `Neighbourhood lurker`,
    `Investor with opinions`,
    `Lift watcher`
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildTimelineScenario(property) {
  const deposit = Math.round(property.price * 0.1);
  const splitCount = property.bedrooms >= 4 ? 3 : property.bedrooms >= 3 ? 2 : 1;
  const roomOffset = Math.round((property.price * 0.00085) * Math.max(property.bedrooms - 1, 1));
  const coffeeJoke = 18 * 30;
  if (property.intent === "luxury") {
    return `Alternative timeline: split the deposit ${splitCount > 1 ? `with ${splitCount} friends, ` : ""}furnish it like a content house, and offset roughly ${fullMoney(roomOffset)} a month through premium room rentals or short stays. Suddenly the fantasy looks less impossible and more like a chaotic group spreadsheet.`;
  }

  return `Stretch idea: if you saved a ${fullMoney(deposit)} deposit, rented one room for about ${fullMoney(roomOffset)}, and redirected your daily coffee habit worth roughly RM ${coffeeJoke} a month, this starts looking like a serious lifestyle upgrade instead of a daydream.`;
}

function buildRoast(property) {
  const roastLines = [];
  if (property.psf > 1000) roastLines.push("This place is priced like it already includes a private jet and a founder exit.");
  if (property.bedrooms === 1) roastLines.push("Calling this a one-bedroom is generous. It feels emotionally like a very stylish shoebox.");
  if (property.intent === "luxury") roastLines.push("It wants to be a power move so badly that even the walls look like they are networking.");
  if (property.yield < 4.2) roastLines.push("The rental yield is so polite it practically apologizes before entering the room.");
  if (!roastLines.length) roastLines.push("Honestly, this one is annoyingly hard to roast. It seems to know exactly what it is doing.");
  roastLines.push(`Still, the ${property.vibe.toLowerCase()} energy is the kind of thing that makes people ignore their own budgets.`);
  return roastLines.join(" ");
}

function refreshFunLab(property) {
  const luxuryMode = property.intent === "luxury" || property.price >= 1200000;
  els.timelineButton.textContent = luxuryMode ? "How could I afford this?" : "Stretch the math";
  els.timelineOutput.textContent = luxuryMode
    ? "Tap the affordability button and the AI will scheme up a playful path into this lifestyle."
    : "Tap the button and the AI will turn this into a less-scary upgrade scenario.";
  els.roastOutput.textContent = "Flip roast mode on and let the AI lovingly drag the weird layout, pricing, or design choices.";
}

function setupInfiniteFeed() {
  if (!els.feedSentinel) return;

  if (feedObserver) {
    feedObserver.disconnect();
  }

  if (state.feedMode === "video") {
    els.feedSentinel.hidden = true;
    return;
  }

  if (!("IntersectionObserver" in window)) {
    els.feedSentinel.hidden = true;
    return;
  }

  els.feedSentinel.hidden = state.visibleCount >= filteredProperties().length;
  feedObserver = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (!entry?.isIntersecting) return;
    if (state.visibleCount >= filteredProperties().length) return;
    queueFeedReveal(state.pageSize);
  }, {
    rootMargin: "0px 0px 280px 0px",
    threshold: 0.1
  });

  feedObserver.observe(els.feedSentinel);
}

function enhancePropertyCards() {
  document.querySelectorAll("[data-tilt-card]").forEach((card) => {
    if (card.dataset.tiltBound === "true") return;
    card.dataset.tiltBound = "true";

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const tiltX = ((0.5 - py) * 8).toFixed(2);
      const tiltY = ((px - 0.5) * 10).toFixed(2);

      card.style.setProperty("--tilt-x", `${tiltX}deg`);
      card.style.setProperty("--tilt-y", `${tiltY}deg`);
      card.style.setProperty("--glow-x", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--glow-y", `${(py * 100).toFixed(1)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--glow-x", "50%");
      card.style.setProperty("--glow-y", "50%");
    });
  });
}

function resetArPrompt() {
  clearTimeout(arPromptTimer);
  arPromptTimer = null;
  arPromptShown = false;
  els.arTooltip?.classList.remove("is-hidden");
}

function beginArPromptCountdown() {
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property?.modelUrl || arPromptShown || arPromptTimer) return;

  arPromptTimer = setTimeout(() => {
    arPromptShown = true;
    arPromptTimer = null;
    showToast("Loved the space? Book a real viewing now!");
    els.bookingForm?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 5000);
}

function markArInteracted() {
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property?.modelUrl) return;

  els.arTooltip?.classList.add("is-hidden");
  beginArPromptCountdown();
}

function getFavorites() {
  return properties.filter((property) => state.favorites.includes(property.id));
}

function getViewCount(id) {
  return state.views[id] || 0;
}

function getDecision(property) {
  const viewBoost = Math.min(getViewCount(property.id), 6) * 0.18;
  const saveBoost = state.favorites.includes(property.id) ? 0.7 : 0;
  const roi = Number((property.yield + property.growth * 0.62 + viewBoost + saveBoost).toFixed(1));
  const fairValue = Math.round(property.price * (1 + property.growth / 100 * 0.52));
  const offer = Math.round(Math.min(property.price * 0.976, fairValue * 0.964) / 1000) * 1000;
  const riskScore = (property.yield < 4 ? 1 : 0) + (property.growth > 8.2 ? 1 : 0) + (property.price > 1350000 ? 1 : 0);
  const risk = riskScore <= 1 ? "Low" : riskScore === 2 ? "Medium" : "High";

  return {
    roi,
    fairValue,
    offer,
    risk,
    reasons: [
      `Why this deserves attention: estimated fair value sits near ${fullMoney(fairValue)}, so you have a cleaner anchor than the public asking price.`,
      `Why this can make money: ${property.yield}% yield plus ${property.growth}% growth gives it stronger upside than a generic lifestyle-first unit.`,
      `Why it fits now: the ${property.vibe.toLowerCase()} profile aligns well with ${property.intent} demand in ${property.area}.`
    ]
  };
}

function getPreferenceLine() {
  const viewed = Object.entries(state.views)
    .map(([id, count]) => {
      const property = properties.find((item) => item.id === Number(id));
      return property ? { property, count } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count);

  const top = viewed[0]?.property || getFavorites()[0];
  if (!top) return "";
  if (top.intent === "investment") return `higher-yield homes around ${top.area}`;
  if (top.intent === "family") return `family-led space with lower-regret downside`;
  if (top.intent === "luxury") return `premium city inventory with stronger prestige value`;
  return `${top.type} stock around ${top.area}`;
}

function weightedTop(entries) {
  return Object.entries(entries)
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value)[0] || "";
}

function addInterestSignal(profile, property, weight) {
  if (!property) return;
  profile.hasSignals = true;
  profile.areas[property.area] = (profile.areas[property.area] || 0) + weight;
  profile.types[property.type] = (profile.types[property.type] || 0) + weight;
  profile.intents[property.intent] = (profile.intents[property.intent] || 0) + weight;
  profile.totalWeight += weight;
  profile.priceTotal += property.price * weight;
}

function getInterestProfile() {
  const profile = {
    hasSignals: false,
    areas: {},
    types: {},
    intents: {},
    totalWeight: 0,
    priceTotal: 0,
    area: "",
    type: "",
    intent: "",
    averagePrice: 0
  };

  state.favorites.forEach((id) => addInterestSignal(profile, properties.find((property) => property.id === id), 4));
  Object.entries(state.views).forEach(([id, count]) => {
    const weight = Math.min(Number(count) || 0, 5);
    addInterestSignal(profile, properties.find((property) => property.id === Number(id)), weight);
  });

  if (!profile.hasSignals) return profile;

  profile.area = weightedTop(profile.areas);
  profile.type = weightedTop(profile.types);
  profile.intent = weightedTop(profile.intents);
  profile.averagePrice = profile.totalWeight ? profile.priceTotal / profile.totalWeight : 0;
  return profile;
}

function scorePersonalizedProperty(property, profile) {
  let score = getMasterFeedScore(property);
  if (property.area === profile.area) score += 34;
  if (property.type === profile.type) score += 22;
  if (property.intent === profile.intent) score += 26;
  if (profile.averagePrice) {
    const priceDistance = Math.abs(property.price - profile.averagePrice) / profile.averagePrice;
    score += Math.max(0, 18 - priceDistance * 30);
  }
  score += getDecision(property).roi * 1.4;
  return score;
}

function getPersonalizationLabel(profile) {
  if (!profile.hasSignals) return "";
  if (profile.intent === "investment") return `higher-yield ${profile.type || "property"} options`;
  if (profile.intent === "family") return "family-friendly space and practical layouts";
  if (profile.intent === "luxury") return "premium listings with stronger status value";
  return `${profile.type || "property"} stock${profile.area ? ` around ${profile.area}` : ""}`;
}

function getPersonalizedMatches(profile = getInterestProfile()) {
  if (!profile.hasSignals) return [];

  return feedProperties
    .filter((property) => !state.favorites.includes(property.id))
    .map((property) => ({ property, score: scorePersonalizedProperty(property, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.property);
}

function getPersonalizedReason(property, profile) {
  if (property.area === profile.area) return `You keep circling ${property.area}, so this stays close to your area bias.`;
  if (property.intent === profile.intent) return `This matches the ${profile.intent} pattern from your recent views and saves.`;
  if (property.type === profile.type) return `Same property style as your recent interest, with a cleaner AI score.`;
  return "A nearby alternative with similar price logic and stronger shortlist potential.";
}

function getWhatsAppLink(property, source = "dashboard") {
  const text = `Hi, I want more details about ${property.title} in ${property.area}. I found it through the ${source} view on RealityGenius.`;
  return `https://wa.me/${property.whatsapp}?text=${encodeURIComponent(text)}`;
}

function getMasterAlgorithmControls() {
  return readStore(STORAGE_KEYS.algorithmControls, DEFAULT_MASTER_ALGORITHM);
}

function isDeveloperPaidAd(property) {
  return [3, 5, 8].includes(property.id);
}

function getListingAgeDays(property) {
  return 14 + property.id * 9;
}

function hasInvestorIntent() {
  return state.filter === "investment" || getPreferenceLine().includes("higher-yield");
}

function getMasterFeedScore(property) {
  const controls = getMasterAlgorithmControls();
  let score = property.aiScore + getViewCount(property.id) * 0.9 + (state.favorites.includes(property.id) ? 8 : 0);

  if (isDeveloperPaidAd(property)) {
    score += controls.paidAdsBoost;
  }

  if (getListingAgeDays(property) > 60) {
    score += controls.staleListingPenalty;
  }

  if (hasInvestorIntent() && property.intent === "investment" && property.yield >= 4.8) {
    score += controls.highYieldInvestorPriority;
  }

  return score;
}

function filteredProperties() {
  const query = state.search.trim().toLowerCase();
  let list = feedProperties.filter((property) => {
    const matchesFilter = state.filter === "all" || property.type === state.filter || property.intent === state.filter;
    const searchHaystack = `${property.title} ${property.location} ${property.area} ${property.vibe}`.toLowerCase();
    const matchesSearch = !query || searchHaystack.includes(query);
    return matchesFilter && matchesSearch;
  });

  return list.sort((a, b) => {
    if (state.sort === "price-low") return a.price - b.price;
    if (state.sort === "price-high") return b.price - a.price;
    if (state.sort === "yield-high") return b.yield - a.yield;
    if (state.sort === "growth-high") return b.growth - a.growth;
    return getMasterFeedScore(b) - getMasterFeedScore(a);
  });
}

function recommendationList() {
  return [...filteredProperties()]
    .sort((a, b) => {
      const aScore = getDecision(a).roi + getMasterFeedScore(a) * 0.12;
      const bScore = getDecision(b).roi + getMasterFeedScore(b) * 0.12;
      return bScore - aScore;
    })
    .slice(0, 3);
}

function getLocationInsight(query) {
  const normalized = query.toLowerCase();
  const matchedRule = LOCATION_INTENT_RULES.find((rule) => rule.terms.some((term) => normalized.includes(term)));
  const exactAddressSignal = /\d/.test(normalized) && /(jalan|jln|lorong|taman|residence|residensi|condo|apartment|persiaran)/.test(normalized);

  if (exactAddressSignal) {
    return LOCATION_INTENT_RULES.find((rule) => rule.label === "Address insight");
  }

  return matchedRule || {
    label: "Area insight",
    body: "We do not have exact live stock for this search yet. The useful next step is to map the area, compare nearby verified listings, and turn this search into a sourcing signal for agents."
  };
}

function getKnownAreaFromQuery(query) {
  const normalized = query.toLowerCase();
  return feedProperties
    .map((property) => property.area)
    .find((area) => normalized.includes(area.toLowerCase())) || "";
}

function getSearchTokens(query) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 3);
}

function getPropertyKeywordScore(property, tokens) {
  if (!tokens.length) return 0;
  const haystack = `${property.title} ${property.location} ${property.area} ${property.vibe} ${property.summary}`.toLowerCase();
  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 8 : 0), 0);
}

function getSearchIntentScore(property, query) {
  const normalized = query.toLowerCase();
  let score = 0;

  if (/(mrt|lrt|station|komuter|monorail)/.test(normalized) && /transit|commuter|connected|mrt/i.test(`${property.vibe} ${property.summary}`)) {
    score += 20;
  }

  if (/(family|school|taman|park)/.test(normalized) && property.intent === "family") {
    score += 18;
  }

  if (/(rental|tenant|yield|investment|investor)/.test(normalized) && property.intent === "investment") {
    score += 18;
  }

  if (/(premium|luxury|klcc|bangsar|mont kiara)/.test(normalized) && property.intent === "luxury") {
    score += 14;
  }

  return score;
}

function getNearbySuggestionReason(property, query, knownArea) {
  const safeSearch = escapeHtml(query);
  const nearbyAreas = knownArea ? AREA_NEARBY_MAP[knownArea] || [] : [];

  if (knownArea && property.area === knownArea) {
    return `This is verified stock inside ${escapeHtml(knownArea)}, so it should be checked before we request more exact matches for "${safeSearch}".`;
  }

  if (knownArea && nearbyAreas.includes(property.area)) {
    return `${escapeHtml(property.area)} is a nearby verified pocket to ${escapeHtml(knownArea)}. It gives you a real price anchor while we source the exact address.`;
  }

  if (property.intent === "investment") {
    return `Worth viewing as a yield benchmark: ${property.yield}% projected yield and verified listing data beat waiting blindly for "${safeSearch}".`;
  }

  if (property.intent === "family") {
    return "Worth viewing as a lifestyle backup because it has larger space, calmer positioning, and family-focused demand signals.";
  }

  return "Worth viewing as a premium-area comparison because it helps you judge whether the original location is priced fairly.";
}

function getNearbySystemSuggestions(query) {
  const knownArea = getKnownAreaFromQuery(query);
  const nearbyAreas = knownArea ? AREA_NEARBY_MAP[knownArea] || [] : [];
  const tokens = getSearchTokens(query);
  const filteredPool = feedProperties.filter((property) => (
    state.filter === "all" || property.type === state.filter || property.intent === state.filter
  ));
  const pool = filteredPool.length >= 3
    ? filteredPool
    : [
        ...filteredPool,
        ...feedProperties.filter((property) => !filteredPool.some((item) => item.id === property.id))
      ];

  return pool
    .map((property) => {
      let score = getMasterFeedScore(property) + getPropertyKeywordScore(property, tokens) + getSearchIntentScore(property, query);
      if (knownArea && property.area === knownArea) score += 38;
      if (knownArea && nearbyAreas.includes(property.area)) score += 28;
      return {
        property,
        score,
        reason: getNearbySuggestionReason(property, query, knownArea)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function renderLocationFallback(query) {
  const fallbackKey = getLocationFallbackCacheKey(query);
  const backendFallback = state.locationFallbacks[fallbackKey];
  const backendPending = Boolean(state.locationFallbackPending[fallbackKey]);
  const safeQuery = escapeHtml(query);
  const mapUrl = backendFallback?.maps?.searchUrl || getGoogleMapsSearchUrl(query);
  const mapEmbedUrl = backendFallback?.maps?.embedUrl || getGoogleMapsEmbedUrl(query);
  const earthUrl = backendFallback?.maps?.earthUrl || getGoogleEarthUrl(query);
  const locationView = state.locationView === "earth" ? "earth" : "maps";
  const activeLocationUrl = locationView === "earth" ? earthUrl : mapUrl;
  const activeLocationLabel = locationView === "earth" ? "Open Google Earth" : "Open Google Maps";
  const insight = backendFallback?.insight || getLocationInsight(query);
  const demandText = backendFallback?.demandSignal?.stored
    ? "Demand saved privately. Exact house-style searches are hashed/redacted before storage."
    : backendPending
      ? "Saving this as a private buyer-demand signal for agent sourcing."
      : "It becomes a buyer-demand brief, so agents know which exact area, housing name, or landmark they should source next.";
  const suggestions = getNearbySystemSuggestions(query);

  return `
    <section class="location-insight-card" aria-label="Location insights for ${escapeAttr(query)}">
      <div class="location-insight-head">
        <div>
          <span class="location-insight-eyebrow"><i class="fa-solid fa-map-location-dot"></i> ${escapeHtml(insight.label)}</span>
          <h3>No exact RealtyGenius listing for "${safeQuery}" yet</h3>
          <p>${escapeHtml(insight.body)}</p>
        </div>
        <a class="primary-button" href="${activeLocationUrl}" target="_blank" rel="noopener noreferrer">
          <i class="fa-solid fa-location-arrow"></i>
          ${activeLocationLabel}
        </a>
      </div>
      <div class="location-insight-layout">
        <div class="location-scan-panel">
          <div class="scan-row">
            <i class="fa-solid fa-crosshairs"></i>
            <div>
              <strong>Why we capture this search</strong>
              <span>${escapeHtml(demandText)}</span>
            </div>
          </div>
          <div class="scan-row">
            <i class="fa-solid fa-shield-halved"></i>
            <div>
              <strong>Trust check</strong>
              <span>Until a listing is verified, we show it as an area insight, not fake live inventory.</span>
            </div>
          </div>
          <div class="scan-row">
            <i class="fa-solid fa-route"></i>
            <div>
              <strong>Nearby strategy</strong>
              <span>Use verified nearby homes below to compare budget, commute, and lifestyle fit before requesting a custom shortlist.</span>
            </div>
          </div>
        </div>
        <div class="location-view-panel">
          <div class="location-view-toggle" role="tablist" aria-label="Location view">
            <button class="location-view-button ${locationView === "maps" ? "active" : ""}" data-action="set-location-view" data-view="maps" type="button" role="tab" aria-selected="${locationView === "maps"}">
              <i class="fa-solid fa-map"></i>
              Maps
            </button>
            <button class="location-view-button ${locationView === "earth" ? "active" : ""}" data-action="set-location-view" data-view="earth" type="button" role="tab" aria-selected="${locationView === "earth"}">
              <i class="fa-solid fa-earth-asia"></i>
              Earth
            </button>
          </div>
          ${locationView === "earth" ? `
            <div class="location-earth-frame">
              <div class="earth-preview-icon"><i class="fa-solid fa-earth-asia"></i></div>
              <div>
                <strong>Open satellite and 3D terrain in Google Earth</strong>
                <span>Earth opens in a new tab for the searched location, so buyers can inspect terrain, surrounding density, roads, and nearby landmarks.</span>
              </div>
              <a class="primary-button" href="${earthUrl}" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-up-right-from-square"></i>
                Launch Earth
              </a>
            </div>
          ` : `
            <iframe class="location-map-frame" src="${mapEmbedUrl}" title="Google map for ${escapeAttr(query)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          `}
        </div>
      </div>
      <div class="nearby-suggestion-head">
        <span>Nearby verified options</span>
        <strong>Use these while we source "${safeQuery}"</strong>
      </div>
      <div class="nearby-suggestion-grid">
        ${suggestions.map(({ property, reason }, index) => `
          <article class="nearby-suggestion-card" data-click-card data-id="${property.id}" tabindex="0" aria-label="Explore nearby option ${escapeAttr(property.title)}">
            <img src="${getHeroImage(property)}" alt="${escapeAttr(property.title)}" loading="lazy">
            <div>
              <span class="area-pill">${escapeHtml(property.area)}</span>
              <h4>${escapeHtml(property.title)}</h4>
              <p>${reason}</p>
              <div class="nearby-suggestion-meta">
                <span>${money(property.price)}</span>
                <span>${property.yield}% yield</span>
                <span>AI ${property.aiScore}%</span>
              </div>
              <button class="ghost-button" data-action="open-details" data-id="${property.id}" type="button">
                View reason ${index + 1}
              </button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDashboard() {
  renderGlobalPlatformAlert();
  renderMetrics();
  renderSearchAlerts();
  renderEngagement();
  renderGamification();
  renderRecommendations();
  renderPersonalizedMatches();
  renderProperties();
  renderSaved();
  renderFavoritesDrawer();
  renderNotifications();
  setupInfiniteFeed();
}

function savedSearchLabel(alert) {
  const query = alert.query ? `"${alert.query}"` : "All areas";
  const type = alert.filter === "all" ? "all property types" : alert.filter;
  return `${query} - ${type}`;
}

function matchingPropertiesForAlert(alert) {
  const query = String(alert.query || "").trim().toLowerCase();
  return feedProperties.filter((property) => {
    const matchesFilter = alert.filter === "all" || property.type === alert.filter || property.intent === alert.filter;
    const searchable = `${property.title} ${property.area} ${property.location} ${property.propertyType} ${property.summary}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    return matchesFilter && matchesQuery;
  });
}

function renderSearchAlerts() {
  if (!els.searchAlertStrip) return;
  const alerts = state.savedSearches || [];
  if (!alerts.length) {
    els.searchAlertStrip.innerHTML = `
      <span><i class="fa-solid fa-bell"></i> Save a search to get return-visit alerts when matching homes appear.</span>
    `;
    return;
  }

  const latest = alerts[0];
  const matches = matchingPropertiesForAlert(latest);
  els.searchAlertStrip.innerHTML = `
    <span><i class="fa-solid fa-bell"></i> ${escapeHtml(alerts.length)} saved alert${alerts.length === 1 ? "" : "s"}</span>
    <strong>${escapeHtml(savedSearchLabel(latest))}</strong>
    <em>${matches.length} matching listing${matches.length === 1 ? "" : "s"} now</em>
  `;
}

function saveCurrentSearchAlert() {
  const query = state.search.trim();
  if (!query && state.filter === "all") {
    showToast("Search an area or choose a filter first");
    return;
  }

  const id = `${query || "all"}-${state.filter}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const alert = {
    id,
    query,
    filter: state.filter,
    sort: state.sort,
    createdAt: new Date().toISOString()
  };

  state.savedSearches = [
    alert,
    ...(state.savedSearches || []).filter((item) => item.id !== id)
  ].slice(0, 8);
  writeStore(STORAGE_KEYS.savedSearches, state.savedSearches);

  const matches = matchingPropertiesForAlert(alert);
  pushUserNotification(
    "Saved search alert created",
    `${savedSearchLabel(alert)} is now watching ${matches.length} matching listing${matches.length === 1 ? "" : "s"}.`,
    { tag: `rg-saved-search-${id}`, renotify: true }
  );
  renderDashboard();
  showToast("Search alert saved");
}

function renderMetrics() {
  const visible = state.feedMode === "video" ? filteredProperties() : getVisibleFeedProperties();
  const saved = getFavorites();
  els.propertyCount.textContent = visible.length;
  els.savedCount.textContent = saved.length;
  els.bookingCount.textContent = state.bookings.length;
  els.favoritesCount.textContent = saved.length;
  els.notificationsCount.textContent = state.notifications.filter((item) => !item.read).length;
}

function renderEngagement() {
  const saved = getFavorites().length;
  const viewed = Object.values(state.views).reduce((sum, count) => sum + count, 0);
  const trend = recommendationList()[0];
  const preference = getPreferenceLine();
  const score = getInteractionScore();
  const unlocked = hasUnlockedHiddenGem();

  els.signalBadge.textContent = preference ? "Behavior memory active" : "Analyzing your preferences";
  els.brainProgressLabel.textContent = `Signal strength: ${score}%`;
  els.brainUnlockLabel.textContent = unlocked ? "Highly Recommended unlocked" : "Hidden gem locked";
  els.brainProgressFill.style.width = `${score}%`;
  els.engagementList.innerHTML = [
    {
      title: `${saved || 0} homes saved`,
      body: saved ? "Your shortlist is forming. The brain is already tightening around the homes you keep favoriting." : "Start by saving 2 or 3 homes you would genuinely revisit."
    },
    {
      title: `${viewed || 0} feed interactions`,
      body: preference ? `The engine now sees a bias toward ${preference}.` : "Open a few listings and the recommendation engine will start adapting."
    },
    {
      title: trend ? `Top momentum: ${trend.area}` : "Momentum waiting",
      body: trend ? `${trend.liveNow} buyers are exploring this area right now, which makes it a strong exploration zone tonight.` : "Once you browse, we will surface the hottest pocket in your feed."
    },
    {
      title: unlocked ? "Secret property unlocked" : "Unlock after 3 saves",
      body: unlocked ? "You pushed enough signals into the system to surface a private highly recommended pick." : "Keep exploring and saving to unlock a hidden premium recommendation."
    }
  ].map((item) => `
    <article class="engagement-item">
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    </article>
  `).join("");
}

function normalizeGamification() {
  state.gamification = {
    ...seedGamification(),
    ...state.gamification,
    awarded: {
      ...(state.gamification?.awarded || {})
    }
  };
}

function malaysiaDateKey(offsetDays = 0) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" })
    .format(new Date(Date.now() + offsetDays * 86400000));
}

function touchGamificationStreak() {
  normalizeGamification();
  const today = malaysiaDateKey();
  const yesterday = malaysiaDateKey(-1);

  if (state.gamification.lastActiveDate === today) return;
  state.gamification.streak = state.gamification.lastActiveDate === yesterday
    ? state.gamification.streak + 1
    : 1;
  state.gamification.lastActiveDate = today;
}

function persistGamification() {
  normalizeGamification();
  writeStore(STORAGE_KEYS.gamification, state.gamification);
}

function awardXp(key, amount, title, message) {
  normalizeGamification();
  if (state.gamification.awarded[key]) return false;

  touchGamificationStreak();
  state.gamification.awarded[key] = new Date().toISOString();
  state.gamification.xp += amount;
  persistGamification();

  pushUserNotification(title, message, { tag: `rg-user-${key}`, renotify: true });
  showToast(`+${amount} XP - ${title}`);
  renderGamification();
  renderMetrics();
  return true;
}

function countTotalViews() {
  return Object.values(state.views).reduce((sum, count) => sum + count, 0);
}

function checkGamificationMilestones(trigger, context = {}) {
  const totalViews = countTotalViews();
  const uniqueViews = Object.keys(state.views).length;
  const saved = getFavorites().length;
  const guesses = Object.keys(state.guessGame).length;

  if (trigger === "view" || totalViews > 0) {
    if (totalViews >= 1) awardXp("first-view", 15, "First Market Signal", "Your first property view started the recommendation memory.");
    if (uniqueViews >= 3) awardXp("three-views", 30, "Area Explorer", "You viewed three different homes, so your shortlist is becoming smarter.");
  }

  if (trigger === "save" || saved > 0) {
    if (saved >= 1) awardXp("first-save", 25, "Shortlist Started", "Your first saved home tells the engine what matters to you.");
    if (saved >= 3) awardXp("three-saves", 45, "Serious Buyer Signal", "Three saved homes unlocked stronger match weighting.");
  }

  if (trigger === "guess" || guesses > 0) {
    if (guesses >= 1) awardXp("first-guess", 15, "Price Instinct", "You tested your pricing instinct against the real asking price.");
    if (context.deltaPct != null && context.deltaPct <= 0.12) {
      awardXp("sharp-guess", 35, "Market Instinct Badge", "Your estimate landed close enough to count as a sharp buyer signal.");
    }
  }

  if (trigger === "booking" && state.bookings.length >= 1) {
    awardXp("first-booking", 60, "Viewing Mover", "Your first viewing request moved you from browsing into action.");
  }

  if (trigger === "note") {
    awardXp("first-note", 20, "Community Signal", "Your anonymous note helped improve market intelligence for other buyers.");
  }

  if (trigger === "negotiation") {
    awardXp("first-negotiation", 50, "Deal Room Starter", "You kept the offer trail inside RealityGenius where it can be tracked.");
  }
}

function getGamificationLevel() {
  normalizeGamification();
  return Math.floor(state.gamification.xp / 120) + 1;
}

function renderGamification() {
  if (!els.gamificationPanel) return;

  normalizeGamification();
  const level = getGamificationLevel();
  const xp = state.gamification.xp;
  const progress = Math.min(100, Math.round(((xp % 120) / 120) * 100));
  const totalViews = countTotalViews();
  const saved = getFavorites().length;
  const guesses = Object.keys(state.guessGame).length;

  els.xpValue.textContent = `${xp} XP`;
  els.levelValue.textContent = `Level ${level}`;
  els.streakValue.textContent = `${state.gamification.streak || 0} day${state.gamification.streak === 1 ? "" : "s"}`;
  els.achievementMeter.style.width = `${progress}%`;

  const quests = [
    { title: "View 3 homes", progress: `${Math.min(Object.keys(state.views).length, 3)}/3`, complete: Object.keys(state.views).length >= 3 },
    { title: "Save 2 serious picks", progress: `${Math.min(saved, 2)}/2`, complete: saved >= 2 },
    { title: "Play price instinct", progress: `${Math.min(guesses, 1)}/1`, complete: guesses >= 1 },
    { title: "Book a real viewing", progress: `${Math.min(state.bookings.length, 1)}/1`, complete: state.bookings.length >= 1 }
  ];

  els.questList.innerHTML = quests.map((quest) => `
    <article class="quest-item ${quest.complete ? "complete" : ""}">
      <i class="fa-solid ${quest.complete ? "fa-check" : "fa-circle"}"></i>
      <div>
        <strong>${quest.title}</strong>
        <p>${quest.complete ? "Completed" : `${quest.progress} complete`}</p>
      </div>
    </article>
  `).join("");

  const badges = [
    state.gamification.awarded["first-view"] && "Signal Starter",
    state.gamification.awarded["first-save"] && "Shortlist Builder",
    state.gamification.awarded["sharp-guess"] && "Market Instinct",
    state.gamification.awarded["first-booking"] && "Tour Ready",
    totalViews >= 5 && "Active Explorer"
  ].filter(Boolean);

  els.badgeList.innerHTML = badges.length
    ? badges.map((badge) => `<span class="badge-chip"><i class="fa-solid fa-award"></i>${badge}</span>`).join("")
    : `<span class="badge-chip"><i class="fa-regular fa-circle"></i>Badges unlock as you explore</span>`;
}

function renderRecommendations() {
  const unlocked = hasUnlockedHiddenGem();
  const hiddenGem = unlocked ? getHiddenGemProperty() : null;
  const picks = recommendationList();
  const displayPicks = hiddenGem ? [hiddenGem, ...picks].slice(0, 3) : picks;
  const primary = picks[0];

  if (!primary) {
    els.recommendationTitle.textContent = "No recommendation yet";
    els.recommendationText.textContent = "Try broadening your search and opening a few listings to restart the engine.";
    els.recommendationMeta.textContent = "The shortlist brain updates from your browsing and saved homes.";
    els.recommendationGrid.innerHTML = `<div class="empty-state">Recommendations will appear once there are properties to score.</div>`;
    return;
  }

  const preference = getPreferenceLine();
  const decision = getDecision(primary);
  els.recommendationTitle.textContent = preference ? "Analyzing your preferences..." : "Waiting for your first signal";
  els.recommendationText.textContent = preference
    ? `Based on your behavior, we refined your strategy. You keep leaning toward ${preference}, so the next cards are weighted toward stronger match confidence and cleaner upside.`
    : `Open, save, and revisit properties so the shortlist brain can start building a sharper recommendation trail.`;
  els.recommendationMeta.textContent = `${primary.area} - ${decision.roi}% projected blended ROI - Suggested offer ${money(decision.offer)}`;

  els.recommendationGrid.innerHTML = displayPicks.map((property, index) => {
    const pack = getDecision(property);
    const secretCard = property.secretOnly ? " recommendation-card--secret" : "";
    const heroImage = getHeroImage(property);
    return `
      <article class="recommendation-card${secretCard}" data-click-card data-id="${property.id}" tabindex="0" aria-label="Explore ${property.title}">
        <div class="card-media">
          <img src="${heroImage}" alt="${property.title}" loading="lazy">
          <span class="area-pill">${property.secretOnly ? "Highly Recommended" : `Pick ${index + 1}`}</span>
          <span class="score-pill">${pack.risk} Risk</span>
        </div>
        <div class="card-body">
          <div class="price">${money(property.price)}</div>
          <div class="title">${property.title}</div>
          <p class="summary">${property.secretOnly ? "Unlocked from your saved behavior. This one is meant to feel like an insider reveal, not a public feed card." : pack.reasons[0]}</p>
          <div class="card-tags">
            <span class="tag">${pack.roi}% ROI</span>
            <span class="tag">Offer ${money(pack.offer)}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderPersonalizedMatches() {
  if (!els.personalizedSection || !els.personalizedGrid) return;

  const profile = getInterestProfile();
  const matches = getPersonalizedMatches(profile);
  if (!profile.hasSignals || !matches.length) {
    els.personalizedSection.hidden = true;
    els.personalizedGrid.innerHTML = "";
    return;
  }

  els.personalizedSection.hidden = false;
  if (els.personalizedReason) {
    els.personalizedReason.textContent = `Based on your recent views and saves, RealityGenius is quietly boosting ${getPersonalizationLabel(profile)}.`;
  }

  els.personalizedGrid.innerHTML = matches.map((property) => {
    const decision = getDecision(property);
    const heroImage = getHeroImage(property);
    return `
      <article class="personalized-card" data-click-card data-id="${property.id}" tabindex="0" aria-label="Explore personalized match ${escapeAttr(property.title)}">
        <img src="${heroImage}" alt="${escapeAttr(property.title)}" loading="lazy">
        <div>
          <span class="personalized-pill"><i class="fa-solid fa-wand-magic-sparkles"></i> Matches your pattern</span>
          <h4>${escapeHtml(property.title)}</h4>
          <p>${escapeHtml(getPersonalizedReason(property, profile))}</p>
          <div class="personalized-meta">
            <span>${money(property.price)}</span>
            <span>AI ${property.aiScore}%</span>
            <span>${decision.roi}% ROI</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderProperties() {
  const list = state.feedMode === "video" ? filteredProperties() : getVisibleFeedProperties();
  if (!list.length) {
    const query = state.search.trim();
    if (query) requestBackendLocationFallback(query);
    els.propertyGrid.innerHTML = query
      ? renderLocationFallback(query)
      : `<div class="empty-state">No properties match your filter right now. Try a broader area or switch your filter.</div>`;
    els.videoFeed.innerHTML = "";
    els.propertyGrid.hidden = false;
    els.videoFeed.hidden = true;
    els.feedLoading.hidden = true;
    els.feedSentinel.hidden = true;
    return;
  }

  els.gridFeedButton.classList.toggle("active", state.feedMode === "grid");
  els.videoFeedButton.classList.toggle("active", state.feedMode === "video");

  if (state.feedMode === "video") {
    els.propertyGrid.hidden = true;
    els.videoFeed.hidden = false;
    els.feedLoading.hidden = true;
    els.feedSentinel.hidden = true;
    els.videoFeed.innerHTML = list.map((property) => renderVideoFeedMarkup(property)).join("");
    teardownVideoFeedPlayback();
    requestAnimationFrame(() => {
      setupVideoFeedPlayback();
    });
    return;
  }

  teardownVideoFeedPlayback();
  els.propertyGrid.hidden = false;
  els.videoFeed.hidden = true;
  els.feedLoading.hidden = state.visibleCount >= filteredProperties().length;

  const cards = [];
  list.forEach((property, index) => {
    cards.push(renderPropertyCardMarkup(property, index));
    if ((index + 1) % 4 === 0) {
      cards.push(renderGuessCardMarkup(property));
    }
  });

  els.propertyGrid.innerHTML = cards.join("");
  enhancePropertyCards();
}

function renderSaved() {
  const saved = getFavorites();
  if (!saved.length) {
    els.savedGrid.innerHTML = `<div class="empty-state">No saved properties yet. Tap save on any strong listing and it will land here.</div>`;
    return;
  }

  els.savedGrid.innerHTML = saved.map((property) => {
    const latestBooking = state.bookings.find((item) => item.propertyId === property.id);
    return `
      <article class="saved-card" data-click-card data-id="${property.id}" tabindex="0" aria-label="Review ${property.title}">
        <div class="card-body">
          <div class="price-row">
            <div>
              <div class="title">${property.title}</div>
              <div class="location">${property.area}</div>
            </div>
            <button class="ghost-button save-button is-saved" data-action="toggle-save" data-id="${property.id}" type="button">
              <i class="fa-solid fa-heart"></i>
              Remove
            </button>
          </div>
          <div class="saved-meta">
            <span>${money(property.price)}</span>
            <span>${property.yield}% yield</span>
            <span>${property.growth}% growth</span>
          </div>
          <p class="summary">${latestBooking ? `Last viewing request: ${latestBooking.date} at ${latestBooking.time}.` : "No viewing request sent yet. Keep this ready for a quick next move."}</p>
          <div class="card-actions">
            <button class="ghost-button" data-action="open-details" data-id="${property.id}" type="button">Review</button>
            <a class="primary-button quick-contact-card" href="${getWhatsAppLink(property, "saved")}" target="_blank" rel="noopener noreferrer">
              <i class="fa-brands fa-whatsapp"></i>
              Quick Contact
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderFavoritesDrawerLegacy() {
  const favorites = getFavorites();
  els.favoritesDrawerList.innerHTML = favorites.length
    ? favorites.map((property) => `
        <article class="drawer-item">
          <strong>${property.title}</strong>
          <p>${property.location}</p>
          <time>${money(property.price)} • ${property.yield}% yield • ${property.growth}% growth</time>
        </article>
      `).join("")
    : `<div class="empty-state">Your saved properties will appear here.</div>`;
}

function renderNotifications() {
  state.notifications = readStore(STORAGE_KEYS.notifications, state.notifications);
  const notifications = [...state.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  els.notificationsDrawerList.innerHTML = notifications.length
    ? notifications.map((item) => `
        <article class="drawer-item">
          <strong>${item.title}</strong>
          <p>${item.message}</p>
          <time>${new Date(item.createdAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</time>
        </article>
      `).join("")
    : `<div class="empty-state">No notifications yet.</div>`;
}

function toggleFavorite(id) {
  const exists = state.favorites.includes(id);
  const property = properties.find((item) => item.id === id);
  state.favorites = exists ? state.favorites.filter((item) => item !== id) : [...state.favorites, id];
  writeStore(STORAGE_KEYS.favorites, state.favorites);
  renderDashboard();

  animateCounterBadge(els.favoritesCount);
  requestAnimationFrame(() => {
    pulseSaveFeedback(document.querySelector(`[data-action="toggle-save"][data-id="${id}"]`)?.closest(".property-card"));
  });

  if (state.activePropertyId === id && property) {
    els.modalSaveAction.innerHTML = `<i class="fa-solid fa-heart"></i> ${state.favorites.includes(id) ? "Saved" : "Save Property"}`;
    els.modalSaveAction.classList.toggle("is-saved", state.favorites.includes(id));
    renderNegotiation(property);
  }

  showToast(exists ? "Removed from shortlist" : "Saved to your shortlist");
  if (!exists) checkGamificationMilestones("save");
}

function incrementView(id) {
  state.views[id] = (state.views[id] || 0) + 1;
  writeStore(STORAGE_KEYS.views, state.views);
  renderEngagement();
  renderPersonalizedMatches();
  checkGamificationMilestones("view");
}

function openPropertyModal(id) {
  const property = properties.find((item) => item.id === id);
  if (!property) return;

  state.activePropertyId = id;
  incrementView(id);

  const decision = getDecision(property);
  els.modalBadge.textContent = property.area;
  els.modalTitle.textContent = property.title;
  els.modalLocation.textContent = property.location;
  els.modalSummary.textContent = property.summary;
  renderModalGallery(property);
  const { verified, total } = getGalleryCompleteness(property);
  els.modalStats.innerHTML = `
    <span>${property.bedrooms} bed / ${property.bathrooms} bath</span>
    <span>${property.sqft} sqft</span>
    <span>${property.yield}% yield</span>
    <span>${property.growth}% growth</span>
    <span>${verified}/${total} photos ready</span>
  `;
  els.modalAiReasons.innerHTML = decision.reasons.map((item) => `<li>${item}</li>`).join("");
  els.modalRisk.textContent = `Risk: ${decision.risk}`;
  els.modalOffer.textContent = fullMoney(decision.offer);
  els.modalRoi.textContent = `${decision.roi}%`;
  els.modalSaveAction.innerHTML = `<i class="fa-solid fa-heart"></i> ${state.favorites.includes(property.id) ? "Saved" : "Save Property"}`;
  els.modalSaveAction.classList.toggle("is-saved", state.favorites.includes(property.id));
  els.modalContactAction.href = getWhatsAppLink(property, "modal");

  els.bookingStatus.textContent = "";
  els.bookingForm.reset();
  els.bookingDate.min = new Date().toISOString().split("T")[0];
  els.noteInput.value = "";
  hydrateNegotiationProfile();
  refreshFunLab(property);
  renderNegotiation(property);
  renderCommunityNotes(property);
  renderDealRoom(property);
  configureAr(property);

  els.propertyModal.classList.add("is-open");
  els.propertyModal.setAttribute("aria-hidden", "false");
  renderDashboard();
}

function getCurrentBuyerKey() {
  return window.KVNegotiationStore.createBuyerKey(
    els.negotiationName.value.trim() || state.buyerProfile.name,
    els.negotiationPhone.value.trim() || state.buyerProfile.phone
  );
}

function hydrateNegotiationProfile() {
  els.negotiationName.value = state.buyerProfile.name || "";
  els.negotiationPhone.value = state.buyerProfile.phone || "";
}

function saveBuyerProfile() {
  state.buyerProfile = {
    name: els.negotiationName.value.trim(),
    phone: els.negotiationPhone.value.trim()
  };
  writeStore(STORAGE_KEYS.buyerProfile, state.buyerProfile);
}

function readLeakProofDeals() {
  return readStore(STORAGE_KEYS.leakProofDeals, []);
}

function writeLeakProofDeals(deals) {
  writeStore(STORAGE_KEYS.leakProofDeals, deals);
}

function getBuyerIdentity() {
  const name = els.negotiationName.value.trim() || els.bookingName.value.trim() || state.buyerProfile.name || "Buyer from dashboard";
  const phone = els.negotiationPhone.value.trim() || els.bookingPhone.value.trim() || state.buyerProfile.phone || "";
  const buyerKey = window.KVNegotiationStore.createBuyerKey(name, phone || "dashboard");
  return { name, phone, buyerKey };
}

function dealReference(prefix, propertyId) {
  return `${prefix}-${propertyId}-${Date.now().toString(36).toUpperCase()}`;
}

function createDealShell(property) {
  const buyer = getBuyerIdentity();
  const now = new Date().toISOString();
  return {
    id: `${property.id}:${buyer.buyerKey}`,
    propertyId: property.id,
    propertyTitle: property.title,
    propertyArea: property.area,
    askingPrice: property.price,
    buyerName: buyer.name,
    buyerPhone: buyer.phone,
    buyerKey: buyer.buyerKey,
    createdAt: now,
    updatedAt: now,
    escrow: {
      amount: 10000,
      status: "not_started",
      reference: null,
      paidAt: null,
      releasedAt: null
    },
    loan: {
      status: "not_started",
      bank: "Maybank Partner Bank",
      rateDiscount: 0.1,
      referralFeeEstimate: Math.round(property.price * 0.9 * 0.01),
      startedAt: null,
      submittedAt: null
    },
    offer: {
      status: "not_started",
      reference: null,
      offerPrice: null,
      generatedAt: null,
      buyerSignedAt: null,
      agentSignedAt: null
    },
    timeline: [
      {
        id: Date.now(),
        title: "Deal room created",
        message: "Escrow, loan vault, and offer paperwork are now tracked in RealtyGenius.",
        createdAt: now
      }
    ]
  };
}

function findLeakProofDeal(property, create = false) {
  if (!property) return null;
  const buyer = getBuyerIdentity();
  const deals = readLeakProofDeals();
  const existing = deals.find((deal) => deal.propertyId === property.id && deal.buyerKey === buyer.buyerKey);
  if (existing || !create) return existing || null;
  const deal = createDealShell(property);
  writeLeakProofDeals([deal, ...deals]);
  return deal;
}

function saveLeakProofDeal(deal) {
  const deals = readLeakProofDeals();
  const updatedDeal = {
    ...deal,
    updatedAt: new Date().toISOString()
  };
  const index = deals.findIndex((item) => item.id === updatedDeal.id);
  if (index >= 0) deals[index] = updatedDeal;
  else deals.unshift(updatedDeal);
  writeLeakProofDeals(deals);
  return updatedDeal;
}

function appendDealEvent(deal, title, message) {
  return {
    ...deal,
    timeline: [
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title,
        message,
        createdAt: new Date().toISOString()
      },
      ...(deal.timeline || [])
    ].slice(0, 6)
  };
}

function getAcceptedOfferPrice(property) {
  const thread = getNegotiationThread(property.id);
  const acceptedEntry = [...(thread?.entries || [])].reverse().find((entry) => entry.status === "accepted" || entry.type === "accept");
  return acceptedEntry?.price || getDecision(property).offer;
}

function ensureOfferLetter(property, reason = "manual") {
  let deal = findLeakProofDeal(property, true);
  if (!deal) return null;
  const offerPrice = getAcceptedOfferPrice(property);
  const alreadyGenerated = deal.offer.status !== "not_started";
  deal = {
    ...deal,
    offer: {
      ...deal.offer,
      status: alreadyGenerated ? deal.offer.status : "generated",
      reference: deal.offer.reference || dealReference("LOO", property.id),
      offerPrice,
      generatedAt: deal.offer.generatedAt || new Date().toISOString()
    }
  };
  if (!alreadyGenerated) {
    deal = appendDealEvent(
      deal,
      "Letter of Offer generated",
      reason === "accepted"
        ? "Accepted offer triggered the e-sign document automatically."
        : "Buyer generated the e-sign offer pack inside the deal room."
    );
  }
  return saveLeakProofDeal(deal);
}

function renderDealRoom(property) {
  if (!property || !els.dealRoomStatus) return;
  const deal = findLeakProofDeal(property, false);
  const escrow = deal?.escrow || { amount: 10000, status: "not_started", reference: null };
  const loan = deal?.loan || { status: "not_started", bank: "Maybank Partner Bank", rateDiscount: 0.1, referralFeeEstimate: Math.round(property.price * 0.9 * 0.01) };
  const offer = deal?.offer || { status: "not_started", reference: null, offerPrice: null };
  const signedCount = Number(Boolean(offer.buyerSignedAt)) + Number(Boolean(offer.agentSignedAt));

  const activeCount = [escrow.status !== "not_started", loan.status !== "not_started", offer.status !== "not_started"].filter(Boolean).length;
  els.dealRoomStatus.textContent = activeCount ? `${activeCount}/3 retention locks active` : "Not started";
  els.escrowStatus.textContent =
    escrow.status === "released" ? "Released after the signed paperwork checkpoint."
      : escrow.status === "held" ? "RM 10,000 is safely held in RealtyGenius escrow."
        : "No booking fee held yet.";
  els.escrowAmount.textContent = `${money(escrow.amount || 10000)} protected deposit`;
  els.escrowReference.textContent = escrow.reference || "Reference pending";
  els.payBookingFeeButton.textContent = escrow.status === "held" ? "Escrow Held" : escrow.status === "released" ? "Escrow Released" : "Pay Booking Fee";
  els.payBookingFeeButton.disabled = escrow.status === "held" || escrow.status === "released";

  els.loanStatus.textContent =
    loan.status === "discount_secured" ? `${loan.bank} path submitted. Estimated referral fee: ${money(loan.referralFeeEstimate)}.`
      : loan.status === "vault_started" ? "AI Document Vault started. DSR files stay inside RealtyGenius."
        : "Start the DSR vault to unlock the 0.1% mortgage-rate route.";
  els.startLoanPackButton.textContent = loan.status === "not_started" ? "Start Loan Pack" : "Loan Pack Started";
  els.submitPartnerBankButton.textContent = loan.status === "discount_secured" ? "Bank Submitted" : "Submit to Partner Bank";

  els.offerStatus.textContent =
    offer.status === "fully_signed" ? "Buyer and agent signed. Escrow can be released safely."
      : offer.status === "agent_signed" ? "Agent signed. Waiting for buyer e-sign."
        : offer.status === "buyer_signed" ? "Buyer signed. Waiting for agent e-sign."
          : offer.status === "generated" ? `Letter ${offer.reference} generated at ${money(offer.offerPrice)}.`
            : "Accept an offer to generate the e-sign paper trail.";
  els.offerPreview.innerHTML = offer.status === "not_started"
    ? "No offer generated yet."
    : `
      <strong>${offer.reference}</strong>
      <span>${property.title}</span>
      <span>Offer: ${money(offer.offerPrice || getAcceptedOfferPrice(property))}</span>
      <span>${signedCount}/2 digital signatures captured</span>
    `;
  els.generateOfferButton.textContent = offer.status === "not_started" ? "Generate Offer" : "Offer Generated";
  els.buyerSignOfferButton.textContent = offer.buyerSignedAt ? "Buyer Signed" : "Buyer E-Sign";
  els.buyerSignOfferButton.disabled = Boolean(offer.buyerSignedAt) || offer.status === "not_started";

  els.dealRoomTimeline.innerHTML = deal?.timeline?.length
    ? deal.timeline.map((item) => `
        <article class="deal-timeline-item">
          <strong>${item.title}</strong>
          <p>${item.message}</p>
          <time>${new Date(item.createdAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</time>
        </article>
      `).join("")
    : `<div class="empty-state">Use escrow, loan pack, or offer e-sign to start the in-platform paper trail.</div>`;
}

function payBookingFee() {
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property) return;
  let deal = findLeakProofDeal(property, true);
  deal = {
    ...deal,
    escrow: {
      ...deal.escrow,
      status: "held",
      reference: deal.escrow.reference || dealReference("ESC", property.id),
      paidAt: deal.escrow.paidAt || new Date().toISOString()
    }
  };
  deal = appendDealEvent(deal, "Booking fee escrowed", `${money(deal.escrow.amount)} is now held by RealtyGenius until signed paperwork is complete.`);
  saveLeakProofDeal(deal);
  pushUserNotification("Booking fee protected", `${property.title}: your booking fee is held in RealtyGenius escrow.`);
  renderDealRoom(property);
  showToast("Booking fee held in escrow");
}

function startLoanPack() {
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property) return;
  let deal = findLeakProofDeal(property, true);
  deal = {
    ...deal,
    loan: {
      ...deal.loan,
      status: deal.loan.status === "not_started" ? "vault_started" : deal.loan.status,
      startedAt: deal.loan.startedAt || new Date().toISOString()
    }
  };
  deal = appendDealEvent(deal, "AI loan pack started", "The buyer stays in-platform because DSR documents, OCR, and loan routing are now tied to this deal.");
  saveLeakProofDeal(deal);
  renderDealRoom(property);
  showToast("Loan pack started");
}

function submitPartnerBank() {
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property) return;
  let deal = findLeakProofDeal(property, true);
  deal = {
    ...deal,
    loan: {
      ...deal.loan,
      status: "discount_secured",
      startedAt: deal.loan.startedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString()
    }
  };
  deal = appendDealEvent(deal, "Partner bank path submitted", `Buyer can pursue a 0.1% rate discount while the agent keeps full commission.`);
  saveLeakProofDeal(deal);
  pushUserNotification("Partner bank path submitted", `${property.title}: your loan pack is queued for the discounted mortgage route.`);
  renderDealRoom(property);
  showToast("Partner bank submission created");
}

function generateOfferLetter() {
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property) return;
  ensureOfferLetter(property);
  renderDealRoom(property);
  showToast("Letter of Offer generated");
}

function buyerSignOffer() {
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property) return;
  let deal = ensureOfferLetter(property);
  if (!deal) return;
  const agentSigned = Boolean(deal.offer.agentSignedAt);
  deal = {
    ...deal,
    offer: {
      ...deal.offer,
      status: agentSigned ? "fully_signed" : "buyer_signed",
      buyerSignedAt: deal.offer.buyerSignedAt || new Date().toISOString()
    }
  };
  deal = appendDealEvent(deal, "Buyer e-signed Letter of Offer", `${deal.offer.reference} now has the buyer signature inside RealtyGenius.`);
  saveLeakProofDeal(deal);
  pushUserNotification("Letter of Offer signed", `${property.title}: your e-signature was recorded.`);
  renderDealRoom(property);
  showToast(agentSigned ? "Offer fully signed" : "Buyer signature captured");
}

function getNegotiationThread(propertyId) {
  const buyerKey = getCurrentBuyerKey();
  if (!buyerKey || buyerKey === "::") return null;
  return window.KVNegotiationStore.getForPropertyBuyer(propertyId, buyerKey);
}

function getNegotiationSuggestion(property, offerPrice) {
  const decision = getDecision(property);
  return window.NegotiationAssistant.negotiationAssistant.evaluate({
    role: "buyer",
    message: `I want to negotiate for ${property.title}`,
    askingPrice: property.price,
    marketValue: decision.fairValue,
    offerPrice,
    propertyArea: property.area,
    viewedCount: getViewCount(property.id),
    savedCount: state.favorites.includes(property.id) ? 1 : 0,
    goal: property.intent === "investment" ? "investment" : "own_stay"
  });
}

function setNegotiationState(status) {
  els.negotiationState.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  els.negotiationState.className = `negotiation-status ${status}`;
}

function renderNegotiation(property) {
  const thread = getNegotiationThread(property.id);
  const suggestedOffer = thread?.entries?.length
    ? thread.entries[thread.entries.length - 1].price || getDecision(property).offer
    : getDecision(property).offer;
  const ai = getNegotiationSuggestion(property, suggestedOffer);
  const cheekyGap = Math.max(property.price - ai.suggestion.counterOffer, 0);
  const suggestionTitle = `AI counter strategy: ${ai.suggestion.counterOfferDisplay}`;
  const suggestionBody = thread?.status === "closed"
    ? "This thread has been closed on the agent side for this buyer and property. You can still explore the unit, but this negotiation lane is now locked."
    : thread?.entries?.length
      ? `${ai.suggestion.strategy} ${ai.suggestion.persuasiveResponse}`
      : `Market ask is ${fullMoney(property.price)}, but I think we can push for ${ai.suggestion.counterOfferDisplay}. That is ${fullMoney(cheekyGap)} below ask while still sounding serious. Want me to send the cheeky opener for you?`;
  typeSuggestion(els.negotiationSuggestion, suggestionTitle, suggestionBody);

  const isClosed = thread?.status === "closed";
  setNegotiationState(thread?.status || "open");
  els.negotiationLocked.hidden = !isClosed;
  els.negotiationForm.hidden = isClosed;
  els.negotiationOffer.value = ai.suggestion.counterOffer;

  els.negotiationThread.innerHTML = thread?.entries?.length
    ? [...thread.entries].reverse().map((entry) => `
        <article class="negotiation-entry">
          <div class="negotiation-entry-head">
            <div>
              <strong>${entry.actorLabel}</strong>
              <div class="subtext">${new Date(entry.createdAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</div>
            </div>
            ${entry.price ? `<span class="negotiation-price">${fullMoney(entry.price)}</span>` : ""}
          </div>
          <p>${entry.message}</p>
        </article>
      `).join("")
    : `<div class="empty-state">No negotiation yet. Send your first counter offer and let the AI frame it.</div>`;
}

function pushUserNotification(title, message, options = {}) {
  state.notifications = [
    {
      id: Date.now(),
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false
    },
    ...readStore(STORAGE_KEYS.notifications, [])
  ];
  writeStore(STORAGE_KEYS.notifications, state.notifications);
  window.RealtyGeniusPush?.notify(title, message, {
    tag: options.tag,
    renotify: options.renotify,
    url: options.url || new URL("user.html", location.href).href
  });
}

function handleGuessPrice(propertyId, guess) {
  const property = properties.find((item) => item.id === propertyId);
  if (!property) return;

  const deltaPct = Math.abs(guess - property.price) / property.price;
  state.guessGame[String(propertyId)] = {
    guess,
    guessedAt: new Date().toISOString(),
    deltaPct
  };
  writeStore(STORAGE_KEYS.guessGame, state.guessGame);
  renderProperties();

  if (deltaPct <= 0.06) {
    showToast("Nailed it. Your pricing instincts are suspiciously strong.");
  } else if (deltaPct <= 0.12) {
    showToast("Close enough to make the game dangerous.");
  } else {
    showToast("The market humbled you. Swipe for another round.");
  }
  checkGamificationMilestones("guess", { deltaPct });
}

function submitCommunityNote(event) {
  event.preventDefault();
  if (state.activePropertyId == null) return;

  const property = properties.find((item) => item.id === state.activePropertyId);
  const text = els.noteInput.value.trim();
  if (!property || !text) {
    showToast("Write a note before posting");
    return;
  }

  const propertyKey = String(property.id);
  const note = {
    id: Date.now(),
    author: buildAnonymousHandle(property),
    text,
    createdAt: new Date().toISOString()
  };

  state.communityNotes[propertyKey] = [note, ...(state.communityNotes[propertyKey] || [])];
  writeStore(STORAGE_KEYS.communityNotes, state.communityNotes);
  els.noteInput.value = "";
  renderCommunityNotes(property);
  showToast("Anonymous note posted");
  checkGamificationMilestones("note");
}

function submitNegotiationLegacy(action) {
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property) return;

  if (!els.negotiationName.value.trim() || !els.negotiationPhone.value.trim()) {
    showToast("Add your name and WhatsApp first");
    return;
  }

  saveBuyerProfile();
  const buyerKey = getCurrentBuyerKey();
  let thread = window.KVNegotiationStore.getForPropertyBuyer(property.id, buyerKey);
  if (!thread) {
    thread = window.KVNegotiationStore.createThread({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyArea: property.area,
      askingPrice: property.price,
      buyerName: state.buyerProfile.name,
      buyerPhone: state.buyerProfile.phone
    });
  }

  if (thread.status === "closed") {
    renderNegotiation(property);
    showToast("This negotiation was closed by the agent");
    return;
  }

  const offerPrice = Number(els.negotiationOffer.value || getDecision(property).offer);
  const ai = getNegotiationSuggestion(property, offerPrice);
  const status = action === "reject" ? "rejected" : action === "accept" ? "accepted" : "open";
  const message = action === "reject"
    ? "Buyer rejected the current direction and paused the negotiation."
    : action === "accept"
      ? `Buyer accepted the AI-guided offer at ${fullMoney(ai.suggestion.counterOffer)}.`
      : ai.suggestion.persuasiveResponse;
  const price = action === "accept" ? ai.suggestion.counterOffer : offerPrice;

  window.KVNegotiationStore.appendEntry(thread.id, {
    actor: "buyer",
    actorLabel: `${state.buyerProfile.name} • Buyer`,
    type: action,
    price,
    message,
    status
  });

  pushUserNotification(
    `Negotiation ${action === "counter" ? "updated" : status}`,
    `${property.title}: ${action === "counter" ? "your counter offer was sent." : action === "accept" ? "you accepted the suggested price." : "you paused this negotiation."}`
  );

  renderDashboard();
  renderNegotiation(property);
  showToast(action === "counter" ? "Counter offer sent" : action === "accept" ? "Offer accepted" : "Negotiation paused");
}

function closeModal() {
  els.propertyModal.classList.remove("is-open");
  els.propertyModal.setAttribute("aria-hidden", "true");
  state.activePropertyId = null;
  resetArPrompt();
  configureAr(null, true);
}

function configureAr(property, reset = false) {
  if (reset) {
    resetArPrompt();
    arModule.clear();
    return;
  }

  resetArPrompt();
  if (!property?.modelUrl) {
    els.arTooltip?.classList.add("is-hidden");
  }
  arModule.setProperty(property);
}

function submitBooking(event) {
  event.preventDefault();
  if (!state.activePropertyId) return;

  const property = properties.find((item) => item.id === state.activePropertyId);
  const booking = {
    id: Date.now(),
    propertyId: property.id,
    propertyTitle: property.title,
    name: els.bookingName.value.trim(),
    phone: els.bookingPhone.value.trim(),
    date: els.bookingDate.value,
    time: els.bookingTime.value,
    createdAt: new Date().toISOString()
  };

  if (!booking.name || !booking.phone || !booking.date || !booking.time) {
    els.bookingStatus.textContent = "Please complete all booking fields first.";
    return;
  }

  state.bookings = [booking, ...state.bookings];
  writeStore(STORAGE_KEYS.bookings, state.bookings);
  pushUserNotification("Viewing request sent", `Your request for ${property.title} on ${booking.date} at ${booking.time} is now in motion.`);

  sendLeadAutomation(buildLeadAutomationPayload(property, {
    buyerName: booking.name,
    buyerPhone: booking.phone,
    inquiryType: "viewing_request",
    source: "user_booking_form",
    bookingDate: booking.date,
    bookingTime: booking.time,
    message: `Viewing request for ${property.title} on ${booking.date} at ${booking.time}.`
  })).then((result) => {
    if (result?.assignedAgent?.name) {
      els.bookingStatus.textContent = `Viewing request sent. ${result.assignedAgent.name} received the lead with a ${result.lead.score}/100 score.`;
    }
  });

  els.bookingStatus.textContent = `Viewing request sent for ${property.title}. Check your alerts for updates.`;
  renderDashboard();
  showToast("Booking request sent");
  checkGamificationMilestones("booking");
}

function renderFavoritesDrawer() {
  const favorites = getFavorites();
  els.favoritesDrawerList.innerHTML = favorites.length
    ? favorites.map((property) => `
        <article class="drawer-item">
          <strong>${property.title}</strong>
          <p>${property.location}</p>
          <time>${money(property.price)} - ${property.yield}% yield - ${property.growth}% growth</time>
        </article>
      `).join("")
    : `<div class="empty-state">Your saved properties will appear here.</div>`;
}

function submitNegotiation(action) {
  const property = properties.find((item) => item.id === state.activePropertyId);
  if (!property) return;

  if (!els.negotiationName.value.trim() || !els.negotiationPhone.value.trim()) {
    showToast("Add your name and WhatsApp first");
    return;
  }

  saveBuyerProfile();
  const buyerKey = getCurrentBuyerKey();
  let thread = window.KVNegotiationStore.getForPropertyBuyer(property.id, buyerKey);
  if (!thread) {
    thread = window.KVNegotiationStore.createThread({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyArea: property.area,
      askingPrice: property.price,
      buyerName: state.buyerProfile.name,
      buyerPhone: state.buyerProfile.phone
    });
  }

  if (thread.status === "closed") {
    renderNegotiation(property);
    showToast("This negotiation was closed by the agent");
    return;
  }

  const offerPrice = Number(els.negotiationOffer.value || getDecision(property).offer);
  const ai = getNegotiationSuggestion(property, offerPrice);
  const status = action === "reject" ? "rejected" : action === "accept" ? "accepted" : "open";
  const message = action === "reject"
    ? "Buyer rejected the current direction and paused the negotiation."
    : action === "accept"
      ? `Buyer accepted the AI-guided offer at ${fullMoney(ai.suggestion.counterOffer)}.`
      : ai.suggestion.persuasiveResponse;
  const price = action === "accept" ? ai.suggestion.counterOffer : offerPrice;

  window.KVNegotiationStore.appendEntry(thread.id, {
    actor: "buyer",
    actorLabel: `${state.buyerProfile.name} - Buyer`,
    type: action,
    price,
    message,
    status
  });

  if (action === "accept") {
    ensureOfferLetter(property, "accepted");
  }

  pushUserNotification(
    `Negotiation ${action === "counter" ? "updated" : status}`,
    `${property.title}: ${action === "counter" ? "your counter offer was sent." : action === "accept" ? "you accepted the suggested price." : "you paused this negotiation."}`
  );

  sendLeadAutomation(buildLeadAutomationPayload(property, {
    buyerName: state.buyerProfile.name,
    buyerPhone: state.buyerProfile.phone,
    inquiryType: action === "accept" ? "offer_acceptance" : "negotiation",
    source: "user_negotiation_assistant",
    offerPrice: price,
    message: `${state.buyerProfile.name} ${action === "accept" ? "accepted" : action === "reject" ? "paused" : "sent a counter offer"} at ${fullMoney(price)} for ${property.title}.`
  }));

  checkGamificationMilestones("negotiation");

  renderDashboard();
  renderNegotiation(property);
  renderDealRoom(property);
  showToast(action === "counter" ? "Counter offer sent" : action === "accept" ? "Offer accepted" : "Negotiation paused");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 2200);
}

function openDrawer(id) {
  const drawer = document.getElementById(id);
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");

  if (id === "notificationsDrawer") {
    state.notifications = state.notifications.map((item) => ({ ...item, read: true }));
    writeStore(STORAGE_KEYS.notifications, state.notifications);
    renderMetrics();
    renderNotifications();
  }
}

function closeDrawer(id) {
  const drawer = document.getElementById(id);
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    resetFeedWindow();
    renderDashboard();
  });

  els.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    resetFeedWindow();
    renderDashboard();
  });

  els.saveSearchButton?.addEventListener("click", saveCurrentSearchAlert);

  els.gridFeedButton.addEventListener("click", () => setFeedMode("grid"));
  els.videoFeedButton.addEventListener("click", () => {
    setFeedMode("video");
    showToast("Welcome to the property reels");
  });

  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
      state.filter = button.dataset.filter;
      resetFeedWindow();
      renderDashboard();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const actionTarget = target?.closest("[data-action]");
    if (actionTarget) {
      const id = Number(actionTarget.dataset.id);
      const action = actionTarget.dataset.action;
      if (action === "toggle-save") toggleFavorite(id);
      if (action === "open-details") {
        if (requireBuyerSessionForExplore()) openPropertyModal(id);
      }
      if (action === "select-gallery-image") selectModalGalleryImage(Number(actionTarget.dataset.index));
      if (action === "guess-price") handleGuessPrice(id, Number(actionTarget.dataset.guess));
      if (action === "set-location-view") {
        state.locationView = actionTarget.dataset.view === "earth" ? "earth" : "maps";
        renderProperties();
      }
      return;
    }

    const cardTarget = target?.closest("[data-click-card]");
    const interactiveTarget = target?.closest("a, button, input, select, textarea, label");
    if (cardTarget && !interactiveTarget) {
      if (requireBuyerSessionForExplore()) openPropertyModal(Number(cardTarget.dataset.id));
      return;
    }

    const closeTarget = target?.closest("[data-close]");
    if (closeTarget) {
      const targetId = closeTarget.dataset.close;
      if (targetId === "propertyModal") closeModal();
      else closeDrawer(targetId);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const target = event.target instanceof Element ? event.target : null;
    const cardTarget = target?.closest("[data-click-card]");
    const interactiveTarget = target?.closest("a, button, input, select, textarea, label");
    if (!cardTarget || interactiveTarget) return;
    event.preventDefault();
    if (requireBuyerSessionForExplore()) openPropertyModal(Number(cardTarget.dataset.id));
  });

  els.favoritesButton.addEventListener("click", () => openDrawer("favoritesDrawer"));
  els.notificationsButton.addEventListener("click", () => openDrawer("notificationsDrawer"));
  window.RealtyGeniusPush?.installButton(els.pushPermissionButton, (result) => {
    if (result === "granted") showToast("Push notifications enabled");
    else if (result === "denied") showToast("Browser blocked push notifications");
    else showToast("Push notifications are unavailable here");
  });

  els.modalSaveAction.addEventListener("click", () => {
    if (state.activePropertyId != null) toggleFavorite(state.activePropertyId);
  });

  els.modalContactAction.addEventListener("click", () => {
    if (state.activePropertyId == null) return;
    const property = properties.find((item) => item.id === state.activePropertyId);
    if (!property) return;
    sendLeadAutomation(buildLeadAutomationPayload(property, {
      inquiryType: "quick_contact_click",
      source: "user_whatsapp_contact",
      message: `Buyer clicked WhatsApp quick contact for ${property.title}.`
    }));
  });

  els.negotiationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitNegotiation("counter");
  });

  els.acceptNegotiationButton.addEventListener("click", () => submitNegotiation("accept"));
  els.rejectNegotiationButton.addEventListener("click", () => submitNegotiation("reject"));
  els.payBookingFeeButton.addEventListener("click", payBookingFee);
  els.startLoanPackButton.addEventListener("click", startLoanPack);
  els.submitPartnerBankButton.addEventListener("click", submitPartnerBank);
  els.generateOfferButton.addEventListener("click", generateOfferLetter);
  els.buyerSignOfferButton.addEventListener("click", buyerSignOffer);

  els.bookingForm.addEventListener("submit", submitBooking);
  els.notesForm.addEventListener("submit", submitCommunityNote);
  els.timelineButton.addEventListener("click", () => {
    if (state.activePropertyId == null) return;
    const property = properties.find((item) => item.id === state.activePropertyId);
    if (!property) return;
    els.timelineOutput.textContent = buildTimelineScenario(property);
  });
  els.roastButton.addEventListener("click", () => {
    if (state.activePropertyId == null) return;
    const property = properties.find((item) => item.id === state.activePropertyId);
    if (!property) return;
    els.roastOutput.textContent = buildRoast(property);
  });
  els.negotiationName.addEventListener("change", () => {
    if (state.activePropertyId == null) return;
    const property = properties.find((item) => item.id === state.activePropertyId);
    if (property) {
      renderNegotiation(property);
      renderDealRoom(property);
    }
  });
  els.negotiationPhone.addEventListener("change", () => {
    if (state.activePropertyId == null) return;
    const property = properties.find((item) => item.id === state.activePropertyId);
    if (property) {
      renderNegotiation(property);
      renderDealRoom(property);
    }
  });

  els.arViewer.addEventListener("pointerdown", markArInteracted);
  els.arViewer.addEventListener("touchstart", markArInteracted, { passive: true });
  els.arViewer.addEventListener("camera-change", markArInteracted);

  window.addEventListener("storage", (event) => {
    if (event.key === "kvai_negotiation_threads" && state.activePropertyId != null) {
      const property = properties.find((item) => item.id === state.activePropertyId);
      if (property) {
        renderNegotiation(property);
        renderDealRoom(property);
      }
    }

    if (event.key === STORAGE_KEYS.leakProofDeals && state.activePropertyId != null) {
      const property = properties.find((item) => item.id === state.activePropertyId);
      if (property) renderDealRoom(property);
    }

    if (event.key === STORAGE_KEYS.notifications) {
      state.notifications = readStore(STORAGE_KEYS.notifications, state.notifications);
      renderMetrics();
      renderNotifications();
    }

    if (event.key === STORAGE_KEYS.buyerLiveListings || event.key === STORAGE_KEYS.backendBuyerListings) {
      refreshLiveBuyerListings(true);
    }

    if (event.key === STORAGE_KEYS.gamification) {
      state.gamification = readStore(STORAGE_KEYS.gamification, state.gamification);
      renderGamification();
    }

    if (event.key === STORAGE_KEYS.communityNotes && state.activePropertyId != null) {
      state.communityNotes = readStore(STORAGE_KEYS.communityNotes, state.communityNotes);
      const property = properties.find((item) => item.id === state.activePropertyId);
      if (property) renderCommunityNotes(property);
    }

    if (event.key === STORAGE_KEYS.globalAlert) {
      renderGlobalPlatformAlert();
    }

    if (event.key === STORAGE_KEYS.algorithmControls) {
      resetFeedWindow();
      renderDashboard();
    }
  });

  els.propertyModal.addEventListener("click", (event) => {
    if (event.target === els.propertyModal) closeModal();
  });
}

function applyInitialQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("search") || params.get("area") || "";
  const filter = params.get("filter") || "";
  if (query) {
    state.search = query;
    if (els.searchInput) els.searchInput.value = query;
  }
  if (filter && ["all", "condo", "family", "investment", "luxury"].includes(filter)) {
    state.filter = filter;
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.filter === filter);
    });
  }
}

const growthState = {
  role: "Buyer",
  goal: "Find a shortlist",
  channels: ["WhatsApp", "Email"]
};

function getGrowthElements() {
  return {
    section: document.getElementById("growth"),
    planOutput: document.getElementById("growthPlanOutput"),
    copyPlanButton: document.getElementById("copyGrowthPromptButton"),
    waitlistForm: document.getElementById("waitlistForm"),
    waitlistName: document.getElementById("waitlistName"),
    waitlistEmail: document.getElementById("waitlistEmail"),
    waitlistRole: document.getElementById("waitlistRole"),
    waitlistGoal: document.getElementById("waitlistGoal"),
    waitlistReferral: document.getElementById("waitlistReferral"),
    waitlistResult: document.getElementById("waitlistResult"),
    waitlistTotalPill: document.getElementById("waitlistTotalPill"),
    digestForm: document.getElementById("digestForm"),
    digestEmail: document.getElementById("digestEmail"),
    digestStatus: document.getElementById("digestStatus"),
    shareTitle: document.getElementById("shareTitle"),
    sharePrice: document.getElementById("sharePrice"),
    shareLocation: document.getElementById("shareLocation"),
    shareHighlights: document.getElementById("shareHighlights"),
    shareAgent: document.getElementById("shareAgent"),
    sharePhone: document.getElementById("sharePhone"),
    sharePreview: document.getElementById("propertySharePreview"),
    whatsappShareLink: document.getElementById("whatsappShareLink"),
    useTopListingButton: document.getElementById("useTopListingButton"),
    copyPropertyShareButton: document.getElementById("copyPropertyShareButton"),
    downloadPropertyShareButton: document.getElementById("downloadPropertyShareButton")
  };
}

function buildGrowthPlan() {
  const channels = growthState.channels.length ? growthState.channels.join(", ") : "WhatsApp";
  return `${growthState.role} plan: ${growthState.goal} using RealityGenius AI match scoring, verified property cards, agent trust signals, and ${channels} follow-up. Start by saving 3 listings, request 1 viewing, then invite 2 people to unlock stronger property recommendations.`;
}

function updateGrowthPlan() {
  const growthEls = getGrowthElements();
  if (growthEls.planOutput) growthEls.planOutput.textContent = buildGrowthPlan();
}

async function copyTextToClipboard(text, message = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast(message);
}

function getShareCardData() {
  const growthEls = getGrowthElements();
  return {
    title: growthEls.shareTitle?.value.trim() || "RealityGenius Featured Home",
    price: growthEls.sharePrice?.value.trim() || "Price on request",
    location: growthEls.shareLocation?.value.trim() || "Malaysia",
    highlights: growthEls.shareHighlights?.value.trim() || "Verified photos, AI match score, and WhatsApp-ready viewing flow.",
    agent: growthEls.shareAgent?.value.trim() || "RealityGenius Concierge",
    phone: growthEls.sharePhone?.value.trim() || "+60"
  };
}

function buildPropertyShareText() {
  const card = getShareCardData();
  return `${card.title}\n${card.price}\n${card.location}\n\nHighlights: ${card.highlights}\n\nContact ${card.agent}: ${card.phone}\nRealityGenius: ${window.location.origin}/user.html#growth`;
}

function updateSharePreview() {
  const growthEls = getGrowthElements();
  if (!growthEls.sharePreview) return;
  const card = getShareCardData();
  const shareText = buildPropertyShareText();

  growthEls.sharePreview.innerHTML = `
    <div>
      <span>RealityGenius card</span>
      <h4>${escapeHtml(card.title)}</h4>
      <p>${escapeHtml(card.location)}</p>
    </div>
    <div>
      <strong>${escapeHtml(card.price)}</strong>
      <p>${escapeHtml(card.highlights)}</p>
    </div>
    <small>${escapeHtml(card.agent)} - ${escapeHtml(card.phone)}</small>
  `;

  if (growthEls.whatsappShareLink) {
    growthEls.whatsappShareLink.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }
}

function useTopListingForShareCard() {
  const growthEls = getGrowthElements();
  const property = filteredProperties()[0] || properties[0];
  if (!property) return;

  if (growthEls.shareTitle) growthEls.shareTitle.value = property.title || "RealityGenius Featured Home";
  if (growthEls.sharePrice) growthEls.sharePrice.value = money(property.price);
  if (growthEls.shareLocation) growthEls.shareLocation.value = property.location || property.area || "Malaysia";
  if (growthEls.shareHighlights) {
    growthEls.shareHighlights.value = `${property.beds || 0} bed, ${property.baths || 0} bath, ${property.yield || 0}% yield, ${property.growth || 0}% growth. ${property.summary || "Verified listing with AI match context."}`;
  }
  updateSharePreview();
  showToast("Top listing loaded into share card");
}

function drawShareCard() {
  const card = getShareCardData();
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) return;

  const gradient = context.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#0f766e");
  gradient.addColorStop(0.52, "#b55a38");
  gradient.addColorStop(1, "#201714");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1350);

  context.fillStyle = "rgba(255,250,245,0.94)";
  context.fillRect(72, 72, 936, 1206);
  context.fillStyle = "#201714";
  context.fillRect(104, 104, 872, 420);

  context.fillStyle = "#fffaf5";
  context.font = "700 34px Arial";
  context.fillText("REALITYGENIUS PROPERTY CARD", 144, 170);
  context.font = "700 72px Arial";
  wrapCanvasText(context, card.title, 144, 398, 780, 78);

  context.fillStyle = "#201714";
  context.font = "700 64px Arial";
  context.fillText(card.price, 144, 660);
  context.font = "400 34px Arial";
  context.fillStyle = "#75675d";
  wrapCanvasText(context, card.location, 144, 724, 780, 42);

  context.fillStyle = "#0f766e";
  context.fillRect(144, 818, 130, 9);
  context.fillStyle = "#201714";
  context.font = "700 40px Arial";
  context.fillText("Highlights", 144, 902);
  context.font = "400 32px Arial";
  context.fillStyle = "#75675d";
  wrapCanvasText(context, card.highlights, 144, 960, 780, 43);

  context.fillStyle = "#201714";
  context.font = "700 34px Arial";
  context.fillText(card.agent, 144, 1190);
  context.font = "400 30px Arial";
  context.fillStyle = "#75675d";
  context.fillText(card.phone, 144, 1234);

  const link = document.createElement("a");
  link.download = `${card.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "realitygenius"}-property-card.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const words = String(text || "").split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word, index) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = nextLine;
    }

    if (index === words.length - 1) context.fillText(line, x, currentY);
  });
}

async function refreshWaitlistSummary() {
  const growthEls = getGrowthElements();
  if (!growthEls.waitlistTotalPill) return;

  try {
    const response = await fetch("/api/waitlist");
    const data = await response.json();
    if (response.ok) growthEls.waitlistTotalPill.textContent = `${data.total || 0} joined`;
  } catch {
    growthEls.waitlistTotalPill.textContent = "Join now";
  }
}

async function submitWaitlist(event) {
  event.preventDefault();
  const growthEls = getGrowthElements();
  const button = growthEls.waitlistForm?.querySelector("button[type='submit']");
  if (button) button.disabled = true;

  try {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: growthEls.waitlistName?.value,
        email: growthEls.waitlistEmail?.value,
        role: growthEls.waitlistRole?.value,
        goal: growthEls.waitlistGoal?.value,
        referredBy: growthEls.waitlistReferral?.value
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Waitlist signup failed");

    const result = payload.data;
    growthEls.waitlistResult.classList.add("is-visible");
    growthEls.waitlistResult.innerHTML = `
      <strong>Position #${result.position}</strong><br>
      Invite code: <strong>${escapeHtml(result.entry.referralCode)}</strong><br>
      Rewards: <strong>${result.entry.rewardPoints} pts</strong>
      <button class="ghost-button" id="copyReferralButton" type="button">
        <i class="fa-regular fa-copy"></i>
        Copy Referral Link
      </button>
    `;
    document.getElementById("copyReferralButton")?.addEventListener("click", () => copyTextToClipboard(result.referralUrl, "Referral link copied"));
    if (growthEls.waitlistTotalPill) growthEls.waitlistTotalPill.textContent = `${result.total || 0} joined`;
    showToast(result.isExisting ? "Waitlist profile updated" : "Waitlist spot reserved");
  } catch (error) {
    growthEls.waitlistResult.classList.add("is-visible");
    growthEls.waitlistResult.textContent = error.message || "Waitlist signup failed";
  } finally {
    if (button) button.disabled = false;
  }
}

async function submitDigest(event) {
  event.preventDefault();
  const growthEls = getGrowthElements();
  const topics = [...growthEls.digestForm.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
  const button = growthEls.digestForm?.querySelector("button[type='submit']");
  if (button) button.disabled = true;

  try {
    const response = await fetch("/api/digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: growthEls.digestEmail?.value,
        topics
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Digest signup failed");
    growthEls.digestStatus.textContent = payload.isExisting ? "Digest preferences updated." : `Subscribed. ${payload.total || 1} readers are on the weekly list.`;
    showToast("Weekly digest saved");
  } catch (error) {
    growthEls.digestStatus.textContent = error.message || "Digest signup failed";
  } finally {
    if (button) button.disabled = false;
  }
}

function initGrowthSuite() {
  const growthEls = getGrowthElements();
  if (!growthEls.section) return;

  const referralCode = new URLSearchParams(window.location.search).get("ref");
  if (referralCode && growthEls.waitlistReferral) growthEls.waitlistReferral.value = referralCode.toUpperCase();

  document.querySelectorAll("[data-growth-role]").forEach((button) => {
    button.addEventListener("click", () => {
      growthState.role = button.dataset.growthRole;
      document.querySelectorAll("[data-growth-role]").forEach((item) => item.classList.toggle("is-active", item === button));
      updateGrowthPlan();
    });
  });

  document.querySelectorAll("[data-growth-goal]").forEach((button) => {
    button.addEventListener("click", () => {
      growthState.goal = button.dataset.growthGoal;
      document.querySelectorAll("[data-growth-goal]").forEach((item) => item.classList.toggle("is-active", item === button));
      updateGrowthPlan();
    });
  });

  document.querySelectorAll("[data-growth-channel]").forEach((button) => {
    button.addEventListener("click", () => {
      const channel = button.dataset.growthChannel;
      const isActive = growthState.channels.includes(channel);
      growthState.channels = isActive ? growthState.channels.filter((item) => item !== channel) : [...growthState.channels, channel];
      button.classList.toggle("is-active", !isActive);
      updateGrowthPlan();
    });
  });

  growthEls.copyPlanButton?.addEventListener("click", () => copyTextToClipboard(buildGrowthPlan(), "Growth plan copied"));
  growthEls.waitlistForm?.addEventListener("submit", submitWaitlist);
  growthEls.digestForm?.addEventListener("submit", submitDigest);
  growthEls.useTopListingButton?.addEventListener("click", useTopListingForShareCard);
  growthEls.copyPropertyShareButton?.addEventListener("click", () => copyTextToClipboard(buildPropertyShareText(), "Property share text copied"));
  growthEls.downloadPropertyShareButton?.addEventListener("click", drawShareCard);

  [
    growthEls.shareTitle,
    growthEls.sharePrice,
    growthEls.shareLocation,
    growthEls.shareHighlights,
    growthEls.shareAgent,
    growthEls.sharePhone
  ].forEach((input) => input?.addEventListener("input", updateSharePreview));

  updateGrowthPlan();
  updateSharePreview();
  refreshWaitlistSummary();
}

initGrowthSuite();
applyInitialQueryParams();
bindEvents();
renderDashboard();
hydrateBackendLiveListings();
