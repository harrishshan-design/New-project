const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let buf = fs.readFileSync(filePath);
let isUtf16le = buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE;
let encoding = isUtf16le ? 'utf16le' : 'utf8';

let content = fs.readFileSync(filePath, encoding);

console.log("Encoding detected:", encoding);
console.log("File size original:", content.length);

const heroRegex = /<header class="hero">[\s\S]*?<\/header>/i;

const newHero = `<header class="hero">
<section class="hero-copy glass" style="background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,252,248,0.95)); border-color: var(--brand-soft);">
<div class="eyebrow" style="background: var(--brand-dark); color: #fff; border:none;"><i class="fas fa-rocket"></i> Your Lead Machine</div>
<h1 style="font-size: clamp(2.8rem, 5vw, 4.5rem);">Get 20–50 property leads/month <span>automatically</span>.</h1>
<p style="font-size: 1.1rem; color: var(--ink); font-weight: 500;">Close buyers faster with AI scoring. Turn passive views into active WhatsApp conversations.</p>
<div class="hero-actions">
<button class="btn" style="background: linear-gradient(135deg, var(--brand), var(--brand-dark));" onclick="scrollToSection('discover')">Get Your First 10 Leads</button>
<button class="chip" onclick="openUpgradeModal('ai-report')">Start Free Trial</button>
</div>
<div class="stats" style="margin-top: 32px;"><div class="stat" style="border-color: rgba(187,77,45,.2);"><strong id="statListings" style="color:var(--brand-dark)">32</strong><span>Leads Today</span></div><div class="stat"><strong id="statYield">RM 18,000</strong><span>Est. Commission</span></div><div class="stat"><strong id="statArea">12%</strong><span>Conversion Rate</span></div></div>
</section>
<aside class="hero-side glass" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
<div class="story glass" style="margin:0; height:100%; border-radius: inherit; border:none; display:flex; flex-direction: column; justify-content: space-between; padding: 28px;">
<div>
<h3 style="color: var(--brand-dark);"><i class="fas fa-briefcase"></i> Agent Revenue Panel</h3>
<p style="color: var(--ink); font-weight: 600;">Your performance at a glance this week.</p>
<div class="trust-grid" style="grid-template-columns: 1fr; gap: 16px; margin-top: 24px;">
<div class="stat" style="padding:16px; background: rgba(255,255,255,0.8);"><strong>32</strong><span>Leads Generated</span></div>
<div class="stat" style="padding:16px; background: rgba(187,77,45,0.08); border-color: rgba(187,77,45,0.2);"><strong>9</strong><span>Hot Buyers</span></div>
<div class="stat" style="padding:16px; background: rgba(15,118,110,0.08); border-color: rgba(15,118,110,0.2);"><strong style="color: var(--teal)">RM 18,000</strong><span>Estimated Commission</span></div>
</div>
</div>
<div class="booking-panel" style="margin-top:32px; padding-top: 24px; border-top: 1px solid var(--line);">
<div style="font-size:0.9rem; font-weight:bold; margin-bottom:12px; color: var(--muted);"><i class="fas fa-lock" style="color:var(--brand);"></i> Locked Features</div>
<ul style="list-style: none; padding:0; margin:0 0 16px 0; font-size: 0.85rem; color: var(--muted); display:grid; gap:8px;">
<li><i class="fas fa-check" style="color:var(--teal)"></i> AI Lead Scoring</li>
<li><i class="fas fa-check" style="color:var(--teal)"></i> Auto WhatsApp Follow-up</li>
<li><i class="fas fa-check" style="color:var(--teal)"></i> Priority Listings</li>
</ul>
<button class="btn" style="width:100%; box-shadow: none;" onclick="openUpgradeModal('hidden-deals')">Unlock for RM99/month</button>
</div>
</div>
</aside>
</header>`;
content = content.replace(heroRegex, newHero);

const modalGridRegex = /(<div class="decision-grid">\s*<div class="decision-card">[\s\S]*?<\/div>)/i;
const aiDealCloserHTML = `
<div class="decision-card" id="modalDealCloser" style="grid-column: 1 / -1; background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,248,241,0.9)); border-color: rgba(187,77,45,.25); box-shadow: 0 8px 24px rgba(187,77,45,0.08); border-radius: 20px;">
<div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
<span class="pill" style="background:var(--brand); color:#fff; font-size:0.75rem;"><i class="fas fa-bolt"></i> AI Deal Closer</span>
<span style="font-weight:700; color:var(--ink);">For Agent Use Only</span>
</div>
<strong style="color:var(--brand-dark); font-size:0.9rem; letter-spacing:0.02em; text-transform:uppercase;">Suggested Message</strong>
<div style="padding:16px; background:#fff; border:1px solid var(--line); border-radius: 12px; margin: 8px 0; position:relative;">
<p style="font-style:italic; font-weight:600; color:var(--ink); margin:0;" id="dealCloserMsg">"Hi, I noticed you've been checking out the layouts... want me to send over the latest pricing?"</p>
</div>
<div class="detail-grid" style="margin-top:12px; grid-template-columns: 1fr 1fr;">
<span style="background:#fff;"><strong>Best Time to Contact</strong><b id="dealCloserTime">8:30PM Tonight</b></span>
<span style="background:#fff;"><strong>Buyer Type</strong><b id="dealCloserType">Investor – Price Sensitive</b></span>
</div>
</div>
`;
content = content.replace(modalGridRegex, `$1\n${aiDealCloserHTML}`);

const newPropertyRender = `<div class="meta"><span><strong style="color:var(--brand-dark)"><i class="fas fa-fire"></i> Hot Buyer Score</strong><b>\${p.aiScore}% Likely to Buy</b></span><span><strong><i class="fas fa-eye"></i> Buyer Intent</strong><b>Viewed 3x this week</b></span><span><strong><i class="fab fa-whatsapp"></i> Contact Prob.</strong><b style="color:var(--teal)">Ready for follow-up</b></span></div>`;

const splitPart1 = '<div class="meta"><span><strong>Layout</strong>${p.bedrooms} beds / ${p.bathrooms} baths</span><span><strong>Size</strong>${p.sqft} sqft</span><span><strong>Price</strong>RM ${p.psf} psf</span></div>';
const splitPart2 = '<div class="reasons"><span><strong>Yield</strong>${p.yield}%</span><span><strong>Commute</strong>${p.commute}</span><span><strong>Offer</strong>${rmFull(decision.negotiation)}</span></div>';
content = content.replace(splitPart1, newPropertyRender);
content = content.replace(splitPart2, '');

const fillModalPart = '$("leadFormWrap").classList.toggle("hidden",sessionRole!=="user");';
const dealCloserLogic = `
  const pScore = property.aiScore || 0;
  if ($("dealCloserMsg")) $("dealCloserMsg").textContent = pScore > 90 ? '"Hi, noticed you saved this listing. It fits your investor goals and has a high yield constraint. Let me know if you want to tour it."' : '"Hi, I saw you viewed this property. Can I answer any questions about the location?"';
  if ($("dealCloserTime")) $("dealCloserTime").textContent = pScore % 2 === 0 ? "8:30PM Tonight" : "10:15AM Tomorrow";
  if ($("dealCloserType")) $("dealCloserType").textContent = property.tags.includes('yield') ? "Investor – ROI Focused" : "Family – Space Oriented";
  $("leadFormWrap").classList.toggle("hidden",sessionRole!=="user");
`;
content = content.replace(fillModalPart, dealCloserLogic);

fs.writeFileSync(filePath, content, encoding);
console.log("Successfully ran replacements. File changed:", content.includes('Your Lead Machine'));
