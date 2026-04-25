const STORAGE_KEYS = {
  favorites: "kvai_user_favorites",
  views: "kvai_user_views",
  bookings: "kvai_user_bookings",
  notifications: "kvai_user_notifications"
};

const properties = [
  {
    id: 1,
    title: "Skyline Residence",
    location: "Mont Kiara, Kuala Lumpur",
    area: "Mont Kiara",
    type: "condo",
    intent: "luxury",
    price: 1180000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1240,
    psf: 952,
    yield: 4.6,
    growth: 8.7,
    aiScore: 96,
    liveNow: 14,
    vibe: "Low-density, polished, expatriate-friendly",
    summary: "A clean luxury high-rise with strong rental resilience and a premium address profile.",
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    whatsapp: "60123456789"
  },
  {
    id: 2,
    title: "Parkside Terrace",
    location: "Desa ParkCity, Kuala Lumpur",
    area: "Desa ParkCity",
    type: "family",
    intent: "family",
    price: 1680000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2320,
    psf: 724,
    yield: 3.7,
    growth: 7.9,
    aiScore: 93,
    liveNow: 9,
    vibe: "Family-oriented, green, highly livable",
    summary: "A family-first landed option with excellent neighborhood quality and durable long-term demand.",
    image: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "",
    whatsapp: "60123456789"
  },
  {
    id: 3,
    title: "Transit Point Loft",
    location: "Bukit Jalil, Kuala Lumpur",
    area: "Bukit Jalil",
    type: "investment",
    intent: "investment",
    price: 690000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 915,
    psf: 754,
    yield: 5.1,
    growth: 7.2,
    aiScore: 95,
    liveNow: 18,
    vibe: "Transit-linked, efficient, modern",
    summary: "An investor-friendly city-fringe unit built around strong rental practicality and healthy yield.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    whatsapp: "60123456789"
  },
  {
    id: 4,
    title: "MRT City Nest",
    location: "Petaling Jaya, Selangor",
    area: "Petaling Jaya",
    type: "condo",
    intent: "investment",
    price: 760000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 980,
    psf: 776,
    yield: 4.8,
    growth: 6.9,
    aiScore: 91,
    liveNow: 11,
    vibe: "Connected, practical, lifestyle-rich",
    summary: "A strong middle-market condo with reliable commuter appeal and stable leasing fundamentals.",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "",
    whatsapp: "60123456789"
  },
  {
    id: 5,
    title: "Bangsar Hill Collection",
    location: "Bangsar, Kuala Lumpur",
    area: "Bangsar",
    type: "luxury",
    intent: "luxury",
    price: 1430000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1360,
    psf: 1051,
    yield: 4.1,
    growth: 8.2,
    aiScore: 90,
    liveNow: 7,
    vibe: "Established prestige, urban, social",
    summary: "A premium city-core lifestyle choice for buyers who want status, convenience, and resale strength.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "",
    whatsapp: "60123456789"
  },
  {
    id: 6,
    title: "Subang Smart Suite",
    location: "Subang Jaya, Selangor",
    area: "Subang Jaya",
    type: "investment",
    intent: "investment",
    price: 540000,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 710,
    psf: 761,
    yield: 5.3,
    growth: 6.1,
    aiScore: 88,
    liveNow: 13,
    vibe: "Compact, efficient, tenant-friendly",
    summary: "A smaller-format unit ideal for yield-focused buyers who want a practical entry into the market.",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "",
    whatsapp: "60123456789"
  }
];

const state = {
  filter: "all",
  search: "",
  sort: "recommended",
  activePropertyId: null,
  favorites: readStore(STORAGE_KEYS.favorites, []),
  views: readStore(STORAGE_KEYS.views, {}),
  bookings: readStore(STORAGE_KEYS.bookings, []),
  notifications: readStore(STORAGE_KEYS.notifications, seedNotifications())
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
  propertyGrid: document.getElementById("propertyGrid"),
  recommendationGrid: document.getElementById("recommendationGrid"),
  savedGrid: document.getElementById("savedGrid"),
  favoritesDrawerList: document.getElementById("favoritesDrawerList"),
  notificationsDrawerList: document.getElementById("notificationsDrawerList"),
  favoritesDrawer: document.getElementById("favoritesDrawer"),
  notificationsDrawer: document.getElementById("notificationsDrawer"),
  recommendationTitle: document.getElementById("recommendationTitle"),
  recommendationText: document.getElementById("recommendationText"),
  recommendationMeta: document.getElementById("recommendationMeta"),
  engagementList: document.getElementById("engagementList"),
  signalBadge: document.getElementById("signalBadge"),
  propertyModal: document.getElementById("propertyModal"),
  modalBadge: document.getElementById("modalBadge"),
  modalTitle: document.getElementById("modalTitle"),
  modalLocation: document.getElementById("modalLocation"),
  modalSummary: document.getElementById("modalSummary"),
  modalImage: document.getElementById("modalImage"),
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
  hiddenArLaunch: document.getElementById("hiddenArLaunch"),
  bookingForm: document.getElementById("bookingForm"),
  bookingName: document.getElementById("bookingName"),
  bookingPhone: document.getElementById("bookingPhone"),
  bookingDate: document.getElementById("bookingDate"),
  bookingTime: document.getElementById("bookingTime"),
  bookingStatus: document.getElementById("bookingStatus"),
  toast: document.getElementById("toast")
};

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

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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

function money(value) {
  return value >= 1000000 ? `RM ${(value / 1000000).toFixed(2)}M` : `RM ${(value / 1000).toFixed(0)}K`;
}

function fullMoney(value) {
  return `RM ${Number(value).toLocaleString("en-MY")}`;
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

function getWhatsAppLink(property, source = "dashboard") {
  const text = `Hi, I want more details about ${property.title} in ${property.area}. I found it through the ${source} view on Klang Valley AI.`;
  return `https://wa.me/${property.whatsapp}?text=${encodeURIComponent(text)}`;
}

function filteredProperties() {
  const query = state.search.trim().toLowerCase();
  let list = properties.filter((property) => {
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
    return (
      b.aiScore + getViewCount(b.id) * 0.9 + (state.favorites.includes(b.id) ? 8 : 0)
    ) - (
      a.aiScore + getViewCount(a.id) * 0.9 + (state.favorites.includes(a.id) ? 8 : 0)
    );
  });
}

function recommendationList() {
  return [...filteredProperties()]
    .sort((a, b) => {
      const aScore = getDecision(a).roi + getViewCount(a.id) * 0.35 + (state.favorites.includes(a.id) ? 5 : 0);
      const bScore = getDecision(b).roi + getViewCount(b.id) * 0.35 + (state.favorites.includes(b.id) ? 5 : 0);
      return bScore - aScore;
    })
    .slice(0, 3);
}

function renderDashboard() {
  renderMetrics();
  renderEngagement();
  renderRecommendations();
  renderProperties();
  renderSaved();
  renderFavoritesDrawer();
  renderNotifications();
}

function renderMetrics() {
  const visible = filteredProperties();
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

  els.signalBadge.textContent = preference ? "Behavior memory active" : "Learning from your clicks";
  els.engagementList.innerHTML = [
    {
      title: `${saved || 0} homes saved`,
      body: saved ? "Your shortlist is forming. Reopen a saved pick and the feed will rebalance around it." : "Start by saving 2 or 3 homes you would genuinely revisit."
    },
    {
      title: `${viewed || 0} feed interactions`,
      body: preference ? `The engine now sees a bias toward ${preference}.` : "Open a few listings and the recommendation engine will start adapting."
    },
    {
      title: trend ? `Top momentum: ${trend.area}` : "Momentum waiting",
      body: trend ? `${trend.liveNow} buyers are exploring this area right now, which makes it a strong exploration zone tonight.` : "Once you browse, we will surface the hottest pocket in your feed."
    }
  ].map((item) => `
    <article class="engagement-item">
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    </article>
  `).join("");
}

function renderRecommendations() {
  const picks = recommendationList();
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
  els.recommendationTitle.textContent = primary.title;
  els.recommendationText.textContent = preference
    ? `Based on your behavior, we refined your strategy. You keep leaning toward ${preference}.`
    : `This leads right now because it combines price logic, demand fit, and a cleaner upside profile than the rest of your feed.`;
  els.recommendationMeta.textContent = `${primary.area} • ${decision.roi}% projected blended ROI • Suggested offer ${money(decision.offer)}`;

  els.recommendationGrid.innerHTML = picks.map((property, index) => {
    const pack = getDecision(property);
    return `
      <article class="recommendation-card">
        <div class="card-media">
          <img src="${property.image}" alt="${property.title}" loading="lazy">
          <span class="area-pill">Pick ${index + 1}</span>
          <span class="score-pill">${pack.risk} Risk</span>
        </div>
        <div class="card-body">
          <div class="price">${money(property.price)}</div>
          <div class="title">${property.title}</div>
          <p class="summary">${pack.reasons[0]}</p>
          <div class="card-tags">
            <span class="tag">${pack.roi}% ROI</span>
            <span class="tag">Offer ${money(pack.offer)}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderProperties() {
  const list = filteredProperties();
  if (!list.length) {
    els.propertyGrid.innerHTML = `<div class="empty-state">No properties match your search right now. Try a broader area or switch your filter.</div>`;
    return;
  }

  els.propertyGrid.innerHTML = list.map((property) => {
    const pack = getDecision(property);
    const saved = state.favorites.includes(property.id);
    return `
      <article class="property-card">
        <div class="feed-media">
          <img src="${property.image}" alt="${property.title}" loading="lazy">
          <span class="area-pill">${property.area}</span>
          <span class="score-pill">AI ${property.aiScore}</span>
          <span class="live-pill"><i class="fa-solid fa-fire"></i> ${property.liveNow} viewing now</span>
        </div>
        <div class="card-body">
          <div class="price-row">
            <div>
              <div class="price">${money(property.price)}</div>
              <div class="title">${property.title}</div>
            </div>
            <button class="ghost-button save-button ${saved ? "is-saved" : ""}" data-action="toggle-save" data-id="${property.id}">
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
          <p class="summary">${property.summary}</p>
          <div class="card-tags">
            <span class="tag">${pack.roi}% ROI</span>
            <span class="tag">${pack.risk} Risk</span>
          </div>
          <div class="card-actions">
            <button class="ghost-button" data-action="open-details" data-id="${property.id}">Explore</button>
            <a class="primary-button quick-contact-card" href="${getWhatsAppLink(property, "feed")}" target="_blank" rel="noopener noreferrer">
              <i class="fa-brands fa-whatsapp"></i>
              Contact
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");
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
      <article class="saved-card">
        <div class="card-body">
          <div class="price-row">
            <div>
              <div class="title">${property.title}</div>
              <div class="location">${property.area}</div>
            </div>
            <button class="ghost-button save-button is-saved" data-action="toggle-save" data-id="${property.id}">
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
            <button class="ghost-button" data-action="open-details" data-id="${property.id}">Review</button>
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

function renderFavoritesDrawer() {
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
  state.favorites = exists ? state.favorites.filter((item) => item !== id) : [...state.favorites, id];
  writeStore(STORAGE_KEYS.favorites, state.favorites);
  renderDashboard();
  showToast(exists ? "Removed from shortlist" : "Saved to your shortlist");
}

function incrementView(id) {
  state.views[id] = (state.views[id] || 0) + 1;
  writeStore(STORAGE_KEYS.views, state.views);
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
  els.modalImage.src = property.image;
  els.modalImage.alt = property.title;
  els.modalStats.innerHTML = `
    <span>${property.bedrooms} bed / ${property.bathrooms} bath</span>
    <span>${property.sqft} sqft</span>
    <span>${property.yield}% yield</span>
    <span>${property.growth}% growth</span>
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
  configureAr(property);

  els.propertyModal.classList.add("is-open");
  els.propertyModal.setAttribute("aria-hidden", "false");
  renderDashboard();
}

function closeModal() {
  els.propertyModal.classList.remove("is-open");
  els.propertyModal.setAttribute("aria-hidden", "true");
  state.activePropertyId = null;
  configureAr(null, true);
}

function configureAr(property, reset = false) {
  if (reset) {
    arModule.clear();
    return;
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
  state.notifications = [
    {
      id: Date.now() + 1,
      title: "Viewing request sent",
      message: `Your request for ${property.title} on ${booking.date} at ${booking.time} is now in motion.`,
      createdAt: new Date().toISOString(),
      read: false
    },
    ...state.notifications
  ];

  writeStore(STORAGE_KEYS.bookings, state.bookings);
  writeStore(STORAGE_KEYS.notifications, state.notifications);

  els.bookingStatus.textContent = `Viewing request sent for ${property.title}. Check your alerts for updates.`;
  renderDashboard();
  showToast("Booking request sent");
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
    renderDashboard();
  });

  els.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderDashboard();
  });

  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
      state.filter = button.dataset.filter;
      renderDashboard();
    });
  });

  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      const id = Number(actionTarget.dataset.id);
      const action = actionTarget.dataset.action;
      if (action === "toggle-save") toggleFavorite(id);
      if (action === "open-details") openPropertyModal(id);
    }

    const closeTarget = event.target.closest("[data-close]");
    if (closeTarget) {
      const targetId = closeTarget.dataset.close;
      if (targetId === "propertyModal") closeModal();
      else closeDrawer(targetId);
    }
  });

  els.favoritesButton.addEventListener("click", () => openDrawer("favoritesDrawer"));
  els.notificationsButton.addEventListener("click", () => openDrawer("notificationsDrawer"));

  els.modalSaveAction.addEventListener("click", () => {
    if (state.activePropertyId != null) toggleFavorite(state.activePropertyId);
  });

  els.bookingForm.addEventListener("submit", submitBooking);

  els.propertyModal.addEventListener("click", (event) => {
    if (event.target === els.propertyModal) closeModal();
  });
}

bindEvents();
renderDashboard();
