const STORAGE_KEYS = {
  agentLeads: "kvai_agent_leads",
  agentClients: "kvai_agent_clients",
  agentListings: "kvai_agent_listings",
  agentNotifications: "kvai_agent_notifications",
  agentAutomation: "kvai_agent_automation",
  agentDocumentVault: "kvai_agent_document_vault",
  agentItinerary: "kvai_agent_itinerary",
  agentCobroke: "kvai_agent_cobroke",
  agentCheatSheet: "kvai_agent_cheat_sheet",
  agentReferral: "kvai_agent_referral_autopilot",
  agentContentCreator: "kvai_agent_content_creator",
  agentSubscription: "kvai_agent_subscription",
  buyerLiveListings: "rg_live_buyer_listings",
  adminListings: "rg_admin_listings",
  adminNotifications: "rg_admin_notifications",
  listingAnalytics: "rg_listing_analytics",
  listingCollabs: "rg_listing_agent_collabs",
  collabRequests: "rg_agent_collab_requests",
  leakProofDeals: "kvai_leak_proof_deals",
  globalAlert: "rg_global_platform_alert"
};

const FREE_LAUNCH_MODE = false;

// Direct Stripe Payment Links - agents redirect straight to Stripe's
// hosted page (client_reference_id + prefilled_email appended at click
// time so the webhook can match the payment back to this agent).
const AGENT_PLAN_TIERS = [
  {
    id: "starter",
    billingPlan: "starter_rg",
    name: "Starter RG",
    price: 29,
    trialDays: 0,
    paymentLinkUrl: "https://buy.stripe.com/3cI5kwbHJ2Hgf7r1TG3Nm00",
    tagline: "For solo agents who want content and faster listing preparation.",
    badge: "Entry",
    features: ["Everything in Free", "AI Content Creator", "WhatsApp follow-up captions", "AI AR Builder demo preview", "Smart listing checklist"]
  },
  {
    id: "pro",
    billingPlan: "pro_agent",
    name: "Pro Agent",
    price: 59,
    trialDays: 30,
    paymentLinkUrl: "https://buy.stripe.com/4gMbIU5jla9I9N769W3Nm01",
    tagline: "For active agents running serious buyer pipelines and premium listings.",
    badge: "Recommended",
    features: ["Everything in Starter RG", "AI Document Vault", "DSR calculator", "Smart viewing itinerary", "Co-broke matchmaker", "1 Friday Auction Night slot", "30 days free trial"]
  },
  {
    id: "elite",
    billingPlan: "elite_agent",
    name: "Elite Agent",
    price: 99,
    trialDays: 30,
    paymentLinkUrl: "https://buy.stripe.com/8x2cMY5jlepY1gB1TG3Nm02",
    tagline: "For agents who want the full automation engine.",
    badge: "Best Value",
    features: ["Everything in Pro Agent", "Extra Friday Auction Night slot", "Referral autopilot", "Team setup support", "30 days free trial"]
  }
];

const EXTRA_AUCTION_SLOT = {
  name: "Extra Auction Slot",
  price: 49,
  trialDays: 30,
  paymentLinkUrl: "https://buy.stripe.com/dRm9AMcLN1Dce3n1TG3Nm03"
};

const FREE_AGENT_PLAN = {
  id: "free",
  name: "Free Agent",
  price: 0,
  tagline: "Basic dashboard access",
  badge: "Free",
  features: ["Upload listings", "Basic profile", "Normal dashboard"]
};

const PLAN_FEATURES = {
  free: {
    addListing: true,
    aiCaption: true,
    aiNegotiation: true,
    leadHeat: true,
    auctionSlot: true,
    premiumBadge: true
  },
  starter: {
    addListing: true,
    aiCaption: true,
    aiNegotiation: false,
    leadHeat: false,
    auctionSlot: false,
    premiumBadge: false
  },
  pro: {
    addListing: true,
    aiCaption: true,
    aiNegotiation: true,
    leadHeat: true,
    auctionSlot: false,
    premiumBadge: true
  },
  elite: {
    addListing: true,
    aiCaption: true,
    aiNegotiation: true,
    leadHeat: true,
    auctionSlot: true,
    premiumBadge: true
  }
};

const FEATURE_UNLOCK_COPY = {
  aiCaption: { plan: "starter", label: "AI Content Creator", message: "AI Content Creator unlocks with Starter, Pro, or Elite." },
  aiNegotiation: { plan: "pro", label: "AI Negotiation", message: "AI Negotiation unlocks with Pro or Elite." },
  leadHeat: { plan: "pro", label: "Lead Heat", message: "Lead scoring and hot lead tools unlock with Pro or Elite." },
  auctionSlot: { plan: "elite", label: "Friday Auction Night", message: "Auction Night slots unlock with Elite." },
  premiumBadge: { plan: "pro", label: "Premium Badge", message: "Premium agent badge unlocks with Pro or Elite." }
};

const BACKEND_PLAN_TO_AGENT_PLAN = {
  free: "free",
  starter_rg: "starter",
  pro_agent: "pro",
  elite_agent: "elite",
  best_closers: "elite"
};

const seedSubscription = {
  planId: "free",
  planName: "Free Agent",
  amount: 0,
  currency: "MYR",
  status: "free",
  testMode: false,
  startedAt: new Date().toISOString(),
  checkoutId: "free_agent"
};

const seedLeads = [];

const seedClients = [];

const seedListings = window.RealtyGeniusAgentListings || [];

const LISTING_REQUIRED_MEDIA_SLOTS = [
  { key: "front_view_link", label: "Front View", required: true, aliases: ["image_link", "front_view", "front_image_link"] },
  { key: "top_view_link", label: "Top View", required: true, aliases: ["top_view", "drone_view_link"] },
  { key: "room_1_link", label: "Room 1", required: true, aliases: ["room_link", "bedroom_link", "room_1"] },
  { key: "bathroom_link", label: "Bathroom", required: true, aliases: ["bathroom", "bath_link"] }
];

const LISTING_OPTIONAL_MEDIA_SLOTS = [
  { key: "kitchen_link", label: "Kitchen", aliases: ["kitchen", "kitchen_photo_link"] },
  { key: "photo_6_link", label: "Living Area" },
  { key: "photo_7_link", label: "Room 2" },
  { key: "photo_8_link", label: "Facilities" },
  { key: "photo_9_link", label: "Parking / Lobby" },
  { key: "photo_10_link", label: "Balcony / View" }
];

const LISTING_MEDIA_SLOTS = [
  ...LISTING_REQUIRED_MEDIA_SLOTS,
  ...LISTING_OPTIONAL_MEDIA_SLOTS
];

const LISTING_DEVICE_PHOTO_LIMIT = 10;
const LISTING_MIN_PHOTO_COUNT = 4;
const LISTING_RECOMMENDED_PHOTO_COUNT = 10;
const LISTING_DEVICE_IMAGE_MAX_SIZE = 1200;
const LISTING_DEVICE_IMAGE_QUALITY = 0.64;
const LISTING_PANO_PHOTO_LIMIT = 3;
const LISTING_PANO_IMAGE_MAX_SIZE = 4096;
const LISTING_PANO_IMAGE_QUALITY = 0.8;
const LIVE_LISTING_SAVE_ERROR = "Listing could not be saved live. Backend/Supabase connection failed.";

const LISTING_EXCEL_BASE_COLUMNS = [
  "title",
  "area",
  "price",
  "status",
  "property_type",
  "address",
  "landlord_name",
  "landlord_phone"
];

const LISTING_EXCEL_REQUIRED_COLUMNS = [
  ...LISTING_EXCEL_BASE_COLUMNS,
  ...LISTING_REQUIRED_MEDIA_SLOTS.map((slot) => slot.key)
];

const LISTING_EXCEL_OPTIONAL_COLUMNS = [
  ...LISTING_OPTIONAL_MEDIA_SLOTS.map((slot) => slot.key),
  "ar_link",
  "description"
];

const LISTING_EXCEL_HEADERS = [
  ...LISTING_EXCEL_REQUIRED_COLUMNS,
  ...LISTING_EXCEL_OPTIONAL_COLUMNS,
  "maintenance_fee",
  "developer",
  "enquiries",
  "transaction_1_date",
  "transaction_1_price",
  "transaction_1_note",
  "transaction_2_date",
  "transaction_2_price",
  "transaction_2_note",
  "transaction_3_date",
  "transaction_3_price",
  "transaction_3_note"
];

const LISTING_EXCEL_SAMPLE_ROW = {
  title: "Dwi Aurora Residence @ Petaling Jaya",
  area: "Petaling Jaya",
  price: 631000,
  status: "Pending QC",
  property_type: "Condo",
  address: "Jalan Sri Manja, Pjs 3, 46000 Petaling Jaya, Selangor",
  landlord_name: "Arvind Govindasamy",
  landlord_phone: "60123456789",
  front_view_link: "https://drive.google.com/file/d/FRONT_VIEW_IMAGE_FILE_ID/view?usp=sharing",
  top_view_link: "https://drive.google.com/file/d/TOP_VIEW_IMAGE_FILE_ID/view?usp=sharing",
  room_1_link: "https://drive.google.com/file/d/ROOM_1_IMAGE_FILE_ID/view?usp=sharing",
  bathroom_link: "https://drive.google.com/file/d/BATHROOM_IMAGE_FILE_ID/view?usp=sharing",
  kitchen_link: "https://drive.google.com/file/d/KITCHEN_IMAGE_FILE_ID/view?usp=sharing",
  photo_6_link: "https://drive.google.com/file/d/LIVING_AREA_IMAGE_FILE_ID/view?usp=sharing",
  photo_7_link: "https://drive.google.com/file/d/ROOM_2_IMAGE_FILE_ID/view?usp=sharing",
  photo_8_link: "https://drive.google.com/file/d/FACILITIES_IMAGE_FILE_ID/view?usp=sharing",
  photo_9_link: "https://drive.google.com/file/d/PARKING_LOBBY_IMAGE_FILE_ID/view?usp=sharing",
  photo_10_link: "https://drive.google.com/file/d/BALCONY_VIEW_IMAGE_FILE_ID/view?usp=sharing",
  ar_link: "https://drive.google.com/file/d/GOOGLE_DRIVE_GLB_FILE_ID/view?usp=sharing",
  maintenance_fee: "Confirm with developer sales package",
  developer: "IQI Global project listing",
  enquiries: 0,
  transaction_1_date: "Current",
  transaction_1_price: 631000,
  transaction_1_note: "Starting from price in uploaded IQI CSV",
  transaction_2_date: "Benchmark",
  transaction_2_price: 605760,
  transaction_2_note: "Internal comparison anchor",
  transaction_3_date: "Offer guide",
  transaction_3_price: 580520,
  transaction_3_note: "Negotiation reference only"
};

const areaRouteProfiles = {
  ...(window.RealtyGeniusAreaRouteProfiles || {}),
  "KL Sentral": { lat: 3.134, lng: 101.6869, traffic: 1.18 },
  "Mont Kiara": { lat: 3.1699, lng: 101.6525, traffic: 1.24 },
  "Bukit Jalil": { lat: 3.055, lng: 101.69, traffic: 1.16 },
  "Bangsar": { lat: 3.128, lng: 101.679, traffic: 1.2 },
  "Petaling Jaya": { lat: 3.1073, lng: 101.6067, traffic: 1.18 },
  "Desa ParkCity": { lat: 3.1876, lng: 101.6283, traffic: 1.22 }
};

const listingRouteEnhancements = {};

const seedNotifications = [];

const seedAutomation = {
  overnight: {
    bookedViewings: 0,
    leadJumps: 0,
    landlordWins: 0,
    whatsappReplies: 0,
    contractsPrepared: 0
  },
  channels: []
};

const seedDocumentVault = {
  magicLink: "",
  buyerName: "",
  buyerPhone: "",
  docs: [
    { type: "IC", fileName: "Waiting for upload", status: "Missing", extracted: "Identity verification pending" },
    { type: "Payslip", fileName: "Waiting for upload", status: "Missing", extracted: "Salary not extracted" },
    { type: "Bank statement", fileName: "Waiting for upload", status: "Missing", extracted: "Commitments not extracted" }
  ],
  result: null
};

const nextSaturday = new Date();
nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));

const seedItinerary = {
  buyerName: "",
  date: nextSaturday.toISOString().slice(0, 10),
  startTime: "10:00",
  startArea: "KL Sentral",
  selectedIds: [],
  shareLink: "",
  routeProvider: "Google Maps API ready",
  totalTravelMinutes: 0,
  stops: []
};

const seedCobroke = {
  requirements: {
    location: "",
    budget: 0,
    propertyType: "Condo",
    buyerAgent: ""
  },
  selectedMatchId: null,
  matches: []
};

const seedCheatSheet = {
  propertyId: null,
  generatedBy: "",
  content: null
};

const defaultReferralCloseDate = new Date();
defaultReferralCloseDate.setFullYear(defaultReferralCloseDate.getFullYear() - 1);

const seedReferral = {
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  propertyId: null,
  closeDate: defaultReferralCloseDate.toISOString().slice(0, 10),
  closedPrice: 0,
  scheduler: {
    cron: "0 9 * * *",
    timezone: "Asia/Kuala_Lumpur",
    lastRunAt: null
  },
  campaigns: []
};

const seedContentCreator = {
  contentType: "Listing Description",
  output: "",
  status: "Ready",
  statusType: "",
  lastEnhancement: null,
  photoAnalysis: [],
  history: []
};

const state = {
  section: "overview",
  leadFilter: "all",
  leads: readStore(STORAGE_KEYS.agentLeads, seedLeads),
  clients: readStore(STORAGE_KEYS.agentClients, seedClients),
  listings: readStore(STORAGE_KEYS.agentListings, seedListings),
  notifications: readStore(STORAGE_KEYS.agentNotifications, seedNotifications),
  automation: readStore(STORAGE_KEYS.agentAutomation, seedAutomation),
  documentVault: readStore(STORAGE_KEYS.agentDocumentVault, seedDocumentVault),
  itinerary: readStore(STORAGE_KEYS.agentItinerary, seedItinerary),
  cobroke: readStore(STORAGE_KEYS.agentCobroke, seedCobroke),
  cheatSheet: readStore(STORAGE_KEYS.agentCheatSheet, seedCheatSheet),
  referral: readStore(STORAGE_KEYS.agentReferral, seedReferral),
  contentCreator: readStore(STORAGE_KEYS.agentContentCreator, seedContentCreator),
  subscription: readStore(STORAGE_KEYS.agentSubscription, seedSubscription)
};

function removeAgentDemoRows() {
  const demoNames = new Set(["Alya Tan", "Daniel Wong", "Nur Iman", "Harith Lim", "Megan Lee"]);
  const demoNotificationTitles = new Set(["IQI project inventory loaded", "Developer package checks needed"]);
  state.leads = state.leads.filter((lead) => !demoNames.has(lead.name));
  state.clients = state.clients.filter((client) => !demoNames.has(client.name));
  state.notifications = state.notifications.filter((notice) => !demoNotificationTitles.has(notice.title));
  if (!state.automation?.channels?.length) {
    state.automation = seedAutomation;
  } else {
    state.automation = {
      ...state.automation,
      channels: state.automation.channels.filter((channel) => !["voice-qualification", "whatsapp-automation", "landlord-voice"].includes(channel.id))
    };
  }
  if (state.documentVault?.buyerName === "Aina Rahman") state.documentVault = seedDocumentVault;
  if (state.itinerary?.buyerName === "Alya Tan") state.itinerary = seedItinerary;
  if (state.cobroke?.requirements?.buyerAgent === "Agent Farah") state.cobroke = seedCobroke;
  if (state.referral?.clientName === "Nur Iman") state.referral = seedReferral;
  if (state.subscription?.testMode || state.subscription?.status === "test_active") state.subscription = seedSubscription;
  writeStore(STORAGE_KEYS.agentLeads, state.leads);
  writeStore(STORAGE_KEYS.agentClients, state.clients);
  writeStore(STORAGE_KEYS.agentNotifications, state.notifications);
  writeStore(STORAGE_KEYS.agentAutomation, state.automation);
  writeStore(STORAGE_KEYS.agentDocumentVault, state.documentVault);
  writeStore(STORAGE_KEYS.agentItinerary, state.itinerary);
  writeStore(STORAGE_KEYS.agentCobroke, state.cobroke);
  writeStore(STORAGE_KEYS.agentReferral, state.referral);
  writeStore(STORAGE_KEYS.agentSubscription, state.subscription);
}

let contentHistoryHydrated = false;
let listingDevicePhotos = [];
let listingPanoPhotos = [];
let listingEnhancerPhotos = [];

const els = {
  navItems: [...document.querySelectorAll(".nav-item")],
  shortcutItems: [...document.querySelectorAll(".shortcut-pill[data-section]")],
  panels: [...document.querySelectorAll("[data-panel]")],
  leadFilters: [...document.querySelectorAll("[data-lead-filter]")],
  hotLeadCount: document.getElementById("hotLeadCount"),
  clientCount: document.getElementById("clientCount"),
  pendingCommission: document.getElementById("pendingCommission"),
  listingCount: document.getElementById("listingCount"),
  notificationCount: document.getElementById("notificationCount"),
  liveAgentName: document.getElementById("liveAgentName"),
  liveAgentAgency: document.getElementById("liveAgentAgency"),
  liveAgentRen: document.getElementById("liveAgentRen"),
  liveAgentRank: document.getElementById("liveAgentRank"),
  liveAgentAvatar: document.querySelector(".live-agent-avatar"),
  agentProfileForm: document.getElementById("agentProfileForm"),
  agentProfileNameInput: document.getElementById("agentProfileNameInput"),
  agentProfileAgencyInput: document.getElementById("agentProfileAgencyInput"),
  agentProfileRenInput: document.getElementById("agentProfileRenInput"),
  agentProfilePhotoInput: document.getElementById("agentProfilePhotoInput"),
  agentProfilePhotoPreview: document.getElementById("agentProfilePhotoPreview"),
  agentProfilePreviewName: document.getElementById("agentProfilePreviewName"),
  agentProfilePreviewAgency: document.getElementById("agentProfilePreviewAgency"),
  agentProfilePreviewRen: document.getElementById("agentProfilePreviewRen"),
  agentRankChip: document.getElementById("agentRankChip"),
  agentRankMeter: document.getElementById("agentRankMeter"),
  agentRankReason: document.getElementById("agentRankReason"),
  commandBrief: document.getElementById("commandBrief"),
  commandCards: document.getElementById("commandCards"),
  actionQueue: document.getElementById("actionQueue"),
  automationBoard: document.getElementById("automationBoard"),
  roadmapBoard: document.getElementById("roadmapBoard"),
  leadPipeline: document.getElementById("leadPipeline"),
  commissionSummary: document.getElementById("commissionSummary"),
  leadList: document.getElementById("leadList"),
  clientList: document.getElementById("clientList"),
  commissionTable: document.getElementById("commissionTable"),
  listingGrid: document.getElementById("listingGrid"),
  agentNegotiationList: document.getElementById("agentNegotiationList"),
  leakProofDealBoard: document.getElementById("leakProofDealBoard"),
  notificationButton: document.getElementById("notificationButton"),
  pushPermissionButton: document.getElementById("pushPermissionButton"),
  pushStatus: document.getElementById("pushStatus"),
  quickLeadButton: document.getElementById("quickLeadButton"),
  billingButton: document.getElementById("billingButton"),
  agentBillingStrip: document.getElementById("agentBillingStrip"),
  openListingComposer: document.getElementById("openListingComposer"),
  notificationDrawer: document.getElementById("notificationDrawer"),
  notificationList: document.getElementById("notificationList"),
  leadModal: document.getElementById("leadModal"),
  listingModal: document.getElementById("listingModal"),
  documentVaultModal: document.getElementById("documentVaultModal"),
  itineraryModal: document.getElementById("itineraryModal"),
  cobrokeModal: document.getElementById("cobrokeModal"),
  cheatSheetModal: document.getElementById("cheatSheetModal"),
  referralModal: document.getElementById("referralModal"),
  billingModal: document.getElementById("billingModal"),
  leadForm: document.getElementById("leadForm"),
  listingForm: document.getElementById("listingForm"),
  listingQcScore: document.getElementById("listingQcScore"),
  listingQcChecklist: document.getElementById("listingQcChecklist"),
  listingSubmitButton: document.getElementById("listingSubmitButton"),
  documentVaultForm: document.getElementById("documentVaultForm"),
  itineraryForm: document.getElementById("itineraryForm"),
  cobrokeForm: document.getElementById("cobrokeForm"),
  cheatSheetForm: document.getElementById("cheatSheetForm"),
  referralForm: document.getElementById("referralForm"),
  leadName: document.getElementById("leadName"),
  leadPhone: document.getElementById("leadPhone"),
  leadArea: document.getElementById("leadArea"),
  leadTemperature: document.getElementById("leadTemperature"),
  listingTitle: document.getElementById("listingTitle"),
  listingArea: document.getElementById("listingArea"),
  listingPrice: document.getElementById("listingPrice"),
  listingStatus: document.getElementById("listingStatus"),
  listingAddress: document.getElementById("listingAddress"),
  listingPropertyType: document.getElementById("listingPropertyType"),
  listingPurpose: document.getElementById("listingPurpose"),
  listingPurposeSale: document.getElementById("listingPurposeSale"),
  listingPurposeRent: document.getElementById("listingPurposeRent"),
  listingLandlordName: document.getElementById("listingLandlordName"),
  listingLandlordPhone: document.getElementById("listingLandlordPhone"),
  listingImageLink: document.getElementById("listingImageLink"),
  listingTopViewLink: document.getElementById("listingTopViewLink"),
  listingRoom1Link: document.getElementById("listingRoom1Link"),
  listingBathroomLink: document.getElementById("listingBathroomLink"),
  listingKitchenLink: document.getElementById("listingKitchenLink"),
  listingExtraPhotoLinks: document.getElementById("listingExtraPhotoLinks"),
  listingBulkPhotoLinks: document.getElementById("listingBulkPhotoLinks"),
  autoFillListingPhotos: document.getElementById("autoFillListingPhotos"),
  listingDevicePhotos: document.getElementById("listingDevicePhotos"),
  listingDevicePhotoPreview: document.getElementById("listingDevicePhotoPreview"),
  listingDevicePhotoStatus: document.getElementById("listingDevicePhotoStatus"),
  listingPanoPhotos: document.getElementById("listingPanoPhotos"),
  listingPanoPhotoPreview: document.getElementById("listingPanoPhotoPreview"),
  listingPanoPhotoStatus: document.getElementById("listingPanoPhotoStatus"),
  listingDescription: document.getElementById("listingDescription"),
  listingDescriptionCount: document.getElementById("listingDescriptionCount"),
  listingArLink: document.getElementById("listingArLink"),
  listingExcelInput: document.getElementById("listingExcelInput"),
  listingImportStatus: document.getElementById("listingImportStatus"),
  listingHubStatus: document.getElementById("listingHubStatus"),
  downloadListingTemplate: document.getElementById("downloadListingTemplate"),
  downloadListingTemplateHub: document.getElementById("downloadListingTemplateHub"),
  listingExcelQuickInput: document.getElementById("listingExcelQuickInput"),
  quickDeviceListingUpload: document.getElementById("quickDeviceListingUpload"),
  routineTierBadge: document.getElementById("routineTierBadge"),
  routineTierLabel: document.getElementById("routineTierLabel"),
  routineStreakDays: document.getElementById("routineStreakDays"),
  routinePointsTotal: document.getElementById("routinePointsTotal"),
  routineTierProgress: document.getElementById("routineTierProgress"),
  routineTierNext: document.getElementById("routineTierNext"),
  routineCheckLogin: document.getElementById("routineCheckLogin"),
  routineCheckListing: document.getElementById("routineCheckListing"),
  routineCheckLeads: document.getElementById("routineCheckLeads"),
  routineQuickList: document.getElementById("routineQuickList"),
  routineRepeatListing: document.getElementById("routineRepeatListing"),
  routineRank: document.getElementById("routineRank"),
  routineRankText: document.getElementById("routineRankText"),
  listingPipelineStrip: document.getElementById("listingPipelineStrip"),
  pipelinePendingCount: document.getElementById("pipelinePendingCount"),
  pipelineLiveCount: document.getElementById("pipelineLiveCount"),
  pipelineRejectedCount: document.getElementById("pipelineRejectedCount"),
  pipelineDraftCount: document.getElementById("pipelineDraftCount"),
  overviewJumpListings: document.getElementById("overviewJumpListings"),
  overviewDownloadListingTemplate: document.getElementById("overviewDownloadListingTemplate"),
  overviewListingExcelInput: document.getElementById("overviewListingExcelInput"),
  overviewDeviceListingUpload: document.getElementById("overviewDeviceListingUpload"),
  overviewListingStatus: document.getElementById("overviewListingStatus"),
  stepOneUploadListing: document.getElementById("stepOneUploadListing"),
  stepOneOpenListings: document.getElementById("stepOneOpenListings"),
  vaultBuyerName: document.getElementById("vaultBuyerName"),
  vaultBuyerPhone: document.getElementById("vaultBuyerPhone"),
  vaultSalary: document.getElementById("vaultSalary"),
  vaultCommitments: document.getElementById("vaultCommitments"),
  vaultIcFile: document.getElementById("vaultIcFile"),
  vaultPayslipFile: document.getElementById("vaultPayslipFile"),
  vaultBankFile: document.getElementById("vaultBankFile"),
  vaultMagicLink: document.getElementById("vaultMagicLink"),
  vaultDocGrid: document.getElementById("vaultDocGrid"),
  vaultDsrResult: document.getElementById("vaultDsrResult"),
  itineraryBuyerName: document.getElementById("itineraryBuyerName"),
  itineraryDate: document.getElementById("itineraryDate"),
  itineraryStartTime: document.getElementById("itineraryStartTime"),
  itineraryStartArea: document.getElementById("itineraryStartArea"),
  itinerarySelectedCount: document.getElementById("itinerarySelectedCount"),
  itineraryPropertyList: document.getElementById("itineraryPropertyList"),
  itineraryShareLink: document.getElementById("itineraryShareLink"),
  itinerarySummary: document.getElementById("itinerarySummary"),
  itineraryTimeline: document.getElementById("itineraryTimeline"),
  landlordMessageList: document.getElementById("landlordMessageList"),
  cobrokeLocation: document.getElementById("cobrokeLocation"),
  cobrokeBudget: document.getElementById("cobrokeBudget"),
  cobrokePropertyType: document.getElementById("cobrokePropertyType"),
  cobrokeBuyerAgent: document.getElementById("cobrokeBuyerAgent"),
  cobrokeSummary: document.getElementById("cobrokeSummary"),
  cobrokeMatchList: document.getElementById("cobrokeMatchList"),
  cobrokeAgreement: document.getElementById("cobrokeAgreement"),
  cheatPropertyId: document.getElementById("cheatPropertyId"),
  cheatSheetResult: document.getElementById("cheatSheetResult"),
  referralClientName: document.getElementById("referralClientName"),
  referralClientPhone: document.getElementById("referralClientPhone"),
  referralClientEmail: document.getElementById("referralClientEmail"),
  referralPropertyId: document.getElementById("referralPropertyId"),
  referralCloseDate: document.getElementById("referralCloseDate"),
  referralClosedPrice: document.getElementById("referralClosedPrice"),
  referralSummary: document.getElementById("referralSummary"),
  referralTimeline: document.getElementById("referralTimeline"),
  referralDrafts: document.getElementById("referralDrafts"),
  contentCreatorForm: document.getElementById("contentCreatorForm"),
  contentPropertyTitle: document.getElementById("contentPropertyTitle"),
  contentLocation: document.getElementById("contentLocation"),
  contentPropertyType: document.getElementById("contentPropertyType"),
  contentPrice: document.getElementById("contentPrice"),
  contentBedrooms: document.getElementById("contentBedrooms"),
  contentBathrooms: document.getElementById("contentBathrooms"),
  contentHighlights: document.getElementById("contentHighlights"),
  contentTargetAudience: document.getElementById("contentTargetAudience"),
  listingEnhancerPhotos: document.getElementById("listingEnhancerPhotos"),
  listingEnhancerPhotoStatus: document.getElementById("listingEnhancerPhotoStatus"),
  listingEnhancerPhotoPreview: document.getElementById("listingEnhancerPhotoPreview"),
  enhancerScoreGrid: document.getElementById("enhancerScoreGrid"),
  enhancerOriginal: document.getElementById("enhancerOriginal"),
  enhancerKeywords: document.getElementById("enhancerKeywords"),
  enhancerPortalOutputs: document.getElementById("enhancerPortalOutputs"),
  saveEnhancedListingButton: document.getElementById("saveEnhancedListingButton"),
  submitEnhancedListingButton: document.getElementById("submitEnhancedListingButton"),
  contentTypeButtons: [...document.querySelectorAll("[data-content-type]")],
  generateContentButton: document.getElementById("generateContentButton"),
  contentStatus: document.getElementById("contentStatus"),
  contentOutput: document.getElementById("contentOutput"),
  copyContentButton: document.getElementById("copyContentButton"),
  contentHistory: document.getElementById("contentHistory"),
  agentTierGrid: document.getElementById("agentTierGrid"),
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

function readListingAnalyticsStore() {
  return readStore(STORAGE_KEYS.listingAnalytics, {});
}

function activeViewerCount(analytics = {}) {
  const cutoff = Date.now() - 5 * 60 * 1000;
  return Object.values(analytics.activeViewers || {}).filter((timestamp) => {
    const time = new Date(timestamp).getTime();
    return Number.isFinite(time) && time >= cutoff;
  }).length;
}

function listingAnalyticsFor(listing = {}) {
  const store = readListingAnalyticsStore();
  const keys = [
    listing.id,
    listing.backendId,
    listing.agentListingId,
    listing.sourceListingId,
    listing.publicListingId
  ].filter((value) => value != null).map(String);
  return keys.map((key) => store[key]).find(Boolean) || {};
}

function collabsForListing(listing = {}) {
  const store = readStore(STORAGE_KEYS.listingCollabs, {});
  const keys = [
    listing.id,
    listing.backendId,
    listing.agentListingId,
    listing.sourceListingId,
    listing.publicListingId
  ].filter((value) => value != null).map(String);
  const record = keys.map((key) => store[key]).find(Boolean) || {};
  return Array.isArray(record.agents) ? record.agents : [];
}

function readCollabRequests() {
  return readStore(STORAGE_KEYS.collabRequests, []);
}

function writeCollabRequests(requests) {
  writeStore(STORAGE_KEYS.collabRequests, requests);
}

function normalizeColumnName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeStatus(value) {
  const normalized = String(value || "Pending QC").trim().toLowerCase().replace(/[_-]+/g, " ");
  if (["pending", "pending qc", "pending admin", "pending review", "pending admin review"].includes(normalized)) return "Pending QC";
  if (normalized === "reserved") return "Reserved";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "draft") return "Draft";
  return "Live";
}

function isAdminApprovedListing(listing) {
  const status = String(listing?.approvalStatus || listing?.liveStatus || "").toLowerCase();
  return Boolean(
    listing?.adminApproved === true
    || listing?.verificationSource === "admin_approved"
    || status === "approved"
    || status === "approved_live"
  );
}

function parseMoneyValue(value) {
  if (typeof value === "number") return value;
  const cleaned = String(value || "").replace(/rm/gi, "").replace(/,/g, "").trim();
  return Number(cleaned);
}

function extractGoogleDriveId(value) {
  const link = String(value || "").trim();
  if (!link) return "";
  const fileMatch = link.match(/\/file\/d\/([^/?#]+)/i);
  if (fileMatch?.[1]) return fileMatch[1];

  try {
    const url = new URL(link);
    if (!url.hostname.includes("drive.google.com")) return "";
    return url.searchParams.get("id") || "";
  } catch {
    return "";
  }
}

function normalizeGoogleDriveImageLink(value) {
  const original = String(value || "").trim();
  if (!original) return { original, display: "", error: "image_link is required" };

  const id = extractGoogleDriveId(original);
  if (!id) {
    return {
      original,
      display: "",
      error: "image_link must be a public Google Drive file link"
    };
  }

  return {
    original,
    display: `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`,
    error: ""
  };
}

function readAliasedColumn(row, key, aliases = []) {
  const candidates = [key, ...aliases];
  for (const candidate of candidates) {
    const value = row[normalizeColumnName(candidate)];
    if (String(value || "").trim()) return value;
  }
  return "";
}

function normalizePhotoLink(value, label, required = false) {
  const original = String(value || "").trim();
  if (!original) {
    return {
      original,
      display: "",
      source: "",
      error: required ? `${label} photo is required` : ""
    };
  }

  if (/^data:image\//i.test(original)) {
    return {
      original,
      display: original,
      label,
      source: "Agent device upload",
      error: ""
    };
  }

  if (/^https?:\/\/.+\.(jpe?g|png|webp|gif)(\?|#|$)/i.test(original)) {
    return {
      original,
      display: original,
      label,
      source: "Direct image URL",
      error: ""
    };
  }

  const normalized = normalizeGoogleDriveImageLink(original);
  return {
    ...normalized,
    label,
    source: "Agent Google Drive upload",
    error: normalized.error ? `${label}: ${normalized.error.replace(/image_link/g, "photo link")}` : ""
  };
}

function splitPhotoLinks(value) {
  return String(value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildListingGallery(row) {
  const errors = [];
  const gallery = [];

  LISTING_REQUIRED_MEDIA_SLOTS.forEach((slot) => {
    const photo = normalizePhotoLink(readAliasedColumn(row, slot.key, slot.aliases), slot.label, false);
    if (photo.error) errors.push(photo.error);
    if (!photo.error && photo.display) {
      gallery.push({
        label: slot.label,
        required: true,
        url: photo.display,
        original: photo.original,
        source: photo.source || "Agent media upload",
        status: "verified"
      });
    }
  });

  LISTING_OPTIONAL_MEDIA_SLOTS.forEach((slot) => {
    const photo = normalizePhotoLink(readAliasedColumn(row, slot.key, slot.aliases), slot.label, false);
    if (photo.error) errors.push(photo.error);
    if (!photo.error && photo.display) {
      gallery.push({
        label: slot.label,
        required: false,
        url: photo.display,
        original: photo.original,
        source: photo.source || "Agent media upload",
        status: "verified"
      });
    }
  });

  splitPhotoLinks(row.extra_photo_links || row.gallery_links || row.additional_photo_links).forEach((link, index) => {
    const fallbackSlot = LISTING_OPTIONAL_MEDIA_SLOTS[index];
    const label = fallbackSlot?.label || `Extra Photo ${index + 1}`;
    const photo = normalizePhotoLink(link, label, false);
    if (photo.error) errors.push(photo.error);
    if (!photo.error && photo.display) {
      gallery.push({
        label,
        required: false,
        url: photo.display,
        original: photo.original,
        source: photo.source || "Agent media upload",
        status: "verified"
      });
    }
  });

  if (gallery.length < LISTING_MIN_PHOTO_COUNT) {
    errors.push(`At least ${LISTING_MIN_PHOTO_COUNT} property photos are required. Upload from device/gallery or paste Google Drive links. Detected ${gallery.length}/${LISTING_MIN_PHOTO_COUNT}.`);
  }

  return { gallery, errors };
}

function ensureListingGallery(listing) {
  const existingGallery = Array.isArray(listing.gallery) ? listing.gallery : [];
  if (existingGallery.length >= 10) return existingGallery.map((slot, index) => ({
    label: slot.label || [...LISTING_REQUIRED_MEDIA_SLOTS, ...LISTING_OPTIONAL_MEDIA_SLOTS][index]?.label || `Photo ${index + 1}`,
    required: index < LISTING_REQUIRED_MEDIA_SLOTS.length,
    url: slot.url || slot.display || slot.image || (index === 0 ? listing.image : ""),
    original: slot.original || slot.imageDriveLink || "",
    source: slot.source || "Listing media",
    status: slot.status || (slot.url || slot.display || slot.image ? "verified" : "pending_agent_upload")
  }));

  return [...LISTING_REQUIRED_MEDIA_SLOTS, ...LISTING_OPTIONAL_MEDIA_SLOTS].map((slot, index) => {
    const oldSlot = existingGallery[index] || {};
    const url = oldSlot.url || oldSlot.display || oldSlot.image || (index === 0 ? listing.image : "");
    return {
      label: oldSlot.label || slot.label,
      required: index < LISTING_REQUIRED_MEDIA_SLOTS.length,
      url,
      original: oldSlot.original || (index === 0 ? listing.imageDriveLink : ""),
      source: url ? oldSlot.source || "Existing listing image" : "Agent upload required",
      status: url ? oldSlot.status || "verified" : "pending_agent_upload"
    };
  });
}

function getGalleryStats(listing) {
  const gallery = ensureListingGallery(listing);
  return {
    gallery,
    verified: gallery.filter((item) => item.url && item.status !== "pending_agent_upload").length,
    requiredMissing: gallery.filter((item) => item.required && (!item.url || item.status === "pending_agent_upload")).length,
    total: gallery.length
  };
}

function normalizeArLink(value) {
  const original = String(value || "").trim();
  if (!original) return { original, display: "", modelUrl: "", error: "" };

  const driveId = extractGoogleDriveId(original);
  if (driveId) {
    const direct = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveId)}`;
    return { original, display: direct, modelUrl: direct, error: "" };
  }

  const isDirectModel = /^https?:\/\//i.test(original) && /\.(glb|gltf)(\?|#|$)/i.test(original);
  if (isDirectModel) return { original, display: original, modelUrl: original, error: "" };

  return {
    original,
    display: "",
    modelUrl: "",
    error: "ar_link must be a Google Drive file link or a direct .glb/.gltf URL"
  };
}

function parseTransactionColumns(row) {
  return [1, 2, 3].map((index) => {
    const price = parseMoneyValue(row[`transaction_${index}_price`]);
    const date = String(row[`transaction_${index}_date`] || "").trim();
    const note = String(row[`transaction_${index}_note`] || "").trim();
    if (!date && !price && !note) return null;
    return {
      date: date || "Recent",
      price: Number.isFinite(price) ? price : 0,
      note: note || "Imported transaction comparable"
    };
  }).filter(Boolean);
}

function normalizeExcelRow(rawRow) {
  return Object.entries(rawRow || {}).reduce((row, [key, value]) => {
    row[normalizeColumnName(key)] = value;
    return row;
  }, {});
}

function buildListingFromData(data, source = "manual", rowNumber = null) {
  const row = normalizeExcelRow(data);
  const errors = [];
  const title = String(row.title || "").trim();
  const area = String(row.area || "").trim();
  const price = parseMoneyValue(row.price);
  const media = buildListingGallery(row);
  const ar = normalizeArLink(row.ar_link || row.ar || row.model_url || row.model_link);

  if (!title) errors.push("title is required");
  if (!area) errors.push("area is required");
  if (!Number.isFinite(price) || price <= 0) errors.push("price must be a positive number");
  errors.push(...media.errors);
  if (ar.error) errors.push(ar.error);

  if (errors.length) {
    return {
      listing: null,
      errors: rowNumber ? errors.map((error) => `Row ${rowNumber}: ${error}`) : errors
    };
  }

  return {
    listing: {
      id: Date.now() + Math.floor(Math.random() * 100000),
      title,
      area,
      price,
      status: ["manual", "excel"].includes(source) ? "Pending QC" : normalizeStatus(row.status),
      enquiries: Number(row.enquiries || 0),
      propertyType: String(row.property_type || row.propertyType || "Condo").trim() || "Condo",
      listingPurpose: String(row.listing_purpose || row.listingPurpose || "sale").trim().toLowerCase() === "rent" ? "rent" : "sale",
      address: String(row.address || `${area}, Klang Valley`).trim(),
      landlordName: String(row.landlord_name || row.landlordName || "Landlord / co-agent").trim(),
      landlordPhone: String(row.landlord_phone || row.landlordPhone || "60123456789").replace(/[^\d+]/g, ""),
      image: media.gallery[0]?.url || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
      gallery: media.gallery,
      galleryCount: media.gallery.length,
      verifiedPhotoCount: media.gallery.length,
      requiredPhotoLabels: LISTING_REQUIRED_MEDIA_SLOTS.map((slot) => slot.label),
      imageDriveLink: media.gallery[0]?.original || "",
      arLink: ar.display,
      arSourceLink: ar.original,
      modelUrl: ar.modelUrl,
      maintenanceFee: String(row.maintenance_fee || row.maintenanceFee || "Confirm latest JMB figure").trim(),
      developer: String(row.developer || "Developer background pending").trim(),
      transactions: parseTransactionColumns(row),
      description: String(row.description || "").trim().slice(0, 500),
      importSource: source,
      importedAt: source === "excel" ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verificationSource: "agent",
      confidenceScore: 88,
      freshnessStatus: "fresh"
    },
    errors: []
  };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function liveBuyerListings() {
  return readStore(STORAGE_KEYS.buyerLiveListings, []);
}

function estimateListingBedrooms(listing) {
  if (Number.isFinite(Number(listing.bedrooms))) return Number(listing.bedrooms);
  if (/studio|soho|suite/i.test(`${listing.title} ${listing.propertyType}`)) return 1;
  if (/landed|terrace|semi|bungalow/i.test(`${listing.propertyType} ${listing.title}`)) return 4;
  return 3;
}

function estimateListingBathrooms(listing) {
  const bedrooms = estimateListingBedrooms(listing);
  return bedrooms >= 4 ? 3 : bedrooms <= 1 ? 1 : 2;
}

function estimateListingSqft(listing) {
  if (Number.isFinite(Number(listing.sqft)) && Number(listing.sqft) > 0) return Number(listing.sqft);
  if (/industrial|warehouse|factory/i.test(`${listing.propertyType} ${listing.title}`)) return 3200;
  if (/landed|terrace|semi|bungalow/i.test(`${listing.propertyType} ${listing.title}`)) return 2200;
  return 950;
}

function listingToBuyerProperty(listing) {
  const agent = readLiveAgentProfile();
  const gallery = ensureListingGallery(listing).filter((slot) => slot.url);
  const sqft = estimateListingSqft(listing);
  const type = slugify(listing.propertyType || "condo") || "condo";
  const createdAt = listing.createdAt || listing.importedAt || new Date().toISOString();
  return {
    id: Number(listing.id) || Date.now(),
    agentListingId: listing.id,
    source: "agent_pending_upload",
    title: listing.title,
    area: listing.area,
    location: listing.address || `${listing.area}, Malaysia`,
    type,
    purpose: listing.listingPurpose === "rent" ? "rent" : "sale",
    intent: /industrial|commercial|shop|office/i.test(`${listing.propertyType} ${listing.title}`) ? "investment" : "family",
    price: Number(listing.price || 0),
    bedrooms: estimateListingBedrooms(listing),
    bathrooms: estimateListingBathrooms(listing),
    beds: estimateListingBedrooms(listing),
    baths: estimateListingBathrooms(listing),
    sqft,
    psf: sqft ? Math.round(Number(listing.price || 0) / sqft) : 0,
    image: listing.image,
    gallery,
    galleryCount: gallery.length,
    liveNow: 0,
    aiScore: Number(listing.confidenceScore || 88),
    yield: Number(listing.yield || 4.3),
    growth: Number(listing.growth || 5.2),
    summary: `${listing.propertyType || "Property"} in ${listing.area}. Agent-uploaded listing with ${gallery.length}/${LISTING_RECOMMENDED_PHOTO_COUNT} photos ready for admin QC.`,
    vibe: "Waiting for RealityGenius admin QC",
    tags: [type, slugify(listing.area), "pending-qc"].filter(Boolean),
    badge: "pending-agent",
    verifiedType: "agent",
    verificationSource: "agent_submitted",
    adminApproved: false,
    approvalStatus: "pending_qc",
    liveStatus: "pending_admin_review",
    confidenceScore: Number(listing.confidenceScore || 88),
    freshnessStatus: "fresh",
    createdAt,
    updatedAt: new Date().toISOString(),
    mapLink: `https://www.google.com/maps/search/${encodeURIComponent(listing.address || listing.area || listing.title)}`,
    modelUrl: listing.modelUrl || listing.arLink || "",
    arLink: listing.arLink || "",
    agentId: agent.id || "agent-pending",
    agentName: agent.name || "RealityGenius Agent",
    agencyName: agent.agencyName || "RealityGenius Agent Network"
  };
}

function writeBuyerLiveListing(listing) {
  if (listing.status !== "Live" || !isAdminApprovedListing(listing)) return null;
  const buyerListing = {
    ...listingToBuyerProperty(listing),
    adminApproved: true,
    approvalStatus: "approved",
    liveStatus: "approved_live",
    verificationSource: "admin_approved",
    source: "admin_approved_agent_listing"
  };
  const existing = liveBuyerListings().filter((item) => String(item.agentListingId || item.id) !== String(listing.id));
  writeStore(STORAGE_KEYS.buyerLiveListings, [buyerListing, ...existing]);
  return buyerListing;
}

function removeBuyerLiveListing(listingId) {
  writeStore(
    STORAGE_KEYS.buyerLiveListings,
    liveBuyerListings().filter((item) => String(item.agentListingId || item.id) !== String(listingId))
  );
}

function writeAdminListingFromAgent(listing) {
  const agent = readLiveAgentProfile();
  const media = getGalleryStats(listing);
  const approved = listing.status === "Live" && isAdminApprovedListing(listing);
  const buyerPayload = listingToBuyerProperty({
    ...listing,
    status: "Live",
    adminApproved: true,
    approvalStatus: "approved",
    liveStatus: "approved_live",
    verificationSource: "admin_approved"
  });
  buyerPayload.gallery = buyerPayload.gallery.filter((item) => !String(item.url || "").startsWith("data:image/"));
  const adminListing = {
    id: Number(listing.id) || Date.now(),
    agentListingId: listing.id,
    agentId: agent.id || "agent-live",
    agentName: agent.name || "RealityGenius Agent",
    title: listing.title,
    price: Number(listing.price || 0),
    location: listing.address || listing.area,
    status: approved ? "approved" : listing.status === "Rejected" ? "rejected" : "pending_qc",
    imageUrl: listing.image,
    imageResolution: media.verified >= LISTING_MIN_PHOTO_COUNT ? 1280 : 720,
    imageHash: `agent-${listing.id}-${slugify(listing.title)}`,
    createdAt: listing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    buyerPayload,
    aiFlags: media.verified >= LISTING_RECOMMENDED_PHOTO_COUNT ? [] : [{
      flag_type: "missing_gallery",
      severity: "medium",
      message: `${media.verified}/${LISTING_RECOMMENDED_PHOTO_COUNT} photos detected. Minimum ${LISTING_MIN_PHOTO_COUNT} is accepted; full gallery is recommended.`
    }]
  };
  const existing = readStore(STORAGE_KEYS.adminListings, []).filter((item) => String(item.id) !== String(adminListing.id));
  writeStore(STORAGE_KEYS.adminListings, [adminListing, ...existing]);
}

async function syncListingToBackend(listing) {
  if (listing.status === "Live") return null;
  return saveAgentListingToBackend(listing);
}

function publicGalleryForBackend(listing) {
  return ensureListingGallery(listing)
    .map((slot) => ({
      label: slot.label,
      required: Boolean(slot.required),
      url: String(slot.url || "").trim(),
      original: slot.original || slot.url || "",
      source: slot.source || "Agent upload"
    }))
    .filter((slot) => slot.url && (/^data:image\//i.test(slot.url) || /^https?:\/\//i.test(slot.url)))
    .slice(0, LISTING_RECOMMENDED_PHOTO_COUNT);
}

function countTemporaryDeviceImages(listing) {
  return ensureListingGallery(listing).filter((slot) => /^data:image\//i.test(String(slot.url || ""))).length;
}

function serializeAgentListingForBackend(listing) {
  const agent = readLiveAgentProfile();
  const galleryUrls = publicGalleryForBackend(listing);
  const temporaryCount = countTemporaryDeviceImages(listing);
  if (galleryUrls.length < LISTING_MIN_PHOTO_COUNT) {
    throw new Error(`At least ${LISTING_MIN_PHOTO_COUNT} property photos are required for admin QC.`);
  }
  return {
    id: listing.backendId || null,
    listingId: listing.backendId || null,
    agentId: agent.id || listing.agentId || null,
    title: listing.title,
    area: listing.area,
    price: listing.price,
    propertyType: listing.propertyType,
    listingPurpose: listing.listingPurpose === "rent" ? "rent" : "sale",
    address: listing.address,
    landlordName: listing.landlordName,
    landlordPhone: listing.landlordPhone,
    description: String(listing.description || "").trim().slice(0, 500),
    galleryUrls,
    temporaryImageCount: temporaryCount,
    panoUrls: (listing.panoramas || [])
      .map((item) => ({
        label: item.label || "360 Room",
        url: String(item.url || "").trim(),
        source: item.source || "Agent 360 upload"
      }))
      .filter((item) => item.url && (/^data:image\//i.test(item.url) || /^https?:\/\//i.test(item.url)))
      .slice(0, LISTING_PANO_PHOTO_LIMIT),
    arLink: listing.arLink || listing.modelUrl || "",
    source: listing.importSource || "manual"
  };
}

function mergeBackendListingRow(listing, row = {}) {
  const gallery = Array.isArray(row.gallery_urls) && row.gallery_urls.length
    ? row.gallery_urls.map((item, index) => ({
      label: item.label || LISTING_MEDIA_SLOTS[index]?.label || `Photo ${index + 1}`,
      required: index < LISTING_REQUIRED_MEDIA_SLOTS.length,
      url: item.url || item.display || item.image || "",
      original: item.original || item.url || "",
      source: item.source || "Agent upload",
      status: "verified"
    }))
    : listing.gallery;

  return {
    ...listing,
    id: row.id || listing.id,
    backendId: row.id || listing.backendId,
    status: row.status === "rejected" ? "Rejected" : row.status === "live" || row.status === "approved" ? "Live" : "Pending QC",
    title: row.title || listing.title,
    area: row.area || listing.area,
    price: row.price == null ? listing.price : Number(row.price),
    propertyType: row.property_type || listing.propertyType,
    listingPurpose: row.listing_purpose === "rent" ? "rent" : (row.listing_purpose === "sale" ? "sale" : listing.listingPurpose),
    address: row.address || listing.address,
    landlordName: row.landlord_name || listing.landlordName,
    landlordPhone: row.landlord_phone || listing.landlordPhone,
    description: row.description || listing.description || "",
    gallery,
    galleryCount: gallery.length,
    verifiedPhotoCount: gallery.length,
    image: gallery[0]?.url || listing.image,
    panoramas: Array.isArray(row.pano_urls) && row.pano_urls.length ? row.pano_urls : listing.panoramas || [],
    arLink: row.ar_link || listing.arLink,
    modelUrl: row.ar_link || listing.modelUrl,
    adminApproved: row.status === "live" || row.status === "approved",
    approvalStatus: row.status || "pending_qc",
    liveStatus: row.status === "live" || row.status === "approved" ? "approved_live" : "pending_admin_review",
    verificationSource: row.status === "live" || row.status === "approved" ? "admin_approved" : "agent",
    createdAt: row.created_at || listing.createdAt,
    updatedAt: row.updated_at || listing.updatedAt || new Date().toISOString()
  };
}

async function saveAgentListingToBackend(listing) {
  try {
    const response = await fetch(agentApiUrl("/agent/listings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serializeAgentListingForBackend(listing))
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || LIVE_LISTING_SAVE_ERROR);
    return mergeBackendListingRow(listing, payload.item || {});
  } catch (error) {
    if (window.RGLogError) window.RGLogError(error, { feature: "live_listing_backend_sync" });
    const detail = error?.message && error.message !== LIVE_LISTING_SAVE_ERROR ? ` ${error.message}` : "";
    throw new Error(`${LIVE_LISTING_SAVE_ERROR}${detail}`);
  }
}

function publishListingsLive(listings, sourceLabel = "manual upload") {
  const liveListings = listings.filter((listing) => listing.status === "Live" && isAdminApprovedListing(listing));
  liveListings.forEach((listing) => {
    writeBuyerLiveListing(listing);
    writeAdminListingFromAgent(listing);
    syncListingToBackend(listing);
  });

  if (liveListings.length) {
    pushUserNotification(
      "New live property added",
      `${liveListings[0].title}${liveListings.length > 1 ? ` and ${liveListings.length - 1} more listing(s)` : ""} just went live from an agent upload.`
    );
    state.notifications = [
      {
        id: Date.now() + 2,
        title: "Listing live in buyer search",
        message: `${liveListings.length} listing${liveListings.length === 1 ? "" : "s"} published from ${sourceLabel}.`,
        createdAt: new Date().toISOString()
      },
      ...state.notifications
    ];
  }

  return liveListings.length;
}

function pushAdminListingNotification(title, message) {
  const key = STORAGE_KEYS.adminNotifications;
  const existing = readStore(key, []);
  writeStore(key, [
    {
      id: Date.now(),
      title,
      message,
      createdAt: new Date().toISOString()
    },
    ...existing
  ]);
}

function submitListingsForAdminReview(listings, sourceLabel = "manual upload") {
  const reviewListings = listings.map((listing) => ({
    ...listing,
    status: "Pending QC",
    adminApproved: false,
    approvalStatus: "pending_qc",
    liveStatus: "pending_admin_review",
    verificationSource: "agent"
  }));

  reviewListings.forEach((listing) => {
    removeBuyerLiveListing(listing.id);
    writeAdminListingFromAgent(listing);
  });

  if (reviewListings.length) {
    pushAdminListingNotification(
      "Listing waiting for QC",
      `${reviewListings[0].title}${reviewListings.length > 1 ? ` and ${reviewListings.length - 1} more listing(s)` : ""} submitted from ${sourceLabel}.`
    );
    state.notifications = [
      {
        id: Date.now() + 2,
        title: "Listing sent to admin QC",
        message: `${reviewListings.length} listing${reviewListings.length === 1 ? "" : "s"} waiting for admin approval before buyer visibility.`,
        createdAt: new Date().toISOString()
      },
      ...state.notifications
    ];
  }

  return reviewListings.length;
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

function money(value) {
  return `RM ${Number(value).toLocaleString("en-MY")}`;
}

function getTemperatureClass(value) {
  if (value === "Hot") return "status-hot";
  if (value === "Warm") return "status-warm";
  return "status-cold";
}

function leadListForFilter() {
  if (state.leadFilter === "all") return state.leads;
  return state.leads.filter((lead) => lead.temperature.toLowerCase() === state.leadFilter);
}

function commissionTotals() {
  const totalPotential = state.clients.reduce((sum, client) => sum + client.value * 0.03, 0);
  const pending = state.clients
    .filter((client) => client.stage !== "Closed")
    .reduce((sum, client) => sum + client.value * 0.03, 0);
  const collected = state.clients
    .filter((client) => client.stage === "Closed")
    .reduce((sum, client) => sum + client.value * 0.03, 0);

  return {
    totalPotential,
    pending,
    collected
  };
}

function getHotLeads() {
  return [...state.leads]
    .filter((lead) => lead.temperature === "Hot" || lead.probability >= 80)
    .sort((a, b) => b.probability - a.probability);
}

function getNegotiationThreads() {
  return typeof window.KVNegotiationStore?.getAll === "function"
    ? window.KVNegotiationStore.getAll()
    : [];
}

function getMorningSnapshot() {
  const hotLeads = getHotLeads();
  const negotiationThreads = getNegotiationThreads();
  const activeThreads = negotiationThreads.filter((thread) => thread.status === "open").length;
  const landedListings = state.automation.channels.filter((channel) => channel.id === "landlord-voice").length;
  return {
    bookedViewings: state.automation.overnight.bookedViewings,
    leadJumps: state.automation.overnight.leadJumps,
    landlordWins: state.automation.overnight.landlordWins,
    whatsappReplies: state.automation.overnight.whatsappReplies,
    contractsPrepared: state.automation.overnight.contractsPrepared,
    hotLeadCount: hotLeads.length,
    activeThreads,
    landedListings,
    hottestLeads: hotLeads.slice(0, 3)
  };
}

function goToSection(section) {
  state.section = section;
  syncSectionVisibility();
  const workArea = document.querySelector(".panel-grid") || document.querySelector(".main");
  if (workArea) workArea.scrollTo({ top: 0, behavior: "smooth" });
  showToast(`${section.charAt(0).toUpperCase()}${section.slice(1)} opened`);
}

function openListingDeviceUpload() {
  if (!requirePlan("addListing")) return;
  openModal("listingModal");
  setTimeout(() => els.listingDevicePhotos?.click(), 120);
}

// ---------------------------------------------------------
// DAILY ROUTINE: check-in streaks, points, tier, quick actions.
// Backend is the source of truth; localStorage keeps the card
// alive when the API is unreachable.
// ---------------------------------------------------------
const ENGAGEMENT_STORE_KEY = "rg_agent_engagement";
const LEADS_REVIEWED_STORE_KEY = "rg_agent_leads_reviewed_date";
const ENGAGEMENT_TIERS = [
  { key: "elite", label: "Elite Frontliner", minPoints: 1000 },
  { key: "dedicated", label: "Dedicated Agent", minPoints: 400 },
  { key: "rising", label: "Rising Agent", minPoints: 0 }
];

let agentEngagement = readStore(ENGAGEMENT_STORE_KEY, null);

function engagementTierFor(points) {
  return ENGAGEMENT_TIERS.find((tier) => points >= tier.minPoints) || ENGAGEMENT_TIERS[ENGAGEMENT_TIERS.length - 1];
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function localFallbackCheckin() {
  const previous = agentEngagement || { points: 0, streakDays: 0, bestStreak: 0, lastCheckinDate: null };
  if (previous.lastCheckinDate === todayStamp()) return { ...previous, checkedInToday: true, earnedToday: 0 };
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const streakDays = previous.lastCheckinDate === yesterday ? Number(previous.streakDays || 0) + 1 : 1;
  const earned = 10 + (streakDays >= 7 ? 15 : streakDays >= 3 ? 5 : 0);
  return {
    ...previous,
    points: Number(previous.points || 0) + earned,
    streakDays,
    bestStreak: Math.max(streakDays, Number(previous.bestStreak || 0)),
    lastCheckinDate: todayStamp(),
    checkedInToday: true,
    earnedToday: earned,
    offline: true
  };
}

async function performDailyCheckin() {
  const agent = readLiveAgentProfile();
  const alreadyToday = agentEngagement?.lastCheckinDate === todayStamp() && agentEngagement?.synced;
  try {
    const response = await fetch(agentApiUrl("/agent/checkin"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: agent.id })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.engagement) throw new Error(payload.error || "Check-in failed");
    agentEngagement = { ...payload.engagement, synced: true };
  } catch (error) {
    if (window.RGLogError) window.RGLogError(error, { feature: "agent_daily_checkin" });
    agentEngagement = localFallbackCheckin();
  }
  writeStore(ENGAGEMENT_STORE_KEY, agentEngagement);
  renderAgentRoutine();
  if (!alreadyToday && agentEngagement.earnedToday > 0) {
    showToast(`+${agentEngagement.earnedToday} points · Day ${agentEngagement.streakDays} streak. Your listings move up the buyer feed.`);
  }
}

function listingUploadedToday() {
  const today = todayStamp();
  return state.listings.some((listing) => String(listing.createdAt || listing.updatedAt || "").slice(0, 10) === today);
}

function leadsReviewedToday() {
  return readStore(LEADS_REVIEWED_STORE_KEY, "") === todayStamp();
}

function setRoutineCheckState(button, done) {
  if (!button) return;
  button.classList.toggle("is-done", done);
  const icon = button.querySelector("i");
  if (icon) icon.className = done ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
}

function renderAgentRoutine() {
  if (!els.routinePointsTotal) return;
  const summary = agentEngagement || { points: 0, streakDays: 0 };
  const points = Number(summary.points || 0);
  const tier = summary.tier ? { key: summary.tier, label: summary.tierLabel } : engagementTierFor(points);

  els.routinePointsTotal.textContent = points.toLocaleString("en-MY");
  els.routineStreakDays.textContent = Number(summary.streakDays || 0);
  els.routineTierLabel.textContent = tier.label || "Rising Agent";
  els.routineTierBadge.className = `routine-tier tier-${tier.key || "rising"}`;

  const nextTier = [...ENGAGEMENT_TIERS].reverse().find((candidate) => candidate.minPoints > points) || null;
  if (nextTier) {
    const currentFloor = engagementTierFor(points).minPoints;
    const progress = Math.min(100, Math.round(((points - currentFloor) / (nextTier.minPoints - currentFloor)) * 100));
    els.routineTierProgress.style.width = `${progress}%`;
    els.routineTierNext.textContent = `${nextTier.minPoints - points} points to ${nextTier.label}`;
  } else {
    els.routineTierProgress.style.width = "100%";
    els.routineTierNext.textContent = "Top tier reached. Your listings lead the buyer feed.";
  }

  setRoutineCheckState(els.routineCheckLogin, Boolean(summary.checkedInToday || summary.lastCheckinDate === todayStamp()));
  setRoutineCheckState(els.routineCheckListing, listingUploadedToday());
  setRoutineCheckState(els.routineCheckLeads, leadsReviewedToday());

  if (els.routineRank) {
    const hasRank = Number(summary.rank || 0) > 0 && Number(summary.totalAgents || 0) > 1;
    els.routineRank.hidden = !hasRank;
    if (hasRank) {
      els.routineRankText.textContent = summary.rank === 1
        ? `#1 frontline agent of ${summary.totalAgents} - buyers see you first`
        : `Frontline rank #${summary.rank} of ${summary.totalAgents} agents`;
    }
  }

  renderListingPipeline();
}

function renderListingPipeline() {
  if (!els.listingPipelineStrip) return;
  const statusOf = (listing) => String(listing.status || "").toLowerCase();
  const counts = {
    pending: state.listings.filter((listing) => statusOf(listing) === "pending qc").length,
    live: state.listings.filter((listing) => statusOf(listing) === "live").length,
    rejected: state.listings.filter((listing) => statusOf(listing) === "rejected").length,
    draft: state.listings.filter((listing) => statusOf(listing) === "draft").length
  };
  els.pipelinePendingCount.textContent = counts.pending;
  els.pipelineLiveCount.textContent = counts.live;
  els.pipelineRejectedCount.textContent = counts.rejected;
  els.pipelineDraftCount.textContent = counts.draft;
}

function reviewLeadsRoutine() {
  writeStore(LEADS_REVIEWED_STORE_KEY, todayStamp());
  state.section = "leads";
  syncSectionVisibility();
  renderAgentRoutine();
  showToast("Leads open. Reply fast to keep buyers warm.");
}

function duplicateLastListing() {
  if (!requirePlan("addListing")) return;
  const last = state.listings[0];
  if (!last) {
    showToast("No previous listing yet. Use Quick List to create your first one.");
    openListingDeviceUpload();
    return;
  }

  if (els.listingTitle) els.listingTitle.value = `${last.title || ""}`.replace(/ \(Copy\)$/, "") + " (Copy)";
  if (els.listingArea) els.listingArea.value = last.area || "";
  if (els.listingPrice) els.listingPrice.value = last.price ? `RM ${Math.round(last.price).toLocaleString("en-MY")}` : "";
  if (els.listingAddress) els.listingAddress.value = last.address || "";
  if (els.listingPropertyType) els.listingPropertyType.value = last.propertyType || "";
  setListingPurpose(last.listingPurpose === "rent" ? "rent" : "sale");
  if (els.listingLandlordName) els.listingLandlordName.value = last.landlordName || "";
  if (els.listingLandlordPhone) els.listingLandlordPhone.value = last.landlordPhone || "";
  if (els.listingDescription) {
    els.listingDescription.value = last.description || "";
    updateListingDescriptionCount();
  }
  if (els.listingArLink) els.listingArLink.value = last.arLink || "";

  const gallery = (last.gallery || []).map((slot) => slot.url).filter((url) => /^https?:\/\//i.test(String(url || "")));
  const linkInputs = [els.listingImageLink, els.listingTopViewLink, els.listingRoom1Link, els.listingBathroomLink, els.listingKitchenLink];
  linkInputs.forEach((input, index) => {
    if (input) input.value = gallery[index] || "";
  });
  if (els.listingExtraPhotoLinks) els.listingExtraPhotoLinks.value = gallery.slice(linkInputs.length).join("\n");

  updateListingQcChecklist();
  openModal("listingModal");
  showToast("Last listing loaded. Adjust the details and submit.");
}

function renderWorkspace() {
  renderGlobalPlatformAlert();
  renderLiveAgentProfile();
  renderAgentRoutine();
  renderMetrics();
  renderCommandCenter();
  renderAutomationBoard();
  renderRoadmapBoard();
  renderPipeline();
  renderCommissionSummary();
  renderLeadList();
  renderNegotiationDesk();
  renderLeakProofDealBoard();
  renderClientList();
  renderCommissionTable();
  renderCleanListingGrid();
  renderNotifications();
  renderDocumentVault();
  renderItineraryBuilder();
  renderCobrokeMatchmaker();
  renderCheatSheet();
  renderReferralAutopilot();
  renderContentCreator();
  hydrateGeneratedContentHistory();
  syncSectionVisibility();
}

function readLiveAgentProfile() {
  const fallback = {
    id: "ag-arvind",
    name: "Arvind Govindasamy",
    email: "arvind@realtygenius.my",
    phone: "60123456789",
    agencyName: "RealtyGenius IQI Project Desk",
    renNumber: "REN-PENDING",
    status: "approved"
  };
  const session = window.RealtyGeniusSession || readStore("rg_session", null);
  const stored = readStore("rg_live_agent_profile", null);
  return {
    ...fallback,
    ...(window.RealtyGeniusLiveAgent || {}),
    ...(stored || {}),
    name: session?.role === "agent" ? (session.name || stored?.name || fallback.name) : (stored?.name || fallback.name),
    email: session?.role === "agent" ? (session.email || stored?.email || fallback.email) : (stored?.email || fallback.email),
    agencyName: session?.agencyName || stored?.agencyName || fallback.agencyName,
    photo: stored?.photo || stored?.photoUrl || "",
    rank: stored?.rank || ""
  };
}

function agentInitials(name = "") {
  return String(name || "Agent")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AG";
}

function agentRankDetails() {
  const listingScore = Math.min(45, state.listings.length * 9);
  const leadScore = Math.min(30, state.leads.length * 5);
  const liveScore = Math.min(15, state.listings.filter((listing) => ["Live", "Approved"].includes(normalizeStatus(listing.status))).length * 5);
  const commissionScore = commissionTotals().pending > 0 ? 10 : 0;
  const score = Math.min(100, listingScore + leadScore + liveScore + commissionScore);
  if (score >= 85) return { label: "Best Closer", score, reason: "Top rank: strong listing activity, lead activity, and deal momentum." };
  if (score >= 60) return { label: "Elite Agent", score, reason: "Elite rank: consistent listings and active buyer pipeline." };
  if (score >= 35) return { label: "Pro Agent", score, reason: "Pro rank: good progress. Add live listings and follow up leads to climb." };
  return { label: "Rising Agent", score: Math.max(score, 12), reason: "Rising rank: upload listings and follow up leads to improve your score." };
}

function applyAgentPhoto(element, photo, initials) {
  if (!element) return;
  if (photo) {
    element.textContent = "";
    element.style.backgroundImage = `url("${photo}")`;
  } else {
    element.style.backgroundImage = "";
    element.textContent = initials;
  }
}

function renderLiveAgentProfile() {
  if (!els.liveAgentName) return;
  const agent = readLiveAgentProfile();
  const initials = agentInitials(agent.name);
  const rank = agentRankDetails();
  els.liveAgentName.textContent = agent.name;
  els.liveAgentAgency.textContent = agent.agencyName;
  els.liveAgentRen.textContent = agent.renNumber || "REN-PENDING";
  if (els.liveAgentRank) els.liveAgentRank.textContent = rank.label;
  applyAgentPhoto(els.liveAgentAvatar, agent.photo, initials);
  if (els.agentProfileNameInput && document.activeElement !== els.agentProfileNameInput) els.agentProfileNameInput.value = agent.name || "";
  if (els.agentProfileAgencyInput && document.activeElement !== els.agentProfileAgencyInput) els.agentProfileAgencyInput.value = agent.agencyName || "";
  if (els.agentProfileRenInput && document.activeElement !== els.agentProfileRenInput) els.agentProfileRenInput.value = agent.renNumber || "";
  applyAgentPhoto(els.agentProfilePhotoPreview, agent.photo, initials);
  if (els.agentProfilePreviewName) els.agentProfilePreviewName.textContent = agent.name || "RealityGenius Agent";
  if (els.agentProfilePreviewAgency) els.agentProfilePreviewAgency.textContent = agent.agencyName || "RealityGenius Realty";
  if (els.agentProfilePreviewRen) els.agentProfilePreviewRen.textContent = agent.renNumber || "REN-PENDING";
  if (els.agentRankChip) els.agentRankChip.textContent = rank.label;
  if (els.agentRankMeter) els.agentRankMeter.style.width = `${rank.score}%`;
  if (els.agentRankReason) els.agentRankReason.textContent = rank.reason;
}

function saveAgentProfileEdits(event) {
  event?.preventDefault();
  const current = readLiveAgentProfile();
  const next = {
    ...current,
    name: els.agentProfileNameInput?.value.trim() || current.name,
    agencyName: els.agentProfileAgencyInput?.value.trim() || current.agencyName,
    renNumber: els.agentProfileRenInput?.value.trim() || current.renNumber || "REN-PENDING",
    updatedAt: new Date().toISOString()
  };
  writeStore("rg_live_agent_profile", next);
  const session = readStore("rg_session", null);
  if (session?.role === "agent") {
    writeStore("rg_session", {
      ...session,
      name: next.name,
      agencyName: next.agencyName
    });
    window.RealtyGeniusSession = { ...session, name: next.name, agencyName: next.agencyName };
  }
  renderLiveAgentProfile();
  showToast("Agent profile updated");
}

function handleAgentProfilePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Upload an image file for your profile photo");
    return;
  }
  if (file.size > 2.5 * 1024 * 1024) {
    showToast("Use a profile photo under 2.5MB");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const current = readLiveAgentProfile();
    writeStore("rg_live_agent_profile", {
      ...current,
      photo: reader.result,
      updatedAt: new Date().toISOString()
    });
    renderLiveAgentProfile();
    showToast("Profile photo updated");
  };
  reader.readAsDataURL(file);
}

function renderMetrics() {
  const hotLeads = state.leads.filter((lead) => lead.temperature === "Hot").length;
  const totals = commissionTotals();
  els.hotLeadCount.textContent = hotLeads;
  els.clientCount.textContent = state.clients.length;
  els.pendingCommission.textContent = money(Math.round(totals.pending));
  els.listingCount.textContent = state.listings.length;
  els.notificationCount.textContent = state.notifications.length;
}

function renderCommandCenter() {
  const snapshot = getMorningSnapshot();
  const hasRealActivity = snapshot.bookedViewings
    || snapshot.leadJumps
    || snapshot.whatsappReplies
    || snapshot.landlordWins
    || snapshot.activeThreads
    || state.leads.length
    || state.clients.length;

  els.commandBrief.innerHTML = `
    <span class="command-tag">Live brief</span>
    <h4>${hasRealActivity ? `${snapshot.bookedViewings} real viewing requests, ${snapshot.leadJumps} lead movements, and ${snapshot.activeThreads} open negotiations.` : "No real buyer activity has been captured yet."}</h4>
    <p>${hasRealActivity ? "Use this queue to act on live leads, listings, and negotiation records." : "Upload listings, get admin approval, then real buyer leads and analytics will appear here."}</p>
  `;

  els.commandCards.innerHTML = [
    {
      label: "While you slept",
      value: `${snapshot.bookedViewings} viewings`,
      detail: "Already waiting for confirmation"
    },
    {
      label: "Probability jump",
      value: `${snapshot.leadJumps} leads`,
      detail: "Crossed into action territory"
    },
    {
      label: "AI outreach wins",
      value: `${snapshot.landlordWins} new listing`,
      detail: "Confirmed from real workflow records"
    },
    {
      label: "Live urgency",
      value: `${snapshot.activeThreads} open negotiations`,
      detail: "Hot threads still on the table"
    }
  ].map((card) => `
    <article class="command-card">
      <span>${card.label}</span>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");

  const hottest = snapshot.hottestLeads;
  const queueItems = [
    hottest[0] ? {
      title: `Call ${hottest[0].name} now`,
      body: `${hottest[0].probability}% close probability in ${hottest[0].area}. ${hottest[0].note}`,
      action: "Open Lead Desk",
      section: "leads"
    } : null,
    hottest[1] ? {
      title: `${hottest[1].name} needs a WhatsApp reply`,
      body: `AI flagged this lead as worth immediate follow-up because the buyer is warming up instead of stalling.`,
      action: "Jump to Leads",
      section: "leads"
    } : null,
    commissionTotals().pending ? {
      title: "Protect today's commission window",
      body: `${money(Math.round(commissionTotals().pending))} is sitting inside active deals. Push the negotiation and viewing stages before you open anything else.`,
      action: "Open Commission",
      section: "commission"
    } : null
  ].filter(Boolean);

  els.actionQueue.innerHTML = queueItems.length ? queueItems.map((item) => `
    <article class="action-card">
      <strong>${item.title}</strong>
      <p>${item.body}</p>
      ${item.section
        ? `<button class="ghost-button" data-action="jump-section" data-section="${item.section}" type="button">${item.action}</button>`
        : `<button class="ghost-button" data-action="play-recap" data-message="${item.recap}" type="button">${item.action}</button>`}
    </article>
  `).join("") : `<article class="action-card"><strong>No action queue yet</strong><p>Real buyer actions, approved listings, and negotiations will create tasks here.</p></article>`;
}

function renderAutomationBoard() {
  els.automationBoard.innerHTML = state.automation.channels.length ? state.automation.channels.map((channel) => `
    <article class="automation-card">
      <div class="automation-card-head">
        <span class="automation-pill">Automation</span>
        <strong>${channel.metric}</strong>
      </div>
      <h4>${channel.title}</h4>
      <p>${channel.detail}</p>
      ${channel.targetSection
        ? `<button class="ghost-button" data-action="jump-section" data-section="${channel.targetSection}" type="button">${channel.actionLabel}</button>`
        : `<button class="ghost-button" data-action="play-recap" data-message="${channel.recap}" type="button">${channel.actionLabel}</button>`}
    </article>
  `).join("") : `<article class="automation-card"><div class="automation-card-head"><span class="automation-pill">Automation</span><strong>0 live automations</strong></div><h4>No real automation records yet</h4><p>When WhatsApp, voice, document, or referral automations run, their real results will appear here.</p></article>`;
}

function renderRoadmapBoard() {
  els.roadmapBoard.innerHTML = [
    {
      phase: "Phase 1",
      title: "Make this the source of truth",
      status: "Live now",
      body: "Lead scoring, WhatsApp engagement, AI lead management, commission visibility, and one-screen control.",
      features: ["Lead probability scoring", "WhatsApp engagement system", "AI lead desk"]
    },
    {
      phase: "Phase 2",
      title: "Automate the grind",
      status: "Launching next",
      body: "Cold outreach, landlord sourcing, and daily follow-up loops that keep working while agents sleep.",
      features: ["Voice outreach to landlords", "Automated WhatsApp follow-up", "Morning reply summaries"]
    },
    {
      phase: "Phase 3",
      title: "Create agent FOMO",
      status: "Waitlist priority",
      body: "AI negotiator, voice cold-calling, and self-improving closers that weaker agents will obsess over.",
      features: ["AI negotiator", "AI cold calling", "Autonomous closer scripts"]
    }
  ].map((phase, index) => `
    <article class="roadmap-phase ${index === 2 ? "roadmap-phase--hot" : ""}">
      <div class="roadmap-phase-head">
        <span class="phase-tag">${phase.phase}</span>
        <span class="phase-status">${phase.status}</span>
      </div>
      <h4>${phase.title}</h4>
      <p>${phase.body}</p>
      <div class="roadmap-feature-list">
        ${phase.features.map((feature) => `<span>${feature}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderPipeline() {
  const stages = ["New", "Contacted", "Viewing", "Negotiation"];
  els.leadPipeline.innerHTML = stages.map((stage) => {
    const stageLeads = state.leads.filter((lead) => lead.stage === stage);
    return `
      <section class="pipeline-column">
        <h4>${stage}</h4>
        <div class="column-stack">
          ${stageLeads.map((lead) => `
            <article class="lead-card">
              <div class="lead-head">
                <div>
                  <div class="lead-name">${lead.name}</div>
                  <div class="subtext">${lead.area}</div>
                </div>
                <span class="status-pill ${getTemperatureClass(lead.temperature)}">${lead.temperature}</span>
              </div>
              <div class="meta-row">
                <span class="meta-pill">${money(lead.budget)}</span>
                <span class="meta-pill">${lead.probability}% close chance</span>
              </div>
            </article>
          `).join("") || `<div class="subtext">No leads in this stage.</div>`}
        </div>
      </section>
    `;
  }).join("");
}

function renderCommissionSummary() {
  const totals = commissionTotals();
  els.commissionSummary.innerHTML = `
    <article class="revenue-card">
      <span>Potential pipeline revenue</span>
      <strong>${money(Math.round(totals.totalPotential))}</strong>
    </article>
    <article class="revenue-card">
      <span>Pending commission</span>
      <strong>${money(Math.round(totals.pending))}</strong>
    </article>
    <article class="revenue-card">
      <span>Collected commission</span>
      <strong>${money(Math.round(totals.collected))}</strong>
    </article>
  `;
}

function renderLeadListLegacy() {
  const leads = leadListForFilter();
  els.leadList.innerHTML = leads.map((lead) => `
    <article class="lead-card">
      <div class="lead-head">
        <div>
          <div class="lead-name">${lead.name}</div>
          <div class="subtext">${lead.area} • ${lead.phone}</div>
        </div>
        <span class="status-pill ${getTemperatureClass(lead.temperature)}">${lead.temperature}</span>
      </div>
      <p class="subtext">${lead.note}</p>
      <div class="meta-row">
        <span class="meta-pill">${lead.stage}</span>
        <span class="meta-pill">${lead.probability}% close chance</span>
        <span class="meta-pill">${money(lead.budget)}</span>
      </div>
      <div class="action-row">
        <a class="primary-button" href="${getWhatsappLink(lead)}" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-whatsapp"></i>
          Contact now
        </a>
        <button class="ghost-button" data-action="promote-lead" data-id="${lead.id}" type="button">
          <i class="fa-solid fa-arrow-up-right-dots"></i>
          Move forward
        </button>
      </div>
    </article>
  `).join("") || `<div class="subtext">No leads match this filter.</div>`;
}

function renderClientList() {
  els.clientList.innerHTML = state.clients.length ? state.clients.map((client) => `
    <article class="client-card">
      <div class="client-head">
        <div>
          <div class="client-name">${client.name}</div>
          <div class="subtext">${client.area}</div>
        </div>
        <span class="meta-pill">${client.stage}</span>
      </div>
      <p class="subtext">${client.nextStep}</p>
      <div class="meta-row">
        <span class="meta-pill">Deal size ${money(client.value)}</span>
        <span class="meta-pill">Commission ${money(Math.round(client.value * 0.03))}</span>
      </div>
    </article>
  `).join("") : `<div class="subtext">No real clients yet.</div>`;
}

function renderCommissionTable() {
  els.commissionTable.innerHTML = state.clients.length ? state.clients.map((client) => `
    <article class="commission-row">
      <div>
        <strong>${client.name}</strong>
        <div class="subtext">${client.area}</div>
      </div>
      <div>${money(client.value)}</div>
      <div>${money(Math.round(client.value * 0.03))}</div>
      <div>${client.stage}</div>
    </article>
  `).join("") : `<div class="subtext">No commission records yet.</div>`;
}

function renderListingGrid() {
  if (!state.listings.length) {
    els.listingGrid.innerHTML = `
      <article class="listing-empty-state">
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <strong>No listings yet</strong>
        <p>Start above with the Excel template, upload an Excel/CSV file, or add a listing from your computer with at least ${LISTING_MIN_PHOTO_COUNT} photos. Every listing goes to admin QC before buyer visibility.</p>
        <button class="primary-button" id="emptyPostLiveListing" type="button">
          <i class="fa-solid fa-plus"></i>
          Add from device / computer
        </button>
      </article>
    `;
    document.getElementById("emptyPostLiveListing")?.addEventListener("click", openListingDeviceUpload);
    return;
  }

  els.listingGrid.innerHTML = state.listings.map(getEnhancedListing).map((listing) => {
    const media = getGalleryStats(listing);
    const analytics = listingAnalyticsFor(listing);
    const liveViewing = activeViewerCount(analytics);
    const collabAgents = collabsForListing(listing);
    const statusAction = listing.status === "Live"
      ? "Mark Reserved"
      : listing.status === "Reserved"
      ? "Move to Draft"
      : listing.status === "Pending QC"
      ? "Withdraw to Draft"
      : listing.status === "Rejected"
      ? "Move to Draft"
      : "Submit to Admin";
    return `
    <article class="listing-card">
      <div class="listing-media">
        <img src="${listing.image}" alt="${listing.title}" loading="lazy">
        <span class="meta-pill">${listing.propertyType}</span>
        <span class="purpose-pill ${listing.listingPurpose === "rent" ? "is-rent" : "is-sale"}">${listing.listingPurpose === "rent" ? "For Rent" : "For Sale"}</span>
        <span class="listing-photo-count">${media.verified}/${media.total} photos</span>
      </div>
      <div class="listing-gallery-strip">
        ${media.gallery.slice(0, 5).map((slot) => `
          <span class="${slot.url && slot.status !== "pending_agent_upload" ? "" : "is-pending"}">
            ${slot.url ? `<img src="${slot.url}" alt="${escapeAttr(slot.label)}">` : `<i class="fa-solid fa-image"></i>`}
            <strong>${escapeHtml(slot.label)}</strong>
          </span>
        `).join("")}
      </div>
      <div class="listing-head">
        <div>
          <div class="listing-title">${listing.title}</div>
          <div class="subtext">${listing.area} · ${listing.address}</div>
        </div>
        <span class="meta-pill">${listing.status}</span>
      </div>
      <div class="listing-price">${money(listing.price)}</div>
      <div class="meta-row">
        <span class="meta-pill"><i class="fa-solid fa-eye"></i> ${Number(analytics.views || 0)} real views</span>
        <span class="meta-pill"><i class="fa-solid fa-signal"></i> ${liveViewing} live viewing</span>
        <span class="meta-pill"><i class="fa-brands fa-whatsapp"></i> ${Number(analytics.contacts || 0)} contacts</span>
        <span class="meta-pill"><i class="fa-solid fa-calendar-check"></i> ${Number(analytics.bookings || 0)} bookings</span>
        <span class="meta-pill"><i class="fa-solid fa-heart"></i> ${Number(analytics.saves || 0)} saves</span>
        ${collabAgents.length ? `<span class="meta-pill"><i class="fa-solid fa-handshake"></i> ${collabAgents.length} collab agent${collabAgents.length === 1 ? "" : "s"}</span>` : ""}
        ${listing.status === "Live" ? `<span class="meta-pill live-ready-pill"><i class="fa-solid fa-bolt"></i> Live for buyers</span>` : ""}
        ${listing.status === "Pending QC" ? `<span class="meta-pill live-ready-pill"><i class="fa-solid fa-user-shield"></i> Admin QC pending</span>` : ""}
        <span class="meta-pill"><i class="fa-solid fa-images"></i> ${media.verified >= LISTING_MIN_PHOTO_COUNT ? "Minimum 4 ready" : `${LISTING_MIN_PHOTO_COUNT - media.verified} photo(s) needed`}</span>
        ${listing.arLink ? `<span class="meta-pill"><i class="fa-solid fa-cube"></i> AR ready</span>` : `<span class="meta-pill">No AR</span>`}
      </div>
      <div class="action-row">
        <button class="ghost-button" data-action="toggle-listing-status" data-id="${listing.id}" type="button">
          <i class="fa-solid fa-repeat"></i>
          ${statusAction}
        </button>
        ${listing.imageDriveLink ? `<button class="ghost-button" data-action="open-listing-image" data-id="${listing.id}" type="button">
          <i class="fa-brands fa-google-drive"></i>
          Image
        </button>` : ""}
        ${listing.arLink ? `<button class="ghost-button" data-action="open-listing-ar" data-id="${listing.id}" type="button">
          <i class="fa-solid fa-cube"></i>
          AR
        </button>` : ""}
      </div>
    </article>
  `;
  }).join("");
}

function renderNotifications() {
  state.notifications = readStore(STORAGE_KEYS.agentNotifications, state.notifications);
  els.notificationList.innerHTML = [...state.notifications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((item) => `
      <article class="drawer-item">
        <strong>${item.title}</strong>
        <p>${item.message}</p>
        <time>${new Date(item.createdAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</time>
      </article>
  `).join("") || `<div class="empty-state">No real agent notifications yet.</div>`;
}

function listingStatusView(listing) {
  if (listing.status === "Live" && isAdminApprovedListing(listing)) {
    return { label: "Live", className: "live", note: "Visible to buyers", icon: "fa-circle-check" };
  }
  if (listing.status === "Pending QC") {
    return { label: "Pending QC", className: "pending", note: "Admin review before buyer visibility", icon: "fa-user-shield" };
  }
  if (listing.status === "Reserved") {
    return { label: "Reserved", className: "reserved", note: "Paused from active buyer push", icon: "fa-bookmark" };
  }
  if (listing.status === "Rejected") {
    return { label: "Needs Fix", className: "rejected", note: "Update details and resubmit", icon: "fa-circle-exclamation" };
  }
  return { label: "Draft", className: "draft", note: "Private until submitted", icon: "fa-pen" };
}

function renderCleanListingGrid() {
  if (!state.listings.length) {
    els.listingGrid.innerHTML = `
      <article class="listing-empty-state">
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <strong>No listings yet</strong>
        <p>Start above with the Excel template, upload an Excel/CSV file, or add a listing from your computer with at least ${LISTING_MIN_PHOTO_COUNT} photos. Every listing goes to admin QC before buyer visibility.</p>
        <button class="primary-button" id="emptyPostLiveListing" type="button">
          <i class="fa-solid fa-plus"></i>
          Add from device / computer
        </button>
      </article>
    `;
    document.getElementById("emptyPostLiveListing")?.addEventListener("click", openListingDeviceUpload);
    return;
  }

  els.listingGrid.innerHTML = state.listings.map(getEnhancedListing).map((listing) => {
    const media = getGalleryStats(listing);
    const analytics = listingAnalyticsFor(listing);
    const status = listingStatusView(listing);
    const statusAction = listing.status === "Live"
      ? "Mark Reserved"
      : listing.status === "Reserved"
      ? "Move to Draft"
      : listing.status === "Pending QC"
      ? "Withdraw to Draft"
      : listing.status === "Rejected"
      ? "Move to Draft"
      : "Submit to Admin";

    return `
      <article class="listing-card listing-card-clean">
        <div class="listing-media">
          <img src="${escapeAttr(listing.image)}" alt="${escapeAttr(listing.title)}" loading="lazy">
          <span class="listing-status-pill ${status.className}">
            <i class="fa-solid ${status.icon}"></i>
            ${status.label}
          </span>
          <span class="listing-photo-count">${media.verified}/${media.total} photos${(listing.panoramas || []).length ? ` · ${listing.panoramas.length}x 360°` : ""}</span>
        </div>
        <div class="listing-head listing-head-clean">
          <div>
            <div class="listing-title">${escapeHtml(listing.title)}</div>
            <div class="subtext">${escapeHtml(listing.area)} · ${escapeHtml(listing.propertyType || "Property")}</div>
          </div>
          <div class="listing-price">${money(listing.price)}</div>
        </div>
        <p class="listing-clean-address">${escapeHtml(listing.address || `${listing.area}, Malaysia`)}</p>
        <div class="listing-clean-note ${status.className}">
          <i class="fa-solid ${status.icon}"></i>
          <span>${status.note}</span>
        </div>
        <div class="listing-clean-stats">
          <span><strong>${Number(analytics.views || 0)}</strong> views</span>
          <span><strong>${Number(analytics.contacts || 0)}</strong> contacts</span>
          <span><strong>${Number(analytics.bookings || 0)}</strong> bookings</span>
          <span><strong>${media.verified >= LISTING_MIN_PHOTO_COUNT ? "Ready" : `${LISTING_MIN_PHOTO_COUNT - media.verified} missing`}</strong> photos</span>
        </div>
        <div class="listing-clean-actions">
          <button class="ghost-button" data-action="toggle-listing-status" data-id="${listing.id}" type="button">
            <i class="fa-solid fa-repeat"></i>
            ${statusAction}
          </button>
          ${listing.imageDriveLink ? `<button class="ghost-button" data-action="open-listing-image" data-id="${listing.id}" type="button">
            <i class="fa-brands fa-google-drive"></i>
            Image
          </button>` : ""}
          ${listing.arLink ? `<button class="ghost-button" data-action="open-listing-ar" data-id="${listing.id}" type="button">
            <i class="fa-solid fa-cube"></i>
            AR
          </button>` : ""}
          ${listing.backendId && listing.status === "Live" ? `<button class="ghost-button share-listing-button" data-action="share-listing" data-id="${listing.id}" type="button">
            <i class="fa-brands fa-whatsapp"></i>
            Share
          </button>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function shareListingToWhatsApp(id) {
  const listing = state.listings.find((item) => String(item.id) === String(id));
  if (!listing?.backendId) {
    showToast("This listing gets a shareable page once it is live.");
    return;
  }
  const publicUrl = `https://realitygenius.company/property/${listing.backendId}`;
  const price = listing.price ? `RM ${Math.round(listing.price).toLocaleString("en-MY")}` : "";
  const text = `🏠 ${listing.title}${price ? ` — ${price}` : ""}\n📍 ${listing.address || listing.area || "Malaysia"}\nView photos, AI insights & 360° tour:\n${publicUrl}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  showToast("WhatsApp share ready. The link shows a rich preview.");
}

function pushNotifications(title, message) {
  state.notifications = [
    {
      id: Date.now(),
      title,
      message,
      createdAt: new Date().toISOString()
    },
    ...readStore(STORAGE_KEYS.agentNotifications, [])
  ];
  writeStore(STORAGE_KEYS.agentNotifications, state.notifications);
  if (typeof window.RealtyGeniusPush?.notify === "function") {
    window.RealtyGeniusPush.notify(title, message, {
      tag: `rg-agent-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      url: new URL("agent.html", location.href).href
    });
  }
}

function pushUserNotification(title, message) {
  const key = "kvai_user_notifications";
  const existing = readStore(key, []);
  writeStore(key, [
    {
      id: Date.now(),
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false
    },
    ...existing
  ]);
}

function activePlanTier() {
  const storedPlan = normalizeAgentPlan(localStorage.getItem("agent_plan") || state.subscription?.planId);
  if (storedPlan === "free") return FREE_AGENT_PLAN;
  return AGENT_PLAN_TIERS.find((plan) => plan.id === storedPlan) || FREE_AGENT_PLAN;
}

function normalizeAgentPlan(plan = "") {
  const normalized = String(plan || "").trim().toLowerCase();
  if (BACKEND_PLAN_TO_AGENT_PLAN[normalized]) return BACKEND_PLAN_TO_AGENT_PLAN[normalized];
  if (normalized === "premium") return "elite";
  if (["free", "starter", "pro", "elite"].includes(normalized)) return normalized;
  return "free";
}

function setAgentPlan(plan, status = state.subscription?.status || "active") {
  const normalized = normalizeAgentPlan(plan);
  const tier = normalized === "free" ? FREE_AGENT_PLAN : AGENT_PLAN_TIERS.find((item) => item.id === normalized) || FREE_AGENT_PLAN;
  localStorage.setItem("agent_plan", normalized);
  state.subscription = {
    ...state.subscription,
    planId: tier.id,
    planName: tier.name,
    amount: tier.price,
    currency: "MYR",
    status,
    testMode: false,
    startedAt: state.subscription?.startedAt || new Date().toISOString()
  };
  writeStore(STORAGE_KEYS.agentSubscription, state.subscription);
}

function canUse(feature) {
  const activeStatus = ["active", "live_active", "trialing"].includes(String(state.subscription?.status || "").toLowerCase());
  const plan = activeStatus ? normalizeAgentPlan(localStorage.getItem("agent_plan") || state.subscription?.planId) : "free";
  return PLAN_FEATURES[plan]?.[feature] === true;
}

function upgradeTargetForFeature(feature) {
  const target = FEATURE_UNLOCK_COPY[feature]?.plan || "pro";
  return AGENT_PLAN_TIERS.find((plan) => plan.id === target) || AGENT_PLAN_TIERS[1];
}

function requirePlan(feature) {
  if (canUse(feature)) return true;
  const copy = FEATURE_UNLOCK_COPY[feature] || {};
  const target = upgradeTargetForFeature(feature);
  showToast(copy.message || "This feature is locked. Upgrade your plan to unlock it.");
  if (window.confirm(`${copy.message || "This feature is locked."}\n\nUpgrade to ${target.name} now?`)) {
    activateAgentPlan(target.id);
  } else {
    document.getElementById("agentPricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return false;
}

function billingStatusLabel() {
  if (state.subscription?.status === "live_active" || state.subscription?.status === "active") return "Stripe active";
  if (state.subscription?.status === "checkout_processing") return "Opening Stripe";
  if (state.subscription?.status === "checkout_verifying") return "Verifying payment";
  if (state.subscription?.status === "past_due") return "Payment past due";
  if (state.subscription?.status === "checkout_cancelled") return "Checkout cancelled";
  return "Free";
}

function agentApiBaseUrl() {
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

function agentApiUrl(path) {
  const base = agentApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${base}${normalizedPath.slice(4)}`;
  }
  return `${base}${normalizedPath}`;
}

function agentMeApiUrl() {
  if (window.location.protocol === "file:") return "http://localhost:3000/api/agent/me";
  return `${window.location.origin}/api/agent/me`;
}

// Same-origin (Vercel) is tried first; the Render backend is a resilient
// fallback if Vercel's own Supabase/Stripe env vars aren't configured.
// Session creation is idempotent from a billing standpoint - it never
// charges anything by itself - so retrying against a second backend on
// failure is safe.
async function fetchJsonWithFallback(urls, options) {
  let lastError;
  for (const url of urls) {
    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        lastError = new Error(data.error || `Request failed with ${response.status}`);
        continue;
      }
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Request failed.");
}

async function refreshAgentSubscription({ silent = false } = {}) {
  const token = await readAgentAuthToken();
  if (!token) return null;

  try {
    const payload = await fetchJsonWithFallback([agentMeApiUrl(), agentApiUrl("/agent/me")], {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    if (!payload.agent) throw new Error(payload.error || "Unable to refresh subscription");

    const agent = payload.agent;
    const planId = normalizeAgentPlan(agent.subscription_plan);
    const active = ["active", "trialing"].includes(String(agent.subscription_status || "").toLowerCase());
    if (active) {
      setAgentPlan(planId, "active");
    } else {
      localStorage.setItem("agent_plan", "free");
      state.subscription = {
        ...seedSubscription,
        status: agent.subscription_status || "inactive"
      };
      writeStore(STORAGE_KEYS.agentSubscription, state.subscription);
    }
    state.subscription.permissions = agent.permissions || {};
    state.subscription.auctionSlotsMonthly = Number(agent.auction_slots_monthly || 0);
    persistAll();
    renderWorkspace();
    return agent;
  } catch (error) {
    if (!silent) showToast(error.message || "Subscription refresh failed");
    return null;
  }
}

function renderAgentBilling() {
  const plan = activePlanTier();
  const featureCards = [
    { feature: "aiCaption", title: "AI Content Creator", body: "Listing descriptions, SEO keywords, captions, scripts, and WhatsApp copy.", planId: "starter" },
    { feature: "aiNegotiation", title: "AI Negotiation", body: "Offer analysis, counter-price suggestions, and buyer response guidance.", planId: "pro" },
    { feature: "leadHeat", title: "Lead Heat", body: "Hot lead scoring, priority pipeline, and faster follow-up workflow.", planId: "pro" },
    { feature: "auctionSlot", title: "Friday Auction Night", body: "Submit premium listings into weekly live buyer bidding.", planId: "elite" }
  ];
  const activeAt = state.subscription?.startedAt
    ? new Date(state.subscription.startedAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })
    : "Not started";

  if (els.agentBillingStrip) {
    const launchCopy = FREE_LAUNCH_MODE
      ? {
          label: "Launch access",
          title: "All agent tools are free for now",
          detail: "AI Content Creator, AR Builder, AI Negotiation, Lead Heat, Auction Night, document tools, and listing workflows are open during launch.",
          button: "View Tools"
        }
      : {
          label: "Agent subscription",
          title: `${plan.name} - ${money(plan.price)}/month`,
          detail: `${billingStatusLabel()} - ${activeAt} - Premium unlocks lead alerts, captions, reports, and follow-up automation.`,
          button: "Manage Plan"
        };
    els.agentBillingStrip.innerHTML = `
      <div class="billing-strip-copy">
        <span><i class="fa-solid ${FREE_LAUNCH_MODE ? "fa-unlock-keyhole" : "fa-credit-card"}"></i> ${escapeHtml(launchCopy.label)}</span>
        <strong>${escapeHtml(launchCopy.title)}</strong>
        <small>${escapeHtml(launchCopy.detail)}</small>
      </div>
      <button class="primary-button" data-action="open-agent-billing" type="button">
        <i class="fa-solid fa-gem"></i>
        ${escapeHtml(launchCopy.button)}
      </button>
    `;
  }

  if (!els.agentTierGrid) return;
  els.agentTierGrid.innerHTML = featureCards.map((card) => {
    const unlocked = canUse(card.feature);
    return `
      <article class="feature-card ${unlocked ? "unlocked" : "locked"}">
        <span>${unlocked ? "Unlocked" : "Locked"}</span>
        <h3>${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.body)}</p>
        <button class="${unlocked ? "ghost-button" : "primary-button"}" data-action="select-agent-plan" data-plan-id="${escapeAttr(card.planId)}" type="button">
          ${unlocked ? "Available now" : `Upgrade to ${escapeHtml(upgradeTargetForFeature(card.feature).name)}`}
        </button>
      </article>
    `;
  }).join("") + AGENT_PLAN_TIERS.map((tier) => {
    const isActive = tier.id === plan.id && ["live_active", "active"].includes(state.subscription?.status);
    return `
      <article class="billing-tier-card ${tier.id === "elite" ? "recommended" : ""} ${isActive ? "active" : ""}">
        <div class="billing-tier-head">
          <span>${escapeHtml(tier.badge)}</span>
          ${isActive ? `<strong><i class="fa-solid fa-circle-check"></i> Active</strong>` : ""}
        </div>
        <h4>${escapeHtml(tier.name)}</h4>
        <p>${escapeHtml(tier.tagline)}</p>
        <div class="billing-price">
          <strong>${money(tier.price)}</strong>
          <span>/ month</span>
        </div>
        <ul>
          ${tier.features.map((feature) => `<li><i class="fa-solid fa-check"></i>${escapeHtml(feature)}</li>`).join("")}
        </ul>
        <button class="${isActive ? "ghost-button" : "primary-button"} full-width" data-action="select-agent-plan" data-plan-id="${escapeAttr(tier.id)}" type="button">
          ${isActive ? "Current Plan" : tier.id === "elite" ? "Upgrade to Elite Agent" : `Choose ${escapeHtml(tier.name)}`}
        </button>
      </article>
    `;
  }).join("");
}

function readAgentSession() {
  if (window.RealtyGeniusSession) return window.RealtyGeniusSession;
  return readStore("rg_session", null);
}

async function readAgentAuthToken() {
  const storedToken = localStorage.getItem("rg_token") || readAgentSession()?.token || "";
  if (storedToken) return storedToken;

  try {
    const session = await window.RealityGeniusAuth?.getSession?.();
    if (session?.access_token) {
      localStorage.setItem("rg_token", session.access_token);
      const current = readAgentSession() || {};
      window.RealtyGeniusSession = {
        ...current,
        token: session.access_token,
        email: current.email || session.user?.email || "",
        authUserId: current.authUserId || session.user?.id || ""
      };
      localStorage.setItem("rg_session", JSON.stringify(window.RealtyGeniusSession));
      return session.access_token;
    }
  } catch (error) {
    if (window.RGLogError) window.RGLogError(error, { feature: "agent_auth_token_recovery" });
  }

  return "";
}

// Appends client_reference_id (the real Supabase user id) and
// prefilled_email to a static Stripe Payment Link URL. Stripe carries
// client_reference_id straight through to the resulting Checkout
// Session, which is how the webhook knows which agent paid - a plain
// Payment Link has no other way to identify who clicked it.
function buildStripePaymentLinkUrl(baseUrl, { agentId = "", email = "" } = {}) {
  const url = new URL(baseUrl);
  if (agentId) url.searchParams.set("client_reference_id", agentId);
  if (email) url.searchParams.set("prefilled_email", email);
  return url.toString();
}

async function goToStripePaymentLink(paymentLinkUrl, context = {}) {
  const token = await readAgentAuthToken();
  if (!token) {
    showToast("Login as an approved agent before upgrading");
    window.location.href = "/login.html?role=agent&next=/agent.html";
    return;
  }
  const profile = readLiveAgentProfile();
  const agentId = window.RealtyGeniusSession?.authUserId || profile.id || "";
  const email = window.RealtyGeniusSession?.email || profile.email || "";
  persistAll();
  showToast(context.toastMessage || "Opening secure Stripe checkout");
  window.location.assign(buildStripePaymentLinkUrl(paymentLinkUrl, { agentId, email }));
}

async function activateAgentPlan(planId) {
  const plan = AGENT_PLAN_TIERS.find((tier) => tier.id === planId);
  if (!plan) return;

  state.subscription = {
    ...state.subscription,
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    currency: "MYR",
    status: "checkout_processing",
    testMode: false
  };
  renderAgentBilling();
  await goToStripePaymentLink(plan.paymentLinkUrl, { toastMessage: `Opening ${plan.name} checkout` });
}

async function purchaseExtraAuctionSlot() {
  await goToStripePaymentLink(EXTRA_AUCTION_SLOT.paymentLinkUrl, { toastMessage: "Opening Extra Auction Slot checkout" });
}

function readLeakProofDeals() {
  return readStore(STORAGE_KEYS.leakProofDeals, []);
}

function writeLeakProofDeals(deals) {
  writeStore(STORAGE_KEYS.leakProofDeals, deals);
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

function dealReference(prefix, propertyId) {
  return `${prefix}-${propertyId}-${Date.now().toString(36).toUpperCase()}`;
}

function getDealById(id) {
  return readLeakProofDeals().find((deal) => String(deal.id) === String(id)) || null;
}

function escapeAttr(value = "") {
  return String(value).replace(/"/g, "&quot;");
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

function statusCopy(value) {
  return String(value || "not_started").replace(/_/g, " ");
}

function renderLeakProofDealBoard() {
  if (!els.leakProofDealBoard) return;
  const deals = readLeakProofDeals().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  if (!deals.length) {
    els.leakProofDealBoard.innerHTML = `
      <div class="empty-state leakproof-empty">
        <strong>No buyer has started escrow yet.</strong>
        <p>Once a buyer clicks Pay Booking Fee, starts the DSR loan path, or signs an offer in user.html, the official deal record appears here.</p>
        <div class="action-row">
          <button class="ghost-button" data-action="open-document-vault" type="button">Open DSR Vault</button>
          <button class="ghost-button" data-action="jump-section" data-section="leads" type="button">Check Negotiations</button>
        </div>
      </div>
    `;
    return;
  }

  els.leakProofDealBoard.innerHTML = deals.map((deal) => {
    const escrow = deal.escrow || {};
    const loan = deal.loan || {};
    const offer = deal.offer || {};
    const signatures = Number(Boolean(offer.buyerSignedAt)) + Number(Boolean(offer.agentSignedAt));
    const releaseReady = escrow.status === "held" && offer.status === "fully_signed";
    return `
      <article class="leakproof-card">
        <div class="leakproof-card-head">
          <div>
            <div class="eyebrow">Official Deal Room</div>
            <h4>${deal.propertyTitle}</h4>
            <p>${deal.buyerName || "Buyer"} - ${deal.propertyArea} - ${money(deal.askingPrice || 0)}</p>
          </div>
          <span class="leakproof-status ${releaseReady ? "ready" : ""}">${releaseReady ? "Release ready" : statusCopy(escrow.status)}</span>
        </div>

        <div class="leakproof-lock-grid">
          <div>
            <span>Escrow</span>
            <strong>${escrow.status === "held" ? `${money(escrow.amount)} held` : escrow.status === "released" ? "Released" : "Not paid"}</strong>
            <small>${escrow.reference || "No escrow reference yet"}</small>
          </div>
          <div>
            <span>Loan path</span>
            <strong>${statusCopy(loan.status)}</strong>
            <small>${loan.status === "discount_secured" ? "0.1% rate path submitted" : "DSR vault keeps buyer here"}</small>
          </div>
          <div>
            <span>Letter of Offer</span>
            <strong>${statusCopy(offer.status)}</strong>
            <small>${offer.reference || "Paper trail not generated"} - ${signatures}/2 signatures</small>
          </div>
        </div>

        <div class="leakproof-actions">
          <button class="ghost-button" data-action="agent-open-vault-for-deal" data-id="${escapeAttr(deal.id)}" type="button">Open DSR Vault</button>
          <button class="ghost-button" data-action="agent-sign-offer" data-id="${escapeAttr(deal.id)}" type="button" ${offer.agentSignedAt ? "disabled" : ""}>${offer.agentSignedAt ? "Agent Signed" : offer.status === "not_started" ? "Generate Offer" : "Agent E-Sign"}</button>
          <button class="primary-button" data-action="agent-release-escrow" data-id="${escapeAttr(deal.id)}" type="button">${escrow.status === "released" ? "Escrow Released" : "Release Escrow"}</button>
        </div>
      </article>
    `;
  }).join("");
}

function openVaultForDeal(id) {
  const deal = getDealById(id);
  if (!deal) return;
  renderDocumentVault();
  els.vaultBuyerName.value = deal.buyerName || "";
  els.vaultBuyerPhone.value = deal.buyerPhone || "";
  openModal("documentVaultModal");
  showToast("Buyer details loaded into DSR Vault");
}

function signDealOffer(id) {
  let deal = getDealById(id);
  if (!deal) return;
  const offer = deal.offer || {};
  if (offer.agentSignedAt) {
    showToast("Agent already signed this offer");
    return;
  }
  const generatedOffer = offer.status && offer.status !== "not_started";
  const buyerSigned = Boolean(offer.buyerSignedAt);

  deal = {
    ...deal,
    offer: {
      ...offer,
      status: buyerSigned ? "fully_signed" : "agent_signed",
      reference: offer.reference || dealReference("LOO", deal.propertyId),
      offerPrice: offer.offerPrice || Math.round((deal.askingPrice || 0) * 0.976),
      generatedAt: offer.generatedAt || new Date().toISOString(),
      agentSignedAt: offer.agentSignedAt || new Date().toISOString()
    }
  };

  deal = appendDealEvent(
    deal,
    generatedOffer ? "Agent e-signed Letter of Offer" : "Agent generated and e-signed offer",
    buyerSigned ? "Both signatures are captured. Escrow is now release-ready." : "Agent signature captured. Waiting for buyer e-sign."
  );
  saveLeakProofDeal(deal);
  pushNotifications("Offer paper trail updated", `${deal.propertyTitle}: agent signature captured.`);
  pushUserNotification("Agent signed Letter of Offer", `${deal.propertyTitle}: agent signature is recorded in RealtyGenius.`);
  renderLeakProofDealBoard();
  showToast(buyerSigned ? "Offer fully signed" : "Agent signature captured");
}

function releaseEscrow(id) {
  let deal = getDealById(id);
  if (!deal) return;
  if (deal.escrow?.status !== "held") {
    showToast("No held escrow to release");
    return;
  }
  if (deal.offer?.status !== "fully_signed") {
    showToast("Escrow stays held until buyer and agent sign");
    return;
  }

  deal = {
    ...deal,
    escrow: {
      ...deal.escrow,
      status: "released",
      releasedAt: new Date().toISOString()
    }
  };
  deal = appendDealEvent(deal, "Escrow released", `${money(deal.escrow.amount)} released after the signed offer checkpoint.`);
  saveLeakProofDeal(deal);
  pushNotifications("Escrow released", `${deal.propertyTitle}: booking fee released after e-sign completion.`);
  pushUserNotification("Escrow released", `${deal.propertyTitle}: booking fee was released after both signatures were captured.`);
  renderLeakProofDealBoard();
  showToast("Escrow released");
}

function renderNegotiationDeskLegacy() {
  const threads = getNegotiationThreads()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  els.agentNegotiationList.innerHTML = threads.length ? threads.map((thread) => {
    const latest = thread.entries[thread.entries.length - 1];
    const ai = window.NegotiationAssistant.negotiationAssistant.evaluate({
      role: "agent",
      message: latest?.message || "Buyer sent an offer",
      askingPrice: thread.askingPrice,
      marketValue: thread.askingPrice * 0.985,
      offerPrice: latest?.price || thread.askingPrice,
      propertyArea: thread.propertyArea
    });

    return `
      <article class="agent-negotiation-card">
        <div class="lead-head">
          <div>
            <div class="lead-name">${thread.propertyTitle}</div>
            <div class="subtext">${thread.buyerName} • ${thread.buyerPhone}</div>
          </div>
          <span class="negotiation-status ${thread.status}">${thread.status}</span>
        </div>
        <div class="meta-row">
          <span class="meta-pill">Ask ${money(thread.askingPrice)}</span>
          ${latest?.price ? `<span class="meta-pill">Latest ${money(latest.price)}</span>` : ""}
        </div>
        <div class="negotiation-suggestion dark">
          <strong>AI counter: ${ai.suggestion.counterOfferDisplay}</strong>
          <p>${ai.suggestion.strategy}</p>
          <p>${ai.suggestion.persuasiveResponse}</p>
        </div>
        <div class="negotiation-input">
          <i class="fa-solid fa-money-bill-wave"></i>
          <input data-agent-price="${thread.id}" type="number" placeholder="Your counter price" value="${ai.suggestion.counterOffer}">
        </div>
        <div class="action-row">
          <button class="primary-button" data-action="agent-counter" data-id="${thread.id}" type="button">Send Counter</button>
          <button class="ghost-button" data-action="agent-accept" data-id="${thread.id}" type="button">Accept</button>
          <button class="ghost-button" data-action="agent-reject" data-id="${thread.id}" type="button">Reject</button>
          <button class="ghost-button" data-action="agent-close" data-id="${thread.id}" type="button">Close User</button>
        </div>
      </article>
    `;
  }).join("") : `<div class="subtext">No active negotiation threads yet.</div>`;
}

function handleNegotiationAction(threadId, action) {
  const thread = window.KVNegotiationStore.getById(threadId);
  if (!thread) return;

  const priceInput = document.querySelector(`[data-agent-price="${threadId}"]`);
  const chosenPrice = Number(priceInput?.value || thread.askingPrice);
  const latest = thread.entries[thread.entries.length - 1];
  const ai = window.NegotiationAssistant.negotiationAssistant.evaluate({
    role: "agent",
    message: latest?.message || "Buyer sent an offer",
    askingPrice: thread.askingPrice,
    marketValue: thread.askingPrice * 0.985,
    offerPrice: chosenPrice,
    propertyArea: thread.propertyArea
  });

  const payload = {
    actor: "agent",
    actorLabel: "Agent",
    type: action,
    price: action === "reject" || action === "close" ? null : chosenPrice,
    status: action === "accept" ? "accepted" : action === "reject" ? "rejected" : action === "close" ? "closed" : "open",
    message:
      action === "counter"
        ? ai.suggestion.persuasiveResponse
        : action === "accept"
          ? `Agent accepted the deal at ${money(chosenPrice)}.`
          : action === "reject"
            ? "Agent rejected the latest negotiation and asked to revisit the value."
            : "Agent closed this negotiation for this property and buyer."
  };

  window.KVNegotiationStore.appendEntry(threadId, payload);

  pushNotifications("Negotiation updated", `${thread.propertyTitle} for ${thread.buyerName} moved to ${payload.status}.`);
  pushUserNotification(
    `Agent ${payload.status}`,
    `${thread.propertyTitle}: ${payload.message}`
  );

  renderWorkspace();
  showToast(action === "close" ? "User negotiation closed" : "Negotiation updated");
}

function renderLeadList() {
  if (!canUse("leadHeat")) {
    els.leadList.innerHTML = `
      <article class="feature-card locked">
        <h3>Lead Heat is locked</h3>
        <p>Upgrade to Pro or Elite to unlock hot lead scoring, priority follow-up, and lead temperature workflow.</p>
        <button class="primary-button" data-action="select-agent-plan" data-plan-id="pro" type="button">Upgrade to Pro</button>
      </article>
    `;
    return;
  }
  const leads = leadListForFilter();
  els.leadList.innerHTML = leads.map((lead) => `
    <article class="lead-card">
      <div class="lead-head">
        <div>
          <div class="lead-name">${lead.name}</div>
          <div class="subtext">${lead.area} - ${lead.phone}</div>
        </div>
        <span class="status-pill ${getTemperatureClass(lead.temperature)}">${lead.temperature}</span>
      </div>
      <p class="subtext">${lead.note}</p>
      <div class="meta-row">
        <span class="meta-pill">${lead.stage}</span>
        <span class="meta-pill">${lead.probability}% close chance</span>
        <span class="meta-pill">${money(lead.budget)}</span>
      </div>
      <div class="action-row">
        <a class="primary-button" href="${getWhatsappLink(lead)}" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-whatsapp"></i>
          Contact now
        </a>
        <button class="ghost-button" data-action="promote-lead" data-id="${lead.id}" type="button">
          <i class="fa-solid fa-arrow-up-right-dots"></i>
          Move forward
        </button>
      </div>
    </article>
  `).join("") || `<div class="subtext">No leads match this filter.</div>`;
}

function renderNegotiationDesk() {
  if (!canUse("aiNegotiation")) {
    els.agentNegotiationList.innerHTML = `
      <article class="feature-card locked">
        <h3>AI Negotiation is locked</h3>
        <p>Upgrade to Pro or Elite to unlock buyer offer analysis, AI counter suggestions, and negotiation desk actions.</p>
        <button class="primary-button" data-action="select-agent-plan" data-plan-id="pro" type="button">Upgrade to Pro</button>
      </article>
    `;
    return;
  }
  const threads = getNegotiationThreads()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  els.agentNegotiationList.innerHTML = threads.length ? threads.map((thread) => {
    const latest = thread.entries[thread.entries.length - 1];
    const ai = window.NegotiationAssistant.negotiationAssistant.evaluate({
      role: "agent",
      message: latest?.message || "Buyer sent an offer",
      askingPrice: thread.askingPrice,
      marketValue: thread.askingPrice * 0.985,
      offerPrice: latest?.price || thread.askingPrice,
      propertyArea: thread.propertyArea
    });

    return `
      <article class="agent-negotiation-card">
        <div class="lead-head">
          <div>
            <div class="lead-name">${thread.propertyTitle}</div>
            <div class="subtext">${thread.buyerName} - ${thread.buyerPhone}</div>
          </div>
          <span class="negotiation-status ${thread.status}">${thread.status}</span>
        </div>
        <div class="meta-row">
          <span class="meta-pill">Ask ${money(thread.askingPrice)}</span>
          ${latest?.price ? `<span class="meta-pill">Latest ${money(latest.price)}</span>` : ""}
        </div>
        <div class="negotiation-suggestion dark">
          <strong>AI counter: ${ai.suggestion.counterOfferDisplay}</strong>
          <p>${ai.suggestion.strategy}</p>
          <p>${ai.suggestion.persuasiveResponse}</p>
        </div>
        <div class="negotiation-input">
          <i class="fa-solid fa-money-bill-wave"></i>
          <input data-agent-price="${thread.id}" type="number" placeholder="Your counter price" value="${ai.suggestion.counterOffer}">
        </div>
        <div class="action-row">
          <button class="primary-button" data-action="agent-counter" data-id="${thread.id}" type="button">Send Counter</button>
          <button class="ghost-button" data-action="agent-accept" data-id="${thread.id}" type="button">Accept</button>
          <button class="ghost-button" data-action="agent-reject" data-id="${thread.id}" type="button">Reject</button>
          <button class="ghost-button" data-action="agent-close" data-id="${thread.id}" type="button">Close User</button>
        </div>
      </article>
    `;
  }).join("") : `<div class="subtext">No active negotiation threads yet.</div>`;
}

function syncSectionVisibility() {
  els.navItems.forEach((item) => {
    const isActive = item.dataset.section === state.section;
    item.classList.toggle("active", isActive);
    if (isActive) item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  });
  els.shortcutItems.forEach((item) => item.classList.toggle("active", item.dataset.section === state.section));
  els.panels.forEach((panel) => {
    const show = panel.dataset.panel === state.section;
    panel.classList.toggle("hidden-section", !show);
  });
}

function getWhatsappLink(lead) {
  const text = `Hi ${lead.name}, I found a stronger match in ${lead.area} and want to move your search forward today.`;
  return `https://wa.me/${lead.phone}?text=${encodeURIComponent(text)}`;
}

function moveLeadForward(id) {
  const order = ["New", "Contacted", "Viewing", "Negotiation"];
  state.leads = state.leads.map((lead) => {
    if (lead.id !== id) return lead;
    const currentIndex = order.indexOf(lead.stage);
    const nextStage = order[Math.min(currentIndex + 1, order.length - 1)];
    return { ...lead, stage: nextStage };
  });

  const lead = state.leads.find((item) => item.id === id);
  if (lead && !state.clients.some((client) => client.name === lead.name)) {
    state.clients = [
      {
        id: Date.now(),
        name: lead.name,
        stage: lead.stage === "Negotiation" ? "Negotiation" : "Active follow-up",
        nextStep: `Advance ${lead.name} with a ${lead.temperature.toLowerCase()} lead script and tighter property framing.`,
        area: lead.area,
        value: lead.budget
      },
      ...state.clients
    ];
  }

  state.notifications = [
    {
      id: Date.now(),
      title: "Lead advanced",
      message: `${lead.name} is now in ${lead.stage}. Keep momentum while intent is still fresh.`,
      createdAt: new Date().toISOString()
    },
    ...state.notifications
  ];

  persistAll();
  renderWorkspace();
  showToast("Lead moved forward");
}

async function toggleListingStatus(id) {
  const cycle = {
    Live: "Reserved",
    Reserved: "Draft",
    Draft: "Pending QC",
    "Pending QC": "Draft",
    Rejected: "Draft"
  };

  state.listings = state.listings.map((listing) => {
    if (String(listing.id) !== String(id)) return listing;
    const nextStatus = cycle[listing.status] || "Pending QC";
    return {
      ...listing,
      status: nextStatus,
      adminApproved: nextStatus === "Live" ? listing.adminApproved : false,
      approvalStatus: nextStatus === "Pending QC" ? "pending_qc" : nextStatus.toLowerCase(),
      liveStatus: nextStatus === "Pending QC" ? "pending_admin_review" : "not_live"
    };
  });

  let updated = state.listings.find((listing) => String(listing.id) === String(id));
  if (updated?.status === "Live" && isAdminApprovedListing(updated)) {
    publishListingsLive([updated], "status update");
  } else if (updated?.status === "Pending QC") {
    try {
      updated = await saveAgentListingToBackend(updated);
      state.listings = state.listings.map((listing) => String(listing.id) === String(id) ? updated : listing);
    } catch (error) {
      state.listings = state.listings.map((listing) => String(listing.id) === String(id) ? { ...listing, status: "Draft" } : listing);
      persistAll();
      renderWorkspace();
      showToast(error.message || LIVE_LISTING_SAVE_ERROR);
      return;
    }
    submitListingsForAdminReview([updated], "status update");
  } else {
    removeBuyerLiveListing(id);
  }

  persistAll();
  renderWorkspace();
  showToast(updated?.status === "Pending QC" ? "Sent to admin QC" : updated?.status === "Live" ? "Listing is live for buyers" : "Listing status updated");
}

function addLead(event) {
  event.preventDefault();
  const lead = {
    id: Date.now(),
    name: els.leadName.value.trim(),
    phone: els.leadPhone.value.trim(),
    area: els.leadArea.value.trim(),
    stage: "New",
    temperature: els.leadTemperature.value,
    budget: els.leadTemperature.value === "Hot" ? 1200000 : els.leadTemperature.value === "Warm" ? 850000 : 650000,
    probability: els.leadTemperature.value === "Hot" ? 82 : els.leadTemperature.value === "Warm" ? 58 : 29,
    note: "Fresh lead added into the desk and ready for structured follow-up."
  };

  state.leads = [lead, ...state.leads];
  state.notifications = [
    {
      id: Date.now() + 1,
      title: "New lead added",
      message: `${lead.name} entered the desk for ${lead.area}.`,
      createdAt: new Date().toISOString()
    },
    ...state.notifications
  ];

  els.leadForm.reset();
  closeModal("leadModal");
  persistAll();
  renderWorkspace();
  showToast("Lead saved");
}

function updateListingDevicePhotoStatus(message, tone = "neutral") {
  if (!els.listingDevicePhotoStatus) return;
  els.listingDevicePhotoStatus.className = `device-photo-status ${tone}`;
  els.listingDevicePhotoStatus.textContent = message;
}

function countListingFormPhotos() {
  const bulkLinks = splitPhotoLinks(els.listingBulkPhotoLinks?.value || "");
  const extraLinks = splitPhotoLinks(els.listingExtraPhotoLinks?.value || "");
  const slotLinks = [
    els.listingImageLink?.value,
    els.listingTopViewLink?.value,
    els.listingRoom1Link?.value,
    els.listingBathroomLink?.value,
    els.listingKitchenLink?.value
  ].filter((value) => String(value || "").trim());
  return Math.min(
    LISTING_RECOMMENDED_PHOTO_COUNT,
    listingDevicePhotos.length || [...slotLinks, ...extraLinks, ...bulkLinks].length
  );
}

function updateListingSubmitCopy() {
  if (!els.listingSubmitButton || !els.listingStatus) return;
  const status = els.listingStatus.value;
  const label = status === "Draft" ? "Save Draft" : status === "Reserved" ? "Save Reserved Listing" : "Submit for QC";
  const icon = status === "Draft" ? "fa-floppy-disk" : status === "Reserved" ? "fa-bookmark" : "fa-shield-circle-check";
  els.listingSubmitButton.innerHTML = `<i class="fa-solid ${icon}"></i>${label}`;
}

function updateListingQcChecklist() {
  if (!els.listingQcChecklist) return;

  const price = parseMoneyValue(els.listingPrice?.value);
  const photoCount = countListingFormPhotos();
  const items = [
    {
      label: "Title",
      ready: Boolean(els.listingTitle?.value.trim())
    },
    {
      label: "Area",
      ready: Boolean(els.listingArea?.value.trim())
    },
    {
      label: "Price",
      ready: Number.isFinite(price) && price > 0
    },
    {
      label: `${photoCount}/${LISTING_MIN_PHOTO_COUNT} photos`,
      ready: photoCount >= LISTING_MIN_PHOTO_COUNT
    }
  ];
  const readyCount = items.filter((item) => item.ready).length;

  els.listingQcChecklist.innerHTML = items.map((item) => `
    <div class="listing-qc-item ${item.ready ? "ready" : ""}">
      <i class="fa-solid ${item.ready ? "fa-circle-check" : "fa-circle-exclamation"}"></i>
      <span>${escapeHtml(item.label)}</span>
    </div>
  `).join("");

  if (els.listingQcScore) {
    els.listingQcScore.textContent = readyCount === items.length
      ? "Ready for admin QC"
      : `${readyCount}/${items.length} ready for QC`;
  }
  updateListingSubmitCopy();
}

function normalizeListingPriceInput() {
  if (!els.listingPrice) return;
  const price = parseMoneyValue(els.listingPrice.value);
  if (Number.isFinite(price) && price > 0) {
    els.listingPrice.value = `RM ${Math.round(price).toLocaleString("en-MY")}`;
  }
  updateListingQcChecklist();
}

function applyListingSmartDefaults() {
  const area = els.listingArea?.value.trim();
  const type = els.listingPropertyType?.value.trim();
  if (area && type && els.listingTitle && !els.listingTitle.value.trim()) {
    els.listingTitle.value = `${area} ${type}`;
  }
  if (area && els.listingAddress && !els.listingAddress.value.trim()) {
    els.listingAddress.value = `${area}, Malaysia`;
  }
  updateListingQcChecklist();
}

function renderListingDevicePhotoPreview() {
  if (!els.listingDevicePhotoPreview) return;

  if (!listingDevicePhotos.length) {
    els.listingDevicePhotoPreview.innerHTML = "";
    updateListingDevicePhotoStatus("No device photos selected yet.");
    return;
  }

  els.listingDevicePhotoPreview.innerHTML = LISTING_MEDIA_SLOTS.map((slot, index) => {
    const photo = listingDevicePhotos[index];
    const slotType = slot.required ? "Required" : "Optional";
    return `
      <article class="device-photo-card">
        <div class="device-photo-thumb">
          ${photo?.dataUrl
            ? `<img src="${escapeAttr(photo.dataUrl)}" alt="${escapeAttr(slot.label)} preview">`
            : `<i class="fa-solid fa-image"></i>`}
        </div>
        <div class="device-photo-copy">
          <strong>${escapeHtml(slot.label)}</strong>
          <span>${photo ? escapeHtml(photo.fileName) : slotType}</span>
        </div>
      </article>
    `;
  }).join("");

  const requiredReady = listingDevicePhotos.length >= LISTING_MIN_PHOTO_COUNT;
  if (listingDevicePhotos.length >= LISTING_DEVICE_PHOTO_LIMIT) {
    updateListingDevicePhotoStatus("10 photos ready. This listing has a full gallery for admin QC.", "ready");
    return;
  }

  updateListingDevicePhotoStatus(
    requiredReady
      ? `${listingDevicePhotos.length}/${LISTING_RECOMMENDED_PHOTO_COUNT} photos ready. Minimum passed; add more for a stronger buyer gallery.`
      : `${listingDevicePhotos.length}/${LISTING_MIN_PHOTO_COUNT} minimum photos ready. Add ${LISTING_MIN_PHOTO_COUNT - listingDevicePhotos.length} more to submit.`,
    "warning"
  );
}

function compressListingImageFile(file, { maxSize, quality, label }) {
  return new Promise((resolve, reject) => {
    if (!file.type?.startsWith("image/")) {
      reject(new Error(`${file.name} is not an image file`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
    reader.onload = () => {
      const originalDataUrl = String(reader.result || "");
      const image = new Image();

      image.onerror = () => resolve({
        fileName: file.name,
        dataUrl: originalDataUrl,
        size: file.size,
        width: 0,
        height: 0,
        label
      });

      image.onload = () => {
        try {
          const width = image.naturalWidth || image.width || maxSize;
          const height = image.naturalHeight || image.height || maxSize;
          const scale = Math.min(1, maxSize / width, maxSize / height);
          const outputWidth = Math.max(1, Math.round(width * scale));
          const outputHeight = Math.max(1, Math.round(height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = outputWidth;
          canvas.height = outputHeight;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas compression unavailable");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, outputWidth, outputHeight);
          context.drawImage(image, 0, 0, outputWidth, outputHeight);

          resolve({
            fileName: file.name,
            dataUrl: canvas.toDataURL("image/jpeg", quality),
            size: file.size,
            width: outputWidth,
            height: outputHeight,
            label
          });
        } catch {
          resolve({
            fileName: file.name,
            dataUrl: originalDataUrl,
            size: file.size,
            width: image.naturalWidth || 0,
            height: image.naturalHeight || 0,
            label
          });
        }
      };

      image.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function compressListingDevicePhoto(file, index) {
  return compressListingImageFile(file, {
    maxSize: LISTING_DEVICE_IMAGE_MAX_SIZE,
    quality: LISTING_DEVICE_IMAGE_QUALITY,
    label: LISTING_MEDIA_SLOTS[index]?.label || `Photo ${index + 1}`
  });
}

function compressListingPanoPhoto(file, index) {
  return compressListingImageFile(file, {
    maxSize: LISTING_PANO_IMAGE_MAX_SIZE,
    quality: LISTING_PANO_IMAGE_QUALITY,
    label: `360 Room ${index + 1}`
  });
}

async function handleListingDevicePhotos(event) {
  const files = Array.from(event.target.files || []);
  const imageFiles = files.filter((file) => file.type?.startsWith("image/"));

  if (!imageFiles.length) {
    listingDevicePhotos = [];
    renderListingDevicePhotoPreview();
    showToast("Please choose image files");
    return;
  }

  const selected = imageFiles.slice(0, LISTING_DEVICE_PHOTO_LIMIT);
  updateListingDevicePhotoStatus(`Preparing ${selected.length} photo${selected.length === 1 ? "" : "s"} for upload...`, "warning");

  try {
    listingDevicePhotos = await Promise.all(selected.map((file, index) => compressListingDevicePhoto(file, index)));
    renderListingDevicePhotoPreview();
    updateListingQcChecklist();
    showToast(`${selected.length} photo${selected.length === 1 ? "" : "s"} ready${imageFiles.length > LISTING_DEVICE_PHOTO_LIMIT ? ". First 10 used" : ""}`);
  } catch (error) {
    listingDevicePhotos = [];
    renderListingDevicePhotoPreview();
    updateListingQcChecklist();
    showToast(error.message || "Unable to prepare photos");
  }
}

function getListingDevicePhotoPayload() {
  return listingDevicePhotos.reduce((payload, photo, index) => {
    const slot = LISTING_MEDIA_SLOTS[index];
    if (slot && photo?.dataUrl) payload[slot.key] = photo.dataUrl;
    return payload;
  }, {});
}

function resetListingDevicePhotos() {
  listingDevicePhotos = [];
  if (els.listingDevicePhotos) els.listingDevicePhotos.value = "";
  renderListingDevicePhotoPreview();
}

function updateListingPanoPhotoStatus(message, tone = "neutral") {
  if (!els.listingPanoPhotoStatus) return;
  els.listingPanoPhotoStatus.className = `device-photo-status ${tone}`;
  els.listingPanoPhotoStatus.textContent = message;
}

function renderListingPanoPhotoPreview() {
  if (!els.listingPanoPhotoPreview) return;

  if (!listingPanoPhotos.length) {
    els.listingPanoPhotoPreview.innerHTML = "";
    updateListingPanoPhotoStatus("No panoramas selected yet.");
    return;
  }

  els.listingPanoPhotoPreview.innerHTML = listingPanoPhotos.map((photo) => `
    <article class="device-photo-card">
      <div class="device-photo-thumb">
        <img src="${escapeAttr(photo.dataUrl)}" alt="${escapeAttr(photo.label)} preview">
      </div>
      <div class="device-photo-copy">
        <strong>${escapeHtml(photo.label)}</strong>
        <span>${escapeHtml(photo.fileName)}</span>
      </div>
    </article>
  `).join("");

  updateListingPanoPhotoStatus(
    `${listingPanoPhotos.length}/${LISTING_PANO_PHOTO_LIMIT} panorama${listingPanoPhotos.length === 1 ? "" : "s"} ready for the buyer Immersive View.`,
    "ready"
  );
}

async function handleListingPanoPhotos(event) {
  const files = Array.from(event.target.files || []);
  const imageFiles = files.filter((file) => file.type?.startsWith("image/"));

  if (!imageFiles.length) {
    listingPanoPhotos = [];
    renderListingPanoPhotoPreview();
    showToast("Please choose image files");
    return;
  }

  const selected = imageFiles.slice(0, LISTING_PANO_PHOTO_LIMIT);
  updateListingPanoPhotoStatus(`Preparing ${selected.length} panorama${selected.length === 1 ? "" : "s"}...`, "warning");

  try {
    listingPanoPhotos = await Promise.all(selected.map((file, index) => compressListingPanoPhoto(file, index)));
    renderListingPanoPhotoPreview();
    showToast(`${selected.length} panorama${selected.length === 1 ? "" : "s"} ready${imageFiles.length > LISTING_PANO_PHOTO_LIMIT ? ". First 3 used" : ""}`);
  } catch (error) {
    listingPanoPhotos = [];
    renderListingPanoPhotoPreview();
    showToast(error.message || "Unable to prepare panoramas");
  }
}

function resetListingPanoPhotos() {
  listingPanoPhotos = [];
  if (els.listingPanoPhotos) els.listingPanoPhotos.value = "";
  renderListingPanoPhotoPreview();
}

function updateListingDescriptionCount() {
  if (!els.listingDescriptionCount || !els.listingDescription) return;
  els.listingDescriptionCount.textContent = els.listingDescription.value.length;
}

function setListingPurpose(purpose) {
  const value = purpose === "rent" ? "rent" : "sale";
  if (els.listingPurpose) els.listingPurpose.value = value;
  els.listingPurposeSale?.classList.toggle("is-active", value === "sale");
  els.listingPurposeSale?.setAttribute("aria-checked", String(value === "sale"));
  els.listingPurposeRent?.classList.toggle("is-active", value === "rent");
  els.listingPurposeRent?.setAttribute("aria-checked", String(value === "rent"));
}

async function addListing(event) {
  event.preventDefault();
  if (!requirePlan("addListing")) return;
  const devicePhotos = getListingDevicePhotoPayload();
  const result = buildListingFromData({
    title: els.listingTitle.value.trim(),
    area: els.listingArea.value.trim(),
    price: parseMoneyValue(els.listingPrice.value),
    status: els.listingStatus.value,
    property_type: els.listingPropertyType.value.trim(),
    listing_purpose: els.listingPurpose?.value.trim() || "sale",
    address: els.listingAddress.value.trim(),
    landlord_name: els.listingLandlordName.value.trim(),
    landlord_phone: els.listingLandlordPhone.value.trim(),
    front_view_link: els.listingImageLink.value.trim() || devicePhotos.front_view_link || "",
    top_view_link: els.listingTopViewLink.value.trim() || devicePhotos.top_view_link || "",
    room_1_link: els.listingRoom1Link.value.trim() || devicePhotos.room_1_link || "",
    bathroom_link: els.listingBathroomLink.value.trim() || devicePhotos.bathroom_link || "",
    kitchen_link: els.listingKitchenLink.value.trim() || devicePhotos.kitchen_link || "",
    photo_6_link: devicePhotos.photo_6_link || "",
    photo_7_link: devicePhotos.photo_7_link || "",
    photo_8_link: devicePhotos.photo_8_link || "",
    photo_9_link: devicePhotos.photo_9_link || "",
    photo_10_link: devicePhotos.photo_10_link || "",
    extra_photo_links: els.listingExtraPhotoLinks.value.trim(),
    description: els.listingDescription.value.trim(),
    ar_link: els.listingArLink.value.trim(),
    enquiries: 0
  }, "manual");

  if (result.errors.length) {
    showToast(result.errors[0]);
    return;
  }

  const listing = result.listing;
  listing.panoramas = listingPanoPhotos.map((photo) => ({
    label: photo.label,
    url: photo.dataUrl,
    source: "Agent 360 upload"
  }));
  let savedListing;
  try {
    savedListing = await saveAgentListingToBackend(listing);
  } catch (error) {
    showToast(error.message || LIVE_LISTING_SAVE_ERROR);
    return;
  }

  state.listings = [savedListing, ...state.listings.filter((item) => String(item.id) !== String(savedListing.id))];
  const reviewCount = submitListingsForAdminReview([savedListing], "manual upload");
  state.notifications = [
    {
      id: Date.now() + 1,
      title: "Listing submitted for QC",
      message: `${savedListing.title} is saved in Supabase and waiting for admin verification before buyer visibility.`,
      createdAt: new Date().toISOString()
    },
    ...state.notifications
  ];

  els.listingForm.reset();
  setListingPurpose("sale");
  if (els.listingBulkPhotoLinks) els.listingBulkPhotoLinks.value = "";
  resetListingDevicePhotos();
  resetListingPanoPhotos();
  updateListingDescriptionCount();
  updateListingQcChecklist();
  closeModal("listingModal");
  persistAll();
  if (agentEngagement) {
    agentEngagement.points = Number(agentEngagement.points || 0) + 50;
    writeStore(ENGAGEMENT_STORE_KEY, agentEngagement);
  }
  renderWorkspace();
  showToast(reviewCount ? "Saved. +50 points - waiting for admin QC" : "Listing saved. +50 points");
}

function autofillListingPhotoLinks() {
  const links = splitPhotoLinks(els.listingBulkPhotoLinks?.value || "");
  if (links.length < LISTING_MIN_PHOTO_COUNT) {
    showToast(`Paste at least ${LISTING_MIN_PHOTO_COUNT} Google Drive photo links. Detected ${links.length}.`);
    return;
  }

  const requiredInputs = [
    els.listingImageLink,
    els.listingTopViewLink,
    els.listingRoom1Link,
    els.listingBathroomLink,
    els.listingKitchenLink
  ];
  requiredInputs.forEach((input, index) => {
    if (input) input.value = links[index] || "";
  });
  if (els.listingExtraPhotoLinks) {
    els.listingExtraPhotoLinks.value = links.slice(5, 10).join("\n");
  }
  updateListingQcChecklist();
  showToast(`${Math.min(links.length, LISTING_RECOMMENDED_PHOTO_COUNT)} photo links auto-filled`);
}

function setImportStatus(message, tone = "neutral") {
  [els.listingImportStatus, els.listingHubStatus, els.overviewListingStatus].forEach((target) => {
    if (!target) return;
    target.className = `excel-import-status ${tone}`;
    target.innerHTML = message;
  });
}

function getWorkbookRows(file) {
  return new Promise((resolve, reject) => {
    if (!window.XLSX) {
      reject(new Error("Excel parser is still loading. Try again in a few seconds."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = window.XLSX.read(event.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(sheet, { defval: "" });
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Unable to read Excel file"));
    reader.readAsArrayBuffer(file);
  });
}

function validateListingWorkbookColumns(rows) {
  const first = rows[0] || {};
  const columns = new Set(Object.keys(first).map(normalizeColumnName));
  return LISTING_EXCEL_REQUIRED_COLUMNS.filter((column) => {
    if (columns.has(column)) return false;
    const mediaSlot = LISTING_REQUIRED_MEDIA_SLOTS.find((slot) => slot.key === column);
    if (!mediaSlot) return true;
    return !mediaSlot.aliases.some((alias) => columns.has(normalizeColumnName(alias)));
  });
}

async function importListingsFromExcel(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  setImportStatus(`<strong>Reading ${file.name}</strong><p>Checking columns and Google Drive links...</p>`);

  try {
    const rows = await getWorkbookRows(file);
    if (!rows.length) {
      setImportStatus("No rows found in the first sheet.", "error");
      return;
    }

    const missing = validateListingWorkbookColumns(rows);
    if (missing.length) {
      setImportStatus(`
        <strong>Excel columns not detected</strong>
        <p>Missing: ${missing.join(", ")}</p>
        <p>Use the template so the system can detect the required ${LISTING_MIN_PHOTO_COUNT} photo columns, optional gallery columns, and AR link correctly.</p>
      `, "error");
      return;
    }

    const imported = [];
    const rowErrors = [];
    rows.forEach((row, index) => {
      const normalized = normalizeExcelRow(row);
      const emptyRow = LISTING_EXCEL_REQUIRED_COLUMNS.every((column) => !String(normalized[column] || "").trim());
      if (emptyRow) return;

      const result = buildListingFromData(normalized, "excel", index + 2);
      if (result.errors.length) {
        rowErrors.push(...result.errors);
        return;
      }
      imported.push(result.listing);
    });

    if (!imported.length) {
      setImportStatus(`
        <strong>No listings imported</strong>
        <p>${rowErrors.slice(0, 4).join("<br>") || "No valid listing rows found."}</p>
      `, "error");
      return;
    }

    const savedListings = [];
    for (const listing of imported) {
      try {
        savedListings.push(await saveAgentListingToBackend(listing));
      } catch (error) {
        rowErrors.push(`${listing.title}: ${error.message || LIVE_LISTING_SAVE_ERROR}`);
      }
    }

    if (!savedListings.length) {
      setImportStatus(`
        <strong>No listings saved live</strong>
        <p>${rowErrors.slice(0, 4).join("<br>") || LIVE_LISTING_SAVE_ERROR}</p>
      `, "error");
      return;
    }

    state.listings = [
      ...savedListings,
      ...state.listings.filter((existing) => !savedListings.some((listing) => String(listing.id) === String(existing.id)))
    ];
    const reviewCount = submitListingsForAdminReview(savedListings, "Excel import");
    state.notifications = [
      {
        id: Date.now() + 1,
        title: "Excel listings sent to QC",
        message: `${savedListings.length} listings saved to Supabase with at least ${LISTING_MIN_PHOTO_COUNT} photos. ${reviewCount} waiting for admin approval${rowErrors.length ? `; ${rowErrors.length} row issue(s) skipped.` : "."}`,
        createdAt: new Date().toISOString()
      },
      ...state.notifications
    ];

    persistAll();
    renderWorkspace();
    setImportStatus(`
      <strong>${savedListings.length} listings saved to backend - ${reviewCount} pending admin QC</strong>
      <p>Each listing has the minimum ${LISTING_MIN_PHOTO_COUNT}-photo gallery. Google Drive pictures were converted to readable thumbnails, AR links are stored in Supabase, and buyer visibility starts only after admin approval.</p>
      ${rowErrors.length ? `<p>${rowErrors.slice(0, 4).join("<br>")}</p>` : ""}
    `, rowErrors.length ? "warning" : "success");
    showToast(`${reviewCount || savedListings.length} Excel listings saved to backend QC`);
  } catch (error) {
    setImportStatus(error instanceof Error ? error.message : "Excel import failed", "error");
  } finally {
    event.target.value = "";
  }
}

function downloadListingTemplate() {
  const rows = [LISTING_EXCEL_SAMPLE_ROW];
  const filename = "realtygenius-listing-import-template.xlsx";

  if (window.XLSX) {
    const worksheet = window.XLSX.utils.json_to_sheet(rows, { header: LISTING_EXCEL_HEADERS });
    window.XLSX.utils.sheet_add_aoa(worksheet, [LISTING_EXCEL_HEADERS], { origin: "A1" });
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");
    window.XLSX.writeFile(workbook, filename);
    showToast("Excel template downloaded");
    return;
  }

  const csv = [
    LISTING_EXCEL_HEADERS.join(","),
    LISTING_EXCEL_HEADERS.map((key) => JSON.stringify(LISTING_EXCEL_SAMPLE_ROW[key] || "")).join(",")
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "realtygenius-listing-import-template.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("CSV template downloaded");
}

function openListingAsset(id, kind) {
  const listing = getEnhancedListing(state.listings.find((item) => String(item.id) === String(id)) || {});
  const media = getGalleryStats(listing);
  const firstPhoto = media.gallery.find((item) => item.url);
  const link = kind === "ar" ? listing.arLink : firstPhoto?.original || listing.imageDriveLink || listing.image;
  if (!link) {
    showToast(kind === "ar" ? "No AR link on this listing" : "No image link on this listing");
    return;
  }
  window.open(link, "_blank", "noopener,noreferrer");
}

function getMagicLinkToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function getVaultOrigin() {
  return window.location.origin && window.location.origin !== "null"
    ? window.location.origin
    : "https://realtygenius.my";
}

function getFileMeta(input, fallback) {
  const file = input?.files?.[0];
  if (!file) {
    return {
      fileName: "Waiting for upload",
      status: "Missing",
      extracted: fallback
    };
  }

  const sizeKb = Math.max(1, Math.round(file.size / 1024));
  return {
    fileName: file.name,
    status: "OCR processed",
    extracted: `${sizeKb} KB file secured in vault`
  };
}

function buildDocumentVaultDocs(salary, commitments, netIncome) {
  const ic = getFileMeta(els.vaultIcFile, "Identity verification pending");
  const payslip = getFileMeta(els.vaultPayslipFile, "Salary not extracted");
  const bank = getFileMeta(els.vaultBankFile, "Commitments not extracted");

  return [
    {
      type: "IC",
      ...ic,
      extracted: ic.status === "Missing" ? ic.extracted : "Name and IC image ready for banker pack"
    },
    {
      type: "Payslip",
      ...payslip,
      extracted: payslip.status === "Missing" ? payslip.extracted : `Salary: ${money(salary)} | Net income: ${money(netIncome)}`
    },
    {
      type: "Bank statement",
      ...bank,
      extracted: bank.status === "Missing" ? bank.extracted : `Monthly commitments: ${money(commitments)}`
    }
  ];
}

function saveDocumentVault(event) {
  event.preventDefault();

  const salary = Number(els.vaultSalary.value);
  const commitments = Number(els.vaultCommitments.value);
  const netIncome = Math.max(salary - commitments, 0);
  const dsrPercent = salary > 0 ? (commitments / salary) * 100 : 0;
  const eligibility = dsrPercent <= 60 ? "Approve" : "Reject";
  const missingDocs = [
    !els.vaultIcFile.files?.length ? "IC" : null,
    !els.vaultPayslipFile.files?.length ? "Payslip" : null,
    !els.vaultBankFile.files?.length ? "Bank statement" : null
  ].filter(Boolean);

  const token = getMagicLinkToken();
  const buyerName = els.vaultBuyerName.value.trim();
  const buyerPhone = els.vaultBuyerPhone.value.trim();

  state.documentVault = {
    magicLink: `${getVaultOrigin()}/vault/${token}`,
    buyerName,
    buyerPhone,
    docs: buildDocumentVaultDocs(salary, commitments, netIncome),
    result: {
      salary,
      commitments,
      netIncome,
      dsrPercent: Number(dsrPercent.toFixed(2)),
      eligibility,
      missingDocs,
      generatedAt: new Date().toISOString()
    }
  };

  writeStore(STORAGE_KEYS.agentDocumentVault, state.documentVault);
  renderDocumentVault();
  showToast(eligibility === "Approve" ? "DSR approved" : "DSR rejected");
}

function renderDocumentVault() {
  if (!els.vaultDocGrid || !els.vaultDsrResult) return;

  const vault = state.documentVault || seedDocumentVault;
  els.vaultBuyerName.value = vault.buyerName || "";
  els.vaultBuyerPhone.value = vault.buyerPhone || "";
  els.vaultMagicLink.value = vault.magicLink || "Create a vault to generate link";

  els.vaultDocGrid.innerHTML = vault.docs.map((doc) => `
    <article class="vault-doc-card">
      <div class="vault-doc-status">${doc.status}</div>
      <strong>${doc.type}</strong>
      <span>${doc.fileName}</span>
      <p>${doc.extracted}</p>
    </article>
  `).join("");

  if (!vault.result) {
    els.vaultDsrResult.className = "vault-dsr-result";
    els.vaultDsrResult.innerHTML = `
      <div class="vault-dsr-top">
        <div>
          <div class="eyebrow">DSR Result</div>
          <h4>Not calculated</h4>
        </div>
        <span class="vault-dsr-pill">Waiting</span>
      </div>
      <p class="subtext">Enter income, commitments, and upload documents to generate a loan-readiness decision.</p>
    `;
    return;
  }

  const approved = vault.result.eligibility === "Approve";
  els.vaultDsrResult.className = `vault-dsr-result ${approved ? "is-approved" : "is-rejected"}`;
  els.vaultDsrResult.innerHTML = `
    <div class="vault-dsr-top">
      <div>
        <div class="eyebrow">DSR Result</div>
        <h4>${vault.result.dsrPercent}%</h4>
      </div>
      <span class="vault-dsr-pill">${vault.result.eligibility}</span>
    </div>
    <div class="vault-breakdown">
      <div>
        <span>Salary / Income</span>
        <strong>${money(vault.result.salary)}</strong>
      </div>
      <div>
        <span>Commitments</span>
        <strong>${money(vault.result.commitments)}</strong>
      </div>
      <div>
        <span>Net income</span>
        <strong>${money(vault.result.netIncome)}</strong>
      </div>
    </div>
    <p class="subtext">${approved
      ? "Loan eligibility looks healthy because commitments are at or below 60% of income."
      : "Reject or rework before viewings because commitments exceed 60% of income."}</p>
    ${vault.result.missingDocs.length
      ? `<p class="subtext">Still missing: ${vault.result.missingDocs.join(", ")}.</p>`
      : `<p class="subtext">All required documents are uploaded and ready for banker submission.</p>`}
  `;
}

function copyVaultLink() {
  const value = els.vaultMagicLink.value;
  if (!value || value.includes("Create a vault")) {
    showToast("Generate a vault first");
    return;
  }

  navigator.clipboard?.writeText(value)
    .then(() => showToast("Magic link copied"))
    .catch(() => {
      els.vaultMagicLink.select();
      document.execCommand("copy");
      showToast("Magic link copied");
    });
}

function getEnhancedListing(listing) {
  const routeProfile = areaRouteProfiles[listing.area] || areaRouteProfiles["KL Sentral"];
  const enhancement = listingRouteEnhancements[listing.id] || {};
  const fallbackImage = listing.image || enhancement.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80";
  const gallery = ensureListingGallery({ ...enhancement, ...listing, image: fallbackImage });
  const verifiedPhotoCount = gallery.filter((item) => item.url && item.status !== "pending_agent_upload").length;
  const heroImage = gallery.find((item) => item.url)?.url || fallbackImage;
  return {
    ...enhancement,
    ...listing,
    address: listing.address || enhancement.address || `${listing.area}, Klang Valley`,
    propertyType: listing.propertyType || enhancement.propertyType || "Condo",
    maintenanceFee: listing.maintenanceFee || enhancement.maintenanceFee || "Confirm latest JMB figure",
    developer: listing.developer || enhancement.developer || "Developer background pending",
    transactions: listing.transactions || enhancement.transactions || [],
    landlordName: listing.landlordName || enhancement.landlordName || "Landlord / co-agent",
    landlordPhone: listing.landlordPhone || enhancement.landlordPhone || "60123456789",
    image: heroImage,
    gallery,
    galleryCount: gallery.length,
    verifiedPhotoCount,
    requiredPhotoLabels: listing.requiredPhotoLabels || LISTING_REQUIRED_MEDIA_SLOTS.map((slot) => slot.label),
    imageDriveLink: listing.imageDriveLink || enhancement.imageDriveLink || "",
    arLink: listing.arLink || listing.modelUrl || enhancement.arLink || enhancement.modelUrl || "",
    modelUrl: listing.modelUrl || listing.arLink || enhancement.modelUrl || enhancement.arLink || "",
    lat: listing.lat || routeProfile.lat,
    lng: listing.lng || routeProfile.lng,
    traffic: routeProfile.traffic
  };
}

function itineraryListings() {
  return state.listings
    .filter((listing) => listing.status !== "Draft")
    .map(getEnhancedListing);
}

function distanceKm(from, to) {
  const earthKm = 6371;
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function malaysiaTrafficMultiplier(dateValue, timeValue, fromArea, toArea) {
  const date = new Date(`${dateValue}T${timeValue || "10:00"}:00`);
  const hour = date.getHours();
  const day = date.getDay();
  let multiplier = 1.08;

  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) multiplier += 0.28;
  if (day === 6 && hour >= 11 && hour <= 16) multiplier += 0.2;
  if (day === 0 && hour >= 12 && hour <= 18) multiplier += 0.12;
  if ([fromArea, toArea].some((area) => ["Petaling Jaya", "Subang Jaya", "Seri Kembangan", "Bayan Lepas"].includes(area))) multiplier += 0.08;
  if ([fromArea, toArea].includes("Simpang Ampat") && [fromArea, toArea].includes("Bukit Mertajam")) multiplier += 0.08;

  return multiplier;
}

function travelMinutes(from, to, dateValue, timeValue) {
  const km = distanceKm(from, to);
  const baseMinutes = (km / 28) * 60;
  const traffic = malaysiaTrafficMultiplier(dateValue, timeValue, from.area, to.area) * ((from.traffic + to.traffic) / 2);
  return Math.max(12, Math.round(baseMinutes * traffic + 7));
}

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function optimizeItineraryRoute(selectedListings, startArea, dateValue, startTime) {
  const startProfile = areaRouteProfiles[startArea] || areaRouteProfiles["KL Sentral"];
  let current = { area: startArea, ...startProfile };
  const remaining = [...selectedListings];
  const ordered = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  let cursor = startHour * 60 + startMinute;
  let totalTravelMinutes = 0;

  while (remaining.length) {
    let bestIndex = 0;
    let bestMinutes = Infinity;
    remaining.forEach((listing, index) => {
      const minutes = travelMinutes(current, listing, dateValue, formatTime(cursor));
      if (minutes < bestMinutes) {
        bestMinutes = minutes;
        bestIndex = index;
      }
    });

    const next = remaining.splice(bestIndex, 1)[0];
    cursor += bestMinutes;
    totalTravelMinutes += bestMinutes;
    ordered.push({
      ...next,
      travelMinutes: bestMinutes,
      startTime: formatTime(cursor),
      endTime: formatTime(cursor + 30),
      confirmation: state.itinerary?.stops?.find((stop) => stop.id === next.id)?.confirmation || "pending"
    });
    cursor += 30;
    current = next;
  }

  return { ordered, totalTravelMinutes };
}

function createItinerary(event) {
  event.preventDefault();

  const selectedIds = [...document.querySelectorAll("[data-itinerary-property]:checked")].map((input) => Number(input.value));
  if (selectedIds.length < 2) {
    showToast("Select at least 2 properties");
    return;
  }

  const selectedListings = itineraryListings().filter((listing) => selectedIds.includes(listing.id));
  const route = optimizeItineraryRoute(
    selectedListings,
    els.itineraryStartArea.value,
    els.itineraryDate.value,
    els.itineraryStartTime.value
  );
  const token = Math.random().toString(36).slice(2, 9).toUpperCase();

  state.itinerary = {
    buyerName: els.itineraryBuyerName.value.trim(),
    date: els.itineraryDate.value,
    startTime: els.itineraryStartTime.value,
    startArea: els.itineraryStartArea.value,
    selectedIds,
    shareLink: `${getVaultOrigin()}/itinerary/${token}`,
    routeProvider: "Google Maps API + Malaysia traffic heuristic",
    totalTravelMinutes: route.totalTravelMinutes,
    stops: route.ordered.map((stop, index) => ({
      id: stop.id,
      order: index + 1,
      title: stop.title,
      area: stop.area,
      address: stop.address,
      price: stop.price,
      image: stop.image,
      landlordName: stop.landlordName,
      landlordPhone: stop.landlordPhone,
      travelMinutes: stop.travelMinutes,
      startTime: stop.startTime,
      endTime: stop.endTime,
      confirmation: stop.confirmation
    }))
  };

  state.notifications = [
    {
      id: Date.now(),
      title: "Viewing itinerary generated",
      message: `${state.itinerary.buyerName}'s ${state.itinerary.stops.length}-stop route is ready with landlord WhatsApp drafts.`,
      createdAt: new Date().toISOString()
    },
    ...state.notifications
  ];

  persistAll();
  renderItineraryBuilder();
  renderNotifications();
  showToast("Itinerary generated");
}

function whatsappMessageForStop(stop) {
  return `Hi ${stop.landlordName}, requesting viewing for ${stop.title} at ${stop.startTime} on ${state.itinerary.date}. Buyer is ${state.itinerary.buyerName}. Please confirm.`;
}

function renderItineraryBuilder() {
  if (!els.itineraryPropertyList || !els.itineraryTimeline) return;

  const itinerary = state.itinerary || seedItinerary;
  const listings = itineraryListings();
  els.itineraryBuyerName.value = itinerary.buyerName || "";
  els.itineraryDate.value = itinerary.date || seedItinerary.date;
  els.itineraryStartTime.value = itinerary.startTime || "10:00";
  els.itineraryStartArea.value = itinerary.startArea || "KL Sentral";
  els.itineraryShareLink.value = itinerary.shareLink || "Generate itinerary to create link";

  els.itineraryPropertyList.innerHTML = listings.map((listing) => `
    <label class="itinerary-option">
      <input data-itinerary-property type="checkbox" value="${listing.id}" ${itinerary.selectedIds?.includes(listing.id) ? "checked" : ""}>
      <img src="${listing.image}" alt="${listing.title}">
      <span>
        <strong>${listing.title}</strong>
        <span>${listing.area} · ${money(listing.price)}</span>
      </span>
    </label>
  `).join("");

  updateItinerarySelectedCount();

  if (!itinerary.stops?.length) {
    els.itinerarySummary.innerHTML = `
      <div>
        <div class="eyebrow">Route Engine</div>
        <h4>Not generated</h4>
      </div>
      <span class="itinerary-provider-pill">Google Maps ready</span>
    `;
    els.itineraryTimeline.innerHTML = `<div class="subtext">Select properties and generate a schedule.</div>`;
    els.landlordMessageList.innerHTML = `<div class="subtext">WhatsApp drafts appear after route generation.</div>`;
    return;
  }

  els.itinerarySummary.innerHTML = `
    <div>
      <div class="eyebrow">Optimized Route</div>
      <h4>${itinerary.stops.length} stops · ${itinerary.totalTravelMinutes} min travel</h4>
      <p class="subtext">Starts from ${itinerary.startArea} on ${itinerary.date} at ${itinerary.startTime}.</p>
    </div>
    <span class="itinerary-provider-pill">${itinerary.routeProvider}</span>
  `;

  els.itineraryTimeline.innerHTML = itinerary.stops.map((stop) => `
    <article class="timeline-stop">
      <div class="timeline-time">${stop.startTime}</div>
      <div class="timeline-main">
        <img class="timeline-image" src="${stop.image}" alt="${stop.title}">
        <div class="timeline-copy">
          <strong>${stop.order}. ${stop.title}</strong>
          <span>${stop.address}</span>
          <span>${money(stop.price)} · Viewing ends ${stop.endTime}</span>
          <div class="traffic-note"><i class="fa-solid fa-car"></i> ${stop.travelMinutes} min travel with KV traffic buffer</div>
          ${stop.arLink ? `<a class="ghost-button itinerary-ar-link" href="${stop.arLink}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-cube"></i> Open AR</a>` : ""}
        </div>
      </div>
    </article>
  `).join("");

  els.landlordMessageList.innerHTML = `
    <div class="landlord-message-head">
      <div>
        <div class="eyebrow">Notifications</div>
        <h4>Landlord WhatsApp drafts</h4>
      </div>
    </div>
    ${itinerary.stops.map((stop) => {
      const message = whatsappMessageForStop(stop);
      const waLink = `https://wa.me/${stop.landlordPhone}?text=${encodeURIComponent(message)}`;
      return `
        <article class="landlord-message-card">
          <div class="landlord-message-head">
            <div>
              <strong>${stop.landlordName}</strong>
              <span>${stop.title} · ${stop.landlordPhone}</span>
            </div>
            <span class="confirmation-pill ${stop.confirmation === "confirmed" ? "confirmed" : ""}">${stop.confirmation}</span>
          </div>
          <p>${message}</p>
          <div class="action-row">
            <a class="primary-button" href="${waLink}" target="_blank" rel="noopener">
              <i class="fa-brands fa-whatsapp"></i>
              Send WhatsApp
            </a>
            <button class="ghost-button" data-action="confirm-itinerary-stop" data-id="${stop.id}" type="button">Confirmed</button>
            <button class="ghost-button" data-action="pending-itinerary-stop" data-id="${stop.id}" type="button">Pending</button>
          </div>
        </article>
      `;
    }).join("")}
  `;
}

function updateItinerarySelectedCount() {
  if (!els.itinerarySelectedCount) return;
  const selected = document.querySelectorAll("[data-itinerary-property]:checked").length;
  els.itinerarySelectedCount.textContent = `${selected} selected`;
}

function setItineraryConfirmation(id, confirmation) {
  state.itinerary.stops = (state.itinerary.stops || []).map((stop) => (
    stop.id === id ? { ...stop, confirmation } : stop
  ));
  persistAll();
  renderItineraryBuilder();
  showToast(`Viewing ${confirmation}`);
}

function copyItineraryLink() {
  const value = els.itineraryShareLink.value;
  if (!value || value.includes("Generate itinerary")) {
    showToast("Generate itinerary first");
    return;
  }

  navigator.clipboard?.writeText(value)
    .then(() => showToast("Itinerary link copied"))
    .catch(() => {
      els.itineraryShareLink.select();
      document.execCommand("copy");
      showToast("Itinerary link copied");
    });
}

function nearbyLocationMatch(wanted, listingArea) {
  const nearby = {
    "Petaling Jaya": ["Subang Jaya", "Seri Kembangan"],
    "Seri Kembangan": ["Petaling Jaya", "Subang Jaya"],
    "Subang Jaya": ["Petaling Jaya", "Seri Kembangan"],
    "Bayan Lepas": ["Pulau Pinang", "Simpang Ampat"],
    "Simpang Ampat": ["Bukit Mertajam", "Seberang Perai", "Nibong Tebal"],
    "Bukit Mertajam": ["Simpang Ampat", "Seberang Perai", "Nibong Tebal"]
  };
  return nearby[wanted]?.includes(listingArea);
}

function scoreCobrokeMatch(listing, requirements) {
  const reasons = [];
  let score = 0;

  if (listing.area === requirements.location) {
    score += 45;
    reasons.push("Exact location");
  } else if (nearbyLocationMatch(requirements.location, listing.area)) {
    score += 25;
    reasons.push("Nearby location");
  }

  if (listing.price <= requirements.budget) {
    score += 35;
    reasons.push("Within budget");
  } else if (listing.price <= requirements.budget * 1.08) {
    score += 20;
    reasons.push("Negotiable budget gap");
  }

  if (listing.propertyType === requirements.propertyType) {
    score += 20;
    reasons.push("Exact property type");
  } else if (["Condo", "Serviced Residence"].includes(listing.propertyType) && ["Condo", "Serviced Residence"].includes(requirements.propertyType)) {
    score += 10;
    reasons.push("Similar high-rise type");
  }

  return {
    score: Math.min(score, 100),
    reasons
  };
}

function generateCobrokeAgreement(match) {
  const reference = `CB-${match.id}-${Date.now().toString(36).toUpperCase()}`;
  return {
    reference,
    commissionSplit: "50/50",
    listingAgent: "You / RealtyGenius Agent",
    buyerAgent: match.buyerAgent,
    propertyTitle: match.title,
    propertyPrice: match.price,
    buyerRequirement: `${match.requirements.location}, ${match.requirements.propertyType}, up to ${money(match.requirements.budget)}`,
    terms: [
      "Both agents agree to a 50/50 commission split upon successful transaction completion.",
      "Both agents agree to protect client confidentiality and avoid circumvention.",
      "Viewing, offer, and banker communication will be logged inside RealtyGenius."
    ],
    signatures: {
      listingAgent: false,
      buyerAgent: false
    },
    createdAt: new Date().toISOString()
  };
}

function createCobrokeMatches(event) {
  event.preventDefault();

  const requirements = {
    location: els.cobrokeLocation.value,
    budget: Number(els.cobrokeBudget.value),
    propertyType: els.cobrokePropertyType.value,
    buyerAgent: els.cobrokeBuyerAgent.value.trim()
  };

  const matches = itineraryListings()
    .map((listing) => {
      const result = scoreCobrokeMatch(listing, requirements);
      return {
        ...listing,
        id: listing.id,
        matchId: `match-${listing.id}`,
        buyerAgent: requirements.buyerAgent,
        requirements,
        score: result.score,
        reasons: result.reasons,
        status: result.score >= 60 ? "private notification sent" : "low fit",
        agreement: null
      };
    })
    .filter((match) => match.score >= 45)
    .sort((a, b) => b.score - a.score);

  const best = matches[0];
  state.cobroke = {
    requirements,
    selectedMatchId: best?.matchId || null,
    matches
  };

  if (best) {
    pushNotifications(
      "Silent co-broke match found",
      `${requirements.buyerAgent} has a buyer for ${best.title}. Suggested 50/50 co-broke at ${best.score}% fit.`
    );
    pushUserNotification(
      "Private co-broke match",
      `A listing agent has a ${best.score}% fit for your ${requirements.location} buyer. Review the 50/50 co-broke invite.`
    );
  }

  persistAll();
  renderCobrokeMatchmaker();
  renderNotifications();
  showToast(best ? "Private match notifications sent" : "No strong co-broke match");
}

function renderCobrokeMatchmaker() {
  if (!els.cobrokeMatchList || !els.cobrokeAgreement) return;

  const cobroke = state.cobroke || seedCobroke;
  els.cobrokeLocation.value = cobroke.requirements.location;
  els.cobrokeBudget.value = cobroke.requirements.budget;
  els.cobrokePropertyType.value = cobroke.requirements.propertyType;
  els.cobrokeBuyerAgent.value = cobroke.requirements.buyerAgent;

  const accepted = cobroke.matches.filter((match) => ["accepted", "signed"].includes(match.status)).length;
  els.cobrokeSummary.innerHTML = `
    <div>
      <div class="eyebrow">Private Match Engine</div>
      <h4>${cobroke.matches.length} matches · ${accepted} accepted</h4>
      <p class="subtext">Scored by location, budget, and property type. Only verified private matches are shown.</p>
    </div>
    <span class="itinerary-provider-pill">AI matchmaker</span>
  `;

  els.cobrokeMatchList.innerHTML = cobroke.matches.length ? cobroke.matches.map((match) => `
    <article class="cobroke-match-card">
      <div class="cobroke-match-head">
        <div>
          <strong>${match.title}</strong>
          <span class="subtext">${match.area} · ${match.propertyType} · ${money(match.price)}</span>
        </div>
        <div class="cobroke-score">${match.score}<span>score</span></div>
      </div>
      <div class="cobroke-reasons">
        ${match.reasons.map((reason) => `<span>${reason}</span>`).join("")}
      </div>
      <span class="cobroke-status ${match.status.replace(/\s+/g, "-")}">${match.status}</span>
      <div class="action-row">
        <button class="primary-button" data-action="accept-cobroke" data-id="${match.id}" type="button">${match.status === "pending admin approval" ? "Approval Pending" : "Request Admin Approval"}</button>
        <button class="ghost-button" data-action="reject-cobroke" data-id="${match.id}" type="button">Reject</button>
        <button class="ghost-button" data-action="select-cobroke-agreement" data-id="${match.id}" type="button">View Agreement</button>
      </div>
    </article>
  `).join("") : `<div class="subtext">No matches yet. Enter buyer requirements and scan.</div>`;

  renderCobrokeAgreement();
}

function selectedCobrokeMatch() {
  return (state.cobroke.matches || []).find((match) => match.matchId === state.cobroke.selectedMatchId) || state.cobroke.matches?.[0];
}

function renderCobrokeAgreement() {
  const match = selectedCobrokeMatch();
  if (!match) {
    els.cobrokeAgreement.innerHTML = `
      <div>
        <div class="eyebrow">Agreement Generator</div>
        <h4>Waiting for match</h4>
      </div>
      <p class="subtext">Accept a match to auto-generate the 50/50 commission agreement and e-sign block.</p>
    `;
    return;
  }

  const agreement = match.agreement || generateCobrokeAgreement(match);
  const signed = agreement.signatures.listingAgent && agreement.signatures.buyerAgent;
  els.cobrokeAgreement.innerHTML = `
    <div>
      <div class="eyebrow">Commission Agreement</div>
      <h4>${agreement.reference}</h4>
      <p class="subtext">${signed ? "Fully signed and ready for deal-room records." : "Generated 50/50 agreement awaiting e-signatures."}</p>
    </div>
    <div class="agreement-grid">
      <div><span>Property</span><strong>${agreement.propertyTitle}</strong></div>
      <div><span>Deal value</span><strong>${money(agreement.propertyPrice)}</strong></div>
      <div><span>Buyer agent</span><strong>${agreement.buyerAgent}</strong></div>
      <div><span>Commission split</span><strong>${agreement.commissionSplit}</strong></div>
    </div>
    <div class="signature-row">
      <div class="signature-card ${agreement.signatures.listingAgent ? "is-signed" : ""}">
        <strong>Listing agent</strong>
        <span>${agreement.signatures.listingAgent ? "Signed electronically" : "Signature pending"}</span>
      </div>
      <div class="signature-card ${agreement.signatures.buyerAgent ? "is-signed" : ""}">
        <strong>Buyer agent</strong>
        <span>${agreement.signatures.buyerAgent ? "Signed electronically" : "Signature pending"}</span>
      </div>
    </div>
    <div class="action-row">
      <button class="primary-button" data-action="sign-cobroke-listing" data-id="${match.id}" type="button">E-sign as Listing Agent</button>
      <button class="ghost-button" data-action="sign-cobroke-buyer" data-id="${match.id}" type="button">E-sign as Buyer Agent</button>
    </div>
  `;
}

function updateCobrokeMatch(id, updater) {
  const matchId = String(id);
  state.cobroke.matches = (state.cobroke.matches || []).map((match) => (
    String(match.id) === matchId ? updater(match) : match
  ));
  state.cobroke.selectedMatchId = `match-${matchId}`;
  persistAll();
  renderCobrokeMatchmaker();
}

function acceptCobroke(id) {
  const match = (state.cobroke.matches || []).find((item) => String(item.id) === String(id));
  if (!match) return;
  const agent = readLiveAgentProfile();
  const requests = readCollabRequests();
  const existing = requests.find((request) => (
    String(request.listingId) === String(match.id)
    && request.requesterEmail === agent.email
    && ["pending_admin", "approved"].includes(request.status)
  ));
  if (existing) {
    showToast(existing.status === "approved" ? "Collab already approved" : "Collab request already pending");
    return;
  }

  const request = {
    id: `collab-${Date.now()}`,
    listingId: match.id,
    listingTitle: match.title,
    listingArea: match.area,
    listingPrice: match.price,
    buyerAgent: match.buyerAgent || agent.name,
    requesterAgentId: agent.id || "agent-live",
    requesterName: agent.name,
    requesterEmail: agent.email,
    requesterPhone: agent.phone || "",
    requesterAgency: agent.agencyName,
    requirements: match.requirements,
    matchScore: match.score,
    reasons: match.reasons || [],
    status: "pending_admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  writeCollabRequests([request, ...requests]);
  updateCobrokeMatch(id, (current) => ({
    ...current,
    status: "pending admin approval",
    collabRequestId: request.id
  }));
  pushAdminListingNotification(
    "Co-broke approval requested",
    `${agent.name} has a buyer for ${match.title}. Admin/master approval is required before collaboration is active.`
  );
  pushNotifications("Co-broke request sent", "Admin/master must approve before this collab can handle the buyer.");
  renderNotifications();
  showToast("Collab request sent for approval");
}

function rejectCobroke(id) {
  updateCobrokeMatch(id, (match) => ({ ...match, status: "rejected" }));
  pushNotifications("Co-broke rejected", "Private match was rejected and removed from active agreement flow.");
  renderNotifications();
  showToast("Co-broke rejected");
}

function signCobroke(id, side) {
  updateCobrokeMatch(id, (match) => {
    const agreement = match.agreement || generateCobrokeAgreement(match);
    agreement.signatures = {
      ...agreement.signatures,
      [side]: true
    };
    return {
      ...match,
      status: agreement.signatures.listingAgent && agreement.signatures.buyerAgent ? "signed" : "accepted",
      agreement
    };
  });
  showToast("E-signature saved");
}

function transactionFallback(listing) {
  if (!listing) return [];
  if (listing.transactions?.length) return listing.transactions;
  return [
    { date: "Recent", price: Math.round(listing.price * 0.98), note: "Comparable unit" },
    { date: "Previous", price: Math.round(listing.price * 0.94), note: "Similar size" },
    { date: "Older", price: Math.round(listing.price * 0.9), note: "Lower floor or older condition" }
  ];
}

function listingForCheatSheet(propertyId) {
  const listings = itineraryListings();
  return listings.find((listing) => String(listing.id) === String(propertyId)) || listings[0] || {
    id: "placeholder",
    title: "Add a listing first",
    area: "Malaysia",
    price: 0,
    propertyType: "Property",
    maintenanceFee: "Pending",
    developer: "Pending",
    transactions: []
  };
}

function generateFallbackCheatSheet(listing) {
  const transactions = transactionFallback(listing);
  const latest = transactions[0]?.price || listing.price || 0;
  const premium = latest ? ((listing.price - latest) / latest) * 100 : 0;

  return {
    recentTransactions: transactions,
    priceContext: premium > 3
      ? `Asking is about ${premium.toFixed(1)}% above the latest comparable, so anchor on condition, scarcity, and negotiation room.`
      : `Asking is close to recent transactions, so frame it as a realistic offer zone.`,
    keySellingPoints: [
      `${listing.area} location gives the buyer a clear lifestyle or rental-demand story.`,
      `${listing.propertyType} format is easy to compare and easier for banks to understand.`,
      `Current ask of ${money(listing.price)} is supported by nearby recent transaction evidence.`
    ],
    weaknesses: [
      `Maintenance fee needs confirmation before offer: ${listing.maintenanceFee}.`,
      "Buyer may compare against lower-floor or older-condition transactions.",
      "If the unit is not renovated, price pressure will come up quickly."
    ],
    objectionScripts: [
      {
        objection: "The asking price feels high.",
        response: `The latest comparable is ${money(latest)}, and this ask is mainly about condition, availability, and negotiation room. We can test an offer with evidence instead of guessing.`
      },
      {
        objection: "Maintenance fee may be expensive.",
        response: `Fair concern. I would verify the latest JMB figure, then compare it against facilities, security, and sinking fund health before deciding.`
      },
      {
        objection: "I want to see more units first.",
        response: `Good. Use this as the benchmark. If another unit cannot beat the location, condition, or transaction support, this one stays on the shortlist.`
      }
    ],
    developerNote: `${listing.developer}. Prepare one credibility line and one risk caveat.`,
    generatedBy: "Local fallback"
  };
}

function normalizeCheatSheetContent(content, listing) {
  return {
    recentTransactions: content.recentTransactions || content.transactions || transactionFallback(listing),
    priceContext: content.priceContext || "Recent comparable transactions are ready for price anchoring.",
    keySellingPoints: content.keySellingPoints || content.sellingPoints || [],
    weaknesses: content.weaknesses || content.negativePoints || [],
    objectionScripts: content.objectionScripts || content.objections || [],
    developerNote: content.developerNote || `${listing.developer}.`,
    generatedBy: content.generatedBy || "OpenAI API"
  };
}

async function requestOpenAiCheatSheet(propertyId, listing) {
  const token = localStorage.getItem("rg_token");
  const apiBase = window.REALTYGENIUS_API_BASE || localStorage.getItem("realtygenius_api_base") || "http://localhost:4000/api";
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!token || !uuidPattern.test(String(propertyId))) return null;

  const response = await fetch(`${apiBase}/cheatsheets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ propertyId })
  });
  if (!response.ok) throw new Error("OpenAI cheat sheet endpoint failed");
  const payload = await response.json();
  return normalizeCheatSheetContent(payload.content || payload, listing);
}

async function createCheatSheet(event) {
  event.preventDefault();
  const propertyId = els.cheatPropertyId.value;
  const listing = listingForCheatSheet(propertyId);
  let content = null;

  try {
    content = await requestOpenAiCheatSheet(propertyId, listing);
  } catch {
    content = null;
  }

  if (!content) content = generateFallbackCheatSheet(listing);

  state.cheatSheet = {
    propertyId: listing.id,
    generatedBy: content.generatedBy,
    content: normalizeCheatSheetContent(content, listing),
    generatedAt: new Date().toISOString()
  };

  pushNotifications("AI viewing cheat sheet ready", `${listing.title} has updated transaction comps, selling points, weaknesses, and objection scripts.`);
  persistAll();
  renderCheatSheet();
  renderNotifications();
  showToast("Cheat sheet generated");
}

function renderCheatSheet() {
  if (!els.cheatPropertyId || !els.cheatSheetResult) return;

  const listings = itineraryListings();
  const selectedId = state.cheatSheet?.propertyId || listings[0]?.id;
  els.cheatPropertyId.innerHTML = listings.map((listing) => `
    <option value="${listing.id}" ${String(listing.id) === String(selectedId) ? "selected" : ""}>
      Property ID ${listing.id} · ${listing.title}
    </option>
  `).join("");

  const listing = listingForCheatSheet(selectedId);
  const content = state.cheatSheet?.content || generateFallbackCheatSheet(listing);
  const objections = content.objectionScripts || [];

  els.cheatSheetResult.innerHTML = `
    <section class="cheat-hero">
      <div class="eyebrow">Site Visit Brief</div>
      <h4>${listing.title}</h4>
      <p>${content.priceContext}</p>
      <div class="cheat-meta-row">
        <span class="meta-pill">ID ${listing.id}</span>
        <span class="meta-pill">${listing.area}</span>
        <span class="meta-pill">${money(listing.price)}</span>
        <span class="meta-pill">${state.cheatSheet?.generatedBy || content.generatedBy}</span>
      </div>
    </section>

    <section class="cheat-section">
      <h5><i class="fa-solid fa-chart-line"></i> Recent Transactions</h5>
      <div class="cheat-list">
        ${(content.recentTransactions || []).map((txn) => `
          <div class="transaction-row">
            <div>
              <strong>${money(txn.price)}</strong>
              <span>${txn.note || "Comparable transaction"}</span>
            </div>
            <span>${txn.date || txn.transactedAt || "Recent"}</span>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="cheat-section">
      <h5><i class="fa-solid fa-bullhorn"></i> Key Selling Points</h5>
      <ul class="cheat-list">${(content.keySellingPoints || []).map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>

    <section class="cheat-section">
      <h5><i class="fa-solid fa-triangle-exclamation"></i> Weaknesses</h5>
      <ul class="cheat-list">${(content.weaknesses || []).map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>

    <section class="cheat-section">
      <h5><i class="fa-solid fa-comments"></i> Objection Scripts</h5>
      <div class="cheat-list">
        ${objections.map((item) => `
          <article class="objection-card">
            <strong>${item.objection}</strong>
            <p>${item.response}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function addYears(dateValue, years) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setFullYear(date.getFullYear() + years);
  return date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function annualGrowthRate(listing) {
  const areaRates = {
    "Bagan Serai": 0.036,
    "Bayan Lepas": 0.044,
    "Petaling Jaya": 0.04,
    "Seri Kembangan": 0.041,
    "Subang Jaya": 0.043,
    "Seberang Perai": 0.039,
    "Simpang Ampat": 0.038,
    "Pulau Pinang": 0.045,
    "Bukit Mertajam": 0.039,
    "Nibong Tebal": 0.037
  };
  const typeBoost = listing.propertyType === "Landed" ? 0.012 : listing.propertyType === "Condo" ? 0.004 : ["Industrial", "Commercial"].includes(listing.propertyType) ? 0.008 : 0;
  return (areaRates[listing.area] || 0.042) + typeBoost;
}

function estimateReferralValue(listing, closedPrice, closeDate, anniversaryYear) {
  const growth = annualGrowthRate(listing);
  const estimate = Math.round(closedPrice * Math.pow(1 + growth, anniversaryYear));
  const growthPercent = ((estimate - closedPrice) / closedPrice) * 100;
  return {
    estimate,
    growthPercent: Number(growthPercent.toFixed(1)),
    annualGrowthPercent: Number((growth * 100).toFixed(1)),
    summary: `${listing.area} ${listing.propertyType} values are estimated using area momentum, transaction trend, and property type demand.`
  };
}

function createReferralDrafts(campaign, referral, listing) {
  return {
    whatsapp: `Happy Home Anniversary ${referral.clientName}! Your ${listing.title} may now be worth around ${money(campaign.estimatedValue)}. That is about ${campaign.growthPercent}% growth since purchase. Thought you would like the update.`,
    emailSubject: `${listing.title}: Your Year ${campaign.year} Home Valuation Update`,
    emailBody: `Hi ${referral.clientName},\n\nHappy Home Anniversary. Based on recent area movement and comparable trends, your ${listing.title} is estimated around ${money(campaign.estimatedValue)} today.\n\nEstimated growth since purchase: ${campaign.growthPercent}%.\n\nIf you want, I can also prepare a rent, refinance, or upgrade snapshot for you.\n\nWarmly,\nYour RealtyGenius agent`
  };
}

function buildReferralCampaigns(referral) {
  const listing = listingForCheatSheet(referral.propertyId);
  return [1, 2, 3, 4, 5].map((year) => {
    const valuation = estimateReferralValue(listing, Number(referral.closedPrice), referral.closeDate, year);
    const dueDate = formatDate(addYears(referral.closeDate, year));
    const existing = referral.campaigns?.find((campaign) => campaign.year === year);
    const campaign = {
      year,
      dueDate,
      estimatedValue: valuation.estimate,
      growthPercent: valuation.growthPercent,
      annualGrowthPercent: valuation.annualGrowthPercent,
      valuationSummary: valuation.summary,
      status: existing?.status || "scheduled",
      sentAt: existing?.sentAt || null
    };
    return {
      ...campaign,
      drafts: createReferralDrafts(campaign, referral, listing)
    };
  });
}

function createReferralAutomation(event) {
  event.preventDefault();

  const referral = {
    clientName: els.referralClientName.value.trim(),
    clientPhone: els.referralClientPhone.value.trim(),
    clientEmail: els.referralClientEmail.value.trim(),
    propertyId: Number(els.referralPropertyId.value),
    closeDate: els.referralCloseDate.value,
    closedPrice: Number(els.referralClosedPrice.value),
    scheduler: {
      cron: "0 9 * * *",
      timezone: "Asia/Kuala_Lumpur",
      lastRunAt: state.referral?.scheduler?.lastRunAt || null
    },
    campaigns: []
  };

  referral.campaigns = buildReferralCampaigns(referral);
  state.referral = referral;
  pushNotifications("Referral Autopilot scheduled", `${referral.clientName}'s home anniversary automation is active for the next 5 years.`);
  persistAll();
  renderReferralAutopilot();
  renderNotifications();
  showToast("Referral Autopilot created");
}

function dueReferralCampaigns(referral, today = new Date()) {
  const todayDate = new Date(today.toISOString().slice(0, 10));
  return (referral.campaigns || []).filter((campaign) => {
    const due = new Date(`${campaign.dueDate}T00:00:00`);
    return due <= todayDate && ["scheduled", "drafted"].includes(campaign.status);
  });
}

function runReferralCron() {
  if (!state.referral?.campaigns?.length) {
    state.referral = {
      ...seedReferral,
      campaigns: buildReferralCampaigns(seedReferral)
    };
  }

  const due = dueReferralCampaigns(state.referral);
  const fallback = due.length ? due : [state.referral.campaigns.find((campaign) => campaign.status === "scheduled")].filter(Boolean);
  const dueYears = new Set(fallback.map((campaign) => campaign.year));

  state.referral.campaigns = state.referral.campaigns.map((campaign) => (
    dueYears.has(campaign.year) && campaign.status === "scheduled"
      ? { ...campaign, status: "drafted" }
      : campaign
  ));
  state.referral.scheduler = {
    ...state.referral.scheduler,
    lastRunAt: new Date().toISOString()
  };

  pushNotifications(
    "Referral cron completed",
    `${fallback.length} valuation report${fallback.length === 1 ? "" : "s"} drafted for ${state.referral.clientName}.`
  );
  persistAll();
  renderReferralAutopilot();
  renderNotifications();
  showToast("Referral cron checked");
}

function markReferralSent(year) {
  state.referral.campaigns = state.referral.campaigns.map((campaign) => (
    campaign.year === year ? { ...campaign, status: "sent", sentAt: new Date().toISOString() } : campaign
  ));
  pushNotifications("Referral follow-up sent", `Year ${year} valuation message was marked sent for ${state.referral.clientName}.`);
  persistAll();
  renderReferralAutopilot();
  renderNotifications();
  showToast("Referral marked sent");
}

function activeReferralCampaign() {
  const campaigns = state.referral?.campaigns?.length ? state.referral.campaigns : buildReferralCampaigns(state.referral || seedReferral);
  return campaigns.find((campaign) => campaign.status === "drafted")
    || campaigns.find((campaign) => campaign.status === "scheduled")
    || campaigns[0];
}

function renderReferralAutopilot() {
  if (!els.referralPropertyId || !els.referralSummary) return;

  const listings = itineraryListings();
  const referral = state.referral?.campaigns?.length ? state.referral : { ...state.referral, campaigns: buildReferralCampaigns(state.referral || seedReferral) };
  const listing = listingForCheatSheet(referral.propertyId);
  const active = activeReferralCampaign();

  els.referralClientName.value = referral.clientName || "";
  els.referralClientPhone.value = referral.clientPhone || "";
  els.referralClientEmail.value = referral.clientEmail || "";
  els.referralCloseDate.value = referral.closeDate || seedReferral.closeDate;
  els.referralClosedPrice.value = referral.closedPrice || "";
  els.referralPropertyId.innerHTML = listings.map((item) => `
    <option value="${item.id}" ${String(item.id) === String(referral.propertyId) ? "selected" : ""}>
      Property ID ${item.id} · ${item.title}
    </option>
  `).join("");

  const drafted = referral.campaigns.filter((campaign) => campaign.status === "drafted").length;
  const sent = referral.campaigns.filter((campaign) => campaign.status === "sent").length;
  els.referralSummary.innerHTML = `
    <div class="referral-summary-head">
      <div>
        <div class="eyebrow">Lifecycle Automation</div>
        <h4>${referral.clientName}</h4>
        <p class="subtext">${listing.title} · Closed ${referral.closeDate}</p>
      </div>
      <span class="itinerary-provider-pill">${referral.scheduler.cron} MYT</span>
    </div>
    <div class="referral-kpi-grid">
      <div><span>Closed price</span><strong>${money(referral.closedPrice)}</strong></div>
      <div><span>Drafted</span><strong>${drafted}</strong></div>
      <div><span>Sent</span><strong>${sent}</strong></div>
    </div>
    <div class="action-row">
      <button class="primary-button" data-action="run-referral-cron" type="button">
        <i class="fa-solid fa-clock-rotate-left"></i>
        Run Cron Now
      </button>
      <span class="subtext">Last run: ${referral.scheduler.lastRunAt ? new Date(referral.scheduler.lastRunAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" }) : "Not yet"}</span>
    </div>
  `;

  els.referralTimeline.innerHTML = referral.campaigns.map((campaign) => `
    <article class="referral-year-card">
      <div class="referral-year-head">
        <div>
          <strong>Year ${campaign.year} · ${campaign.dueDate}</strong>
          <span>${campaign.valuationSummary}</span>
        </div>
        <span class="referral-status ${campaign.status}">${campaign.status}</span>
      </div>
      <div class="referral-kpi-grid">
        <div><span>Estimated value</span><strong>${money(campaign.estimatedValue)}</strong></div>
        <div><span>Growth</span><strong>${campaign.growthPercent}%</strong></div>
        <div><span>Area model</span><strong>${campaign.annualGrowthPercent}%/yr</strong></div>
      </div>
      <div class="action-row">
        <button class="ghost-button" data-action="send-referral-year" data-id="${campaign.year}" type="button">Mark Sent</button>
      </div>
    </article>
  `).join("");

  els.referralDrafts.innerHTML = active ? `
    <article class="referral-draft-card">
      <span class="referral-channel-label">WhatsApp Draft</span>
      <p>${active.drafts.whatsapp}</p>
    </article>
    <article class="referral-draft-card">
      <span class="referral-channel-label">Email Draft</span>
      <h4>${active.drafts.emailSubject}</h4>
      <p>${active.drafts.emailBody.replace(/\n/g, "<br>")}</p>
    </article>
  ` : `<div class="subtext">Create an automation to generate valuation reports and drafts.</div>`;
}

function listingEnhancerApiBaseUrl() {
  if (window.location.protocol === "file:") return agentApiBaseUrl();
  return `${window.location.origin}/api`;
}

function contentApiBaseUrl() {
  return listingEnhancerApiBaseUrl();
}

function updateListingEnhancerPhotoStatus(message, tone = "neutral") {
  if (!els.listingEnhancerPhotoStatus) return;
  els.listingEnhancerPhotoStatus.className = `device-photo-status ${tone}`;
  els.listingEnhancerPhotoStatus.textContent = message;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function enhancerPhotoLabel(file, index) {
  const name = String(file?.name || "").toLowerCase();
  if (/front|facade|outside|cover/.test(name)) return "Front View";
  if (/living|hall|lounge/.test(name)) return "Living";
  if (/room|bed/.test(name)) return index <= 2 ? "Room 1" : "Room";
  if (/bath|toilet/.test(name)) return "Bathroom";
  if (/kitchen|dry|wet/.test(name)) return "Kitchen";
  return LISTING_MEDIA_SLOTS[index]?.label || `Photo ${index + 1}`;
}

function readEnhancerImage(file, index) {
  return new Promise((resolve, reject) => {
    if (!file.type?.startsWith("image/")) {
      reject(new Error(`${file.name} is not an image`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const image = new Image();
      image.onerror = () => reject(new Error(`Unable to analyze ${file.name}`));
      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const maxSide = 240;
          const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
          canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
          canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
          const context = canvas.getContext("2d", { willReadFrequently: true });
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let luminanceTotal = 0;
          let contrastTotal = 0;
          const small = [];

          for (let offset = 0; offset < pixels.length; offset += 4) {
            const luminance = (pixels[offset] * 0.299) + (pixels[offset + 1] * 0.587) + (pixels[offset + 2] * 0.114);
            luminanceTotal += luminance;
            if (offset >= 4) {
              const previous = (pixels[offset - 4] * 0.299) + (pixels[offset - 3] * 0.587) + (pixels[offset - 2] * 0.114);
              contrastTotal += Math.abs(luminance - previous);
            }
          }

          const pixelCount = Math.max(pixels.length / 4, 1);
          const brightness = luminanceTotal / pixelCount;
          const sharpness = contrastTotal / pixelCount;

          const hashCanvas = document.createElement("canvas");
          hashCanvas.width = 8;
          hashCanvas.height = 8;
          const hashContext = hashCanvas.getContext("2d", { willReadFrequently: true });
          hashContext.drawImage(image, 0, 0, 8, 8);
          const hashPixels = hashContext.getImageData(0, 0, 8, 8).data;
          for (let offset = 0; offset < hashPixels.length; offset += 4) {
            small.push((hashPixels[offset] * 0.299) + (hashPixels[offset + 1] * 0.587) + (hashPixels[offset + 2] * 0.114));
          }
          const average = small.reduce((sum, value) => sum + value, 0) / small.length;
          const perceptualHash = small.map((value) => value > average ? "1" : "0").join("");
          const isDark = brightness < 48;
          const isBlurry = sharpness < 15;
          const rawScore = 100 - (isDark ? 24 : 0) - (isBlurry ? 24 : 0) - Math.max(0, 10 - sharpness) - Math.max(0, 55 - brightness) * 0.28;
          const score = Math.max(0, Math.min(100, Math.round(rawScore)));

          resolve({
            previewUrl: dataUrl,
            label: enhancerPhotoLabel(file, index),
            fileName: file.name,
            brightness: Number(brightness.toFixed(1)),
            sharpness: Number(sharpness.toFixed(1)),
            isDark,
            isBlurry,
            score,
            hash: hashString(perceptualHash),
            width: image.naturalWidth || image.width,
            height: image.naturalHeight || image.height,
            duplicateOf: null
          });
        } catch (error) {
          reject(error);
        }
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function markDuplicateEnhancerPhotos(photos) {
  const seen = new Map();
  return photos.map((photo, index) => {
    if (seen.has(photo.hash)) {
      return {
        ...photo,
        duplicateOf: seen.get(photo.hash),
        score: Math.max(0, photo.score - 35)
      };
    }
    seen.set(photo.hash, index);
    return photo;
  });
}

function renderListingEnhancerPhotoPreview() {
  if (!els.listingEnhancerPhotoPreview) return;
  if (!listingEnhancerPhotos.length) {
    els.listingEnhancerPhotoPreview.innerHTML = "";
    updateListingEnhancerPhotoStatus("No photos selected yet.");
    return;
  }

  els.listingEnhancerPhotoPreview.innerHTML = listingEnhancerPhotos.map((photo, index) => {
    const flags = [
      photo.isDark ? "dark" : "",
      photo.isBlurry ? "blurry" : "",
      photo.duplicateOf !== null ? `duplicate of #${photo.duplicateOf + 1}` : ""
    ].filter(Boolean);
    return `
      <article class="enhancer-photo-card">
        <img src="${escapeAttr(photo.previewUrl)}" alt="${escapeAttr(photo.label)} preview">
        <div>
          <strong>#${index + 1} ${escapeHtml(photo.label)} - ${photo.score}/100</strong>
          <span>${flags.length ? escapeHtml(flags.join(", ")) : "clean photo"}</span>
        </div>
      </article>
    `;
  }).join("");

  const average = Math.round(listingEnhancerPhotos.reduce((sum, photo) => sum + photo.score, 0) / listingEnhancerPhotos.length);
  const duplicateCount = listingEnhancerPhotos.filter((photo) => photo.duplicateOf !== null).length;
  updateListingEnhancerPhotoStatus(`${listingEnhancerPhotos.length} photo${listingEnhancerPhotos.length === 1 ? "" : "s"} analyzed. Average image quality ${average}/100${duplicateCount ? `, ${duplicateCount} duplicate flagged` : ""}.`, average >= 72 ? "ready" : "warning");
}

async function handleListingEnhancerPhotos(event) {
  const files = Array.from(event.target.files || []).filter((file) => file.type?.startsWith("image/")).slice(0, 12);
  if (!files.length) {
    listingEnhancerPhotos = [];
    state.contentCreator.photoAnalysis = [];
    renderListingEnhancerPhotoPreview();
    return;
  }

  updateListingEnhancerPhotoStatus(`Analyzing ${files.length} photo${files.length === 1 ? "" : "s"}...`, "warning");
  try {
    listingEnhancerPhotos = markDuplicateEnhancerPhotos(await Promise.all(files.map(readEnhancerImage)));
    state.contentCreator.photoAnalysis = listingEnhancerPhotos.map(({ previewUrl, ...photo }) => photo);
    persistAll();
    renderListingEnhancerPhotoPreview();
    showToast("Photo quality analysis complete");
  } catch (error) {
    listingEnhancerPhotos = [];
    state.contentCreator.photoAnalysis = [];
    renderListingEnhancerPhotoPreview();
    showToast(error.message || "Unable to analyze photos");
  }
}

function collectContentPayload() {
  return {
    originalTitle: els.contentPropertyTitle.value.trim(),
    propertyTitle: els.contentPropertyTitle.value.trim(),
    location: els.contentLocation.value.trim(),
    propertyType: els.contentPropertyType?.value.trim() || "Property",
    price: Number(els.contentPrice.value),
    bedrooms: Number(els.contentBedrooms.value),
    bathrooms: Number(els.contentBathrooms.value),
    originalDescription: els.contentHighlights.value.trim(),
    highlights: els.contentHighlights.value.trim(),
    targetAudience: els.contentTargetAudience.value,
    contentType: state.contentCreator.contentType || "Listing Enhancer",
    imageAnalysis: listingEnhancerPhotos.map(({ previewUrl, ...photo }) => photo),
    saveMode: "draft"
  };
}

function contentHighlightsList(highlights) {
  return highlights
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function contentRoomCopy(payload) {
  const bedroomCopy = payload.bedrooms === 1 ? "1 bedroom" : `${payload.bedrooms} bedrooms`;
  const bathroomCopy = payload.bathrooms === 1 ? "1 bathroom" : `${payload.bathrooms} bathrooms`;
  return `${bedroomCopy}, ${bathroomCopy}`;
}

function buildLocalContentPrompt(payload) {
  return {
    role: "RealtyGenius AI content co-pilot",
    tone: "Professional, persuasive, Malaysian property market style, not overpromising",
    guardrails: [
      "Use only facts provided by the agent",
      "No fabricated amenities, distances, returns, discounts, urgency, loan certainty, or legal certainty",
      "Agent must approve before sending or posting"
    ],
    task: payload.contentType,
    property: payload
  };
}

function generateLocalAgentContent(payload) {
  const prompt = buildLocalContentPrompt(payload);
  const facts = contentHighlightsList(payload.highlights);
  const bullets = facts.length
    ? facts.map((item) => `- ${item}`).join("\n")
    : "- Practical layout\n- Buyer-friendly location\n- Viewing-ready unit";
  const price = money(payload.price);
  const roomCopy = contentRoomCopy(payload);

  if (prompt.task === "TikTok Script") {
    return [
      `Hook: Looking for a ${payload.targetAudience.toLowerCase()}-friendly home in ${payload.location}? This ${payload.propertyTitle} is worth a closer look.`,
      "",
      "Scene 1: Show the entrance and first impression.",
      `Voiceover: ${payload.propertyTitle} gives you ${roomCopy} with an asking price of ${price}.`,
      "",
      "Scene 2: Walk through the strongest lifestyle or investment angles.",
      `Voiceover: ${facts.slice(0, 3).join(", ") || "The key details are easy to understand and compare"}.`,
      "",
      "Scene 3: End with the buyer next step.",
      "Voiceover: If this fits your budget and timeline, message me for the full factsheet, viewing slot, and loan pre-check."
    ].join("\n");
  }

  if (prompt.task === "Instagram Caption") {
    return [
      `${payload.propertyTitle} in ${payload.location}`,
      "",
      `${roomCopy} | ${price}`,
      "",
      `A practical option for ${payload.targetAudience.toLowerCase()}s who want clear property details before arranging a viewing.`,
      "",
      bullets,
      "",
      "DM for the factsheet, viewing schedule, and loan readiness check.",
      "",
      "#MalaysiaProperty #KLProperty #RealEstateMalaysia #PropertyViewing"
    ].join("\n");
  }

  if (prompt.task === "WhatsApp Follow-up Message") {
    return [
      `Hi, just following up on ${payload.propertyTitle} in ${payload.location}.`,
      "",
      `It is listed at ${price} with ${roomCopy}. The main points worth considering are ${facts.slice(0, 3).join(", ") || "the location, layout, and viewing potential"}.`,
      "",
      "Would you like me to send the full details, arrange a viewing slot, or help you do a quick loan/DSR pre-check first?"
    ].join("\n");
  }

  return [
    `${payload.propertyTitle} offers a practical ${payload.location} address for ${payload.targetAudience.toLowerCase()}s who want a clear, viewing-ready option without exaggerated claims. The unit comes with ${roomCopy} and an asking price of ${price}.`,
    "",
    `Based on the details provided, the strongest angles to highlight are the property fundamentals and buyer-fit points below. The final decision should still be supported by viewing condition, latest maintenance details, and comparable market checks.`,
    "",
    bullets,
    "",
    "Contact the agent for the full factsheet, viewing availability, and loan readiness check."
  ].join("\n");
}

function summarizeLocalEnhancerImages(payload) {
  const photos = payload.imageAnalysis || [];
  const photoCount = photos.length;
  const duplicatePhotoCount = photos.filter((photo) => photo.duplicateOf !== null).length;
  const darkPhotoCount = photos.filter((photo) => photo.isDark).length;
  const blurryPhotoCount = photos.filter((photo) => photo.isBlurry).length;
  const average = photoCount ? photos.reduce((sum, photo) => sum + Number(photo.score || 0), 0) / photoCount : 0;
  const labels = photos.map((photo) => `${photo.label} ${photo.fileName}`.toLowerCase()).join(" ");
  const missingRoomPhotos = ["front view", "living", "room", "bathroom", "kitchen"].filter((label) => !labels.includes(label));
  return {
    photos,
    photoCount,
    duplicatePhotoCount,
    darkPhotoCount,
    blurryPhotoCount,
    bestCoverImageIndex: photos.length
      ? photos.reduce((bestIndex, photo, index) => Number(photo.score || 0) > Number(photos[bestIndex]?.score || 0) ? index : bestIndex, 0)
      : null,
    missingRoomPhotos,
    imageScore: Math.max(0, Math.min(100, Math.round(average - duplicatePhotoCount * 4 - darkPhotoCount * 3 - blurryPhotoCount * 3 - missingRoomPhotos.length * 3)))
  };
}

function generateLocalListingEnhancement(payload) {
  const imageAnalysis = summarizeLocalEnhancerImages(payload);
  const keywords = [
    payload.originalTitle,
    payload.location,
    `${payload.location} property`,
    `${payload.location} ${payload.propertyType}`,
    `${payload.propertyType} for sale Malaysia`,
    "PropertyGuru Malaysia",
    "iProperty Malaysia",
    "Malaysia property listing",
    payload.targetAudience,
    "real estate Malaysia"
  ].filter(Boolean).slice(0, 10);
  const optimizedTitle = `${payload.propertyType} in ${payload.location} | ${payload.originalTitle}`.slice(0, 78);
  const optimizedDescription = [
    `${payload.originalTitle} is a ${payload.propertyType.toLowerCase()} in ${payload.location}, written for ${payload.targetAudience.toLowerCase()}s who want clear facts before viewing.`,
    payload.originalDescription,
    "Confirm latest availability, maintenance details, viewing condition, and loan readiness before making an offer."
  ].join("\n\n");
  const metaDescription = `${payload.propertyType} in ${payload.location}. Review price, photos, key details, and agent-verified facts before booking a viewing.`.slice(0, 158);
  return {
    id: `local-${Date.now()}`,
    originalTitle: payload.originalTitle,
    originalDescription: payload.originalDescription,
    optimizedTitle,
    optimizedDescription,
    metaDescription,
    seoKeywords: keywords,
    seoScore: 78,
    imageScore: imageAnalysis.imageScore,
    imageAnalysis,
    platformOptimizations: {
      propertyGuruMalaysia: `${optimizedTitle}\n\n${optimizedDescription}`,
      iPropertyMalaysia: `${payload.location} ${payload.propertyType}\n\n${optimizedDescription}`,
      facebookMarketplace: `${optimizedTitle}\n\n${payload.originalDescription}\n\nMessage me for viewing slot and factsheet.`,
      tiktokPropertyPost: `Hook: Looking for a ${payload.propertyType.toLowerCase()} in ${payload.location}?\nShow the best photo, layout, location, and price.\nCTA: Message for the full factsheet.`
    },
    status: "draft",
    liveStatus: "not_live",
    aiProvider: "Local prompt builder",
    saved: false,
    createdAt: new Date().toISOString()
  };
}

async function requestAiContentGeneration(payload) {
  if (!canUse("aiCaption")) {
    const error = new Error("Upgrade required");
    error.code = "upgrade_required";
    throw error;
  }
  const token = localStorage.getItem("rg_token");
  if (!token) return null;

  const response = await fetch(`${contentApiBaseUrl()}/listing-enhancer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "AI content API failed");
  }

  return response.json();
}

async function hydrateGeneratedContentHistory() {
  if (contentHistoryHydrated) return;
  contentHistoryHydrated = true;

  const token = localStorage.getItem("rg_token");
  if (!token) return;

  try {
    const response = await fetch(`${contentApiBaseUrl()}/listing-enhancer?scope=agent`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) return;

    const result = await response.json();
    const rows = result.enhancements || [];
    const remoteHistory = rows.map((row) => ({
      id: row.id,
      contentType: "Listing Enhancer",
      inputJson: {
        propertyTitle: row.originalTitle,
        originalTitle: row.originalTitle,
        originalDescription: row.originalDescription,
        location: row.location,
        propertyType: row.propertyType
      },
      generatedText: row.optimizedDescription || "",
      source: row.status === "approved_live" ? "Admin approved" : row.status?.replace(/_/g, " ") || "Saved",
      createdAt: row.createdAt || new Date().toISOString(),
      enhancement: row
    })).filter((row) => row.generatedText);

    const seen = new Set(remoteHistory.map((item) => String(item.id)));
    const localOnly = (state.contentCreator.history || []).filter((item) => !seen.has(String(item.id)));
    state.contentCreator.history = [...remoteHistory, ...localOnly].slice(0, 12);
    persistAll();
    renderContentCreator();
  } catch {
    contentHistoryHydrated = false;
  }
}

function setContentStatus(message, type = "") {
  state.contentCreator.status = message;
  state.contentCreator.statusType = type;
  if (!els.contentStatus) return;
  els.contentStatus.textContent = message;
  els.contentStatus.className = `content-status ${type}`.trim();
}

function saveGeneratedContentRecord(payload, generatedText, source, apiResult = {}) {
  const record = {
    id: apiResult.id || Date.now(),
    contentType: "Listing Enhancer",
    inputJson: payload,
    generatedText,
    source,
    createdAt: apiResult.createdAt || new Date().toISOString(),
    enhancement: apiResult
  };

  state.contentCreator = {
    ...state.contentCreator,
    contentType: "Listing Enhancer",
    output: generatedText,
    lastEnhancement: apiResult,
    history: [record, ...(state.contentCreator.history || [])].slice(0, 12)
  };

  return record;
}

function enhancementToAdminListing(enhancement, payload = {}) {
  const imageAnalysis = enhancement.imageAnalysis || {};
  const photos = imageAnalysis.photos || payload.imageAnalysis || [];
  const bestPhoto = photos[imageAnalysis.bestCoverImageIndex || 0] || {};
  const statusMap = {
    pending_admin_review: "pending_qc",
    approved_live: "approved",
    rejected: "rejected",
    draft: "draft"
  };
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
  if (imageAnalysis.duplicatePhotoCount) {
    flags.push({
      flagType: "duplicate_photos",
      severity: "medium",
      message: `${imageAnalysis.duplicatePhotoCount} duplicate photo${imageAnalysis.duplicatePhotoCount === 1 ? "" : "s"} detected.`
    });
  }

  return {
    id: String(enhancement.id || Date.now()),
    enhancementId: enhancement.id || "",
    agentId: readLiveAgentProfile().id || "agent-live",
    agentName: readLiveAgentProfile().name || "RealityGenius Agent",
    title: enhancement.optimizedTitle || payload.originalTitle,
    originalTitle: payload.originalTitle || enhancement.originalTitle,
    price: Number(payload.price || 0),
    location: payload.location || enhancement.location || "Malaysia",
    status: statusMap[enhancement.status] || "draft",
    imageUrl: bestPhoto.previewUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
    imageResolution: bestPhoto.width || 1280,
    blurScore: Math.max(0, 1 - (Number(bestPhoto.sharpness || 50) / 50)),
    imageHash: bestPhoto.hash || `enhancer-${enhancement.id || Date.now()}`,
    seoScore: enhancement.seoScore || 0,
    imageScore: enhancement.imageScore || 0,
    optimizedDescription: enhancement.optimizedDescription || "",
    portalOutputs: enhancement.platformOptimizations || {},
    aiFlags: flags,
    createdAt: enhancement.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function pushAdminListingFromEnhancement(enhancement, payload = {}) {
  if (!enhancement?.id) return;
  const adminListing = enhancementToAdminListing(enhancement, payload);
  const existing = readStore(STORAGE_KEYS.adminListings, []).filter((item) => String(item.enhancementId || item.id) !== String(adminListing.enhancementId || adminListing.id));
  writeStore(STORAGE_KEYS.adminListings, [adminListing, ...existing]);
}

async function updateSavedEnhancement(action) {
  const enhancement = state.contentCreator.lastEnhancement;
  if (!enhancement?.id) {
    showToast("Enhance a listing first");
    return null;
  }

  if (String(enhancement.id).startsWith("local-")) {
    const status = action === "submit_verification" ? "pending_admin_review" : "draft";
    const updated = {
      ...enhancement,
      status,
      liveStatus: status === "pending_admin_review" ? "pending_admin_review" : "not_live"
    };
    state.contentCreator.lastEnhancement = updated;
    state.contentCreator.history = (state.contentCreator.history || []).map((item) =>
      String(item.id) === String(enhancement.id) ? { ...item, enhancement: updated, source: status.replace(/_/g, " ") } : item
    );
    pushAdminListingFromEnhancement(updated, collectContentPayload());
    persistAll();
    renderContentCreator();
    return updated;
  }

  const token = localStorage.getItem("rg_token");
  if (!token) {
    showToast("Login session needed");
    return null;
  }

  const response = await fetch(`${contentApiBaseUrl()}/listing-enhancer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ mode: "agent_update", id: enhancement.id, action })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Unable to update listing enhancement");
  }

  const result = await response.json();
  const updated = result.enhancement;
  state.contentCreator.lastEnhancement = updated;
  state.contentCreator.history = (state.contentCreator.history || []).map((item) =>
    String(item.id) === String(enhancement.id) ? { ...item, enhancement: updated, source: updated.status?.replace(/_/g, " ") || item.source } : item
  );
  pushAdminListingFromEnhancement(updated, collectContentPayload());
  persistAll();
  renderContentCreator();
  return updated;
}

async function saveEnhancedListingDraft() {
  try {
    const updated = await updateSavedEnhancement("save_draft");
    if (updated) showToast("Enhanced listing saved as draft");
  } catch (error) {
    showToast(error.message || "Unable to save draft");
  }
}

async function submitEnhancedListingForReview() {
  try {
    const updated = await updateSavedEnhancement("submit_verification");
    if (!updated) return;
    setContentStatus("Pending admin review", "warning");
    pushNotifications("Listing sent to admin", `${updated.optimizedTitle || updated.originalTitle} is waiting for QC approval.`);
    renderNotifications();
    showToast("Submitted to admin verification");
  } catch (error) {
    showToast(error.message || "Unable to submit listing");
  }
}

async function generateAgentContent(event) {
  event.preventDefault();
  if (!requirePlan("aiCaption")) {
    setContentStatus("Upgrade required", "warning");
    return;
  }

  const payload = collectContentPayload();
  if (!payload.originalTitle || !payload.location || !payload.originalDescription || !payload.price) {
    setContentStatus("Missing details", "error");
    showToast("Complete the property brief first");
    return;
  }

  els.generateContentButton.disabled = true;
  setContentStatus("Generating...", "warning");

  try {
    const apiResult = await requestAiContentGeneration(payload);
    const localResult = apiResult || generateLocalListingEnhancement(payload);
    const generatedText = localResult.optimizedDescription || generateLocalAgentContent(payload);
    const source = localResult.saved ? "OpenAI / Supabase" : "Local prompt builder";
    saveGeneratedContentRecord(payload, generatedText, source, localResult);
    setContentStatus(localResult.saved ? "Saved draft" : "Local fallback", localResult.saved ? "" : "warning");
    pushAdminListingFromEnhancement(localResult, payload);
    pushNotifications("Listing enhanced", `${payload.originalTitle} scored SEO ${localResult.seoScore || "--"}/100.`);
    renderNotifications();
    showToast(localResult.saved ? "Listing enhanced and saved" : "Local enhancement generated");
  } catch {
    const localResult = generateLocalListingEnhancement(payload);
    saveGeneratedContentRecord(payload, localResult.optimizedDescription, "Local prompt builder", localResult);
    setContentStatus("Local fallback", "warning");
    showToast("API unavailable, local enhancement generated");
  } finally {
    els.generateContentButton.disabled = false;
    persistAll();
    renderContentCreator();
  }
}

function renderContentCreator() {
  if (!els.contentOutput) return;
  const locked = !canUse("aiCaption");

  els.contentTypeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.contentType === state.contentCreator.contentType);
    button.disabled = locked;
  });

  const enhancement = state.contentCreator.lastEnhancement;
  els.contentStatus.textContent = locked ? "Locked - Starter required" : state.contentCreator.status || "Ready";
  els.contentStatus.className = `content-status ${locked ? "warning" : state.contentCreator.statusType || ""}`.trim();
  els.contentOutput.textContent = locked
    ? "Upgrade to Starter, Pro, or Elite to generate listing descriptions, SEO keywords, captions, TikTok scripts, and WhatsApp marketing messages."
    : enhancement?.optimizedDescription || state.contentCreator.output || "Your optimized listing will appear here.";
  if (els.enhancerOriginal) {
    els.enhancerOriginal.textContent = enhancement?.originalDescription || "Your original listing will appear here.";
  }

  if (els.enhancerScoreGrid) {
    const status = enhancement?.status ? enhancement.status.replace(/_/g, " ") : "Draft";
    els.enhancerScoreGrid.innerHTML = `
      <article><span>SEO score</span><strong>${enhancement?.seoScore ?? "--"}</strong></article>
      <article><span>Image score</span><strong>${enhancement?.imageScore ?? "--"}</strong></article>
      <article><span>Verification</span><strong>${escapeHtml(status)}</strong></article>
    `;
  }

  if (els.enhancerKeywords) {
    const keywords = enhancement?.seoKeywords || [];
    els.enhancerKeywords.innerHTML = keywords.length
      ? keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")
      : `<span>SEO keywords will appear here</span>`;
  }

  if (els.enhancerPortalOutputs) {
    const portals = enhancement?.platformOptimizations || {};
    const portalLabels = [
      ["propertyGuruMalaysia", "PropertyGuru Malaysia"],
      ["iPropertyMalaysia", "iProperty Malaysia"],
      ["facebookMarketplace", "Facebook Marketplace"],
      ["tiktokPropertyPost", "TikTok Property Post"]
    ];
    els.enhancerPortalOutputs.innerHTML = portalLabels.map(([key, label]) => `
      <article class="enhancer-portal-card">
        <span>${label}</span>
        <p>${escapeHtml(portals[key] || "Platform-specific copy will appear after enhancement.")}</p>
      </article>
    `).join("");
  }

  if (els.saveEnhancedListingButton) {
    els.saveEnhancedListingButton.disabled = locked || !enhancement;
  }
  if (els.submitEnhancedListingButton) {
    els.submitEnhancedListingButton.disabled = locked || !enhancement;
  }
  if (els.generateContentButton) {
    els.generateContentButton.disabled = locked;
    els.generateContentButton.innerHTML = locked
      ? `<i class="fa-solid fa-lock"></i> Upgrade to Generate`
      : `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Listing Content`;
  }

  const history = state.contentCreator.history || [];
  if (locked) {
    els.contentHistory.innerHTML = `
      <article class="feature-card locked">
        <h3>AI Content Creator</h3>
        <p>Unlock with Starter, Pro, or Elite. Free agents can still upload listings and use the basic dashboard.</p>
        <button class="primary-button" data-action="select-agent-plan" data-plan-id="starter" type="button">Upgrade to Starter</button>
      </article>
    `;
    return;
  }
  if (!history.length) {
    els.contentHistory.innerHTML = `
      <div class="excel-import-status">
        <strong>No enhanced listings yet.</strong>
        <p>Enhance a listing to save the SEO rewrite, photo score, portal copy, and admin verification status.</p>
      </div>
    `;
    return;
  }

  els.contentHistory.innerHTML = history.map((item) => `
    <article class="content-history-card">
      <div class="content-history-meta">
        <span>${escapeHtml(item.enhancement?.status?.replace(/_/g, " ") || item.contentType)}</span>
        <span>${escapeHtml(item.source || "Saved")}</span>
        <span>SEO ${escapeHtml(item.enhancement?.seoScore ?? "--")}</span>
      </div>
      <h4>${escapeHtml(item.enhancement?.optimizedTitle || item.inputJson?.propertyTitle || "Property draft")}</h4>
      <p>${escapeHtml(item.generatedText)}</p>
      <div class="action-row">
        <button class="ghost-button" data-action="use-content-draft" data-id="${escapeAttr(item.id)}" type="button">Open</button>
        <button class="ghost-button" data-action="copy-content-draft" data-id="${escapeAttr(item.id)}" type="button">Copy</button>
      </div>
    </article>
  `).join("");
}

function copyTextToClipboard(text, successMessage) {
  if (!text) {
    showToast("Nothing to copy yet");
    return;
  }

  navigator.clipboard?.writeText(text)
    .then(() => showToast(successMessage))
    .catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast(successMessage);
    });
}

function copyContentOutput() {
  copyTextToClipboard(state.contentCreator.lastEnhancement?.optimizedDescription || state.contentCreator.output, "Enhanced listing copied");
}

function contentHistoryItem(id) {
  return (state.contentCreator.history || []).find((item) => String(item.id) === String(id));
}

function useContentDraft(id) {
  if (!els.contentPropertyTitle || !els.contentOutput) {
    showToast("AI Content Creator is not available on this agent screen");
    return;
  }
  const item = contentHistoryItem(id);
  if (!item) return;
  const input = item.inputJson || {};
  state.contentCreator.contentType = "Listing Enhancer";
  state.contentCreator.output = item.generatedText;
  state.contentCreator.lastEnhancement = item.enhancement || null;
  state.contentCreator.status = "Loaded";
  state.contentCreator.statusType = "";

  els.contentPropertyTitle.value = input.propertyTitle || input.originalTitle || item.enhancement?.originalTitle || "";
  els.contentLocation.value = input.location || item.enhancement?.location || "";
  if (els.contentPropertyType) els.contentPropertyType.value = input.propertyType || item.enhancement?.propertyType || "";
  els.contentPrice.value = input.price || "";
  els.contentBedrooms.value = input.bedrooms || "";
  els.contentBathrooms.value = input.bathrooms || "";
  els.contentHighlights.value = input.highlights || input.originalDescription || item.enhancement?.originalDescription || "";
  els.contentTargetAudience.value = input.targetAudience || "First-time buyer";

  persistAll();
  renderContentCreator();
  showToast("Draft loaded");
}

function copyContentDraft(id) {
  const item = contentHistoryItem(id);
  copyTextToClipboard(item?.generatedText, "Draft copied");
}

function loadContentFromTopListing() {
  if (!els.contentPropertyTitle || !els.contentHighlights) {
    showToast("AI Content Creator is not available on this agent screen");
    return;
  }
  const listing = [...itineraryListings()]
    .sort((a, b) => Number(b.enquiries || 0) - Number(a.enquiries || 0))[0];

  if (!listing) {
    showToast("Add a listing first");
    return;
  }

  const transaction = transactionFallback(listing)[0];
  els.contentPropertyTitle.value = listing.title || "";
  els.contentLocation.value = listing.area || listing.location || "";
  if (els.contentPropertyType) els.contentPropertyType.value = listing.propertyType || "Condo";
  els.contentPrice.value = listing.price || "";
  els.contentBedrooms.value = listing.bedrooms || 3;
  els.contentBathrooms.value = listing.bathrooms || 2;
  els.contentTargetAudience.value = listing.propertyType === "Landed" ? "Family upgrader" : "Investor";
  els.contentHighlights.value = [
    `${listing.propertyType} in ${listing.area}`,
    `Asking price ${money(listing.price)}`,
    `Latest comparable around ${money(transaction.price)}`,
    `Maintenance fee: ${listing.maintenanceFee}`,
    `Developer: ${listing.developer}`
  ].join("\n");

  showToast("Top listing loaded");
}

function persistAll() {
  writeStore(STORAGE_KEYS.agentLeads, state.leads);
  writeStore(STORAGE_KEYS.agentClients, state.clients);
  writeStore(STORAGE_KEYS.agentListings, state.listings);
  writeStore(STORAGE_KEYS.agentNotifications, state.notifications);
  writeStore(STORAGE_KEYS.agentAutomation, state.automation);
  writeStore(STORAGE_KEYS.agentDocumentVault, state.documentVault);
  writeStore(STORAGE_KEYS.agentItinerary, state.itinerary);
  writeStore(STORAGE_KEYS.agentCobroke, state.cobroke);
  writeStore(STORAGE_KEYS.agentCheatSheet, state.cheatSheet);
  writeStore(STORAGE_KEYS.agentReferral, state.referral);
  writeStore(STORAGE_KEYS.agentContentCreator, state.contentCreator);
  writeStore(STORAGE_KEYS.agentSubscription, state.subscription);
}

function openDrawer(id) {
  document.getElementById(id).classList.add("is-open");
  document.getElementById(id).setAttribute("aria-hidden", "false");
}

function closeDrawer(id) {
  document.getElementById(id).classList.remove("is-open");
  document.getElementById(id).setAttribute("aria-hidden", "true");
}

function openModal(id) {
  const modalFeatureMap = {
    documentVaultModal: "leadHeat",
    itineraryModal: "leadHeat",
    cobrokeModal: "leadHeat",
    cheatSheetModal: "aiNegotiation",
    referralModal: "leadHeat"
  };
  const feature = modalFeatureMap[id];
  if (feature && !requirePlan(feature)) return;
  const modal = document.getElementById(id);
  agentModalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  if (id === "listingModal") {
    updateListingQcChecklist();
  }
  setTimeout(() => {
    const firstField = modal.querySelector("input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled])");
    firstField?.focus({ preventScroll: true });
  }, 80);
}

let agentModalReturnFocus = null;

function closeModal(id) {
  document.getElementById(id).classList.remove("is-open");
  document.getElementById(id).setAttribute("aria-hidden", "true");
  if (agentModalReturnFocus && document.contains(agentModalReturnFocus)) {
    agentModalReturnFocus.focus({ preventScroll: true });
  }
  agentModalReturnFocus = null;
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
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".modal-backdrop.is-open").forEach((modal) => closeModal(modal.id));
  });

  els.navItems.forEach((button) => {
    button.addEventListener("click", () => {
      state.section = button.dataset.section;
      syncSectionVisibility();
    });
  });

  els.leadFilters.forEach((button) => {
    button.addEventListener("click", () => {
      els.leadFilters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.leadFilter = button.dataset.leadFilter;
      renderLeadList();
    });
  });

  els.notificationButton.addEventListener("click", () => openDrawer("notificationDrawer"));
  window.RealtyGeniusPush?.installButton(els.pushPermissionButton, (result) => {
    if (result === "granted") showToast("Agent push notifications enabled");
    else if (result === "denied") showToast("Browser blocked push notifications");
    else showToast("Push notifications are unavailable here");
  });
  els.quickLeadButton.addEventListener("click", () => openModal("leadModal"));
  els.agentProfileForm?.addEventListener("submit", saveAgentProfileEdits);
  els.agentProfilePhotoInput?.addEventListener("change", handleAgentProfilePhoto);
  els.openListingComposer.addEventListener("click", () => openModal("listingModal"));
  els.downloadListingTemplate.addEventListener("click", downloadListingTemplate);
  els.downloadListingTemplateHub?.addEventListener("click", downloadListingTemplate);
  els.overviewJumpListings?.addEventListener("click", () => goToSection("listings"));
  els.overviewDownloadListingTemplate?.addEventListener("click", downloadListingTemplate);
  els.overviewListingExcelInput?.addEventListener("change", importListingsFromExcel);
  els.overviewDeviceListingUpload?.addEventListener("click", openListingDeviceUpload);
  els.stepOneUploadListing?.addEventListener("click", openListingDeviceUpload);
  els.stepOneOpenListings?.addEventListener("click", () => goToSection("listings"));
  els.autoFillListingPhotos?.addEventListener("click", autofillListingPhotoLinks);
  els.listingDevicePhotos?.addEventListener("change", handleListingDevicePhotos);
  els.listingPanoPhotos?.addEventListener("change", handleListingPanoPhotos);
  els.listingDescription?.addEventListener("input", updateListingDescriptionCount);
  els.listingExcelQuickInput?.addEventListener("change", importListingsFromExcel);
  els.quickDeviceListingUpload?.addEventListener("click", openListingDeviceUpload);
  els.routineQuickList?.addEventListener("click", openListingDeviceUpload);
  document.getElementById("buyExtraAuctionSlotButton")?.addEventListener("click", purchaseExtraAuctionSlot);
  els.routineRepeatListing?.addEventListener("click", duplicateLastListing);
  els.routineCheckListing?.addEventListener("click", () => {
    if (!listingUploadedToday()) openListingDeviceUpload();
  });
  els.routineCheckLeads?.addEventListener("click", reviewLeadsRoutine);
  els.listingPipelineStrip?.addEventListener("click", (event) => {
    if (!event.target.closest(".pipeline-stat")) return;
    state.section = "listings";
    syncSectionVisibility();
  });
  [
    els.listingTitle,
    els.listingArea,
    els.listingPrice,
    els.listingAddress,
    els.listingPropertyType,
    els.listingImageLink,
    els.listingTopViewLink,
    els.listingRoom1Link,
    els.listingBathroomLink,
    els.listingKitchenLink,
    els.listingExtraPhotoLinks,
    els.listingBulkPhotoLinks,
    els.listingArLink
  ].forEach((input) => input?.addEventListener("input", updateListingQcChecklist));
  [els.listingArea, els.listingPropertyType].forEach((input) => {
    input?.addEventListener("blur", applyListingSmartDefaults);
  });
  els.listingPrice?.addEventListener("blur", normalizeListingPriceInput);
  els.listingStatus?.addEventListener("change", updateListingSubmitCopy);
  document.querySelectorAll("[data-listing-type]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-listing-type]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      if (els.listingPropertyType) els.listingPropertyType.value = button.dataset.listingType || "";
      applyListingSmartDefaults();
    });
  });
  els.listingEnhancerPhotos?.addEventListener("change", handleListingEnhancerPhotos);

  els.listingPurposeSale?.addEventListener("click", () => setListingPurpose("sale"));
  els.listingPurposeRent?.addEventListener("click", () => setListingPurpose("rent"));

  els.leadForm.addEventListener("submit", addLead);
  els.listingForm.addEventListener("submit", addListing);
  els.listingExcelInput.addEventListener("change", importListingsFromExcel);
  els.documentVaultForm.addEventListener("submit", saveDocumentVault);
  els.itineraryForm.addEventListener("submit", createItinerary);
  els.cobrokeForm.addEventListener("submit", createCobrokeMatches);
  els.cheatSheetForm.addEventListener("submit", createCheatSheet);
  els.referralForm.addEventListener("submit", createReferralAutomation);
  els.contentCreatorForm?.addEventListener("submit", generateAgentContent);
  els.contentTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.contentCreator.contentType = button.dataset.contentType;
      state.contentCreator.status = "Ready";
      state.contentCreator.statusType = "";
      persistAll();
      renderContentCreator();
    });
  });
  els.copyContentButton?.addEventListener("click", copyContentOutput);
  els.saveEnhancedListingButton?.addEventListener("click", saveEnhancedListingDraft);
  els.submitEnhancedListingButton?.addEventListener("click", submitEnhancedListingForReview);
  els.itineraryPropertyList.addEventListener("change", (event) => {
    if (event.target.matches("[data-itinerary-property]")) updateItinerarySelectedCount();
  });

  document.addEventListener("click", (event) => {
    const closeTarget = event.target.closest("[data-close]");
    if (closeTarget) {
      const targetId = closeTarget.dataset.close;
      if (targetId.includes("Drawer")) closeDrawer(targetId);
      else closeModal(targetId);
    }

    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const rawId = actionTarget.dataset.id;
    const id = Number(rawId);
    const action = actionTarget.dataset.action;
    if (action === "promote-lead") moveLeadForward(id);
    if (action === "toggle-listing-status") toggleListingStatus(rawId);
    if (action === "open-listing-image") openListingAsset(rawId, "image");
    if (action === "open-listing-ar") openListingAsset(rawId, "ar");
    if (action === "share-listing") shareListingToWhatsApp(rawId);
    if (action === "agent-counter") handleNegotiationAction(id, "counter");
    if (action === "agent-accept") handleNegotiationAction(id, "accept");
    if (action === "agent-reject") handleNegotiationAction(id, "reject");
    if (action === "agent-close") handleNegotiationAction(id, "close");
    if (action === "jump-section") goToSection(actionTarget.dataset.section);
    if (action === "play-recap") showToast(actionTarget.dataset.message || "Call recap ready");
    if (action === "open-lead-modal") openModal("leadModal");
    if (action === "open-listing-modal") openModal("listingModal");
    if (action === "open-agent-billing") openModal("billingModal");
    if (action === "load-top-listing-content") loadContentFromTopListing();
    if (action === "open-document-vault") {
      renderDocumentVault();
      openModal("documentVaultModal");
    }
    if (action === "copy-vault-link") copyVaultLink();
    if (action === "open-itinerary-builder") {
      renderItineraryBuilder();
      openModal("itineraryModal");
    }
    if (action === "copy-itinerary-link") copyItineraryLink();
    if (action === "confirm-itinerary-stop") setItineraryConfirmation(id, "confirmed");
    if (action === "pending-itinerary-stop") setItineraryConfirmation(id, "pending");
    if (action === "open-cobroke-matchmaker") {
      renderCobrokeMatchmaker();
      openModal("cobrokeModal");
    }
    if (action === "accept-cobroke") acceptCobroke(rawId);
    if (action === "reject-cobroke") rejectCobroke(rawId);
    if (action === "select-cobroke-agreement") {
      state.cobroke.selectedMatchId = `match-${rawId}`;
      persistAll();
      renderCobrokeAgreement();
    }
    if (action === "sign-cobroke-listing") signCobroke(rawId, "listingAgent");
    if (action === "sign-cobroke-buyer") signCobroke(rawId, "buyerAgent");
    if (action === "open-cheat-sheet") {
      renderCheatSheet();
      openModal("cheatSheetModal");
    }
    if (action === "open-referral-autopilot") {
      renderReferralAutopilot();
      openModal("referralModal");
    }
    if (action === "run-referral-cron") runReferralCron();
    if (action === "send-referral-year") markReferralSent(id);
    if (action === "load-content-from-listing") loadContentFromTopListing();
    if (action === "use-content-draft") useContentDraft(rawId);
    if (action === "copy-content-draft") copyContentDraft(rawId);
    if (action === "agent-open-vault-for-deal") openVaultForDeal(rawId);
    if (action === "agent-sign-offer") signDealOffer(rawId);
    if (action === "agent-release-escrow") releaseEscrow(rawId);
    if (action === "select-agent-plan") activateAgentPlan(actionTarget.dataset.planId);
  });

  document.addEventListener("keydown", (event) => {
    const actionTarget = event.target.closest?.("[data-action='open-lead-modal'], [data-action='open-document-vault'], [data-action='open-itinerary-builder'], [data-action='open-cobroke-matchmaker'], [data-action='open-cheat-sheet'], [data-action='open-referral-autopilot'], [data-action='jump-section']");
    if (!actionTarget || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    if (actionTarget.dataset.action === "jump-section") {
      goToSection(actionTarget.dataset.section);
    }
    if (actionTarget.dataset.action === "open-lead-modal") {
      openModal("leadModal");
    }
    if (actionTarget.dataset.action === "open-document-vault") {
      renderDocumentVault();
      openModal("documentVaultModal");
    }
    if (actionTarget.dataset.action === "open-itinerary-builder") {
      renderItineraryBuilder();
      openModal("itineraryModal");
    }
    if (actionTarget.dataset.action === "open-cobroke-matchmaker") {
      renderCobrokeMatchmaker();
      openModal("cobrokeModal");
    }
    if (actionTarget.dataset.action === "open-cheat-sheet") {
      renderCheatSheet();
      openModal("cheatSheetModal");
    }
    if (actionTarget.dataset.action === "open-referral-autopilot") {
      renderReferralAutopilot();
      openModal("referralModal");
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEYS.leakProofDeals) {
      renderLeakProofDealBoard();
      renderNotifications();
    }

    if (event.key === STORAGE_KEYS.globalAlert) {
      renderGlobalPlatformAlert();
    }

    if (event.key === STORAGE_KEYS.listingAnalytics) {
      renderCleanListingGrid();
    }

    if (event.key === STORAGE_KEYS.listingCollabs) {
      renderCleanListingGrid();
    }
  });

  [els.leadModal, els.listingModal, els.documentVaultModal, els.itineraryModal, els.cobrokeModal, els.cheatSheetModal, els.referralModal, els.billingModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal.id);
    });
  });
}

function applyBillingReturn() {
  const params = new URLSearchParams(window.location.search);
  let billing = params.get("payment") || params.get("billing");
  if (!billing && params.get("success") === "true") billing = "success";
  if (!billing && params.get("cancelled") === "true") billing = "cancelled";
  if (!billing) return;

  if (billing === "success") {
    state.subscription = {
      ...state.subscription,
      status: "checkout_verifying",
      checkoutId: params.get("session_id") || state.subscription?.checkoutId || ""
    };
    persistAll();
    showToast("Payment successful. Verifying subscription...");
    refreshAgentSubscription({ silent: true }).then((agent) => {
      if (agent?.features_unlocked) {
        pushNotifications("Premium agent activated", `${activePlanTier().name} is active. Stripe confirmed your checkout and automation features are unlocked.`);
        showToast(`${activePlanTier().name} active`);
      } else {
        showToast("Payment received. Waiting for Stripe confirmation.");
      }
    });
  }

  if (billing === "cancelled") {
    state.subscription = {
      ...seedSubscription,
      status: "checkout_cancelled"
    };
    localStorage.setItem("agent_plan", "free");
    persistAll();
    showToast("Payment cancelled");
  }

  params.delete("payment");
  params.delete("billing");
  params.delete("success");
  params.delete("cancelled");
  params.delete("plan");
  params.delete("session_id");
  const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash || ""}`;
  window.history.replaceState({}, document.title, cleanUrl);
}

applyBillingReturn();
removeAgentDemoRows();
bindEvents();
renderListingDevicePhotoPreview();
renderListingEnhancerPhotoPreview();
updateListingDescriptionCount();
renderWorkspace();
refreshAgentSubscription({ silent: true });
performDailyCheckin();
