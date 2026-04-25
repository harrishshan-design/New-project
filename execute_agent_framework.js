const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

const agentDashboardCore = `
<!-- ========================================== -->
<!-- 🔥 DOPAMINE AGENT DASHBOARD (SUPER-UI) -->
<!-- ========================================== -->
<section class="agent-dashboard agent-only reveal" id="agentSuperDashboard" style="margin-top: 32px; padding-bottom: 80px;">
    
    <!-- 1. ABOVE THE FOLD TOP BAR -->
    <header class="agent-hero glass" style="display:flex; justify-content:space-between; align-items:center; border-radius:24px; padding:32px; background:linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,252,248,0.95)); border:2px solid var(--brand-soft); box-shadow: 0 12px 40px rgba(187,77,45,0.08);">
        <div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--brand); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:8px;"><i class="fas fa-fire"></i> Live Market Advantage</div>
            <h1 style="font-size: clamp(2rem, 3vw, 2.8rem); margin:0; line-height:1.1; font-family:'Outfit'">7 High-Intent Buyers<br><span style="color:var(--brand)">Active near you</span></h1>
            <p style="margin:12px 0 0; color:var(--muted); font-weight:600; font-size:1.1rem;"><span style="color:#059669; font-weight:800; background:rgba(5,150,105,0.1); padding:4px 8px; border-radius:6px; margin-right:6px"><i class="fas fa-bolt"></i> +3 New Leads</span> routed in the last 2 hours.</p>
        </div>
        <div style="text-align:right; border-left:1px solid rgba(187,77,45,0.15); padding-left:32px; display:flex; flex-direction:column; justify-content:center;">
            <div style="font-size:0.85rem; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.02em; margin-bottom:12px;">🏆 Today's Score</div>
            <div style="display:flex; gap:24px; margin-bottom:16px;">
                <div style="text-align:center"><strong style="font-size:1.8rem; color:var(--ink); font-weight:800; line-height:1;">12</strong><br><span style="font-size:0.8rem; color:var(--muted); font-weight:600;">Leads</span></div>
                <div style="text-align:center"><strong style="font-size:1.8rem; color:var(--ink); font-weight:800; line-height:1;">4</strong><br><span style="font-size:0.8rem; color:var(--muted); font-weight:600;">Viewings</span></div>
                <div style="text-align:center"><strong style="font-size:1.8rem; color:#059669; font-weight:800; line-height:1;">18%</strong><br><span style="font-size:0.8rem; color:var(--muted); font-weight:600;">Closing Rate</span></div>
            </div>
            <div style="background:rgba(5, 150, 105, 0.1); color:#027A53; padding:8px 16px; border-radius:99px; font-weight:800; font-size:0.9rem; border:1px solid rgba(5,150,105,0.2);">You're outperforming 68% of agents</div>
        </div>
    </header>

    <!-- GRID LAYOUT -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-top:24px;">
        
        <!-- LEFT: Live Buyer Signals -->
        <div class="glass" style="border-radius:24px; padding:32px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:24px; align-items:center;">
                <h2 style="margin:0; font-size:1.6rem; font-family:'Outfit'">🔥 Live Buyer Signals</h2>
                <span style="font-size:0.85rem; background:rgba(220, 38, 38, 0.1); color:#dc2626; padding:6px 16px; border-radius:99px; font-weight:800; border:1px solid rgba(220,38,38,0.2);">Uncontacted leads expire in 2 hrs</span>
            </div>
            <div id="liveBuyerSignalsList" style="display:flex; flex-direction:column; gap:20px;">
                <!-- DUMMY AGENT INBOX TO START -->
                <article class="card glass" style="padding:24px; border-left:6px solid #f97316;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                        <div>
                            <span style="background:#fff7ed; color:#c2410c; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; letter-spacing:0.02em;">🔥 HOT BUYER</span>
                            <h3 style="margin:12px 0 4px; font-size:1.4rem; font-family:'Outfit'">Jason Lim</h3>
                            <p style="margin:0; font-size:0.95rem; color:var(--muted); font-weight:600;"><i class="fas fa-location-dot"></i> Mont Kiara • RM 900K - 1.2M</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:1.8rem; font-weight:800; color:#059669;">76%</div>
                            <div style="font-size:0.75rem; color:var(--muted); text-transform:uppercase; font-weight:800; letter-spacing:0.02em;">Closing Prob.</div>
                        </div>
                    </div>
                    <p style="margin:0 0 20px; font-size:0.95rem; color:#443; font-weight:500;"><i class="far fa-clock" style="color:#f97316"></i> Last active 12 mins ago. Intent: HIGH (Viewing-ready).</p>
                    <div style="display:flex; gap:12px;">
                        <button class="btn" style="flex:1; padding:12px; font-size:1rem; font-weight:700; background:#25D366; border:none; box-shadow:0 4px 16px rgba(37,211,102,0.3);"><i class="fab fa-whatsapp"></i> Message Now</button>
                        <button class="btn" style="flex:1; padding:12px; font-size:1rem; font-weight:700; background:var(--bg-soft); color:var(--ink); border:2px solid var(--line-strong); box-shadow:none;"><i class="fas fa-calendar-alt"></i> Book Viewing</button>
                        <button class="btn" style="padding:12px 20px; font-size:1rem; background:var(--bg-soft); color:var(--ink); border:2px solid var(--line-strong); box-shadow:none;"><i class="far fa-star"></i></button>
                    </div>
                </article>

                <article class="card glass" style="padding:24px; border-left:6px solid #eab308;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                        <div>
                            <span style="background:#fefce8; color:#a16207; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; letter-spacing:0.02em;">🟡 WARM BUYER</span>
                            <h3 style="margin:12px 0 4px; font-size:1.4rem; font-family:'Outfit'">Sarah Tan</h3>
                            <p style="margin:0; font-size:0.95rem; color:var(--muted); font-weight:600;"><i class="fas fa-location-dot"></i> Bangsar South • RM 600K</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:1.8rem; font-weight:800; color:#ca8a04;">42%</div>
                            <div style="font-size:0.75rem; color:var(--muted); text-transform:uppercase; font-weight:800;">Closing Prob.</div>
                        </div>
                    </div>
                    <p style="margin:0 0 20px; font-size:0.95rem; color:#443; font-weight:500;"><i class="far fa-clock" style="color:#ca8a04"></i> Last active 4 hours ago. Intent: Exploring comps.</p>
                    <div style="display:flex; gap:12px;">
                        <button class="btn" style="flex:1; padding:12px; font-size:1rem; font-weight:700;"><i class="far fa-comment"></i> Nudge Lead</button>
                    </div>
                </article>
            </div>
        </div>

        <!-- RIGHT: Ego Engine, alerts, missions -->
        <div style="display:flex; flex-direction:column; gap:24px;">
            <!-- Performance -->
            <div class="glass" style="border-radius:24px; padding:28px; background:linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.6)); border:2px solid var(--brand-soft)">
                <h3 style="margin:0 0 20px; font-size:1.4rem; font-family:'Outfit'"><i class="fas fa-bolt" style="color:var(--gold)"></i> Your Closing Power</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
                    <div><span style="font-size:0.8rem; color:var(--muted); font-weight:800; text-transform:uppercase;">Conv. Rate</span><br><strong style="font-size:1.4rem; font-weight:800;">18%</strong></div>
                    <div><span style="font-size:0.8rem; color:var(--muted); font-weight:800; text-transform:uppercase;">Avg Response</span><br><strong style="font-size:1.4rem; font-weight:800;">3 mins</strong></div>
                    <div style="grid-column: span 2;"><span style="font-size:0.8rem; color:var(--muted); font-weight:800; text-transform:uppercase;">Deals Closed This Month</span><br><strong style="font-size:1.6rem; color:var(--brand); font-weight:800;">4</strong></div>
                </div>
                <div style="background:#fef3c7; color:#92400e; padding:16px; border-radius:12px; font-weight:800; font-size:0.95rem; border:1px solid #fde68a;">
                    🏆 Rank: Top 12% in KV<br>
                    <span style="font-weight:600; font-size:0.9rem; margin-top:4px; display:inline-block;">👉 You're 2 deals away from Top 5%</span>
                </div>
            </div>

            <!-- Opportunity Alerts -->
            <div class="glass" style="border-radius:24px; padding:28px; border:2px solid #fecaca; background:#fffbfb">
                <h3 style="margin:0 0 20px; font-size:1.4rem; color:#dc2626; font-family:'Outfit'"><i class="fas fa-exclamation-triangle"></i> Opportunity Alerts</h3>
                <ul style="margin:0; padding-left:24px; font-size:0.95rem; color:#443; line-height:1.6; font-weight:500;">
                    <li style="margin-bottom:12px"><strong style="color:var(--ink)">3 buyers</strong> looking for properties in your area RIGHT NOW.</li>
                    <li style="margin-bottom:12px"><strong style="color:var(--ink)">1 high-budget client</strong> not yet contacted.</li>
                    <li><strong style="color:var(--ink)">2 of your listings</strong> gaining unusual attention.</li>
                </ul>
                <div style="margin-top:20px; font-size:0.85rem; font-weight:800; color:var(--muted); text-align:center; padding-top:16px; border-top:1px solid rgba(0,0,0,0.05); text-transform:uppercase;">Only 3 agents assigned to this area!</div>
            </div>

            <!-- Daily Mission -->
            <div class="glass" style="border-radius:24px; padding:28px;">
                <h3 style="margin:0 0 20px; font-size:1.4rem; font-family:'Outfit'">🎯 Today's Targets</h3>
                <div style="display:flex; flex-direction:column; gap:16px;">
                    <label style="display:flex; gap:12px; font-size:1rem; font-weight:600; cursor:pointer;"><input type="checkbox" checked style="width:18px;height:18px; accent-color:var(--brand)"> Contact 5 new leads</label>
                    <label style="display:flex; gap:12px; font-size:1rem; font-weight:600; cursor:pointer;"><input type="checkbox" style="width:18px;height:18px; accent-color:var(--brand)"> Book 2 viewings</label>
                    <label style="display:flex; gap:12px; font-size:1rem; font-weight:600; cursor:pointer;"><input type="checkbox" style="width:18px;height:18px; accent-color:var(--brand)"> Follow up all warm buyers</label>
                </div>
                <div style="margin-top:24px; font-size:0.9rem; background:rgba(187,77,45,0.08); color:var(--brand-dark); padding:12px; border-radius:8px; text-align:center; font-weight:800; border:1px solid rgba(187,77,45,0.15);">🎁 Reward: Visibility boost tomorrow</div>
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
                    <div style="font-weight:800; font-size:0.85rem; color:var(--muted); margin-bottom:16px; text-transform:uppercase;">New Leads (5)</div>
                    <div style="background:#fff; padding:16px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.06); font-size:0.95rem; font-weight:800; border-left:3px solid #f97316; cursor:grab;">Jason Lim<br><span style="color:var(--muted); font-weight:600; font-size:0.8rem;">RM 1.2M • Mont Kiara</span></div>
                </div>
                <div style="flex:1; min-width:200px; background:rgba(255,255,255,0.6); padding:20px; border-radius:20px; border:1px solid var(--line);">
                    <div style="font-weight:800; font-size:0.85rem; color:var(--muted); margin-bottom:16px; text-transform:uppercase;">Contacted (3)</div>
                </div>
                <div style="flex:1; min-width:200px; background:rgba(255,255,255,0.6); padding:20px; border-radius:20px; border:1px solid var(--line);">
                    <div style="font-weight:800; font-size:0.85rem; color:var(--muted); margin-bottom:16px; text-transform:uppercase;">Viewing (2)</div>
                </div>
                <div style="flex:1; min-width:200px; background:rgba(255,255,255,0.6); padding:20px; border-radius:20px; border:1px solid var(--line);">
                    <div style="font-weight:800; font-size:0.85rem; color:var(--muted); margin-bottom:16px; text-transform:uppercase;">Negotiation (1)</div>
                </div>
            </div>
        </div>

        <!-- Smart Follow-Up & Listing Perf -->
        <div style="display:flex; flex-direction:column; gap:24px;">
            <div class="glass" style="border-radius:24px; padding:28px;">
                <h3 style="margin:0 0 20px; font-size:1.4rem; font-family:'Outfit'">🧠 Smart Follow-Ups</h3>
                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div style="background:var(--bg-soft); padding:16px; border-radius:12px; border-left:4px solid var(--brand); font-size:0.95rem; line-height:1.4;"><strong style="font-weight:800">Jason Lim</strong> hasn't replied in 6 hours. <br><a href="#" style="color:var(--brand); font-weight:800; text-decoration:none; display:inline-block; margin-top:6px;">Follow up now →</a></div>
                    <div style="background:var(--bg-soft); padding:16px; border-radius:12px; border-left:4px solid var(--brand); font-size:0.95rem; line-height:1.4;"><strong style="font-weight:800">Sarah</strong> viewed 3 properties but paused. <br><a href="#" style="color:var(--brand); font-weight:800; text-decoration:none; display:inline-block; margin-top:6px;">Send AI comparison →</a></div>
                </div>
            </div>
            
            <div class="glass" style="border-radius:24px; padding:28px;">
                <h3 style="margin:0 0 20px; font-size:1.4rem; font-family:'Outfit'">📈 Your Listings</h3>
                <div style="background:#fff; border:1px solid var(--line); border-radius:16px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                    <strong style="display:block; margin-bottom:12px; font-size:1.1rem;">Mont Kiara Condo</strong>
                    <div style="display:flex; justify-content:space-between; font-size:0.95rem; color:var(--muted); font-weight:600;">
                        <span><i class="fas fa-eye" style="color:var(--brand)"></i> 124</span>
                        <span><i class="fas fa-heart" style="color:var(--brand)"></i> 18</span>
                        <span><i class="fas fa-envelope" style="color:var(--brand)"></i> 6</span>
                    </div>
                    <div style="margin-top:16px; padding-top:12px; border-top:1px dashed var(--line); color:#059669; font-weight:800; font-size:0.85rem;"><i class="fas fa-fire"></i> Trending this week</div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Sticky Bottom Speed Bar -->
<div class="agent-only" style="position:fixed; bottom:0; left:0; right:0; background:rgba(255,255,255,0.92); backdrop-filter:blur(24px); border-top:1px solid var(--line); padding:20px 32px; z-index:100; display:flex; justify-content:space-between; align-items:center; box-shadow:0 -8px 40px rgba(84, 51, 25, 0.08);">
    <strong style="font-size:1.4rem; font-weight:800; font-family:'Outfit'; color:var(--ink);"><i class="fab fa-whatsapp" style="color:#25D366; font-size:1.8rem; vertical-align:middle; margin-right:12px;"></i> WhatsApp Speed Bar</strong>
    <div style="display:flex; gap:16px;">
        <button class="btn" style="background:#fff; color:var(--ink); border:2px solid var(--line-strong); box-shadow:none; font-weight:800;">Message Last Lead</button>
        <button class="btn" style="background:#fff; color:var(--ink); border:2px solid var(--line-strong); box-shadow:none; font-weight:800;">Send Property List</button>
        <button class="btn" style="background:#25D366; color:white; border:none; box-shadow:0 8px 24px rgba(37,211,102,0.3); font-weight:800; font-size:1.1rem; padding:12px 28px;">Follow Up All Warm Leads</button>
    </div>
</div>
<!-- ========================================== -->
`;

// Inject HTML right before the spotlights section, which is a good structural break
html = html.replace('<section class="spotlights reveal" id="spotlights">', agentDashboardCore + '\n<section class="spotlights reveal" id="spotlights">');

// We also need to forcefully toggle visibility based on body role:
const cssFix = `
/* Agent Visibility Engine */
.agent-only { display: none !important; }
body.agent .agent-only { display: block !important; }
body.agent .agent-dashboard { display: block !important; }

/* Hide legacy agent inbox when inside super mode */
body.agent #masterAgentControlSection,
body.agent #masterListingManagerSection,
body.agent #masterBookingsSection,
body.agent #masterChatTrackingSection,
body.agent #rentalManagementSection {
    display: none !important; 
}
`;

html = html.replace('</style>', cssFix + '\n</style>');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log("Dopamine Agent Framework Injected!");
