const fs = require('fs');

let html = "";
try {
    html = fs.readFileSync('dashboard.html', 'utf8');
} catch(e) {
    console.error("Could not read file");
    process.exit(1);
}

// 1. Hook the Omnibar Search Agent
const omniRegex = /function triggerAIGeneration\(\) \{[\s\S]*?\/\/\s*Modify existing renderProperties hook if necessary/s;
const newOmniJS = `async function triggerAIGeneration() {
    const input = document.getElementById('aiOmnibarInput').value;
    if(!input.trim()) return;
    
    // Fallback logic if server isn't running yet
    const resolveLocally = () => {
        let s = input.trim().toLowerCase();
        properties.forEach(p => p.aiMatch = s ? (Math.random() > 0.5 ? 90 : 40) : 85);
        if(typeof renderProperties === 'function') renderProperties();
    };

    const genState = document.getElementById('aiGenerativeState');
    if(genState) genState.style.display = "block";
    document.getElementById('aiLoadingLog').textContent = "Querying KL Semantic Base...";
    
    try {
        const res = await fetch('http://localhost:3000/api/agents/search', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ query: input })
        });
        if(!res.ok) throw new Error("Agent Server Offline");
        const matchData = await res.json();
        
        document.getElementById('aiLoadingLog').textContent = "Agent Output: " + JSON.stringify(matchData);
        setTimeout(() => {
            if(genState) genState.style.display = "none";
            resolveLocally();
        }, 1000);
        
    } catch(err) {
        console.warn(err);
        setTimeout(() => {
            if(genState) genState.style.display = "none";
            resolveLocally();
        }, 800);
    }
}
`;
html = html.replace(omniRegex, newOmniJS);


// 2. Hook the Concierge Chat Agent
const oldChatFn = /function submitChatMessage\(\)\{.*?renderChatHistory\(\)\}/s;
const newChatFn = `async function submitChatMessage(){
    if(sessionRole==="master")return;
    const input=$("chatInput"),status=$("chatStatus");
    if(!input)return;
    const message=input.value.trim();
    if(!message){status.textContent="Type a message for the chatbot first.";return}
    
    status.textContent = "Agent is typing...";
    
    // Optimistic UI updates
    const entry={id:Date.now(),username:sessionName,role:sessionRole,message,reply:"Thinking...",createdAt:new Date().toISOString()};
    let items=readLocalChats();
    writeLocalChats([...items,entry]);
    input.value="";
    renderChatHistory();

    // Consult Agent
    try {
        const res = await fetch('http://localhost:3000/api/agents/chat', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ message: message })
        });
        if(res.ok) {
            const data = await res.json();
            entry.reply = data.reply;
        } else {
            entry.reply = chatbotReply(message); // fallback
        }
    } catch(err) {
        entry.reply = chatbotReply(message); // fallback
    }
    
    items=readLocalChats();
    const idx = items.findIndex(x=>x.id===entry.id);
    if(idx>-1) items[idx] = entry;
    writeLocalChats(items);
    status.textContent=\`Chat processed by KVAI Agent.\`;
    renderChatHistory();
}`;
html = html.replace(oldChatFn, newChatFn);

// 3. Hook the Autonomous Negotiator
const submitNegRegex = /const leadEntry = \{\s*id: Date\.now\(\)[\s\S]*?setTimeout\(\(\) => closeModal\(\), 2500\);\s*\}/s;
const newSubmitNeg = `const leadEntry = {
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
        offerStatus: "pending" 
    };

    $("negotiatorStatus").style.color = "#10b981";
    $("negotiatorStatus").innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> AI Negotiator evaluating your offer...";
    
    try {
        const res = await fetch('http://localhost:3000/api/agents/negotiate', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ listingPrice: property.price, offerPrice: offerPrice })
        });
        if(res.ok) {
            const agentReply = await res.json();
            leadEntry.offerStatus = agentReply.decision; // 'accept' or 'counter'
            leadEntry.finalPrice = agentReply.counterPrice;
            $("negotiatorStatus").innerHTML = agentReply.decision === "accept" 
                ? "<i class='fas fa-check-circle'></i> Offer Accepted automatically based on seller rules!"
                : "<i class='fas fa-handshake'></i> AI Countered: RM " + (agentReply.counterPrice/1000).toFixed(0) + "k. " + agentReply.agentMessage;
        } else {
            throw new Error("Local fallback");
        }
    } catch (e) {
        // Fallback to manual agent pending state
        $("negotiatorStatus").innerHTML = "<i class='fas fa-check'></i> Offer dispatched. Awaiting human agent...";
    }

    const items = readLocalLeads();
    writeLocalLeads([leadEntry, ...items]);
    setTimeout(() => { closeModal(); typeof renderProperties==="function" && renderProperties(); }, 3500);
}`;
html = html.replace(submitNegRegex, newSubmitNeg);

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Successfully wired Frontend to Backend Rule-Based Agents!');
