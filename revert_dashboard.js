const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Revert Hero Section
const newHeroRegex = /<header class="hero">[\s\S]*?<\/aside>\s*<\/header>/i;
const originalHero = `<header class="hero">
<section class="hero-copy glass">
<div class="eyebrow"><i class="fas fa-sparkles"></i> AI-guided buying shortlist for KL & Selangor</div>
<h1>Find the right <span>property move</span> before the market does.</h1>
<p>This upgraded version turns your demo into more of a product showcase: better hierarchy, stronger storytelling, richer filters, smarter cards, saved comparison, and clearer reasons behind each recommendation.</p>
<div class="hero-actions"><button class="btn" onclick="scrollToSection('discover')">Explore Listings</button><button class="chip" onclick="applyPreset('investor')">Investor Mode</button><button class="chip" onclick="applyPreset('family')">Family Mode</button></div>
<div class="chips"><button class="chip" onclick="filterByArea('Mont Kiara')">Mont Kiara</button><button class="chip" onclick="filterByArea('Bangsar')">Bangsar</button><button class="chip" onclick="filterByArea('Desa ParkCity')">Desa ParkCity</button><button class="chip" onclick="filterByArea('Bandar Utama')">Bandar Utama</button></div>
<div class="stats"><div class="stat"><strong id="statListings">120+</strong><span>Agents Active</span></div><div class="stat"><strong id="statYield">RM 2.3M</strong><span>Deals Closed</span></div><div class="stat"><strong id="statArea">Live Flow</strong><span>Real-time buyer matching</span></div></div>
<div class="signal-strip"><div class="signal-card"><strong>Decision-first Search</strong><p>Built for buyer goals, not just raw listing browsing.</p></div><div class="signal-card"><strong>Verified Funnel</strong><p>Owner and agent verification are clearly surfaced in the shortlist.</p></div><div class="signal-card"><strong>Live Agent Routing</strong><p>Users can move from discovery to WhatsApp contact in one flow.</p></div></div>
<div class="live-ribbon" id="liveActivityRibbon"></div>
<div class="revenue-grid">
<button class="revenue-card" onclick="openUpgradeModal('ai-report')"><span>Premium insight</span><strong>Unlock full AI report</strong><p>See complete pricing logic, risk flags, and full negotiation guidance for a property.</p><div class="price-tag">From RM19</div></button>
<button class="revenue-card" onclick="openUpgradeModal('hidden-deals')"><span>Buyer subscription</span><strong>See hidden deals</strong><p>Get the off-market feeling with extra undervalued picks and early signals every day.</p><div class="price-tag">RM29/month</div></button>
<button class="revenue-card agent-plan" onclick="openUpgradeModal('agent-boost')"><span>Agent revenue</span><strong>Boost your listing</strong><p>Push a property harder in the feed, daily loops, and high-intent attention zones.</p><div class="price-tag">Agent boost</div></button>
</div>
<div class="calc-grid">
<div class="calc-item" onclick="openCalculator('mortgage')"><strong>Mortgage Calculator</strong><p>Calculate your estimated month repayment and plan your monthly expenses well.</p><div class="calc-meta"><span>Loan planning</span><span>Show more</span></div></div>
<div class="calc-item" onclick="openCalculator('eligibility')"><strong>Home Loan Eligibility Calculator</strong><p>Calculate your potential loan amount and assess your home buying affordability.</p><div class="calc-meta"><span>Affordability check</span><span>Show more</span></div></div>
<div class="calc-item" onclick="openCalculator('yield')"><strong>Rental Yield</strong><p>Calculate the potential rental yield and evaluate a property's investment performance.</p><div class="calc-meta"><span>Investor view</span><span>Show more</span></div></div>
<div class="calc-item" onclick="openCalculator('downpayment')"><strong>Down Payment Saving Plan</strong><p>Create a structured savings plan and determine how much to save monthly for your down payment plan.</p><div class="calc-meta"><span>Savings target</span><span>Show more</span></div></div>
<div class="calc-item" onclick="openCalculator('fees')"><strong>Malaysian Property Transaction Fees Calculator</strong><p>Estimate the total transaction fees and budget accurately for your Malaysian property purchase.</p><div class="calc-meta"><span>Cost estimate</span><span>Show more</span></div></div>
</div>
</section>
<aside class="hero-side glass">
<div class="visual"><img src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80" alt="Kuala Lumpur skyline"><div class="overlay"><strong>2026 Signal Board</strong><span>Luxury pockets stay resilient while transit-linked family stock continues to look attractive.</span></div></div>
<div class="story glass"><h3>Trust Layer</h3><p>Humans trust humans. This side now shows real-looking agent credibility and platform traction instead of leaving buyers alone with design.</p><div class="trust-grid" id="trustMetricGrid"></div><div class="agent-trust-list" id="agentTrustList"></div></div>
<div class="story glass"><h3>Return Tomorrow</h3><p>Daily hooks keep the platform feeling alive, active, and worth checking again.</p><div class="loop-list" id="dealLoopList"></div></div>
</aside>
</header>`;

content = content.replace(newHeroRegex, originalHero);


// 2. Remove AI Deal Closer HTML block
// We added this block after `div class="decision-card"`
const dealCloserRegex = /\n<div class="decision-card" id="modalDealCloser"[\s\S]*?<\/div>\n<\/div>/i;
content = content.replace(dealCloserRegex, '');

// 3. Revert Property Render Function
const hotBuyerRegex = /<div class="meta"><span><strong style="color:var(--brand-dark)"><i class="fas fa-fire"><\/i> Hot Buyer Score<\/strong><b>\$\{p\.aiScore\}% Likely to Buy<\/b><\/span><span><strong><i class="fas fa-eye"><\/i> Buyer Intent<\/strong><b>Viewed 3x this week<\/b><\/span><span><strong><i class="fab fa-whatsapp"><\/i> Contact Prob\.<\/strong><b style="color:var(--teal)">Ready for follow-up<\/b><\/span><\/div>/g;
const originalPropertyRender = `<div class="meta"><span><strong>Layout</strong>\${p.bedrooms} beds / \${p.bathrooms} baths</span><span><strong>Size</strong>\${p.sqft} sqft</span><span><strong>Price</strong>RM \${p.psf} psf</span></div><div class="reasons"><span><strong>Yield</strong>\${p.yield}%</span><span><strong>Commute</strong>\${p.commute}</span><span><strong>Offer</strong>\${rmFull(decision.negotiation)}</span></div>`;
content = content.replace(hotBuyerRegex, originalPropertyRender);

// 4. Revert fillModal logic
const fillModalLogicRegex = /const pScore = property\.aiScore \|\| 0;[\s\S]*?\$\("leadFormWrap"\)\.classList\.toggle\("hidden",sessionRole!=="user"\);/i;
content = content.replace(fillModalLogicRegex, '$("leadFormWrap").classList.toggle("hidden",sessionRole!=="user");');


fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully reverted dashboard.html.');
