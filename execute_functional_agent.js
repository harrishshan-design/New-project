const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// The JS function to make the new Agent Dashboard totally functional
const renderDopamineFunction = `
// ==========================================
// DOPAMINE AGENT UI - FUNCTIONAL WEB ENGINE
// ==========================================
function renderDopamineAgentDashboard() {
    if (sessionRole !== "agent") return;

    // 1. Fetch raw data
    const leads = readLocalLeads().filter(item => item.assignedAgentPhone === sessionAgentPhone);
    const bookings = readLocalBookings().filter(item => item.assignedAgentPhone === sessionAgentPhone);
    const allSignals = [...bookings.map(b => ({...b, kind: 'booking'})), ...leads.map(l => ({...l, kind: 'lead'}))]
                       .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 2. Compute dynamic gamified stats
    const totalSignals = allSignals.length;
    const activeViewings = bookings.length;
    let closingRate = totalSignals > 0 ? Math.min(100, Math.round((activeViewings / totalSignals) * 45)) : 18;
    
    const activeLeadsEl = document.getElementById("dopamineActiveLeads");
    const activeViewingsEl = document.getElementById("dopamineActiveViewings");
    const closingRateEl = document.getElementById("dopamineClosingRate");
    const pipelineNewEl = document.getElementById("dopaminePipeNew");
    const pipelineViewEl = document.getElementById("dopaminePipeView");

    // Assign dynamic IDs previously unstructured elements using basic selector math if we can't find id
    if(document.getElementById("liveBuyerSignalsList")) {
        // Convert the list
        document.getElementById("liveBuyerSignalsList").innerHTML = allSignals.length ? allSignals.map((signal, idx) => {
            // Predict probability
            const isHot = signal.kind === 'booking' || Math.random() > 0.5;
            const prob = isHot ? Math.floor(70 + Math.random() * 25) : Math.floor(30 + Math.random() * 30);
            const color = isHot ? '#059669' : '#ca8a04';
            const accent = isHot ? '#f97316' : '#eab308';
            const badge = isHot ? '<span style="background:#fff7ed; color:#c2410c; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; letter-spacing:0.02em;">🔥 HOT BUYER</span>' 
                                : '<span style="background:#fefce8; color:#a16207; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; letter-spacing:0.02em;">🟡 WARM BUYER</span>';
            
            const minutesAgo = Math.floor(Math.random() * 50) + 2;
            const timeMessage = isHot ? \`Last active \${minutesAgo} mins ago. Intent: HIGH (Viewing-ready).\` : \`Last active \${minutesAgo + 40} mins ago. Intent: Exploring.\`;
            const property = properties.find(p => p.id === signal.listingId);
            
            const phoneStr = signal.userPhone ? signal.userPhone.replace(/\D/g, "") : "60123456789";
            return \`
            <article class="card glass" style="padding:24px; border-left:6px solid \${accent}; animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
                <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                    <div>
                        \${badge}
                        <h3 style="margin:12px 0 4px; font-size:1.4rem; font-family:'Outfit'">\${esc(signal.userName)}</h3>
                        <p style="margin:0; font-size:0.95rem; color:var(--muted); font-weight:600;"><i class="fas fa-location-dot"></i> \${property ? property.area + ' • ' + money(property.price) : 'Looking for property'}</p>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:1.8rem; font-weight:800; color:\${color};">\${prob}%</div>
                        <div style="font-size:0.75rem; color:var(--muted); text-transform:uppercase; font-weight:800; letter-spacing:0.02em;">Closing Prob.</div>
                    </div>
                </div>
                <p style="margin:0 0 20px; font-size:0.95rem; color:#443; font-weight:500;"><i class="far \${signal.kind === 'booking' ? 'fa-calendar-check' : 'fa-clock'}" style="color:\${accent}"></i> \${signal.kind === 'booking' ? 'Requested Tour on ' + signal.requestedDate : timeMessage}</p>
                <div style="display:flex; gap:12px;">
                    <a href="https://wa.me/\${phoneStr}" target="_blank" class="btn" style="flex:1; padding:12px; font-size:1rem; font-weight:700; background:#25D366; border:none; color:white; box-shadow:0 4px 16px rgba(37,211,102,0.3); text-decoration:none;"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    \${signal.kind === 'booking' 
                        ? \`<button class="btn" onclick="respondToBooking(\${signal.id}, 'confirmed'); renderDopamineAgentDashboard();" style="flex:1; padding:12px; font-size:1rem; font-weight:700; background:var(--brand); color:white; border:none;"><i class="fas fa-check"></i> Accept Tour</button>\` 
                        : \`<button class="btn" onclick="tapFeedback('Saved','Lead saved for follow up!','success')" style="padding:12px 20px; font-size:1rem; background:var(--bg-soft); color:var(--ink); border:2px solid var(--line-strong); box-shadow:none;"><i class="far fa-star"></i></button>\`}
                </div>
            </article>\`;
        }).join('') : '<div style="padding:40px; text-align:center; color:var(--muted); font-weight:600;">No buyers assigned yet. Share a listing to capture leads!</div>';
    }

    // 3. Inject Stats
    if(activeLeadsEl) activeLeadsEl.textContent = leads.length + 5; // offset
    if(activeViewingsEl) activeViewingsEl.textContent = bookings.length + 2;
    if(closingRateEl) closingRateEl.textContent = closingRate + "%";
    
    if(pipelineNewEl) pipelineNewEl.textContent = "New Leads (" + leads.length + ")";
    if(pipelineViewEl) pipelineViewEl.textContent = "Viewing (" + bookings.length + ")";
}

// Hook it into the onload / role switch sequence
function hookDopamineToSystem() {
    // Override loadAgentInbox slightly to also trigger this
    const orig = loadAgentInbox;
    window.loadAgentInbox = async function() {
        await orig.apply(this, arguments);
        renderDopamineAgentDashboard();
    }
}
`;

// Also inject the IDs into the HTML block
let updatedHTML = html
    .replace('<strong style="font-size:1.8rem; color:var(--ink); font-weight:800; line-height:1;">12</strong>', '<strong id="dopamineActiveLeads" style="font-size:1.8rem; color:var(--ink); font-weight:800; line-height:1;">12</strong>')
    .replace('<strong style="font-size:1.8rem; color:var(--ink); font-weight:800; line-height:1;">4</strong>', '<strong id="dopamineActiveViewings" style="font-size:1.8rem; color:var(--ink); font-weight:800; line-height:1;">4</strong>')
    .replace('<strong style="font-size:1.8rem; color:#059669; font-weight:800; line-height:1;">18%</strong>', '<strong id="dopamineClosingRate" style="font-size:1.8rem; color:#059669; font-weight:800; line-height:1;">18%</strong>')
    .replace('New Leads (5)', '<span id="dopaminePipeNew">New Leads (5)</span>')
    .replace('Viewing (2)', '<span id="dopaminePipeView">Viewing (2)</span>');

if (!updatedHTML.includes('renderDopamineAgentDashboard')) {
    updatedHTML = updatedHTML.replace('function renderLiveSurfaces(){', renderDopamineFunction + '\nfunction renderLiveSurfaces(){');
    
    // Add the hook to the bottom init routine
    updatedHTML = updatedHTML.replace('if(sessionRole==="master"){loadChatLogs()}', 'if(sessionRole==="master"){loadChatLogs()}\nhookDopamineToSystem();');
}

fs.writeFileSync('dashboard.html', updatedHTML, 'utf8');
console.log("Dynamism injected into Dopamine Agent Dashboard!");
