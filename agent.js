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
  leakProofDeals: "kvai_leak_proof_deals",
  globalAlert: "rg_global_platform_alert"
};

const seedLeads = [
  {
    id: 1,
    name: "Alya Tan",
    phone: "60123456789",
    area: "Mont Kiara",
    stage: "New",
    temperature: "Hot",
    budget: 1200000,
    probability: 86,
    note: "Viewed the same luxury condo three times and asked about negotiation range."
  },
  {
    id: 2,
    name: "Daniel Wong",
    phone: "60199887766",
    area: "Bukit Jalil",
    stage: "Contacted",
    temperature: "Warm",
    budget: 780000,
    probability: 64,
    note: "Comparing transit-linked units for yield and wants fast WhatsApp replies."
  },
  {
    id: 3,
    name: "Nur Iman",
    phone: "60112233445",
    area: "Desa ParkCity",
    stage: "Viewing",
    temperature: "Hot",
    budget: 1700000,
    probability: 79,
    note: "Family buyer with strong intent and a likely two-week closing window."
  },
  {
    id: 4,
    name: "Harith Lim",
    phone: "60176655443",
    area: "Petaling Jaya",
    stage: "Negotiation",
    temperature: "Warm",
    budget: 820000,
    probability: 71,
    note: "Price-sensitive buyer who responds well to comp-based framing."
  },
  {
    id: 5,
    name: "Megan Lee",
    phone: "60137771234",
    area: "Bangsar",
    stage: "New",
    temperature: "Cold",
    budget: 1500000,
    probability: 34,
    note: "High-value profile but low reply speed; needs a sharper hook."
  }
];

const seedClients = [
  {
    id: 101,
    name: "Alya Tan",
    stage: "Offer prep",
    nextStep: "Send offer justification tonight",
    area: "Mont Kiara",
    value: 1180000
  },
  {
    id: 102,
    name: "Nur Iman",
    stage: "Viewing arranged",
    nextStep: "Confirm family walkthrough route",
    area: "Desa ParkCity",
    value: 1680000
  },
  {
    id: 103,
    name: "Harith Lim",
    stage: "Negotiation",
    nextStep: "Push revised offer with comp sheet",
    area: "Petaling Jaya",
    value: 760000
  }
];

const seedListings = [
  {
    id: 201,
    title: "Skyline Residence",
    area: "Mont Kiara",
    price: 1180000,
    status: "Live",
    enquiries: 18,
    propertyType: "Condo",
    address: "Jalan Kiara, Mont Kiara",
    landlordName: "Mr Lim",
    landlordPhone: "60123334455",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
    maintenanceFee: "RM 0.38 psf",
    developer: "Sunrise-style luxury enclave",
    transactions: [
      { date: "Jan 2026", price: 1160000, note: "1,050 sqft high floor" },
      { date: "Nov 2025", price: 1128000, note: "Renovated 2+1 bed" },
      { date: "Aug 2025", price: 1095000, note: "Mid floor, original condition" }
    ]
  },
  {
    id: 202,
    title: "Transit Point Loft",
    area: "Bukit Jalil",
    price: 690000,
    status: "Live",
    enquiries: 24,
    propertyType: "Loft",
    address: "Jalan Jalil Perkasa, Bukit Jalil",
    landlordName: "Ms Tan",
    landlordPhone: "60128887766",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80",
    maintenanceFee: "RM 0.32 psf",
    developer: "Transit-oriented mixed development",
    transactions: [
      { date: "Feb 2026", price: 705000, note: "Fully furnished loft" },
      { date: "Dec 2025", price: 682000, note: "Vacant possession" },
      { date: "Sep 2025", price: 668000, note: "Lower floor facing highway" }
    ]
  },
  {
    id: 203,
    title: "Bangsar Hill Collection",
    area: "Bangsar",
    price: 1430000,
    status: "Reserved",
    enquiries: 9,
    propertyType: "Condo",
    address: "Jalan Maarof, Bangsar",
    landlordName: "Pn Aisyah",
    landlordPhone: "60167779988",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    maintenanceFee: "RM 0.45 psf",
    developer: "Boutique low-density project",
    transactions: [
      { date: "Mar 2026", price: 1410000, note: "Corner unit, 1,250 sqft" },
      { date: "Jan 2026", price: 1375000, note: "Similar stack, lower floor" },
      { date: "Oct 2025", price: 1320000, note: "Owner-occupied unit" }
    ]
  }
];

const LISTING_EXCEL_REQUIRED_COLUMNS = [
  "title",
  "area",
  "price",
  "status",
  "property_type",
  "address",
  "landlord_name",
  "landlord_phone",
  "image_link",
  "ar_link"
];

const LISTING_EXCEL_HEADERS = [
  ...LISTING_EXCEL_REQUIRED_COLUMNS,
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
  title: "Bangsar South Residence",
  area: "Bangsar",
  price: 1200000,
  status: "Live",
  property_type: "Condo",
  address: "Bangsar South, Kuala Lumpur",
  landlord_name: "Mr Lim",
  landlord_phone: "60123334455",
  image_link: "https://drive.google.com/file/d/GOOGLE_DRIVE_IMAGE_FILE_ID/view?usp=sharing",
  ar_link: "https://drive.google.com/file/d/GOOGLE_DRIVE_GLB_FILE_ID/view?usp=sharing",
  maintenance_fee: "RM 0.38 psf",
  developer: "UOA Group",
  enquiries: 0,
  transaction_1_date: "Mar 2026",
  transaction_1_price: 1160000,
  transaction_1_note: "1,050 sqft high floor",
  transaction_2_date: "Jan 2026",
  transaction_2_price: 1128000,
  transaction_2_note: "Renovated 2+1 bed",
  transaction_3_date: "Oct 2025",
  transaction_3_price: 1095000,
  transaction_3_note: "Mid floor original condition"
};

const areaRouteProfiles = {
  "KL Sentral": { lat: 3.134, lng: 101.6869, traffic: 1.18 },
  "Mont Kiara": { lat: 3.1699, lng: 101.6525, traffic: 1.24 },
  "Bukit Jalil": { lat: 3.055, lng: 101.69, traffic: 1.16 },
  "Bangsar": { lat: 3.128, lng: 101.679, traffic: 1.2 },
  "Petaling Jaya": { lat: 3.1073, lng: 101.6067, traffic: 1.18 },
  "Desa ParkCity": { lat: 3.1876, lng: 101.6283, traffic: 1.22 }
};

const listingRouteEnhancements = {
  201: {
    address: "Jalan Kiara, Mont Kiara",
    landlordName: "Mr Lim",
    landlordPhone: "60123334455",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
    propertyType: "Condo",
    maintenanceFee: "RM 0.38 psf",
    developer: "Sunrise-style luxury enclave",
    transactions: [
      { date: "Jan 2026", price: 1160000, note: "1,050 sqft high floor" },
      { date: "Nov 2025", price: 1128000, note: "Renovated 2+1 bed" },
      { date: "Aug 2025", price: 1095000, note: "Mid floor, original condition" }
    ]
  },
  202: {
    address: "Jalan Jalil Perkasa, Bukit Jalil",
    landlordName: "Ms Tan",
    landlordPhone: "60128887766",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80",
    propertyType: "Loft",
    maintenanceFee: "RM 0.32 psf",
    developer: "Transit-oriented mixed development",
    transactions: [
      { date: "Feb 2026", price: 705000, note: "Fully furnished loft" },
      { date: "Dec 2025", price: 682000, note: "Vacant possession" },
      { date: "Sep 2025", price: 668000, note: "Lower floor facing highway" }
    ]
  },
  203: {
    address: "Jalan Maarof, Bangsar",
    landlordName: "Pn Aisyah",
    landlordPhone: "60167779988",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    propertyType: "Condo",
    maintenanceFee: "RM 0.45 psf",
    developer: "Boutique low-density project",
    transactions: [
      { date: "Mar 2026", price: 1410000, note: "Corner unit, 1,250 sqft" },
      { date: "Jan 2026", price: 1375000, note: "Similar stack, lower floor" },
      { date: "Oct 2025", price: 1320000, note: "Owner-occupied unit" }
    ]
  }
};

const seedNotifications = [
  {
    id: Date.now() - 300000,
    title: "Hot lead entered the desk",
    message: "Alya Tan reopened a Mont Kiara unit and is ready for negotiation framing.",
    createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: Date.now() - 120000,
    title: "Commission nearing close",
    message: "Nur Iman’s family deal is moving toward the payout window this week.",
    createdAt: new Date(Date.now() - 120000).toISOString()
  }
];

const seedAutomation = {
  overnight: {
    bookedViewings: 2,
    leadJumps: 3,
    landlordWins: 1,
    whatsappReplies: 7,
    contractsPrepared: 2
  },
  channels: [
    {
      id: "voice-qualification",
      title: "AI Voice Assistant - Lead Qualification",
      metric: "3 leads above 90%",
      detail: "The voice assistant filtered the casual browsers and surfaced only buyers who sounded ready to move this week.",
      actionLabel: "Open Hot Leads",
      targetSection: "leads"
    },
    {
      id: "whatsapp-automation",
      title: "WhatsApp Outreach Automation",
      metric: "7 overnight replies",
      detail: "Personalized nudges pulled buyers back into the funnel while you were offline, including one price-sensitive buyer asking for comps.",
      actionLabel: "Reply From Lead Desk",
      targetSection: "leads"
    },
    {
      id: "landlord-voice",
      title: "AI Voice Agent - Landlord Outreach",
      metric: "1 new listing secured",
      detail: "A landlord in Mont Kiara agreed to a listing call after the AI voice agent handled the first outreach round for you.",
      actionLabel: "Listen to Call Recap",
      recap: "Owner liked the yield framing, asked for a sharper valuation deck, and agreed to reconnect tonight at 8 PM."
    }
  ]
};

const seedDocumentVault = {
  magicLink: "",
  buyerName: "Aina Rahman",
  buyerPhone: "60123456789",
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
  buyerName: "Alya Tan",
  date: nextSaturday.toISOString().slice(0, 10),
  startTime: "10:00",
  startArea: "KL Sentral",
  selectedIds: [201, 203, 202],
  shareLink: "",
  routeProvider: "Google Maps API ready",
  totalTravelMinutes: 0,
  stops: []
};

const seedCobroke = {
  requirements: {
    location: "Bangsar",
    budget: 1500000,
    propertyType: "Condo",
    buyerAgent: "Agent Farah"
  },
  selectedMatchId: null,
  matches: []
};

const seedCheatSheet = {
  propertyId: 203,
  generatedBy: "Local fallback",
  content: null
};

const defaultReferralCloseDate = new Date();
defaultReferralCloseDate.setFullYear(defaultReferralCloseDate.getFullYear() - 1);

const seedReferral = {
  clientName: "Nur Iman",
  clientPhone: "60112233445",
  clientEmail: "nur.iman@example.com",
  propertyId: 203,
  closeDate: defaultReferralCloseDate.toISOString().slice(0, 10),
  closedPrice: 1320000,
  scheduler: {
    cron: "0 9 * * *",
    timezone: "Asia/Kuala_Lumpur",
    lastRunAt: null
  },
  campaigns: []
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
  referral: readStore(STORAGE_KEYS.agentReferral, seedReferral)
};

const els = {
  navItems: [...document.querySelectorAll(".nav-item")],
  panels: [...document.querySelectorAll("[data-panel]")],
  leadFilters: [...document.querySelectorAll("[data-lead-filter]")],
  hotLeadCount: document.getElementById("hotLeadCount"),
  clientCount: document.getElementById("clientCount"),
  pendingCommission: document.getElementById("pendingCommission"),
  listingCount: document.getElementById("listingCount"),
  notificationCount: document.getElementById("notificationCount"),
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
  quickLeadButton: document.getElementById("quickLeadButton"),
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
  leadForm: document.getElementById("leadForm"),
  listingForm: document.getElementById("listingForm"),
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
  listingLandlordName: document.getElementById("listingLandlordName"),
  listingLandlordPhone: document.getElementById("listingLandlordPhone"),
  listingImageLink: document.getElementById("listingImageLink"),
  listingArLink: document.getElementById("listingArLink"),
  listingExcelInput: document.getElementById("listingExcelInput"),
  listingImportStatus: document.getElementById("listingImportStatus"),
  downloadListingTemplate: document.getElementById("downloadListingTemplate"),
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

function normalizeColumnName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeStatus(value) {
  const normalized = String(value || "Live").trim().toLowerCase();
  if (normalized === "reserved") return "Reserved";
  if (normalized === "draft") return "Draft";
  return "Live";
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
  const image = normalizeGoogleDriveImageLink(row.image_link || row.image || row.picture_link || row.photo_link);
  const ar = normalizeArLink(row.ar_link || row.ar || row.model_url || row.model_link);

  if (!title) errors.push("title is required");
  if (!area) errors.push("area is required");
  if (!Number.isFinite(price) || price <= 0) errors.push("price must be a positive number");
  if (image.error && source === "excel") errors.push(image.error);
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
      status: normalizeStatus(row.status),
      enquiries: Number(row.enquiries || 0),
      propertyType: String(row.property_type || row.propertyType || "Condo").trim() || "Condo",
      address: String(row.address || `${area}, Klang Valley`).trim(),
      landlordName: String(row.landlord_name || row.landlordName || "Landlord / co-agent").trim(),
      landlordPhone: String(row.landlord_phone || row.landlordPhone || "60123456789").replace(/[^\d+]/g, ""),
      image: image.display || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
      imageDriveLink: image.error ? "" : image.original,
      arLink: ar.display,
      arSourceLink: ar.original,
      modelUrl: ar.modelUrl,
      maintenanceFee: String(row.maintenance_fee || row.maintenanceFee || "Confirm latest JMB figure").trim(),
      developer: String(row.developer || "Developer background pending").trim(),
      transactions: parseTransactionColumns(row),
      importSource: source,
      importedAt: source === "excel" ? new Date().toISOString() : null
    },
    errors: []
  };
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

function getMorningSnapshot() {
  const hotLeads = getHotLeads();
  const activeThreads = window.KVNegotiationStore.getAll().filter((thread) => thread.status === "open").length;
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
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderWorkspace() {
  renderGlobalPlatformAlert();
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
  renderListingGrid();
  renderNotifications();
  renderDocumentVault();
  renderItineraryBuilder();
  renderCobrokeMatchmaker();
  renderCheatSheet();
  renderReferralAutopilot();
  syncSectionVisibility();
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

  els.commandBrief.innerHTML = `
    <span class="command-tag">Morning brief</span>
    <h4>AI booked ${snapshot.bookedViewings} viewings, pushed ${snapshot.leadJumps} leads toward conviction, and pulled ${snapshot.whatsappReplies} replies back into your funnel overnight.</h4>
    <p>If you handle the top queue before lunch, this dashboard will feel less like admin and more like a money printer.</p>
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
      detail: "Voice agent secured a callback"
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
  els.actionQueue.innerHTML = [
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
    {
      title: "Listen to the landlord outreach recap",
      body: "Your voice agent opened a new listing conversation in Mont Kiara. Catch the recap before another agent gets there first.",
      action: "Play recap",
      recap: state.automation.channels.find((item) => item.id === "landlord-voice")?.recap || "Listing recap ready."
    },
    {
      title: "Protect today's commission window",
      body: `${money(Math.round(commissionTotals().pending))} is sitting inside active deals. Push the negotiation and viewing stages before you open anything else.`,
      action: "Open Commission",
      section: "commission"
    }
  ].filter(Boolean).map((item) => `
    <article class="action-card">
      <strong>${item.title}</strong>
      <p>${item.body}</p>
      ${item.section
        ? `<button class="ghost-button" data-action="jump-section" data-section="${item.section}" type="button">${item.action}</button>`
        : `<button class="ghost-button" data-action="play-recap" data-message="${item.recap}" type="button">${item.action}</button>`}
    </article>
  `).join("");
}

function renderAutomationBoard() {
  els.automationBoard.innerHTML = state.automation.channels.map((channel) => `
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
  `).join("");
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

function renderLeadList() {
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
  els.clientList.innerHTML = state.clients.map((client) => `
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
  `).join("");
}

function renderCommissionTable() {
  els.commissionTable.innerHTML = state.clients.map((client) => `
    <article class="commission-row">
      <div>
        <strong>${client.name}</strong>
        <div class="subtext">${client.area}</div>
      </div>
      <div>${money(client.value)}</div>
      <div>${money(Math.round(client.value * 0.03))}</div>
      <div>${client.stage}</div>
    </article>
  `).join("");
}

function renderListingGrid() {
  els.listingGrid.innerHTML = state.listings.map(getEnhancedListing).map((listing) => `
    <article class="listing-card">
      <div class="listing-media">
        <img src="${listing.image}" alt="${listing.title}" loading="lazy">
        <span class="meta-pill">${listing.propertyType}</span>
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
        <span class="meta-pill">${listing.enquiries} enquiries</span>
        ${listing.imageDriveLink ? `<span class="meta-pill"><i class="fa-brands fa-google-drive"></i> Drive image</span>` : `<span class="meta-pill">Image</span>`}
        ${listing.arLink ? `<span class="meta-pill"><i class="fa-solid fa-cube"></i> AR ready</span>` : `<span class="meta-pill">No AR</span>`}
      </div>
      <div class="action-row">
        <button class="ghost-button" data-action="toggle-listing-status" data-id="${listing.id}" type="button">
          <i class="fa-solid fa-repeat"></i>
          Toggle Status
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
  `).join("");
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
    `).join("");
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

function renderNegotiationDesk() {
  const threads = window.KVNegotiationStore.getAll()
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
  const threads = window.KVNegotiationStore.getAll()
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
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.section === state.section));
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

function toggleListingStatus(id) {
  const cycle = {
    Live: "Reserved",
    Reserved: "Draft",
    Draft: "Live"
  };

  state.listings = state.listings.map((listing) => {
    if (listing.id !== id) return listing;
    return { ...listing, status: cycle[listing.status] || "Live" };
  });

  persistAll();
  renderWorkspace();
  showToast("Listing status updated");
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

function addListing(event) {
  event.preventDefault();
  const result = buildListingFromData({
    title: els.listingTitle.value.trim(),
    area: els.listingArea.value.trim(),
    price: Number(els.listingPrice.value),
    status: els.listingStatus.value,
    property_type: els.listingPropertyType.value.trim(),
    address: els.listingAddress.value.trim(),
    landlord_name: els.listingLandlordName.value.trim(),
    landlord_phone: els.listingLandlordPhone.value.trim(),
    image_link: els.listingImageLink.value.trim(),
    ar_link: els.listingArLink.value.trim(),
    enquiries: 0
  }, "manual");

  if (result.errors.length) {
    showToast(result.errors[0]);
    return;
  }

  const listing = result.listing;

  state.listings = [listing, ...state.listings];
  state.notifications = [
    {
      id: Date.now() + 1,
      title: "Listing added",
      message: `${listing.title} is now inside inventory control.`,
      createdAt: new Date().toISOString()
    },
    ...state.notifications
  ];

  els.listingForm.reset();
  closeModal("listingModal");
  persistAll();
  renderWorkspace();
  showToast("Listing saved");
}

function setImportStatus(message, tone = "neutral") {
  if (!els.listingImportStatus) return;
  els.listingImportStatus.className = `excel-import-status ${tone}`;
  els.listingImportStatus.innerHTML = message;
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
  return LISTING_EXCEL_REQUIRED_COLUMNS.filter((column) => !columns.has(column));
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
        <p>Use the template so the system can detect image_link and ar_link correctly.</p>
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

    state.listings = [...imported, ...state.listings];
    state.notifications = [
      {
        id: Date.now() + 1,
        title: "Excel listings imported",
        message: `${imported.length} listings imported with Google Drive images${rowErrors.length ? `; ${rowErrors.length} row issue(s) skipped.` : "."}`,
        createdAt: new Date().toISOString()
      },
      ...state.notifications
    ];

    persistAll();
    renderWorkspace();
    setImportStatus(`
      <strong>${imported.length} listings imported</strong>
      <p>Google Drive images were converted to readable thumbnails. AR links are stored for display.</p>
      ${rowErrors.length ? `<p>${rowErrors.slice(0, 4).join("<br>")}</p>` : ""}
    `, rowErrors.length ? "warning" : "success");
    showToast(`${imported.length} Excel listings imported`);
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
  const listing = getEnhancedListing(state.listings.find((item) => item.id === id) || {});
  const link = kind === "ar" ? listing.arLink : listing.imageDriveLink || listing.image;
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
    image: listing.image || enhancement.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
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
  if ([fromArea, toArea].some((area) => ["Bangsar", "KL Sentral", "Mont Kiara"].includes(area))) multiplier += 0.08;
  if ([fromArea, toArea].includes("Petaling Jaya") && [fromArea, toArea].includes("Bangsar")) multiplier += 0.1;

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
    Bangsar: ["KL Sentral", "Mont Kiara", "Petaling Jaya"],
    "Mont Kiara": ["Bangsar", "Desa ParkCity", "KL Sentral"],
    "Bukit Jalil": ["Petaling Jaya", "Bangsar"],
    "Petaling Jaya": ["Bangsar", "Bukit Jalil"],
    "Desa ParkCity": ["Mont Kiara"]
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
        <button class="primary-button" data-action="accept-cobroke" data-id="${match.id}" type="button">Accept 50/50</button>
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
  state.cobroke.matches = (state.cobroke.matches || []).map((match) => (
    match.id === id ? updater(match) : match
  ));
  state.cobroke.selectedMatchId = `match-${id}`;
  persistAll();
  renderCobrokeMatchmaker();
}

function acceptCobroke(id) {
  updateCobrokeMatch(id, (match) => ({
    ...match,
    status: "accepted",
    agreement: match.agreement || generateCobrokeAgreement(match)
  }));
  pushNotifications("Co-broke accepted", "50/50 commission agreement generated and ready for e-sign.");
  renderNotifications();
  showToast("Co-broke accepted");
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
  if (listing.transactions?.length) return listing.transactions;
  return [
    { date: "Recent", price: Math.round(listing.price * 0.98), note: "Comparable unit" },
    { date: "Previous", price: Math.round(listing.price * 0.94), note: "Similar size" },
    { date: "Older", price: Math.round(listing.price * 0.9), note: "Lower floor or older condition" }
  ];
}

function listingForCheatSheet(propertyId) {
  return itineraryListings().find((listing) => String(listing.id) === String(propertyId)) || itineraryListings()[0];
}

function generateFallbackCheatSheet(listing) {
  const transactions = transactionFallback(listing);
  const latest = transactions[0]?.price || listing.price;
  const premium = ((listing.price - latest) / latest) * 100;

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
    Bangsar: 0.052,
    "Mont Kiara": 0.046,
    "Bukit Jalil": 0.044,
    "Petaling Jaya": 0.04,
    "Desa ParkCity": 0.048
  };
  const typeBoost = listing.propertyType === "Landed" ? 0.012 : listing.propertyType === "Condo" ? 0.004 : 0;
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
  document.getElementById(id).classList.add("is-open");
  document.getElementById(id).setAttribute("aria-hidden", "false");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("is-open");
  document.getElementById(id).setAttribute("aria-hidden", "true");
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
  els.quickLeadButton.addEventListener("click", () => openModal("leadModal"));
  els.openListingComposer.addEventListener("click", () => openModal("listingModal"));
  els.downloadListingTemplate.addEventListener("click", downloadListingTemplate);

  els.leadForm.addEventListener("submit", addLead);
  els.listingForm.addEventListener("submit", addListing);
  els.listingExcelInput.addEventListener("change", importListingsFromExcel);
  els.documentVaultForm.addEventListener("submit", saveDocumentVault);
  els.itineraryForm.addEventListener("submit", createItinerary);
  els.cobrokeForm.addEventListener("submit", createCobrokeMatches);
  els.cheatSheetForm.addEventListener("submit", createCheatSheet);
  els.referralForm.addEventListener("submit", createReferralAutomation);
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
    if (action === "toggle-listing-status") toggleListingStatus(id);
    if (action === "open-listing-image") openListingAsset(id, "image");
    if (action === "open-listing-ar") openListingAsset(id, "ar");
    if (action === "agent-counter") handleNegotiationAction(id, "counter");
    if (action === "agent-accept") handleNegotiationAction(id, "accept");
    if (action === "agent-reject") handleNegotiationAction(id, "reject");
    if (action === "agent-close") handleNegotiationAction(id, "close");
    if (action === "jump-section") goToSection(actionTarget.dataset.section);
    if (action === "play-recap") showToast(actionTarget.dataset.message || "Call recap ready");
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
    if (action === "accept-cobroke") acceptCobroke(id);
    if (action === "reject-cobroke") rejectCobroke(id);
    if (action === "select-cobroke-agreement") {
      state.cobroke.selectedMatchId = `match-${id}`;
      persistAll();
      renderCobrokeAgreement();
    }
    if (action === "sign-cobroke-listing") signCobroke(id, "listingAgent");
    if (action === "sign-cobroke-buyer") signCobroke(id, "buyerAgent");
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
    if (action === "agent-open-vault-for-deal") openVaultForDeal(rawId);
    if (action === "agent-sign-offer") signDealOffer(rawId);
    if (action === "agent-release-escrow") releaseEscrow(rawId);
  });

  document.addEventListener("keydown", (event) => {
    const actionTarget = event.target.closest?.("[data-action='open-document-vault'], [data-action='open-itinerary-builder'], [data-action='open-cobroke-matchmaker'], [data-action='open-cheat-sheet'], [data-action='open-referral-autopilot']");
    if (!actionTarget || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
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
  });

  [els.leadModal, els.listingModal, els.documentVaultModal, els.itineraryModal, els.cobrokeModal, els.cheatSheetModal, els.referralModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal.id);
    });
  });
}

bindEvents();
renderWorkspace();
