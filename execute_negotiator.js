const fs = require('fs');

let html = "";
try {
    html = fs.readFileSync('dashboard.html', 'utf8');
} catch (e) {
    console.error("Could not read file");
    process.exit(1);
}

// 1. Hooking the User Modal (Add Negotiator UI to `leadFormWrap` sibling or inside)
// Let's find the unlockFinal div and add the Negotiator UI below it when it opens, or as an alternative tab.
// Actually, it's better to put "AI Negotiator" inside `modalEditWrap` or right under `leadFormWrap`.
const newNegotiatorUI = `
<!-- AI Negotiator UI -->
<div id="negotiatorWrap" style="display:none; background:rgba(0,0,0,0.4); border:1px solid rgba(245,158,11,0.3); border-radius:12px; padding:16px; margin-top:24px;">
    <h3 style="margin:0 0 8px; color:var(--gold); font-size:1rem;"><i class="fas fa-handshake"></i> AI Negotiator</h3>
    <p style="margin:0 0 12px; font-size:0.85rem; color:var(--muted);">Propose a lower price directly to the agent. If they accept or counter, you will secure an exclusive price drop.</p>
    <div style="display:flex; gap:8px; margin-bottom:12px;">
        <input type="number" id="negotiatorOfferPrice" class="field" placeholder="E.g. 750000" style="flex:1;">
        <button class="btn" onclick="submitNegotiation()" style="background:linear-gradient(135deg,var(--gold),#d97706);"><i class="fas fa-paper-plane"></i></button>
    </div>
    <div id="negotiatorStatus" style="font-size:0.8rem; color:#10b981;"></div>
</div>
`;

// Insert the negotiatorUI right after leadFormWrap closes.
const leadFormRegex = /(<div class="edit-grid" id="leadFormWrap"[^>]*>.*?<\/div>\s*<\/div>)/s;
if(leadFormRegex.test(html)) {
    html = html.replace(leadFormRegex, '$1\n' + newNegotiatorUI);
} else {
    console.log("Could not find leadFormWrap.");
}

// Ensure the modal fill function shows/hides it. 
// "fillModal" controls what is visible. Add line: $("negotiatorWrap").style.display = sessionRole==="user" ? "block" : "none";
html = html.replace(
    '$("leadFormWrap").classList.toggle("hidden",sessionRole!=="user");',
    '$("leadFormWrap").classList.toggle("hidden",sessionRole!=="user");\n    if($("negotiatorWrap")) $("negotiatorWrap").style.display = sessionRole==="user" ? "block" : "none";\n    if($("negotiatorStatus")) $("negotiatorStatus").textContent = "";\n    if($("negotiatorOfferPrice")) $("negotiatorOfferPrice").value = "";'
);

// 2. Add Negotiation Logic
const negotiationJs = `
async function submitNegotiation() {
    if(!activeModalId) return;
    const property = properties.find(p => p.id === activeModalId);
    const priceInput = $("negotiatorOfferPrice").value.trim();
    if(!priceInput || isNaN(priceInput)) {
        $("negotiatorStatus").textContent = "Please enter a valid price.";
        $("negotiatorStatus").style.color = "#ef4444";
        return;
    }
    const offerPrice = parseInt(priceInput);
    if(offerPrice >= property.price) {
        $("negotiatorStatus").textContent = "Offer must be lower than asking price.";
        $("negotiatorStatus").style.color = "#ef4444";
        return;
    }

    const agents = readLocalAgents().filter(item => item.activeToday && item.verified);
    const assigned = agents.length > 0 ? agents[Math.floor(Math.random() * agents.length)] : { phone: "unassigned", name: "Unassigned" };

    const leadEntry = {
        id: Date.now(),
        leadName: sessionName,
        leadPhone: "Hidden (AI Negotiation)",
        leadMessage: "PROPOSED OFFER: RM " + (offerPrice/1000).toFixed(0) + "k",
        listingId: property.id,
        listingTitle: property.title,
        listingPrice: property.price,
        listingArea: property.area,
        assignedAgentPhone: assigned.phone,
        assignedAgentName: assigned.name,
        createdAt: new Date().toISOString(),
        isNegotiation: true,
        offerPrice: offerPrice,
        offerStatus: "pending" // pending, accepted, countered
    };

    const items = readLocalLeads();
    writeLocalLeads([leadEntry, ...items]);

    $("negotiatorStatus").style.color = "#10b981";
    $("negotiatorStatus").innerHTML = "<i class='fas fa-check'></i> Offer dispatched to agent. Awaiting counter...";
    
    setTimeout(() => closeModal(), 2500);
}

function agentAcceptOffer(leadId) {
    let leads = readLocalLeads();
    let lead = leads.find(l => l.id === leadId);
    if(lead) {
        lead.offerStatus = "accepted";
        lead.finalPrice = lead.offerPrice;
        writeLocalLeads(leads);
        loadAgentInbox();
        alert("Offer accepted! User notified.");
    }
}

function agentCounterOffer(leadId) {
    let counterPriceStr = prompt("Enter your counter offer rock-bottom price (e.g. 780000):");
    if(!counterPriceStr || isNaN(counterPriceStr)) return;
    let counterPrice = parseInt(counterPriceStr);
    
    let leads = readLocalLeads();
    let lead = leads.find(l => l.id === leadId);
    if(lead) {
        lead.offerStatus = "countered";
        lead.finalPrice = counterPrice;
        writeLocalLeads(leads);
        loadAgentInbox();
        alert("Counter-offer dispatched! User's property grid updated.");
    }
}
`;
html = html.replace('function contactAgent', negotiationJs + '\nfunction contactAgent');

// 3. Update loadAgentInbox to render the Negotiation UI
const oldInboxRenderer = /grid\.innerHTML=myLeads\.length\?myLeads\.map\(lead=>\`<article class="card glass">[\s\S]*?<\/article>\`\)\.join\(''\):`<div class="empty">No leads assigned currently\.<\/div>`;/;

const newInboxRenderer = `grid.innerHTML=myLeads.length?myLeads.map(lead=>{
    const timeStr = formatLeadTime(lead.createdAt);
    let extraActions = "";
    if (lead.isNegotiation && lead.offerStatus === "pending") {
        extraActions = \`<div style="margin-top:12px; padding:12px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px;">
            <div style="font-weight:700; color:var(--gold); margin-bottom:8px;">🔥 Offer: RM \${(lead.offerPrice/1000).toFixed(0)}k</div>
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1; background:linear-gradient(135deg,var(--teal),#059669); font-size:0.75rem" onclick="agentAcceptOffer(\${lead.id})">Accept</button>
                <button class="btn" style="flex:1; background:linear-gradient(135deg,var(--brand),#1d4ed8); font-size:0.75rem" onclick="agentCounterOffer(\${lead.id})">Counter</button>
            </div>
        </div>\`;
    } else if (lead.isNegotiation) {
        extraActions = \`<div style="margin-top:12px; color:var(--teal); font-weight:700; font-size:0.8rem;"><i class="fas fa-check-circle"></i> Offer \${lead.offerStatus} at RM \${(lead.finalPrice/1000).toFixed(0)}k</div>\`;
    }

    return \`<article class="card glass">
        <div class="body" style="padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div><h3 style="margin:0; font-size:1.1rem; color:var(--ink);">\${lead.leadName}</h3><p style="margin:0; font-size:0.85rem; color:var(--brand);">\${lead.leadPhone}</p></div>
                <div style="font-size:0.75rem; color:var(--muted); text-align:right;">\${timeStr}</div>
            </div>
            <div style="background:rgba(255,255,255,0.05); border:1px solid var(--line); border-radius:8px; padding:12px;">
                <div style="font-size:0.85rem; color:var(--ink); font-weight:600; margin-bottom:4px;">\${lead.listingTitle}</div>
                <div style="font-size:0.8rem; color:var(--muted);">\${lead.listingArea} &nbsp;&bull;&nbsp; RM \${(lead.listingPrice/1000).toFixed(0)}k</div>
                <div style="margin-top:8px; font-size:0.85rem; color:var(--ink);">\${lead.leadMessage}</div>
            </div>
            \${extraActions}
            <div style="margin-top:16px; display:flex; gap:8px;">
                \${!lead.isNegotiation ? \`<button class="btn" style="flex:1;" onclick="window.location.href='https://wa.me/\${lead.leadPhone.replace(/[^0-9]/g,'')}'">WhatsApp Now</button>\`<button class="btn" style="background:rgba(255,255,255,0.1); color:var(--ink); padding:0 16px;" onclick="logActivity('\${lead.id}')"><i class="fas fa-thumbtack"></i></button>\` : ''}
            </div>
        </div>
    </article>\`
}).join(''):'<div class="empty">No leads assigned currently.</div>';`;

html = html.replace(oldInboxRenderer, newInboxRenderer);


// 4. Update the Grid rendering in renderProperties to override Price
const gridMapFind = /grid\.innerHTML = list\.map\(p => \{/s;
const gridReplacement = `grid.innerHTML = list.map(p => {
        // AI Negotiator UX Override
        let activeBargain = null;
        if(sessionRole === "user") {
            const allLeads = JSON.parse(localStorage.getItem('kvai_local_leads')||'[]');
            activeBargain = allLeads.find(l => l.listingId === p.id && l.leadName === sessionName && l.isNegotiation && (l.offerStatus === "countered" || l.offerStatus === "accepted"));
        }
        
        let priceMarkup = \`<div class="price">\${money(p.price)}</div>\`;
        if(activeBargain) {
            priceMarkup = \`<div style="display:flex; flex-direction:column;">
                <div class="price" style="text-decoration:line-through; font-size:1rem; color:var(--muted); opacity:0.7;">\${money(p.price)}</div>
                <div class="price" style="color:#10b981; font-size:1.7rem; text-shadow:0 0 20px rgba(16,185,129,0.5);">\${money(activeBargain.finalPrice)}</div>
                <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.5); border-radius:999px; font-size:0.65rem; font-weight:700; color:#10b981; padding:2px 8px; text-transform:uppercase; margin-top:4px; max-width:max-content;"><i class="fas fa-lock"></i> Exclusive Price Secured</div>
            </div>\`;
        }
        
`;
html = html.replace(gridMapFind, gridReplacement);

// 5. Apply the priceMarkup logic to the inner map rendering
html = html.replace(/<div class="price">\$\{money\(p\.price\)\}<\/div>/g, '${priceMarkup || `<div class="price">${money(p.price)}</div>`}');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Successfully injected AI Negotiator functionality.');
