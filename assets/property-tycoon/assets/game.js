const COPY = {
  game: "RealityGenius Property Tycoon",
  strapline: "Build a smarter Malaysian property portfolio.",
  nav: [
    ["home", "01", "Command Centre"], ["map", "02", "Klang Valley Map"],
    ["portfolio", "03", "Portfolio"], ["auction", "04", "Auction Night"],
    ["advisor", "05", "RG Genius"], ["missions", "06", "Missions"],
    ["learn", "07", "Learn"], ["rankings", "08", "Rankings"],
    ["achievements", "09", "Achievements"], ["real", "10", "Real Listings"]
  ],
  viewTitles: {
    home: ["Your strategy room", "Command Centre"], map: ["Research before buying", "Klang Valley Market Map"],
    portfolio: ["Performance and risk", "Portfolio Analytics"], auction: ["Virtual bidding practice", "Friday Auction Night"],
    advisor: ["Rule-based portfolio guidance", "RG Genius Advisor"], missions: ["Learn by doing", "Mission Board"],
    learn: ["Short property lessons", "RealityGenius Academy"], rankings: ["Local campaign preview", "Tycoon Rankings"],
    achievements: ["Campaign milestones", "Achievements"], real: ["From simulation to discovery", "Real RealityGenius Listings"],
    admin: ["Local preview mode", "Game Analytics"]
  },
  locations: [
    { id:"klang", name:"Klang", region:"West Selangor", x:.12, y:.58, base:330000, yield:.050, demand:67, risk:"Low", growth:2.7, type:"Terrace House", unlock:1 },
    { id:"shah-alam", name:"Shah Alam", region:"Central Selangor", x:.25, y:.48, base:460000, yield:.047, demand:74, risk:"Low", growth:3.1, type:"Family Apartment", unlock:1 },
    { id:"setia-alam", name:"Setia Alam", region:"North Selangor", x:.20, y:.30, base:520000, yield:.043, demand:77, risk:"Low", growth:3.5, type:"Serviced Residence", unlock:1 },
    { id:"subang-jaya", name:"Subang Jaya", region:"Petaling", x:.36, y:.48, base:620000, yield:.042, demand:82, risk:"Medium", growth:3.7, type:"Condominium", unlock:1 },
    { id:"petaling-jaya", name:"Petaling Jaya", region:"Petaling", x:.46, y:.40, base:720000, yield:.040, demand:87, risk:"Medium", growth:4.1, type:"Condominium", unlock:2 },
    { id:"puchong", name:"Puchong", region:"South Petaling", x:.44, y:.62, base:510000, yield:.046, demand:78, risk:"Medium", growth:3.6, type:"Shoplot", unlock:1 },
    { id:"damansara", name:"Damansara", region:"Petaling", x:.49, y:.28, base:820000, yield:.038, demand:90, risk:"Medium", growth:4.4, type:"Semi-D House", unlock:2 },
    { id:"bangsar", name:"Bangsar", region:"Kuala Lumpur", x:.58, y:.43, base:1050000, yield:.034, demand:92, risk:"Medium", growth:4.5, type:"Bungalow", unlock:3 },
    { id:"mont-kiara", name:"Mont Kiara", region:"Kuala Lumpur", x:.59, y:.25, base:980000, yield:.037, demand:89, risk:"Medium", growth:4.2, type:"Luxury Condo", unlock:3 },
    { id:"klcc", name:"KLCC", region:"Kuala Lumpur", x:.69, y:.38, base:1350000, yield:.032, demand:95, risk:"High", growth:4.8, type:"City Residence", unlock:4 },
    { id:"bukit-bintang", name:"Bukit Bintang", region:"Kuala Lumpur", x:.66, y:.48, base:1180000, yield:.035, demand:93, risk:"High", growth:4.6, type:"Commercial Unit", unlock:4 },
    { id:"cheras", name:"Cheras", region:"Greater KL", x:.72, y:.62, base:490000, yield:.048, demand:79, risk:"Medium", growth:3.4, type:"Apartment", unlock:1 },
    { id:"putrajaya", name:"Putrajaya", region:"Federal Territory", x:.59, y:.78, base:540000, yield:.041, demand:72, risk:"Low", growth:3.0, type:"Development Land", unlock:2 },
    { id:"cyberjaya", name:"Cyberjaya", region:"Sepang", x:.48, y:.83, base:430000, yield:.049, demand:70, risk:"Medium", growth:3.3, type:"Office Space", unlock:1 }
  ],
  events: [
    { code:"MRT", title:"Transit confidence rises", body:"New transport expectations lift demand around connected urban areas.", scope:["petaling-jaya","subang-jaya","cheras"], change:.045, impact:"Selected values +4.5%" },
    { code:"OPR", title:"Financing costs tighten", body:"Higher borrowing costs cool premium demand for one cycle.", scope:["klcc","bangsar","mont-kiara"], change:-.035, impact:"Premium values -3.5%" },
    { code:"JOBS", title:"Digital jobs expansion", body:"Technology hiring supports rental interest in the southern corridor.", scope:["cyberjaya","putrajaya","puchong"], change:.052, impact:"South corridor +5.2%" },
    { code:"SUPPLY", title:"New supply enters", body:"A wave of completions gives tenants more choice in dense districts.", scope:["mont-kiara","klcc","bukit-bintang"], change:-.028, impact:"City values -2.8%" },
    { code:"PORT", title:"West corridor activity", body:"Industrial and logistics demand supports households around Klang.", scope:["klang","shah-alam","setia-alam"], change:.041, impact:"West corridor +4.1%" },
    { code:"SENT", title:"Buyer sentiment improves", body:"Stable confidence creates a broad but measured market lift.", scope:"all", change:.018, impact:"All values +1.8%" },
    { code:"FLOOD", title:"Weather risk review", body:"Buyers reassess selected lower-lying areas and price in resilience work.", scope:["klang","shah-alam","puchong"], change:-.026, impact:"Affected values -2.6%" },
    { code:"SCHOOLS", title:"Family demand strengthens", body:"School access drives interest in established family districts.", scope:["subang-jaya","petaling-jaya","setia-alam"], change:.036, impact:"Family districts +3.6%" },
    { code:"CALM", title:"A steady quarter", body:"No major shock. Good operators focus on rent, upkeep and discipline.", scope:"all", change:.007, impact:"All values +0.7%" },
    { code:"TOUR", title:"Visitor economy rebounds", body:"Central short-stay demand improves, with volatility still visible.", scope:["bukit-bintang","klcc"], change:.047, impact:"Central values +4.7%" },
    { code:"RENO", title:"Renovation costs rise", body:"Upgrades cost more next turn, rewarding portfolios already improved.", scope:"none", change:0, impact:"Upgrade costs +10% next turn", upgradePenalty:true },
    { code:"GREEN", title:"Efficient homes gain attention", body:"Energy-conscious buyers reward upgraded, lower-cost homes.", scope:"upgraded", change:.032, impact:"Upgraded properties +3.2%" }
  ],
  upgrades: [
    { id:"basic", name:"Basic Renovation", cost:.065, rent:.08, value:.04 },
    { id:"interior", name:"Premium Interior", cost:.095, rent:.12, value:.07 },
    { id:"smart", name:"Smart Home", cost:.045, rent:.05, value:.035 },
    { id:"rental", name:"Rental Optimization", cost:.035, rent:.10, value:.02 },
    { id:"solar", name:"Solar Upgrade", cost:.055, rent:.04, value:.045 },
    { id:"luxury", name:"Luxury Renovation", cost:.14, rent:.16, value:.11 }
  ],
  missions: [
    { id:"first", code:"M-01", title:"First keys", body:"Acquire your first virtual property.", reward:60, target:1, type:"properties" },
    { id:"research", code:"M-02", title:"Know the ground", body:"Inspect six Klang Valley locations.", reward:45, target:6, type:"viewed" },
    { id:"diverse", code:"M-03", title:"Spread the risk", body:"Own property in three different locations.", reward:90, target:3, type:"locations" },
    { id:"upgrade", code:"M-04", title:"Improve the asset", body:"Complete two property upgrades.", reward:70, target:2, type:"upgrades" },
    { id:"rent", code:"M-05", title:"Income discipline", body:"Collect RM25,000 in cumulative rent.", reward:100, target:25000, type:"rent" },
    { id:"learn", code:"M-06", title:"Investor literacy", body:"Complete three short lessons.", reward:55, target:3, type:"lessons" }
  ],
  lessons: [
    { id:"yield", title:"Rental yield", body:"Gross yield compares annual rent with purchase price. It is useful, but real returns also depend on vacancy, fees, repairs and financing.", prompt:"Compare yield after costs, not headline rent alone." },
    { id:"dsr", title:"Debt service ratio", body:"DSR compares monthly debt commitments with income. Banks apply their own rules, so a game score is never a loan approval.", prompt:"Leave room for rate changes and life expenses." },
    { id:"tenure", title:"Tenure and title", body:"Freehold, leasehold, strata and individual title affect rights, costs and resale considerations. Verify the actual documents.", prompt:"Ask for title evidence before relying on a label." },
    { id:"risk", title:"Diversification", body:"Owning different locations or property types can reduce concentration, but it cannot remove market, tenant or financing risk.", prompt:"Diversify with a reason, not just a property count." },
    { id:"price", title:"Fair price evidence", body:"Asking price is not transaction evidence. Compare recent, similar, nearby transactions and account for condition and tenure.", prompt:"Treat every estimate as a range, not a promise." },
    { id:"cash", title:"Cash flow first", body:"A property can rise in value and still create monthly stress. Model instalments, service charges, vacancy and maintenance.", prompt:"Protect liquidity before chasing appreciation." }
  ],
  achievements: [
    { id:"first", symbol:"01", title:"First Deed", body:"Own your first virtual property." },
    { id:"three", symbol:"03", title:"Klang Valley Builder", body:"Own three locations." },
    { id:"million", symbol:"1M", title:"Million Ringgit Portfolio", body:"Reach RM1 million in property value." },
    { id:"student", symbol:"RG", title:"Informed Investor", body:"Complete every learning card." },
    { id:"upgrader", symbol:"UP", title:"Asset Improver", body:"Install three upgrades." },
    { id:"winner", symbol:"12", title:"Strategic Tycoon", body:"Win the 12-turn campaign." }
  ],
  fallbackListings: [
    { id:"730277", title:"Double-Storey House, Taman Kim Chuan", location:"Klang", price:710000, bedrooms:4, bathrooms:3, type:"Terrace House", image:"https://tjmvbgdgddscbilfkggu.supabase.co/storage/v1/object/public/property-media/telegram-imports/5430779409/293a5b10-31bf-41c6-aa5b-6c16445bc4af/892acb5dc8faa6ba.jpg" },
    { id:"sample-subang", title:"Subang Family Courtyard", location:"Subang Jaya", price:980000, bedrooms:4, bathrooms:4, type:"Landed Terrace", image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=75" },
    { id:"sample-cyber", title:"Cyberjaya City Residence", location:"Cyberjaya", price:520000, bedrooms:2, bathrooms:2, type:"Serviced Residence", image:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=75" }
  ]
};

const STORE_KEY = "rg_property_tycoon_v1";
const fmt = new Intl.NumberFormat("en-MY", { style:"currency", currency:"MYR", maximumFractionDigits:0 });
const money = value => fmt.format(Math.round(value)).replace("MYR", "RM");
const esc = value => String(value ?? "").replace(/[&<>\"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const byId = id => COPY.locations.find(location => location.id === id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function freshState() {
  return {
    version:1, cash:1000000, points:100, xp:0, turn:1, actionUsed:false, selected:"shah-alam",
    viewed:["shah-alam"], portfolio:{}, factors:Object.fromEntries(COPY.locations.map(location => [location.id, 1])),
    eventIndex:0, eventOrder:shuffleSeeded(COPY.events.map((_, index) => index), 2907), eventLog:[],
    totalRent:0, completedMissions:[], completedLessons:[], achievements:[], history:[1000000],
    chats:[{ role:"ai", text:"I am RG Genius. Ask about yield, risk, cash flow, location balance or your next move." }],
    auction:{ bid:585000, leader:"Nadia K.", playerBid:0 }, ended:false, outcome:null, listingClicks:0
  };
}

function shuffleSeeded(list, seed) {
  const result = [...list];
  let value = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    value = (value * 1664525 + 1013904223) >>> 0;
    const j = value % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    return saved?.version === 1 ? { ...freshState(), ...saved } : freshState();
  } catch { return freshState(); }
}

let state = loadState();
let currentView = location.hash.slice(1) || "home";
let realListings = [];
let toastTimer;
let animationFrame;
let mapHits = [];
let lastGamepad = 0;

function level() { return 1 + Math.floor(state.xp / 250); }
function propertyCount() { return Object.keys(state.portfolio).length; }
function upgradeCount() { return Object.values(state.portfolio).reduce((sum, item) => sum + item.upgrades.length, 0); }
function portfolioValue() { return Object.values(state.portfolio).reduce((sum, item) => sum + item.value, 0); }
function netWorth() { return state.cash + portfolioValue(); }
function annualRent() { return Object.values(state.portfolio).reduce((sum, item) => sum + projectedRent(item), 0); }
function investmentScore(location) {
  const riskPenalty = location.risk === "High" ? 10 : location.risk === "Medium" ? 5 : 0;
  return clamp(Math.round(location.demand * .55 + location.growth * 6 + location.yield * 420 - riskPenalty), 45, 96);
}
function projectedRent(item) {
  const location = byId(item.locationId);
  const multiplier = item.upgrades.reduce((sum, upgradeId) => sum + (COPY.upgrades.find(upgrade => upgrade.id === upgradeId)?.rent || 0), 1);
  return item.value * location.yield * multiplier;
}
function currentPrice(location) { return Math.round(location.base * state.factors[location.id]); }
function averageYield() { return portfolioValue() ? annualRent() / portfolioValue() : 0; }
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function toast(message) {
  const node = document.getElementById("toast");
  node.textContent = message;
  node.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("is-visible"), 2600);
}

function missionProgress(mission) {
  if (mission.type === "properties" || mission.type === "locations") return propertyCount();
  if (mission.type === "viewed") return state.viewed.length;
  if (mission.type === "upgrades") return upgradeCount();
  if (mission.type === "rent") return state.totalRent;
  if (mission.type === "lessons") return state.completedLessons.length;
  return 0;
}

function updateProgress() {
  COPY.missions.forEach(mission => {
    if (!state.completedMissions.includes(mission.id) && missionProgress(mission) >= mission.target) {
      state.completedMissions.push(mission.id);
      state.points += mission.reward;
      state.xp += mission.reward;
      toast(`Mission complete: ${mission.title}. +${mission.reward} points`);
    }
  });
  const earned = [];
  if (propertyCount() >= 1) earned.push("first");
  if (propertyCount() >= 3) earned.push("three");
  if (portfolioValue() >= 1000000) earned.push("million");
  if (state.completedLessons.length === COPY.lessons.length) earned.push("student");
  if (upgradeCount() >= 3) earned.push("upgrader");
  if (state.outcome === "win") earned.push("winner");
  state.achievements = [...new Set([...state.achievements, ...earned])];
  save();
}

function metricsHtml() {
  const metrics = [
    ["Cash", money(state.cash), state.actionUsed ? "Action used" : "Ready to invest"],
    ["Net worth", money(netWorth()), `${Math.round((netWorth()/1000000-1)*100)}% vs start`],
    ["Portfolio", money(portfolioValue()), `${propertyCount()} virtual properties`],
    ["Monthly rent", money(annualRent()/12), `${(averageYield()*100).toFixed(1)}% gross yield`],
    ["RG points", state.points.toLocaleString(), `${state.completedMissions.length}/${COPY.missions.length} missions`],
    ["Investor level", `Level ${level()}`, `${state.xp % 250}/250 XP`]
  ];
  return `<section class="metric-grid" aria-label="Campaign status">${metrics.map(item => `<article class="metric-card"><span>${item[0]}</span><strong>${item[1]}</strong><small>${item[2]}</small></article>`).join("")}</section>`;
}

function navigationHtml(mobile = false) {
  const items = mobile ? [["home","01","Home"],["map","02","Map"],["portfolio","03","Portfolio"],["auction","04","Play"],["rankings","05","Rankings"]] : COPY.nav;
  return items.map(([id, code, label]) => `<button class="nav-button ${currentView === id ? "is-active" : ""}" data-action="nav" data-view="${id}" aria-label="Open ${label}"><span class="nav-code">${code}</span>${label}</button>`).join("");
}

function render() {
  if (!COPY.viewTitles[currentView] || (currentView === "admin" && !new URLSearchParams(location.search).has("admin"))) currentView = "home";
  cancelAnimationFrame(animationFrame);
  const [eyebrow, title] = COPY.viewTitles[currentView];
  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      <aside class="side-nav">
        <a class="brand" href="https://realitygenius.company" aria-label="RealityGenius home"><span class="brand-mark">RG</span><span class="brand-copy"><strong>RealityGenius</strong><span>Property Tycoon</span></span></a>
        <div class="nav-label">Play and analyse</div><div class="nav-stack">${navigationHtml()}</div>
        ${new URLSearchParams(location.search).has("admin") ? `<div class="nav-label">Operator</div><div class="nav-stack"><button class="nav-button ${currentView === "admin" ? "is-active" : ""}" data-action="nav" data-view="admin"><span class="nav-code">A</span>Analytics Preview</button></div>` : ""}
        <div class="side-footer"><a href="https://realitygenius.company/user.html">Browse real homes</a><button class="reset-button" data-action="confirm-reset">Restart campaign</button></div>
      </aside>
      <main class="main-shell">
        <header class="topbar"><div class="page-title"><span>${eyebrow}</span><strong>${title}</strong></div><div class="turn-control"><span class="turn-pill">Turn ${state.turn} of 12</span><button class="secondary-action desktop-advisor" data-action="nav" data-view="advisor">Ask RG Genius</button><button class="secondary-action menu-action" data-action="open-menu">Menu</button><button class="primary-action" data-action="end-turn" ${state.ended ? "disabled" : ""}>End turn</button></div></header>
        ${metricsHtml()}<section class="view is-active" id="view-${currentView}">${viewHtml(currentView)}</section>
      </main>
      <nav class="bottom-nav" aria-label="Game navigation">${navigationHtml(true)}</nav>
    </div>
    <div class="modal-backdrop" id="gameModal" role="dialog" aria-modal="true"><div class="modal-card" id="modalCard"></div></div>`;
  bindRenderedView();
  updateDevOverlay();
}

function viewHtml(view) {
  const views = { home:homeHtml, map:mapHtml, portfolio:portfolioHtml, auction:auctionHtml, advisor:advisorHtml, missions:missionsHtml, learn:learnHtml, rankings:rankingsHtml, achievements:achievementsHtml, real:realHtml, admin:adminHtml };
  return views[view]();
}

function homeHtml() {
  const next = COPY.missions.find(mission => !state.completedMissions.includes(mission.id)) || COPY.missions.at(-1);
  const progress = clamp(missionProgress(next) / next.target * 100, 0, 100);
  const advice = propertyCount() === 0 ? "Start with an affordable, higher-yield district. Inspect Klang, Shah Alam or Cyberjaya before choosing." : averageYield() < .04 ? "Your portfolio leans toward lower yield. Keep enough cash and compare a balanced income district." : "Your income base is healthy. The next test is location concentration and upgrade efficiency.";
  return `<div class="dashboard-grid">
    <article class="panel hero-panel"><div class="hero-orbit"></div><div class="hero-content"><span class="hero-kicker">12-turn Malaysian property strategy</span><h1>Build Your<br>Property Empire.</h1><p>Explore Malaysia. Invest virtually. Learn property strategy. Discover real opportunities. No signup and no real money.</p><div class="hero-actions"><button class="primary-action" data-action="nav" data-view="map">Start Building</button><button class="secondary-action" data-action="nav" data-view="map">Explore Malaysia</button></div></div></article>
    <div><article class="panel mission-card"><span class="hero-kicker">Next mission</span><h3>${next.title}</h3><p>${next.body}</p><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div><div class="mission-meta"><span>${Math.min(missionProgress(next),next.target).toLocaleString()} / ${next.target.toLocaleString()}</span><span>+${next.reward} RG points</span></div></article><article class="advisor-mini"><strong>RG Genius says</strong><p>${advice}</p></article></div>
  </div>
  <div class="panel panel-pad" style="margin-top:14px"><div class="panel-head"><div><span>Latest market signal</span><h2>${state.eventLog[0]?.title || "A clean slate"}</h2><p>${state.eventLog[0]?.body || "Your campaign begins with RM1 million virtual cash. Market events start after your first turn."}</p></div><div class="panel-actions"><button class="secondary-action" data-action="nav" data-view="portfolio">View analytics</button></div></div>${state.eventLog.slice(0,3).map(eventCardHtml).join("")}</div>`;
}

function locationPanelHtml(location) {
  const owned = state.portfolio[location.id];
  const unlocked = location.unlock <= level();
  const price = currentPrice(location);
  return `<article class="panel location-panel"><span class="hero-kicker">${unlocked ? "Market available" : `Unlocks at level ${location.unlock}`}</span><h2>${location.name}</h2><div class="region">${location.region} - ${location.type}</div><div class="score-ring"><div><strong>${investmentScore(location)}</strong><span>AI game score</span></div></div><div class="location-stats"><div class="location-stat"><span>Market price</span><strong>${money(price)}</strong></div><div class="location-stat"><span>Gross yield</span><strong>${(location.yield*100).toFixed(1)}%</strong></div><div class="location-stat"><span>Demand / growth</span><strong>${location.demand} / ${location.growth.toFixed(1)}%</strong></div><div class="location-stat"><span>Risk</span><strong class="risk-${location.risk.toLowerCase()}">${location.risk}</strong></div></div><div class="location-actions">${owned ? `<button class="primary-action" data-action="upgrade" data-location="${location.id}">Improve property</button>` : `<button class="primary-action" data-action="buy" data-location="${location.id}" ${!unlocked || state.actionUsed || state.cash < price || state.ended ? "disabled" : ""}>Buy for ${money(price)}</button>`}<button class="secondary-action" data-action="real-area" data-location="${location.id}">Explore Real Properties</button></div><p class="location-note">Virtual market data is simplified for education. It is not a valuation, forecast or investment recommendation.</p></article>`;
}

function mapHtml() {
  const selected = byId(state.selected);
  return `<div class="location-strip">${COPY.locations.map(location => `<button class="location-chip ${state.selected === location.id ? "is-active" : ""}" data-action="select" data-location="${location.id}">${location.name}</button>`).join("")}</div><div class="map-layout"><article class="panel map-stage"><div class="map-toolbar"><button class="is-active">Demand</button><button>Yield</button><button>Risk</button></div><canvas id="mapCanvas" aria-label="Interactive Klang Valley property market map"></canvas><div class="map-legend"><span><i class="legend-dot" style="background:#4bd299"></i>Owned</span><span><i class="legend-dot" style="background:#4dd7e7"></i>Available</span><span><i class="legend-dot" style="background:#596d65"></i>Level locked</span><span>Tap any district to inspect</span></div></article>${locationPanelHtml(selected)}</div>`;
}

function propertyCardHtml(item) {
  const location = byId(item.locationId);
  const nextUpgrade = COPY.upgrades.find(upgrade => !item.upgrades.includes(upgrade.id));
  return `<article class="property-card"><span class="type">${location.type}</span><h3>${location.name}</h3><div class="sub">Purchased ${money(item.purchasePrice)} - Turn ${item.turnBought}</div><div class="property-numbers"><div><span>Current value</span><strong>${money(item.value)}</strong></div><div><span>Annual rent</span><strong>${money(projectedRent(item))}</strong></div><div><span>Growth since buy</span><strong>${((item.value/item.purchasePrice-1)*100).toFixed(1)}%</strong></div><div><span>Gross yield</span><strong>${(projectedRent(item)/item.value*100).toFixed(1)}%</strong></div></div><div class="upgrade-row">${item.upgrades.length ? item.upgrades.map(id => `<span class="upgrade-badge">${COPY.upgrades.find(upgrade => upgrade.id === id)?.name}</span>`).join("") : `<span class="upgrade-badge">Original condition</span>`}</div><div class="card-actions"><button class="secondary-action" data-action="select-nav" data-location="${location.id}">Inspect area</button><button class="primary-action" data-action="upgrade" data-location="${location.id}" ${!nextUpgrade || state.actionUsed || state.ended ? "disabled" : ""}>${nextUpgrade ? "Upgrade" : "Fully improved"}</button></div></article>`;
}

function portfolioHtml() {
  const holdings = Object.values(state.portfolio);
  const maxValue = Math.max(...holdings.map(item => item.value), 1);
  const invested = holdings.reduce((sum,item) => sum + item.purchasePrice,0);
  return `<div class="metric-grid"><article class="metric-card"><span>Total investment</span><strong>${money(invested)}</strong><small>Virtual purchase basis</small></article><article class="metric-card"><span>Capital gain</span><strong>${money(portfolioValue()-invested)}</strong><small>Unrealised game value</small></article><article class="metric-card"><span>Monthly rent</span><strong>${money(annualRent()/12)}</strong><small>Gross projection</small></article><article class="metric-card"><span>Average yield</span><strong>${(averageYield()*100).toFixed(1)}%</strong><small>Before costs</small></article><article class="metric-card"><span>Diversification</span><strong>${propertyCount()}/3</strong><small>Campaign target</small></article><article class="metric-card"><span>Upgrades</span><strong>${upgradeCount()}</strong><small>Completed improvements</small></article></div><div class="chart-grid"><article class="panel chart-panel"><div class="panel-head"><div><span>Campaign history</span><h2>Net worth trajectory</h2><p>Cash plus current virtual property values after each turn.</p></div></div><canvas id="portfolioChart" aria-label="Net worth history chart"></canvas></article><article class="panel chart-panel"><div class="panel-head"><div><span>Concentration</span><h2>Location allocation</h2></div></div><div class="allocation-list">${holdings.length ? holdings.map(item => `<div class="allocation-row"><span>${byId(item.locationId).name}</span><div class="allocation-bar"><span style="width:${item.value/maxValue*100}%"></span></div><strong>${Math.round(item.value/Math.max(portfolioValue(),1)*100)}%</strong></div>`).join("") : `<div class="empty-state"><strong>No holdings yet</strong><p>Buy your first virtual property to build the allocation view.</p></div>`}</div></article></div><div class="panel panel-pad"><div class="panel-head"><div><span>Virtual holdings</span><h2>${propertyCount()} properties under management</h2><p>Upgrade strategically. Every acquisition or improvement uses your action for the turn.</p></div><div class="panel-actions"><button class="primary-action" data-action="nav" data-view="map">Research market</button></div></div>${holdings.length ? `<div class="property-grid">${holdings.map(propertyCardHtml).join("")}</div>` : `<div class="empty-state"><strong>Your portfolio is ready for its first decision.</strong><p>Explore the map, compare price, yield, demand and risk, then acquire one property.</p><button class="primary-action" data-action="nav" data-view="map">Open market map</button></div>`}</div>`;
}

function eventCardHtml(event) {
  return `<article class="event-card"><div class="event-icon">${event.code}</div><div><h3>${event.title}</h3><p>${event.body}</p><span class="event-impact">${event.impact}</span></div></article>`;
}

function auctionHtml() {
  const virtualProperty = byId("petaling-jaya");
  return `<div class="real-notice"><strong>Simulation only:</strong> bids use virtual campaign cash. No real property is offered, reserved or sold in this game.</div><div class="auction-grid"><article class="panel auction-visual"><span class="hero-kicker">Friday Auction Night practice</span><div class="countdown" id="auctionCountdown">Loading...</div><p>Practice bidding discipline on a virtual Petaling Jaya condominium. The highest offer is still subject to owner approval and the real legal process outside this game.</p></article><article class="panel auction-bid"><div class="panel-head"><div><span>Virtual lot A-17</span><h2>${virtualProperty.name} condominium</h2></div></div><div class="bid-line"><span>Guide price</span><strong>${money(560000)}</strong></div><div class="bid-line"><span>AI game value</span><strong>${money(610000)}</strong></div><div class="bid-line"><span>Potential gross yield</span><strong>4.1%</strong></div><div class="bid-line"><span>Current virtual bid</span><strong>${money(state.auction.bid)}</strong></div><div class="bid-line"><span>Current leader</span><strong>${esc(state.auction.leader)}</strong></div><div class="bid-actions"><button class="secondary-action" data-action="bid" data-amount="5000">Bid +RM5k</button><button class="primary-action" data-action="bid" data-amount="15000">Bid +RM15k</button></div><button class="secondary-action" style="width:100%;margin-top:8px" data-action="settle-auction" ${state.auction.leader !== "You" || state.actionUsed || state.portfolio[virtualProperty.id] ? "disabled" : ""}>Win practice lot now</button><p class="location-note">Winning a bid means the buyer submitted the highest offer. Final purchase remains subject to owner approval, booking fee, loan eligibility, agreement terms and legal documentation.</p></article></div><div class="panel panel-pad" style="margin-top:12px"><div class="panel-head"><div><span>Decision practice</span><h2>Do not let urgency replace a limit.</h2><p>Auction interfaces can increase excitement. Set an evidence-based ceiling before bidding and keep financing, repair and legal costs visible.</p></div><button class="secondary-action" data-action="nav" data-view="learn">Review fair price lesson</button></div></div>`;
}

function advisorResponse(question) {
  const q = question.toLowerCase();
  if (q.includes("yield") || q.includes("rent")) return `Your projected gross yield is ${(averageYield()*100).toFixed(1)}%. Gross yield excludes financing, vacancy, fees and maintenance, so keep it as a comparison tool rather than a promised return.`;
  if (q.includes("risk") || q.includes("divers")) return propertyCount() < 3 ? "You currently have concentration risk. Compare an affordable district with different demand drivers, but do not buy purely to increase the property count." : "You have location spread. Now compare how much portfolio value sits in one district and whether your cash buffer can absorb vacancy.";
  if (q.includes("cash") || q.includes("buy") || q.includes("next")) return state.cash < 350000 ? `Your virtual cash is ${money(state.cash)}. Protect liquidity and prefer a targeted upgrade or rent collection before another acquisition.` : `You have ${money(state.cash)} available. Inspect at least three unlocked districts and compare price, yield, risk and the portfolio concentration created by each choice.`;
  if (q.includes("location") || q.includes("area")) return "There is no universally best location. In this simulation, established districts score higher on demand while outer districts can offer more yield. Match the district to the portfolio gap you are solving.";
  if (q.includes("win") || q.includes("target")) return `Finish turn 12 with at least ${money(1250000)} net worth and holdings in three locations. You are at ${money(netWorth())} with ${propertyCount()} locations.`;
  return "I can help with yield, risk, cash flow, location balance, campaign targets or your next move. My answers explain the simulation and are not financial advice.";
}

function advisorHtml() {
  const topHolding = Object.values(state.portfolio).sort((a,b) => b.value-a.value)[0];
  return `<div class="advisor-layout"><article class="panel chat-panel"><div class="panel-head panel-pad" style="margin:0;border-bottom:1px solid var(--line)"><div><span>RG Genius</span><h2>Portfolio conversation</h2><p>Ask in plain language. Advice is based only on your local game state.</p></div></div><div class="chat-log" id="chatLog">${state.chats.map(message => `<div class="chat-message ${message.role}">${esc(message.text)}</div>`).join("")}</div><form class="chat-form" id="chatForm"><input id="chatInput" maxlength="180" autocomplete="off" placeholder="Ask about risk, yield or my next move" aria-label="Ask RG Genius"><button class="primary-action" type="submit">Ask</button></form></article><aside class="panel advisor-insights"><div class="panel-head"><div><span>Live diagnosis</span><h3>Portfolio signals</h3></div></div><div class="insight"><span>Liquidity</span><strong>${state.cash/netWorth() > .25 ? "Healthy cash flexibility" : "Cash buffer needs attention"}</strong></div><div class="insight"><span>Concentration</span><strong>${propertyCount() >= 3 ? "Location spread achieved" : `${3-propertyCount()} more locations to target`}</strong></div><div class="insight"><span>Income</span><strong>${money(annualRent())} projected gross annual rent</strong></div><div class="insight"><span>Largest holding</span><strong>${topHolding ? `${byId(topHolding.locationId).name} - ${money(topHolding.value)}` : "No property acquired"}</strong></div><div class="insight"><span>Campaign goal</span><strong>${money(1250000)} net worth and 3 locations</strong></div></aside></div>`;
}

function missionsHtml() {
  return `<div class="panel panel-pad"><div class="panel-head"><div><span>Active campaign</span><h2>Complete decisions, not chores.</h2><p>Missions reward research, income, improvement and diversification. Points do not have cash value.</p></div></div><div class="mission-grid">${COPY.missions.map(mission => { const value = missionProgress(mission); const complete = state.completedMissions.includes(mission.id); return `<article class="mission-item ${complete ? "is-complete" : ""}"><span class="mission-code">${complete ? "COMPLETE" : mission.code}</span><h3>${mission.title}</h3><p>${mission.body}</p><div class="progress-track"><div class="progress-fill" style="width:${clamp(value/mission.target*100,0,100)}%"></div></div><div class="mission-meta"><span>${Math.min(value,mission.target).toLocaleString()} / ${mission.target.toLocaleString()}</span></div><span class="reward">${complete ? "Reward collected" : `+${mission.reward} RG points`}</span></article>`; }).join("")}</div></div>`;
}

function learnHtml() {
  return `<div class="panel panel-pad"><div class="panel-head"><div><span>Six practical primers</span><h2>Make the numbers less intimidating.</h2><p>Complete each one-minute lesson. The game simplifies property decisions; real purchases require verified documents and professional advice.</p></div></div><div class="lesson-grid">${COPY.lessons.map((lesson,index) => { const done = state.completedLessons.includes(lesson.id); return `<article class="lesson-card ${done ? "is-complete" : ""}"><span class="lesson-number">LESSON ${String(index+1).padStart(2,"0")}</span><h3>${lesson.title}</h3><p>${lesson.body}</p><button class="${done ? "secondary-action" : "primary-action"}" data-action="lesson" data-lesson="${lesson.id}">${done ? "Completed" : "Complete lesson"}</button></article>`; }).join("")}</div></div>`;
}

function rankingsHtml() {
  const players = [
    { name:"Aina", title:"Yield Architect", value:1542000, points:820 },
    { name:"Marcus", title:"Transit Strategist", value:1438000, points:760 },
    { name:"Farah", title:"Cash Flow Builder", value:1361000, points:690 },
    { name:"You", title:`Level ${level()} Investor`, value:netWorth(), points:state.points, player:true },
    { name:"Jian Wei", title:"Value Scout", value:1108000, points:530 },
    { name:"Nadia", title:"Auction Analyst", value:1047000, points:490 }
  ].sort((a,b) => b.value-a.value);
  return `<div class="real-notice">Rankings are a local campaign preview with fictional players. Online competition and prize mechanics are not active.</div><div class="leader-grid">${players.map((player,index) => `<article class="leader-card ${player.player ? "is-player" : ""}"><div class="rank-number">${index+1}</div><div><h3>${player.name}</h3><p>${player.title}</p></div><div class="leader-value"><strong>${money(player.value)}</strong><span>${player.points} points</span></div></article>`).join("")}</div>`;
}

function achievementsHtml() {
  return `<div class="panel panel-pad"><div class="panel-head"><div><span>Campaign collection</span><h2>${state.achievements.length} of ${COPY.achievements.length} earned</h2><p>Achievements stay on this device with your saved campaign.</p></div></div><div class="achievement-grid">${COPY.achievements.map(achievement => { const earned = state.achievements.includes(achievement.id); return `<article class="achievement-card ${earned ? "is-earned" : "is-locked"}"><div class="achievement-symbol">${achievement.symbol}</div><h3>${achievement.title}</h3><p>${achievement.body}</p></article>`; }).join("")}</div></div>`;
}

function normalizeListing(raw, index) {
  const imageValue = raw.image_url || raw.image || raw.cover_image || raw.images?.[0] || raw.photos?.[0];
  return {
    id: raw.id || raw.property_id || `listing-${index}`,
    title: raw.title || raw.property_title || "Malaysian property listing",
    location: raw.location || raw.city || raw.area || raw.address || "Klang Valley",
    price: Number(raw.price || raw.asking_price || 0),
    bedrooms: raw.bedrooms ?? raw.beds ?? "-", bathrooms: raw.bathrooms ?? raw.baths ?? "-",
    type: raw.property_type || raw.type || "Property", agent: raw.agent_name || raw.agent?.name || "RealityGenius agent",
    image: typeof imageValue === "string" ? imageValue : imageValue?.url
  };
}

function realCardHtml(listing) {
  const id = encodeURIComponent(listing.id);
  const match = clamp(70 + investmentScore(byId(state.selected)) - 62, 70, 96);
  const message = encodeURIComponent(`Hi RealityGenius, I discovered ${listing.title} through Property Tycoon and would like verified details.`);
  return `<article class="real-card">${listing.image ? `<img src="${esc(listing.image)}" alt="${esc(listing.title)}" loading="lazy">` : ""}<div class="real-card-body"><span class="real-tag">Real listing - ${match}% area match</span><h3>${esc(listing.title)}</h3><p>${esc(listing.location)} - ${esc(listing.agent || "RealityGenius agent")}</p><div class="real-facts"><strong>${listing.price ? money(listing.price) : "Price on request"}</strong><span>${esc(listing.bedrooms)} beds</span><span>${esc(listing.bathrooms)} baths</span><span>${esc(listing.type)}</span></div><div class="real-actions"><a class="secondary-action" data-action="listing-click" href="https://realitygenius.company/property/${id}" target="_top">View</a><a class="secondary-action" data-action="listing-click" href="https://wa.me/60189676625?text=${message}" target="_blank" rel="noopener">WhatsApp</a><a class="primary-action" data-action="listing-click" href="https://realitygenius.company/user.html?listing=${id}&action=booking" target="_top">Book viewing</a></div></div></article>`;
}

function realHtml() {
  const selected = byId(state.selected);
  const source = realListings.length ? realListings : COPY.fallbackListings;
  const filtered = source.filter(listing => String(listing.location).toLowerCase().includes(selected.name.toLowerCase()));
  const shown = (filtered.length ? filtered : source).slice(0,6);
  return `<div class="real-notice"><strong>Reality check:</strong> the game uses simplified virtual figures. Cards below link to separate real listings. Verify listing status, REN details, title, price evidence, financing and legal documents before making a decision. Returns are never guaranteed.</div><div class="panel panel-pad"><div class="panel-head"><div><span>Selected area: ${selected.name}</span><h2>Continue with real market discovery.</h2><p>${filtered.length ? `Showing available matches around ${selected.name}.` : `No exact ${selected.name} match is loaded, so here are current sample listings from RealityGenius.`}</p></div><div class="panel-actions"><button class="secondary-action" data-action="nav" data-view="map">Change area</button><a class="primary-action" href="https://realitygenius.company/user.html">Search all homes</a></div></div><div class="real-grid">${shown.map(realCardHtml).join("")}</div></div>`;
}

function adminHtml() {
  const sessions = Number(localStorage.getItem("rg_tycoon_sessions") || 1);
  return `<div class="admin-grid"><article class="metric-card"><span>Local sessions</span><strong>${sessions}</strong><small>Device only</small></article><article class="metric-card"><span>Campaign turn</span><strong>${state.turn}</strong><small>${state.ended ? "Completed" : "In progress"}</small></article><article class="metric-card"><span>Real listing clicks</span><strong>${state.listingClicks}</strong><small>Device only</small></article><article class="metric-card"><span>Lessons completed</span><strong>${state.completedLessons.length}</strong><small>of ${COPY.lessons.length}</small></article></div><article class="panel panel-pad" style="margin-top:12px"><div class="panel-head"><div><span>Operator preview</span><h2>Campaign event audit</h2><p>This launch stores gameplay locally. Production-wide analytics, accounts and multiplayer need a separate consented backend.</p></div></div><table class="admin-table"><thead><tr><th>Turn</th><th>Signal</th><th>Effect</th></tr></thead><tbody>${state.eventLog.length ? state.eventLog.map(event => `<tr><td>${event.turn}</td><td>${event.title}</td><td>${event.impact}</td></tr>`).join("") : `<tr><td colspan="3">No turns completed yet.</td></tr>`}</tbody></table><div class="admin-actions"><button class="danger-action" data-action="confirm-reset">Reset local campaign</button><button class="secondary-action" data-action="export">Export local JSON</button></div></article>`;
}

function selectLocation(locationId, navigate = false) {
  state.selected = locationId;
  if (!state.viewed.includes(locationId)) {
    state.viewed.push(locationId);
    state.xp += 8;
  }
  updateProgress();
  if (navigate) currentView = "map";
  render();
}

function buyProperty(locationId) {
  const location = byId(locationId);
  const price = currentPrice(location);
  if (state.ended) return toast("This campaign is complete. Restart to make new decisions.");
  if (state.actionUsed) return toast("You have used this turn's action. End the turn to continue.");
  if (location.unlock > level()) return toast(`Reach investor level ${location.unlock} to unlock ${location.name}.`);
  if (state.portfolio[locationId]) return toast("You already own this virtual location.");
  if (state.cash < price) return toast("Not enough virtual cash for this acquisition.");
  state.cash -= price;
  state.portfolio[locationId] = { locationId, purchasePrice:price, value:price, upgrades:[], turnBought:state.turn };
  state.actionUsed = true;
  state.xp += 45;
  state.points += 25;
  updateProgress();
  toast(`${location.name} added to your virtual portfolio.`);
  render();
}

function openUpgradeModal(locationId) {
  const item = state.portfolio[locationId];
  if (!item) return toast("Acquire this virtual property before improving it.");
  const available = COPY.upgrades.filter(upgrade => !item.upgrades.includes(upgrade.id));
  if (!available.length) return toast("This property already has every available upgrade.");
  const penalty = state.eventLog[0]?.upgradePenalty && state.eventLog[0]?.turn === state.turn - 1 ? 1.1 : 1;
  openModal(`<span class="hero-kicker">Property improvement</span><h2>Upgrade ${byId(locationId).name}</h2><p>Each upgrade uses the current turn action. Costs and effects are simplified virtual assumptions.</p><div class="lesson-grid">${available.map(upgrade => { const cost = Math.round(item.purchasePrice * upgrade.cost * penalty); return `<article class="lesson-card"><span class="lesson-number">${money(cost)}</span><h3>${upgrade.name}</h3><p>Rent +${Math.round(upgrade.rent*100)}% - Value +${Math.round(upgrade.value*100)}%</p><button class="primary-action" data-action="apply-upgrade" data-location="${locationId}" data-upgrade="${upgrade.id}" ${state.actionUsed || state.cash < cost || state.ended ? "disabled" : ""}>Install upgrade</button></article>`; }).join("")}</div><div class="modal-actions"><button class="secondary-action" data-action="close-modal">Cancel</button></div>`);
}

function applyUpgrade(locationId, upgradeId) {
  const item = state.portfolio[locationId];
  const upgrade = COPY.upgrades.find(entry => entry.id === upgradeId);
  if (!item || !upgrade || item.upgrades.includes(upgradeId) || state.actionUsed || state.ended) return;
  const penalty = state.eventLog[0]?.upgradePenalty && state.eventLog[0]?.turn === state.turn - 1 ? 1.1 : 1;
  const cost = Math.round(item.purchasePrice * upgrade.cost * penalty);
  if (state.cash < cost) return toast("Not enough virtual cash for this upgrade.");
  state.cash -= cost;
  item.value = Math.round(item.value * (1 + upgrade.value));
  item.upgrades.push(upgradeId);
  state.actionUsed = true;
  state.xp += 30;
  closeModal();
  updateProgress();
  toast(`${upgrade.name} installed in ${byId(locationId).name}.`);
  render();
}

function applyMarketEvent() {
  const event = COPY.events[state.eventOrder[state.eventIndex % state.eventOrder.length]];
  state.eventIndex += 1;
  const applies = locationId => event.scope === "all" || (Array.isArray(event.scope) && event.scope.includes(locationId));
  COPY.locations.forEach(location => {
    let change = applies(location.id) ? event.change : 0;
    if (event.scope === "upgraded" && state.portfolio[location.id]?.upgrades.length) change = event.change;
    if (change) state.factors[location.id] = clamp(state.factors[location.id] * (1 + change), .72, 1.55);
    if (state.portfolio[location.id] && change) state.portfolio[location.id].value = Math.round(state.portfolio[location.id].value * (1 + change));
  });
  state.eventLog.unshift({ ...event, turn:state.turn });
  return event;
}

function endTurn() {
  if (state.ended) return showOutcome();
  const rent = Math.round(annualRent() / 12);
  state.cash += rent;
  state.totalRent += rent;
  const event = applyMarketEvent();
  state.xp += 18;
  state.points += 10;
  state.history.push(netWorth());
  if (state.turn >= 12) {
    state.ended = true;
    state.outcome = netWorth() >= 1250000 && propertyCount() >= 3 ? "win" : "developing";
    updateProgress();
    save();
    render();
    showOutcome();
    return;
  }
  state.turn += 1;
  state.actionUsed = false;
  updateProgress();
  toast(`${money(rent)} rent collected. Market signal: ${event.title}.`);
  render();
}

function showOutcome() {
  const won = state.outcome === "win";
  openModal(`<span class="hero-kicker">Campaign complete</span><div class="outcome-score">${money(netWorth())}</div><h2>${won ? "Strategic Tycoon" : "A portfolio still developing"}</h2><p>${won ? "You reached the net worth target with location diversity. The strongest result is the discipline you used to get there." : `You finished with ${propertyCount()} locations. The target was ${money(1250000)} net worth and three locations. Review cash use, concentration and timing, then try a new strategy.`}</p><div class="modal-actions"><button class="secondary-action" data-action="close-modal">Review portfolio</button><button class="primary-action" data-action="reset">Play again</button></div>`);
}

function placeBid(amount) {
  if (state.ended) return toast("Restart the campaign to place more virtual bids.");
  const nextBid = state.auction.bid + amount;
  if (nextBid > state.cash) return toast("Your virtual cash cannot cover that practice bid.");
  state.auction.bid = nextBid;
  state.auction.playerBid = nextBid;
  state.auction.leader = "You";
  state.points += 2;
  save();
  toast(`Virtual bid placed at ${money(nextBid)}. No real offer was submitted.`);
  render();
}

function settleAuction() {
  const location = byId("petaling-jaya");
  if (state.auction.leader !== "You" || !state.auction.playerBid || state.actionUsed || state.portfolio[location.id] || state.cash < state.auction.playerBid) return;
  state.cash -= state.auction.playerBid;
  state.portfolio[location.id] = { locationId:location.id, purchasePrice:state.auction.playerBid, value:state.auction.playerBid, upgrades:[], turnBought:state.turn };
  state.actionUsed = true;
  state.points += 120;
  state.xp += 75;
  updateProgress();
  toast("Practice auction won. Petaling Jaya joined your virtual portfolio.");
  render();
}

function completeLesson(lessonId) {
  if (state.completedLessons.includes(lessonId)) return;
  const lesson = COPY.lessons.find(entry => entry.id === lessonId);
  state.completedLessons.push(lessonId);
  state.xp += 20;
  state.points += 15;
  updateProgress();
  render();
  openModal(`<span class="hero-kicker">Lesson complete</span><h2>${lesson.title}</h2><p>${lesson.prompt}</p><div class="modal-actions"><button class="primary-action" data-action="close-modal">Continue</button></div>`);
}

function openModal(html) {
  const backdrop = document.getElementById("gameModal");
  if (!backdrop) return;
  document.getElementById("modalCard").innerHTML = html;
  backdrop.classList.add("is-open");
  backdrop.querySelector("button")?.focus();
}

function closeModal() { document.getElementById("gameModal")?.classList.remove("is-open"); }
function confirmReset() {
  openModal(`<span class="hero-kicker">Start over</span><h2>Restart this campaign?</h2><p>Your local portfolio, missions and turn history will be cleared. Real RealityGenius account data is not affected.</p><div class="modal-actions"><button class="secondary-action" data-action="close-modal">Keep playing</button><button class="danger-action" data-action="reset">Restart</button></div>`);
}
function openMobileMenu() {
  const items = COPY.nav.filter(item => ["advisor","missions","auction","learn","achievements","real"].includes(item[0]));
  openModal(`<span class="hero-kicker">More game tools</span><h2>Choose a section</h2><div class="nav-stack">${items.map(([id,code,label]) => `<button class="nav-button" data-action="modal-nav" data-view="${id}" aria-label="Open ${label}"><span class="nav-code">${code}</span>${label}</button>`).join("")}<a class="nav-button" href="https://realitygenius.company/login.html?role=user"><span class="nav-code">P</span>RealityGenius Profile</a></div><div class="modal-actions"><button class="secondary-action" data-action="close-modal">Close</button></div>`);
}
function resetGame() {
  state = freshState();
  save();
  currentView = "home";
  render();
  toast("New virtual campaign started.");
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type:"application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "realitygenius-property-tycoon-campaign.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function navigate(view) {
  currentView = view;
  history.replaceState(null, "", `#${view}`);
  render();
  scrollTo({ top:0, behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function handleAction(target) {
  const action = target.dataset.action;
  if (!action) return;
  if (action === "nav") navigate(target.dataset.view);
  if (action === "modal-nav") { closeModal(); navigate(target.dataset.view); }
  if (action === "open-menu") openMobileMenu();
  if (action === "select") selectLocation(target.dataset.location);
  if (action === "select-nav") selectLocation(target.dataset.location, true);
  if (action === "real-area") { state.selected = target.dataset.location; save(); navigate("real"); }
  if (action === "buy") buyProperty(target.dataset.location);
  if (action === "upgrade") openUpgradeModal(target.dataset.location);
  if (action === "apply-upgrade") applyUpgrade(target.dataset.location, target.dataset.upgrade);
  if (action === "end-turn") endTurn();
  if (action === "bid") placeBid(Number(target.dataset.amount));
  if (action === "settle-auction") settleAuction();
  if (action === "lesson") completeLesson(target.dataset.lesson);
  if (action === "confirm-reset") confirmReset();
  if (action === "reset") resetGame();
  if (action === "close-modal") closeModal();
  if (action === "export") exportState();
  if (action === "listing-click") { state.listingClicks += 1; state.points += 3; save(); }
}

function bindRenderedView() {
  if (currentView === "map") setupMap();
  if (currentView === "portfolio") drawPortfolioChart();
  if (currentView === "auction") startCountdown();
  if (currentView === "advisor") {
    const log = document.getElementById("chatLog");
    if (log) log.scrollTop = log.scrollHeight;
  }
}

document.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target || target.tagName === "A") {
    if (target?.dataset.action === "listing-click") handleAction(target);
    return;
  }
  handleAction(target);
});

document.addEventListener("submit", event => {
  if (event.target.id !== "chatForm") return;
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const question = input.value.trim();
  if (!question) return;
  state.chats.push({ role:"user", text:question }, { role:"ai", text:advisorResponse(question) });
  state.chats = state.chats.slice(-12);
  save();
  render();
});

window.addEventListener("keydown", event => {
  if (event.target.matches("input")) return;
  const index = COPY.locations.findIndex(location => location.id === state.selected);
  if (["ArrowRight","ArrowDown","KeyD","KeyS"].includes(event.code)) { event.preventDefault(); selectLocation(COPY.locations[(index+1)%COPY.locations.length].id, currentView === "map"); }
  if (["ArrowLeft","ArrowUp","KeyA","KeyW"].includes(event.code)) { event.preventDefault(); selectLocation(COPY.locations[(index-1+COPY.locations.length)%COPY.locations.length].id, currentView === "map"); }
  if (["Enter","Space"].includes(event.code) && currentView === "map") { event.preventDefault(); state.portfolio[state.selected] ? openUpgradeModal(state.selected) : buyProperty(state.selected); }
  if (event.code === "KeyE") endTurn();
  if (event.code === "KeyM") navigate("map");
  if (event.code === "KeyP") navigate("portfolio");
  if (event.code === "Escape") closeModal();
});

function setupMap() {
  const canvas = document.getElementById("mapCanvas");
  if (!canvas) return;
  const onPointer = event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = mapHits.find(node => Math.hypot(node.x-x,node.y-y) < node.radius + 8);
    if (hit) selectLocation(hit.id);
  };
  canvas.addEventListener("pointerup", onPointer);
  let last = performance.now();
  let accumulator = 0;
  let elapsed = 0;
  const step = 1000 / 60;
  const frame = now => {
    const delta = Math.min(now-last, 50);
    last = now;
    accumulator += delta;
    while (accumulator >= step) { elapsed += step / 1000; accumulator -= step; }
    drawMap(canvas, elapsed);
    animationFrame = requestAnimationFrame(frame);
  };
  animationFrame = requestAnimationFrame(frame);
}

function drawMap(canvas, time) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const width = Math.max(320, rect.width);
  const height = Math.max(420, rect.height);
  if (canvas.width !== Math.round(width*dpr) || canvas.height !== Math.round(height*dpr)) {
    canvas.width = Math.round(width*dpr);
    canvas.height = Math.round(height*dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,width,height);
  const gradient = ctx.createRadialGradient(width*.5,height*.45,20,width*.5,height*.45,width*.7);
  gradient.addColorStop(0,"#15332a"); gradient.addColorStop(1,"#07120f");
  ctx.fillStyle = gradient; ctx.fillRect(0,0,width,height);
  ctx.strokeStyle = "rgba(77,215,231,.055)"; ctx.lineWidth = 1;
  for (let x=-height; x<width+height; x+=36) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x-height,height); ctx.stroke(); }
  for (let x=0; x<width+height; x+=36) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+height,height); ctx.stroke(); }
  const points = COPY.locations.map(location => ({ ...location, px:location.x*width, py:location.y*height }));
  const compactLabels = {
    "shah-alam": { dx:-8, dy:20, align:"right" }, "subang-jaya": { dx:10, dy:-15, align:"left" },
    "petaling-jaya": { dx:12, dy:-9, align:"left" }, "damansara": { dx:-8, dy:20, align:"right" },
    "mont-kiara": { dx:11, dy:-8, align:"left" }, "bangsar": { dx:-10, dy:18, align:"right" },
    "klcc": { dx:12, dy:-5, align:"left" }, "bukit-bintang": { dx:12, dy:12, align:"left" }
  };
  const routes = [["klang","shah-alam"],["shah-alam","subang-jaya"],["setia-alam","shah-alam"],["subang-jaya","petaling-jaya"],["subang-jaya","puchong"],["petaling-jaya","damansara"],["petaling-jaya","bangsar"],["damansara","mont-kiara"],["bangsar","klcc"],["klcc","bukit-bintang"],["puchong","putrajaya"],["puchong","cyberjaya"],["bangsar","cheras"],["cheras","putrajaya"]];
  ctx.strokeStyle = "rgba(158,178,170,.22)"; ctx.lineWidth = 2;
  routes.forEach(([a,b]) => { const from=points.find(p=>p.id===a), to=points.find(p=>p.id===b); ctx.beginPath(); ctx.moveTo(from.px,from.py); ctx.lineTo(to.px,to.py); ctx.stroke(); });
  mapHits = [];
  points.forEach(location => {
    const owned = Boolean(state.portfolio[location.id]);
    const unlocked = location.unlock <= level();
    const selected = state.selected === location.id;
    const radius = clamp(7 + location.demand/15, 10, 15);
    if (selected) {
      const pulse = radius + 8 + Math.sin(time*3)*3;
      ctx.beginPath(); ctx.arc(location.px,location.py,pulse,0,Math.PI*2); ctx.strokeStyle="rgba(77,215,231,.48)"; ctx.lineWidth=2; ctx.stroke();
    }
    ctx.shadowBlur = owned || selected ? 20 : 0;
    ctx.shadowColor = owned ? "#4bd299" : "#4dd7e7";
    ctx.beginPath(); ctx.arc(location.px,location.py,radius,0,Math.PI*2);
    ctx.fillStyle = owned ? "#4bd299" : unlocked ? "#4dd7e7" : "#596d65"; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = owned ? "#06120e" : "#07110f"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.font="900 8px Segoe UI"; ctx.fillText(owned ? String(state.portfolio[location.id].upgrades.length+1) : unlocked ? "+" : "L",location.px,location.py+.5);
    const compact = width < 520 ? compactLabels[location.id] : null;
    const alignLeft = location.px > width*.73;
    ctx.textAlign = compact?.align || (alignLeft ? "right" : "left");
    ctx.fillStyle = selected ? "#f4f1e8" : "#b5c6bf";
    ctx.font=`${selected ? 800 : 650} ${width < 520 ? 10 : 11}px Segoe UI`;
    ctx.fillText(location.name,location.px+(compact?.dx ?? (alignLeft?-radius-7:radius+7)),location.py+(compact?.dy ?? -2));
    mapHits.push({ id:location.id, x:location.px, y:location.py, radius });
  });
}

function drawPortfolioChart() {
  const canvas = document.getElementById("portfolioChart");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(rect.width*dpr); canvas.height = Math.round(rect.height*dpr);
  const ctx = canvas.getContext("2d"); ctx.scale(dpr,dpr);
  const width=rect.width,height=rect.height,pad=28;
  const values=state.history.length>1?state.history:[state.history[0],netWorth()];
  const min=Math.min(...values)*.96,max=Math.max(...values)*1.04;
  ctx.strokeStyle="rgba(158,178,170,.14)"; ctx.lineWidth=1;
  for(let i=0;i<4;i++){const y=pad+(height-pad*2)*i/3;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(width-pad,y);ctx.stroke();}
  const coords=values.map((value,index)=>({x:pad+(width-pad*2)*index/(values.length-1),y:height-pad-(value-min)/(max-min||1)*(height-pad*2)}));
  const fill=ctx.createLinearGradient(0,pad,0,height);fill.addColorStop(0,"rgba(75,210,153,.35)");fill.addColorStop(1,"rgba(75,210,153,0)");
  ctx.beginPath();coords.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.lineTo(coords.at(-1).x,height-pad);ctx.lineTo(coords[0].x,height-pad);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  ctx.beginPath();coords.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.strokeStyle="#4bd299";ctx.lineWidth=2.5;ctx.stroke();
  coords.forEach(point=>{ctx.beginPath();ctx.arc(point.x,point.y,3,0,Math.PI*2);ctx.fillStyle="#4dd7e7";ctx.fill();});
}

function startCountdown() {
  const update = () => {
    const node = document.getElementById("auctionCountdown");
    if (!node) return;
    const now = new Date();
    const next = new Date(now);
    const days = (5 - now.getDay() + 7) % 7;
    next.setDate(now.getDate() + days);
    next.setHours(20,30,0,0);
    if (next <= now) next.setDate(next.getDate()+7);
    const difference = next-now;
    const d=Math.floor(difference/86400000), h=Math.floor(difference/3600000)%24, m=Math.floor(difference/60000)%60, s=Math.floor(difference/1000)%60;
    node.textContent = `${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
    setTimeout(update,1000);
  };
  update();
}

function updateDevOverlay() {
  const dev = document.getElementById("dev");
  if (!new URLSearchParams(location.search).has("dev")) return;
  dev.style.display="block";
  dev.textContent=`view=${currentView} turn=${state.turn} cash=${Math.round(state.cash)} nw=${Math.round(netWorth())} properties=${propertyCount()} action=${state.actionUsed}`;
}

function pollGamepad(time) {
  const pad = navigator.getGamepads?.()[0];
  if (pad && time-lastGamepad>220) {
    const index=COPY.locations.findIndex(location=>location.id===state.selected);
    if (pad.buttons[15]?.pressed || pad.axes[0]>.7) { selectLocation(COPY.locations[(index+1)%COPY.locations.length].id,currentView==="map"); lastGamepad=time; }
    if (pad.buttons[14]?.pressed || pad.axes[0]<-.7) { selectLocation(COPY.locations[(index-1+COPY.locations.length)%COPY.locations.length].id,currentView==="map"); lastGamepad=time; }
    if (pad.buttons[0]?.pressed && currentView==="map") { state.portfolio[state.selected]?openUpgradeModal(state.selected):buyProperty(state.selected); lastGamepad=time; }
  }
  requestAnimationFrame(pollGamepad);
}

async function loadRealListings() {
  try {
    const response = await fetch("https://hh-empire.onrender.com/api/properties", { headers:{ Accept:"application/json" } });
    if (!response.ok) throw new Error("Listing API unavailable");
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : payload.properties || payload.data || payload.listings || [];
    realListings = rows.map(normalizeListing).filter(listing => listing.title && listing.id);
    if (currentView === "real") render();
  } catch { realListings = []; }
}

if (!sessionStorage.getItem("rg_tycoon_counted")) {
  sessionStorage.setItem("rg_tycoon_counted","1");
  localStorage.setItem("rg_tycoon_sessions",String(Number(localStorage.getItem("rg_tycoon_sessions")||0)+1));
}

document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(animationFrame); else if (currentView === "map") setupMap(); });
window.addEventListener("hashchange", () => { currentView=location.hash.slice(1)||"home"; render(); });
window.addEventListener("resize", () => { if (currentView === "map" || currentView === "portfolio") render(); });

updateProgress();
render();
loadRealListings();
requestAnimationFrame(pollGamepad);
