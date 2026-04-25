const fs = require('fs');

let html = fs.readFileSync('dashboard.html', 'utf8');

const regexOldContact = /function contactAgent\(\)\{if\(activeModalId==null\).*?function submitChatMessage/s;
const newContactFn = `async function contactAgent() {
    if(activeModalId==null) return;
    const property = properties.find(p => p.id === activeModalId);
    if(!property) return;
    
    // In the stealth flow, name/message are hidden inputs
    const name = $("leadName").value.trim() || "Stealth Lead";
    const phone = normalizePhone($("leadPhone").value);
    const message = $("leadMessage").value.trim() || "Unlocked Data Pack";
    const btn = $("contactAgentBtn");
    
    if(!phone) {
        alert("Please enter your WhatsApp number to receive the data pack.");
        return;
    }
    
    trackAreaInterest(property.area, "callback");
    const agents = readLocalAgents().filter(item => item.activeToday && item.verified);
    const assigned = agents.length > 0 ? agents[Math.floor(Math.random() * agents.length)] : { phone: "unassigned", name: "Unassigned" };
    
    const leadEntry = {
        id: Date.now(),
        leadName: name,
        leadPhone: phone,
        leadMessage: message,
        listingId: property.id,
        listingTitle: property.title,
        listingPrice: property.price,
        listingArea: property.area,
        assignedAgentPhone: assigned.phone,
        assignedAgentName: assigned.name,
        createdAt: new Date().toISOString()
    };
    
    btn.disabled = true;
    btn.textContent = "Connecting to Server...";
    
    try {
        // Fallback to localStorage
        const items = readLocalLeads();
        writeLocalLeads([leadEntry, ...items]);
        
        // Push Live to Node.js Backend API
        await fetch('http://localhost:3000/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadEntry)
        }).catch(err => console.log('Node Server not running, saved locally only.'));
        
        btn.textContent = "Data Pack Sent! WhatsApp incoming.";
        btn.style.background = "linear-gradient(135deg, #059669, #047857)";
        
        // Give simulated UI feedback
        setTimeout(() => {
            closeModal();
            if(sessionRole==="master"||sessionRole==="agent"){
                loadMasterExecutive();
                loadAgentInbox();
                if($("automationDistributionList")) renderAutomationDistribution();
            }
        }, 2000);
        
    } catch (err) {
        console.error(err);
        btn.disabled = false;
        btn.textContent = "Error. Try Again.";
    }
}
function submitChatMessage`;

if (regexOldContact.test(html)) {
    html = html.replace(regexOldContact, newContactFn);
    fs.writeFileSync('dashboard.html', html, 'utf8');
    console.log('Frontend successfully wired to Node.js /api/leads');
} else {
    console.log('Error: Could not find contactAgent function block to replace');
}
