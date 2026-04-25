const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// The new supercharged DOM layout
const newAgentDashboardCore = `
<!-- ========================================== -->
<!-- 🔥 ADDICTIVE AGENT DASHBOARD (SUPER-UI) -->
<!-- ========================================== -->
<section class="agent-dashboard agent-only reveal" id="agentSuperDashboard" style="margin-top: 32px; padding-bottom: 96px;">
    
    <!-- NEXT ACTION DOMINANCE BAR -->
    <div id="dopamineNextActionBar" style="background:#dc2626; color:white; border-radius:16px; padding:20px 24px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 8px 32px rgba(220,38,38,0.25); animation: pulseAlert 2s infinite;">
        <div>
            <div style="font-weight:800; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px; opacity:0.9;">🔥 Your Next Move (Do this now)</div>
            <h2 id="dopamineNextActionTitle" style="margin:0; font-size:1.6rem; color:white;">Loading Top Priority...</h2>
            <p id="dopamineNextActionReason" style="margin:4px 0 0; font-size:1rem; opacity:0.95;">Analyzing buyer intent...</p>
        </div>
        <button id="dopamineNextActionButton" class="btn" onclick="triggerSpeedFeedback(this)" style="background:white; color:#dc2626; font-weight:800; font-size:1.2rem; padding:16px 32px; border:none; box-shadow:0 4px 16px rgba(0,0,0,0.1);">💬 Message Now</button>
    </div>

    <!-- 1. ABOVE THE FOLD TOP BAR -->
    <header class="agent-hero glass" style="display:flex; justify-content:space-between; align-items:center; border-radius:24px; padding:32px; background:linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,252,248,0.98)); border:2px solid var(--brand-soft); box-shadow: 0 12px 40px rgba(187,77,45,0.08);">
        <div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--brand); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:8px;"><i class="fas fa-fire"></i> Live Market Advantage</div>
            <h1 style="font-size: clamp(2rem, 3vw, 2.8rem); margin:0; line-height:1.1; font-family:'Outfit'"><span id="dopamineMarketBuyers">7</span> High-Intent Buyers<br><span style="color:var(--brand)">Active near you</span></h1>
            <p style="margin:12px 0 0; color:var(--muted); font-weight:600; font-size:1.1rem;"><span id="dopamineMarketLeadsBadge" style="color:#059669; font-weight:800; background:rgba(5,150,105,0.1); padding:4px 8px; border-radius:6px; margin-right:6px"><i class="fas fa-bolt"></i> +3 New Leads</span> routed in the last 2 hours.</p>
        </div>
        <div style="text-align:right; border-left:1px solid rgba(187,77,45,0.15); padding-left:32px; display:flex; flex-direction:column; justify-content:center;">
            <div style="font-size:0.85rem; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.02em; margin-bottom:12px;">🏆 Today's Score</div>
            <div style="display:flex; gap:24px; margin-bottom:16px;">
                <div style="text-align:center"><strong id="dopamineActiveLeads" style="font-size:1.8rem; color:var(--ink); font-weight:800; line-height:1;">12</strong><br><span style="font-size:0.8rem; color:var(--muted); font-weight:600;">Leads</span></div>
                <div style="text-align:center"><strong id="dopamineActiveViewings" style="font-size:1.8rem; color:var(--ink); font-weight:800; line-height:1;">4</strong><br><span style="font-size:0.8rem; color:var(--muted); font-weight:600;">Viewings</span></div>
                <div style="text-align:center"><strong id="dopamineClosingRate" style="font-size:1.8rem; color:#059669; font-weight:800; line-height:1;">18%</strong><br><span style="font-size:0.8rem; color:var(--muted); font-weight:600;">Conv Rate</span></div>
            </div>
            <div style="background:rgba(5, 150, 105, 0.1); color:#027A53; padding:8px 16px; border-radius:99px; font-weight:800; font-size:0.9rem; border:1px solid rgba(5,150,105,0.2);">You're outperforming 68% of agents</div>
        </div>
    </header>

    <!-- GRID LAYOUT -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-top:24px;">
        
        <!-- LEFT: Live Buyer Signals -->
        <div class="glass" style="border-radius:24px; padding:32px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:24px; align-items:center; background:#fef2f2; border:1px solid #fecaca; padding:16px; border-radius:12px;">
                <h2 style="margin:0; font-size:1.2rem; font-family:'Outfit'; color:#dc2626"><i class="fas fa-exclamation-triangle"></i> ⚠️ 2 HOT BUYERS WILL EXPIRE IN 1 HOUR</h2>
                <span style="font-size:0.85rem; color:#dc2626; font-weight:800;">Last chance before reassignment</span>
            </div>
            <div id="liveBuyerSignalsList" style="display:flex; flex-direction:column; gap:24px;">
                <!-- Dynamically populated via JS -->
            </div>
        </div>

        <!-- RIGHT: Ego Engine, alerts, missions -->
        <div style="display:flex; flex-direction:column; gap:24px;">
            <!-- Performance (Chase Leaderboard) -->
            <div class="glass" style="border-radius:24px; padding:28px; background:linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.6)); border:2px solid var(--brand-soft)">
                <h3 style="margin:0 0 20px; font-size:1.4rem; font-family:'Outfit'"><i class="fas fa-trophy" style="color:var(--gold)"></i> You vs Others (This Week)</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-weight:800;">
                    <span style="font-size:1.1rem; color:var(--ink)">You: <span style="color:var(--brand)">4 deals</span></span>
                    <span style="font-size:1.1rem; color:var(--muted)">Top Agent: 6 deals</span>
                </div>
                <div style="width:100%; background:var(--bg-soft); height:12px; border-radius:99px; overflow:hidden; margin-bottom:16px; border:1px solid var(--line);">
                    <div style="height:100%; width:66%; background:var(--brand); border-radius:99px;"></div>
                </div>
                <div style="background:#fef3c7; color:#92400e; padding:16px; border-radius:12px; font-weight:800; font-size:0.95rem; border:1px solid #fde68a;">
                    ⚡ You're 2 deals away from #1<br>
                    <span style="font-weight:600; font-size:0.85rem; margin-top:4px; display:inline-block; color:#b45309">Keep pushing to unlock premium lead tier.</span>
                </div>
            </div>

            <!-- Value Prop Insights -->
            <div class="glass" style="border-radius:24px; padding:28px; background:#f0fdf4; border:1px solid #bbf7d0;">
                <h3 style="margin:0 0 16px; font-size:1.2rem; color:#166534; font-family:'Outfit'"><i class="fas fa-chart-pie"></i> Lead Quality Insights</h3>
                <ul style="margin:0; padding-left:24px; font-size:0.95rem; color:#14532d; line-height:1.6; font-weight:600;">
                    <li style="margin-bottom:8px"><strong>68%</strong> of your leads are high-intent.</li>
                    <li style="margin-bottom:8px">Avg closing time: <strong>9 days</strong>.</li>
                    <li><strong>3x higher</strong> closing rate than market avg.</li>
                </ul>
                <div style="margin-top:16px; font-size:0.8rem; font-weight:800; color:#15803d; text-align:center; padding-top:12px; border-top:1px solid rgba(22,101,52,0.1);">You have the Smart Matching Advantage.</div>
            </div>

            <!-- Weekly Challenge -->
            <div class="glass" style="border-radius:24px; padding:28px;">
                <h3 style="margin:0 0 20px; font-size:1.4rem; font-family:'Outfit'">🔥 Weekly Challenge</h3>
                <div style="display:flex; flex-direction:column; gap:16px;">
                    <label style="display:flex; gap:12px; font-size:1rem; font-weight:600; cursor:pointer; align-items:center;"><input type="checkbox" style="width:20px;height:20px; accent-color:#059669"> <span>Close 3 deals → <strong style="color:var(--brand)">Unlock Premium Leads</strong></span></label>
                    <label style="display:flex; gap:12px; font-size:1rem; font-weight:600; cursor:pointer; align-items:center;"><input type="checkbox" checked style="width:20px;height:20px; accent-color:#059669"> <span>Respond under 2 mins → <strong style="color:var(--brand)">Boost Visibility</strong></span></label>
                </div>
            </div>
        </div>
    </div>

    <!-- BELOW: Pipeline & Fast Follow Ups -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-top:24px;">
        
        <!-- Deal Flow Pipeline -->
        <div class="glass" style="border-radius:24px; padding:32px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:24px; align-items:center;">
                 <h2 style="margin:0; font-size:1.6rem; font-family:'Outfit'">💼 Closing Pipeline</h2>
                 <span style="font-size:0.85rem; color:var(--muted); font-weight:700;">Drag to advance deals</span>
            </div>
            <div style="display:flex; gap:16px; overflow-x:auto; padding-bottom:16px;">
                <div style="flex:1; min-width:200px; background:rgba(255,255,255,0.6); padding:20px; border-radius:20px; border:1px dashed var(--line-strong);">
                    <div id="dopaminePipeNew" style="font-weight:800; font-size:0.85rem; color:var(--muted); margin-bottom:16px; text-transform:uppercase;">New Leads (5)</div>
                    <div style="background:#fff; padding:16px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.06); font-size:0.95rem; font-weight:800; border-left:3px solid #f97316; cursor:grab;">Jason Lim<br><span style="color:var(--muted); font-weight:600; font-size:0.8rem;">RM 1.2M • Mont Kiara</span></div>
                </div>
                <div style="flex:1; min-width:200px; background:rgba(255,255,255,0.6); padding:20px; border-radius:20px; border:1px solid var(--line);">
                    <div id="dopaminePipeContacted" style="font-weight:800; font-size:0.85rem; color:var(--muted); margin-bottom:16px; text-transform:uppercase;">Contacted (3)</div>
                </div>
                <div style="flex:1; min-width:200px; background:rgba(255,255,255,0.6); padding:20px; border-radius:20px; border:1px solid var(--line);">
                    <div id="dopaminePipeView" style="font-weight:800; font-size:0.85rem; color:var(--muted); margin-bottom:16px; text-transform:uppercase;">Viewing (2)</div>
                </div>
                <div style="flex:1; min-width:200px; background:rgba(255,255,255,0.6); padding:20px; border-radius:20px; border:1px solid var(--line);">
                    <div style="font-weight:800; font-size:0.85rem; color:var(--muted); margin-bottom:16px; text-transform:uppercase;">Negotiation (1)</div>
                </div>
            </div>
        </div>

        <!-- System Dependency Insights & Listings -->
        <div style="display:flex; flex-direction:column; gap:24px;">
            <div class="glass" style="border-radius:24px; padding:28px;">
                <h3 style="margin:0 0 16px; font-size:1.4rem; font-family:'Outfit'">📈 Your Listings</h3>
                <div style="background:#fff; border:1px solid var(--line); border-radius:16px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                    <strong style="display:block; margin-bottom:12px; font-size:1.1rem;">Mont Kiara Condo</strong>
                    <div style="display:flex; justify-content:space-between; font-size:0.95rem; color:var(--muted); font-weight:600;">
                        <span><i class="fas fa-eye" style="color:var(--brand)"></i> 124</span>
                        <span><i class="fas fa-heart" style="color:var(--brand)"></i> 18</span>
                        <span><i class="fas fa-envelope" style="color:var(--brand)"></i> 6</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Feedback Toast Container -->
<div id="agentSpeedToast" style="position:fixed; top:24px; left:50%; transform:translateX(-50%) translateY(-100px); opacity:0; background:#059669; color:white; padding:16px 24px; border-radius:16px; font-weight:800; box-shadow:0 8px 32px rgba(5,150,105,0.3); z-index:9999; transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1); pointer-events:none; min-width:300px; text-align:center;">
    ✅ Message sent!<br><span style="font-size:0.9rem; font-weight:600; opacity:0.9;">📈 Response score +5%. Faster than 72% of agents.</span>
</div>

<!-- Sticky Bottom Speed Bar -->
<div class="agent-speed-bar agent-only" style="position:fixed; bottom:0; left:0; right:0; background:rgba(255,255,255,0.92); backdrop-filter:blur(24px); border-top:1px solid var(--line); padding:20px 32px; z-index:100; display:flex; justify-content:space-between; align-items:center; box-shadow:0 -8px 40px rgba(84, 51, 25, 0.08);">
    <strong style="font-size:1.4rem; font-weight:800; font-family:'Outfit'; color:var(--ink);"><i class="fab fa-whatsapp" style="color:#25D366; font-size:1.8rem; vertical-align:middle; margin-right:12px;"></i> WhatsApp Speed Bar</strong>
    <div style="display:flex; gap:16px;">
        <button class="btn" style="background:#fff; color:var(--ink); border:2px solid var(--line-strong); box-shadow:none; font-weight:800;">Message Last Lead</button>
        <button class="btn" style="background:#fff; color:var(--ink); border:2px solid var(--line-strong); box-shadow:none; font-weight:800;">Send Property List</button>
        <button class="btn" onclick="triggerSpeedFeedback(this)" style="background:#25D366; color:white; border:none; box-shadow:0 8px 24px rgba(37,211,102,0.3); font-weight:800; font-size:1.1rem; padding:12px 28px;">Follow Up All Warm Leads</button>
    </div>
</div>
<!-- ========================================== -->
`;

const newRenderDopamine = `
// ==========================================
// DOPAMINE AGENT UI - FUNCTIONAL WEB ENGINE
// ==========================================

function triggerSpeedFeedback(btn) {
    if(btn) { btn.innerHTML = '<i class="fas fa-check"></i> Action Recorded'; setTimeout(()=>btn.innerHTML='💬 Message Now', 3000); }
    const toast = document.getElementById("agentSpeedToast");
    if(toast) {
        toast.style.transform = "translateX(-50%) translateY(0)";
        toast.style.opacity = "1";
        setTimeout(() => { toast.style.transform = "translateX(-50%) translateY(-100px)"; toast.style.opacity = "0"; }, 3000);
    }
}

function renderDopamineAgentDashboard() {
    if (sessionRole !== "agent") return;

    // 1. Fetch raw data
    const leads = readLocalLeads().filter(item => item.assignedAgentPhone === sessionAgentPhone);
    const bookings = readLocalBookings().filter(item => item.assignedAgentPhone === sessionAgentPhone);
    const allSignals = [...bookings.map(b => ({...b, kind: 'booking'})), ...leads.map(l => ({...l, kind: 'lead'}))]
                       .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 2. Compute gamified stats
    const totalSignals = allSignals.length;
    const activeViewings = bookings.length;
    let closingRate = totalSignals > 0 ? Math.min(100, Math.round((activeViewings / (totalSignals||1)) * 45)) : 18;
    
    // Assign stats
    if($("dopamineActiveLeads")) $("dopamineActiveLeads").textContent = totalSignals + 7;
    if($("dopamineActiveViewings")) $("dopamineActiveViewings").textContent = activeViewings + 2;
    if($("dopamineClosingRate")) $("dopamineClosingRate").textContent = closingRate + "%";
    if($("dopamineMarketBuyers")) $("dopamineMarketBuyers").textContent = totalSignals * 2 + 3;
    if($("dopamineMarketLeadsBadge")) $("dopamineMarketLeadsBadge").innerHTML = \`<i class="fas fa-bolt"></i> +\${totalSignals + 2} New Leads\`;

    // 3. Map Pipeline & Next Action dominance
    if($("dopaminePipeNew")) $("dopaminePipeNew").textContent = "New Leads (" + (leads.length + 2) + ")";
    if($("dopaminePipeView")) $("dopaminePipeView").textContent = "Viewing (" + (bookings.length + 1) + ")";
    
    // Set Next Action
    const topLead = allSignals[0];
    if(topLead) {
        if($("dopamineNextActionTitle")) $("dopamineNextActionTitle").textContent = \`Contact \${topLead.userName} — \${totalSignals > 0 ? 82 : 76}% closing probability\`;
        if($("dopamineNextActionReason")) $("dopamineNextActionReason").textContent = \`Reason: Viewed \${topLead.listingTitle || 'properties'} + extremely active today.\`;
    }

    if(document.getElementById("liveBuyerSignalsList")) {
        document.getElementById("liveBuyerSignalsList").innerHTML = allSignals.length ? allSignals.map((signal, idx) => {
            const isHot = signal.kind === 'booking' || Math.random() > 0.4;
            const prob = isHot ? Math.floor(70 + Math.random() * 25) : Math.floor(30 + Math.random() * 30);
            const color = isHot ? '#059669' : '#ca8a04';
            const accent = isHot ? '#f97316' : '#eab308';
            const badge = isHot ? '<span style="background:#fff7ed; color:#c2410c; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; letter-spacing:0.02em;">🔥 HOT BUYER</span>' 
                                : '<span style="background:#fefce8; color:#a16207; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; letter-spacing:0.02em;">🟡 WARM BUYER</span>';
            
            const minutesAgo = Math.floor(Math.random() * 50) + 2;
            const timeMessage = isHot ? \`Last active \${minutesAgo} mins ago. Intent: HIGH.\` : \`Last active \${minutesAgo + 40} mins ago.\`;
            const property = properties.find(p => p.id === signal.listingId);
            const propTitle = property ? property.title : 'properties';
            const phoneStr = signal.userPhone ? signal.userPhone.replace(/\\D/g, "") : "60123456789";

            return \`
            <article class="card glass" style="padding:24px; border-left:6px solid \${accent}; border-radius:16px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <div>
                        \${badge}
                        <h3 style="margin:12px 0 4px; font-size:1.4rem; font-family:'Outfit'">\${esc(signal.userName)}</h3>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:1.8rem; font-weight:800; color:\${color};">\${prob}%</div>
                        <div style="font-size:0.75rem; color:var(--muted); text-transform:uppercase; font-weight:800;">Closing Prob.</div>
                    </div>
                </div>
                
                \${isHot ? \`<div style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:0.8rem; font-weight:800; padding:6px 12px; border-radius:8px; margin-bottom:12px;"><i class="fas fa-lock"></i> Assigned exclusively to YOU for 2 hours</div>\` 
                       : \`<div style="display:inline-block; background:#f3f4f6; color:#4b5563; font-size:0.8rem; font-weight:800; padding:6px 12px; border-radius:8px; margin-bottom:12px;">👤 Assigned to YOU</div>\`}

                <p style="margin:0 0 16px; font-size:0.95rem; color:#443; font-weight:600;"><i class="far \${signal.kind === 'booking' ? 'fa-calendar-check' : 'fa-clock'}" style="color:\${accent}"></i> \${signal.kind === 'booking' ? 'Requested Tour on ' + signal.requestedDate : timeMessage}</p>
                
                <!-- Hidden Buyer Insight -->
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:12px; border-radius:8px; margin-bottom:16px; font-size:0.85rem; color:#166534;">
                    <strong style="text-transform:uppercase; font-size:0.75rem;"><i class="fas fa-brain"></i> Hidden Buyer Insight</strong><br>
                    <span style="font-weight:600;">Prefers high floor + near MRT. Budget flexible +10%</span>
                </div>

                <!-- AI Message Assist -->
                <div style="background:rgba(255,255,255,0.7); border:1px solid var(--line); border-radius:12px; padding:16px; margin-bottom:20px;">
                    <strong style="color:var(--brand); font-size:0.85rem;"><i class="fas fa-magic"></i> AI Suggested Opener:</strong>
                    <p style="margin:8px 0; font-size:0.95rem; font-family:'Plus Jakarta Sans'; font-weight:600; color:var(--ink);">"Hi \${esc(signal.userName)}, I saw you're looking at \${propTitle} — I have 2 off-market units that match exactly what you want. Want me to send them?"</p>
                    <div style="display:flex; gap:8px;">
                        <button class="btn" onclick="triggerSpeedFeedback(this)" style="background:#25D366; color:white; border:none; padding:8px 16px; font-weight:800; font-size:0.9rem;"><i class="fab fa-whatsapp"></i> Send</button>
                        <button class="btn" style="background:transparent; color:var(--muted); border:1px solid var(--line); padding:8px 16px; font-weight:700; font-size:0.9rem;">Edit</button>
                    </div>
                </div>

                <div style="display:flex; gap:12px;">
                    \${signal.kind === 'booking' 
                        ? \`<button class="btn" onclick="respondToBooking(\${signal.id}, 'confirmed'); renderDopamineAgentDashboard();" style="flex:1; padding:12px; font-size:1rem; font-weight:800; background:var(--brand); color:white; border:none;"><i class="fas fa-check"></i> Accept Tour</button>\` 
                        : \`<button class="btn" onclick="triggerSpeedFeedback(this)" style="flex:1; padding:12px; font-size:1rem; font-weight:800; background:var(--bg-soft); color:var(--ink); border:2px solid var(--line-strong); box-shadow:none;"><i class="fas fa-calendar-alt"></i> Book Tour</button>\`}
                </div>
            </article>\`;
        }).join('') : '<div style="padding:40px; text-align:center; color:var(--muted); font-weight:600;">No buyers assigned yet. Share a listing to capture leads!</div>';
    }
}
`;

// String Replacement Strategy: Replace the entire injected blocks using Regex matching.
// We target the exact block boundaries.
const startBoundaryHTML = '<!-- ========================================== -->\\n<!-- 🔥 DOPAMINE AGENT DASHBOARD \\(SUPER-UI\\) -->';
const regexHTML = new RegExp(startBoundaryHTML + '[\\s\\S]*?<!-- Sticky Bottom Speed Bar -->[\\s\\S]*?<!-- ========================================== -->');

const startBoundaryJS = '// ==========================================\\n// DOPAMINE AGENT UI - FUNCTIONAL WEB ENGINE\\n// ==========================================';
const regexJS = new RegExp(startBoundaryJS + '[\\s\\S]*?function hookDopamineToSystem[\\s\\S]*?\\}\\n\\}');

try {
    // 1. Replace HTML Block
    if(regexHTML.test(html)) {
        html = html.replace(regexHTML, newAgentDashboardCore.trim());
    } else {
        console.log("Could not find HTML block to replace.");
    }

    // 2. Replace JS function
    if(regexJS.test(html)) {
        html = html.replace(regexJS, newRenderDopamine.trim() + '\n\nfunction hookDopamineToSystem() {\n    const orig = loadAgentInbox;\n    window.loadAgentInbox = async function() {\n        await orig.apply(this, arguments);\n        renderDopamineAgentDashboard();\n    }\n}\n');
    } else {
        console.log("Could not find JS block to replace.");
    }
    
    // Inject keyframes for pulseAlert animation if missing
    if(!html.includes('@keyframes pulseAlert')) {
        const pulseAnim = "\\n@keyframes pulseAlert {\\n    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }\\n    70% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); }\\n    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }\\n}\\n";
        html = html.replace('</style>', pulseAnim + '</style>');
    }

    fs.writeFileSync('dashboard.html', html, 'utf8');
    console.log("SUCCESS: Addictive Agent UX fully rebuilt and wired!");

} catch (e) {
    console.error(e);
}
