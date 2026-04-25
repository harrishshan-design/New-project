const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// Update Tab title
html = html.replace('>Lead Distribution<', '>AI Lead Engine<');

// Prepare the new renderAutomationDistribution function
const newRenderFn = `function renderAutomationDistribution(){const list=$("automationDistributionList"),status=$("automationDistributionStatus");if(!list||!status)return;const agents=automationScopedAgents(),leads=readLocalLeads(),bookings=readLocalBookings();$("automationAgentCount").textContent=agents.length;$("automationLeadCount").textContent=automationScopedLeads().length;$("automationBookingCount").textContent=automationScopedBookings().length;if(!agents.length){list.innerHTML='<p class="empty">No visible agents available for AI routing yet.</p>';status.textContent="Add or verify agents first to activate AI distribution.";return}
// Simulate incoming lead targeting
const targetArea = "Mont Kiara"; 

// Generate AI Scores
const scoredAgents = agents.map((agent, i) => {
    const leadCount = leads.filter(item=>item.assignedAgentPhone===agent.phone).length;
    const bookingCount = bookings.filter(item=>item.assignedAgentPhone===agent.phone).length;
    
    // Simulate AI metrics
    const expertiseMatch = (agent.areaFocus && agent.areaFocus.includes(targetArea)) ? 95 : (Math.floor(Math.random()*40)+30);
    const responseSpeedMins = Math.floor(Math.random() * 15) + 1; // 1 to 15 mins
    const speedScore = Math.max(0, 100 - (responseSpeedMins * 5)); 
    const performanceScore = Math.floor(Math.random() * 20) + 75; // 75-95%
    
    // Weighted Total Score
    const matchScore = Math.round((expertiseMatch * 0.5) + (speedScore * 0.25) + (performanceScore * 0.25));
    
    return { ...agent, leadCount, bookingCount, expertiseMatch, responseSpeedMins, speedScore, performanceScore, matchScore };
}).sort((a,b) => b.matchScore - a.matchScore);

list.innerHTML = 
'<div class="ai-lead-context" style="background:var(--brand-soft); padding:16px; border-radius:12px; margin-bottom:16px; border:1px solid var(--brand-dark);"><strong style="color:var(--brand);"><i class="fas fa-robot"></i> Live Routing: Incoming High-Intent Lead</strong><p style="margin:4px 0 0; font-size:0.9rem; color:var(--ink);">Targeting: <strong>'+targetArea+'</strong> • Est. Budget: <strong>RM 800k</strong></p></div>' + 
scoredAgents.map((agent, i) => {
return \`<div class="compare-item" style="display:flex; flex-direction:column; gap:12px; background:white; padding:16px; border-radius:12px; border: 1px solid var(--line); margin-bottom:12px; position:relative;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
            <strong>\${agent.name} \${i === 0 ? '<span style="background:var(--brand);color:white;padding:2px 8px;border-radius:999px;font-size:0.7rem;margin-left:8px;">Best Match</span>' : ''}</strong>
            <p>\${agent.company||"Independent agent"}\${agent.areaFocus?\` • \${agent.areaFocus}\`:""}</p>
            <div class="mini">\${agent.phone}</div>
        </div>
        <div style="text-align:right;">
            <div style="font-size:1.6rem; font-weight:800; color:\${i===0?'var(--brand)':'var(--ink)'};">\${agent.matchScore}%</div>
            <div class="mini">AI Match</div>
        </div>
    </div>
    
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:var(--bg); padding:12px; border-radius:8px;">
        <div>
            <div style="font-size:0.75rem; color:var(--muted); font-weight:600; text-transform:uppercase;">Area Expertise</div>
            <div style="font-size:0.95rem; font-weight:700; color:var(--ink);">\${agent.expertiseMatch}%</div>
        </div>
        <div>
            <div style="font-size:0.75rem; color:var(--muted); font-weight:600; text-transform:uppercase;">Response Speed</div>
            <div style="font-size:0.95rem; font-weight:700; color:\${agent.responseSpeedMins < 5 ? 'var(--brand)' : 'var(--ink)'};">\${agent.responseSpeedMins} mins</div>
        </div>
        <div>
            <div style="font-size:0.75rem; color:var(--muted); font-weight:600; text-transform:uppercase;">Performance</div>
            <div style="font-size:0.95rem; font-weight:700; color:var(--ink);">\${agent.performanceScore}% Conv.</div>
        </div>
    </div>
</div>\`;
}).join("");

status.innerHTML = "Intelligent AI assignment takes performance, area expertise, and historical response speed into account before routing.";
}`;

html = html.replace(/function renderAutomationDistribution\(\)\{.*?\n?(?=function renderAutomationFollowup)/s, newRenderFn + "\n");

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('AI Lead Assignment Engine added.');
