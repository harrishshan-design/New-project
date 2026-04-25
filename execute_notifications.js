const fs = require('fs');

let html = fs.readFileSync('dashboard.html', 'utf8');

const regexNotif = /function loadUserNotifications\(\)[\s\S]*?status\.textContent="You have no new notifications.";return\}/;

const newNotif = `function loadUserNotifications(){
    if(sessionRole!=="user")return;
    const status=$("userNotificationStatus"),grid=$("userNotificationGrid");
    
    // Check local leads for any negotiations tied to this user
    const leads = JSON.parse(localStorage.getItem('kvai_local_leads')||'[]');
    const myOffers = leads.filter(l => l.leadName === sessionName && l.isNegotiation && l.offerStatus !== "pending");
    
    // Also include normal documents/bookings if any (we will just render the offers for the simulation here)
    if(myOffers.length > 0) {
        status.textContent = "You have updates on your offers.";
        grid.innerHTML = myOffers.map(o => {
            return \`<article class="card glass" style="padding:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:700; color:var(--ink);">\${o.listingTitle}</div>
                    <div style="font-size:0.8rem; color:var(--muted);">\${formatLeadTime(o.updatedAt || o.createdAt)}</div>
                </div>
                <div style="margin-top:8px; font-size:0.9rem; color:var(--ink);">
                    Agent \${o.assignedAgentName} has <span style="font-weight:700; color:#10b981;">\${o.offerStatus}</span> your offer.
                </div>
                <div style="margin-top:8px; display:inline-block; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:8px 12px; color:#10b981; font-weight:700;">
                    Secured Price: RM \${(o.finalPrice/1000).toFixed(0)}k
                </div>
            </article>\`;
        }).join('');
    } else {
        grid.innerHTML = "";
        status.textContent="You have no new notifications.";
    }
}`;

html = html.replace(regexNotif, newNotif);
fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Notifications Updated');
