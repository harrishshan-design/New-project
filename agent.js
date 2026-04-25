const STORAGE_KEYS = {
  agentLeads: "kvai_agent_leads",
  agentClients: "kvai_agent_clients",
  agentListings: "kvai_agent_listings",
  agentNotifications: "kvai_agent_notifications"
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
    enquiries: 18
  },
  {
    id: 202,
    title: "Transit Point Loft",
    area: "Bukit Jalil",
    price: 690000,
    status: "Live",
    enquiries: 24
  },
  {
    id: 203,
    title: "Bangsar Hill Collection",
    area: "Bangsar",
    price: 1430000,
    status: "Reserved",
    enquiries: 9
  }
];

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

const state = {
  section: "overview",
  leadFilter: "all",
  leads: readStore(STORAGE_KEYS.agentLeads, seedLeads),
  clients: readStore(STORAGE_KEYS.agentClients, seedClients),
  listings: readStore(STORAGE_KEYS.agentListings, seedListings),
  notifications: readStore(STORAGE_KEYS.agentNotifications, seedNotifications)
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
  leadPipeline: document.getElementById("leadPipeline"),
  commissionSummary: document.getElementById("commissionSummary"),
  leadList: document.getElementById("leadList"),
  clientList: document.getElementById("clientList"),
  commissionTable: document.getElementById("commissionTable"),
  listingGrid: document.getElementById("listingGrid"),
  notificationButton: document.getElementById("notificationButton"),
  quickLeadButton: document.getElementById("quickLeadButton"),
  openListingComposer: document.getElementById("openListingComposer"),
  notificationDrawer: document.getElementById("notificationDrawer"),
  notificationList: document.getElementById("notificationList"),
  leadModal: document.getElementById("leadModal"),
  listingModal: document.getElementById("listingModal"),
  leadForm: document.getElementById("leadForm"),
  listingForm: document.getElementById("listingForm"),
  leadName: document.getElementById("leadName"),
  leadPhone: document.getElementById("leadPhone"),
  leadArea: document.getElementById("leadArea"),
  leadTemperature: document.getElementById("leadTemperature"),
  listingTitle: document.getElementById("listingTitle"),
  listingArea: document.getElementById("listingArea"),
  listingPrice: document.getElementById("listingPrice"),
  listingStatus: document.getElementById("listingStatus"),
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

function renderWorkspace() {
  renderMetrics();
  renderPipeline();
  renderCommissionSummary();
  renderLeadList();
  renderClientList();
  renderCommissionTable();
  renderListingGrid();
  renderNotifications();
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
  els.listingGrid.innerHTML = state.listings.map((listing) => `
    <article class="listing-card">
      <div class="listing-head">
        <div>
          <div class="listing-title">${listing.title}</div>
          <div class="subtext">${listing.area}</div>
        </div>
        <span class="meta-pill">${listing.status}</span>
      </div>
      <div class="listing-price">${money(listing.price)}</div>
      <div class="meta-row">
        <span class="meta-pill">${listing.enquiries} enquiries</span>
      </div>
      <div class="action-row">
        <button class="ghost-button" data-action="toggle-listing-status" data-id="${listing.id}" type="button">
          <i class="fa-solid fa-repeat"></i>
          Toggle Status
        </button>
      </div>
    </article>
  `).join("");
}

function renderNotifications() {
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
  const listing = {
    id: Date.now(),
    title: els.listingTitle.value.trim(),
    area: els.listingArea.value.trim(),
    price: Number(els.listingPrice.value),
    status: els.listingStatus.value,
    enquiries: 0
  };

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

function persistAll() {
  writeStore(STORAGE_KEYS.agentLeads, state.leads);
  writeStore(STORAGE_KEYS.agentClients, state.clients);
  writeStore(STORAGE_KEYS.agentListings, state.listings);
  writeStore(STORAGE_KEYS.agentNotifications, state.notifications);
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

  els.leadForm.addEventListener("submit", addLead);
  els.listingForm.addEventListener("submit", addListing);

  document.addEventListener("click", (event) => {
    const closeTarget = event.target.closest("[data-close]");
    if (closeTarget) {
      const targetId = closeTarget.dataset.close;
      if (targetId.includes("Drawer")) closeDrawer(targetId);
      else closeModal(targetId);
    }

    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const id = Number(actionTarget.dataset.id);
    const action = actionTarget.dataset.action;
    if (action === "promote-lead") moveLeadForward(id);
    if (action === "toggle-listing-status") toggleListingStatus(id);
  });

  [els.leadModal, els.listingModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal.id);
    });
  });
}

bindEvents();
renderWorkspace();
