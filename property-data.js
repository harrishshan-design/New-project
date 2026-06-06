(function () {
  const IMPORT_VERSION = "iqi-global-projects-2026-05-16-v2-live-agent";
  const DEFAULT_WHATSAPP = "60123456789";
  const LIVE_AGENT = {
    id: "ag-arvind",
    name: "Arvind Govindasamy",
    email: "arvind@realtygenius.my",
    phone: DEFAULT_WHATSAPP,
    renNumber: "REN-PENDING",
    agencyName: "RealtyGenius IQI Project Desk",
    icDocumentUrl: "profile://owner-agent/arvind-govindasamy",
    icHash: "owner-agent-arvind-govindasamy",
    status: "approved",
    strikes: 0,
    createdAt: "2026-05-16T09:00:00+08:00"
  };

  const rawProjects = [
    {
      title: "Taman Serai Perdana",
      url: "https://iqiglobal.com/project/bagan-serai-perak/taman-serai-perdana",
      address: "Jalan Serai Perdana, Taman Serai Perdana, 34300 Bagan Serai, Perak, Malaysia.",
      numberOfUnits: 14,
      price: 48666667,
      expectedCompletion: "",
      sqft: 861,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2342/extra_large/2336f048498ee2dc42228217cea2ae0f74373067.?1777216960"
    },
    {
      title: "Emerald Residences",
      url: "https://iqiglobal.com/project/malaysia/emerald-residences",
      address: "Lintang Teluk Kumbar 1, Teluk Kumbar, 11920 Bayan Lepas, Penang, Malaysia",
      numberOfUnits: 411,
      price: 524700,
      expectedCompletion: "",
      sqft: 1183,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2373/extra_large/7aeeab266ba961598a43966868e01f2ef5af58a9.?1772781354"
    },
    {
      title: "Dwi Aurora Residence @ Petaling Jaya",
      url: "https://iqiglobal.com/project/petaling-jaya-selangor/dwi-aurora-residence-petaling-jaya",
      address: "Jalan Sri Manja, Pjs 3, 46000 Petaling Jaya, Selangor",
      numberOfUnits: 439,
      price: 631000,
      expectedCompletion: "April 01, 2030",
      sqft: 1284,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2372/extra_large/6efe415b735691dc9a37075bd281c0d88de3b26d.?1772683122"
    },
    {
      title: "Alamanda Heights @ Seri Kembangan",
      url: "https://iqiglobal.com/project/seri-kembangan-selangor/alamanda-heights-seri-kembangan",
      address: "Alamanda Heights, Seksyen 9, Jln Mawar, Taman Perindustrian Bukit Serdang, 43300 Seri Kembangan, Selangor",
      numberOfUnits: 440,
      price: 565000,
      expectedCompletion: "January 01, 2030",
      sqft: 1050,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2351/extra_large/a53567cd99b75657afc923e61e86a89c68cf9b3d.?1769755090"
    },
    {
      title: "Colonial Infinite @ Edumetro",
      url: "https://iqiglobal.com/project/malaysia/colonial-infinite-edumetro",
      address: "Taman Subang Permai, 47500 Subang Jaya, Selangor",
      numberOfUnits: 261,
      price: 253000,
      expectedCompletion: "January 01, 2028",
      sqft: 1001,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2350/extra_large/ed3f6d24ae1617cb1fd859b2ed84d3c548029f0d.?1777132202"
    },
    {
      title: "Northern TechValley @BKE",
      url: "https://iqiglobal.com/project/malaysia/northern-techvalley-bke",
      address: "Mukim 14, Kubang Semang, 14400 Seberang Perai, Penang, Malaysia",
      numberOfUnits: 46,
      price: 14495520,
      expectedCompletion: "",
      sqft: 43560,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2349/extra_large/efe46d7fbd4128d0cc0540e58282a76dcaf19ab2.?1777132546"
    },
    {
      title: "Taman IKS Bukit Minyak",
      url: "https://iqiglobal.com/project/malaysia/taman-iks-bukit-minyak",
      address: "Jalan IKS Bukit Minyak Utama, Taman IKS Bukit Minyak, 14100 Simpang Ampat, Penang, Malaysia.",
      numberOfUnits: 24,
      price: 1203800,
      expectedCompletion: "",
      sqft: 11005,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2348/extra_large/c62a2c7b490c67a49bc71d71409b02b5f468593e.?1777133271"
    },
    {
      title: "Regalway Industrial Hub (Commercial)",
      url: "https://iqiglobal.com/project/pulau-pinang/regalway-industrial-hub-commercial",
      address: "Pulau Pinang, Malaysia",
      numberOfUnits: 23,
      price: 3828000,
      expectedCompletion: "",
      sqft: 4477,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2347/extra_large/66a1b08637450a0534cf66ca5cb23f6a7a620106.?1777133077"
    },
    {
      title: "Regalway Industrial Hub (Industrial)",
      url: "https://iqiglobal.com/project/malaysia/regalway-industrial-hub-industrial",
      address: "Regalway Industrial Hub, Off Jalan Bukit Panchor, Bukit Panchor, 14100 Simpang Ampat, Penang, Malaysia.",
      numberOfUnits: 38,
      price: 5015000,
      expectedCompletion: "",
      sqft: 9780,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2346/extra_large/d3815c35fa32da2932c03e0dd7d8a0573aec4756.?1777133618"
    },
    {
      title: "Taman Jasa Ria (Garden Villa)",
      url: "https://iqiglobal.com/project/malaysia/taman-jasa-ria-garden-villa",
      address: "Jalan Permatang Pasir, Taman Jasa Ria, 14000 Bukit Mertajam, Penang, Malaysia",
      numberOfUnits: 62,
      price: 1118800,
      expectedCompletion: "",
      sqft: 1261,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2345/extra_large/f668db5adc9691a1760bd4e5d2fb4535d7b91a21.?1777217755"
    },
    {
      title: "Taman Jasa Intan (Garden Superlink)",
      url: "https://iqiglobal.com/project/malaysia/taman-jasa-intan-garden-superlink",
      address: "Jalan Jasa Intan, Taman Jasa Intan, 14000 Bukit Mertajam, Penang, Malaysia",
      numberOfUnits: 78,
      price: 818000,
      expectedCompletion: "",
      sqft: 1900,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2344/extra_large/bb8bc6a1c82642f76a30c4056b6f6a5ad5f98ff4.?1777217503"
    },
    {
      title: "Taman Fajar Permai (Sunrise Terrace)",
      url: "https://iqiglobal.com/project/malaysia/taman-fajar-permai-sunrise-terrace",
      address: "Jalan Fajar, Taman Fajar Permai, 14300 Nibong Tebal, Penang, Malaysia.",
      numberOfUnits: 137,
      price: 550000,
      expectedCompletion: "",
      sqft: 1660,
      image: "https://atlasproduction.s3.amazonaws.com/images/overview_image/2343/extra_large/b621d4e257a4b9401029d7f5c9364f2e4111b5df.?1777217246"
    }
  ];

  const routeProfiles = {
    "Bagan Serai": { lat: 5.0107, lng: 100.5417, traffic: 1.05 },
    "Bayan Lepas": { lat: 5.2943, lng: 100.2593, traffic: 1.16 },
    "Petaling Jaya": { lat: 3.1073, lng: 101.6067, traffic: 1.18 },
    "Seri Kembangan": { lat: 3.0218, lng: 101.7051, traffic: 1.2 },
    "Subang Jaya": { lat: 3.0567, lng: 101.5851, traffic: 1.18 },
    "Seberang Perai": { lat: 5.3978, lng: 100.4189, traffic: 1.12 },
    "Simpang Ampat": { lat: 5.2815, lng: 100.4776, traffic: 1.12 },
    "Pulau Pinang": { lat: 5.4141, lng: 100.3288, traffic: 1.14 },
    "Bukit Mertajam": { lat: 5.363, lng: 100.4667, traffic: 1.12 },
    "Nibong Tebal": { lat: 5.1659, lng: 100.4779, traffic: 1.08 }
  };

  function areaFor(project) {
    const text = `${project.title} ${project.address} ${project.url}`.toLowerCase();
    if (text.includes("petaling jaya")) return "Petaling Jaya";
    if (text.includes("seri kembangan")) return "Seri Kembangan";
    if (text.includes("subang jaya")) return "Subang Jaya";
    if (text.includes("bayan lepas") || text.includes("teluk kumbar")) return "Bayan Lepas";
    if (text.includes("bagan serai")) return "Bagan Serai";
    if (text.includes("seberang perai") || text.includes("kubang semang")) return "Seberang Perai";
    if (text.includes("simpang ampat") || text.includes("bukit minyak") || text.includes("bukit panchor")) return "Simpang Ampat";
    if (text.includes("bukit mertajam")) return "Bukit Mertajam";
    if (text.includes("nibong tebal")) return "Nibong Tebal";
    return "Pulau Pinang";
  }

  function propertyTypeFor(project) {
    const title = project.title.toLowerCase();
    if (title.includes("industrial") || title.includes("techvalley") || title.includes("iks")) return "Industrial";
    if (title.includes("commercial")) return "Commercial";
    if (title.includes("villa") || title.includes("superlink") || title.includes("terrace")) return "Landed";
    if (title.includes("residence") || title.includes("heights") || title.includes("edumetro")) return "Condo";
    return "Residential Project";
  }

  function buyerType(propertyType) {
    if (["Industrial", "Commercial"].includes(propertyType)) return "investment";
    if (propertyType === "Landed" || propertyType === "Residential Project") return "family";
    return "condo";
  }

  function intentFor(project, propertyType) {
    if (["Industrial", "Commercial"].includes(propertyType)) return "investment";
    if (project.price >= 3000000) return "investment";
    if (propertyType === "Landed" || propertyType === "Residential Project") return "family";
    return "investment";
  }

  function roomProfile(project, propertyType) {
    if (["Industrial", "Commercial"].includes(propertyType)) return { bedrooms: 0, bathrooms: 0 };
    if (propertyType === "Landed" || project.sqft >= 1600) return { bedrooms: 4, bathrooms: 3 };
    if (project.sqft >= 1150) return { bedrooms: 3, bathrooms: 2 };
    return { bedrooms: 2, bathrooms: 2 };
  }

  function yieldFor(project, propertyType, index) {
    const base = ["Industrial", "Commercial"].includes(propertyType) ? 6.1 : propertyType === "Condo" ? 4.8 : 4.1;
    return Number((base + (index % 4) * 0.18).toFixed(1));
  }

  function growthFor(project, index) {
    const completionBoost = project.expectedCompletion ? 0.6 : 0.2;
    return Number((5.8 + completionBoost + (index % 5) * 0.28).toFixed(1));
  }

  function summaryFor(project, propertyType) {
    const completion = project.expectedCompletion ? ` Expected completion: ${project.expectedCompletion}.` : "";
    return `IQI Global ${propertyType.toLowerCase()} project with ${project.numberOfUnits} units, starting from RM ${project.price.toLocaleString("en-MY")} and built-up from about ${project.sqft.toLocaleString("en-MY")} sqft.${completion}`;
  }

  function vibeFor(project, propertyType) {
    if (["Industrial", "Commercial"].includes(propertyType)) return "Commercial inventory, larger built-up, investment-oriented";
    if (propertyType === "Landed") return "Landed lifestyle, family-sized, township-driven";
    if (propertyType === "Condo") return "New project, compact entry, buyer-friendly";
    return "Residential township, practical family entry";
  }

  const propertyMediaSlots = [
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

  function galleryFor(project) {
    return propertyMediaSlots.map((slot, index) => ({
      ...slot,
      url: index === 0 ? project.image : "",
      source: index === 0 ? "IQI Global project image" : "Agent upload required",
      status: index === 0 ? "verified" : "pending_agent_upload"
    }));
  }

  const buyerProperties = rawProjects.map((project, index) => {
    const propertyType = propertyTypeFor(project);
    const rooms = roomProfile(project, propertyType);
    const area = areaFor(project);
    const propertyYield = yieldFor(project, propertyType, index);
    const growth = growthFor(project, index);
    const gallery = galleryFor(project);
    return {
      id: index + 1,
      title: project.title,
      location: project.address || area,
      area,
      type: buyerType(propertyType),
      intent: intentFor(project, propertyType),
      price: project.price,
      bedrooms: rooms.bedrooms,
      bathrooms: rooms.bathrooms,
      sqft: project.sqft,
      psf: project.sqft ? Math.round(project.price / project.sqft) : 0,
      yield: propertyYield,
      growth,
      aiScore: Math.max(82, 96 - index),
      liveNow: Math.max(3, Math.min(24, Math.round(project.numberOfUnits / 22) + 3)),
      vibe: vibeFor(project, propertyType),
      summary: summaryFor(project, propertyType),
      image: project.image,
      gallery,
      galleryCount: gallery.length,
      verifiedPhotoCount: gallery.filter((item) => item.url).length,
      requiredPhotoLabels: propertyMediaSlots.filter((item) => item.required).map((item) => item.label),
      modelUrl: "",
      whatsapp: DEFAULT_WHATSAPP,
      sourceUrl: project.url,
      numberOfUnits: project.numberOfUnits,
      expectedCompletion: project.expectedCompletion,
      propertyType
    };
  });

  const agentListings = buyerProperties.map((property, index) => ({
    id: 201 + index,
    title: property.title,
    area: property.area,
    price: property.price,
    status: "Live",
    agentId: LIVE_AGENT.id,
    agentName: LIVE_AGENT.name,
    agencyName: LIVE_AGENT.agencyName,
    enquiries: property.liveNow,
    propertyType: property.propertyType,
    address: property.location,
    landlordName: LIVE_AGENT.name,
    landlordPhone: LIVE_AGENT.phone,
    image: property.image,
    gallery: property.gallery,
    galleryCount: property.galleryCount,
    verifiedPhotoCount: property.verifiedPhotoCount,
    requiredPhotoLabels: property.requiredPhotoLabels,
    imageDriveLink: "",
    arLink: property.sourceUrl,
    modelUrl: property.sourceUrl,
    maintenanceFee: "Confirm with developer sales package",
    developer: "IQI Global project listing",
    numberOfUnits: property.numberOfUnits,
    expectedCompletion: property.expectedCompletion,
    sourceUrl: property.sourceUrl,
    transactions: [
      { date: "Current", price: property.price, note: "Starting from price in uploaded IQI CSV" },
      { date: "Benchmark", price: Math.round(property.price * 0.96), note: "Internal comparison anchor" },
      { date: "Offer guide", price: Math.round(property.price * 0.92), note: "Negotiation reference only" }
    ]
  }));

  const adminListings = buyerProperties.map((property, index) => ({
    id: `ls-${201 + index}`,
    agentId: LIVE_AGENT.id,
    title: property.title,
    price: property.price,
    location: property.area,
    status: "pending_qc",
    imageUrl: property.image,
    galleryCount: property.galleryCount,
    verifiedPhotoCount: property.verifiedPhotoCount,
    requiredPhotoLabels: property.requiredPhotoLabels,
    requiredMediaStatus: "front-view-only",
    imageResolution: 1280,
    blurScore: 0.08,
    imageHash: `iqi-${index + 1}-${property.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    sourceUrl: property.sourceUrl,
    createdAt: new Date(Date.now() - (index + 1) * 3600000).toISOString()
  }));

  const marketAverages = buyerProperties.reduce((acc, property) => {
    acc[property.area] = Math.round((acc[property.area] || property.price) * 0.45 + property.price * 0.55);
    return acc;
  }, {});

  const adminReports = [
    {
      id: "rp-iqi-1",
      userId: "usr-9001",
      listingId: adminListings[0].id,
      agentId: adminListings[0].agentId,
      type: "source_verification",
      description: "Buyer requested source confirmation because the uploaded project price needs package and availability verification.",
      status: "investigating",
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      id: "rp-iqi-2",
      userId: "usr-9002",
      listingId: adminListings[7].id,
      agentId: adminListings[7].agentId,
      type: "availability_check",
      description: "Commercial project inquiry needs agent follow-up and latest availability confirmation.",
      status: "open",
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
    }
  ];

  const communityNotes = {
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

  function migrateListingStores() {
    if (localStorage.getItem("rg_property_import_version") === IMPORT_VERSION) return;
    localStorage.setItem("kvai_agent_listings", JSON.stringify(agentListings));
    localStorage.setItem("rg_live_agent_profile", JSON.stringify(LIVE_AGENT));
    localStorage.setItem("rg_admin_agents", JSON.stringify([LIVE_AGENT]));
    localStorage.setItem("rg_admin_listings", JSON.stringify(adminListings));
    localStorage.setItem("rg_admin_reports", JSON.stringify(adminReports));
    localStorage.setItem("kvai_user_favorites", JSON.stringify([]));
    localStorage.setItem("kvai_user_views", JSON.stringify({}));
    localStorage.setItem("kvai_user_bookings", JSON.stringify([]));
    localStorage.setItem("kvai_user_guess_game", JSON.stringify({}));
    localStorage.setItem("kvai_user_community_notes", JSON.stringify(communityNotes));
    localStorage.setItem("rg_property_import_version", IMPORT_VERSION);
  }

  window.RealtyGeniusRawProjects = rawProjects;
  window.RealtyGeniusLiveAgent = LIVE_AGENT;
  window.RealtyGeniusPropertyListings = buyerProperties;
  window.RealtyGeniusAgentListings = agentListings;
  window.RealtyGeniusAdminListings = adminListings;
  window.RealtyGeniusAdminReports = adminReports;
  window.RealtyGeniusCommunityNotes = communityNotes;
  window.RealtyGeniusMarketAverages = marketAverages;
  window.RealtyGeniusAreaRouteProfiles = routeProfiles;

  migrateListingStores();
})();
