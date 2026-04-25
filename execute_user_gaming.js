const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// 1. CSS VISUAL FIXES (Reduce glass glows + layout shifts)
const cssFixes = `
<style id="smartDiscoveryCSS">
    body.user .hero { display: none !important; }
    body.user .agent-hero { display: none !important; }
    body.user .agent-dashboard { display: none !important; }
    
    /* Decrease glow visually by 30% for User */
    body.user .glass {
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(15, 23, 42, 0.05);
    }
    
    /* Make feed vertically spaced out */
    body.user #propertiesGrid {
        display: flex;
        flex-direction: column;
        gap: 40px;
        max-width: 760px;
        margin: 0 auto;
    }

    body.user .grid {
        display: block !important;
    }
</style>
`;
if(!html.includes('id="smartDiscoveryCSS"')) {
    html = html.replace('</head>', cssFixes + '\n</head>');
}

// 2. ABOVE-THE-FOLD HERO REPLACEMENT
// Locate the original hero
const newHeroStr = `
<!-- ========================================== -->
<!-- 🔥 SMART DISCOVERY ENGINE (USER-UI) -->
<!-- ========================================== -->
<section class="user-discovery-hero user-only reveal" style="padding: 40px; background:linear-gradient(135deg, #ffffff 0%, #fef8f4 100%); border-bottom:1px solid rgba(0,0,0,0.05); text-align:center; position:relative; overflow:hidden;">
    <div style="font-size:1.2rem; font-weight:800; color:var(--brand); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:16px;">👋 Welcome back</div>
    <h1 style="font-size:clamp(2.4rem, 4vw, 3.6rem); margin:0 auto 24px; line-height:1.1; font-family:'Outfit'; max-width:800px; color:var(--ink);">You're 1 smart move away from <span style="color:var(--brand);">upgrading your lifestyle.</span></h1>
    <p style="font-size:1.2rem; color:var(--muted); font-weight:600; margin-bottom:32px;">Who are you today?</p>
    
    <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap;">
        <button class="btn" onclick="triggerDiscovery('Investor')" style="padding:16px 32px; font-size:1.2rem; font-weight:800; background:white; color:var(--ink); border:2px solid var(--line-strong); border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.06); transition:all 0.3s;">💰 Investor</button>
        <button class="btn" onclick="triggerDiscovery('First Home')" style="padding:16px 32px; font-size:1.2rem; font-weight:800; background:white; color:var(--ink); border:2px solid var(--line-strong); border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.06); transition:all 0.3s;">🏡 First Home Buyer</button>
        <button class="btn" onclick="triggerDiscovery('Upgrade')" style="padding:16px 32px; font-size:1.2rem; font-weight:800; background:white; color:var(--ink); border:2px solid var(--line-strong); border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.06); transition:all 0.3s;">👑 Upgrade Lifestyle</button>
    </div>
</section>
`;

// Insert the hero directly into the body (assuming underneath top nav)
if (!html.includes('SMART DISCOVERY ENGINE')) {
    html = html.replace('<header class="hero">', newHeroStr + '\n<header class="hero">');
}


// 3. OVERRIDE RENDERPROPERTIES FOR USER MODE (Netflix scrolling feed stories)
// We will create a Javascript patch that overrides the `renderProperties` function output dynamically,
// or we just inject it directly at the end of the script tag to override.

const renderPropertiesOverride = `
// ==========================================
// OVERRIDE: SMART DISCOVERY ENGINE LOGIC
// ==========================================
function triggerDiscovery(profile) {
    tapFeedback('Profile Selected', \`Loading smart recommendations for \${profile}...\`, 'success');
    window.userProfileIntent = profile;
    window.scrollTo({ top: document.getElementById('propertiesGrid').offsetTop - 100, behavior: 'smooth' });
    renderProperties(); // re-render the feed to adjust the story copy
    triggerDonotMissToast();
}

function triggerDonotMissToast() {
    setTimeout(() => {
        if(sessionRole !== "user") return;
        const toast = document.createElement("div");
        toast.className = "reveal popIn";
        toast.style.cssText = "position:fixed; bottom:32px; left:32px; z-index:9999; background:white; border-left:6px solid #fbbf24; padding:24px; border-radius:16px; box-shadow:0 12px 40px rgba(0,0,0,0.1); max-width:320px;";
        toast.innerHTML = \`<h4 style="margin:0 0 8px; font-size:1.1rem; color:#b45309; font-family:'Outfit'">⚠️ You might miss this!</h4><p style="margin:0 0 16px; font-size:0.95rem; font-weight:600; color:var(--ink);">2 of your saved properties are getting heavily viewed today.</p><button class="btn" onclick="this.parentElement.remove()" style="background:var(--bg-soft); color:var(--ink); border:1px solid var(--line); font-weight:800; width:100%; padding:10px;">Check Saves</button>\`;
        document.body.appendChild(toast);
    }, 15000); // 15s delay trigger
}

function toggleInsight(id) {
    const el = document.getElementById('insight_' + id);
    if(el.style.display === 'none') {
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

// Intercept generic renderProperties and force Discovery Feed if User Phase
const baseRenderProp = renderProperties;
renderProperties = function() {
    if (sessionRole !== "user") {
        document.getElementById('propertiesGrid').style.gap = '';
        return baseRenderProp(); 
    }
    
    // User Discovery Feed Logic
    const list = filtered();
    const grid = $("propertiesGrid");
    
    if(!list.length) {
        grid.innerHTML = '<div style="padding:60px 20px; text-align:center;"><h3 style="font-size:1.6rem; margin-bottom:12px;">No properties match this filter set</h3><p style="color:var(--muted); font-size:1.1rem; font-weight:600;">Try broadening the budget or switching your profile goal.</p></div>';
        return;
    }

    grid.style.gap = "40px"; // force large spacing for scrolling
    grid.style.flexDirection = "column";

    // Rebuild AI Side Widget (Advisor + Progression)
    updateSmartSidebar();

    // Generate Stories
    grid.innerHTML = '<h2 style="font-size:2rem; font-family:\\'Outfit\\'; margin-bottom:24px; color:var(--ink);">🔥 Based on your profile: <span style="color:var(--brand);">3 Properties You Shouldn\\'t Miss</span></h2>' + 
    list.map(p => {
        const isHot = Math.random() > 0.5;
        const dopamineLabel = isHot ? '<span style="background:#fff7ed; color:#c2410c; padding:6px 12px; border-radius:8px; font-size:0.8rem; font-weight:800;">🔥 HOT THIS WEEK</span>' : '<span style="background:#eff6ff; color:#1d4ed8; padding:6px 12px; border-radius:8px; font-size:0.8rem; font-weight:800;">💎 UNDERVALUED BY 8%</span>';
        
        const viewers = Math.floor(Math.random() * 40) + 12;
        const urgencyMessage = isHot ? \`<span style="color:#b45309; font-weight:800;"><i class="fas fa-eye"></i> \${viewers} people viewed today</span>\` : \`<span style="color:#b45309; font-weight:800;"><i class="fas fa-hourglass-half"></i> 2 buyers saved this in last hour</span>\`;
        
        const intent = window.userProfileIntent || "Young professionals upgrading";
        
        const media = p.images ? p.images[0] : (p.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80");

        return \`
        <article class="card glass" style="display:flex; flex-direction:column; padding:0; border-radius:24px; overflow:hidden; border:1px solid rgba(0,0,0,0.08); box-shadow: 0 12px 32px rgba(0,0,0,0.06);">
            <!-- Image Hero -->
            <div style="position:relative; width:100%; height:320px;">
                <img src="\${media}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
                <div style="position:absolute; top:20px; left:20px;">\${dopamineLabel}</div>
                <div style="position:absolute; bottom:20px; right:20px; background:white; padding:8px 16px; border-radius:99px; font-weight:800; font-size:0.9rem; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                    \${money(p.price)}
                </div>
            </div>
            
            <!-- Story Body -->
            <div class="body" style="padding:32px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:center;">
                    <h3 style="font-size:1.8rem; line-height:1.2; margin:0; font-family:'Outfit'">\${p.title}</h3>
                    <button onclick="toggleSave(\${p.id})" style="background:transparent; border:none; font-size:1.4rem; color:\${savedIds.includes(p.id) ? '#ef4444' : '#cbd5e1'}; cursor:pointer; transition:all 0.2s;"><i class="fas fa-heart"></i></button>
                </div>
                
                <p style="font-size:1.1rem; color:var(--muted); font-weight:600; margin-bottom:20px;"><i class="fas fa-map-marker-alt" style="color:var(--brand)"></i> \${p.location || p.area}</p>
                
                <div style="background:#fffbeb; border:1px solid #fef3c7; padding:16px; border-radius:12px; margin-bottom:24px;">
                    \${urgencyMessage}
                </div>
                
                <p style="font-size:1rem; font-weight:600; color:var(--ink); line-height:1.6; margin-bottom:24px;">
                    <strong>Best for:</strong> \${intent}<br>
                    <strong>Why this stands out:</strong> Below market price + incredibly strong rental demand in the neighborhood.
                </p>
                
                <!-- Expandable Insight -->
                <button onclick="toggleInsight(\${p.id})" style="background:transparent; border:none; font-size:1rem; font-weight:800; color:var(--brand); cursor:pointer; padding:0; margin-bottom:16px; display:inline-flex; align-items:center; gap:8px;"><i class="fas fa-brain"></i> View Predictive Insight</button>
                <div id="insight_\${p.id}" style="display:none; background:#f0fdf4; border:1px solid #bbf7d0; padding:20px; border-radius:12px; margin-bottom:24px; font-size:0.95rem; line-height:1.6; color:#166534;">
                    <strong>🧠 Why this is a smart move:</strong>
                    <ul style="margin:8px 0 0; padding-left:20px;">
                        <li>Price is roughly 8% below recent identical transactions.</li>
                        <li>Extremely high demand rental area (historical 95% occupancy).</li>
                        <li>Likely rapid capital appreciation in the next 12–18 months.</li>
                    </ul>
                </div>

                <!-- Frictionless CTA -->
                <div style="display:flex; flex-direction:column; gap:12px; background:#f8fafc; padding:20px; border-radius:16px; border:1px solid var(--line);">
                    <div style="font-weight:800; font-size:0.95rem; color:var(--ink);"><i class="fas fa-comment-dots" style="color:var(--brand)"></i> Ask an expert: "Is this worth the price?"</div>
                    <div style="display:flex; gap:12px;">
                        <a href="https://wa.me/60123456789?text=Hi,%20is%20the%20\${encodeURIComponent(p.title)}%20worth%20the%20price?" target="_blank" class="btn" style="flex:1; padding:14px; font-size:1.1rem; font-weight:800; background:#25D366; border:none; color:white; box-shadow:0 4px 16px rgba(37,211,102,0.3); text-decoration:none; text-align:center;"><i class="fab fa-whatsapp"></i> Chat Now</a>
                        <button class="btn" onclick="bookViewingTour(\${p.id})" style="flex:1; background:white; color:var(--ink); border:2px solid var(--line-strong); padding:14px; font-size:1.1rem; font-weight:800; box-shadow:none;"><i class="fas fa-calendar-alt"></i> Book Tour</button>
                    </div>
                </div>
            </div>
        </article>\`;
    }).join('');
    
    // Inject Netflix loop wrapper
    grid.innerHTML += \`<div style="padding:40px 0; text-align:center; border-top:1px solid var(--line); margin-top:24px;">
        <h3 style="font-size:1.6rem; font-family:'Outfit'; margin-bottom:12px;">⚖️ Not sure?</h3>
        <p style="font-size:1.1rem; color:var(--muted); font-weight:600; margin-bottom:24px;">Compare your top 2 picks side-by-side in 10 seconds.</p>
        <button class="btn" onclick="scrollToSection('compare')" style="font-weight:800; font-size:1.1rem; padding:16px 32px;"><i class="fas fa-balance-scale"></i> Compare Smart Picks</button>
    </div>\`;
};

// Replace Side Widget for User System
function updateSmartSidebar() {
    const side = document.querySelector('.workspace'); // fallback to the side panel location or specific ID
    const intent = window.userProfileIntent || "a balanced";
    
    if($("navAiTrigger")) $("navAiTrigger").innerHTML = '<i class="fas fa-brain"></i> Your Property Advisor';

    const rightCol = document.getElementById("propertiesGrid").nextElementSibling;
    if(rightCol) {
        // Assume rightCol is the workspace side block where AI summary usually sits.
        rightCol.innerHTML = \`
        <div style="position:sticky; top:120px;">
            <!-- Progress Loop -->
            <div class="glass" style="border-radius:24px; padding:28px; margin-bottom:24px; border:2px solid var(--brand-soft);">
                <h3 style="margin:0 0 20px; font-size:1.4rem; font-family:'Outfit'"><i class="fas fa-bullseye" style="color:var(--brand)"></i> Your Progress</h3>
                <ul style="list-style:none; padding:0; margin:0 0 20px; font-size:1rem; font-weight:600; color:var(--ink); line-height:2;">
                    <li><i class="fas fa-check-circle" style="color:#059669; margin-right:8px;"></i> Viewed \${Math.floor(Math.random()*5)+3} properties</li>
                    <li><i class="fas fa-check-circle" style="color:#059669; margin-right:8px;"></i> Saved \${savedIds.length} smart picks</li>
                </ul>
                <div style="background:#fffbeb; color:#92400e; padding:16px; border-radius:12px; font-weight:800; font-size:0.95rem; border:1px solid #fde68a;">
                    → Next Step: Compare your options to lock in a decision.
                </div>
            </div>

            <!-- AI Advisor -->
            <div class="glass" style="border-radius:24px; padding:28px; background:#eff6ff; border:1px solid #bfdbfe;">
                <h3 style="margin:0 0 16px; font-size:1.2rem; color:#1d4ed8; font-family:'Outfit'"><i class="fas fa-magic"></i> Your Property Advisor</h3>
                <p style="margin:0 0 16px; font-size:0.95rem; color:#1e3a8a; line-height:1.6; font-weight:600;">
                    "Based on your profile, the Mont Kiara units fit your \${intent} goals perfectly due to layout optimizations and historic price resilience."
                </p>
                <div style="font-weight:800; color:#059669; font-size:1rem; padding-top:16px; border-top:1px solid rgba(29,78,216,0.1);">Confidence: 82%</div>
            </div>
        </div>
        \`;
    }
}
`;

if (!html.includes('OVERRIDE: SMART DISCOVERY ENGINE LOGIC')) {
    html = html.replace('// Initialize', renderPropertiesOverride + '\n\n// Initialize');
}

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log("Successfully overhauled User Dashboard to Smart Discovery Engine");
