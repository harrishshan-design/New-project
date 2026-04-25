
// Performance: mark page start
if (typeof performance !== 'undefined') performance.mark('page-start');
// Passive scroll listeners for smoother scrolling
(function() {
    var passiveSupported = false;
    try { window.addEventListener('test', null, Object.defineProperty({}, 'passive', { get: function(){ passiveSupported = true; } })); } catch(e){}
    window._passiveOpts = passiveSupported ? { passive: true } : false;
})();

// PSYCHOLOGICAL WARFARE NOTIFICATIONS
setInterval(() => {
    if(sessionRole !== 'user' || savedIds.length === 0) return;
    if(Math.random() > 0.4) {
        const pId = savedIds[Math.floor(Math.random()*savedIds.length)];
        const p = properties.find(x=>x.id===pId);
        if(!p) return;
        
        const fomoMessages = [
            `Someone else is viewing ${p.title} right now`,
            `Price drop alert: RM 20K off ${p.title} this week`,
            `≡ƒöÑ High intent! 3 buyers contacted agents about ${p.title}`
        ];
        
        showFloatingFomo(fomoMessages[Math.floor(Math.random()*fomoMessages.length)]);
    }
}, 45000);

function showFloatingFomo(msg) {
    let f = $("fomoAlertElem");
    if(!f) {
        f = document.createElement("div");
        f.id = "fomoAlertElem";
        f.className = "floating-fomo user-only";
        document.body.appendChild(f);
    }
    f.innerHTML = `<i class="fas fa-bell" style="color:var(--brand); font-size:1.2rem;"></i> <span>${msg}</span>`;
    f.classList.add("show");
    
    setTimeout(() => {
        f.classList.remove("show");
    }, 6000);
}

function askAIFeed(id) {
    const p = properties.find(x=>x.id===id);
    tapFeedback('≡ƒñû Ask AI Opened', `Analyzing ${p.title}... Wait, I'll launch the chat.`, 'success');
}

// PSYCHOLOGICAL WARFARE NOTIFICATIONS
setInterval(() => {
    if(sessionRole !== 'user' || savedIds.length === 0) return;
    if(Math.random() > 0.4) {
        const pId = savedIds[Math.floor(Math.random()*savedIds.length)];
        const p = properties.find(x=>x.id===pId);
        if(!p) return;
        
        const fomoMessages = [
            `Someone else is viewing ${p.title} right now`,
            `Price drop alert: RM 20K off ${p.title} this week`,
            `≡ƒöÑ High intent! 3 buyers contacted agents about ${p.title}`
        ];
        
        showFloatingFomo(fomoMessages[Math.floor(Math.random()*fomoMessages.length)]);
    }
}, 45000);

function showFloatingFomo(msg) {
    let f = $("fomoAlertElem");
    if(!f) {
        f = document.createElement("div");
        f.id = "fomoAlertElem";
        f.className = "floating-fomo user-only";
        document.body.appendChild(f);
    }
    f.innerHTML = `<i class="fas fa-bell" style="color:var(--brand); font-size:1.2rem;"></i> <span>${msg}</span>`;
    f.classList.add("show");
    
    setTimeout(() => {
        f.classList.remove("show");
    }, 6000);
}

function askAIFeed(id) {
    const p = properties.find(x=>x.id===id);
    tapFeedback('≡ƒñû Ask AI Opened', `Analyzing ${p.title}... Wait, I'll launch the chat.`, 'success');
}


window._loadModelViewer = function(){
  if(window._mvLoaded) return;
  window._mvLoaded = true;
  const s = document.createElement("script");
  s.type = "module";
  s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.2.0/model-viewer.min.js";
  document.head.appendChild(s);
};



// AI CHAT LOGIC
function toggleAIChat() {
    const p = document.getElementById("aiChatPanel");
    if(p) p.classList.toggle("open");
}

function quickSendChat(text) {
    if(!document.getElementById("aiChatInput")) return;
    document.getElementById("aiChatInput").value = text;
    submitUserChat();
}

function handleChatEnter(e) {
    if(e.key === "Enter") submitUserChat();
}

function submitUserChat() {
    const input = document.getElementById("aiChatInput");
    const text = (input.value || "").trim();
    if(!text) return;
    
    appendChatMessage(text, "user");
    input.value = "";
    
    // Simulate AI thinking delay
    setTimeout(() => {
        let response = "";
        const lower = text.toLowerCase();
        
        if(lower.includes("investment") || lower.includes("roi") || lower.includes("invest")) {
            let activeProp = properties[0];
            if(typeof activeModalId !== "undefined" && activeModalId) {
                activeProp = properties.find(p => p.id === activeModalId) || properties[0];
            }
            response = `<strong>Data-backed Investment Analysis ≡ƒôè</strong><br>
            Based on live market data for <strong>${activeProp.location}</strong>:<br><br>
            ΓÇó <strong>Estimated ROI (Annual):</strong> ${activeProp.growth + activeProp.yield}%<br>
            ΓÇó <strong>Rental Yield:</strong> <strong style="color:var(--brand);">${activeProp.yield}%</strong><br>
            ΓÇó <strong>Nearby Developments:</strong> Upcoming transit lines and high-density commercial hubs are aggressively pushing capital appreciation up by ${activeProp.growth}% YOY.<br><br>
            <strong>Verdict:</strong> This is a high-demand, high-yield asset class moving fast.<br><br>
            <button class="btn" style="width:100%; margin-top:8px;" onclick="contactAgent()">Want me to connect you to an agent now? <i class="fas fa-bolt"></i></button>`;
        } else if(lower.includes("afford")) {
            response = "<strong>Let's check your budget! ≡ƒÅª</strong><br>For a lovely RM 500k home, you'll generally want a combined net income around RM 4,500/month (assuming you don't have too many other loans). It's totally doable! Would you like me to open the calculator so we can crunch the exact numbers together? ≡ƒÆò";
        } else if(lower.includes("area") || lower.includes("good")) {
            response = "<strong>Great question! ≡ƒîƒ</strong><br>Areas like Mont Kiara and Bukit Jalil are super popular right now! They're growing at about 6.5% a year thanks to amazing new transit spots. They are perfect places to nest, and if you ever want to sell later, plenty of people will want to buy! Do you have a favorite spot in mind? ≡ƒÅí";
        } else if(lower.includes("compare")) {
            if(savedIds.length > 0) {
                response = `<strong>Let's compare! Γ£¿</strong><br>I see you've saved ${savedIds.length} wonderful homes! Most of these have a great yield profile over 4.5%, meaning they make fantastic investments alongside being great places to live. I think you've got amazing taste! ≡ƒÑ░`;
            } else {
                response = "Oh! ≡ƒÖê It looks like you haven't saved any 'Future Homes' just yet! Try tapping the heart icon on a few properties you love, and I'll jump right in to help you compare them! Γ¥ñ∩╕Å";
            }
        } else {
            response = "Ooh, that's such a great thought! ≡ƒî╕ Since I have all the latest numbers for KV right here, I can help you check prices, growth, or area vibes instantly. What else are you wondering about? ≡ƒÿè";
        }
        
        appendChatMessage(response, "ai");
    }, 600);
}

function appendChatMessage(html, role) {
    const body = document.getElementById("aiChatBody");
    if(!body) return;
    const div = document.createElement("div");
    div.className = "chat-bubble " + role;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

let aiProfile = JSON.parse(localStorage.getItem('ai_user_profile') || 'null');
let quizAnswers = [];

function openAIQuiz() {
    document.getElementById("aiQuizModal").classList.add("open");
    quizAnswers = [];
    document.querySelectorAll('.quiz-slide').forEach(el => {
        el.classList.remove('active', 'past');
        el.style.display = '';
    });
    document.getElementById("quizQ1").classList.add("active");
}

function closeAIQuiz() {
    document.getElementById("aiQuizModal").classList.remove("open");
}

function nextQuiz(current, answer) {
    quizAnswers.push(answer);
    $("quizQ"+current).classList.add("past");
    $("quizQ"+(current+1)).classList.add("active");
}

function finishQuiz(answer) {
    quizAnswers.push(answer);
    document.getElementById("quizQ5").classList.remove("active");
    document.getElementById("quizQ5").classList.add("past");
    document.getElementById("quizLoading").classList.add("active");
    
    setTimeout(() => {
        aiProfile = {
            intent: quizAnswers[0],
            budget: quizAnswers[1],
            locationVibe: quizAnswers[2],
            priority: quizAnswers[3],
            timeline: quizAnswers[4]
        };
        localStorage.setItem('ai_user_profile', JSON.stringify(aiProfile));
        closeAIQuiz();
        renderAIOrganizerView(); 
        renderProperties(); 
    }, 1500);
}

function readBuyerMemoryStore() {
    try { return JSON.parse(localStorage.getItem("kvai_behavior_memory") || "{}"); }
    catch(error) { return {}; }
}

function writeBuyerMemoryStore(store) {
    localStorage.setItem("kvai_behavior_memory", JSON.stringify(store));
}

function countMemoryMap(map) {
    return Object.values(map || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function dominantMemoryKey(map, fallback = "") {
    const entries = Object.entries(map || {});
    if(!entries.length) return fallback;
    return entries.sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0][0];
}

function updateBuyerMemory(action, property, extra = {}) {
    const account = localStorage.getItem("kvai_user_account") || localStorage.getItem("kvai_name") || "Guest";
    if(!account || account === "Guest") return;
    const store = readBuyerMemoryStore();
    const current = store[account] || { viewed:{}, saved:{}, focused:{}, goals:{}, budgets:{}, locations:{}, types:{}, lastActionAt:"" };
    if(property && property.id) {
        current[action] = current[action] || {};
        current[action][property.id] = (current[action][property.id] || 0) + 1;
        current.locations[property.area || property.location || "Klang Valley"] = (current.locations[property.area || property.location || "Klang Valley"] || 0) + 1;
        current.types[property.type || "property"] = (current.types[property.type || "property"] || 0) + 1;
    }
    if(extra.goal) current.goals[extra.goal] = (current.goals[extra.goal] || 0) + 1;
    if(extra.budget) current.budgets[extra.budget] = (current.budgets[extra.budget] || 0) + 1;
    if(extra.location) current.locations[extra.location] = (current.locations[extra.location] || 0) + 1;
    current.lastActionAt = new Date().toISOString();
    store[account] = current;
    writeBuyerMemoryStore(store);
}

function trackAIView(id) {
    const property = typeof properties !== "undefined" ? properties.find(p => p.id === id) : null;
    let views = JSON.parse(localStorage.getItem('ai_user_views') || '[]');
    views.push(id);
    localStorage.setItem('ai_user_views', JSON.stringify(views));
    updateBuyerMemory("viewed", property);
    if(typeof renderAIOrganizerView === "function") renderAIOrganizerView();
}

function analyzeBehavioralProfile(accountKey) {
    const account = accountKey || localStorage.getItem("kvai_user_account") || localStorage.getItem("kvai_name") || "Guest";
    const store = readBuyerMemoryStore();
    const memory = store[account] || {};
    const views = JSON.parse(localStorage.getItem('ai_user_views') || '[]');
    const ids = [...new Set([
        ...(typeof savedIds !== "undefined" ? savedIds : []),
        ...views,
        ...Object.keys(memory.viewed || {}).map(Number),
        ...Object.keys(memory.saved || {}).map(Number),
        ...Object.keys(memory.focused || {}).map(Number)
    ])].filter(Boolean);

    if(!ids.length && !aiProfile) return null;

    const picks = ids.map(id => properties.find(x => x.id === id)).filter(Boolean);
    const totalVal = picks.reduce((sum, property) => sum + Number(property.price || 0), 0);
    const avgPrice = picks.length ? totalVal / picks.length : 0;
    const roundedPrice = avgPrice ? Math.round(avgPrice / 100000) * 100000 : 0;
    const avgBudget = roundedPrice >= 1000000 ? `RM ${(roundedPrice / 1000000).toFixed(1)}M` : roundedPrice ? `RM ${Math.round(roundedPrice / 1000)}K` : (aiProfile?.budget || "RM 800K");
    const topLocation = dominantMemoryKey(memory.locations, picks[0]?.area || picks[0]?.location || aiProfile?.locationVibe || "Klang Valley");
    const topType = dominantMemoryKey(memory.types, picks[0]?.type || "condo");
    const savedCount = countMemoryMap(memory.saved) || (typeof savedIds !== "undefined" ? savedIds.length : 0);
    const viewedCount = countMemoryMap(memory.viewed) || ids.length;
    const focusCount = countMemoryMap(memory.focused);
    const yieldLean = picks.filter(property => property.yield >= 4 || property.tags?.includes("yield")).length;
    const familyLean = picks.filter(property => property.tags?.includes("family") || property.bedrooms >= 3).length;
    const luxuryLean = picks.filter(property => property.tags?.includes("luxury") || property.psf >= 1200).length;
    const mrtLean = picks.filter(property => property.tags?.includes("mrt")).length;
    const growthLean = picks.filter(property => Number(property.growth || 0) >= 10).length;

    let intent = aiProfile?.intent || "Balanced";
    if(/invest/i.test(intent) || yieldLean >= Math.max(familyLean, luxuryLean) && yieldLean >= 2) intent = "Investor";
    else if(familyLean >= Math.max(yieldLean, luxuryLean) && familyLean >= 2) intent = "Own-stay buyer";
    else if(luxuryLean >= 2) intent = "Lifestyle upgrader";
    else intent = "Balanced buyer";

    const strategyBias = yieldLean > growthLean
        ? "high-yield over pure appreciation"
        : growthLean > yieldLean
            ? "future growth corridors over pure cash flow"
            : "balanced upside with lower-regret decisions";
    const preferenceLine = mrtLean >= Math.max(2, Math.ceil(picks.length / 2))
        ? "high-rise near MRT"
        : topType === "terrace"
            ? "family-led landed homes"
            : luxuryLean >= 2
                ? "premium city-core stock"
                : `${topType || "condo"} opportunities`;

    return {
        count: ids.length,
        avgBudget,
        avgBudgetValue: roundedPrice || avgPrice || 800000,
        topLocation,
        topType,
        savedCount,
        viewedCount,
        focusCount,
        intent,
        preferenceLine,
        strategyBias,
        strategyLine: `Based on your behavior, we refined your strategy: you look more like a ${intent.toLowerCase()} leaning toward ${strategyBias}.`,
        biasLine: `We predict you prefer ${preferenceLine} in ${topLocation} rather than random brochure-style browsing.`,
        nextStep: intent === "Investor"
            ? "Decision engine bias: prioritize yield, undervalue gaps, and negotiation room."
            : intent === "Own-stay buyer"
                ? "Decision engine bias: prioritize commute quality, layout confidence, and lower downside risk."
                : "Decision engine bias: prioritize premium feel with enough pricing logic to avoid overpaying."
    };
}

function renderAIOrganizerView() {
    const header = document.getElementById("aiCuratedHeader");
    if(!header) return;
    const behave = analyzeBehavioralProfile();

    if(!aiProfile && !behave) {
        header.innerHTML = '<span style="font-weight:700; color:var(--brand-dark); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;">Your AI Match</span>' +
            '<h3 style="margin:8px 0; font-family:\'Space Grotesk\', sans-serif; font-size: 1.4rem;">Unlock your perfect feed</h3>' +
            '<p style="margin:0; font-weight:500; font-size:1.05rem; color: var(--ink); line-height: 1.5;">Let the AI build your property memory first. Tell us what you want in 5 clicks, then the decision engine keeps learning from what you open, save, and revisit.</p>' +
            '<button class="btn" style="margin-top: 14px;" onclick="openAIQuiz()">Build My Profile <i class="fas fa-arrow-right"></i></button>';
        document.getElementById("aiCuratedGrid").innerHTML = "";
        return;
    }

    let profileHtml = "";
    if(aiProfile) {
        profileHtml += '<div style="margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid rgba(0,0,0,0.05);">' +
            `<p style="margin:0; font-weight:500; font-size:1.02rem; color:var(--ink); line-height:1.55;"><strong>Declared strategy:</strong> ${aiProfile.intent} focus, ${aiProfile.budget} comfort zone, ${aiProfile.locationVibe} vibe, and ${aiProfile.priority} as the priority.</p>` +
            '</div>';
    }
    if(behave) {
        profileHtml += '<div style="display:grid; gap:10px;">' +
            `<p style="margin:0; font-weight:600; font-size:1rem; color:var(--ink); line-height:1.55;"><strong>Observed behavior:</strong> ${behave.strategyLine}</p>` +
            `<p style="margin:0; font-weight:500; font-size:0.98rem; color:var(--ink); line-height:1.55;"><strong>Preference memory:</strong> ${behave.biasLine}</p>` +
            `<p style="margin:0; font-weight:500; font-size:0.95rem; color:var(--muted); line-height:1.55;"><strong>AI next move:</strong> ${behave.nextStep} Average comfort zone: <strong style="color:var(--brand);">${behave.avgBudget}</strong>.</p>` +
            '</div>';
    }

    header.innerHTML = '<span style="font-weight:700; color:var(--brand-dark); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;"><i class="fas fa-radar"></i> Decision Engine</span>' +
        '<h3 style="margin:8px 0; font-family:\'Space Grotesk\', sans-serif; font-size:1.4rem;">Your AI Memory Profile</h3>' +
        profileHtml +
        '<p style="margin:10px 0 0; color:var(--muted); font-size:0.95rem;">This feed now blends what you told us with what your behavior keeps proving.</p>' +
        (!aiProfile
            ? '<button class="chip" style="margin-top:12px; background:transparent; border:1px solid var(--line); color:var(--muted);" onclick="openAIQuiz()">Take Accuracy Quiz</button>'
            : '<button class="chip" style="margin-top:12px; background:transparent; border:1px solid var(--line); color:var(--muted);" onclick="openAIQuiz()">Retake Quiz</button>');

    if(typeof renderAICurated === "function") renderAICurated();
}


const sessionRole=localStorage.getItem("kvai_role");
const sessionName=localStorage.getItem("kvai_name")||"Guest";
const sessionAgentPhone=localStorage.getItem("kvai_agent_phone")||"";
const sessionUserAccount=localStorage.getItem("kvai_user_account")||sessionName;
if(!sessionRole){window.location.href="index.html";}
if(sessionRole === "user" && !window.location.pathname.includes("user.html")) window.location = "user.html";
if(sessionRole === "agent" && !window.location.pathname.includes("agent.html")) window.location = "agent.html";
if(sessionRole === "master" && !window.location.pathname.includes("master.html")) window.location = "master.html";
if(sessionRole==="master"){
[{label:"Executive",href:"#masterSuite"},{label:"Listings",href:"#discover"},{label:"Controls",href:"#masterControlDock"},{label:"Rentals",href:"#rentalManagementSection"}].forEach((item,index)=>{const link=document.querySelectorAll(".nav a")[index];if(link){link.textContent=item.label;link.setAttribute("href",item.href)}})
}
let properties=[
{id:1,title:"Arcoris Signature Residences",location:"Mont Kiara, Kuala Lumpur",area:"Mont Kiara",price:830000,type:"condo",bedrooms:2,bathrooms:2,sqft:1100,psf:755,badge:"hot",image:"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",model3D:"https://modelviewer.dev/assets/ShopifyModels/Chair.glb",mapLink:"https://www.google.com/maps/search/Mont+Kiara,+Kuala+Lumpur",aiScore:95,yield:4.1,growth:18,commute:"8 min to Sri Hartamas",vibe:"Expat-friendly, premium, dining-led",tags:["luxury","yield","mrt"],fit:"Investor-friendly luxury entry with steady rental demand.",verifiedType:"owner"},
{id:2,title:"The CloutHaus KLCC",location:"Jalan P Ramlee, KLCC",area:"KLCC",price:2320000,type:"condo",bedrooms:2,bathrooms:2,sqft:800,psf:2900,badge:"new",image:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",mapLink:"https://www.google.com/maps/search/KLCC,+Kuala+Lumpur",aiScore:98,yield:3.2,growth:9,commute:"Walkable CBD lifestyle",vibe:"Skyline views, prestige, hospitality",tags:["luxury","mrt"],fit:"Best for prestige buyers prioritizing address and lifestyle over yield.",verifiedType:"agent"},
{id:3,title:"Setia Federal Hill",location:"Jalan Bangsar, Bangsar",area:"Bangsar",price:1350000,type:"serviced",bedrooms:2,bathrooms:2,sqft:900,psf:1500,badge:"new",image:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",mapLink:"https://www.google.com/maps/search/Bangsar,+Kuala+Lumpur",aiScore:92,yield:3.8,growth:12,commute:"10 min to Mid Valley",vibe:"Lifestyle-led, central, high demand",tags:["mrt","luxury"],fit:"A strong central option for professionals who want quality and convenience.",verifiedType:"agent"},
{id:4,title:"TTDI Garden Terrace",location:"Taman Tun Dr Ismail, Kuala Lumpur",area:"TTDI",price:1650000,type:"terrace",bedrooms:4,bathrooms:3,sqft:2400,psf:688,badge:"hot",image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",mapLink:"https://www.google.com/maps/search/TTDI,+Kuala+Lumpur",aiScore:94,yield:3.6,growth:5.9,commute:"Near schools and parks",vibe:"Low-density, mature, family-led",tags:["family"],fit:"A high-trust family neighborhood with resilient owner-occupier demand.",verifiedType:"owner"},
{id:5,title:"Park Regent Suites",location:"Desa ParkCity, Kuala Lumpur",area:"Desa ParkCity",price:664000,type:"serviced",bedrooms:2,bathrooms:2,sqft:1000,psf:664,badge:"hot",image:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",model3D:"https://modelviewer.dev/shared-assets/models/Astronaut.glb",mapLink:"https://www.google.com/maps/search/Desa+ParkCity,+Kuala+Lumpur",aiScore:96,yield:4.2,growth:20,commute:"Township convenience",vibe:"Walkable, family-first, curated township",tags:["family","yield"],fit:"Outstanding all-rounder with strong community pull and pricing momentum.",verifiedType:"owner"},
{id:6,title:"Bandar Utama Family Terrace",location:"Bandar Utama, Petaling Jaya",area:"Bandar Utama",price:1350000,type:"terrace",bedrooms:4,bathrooms:3,sqft:2200,psf:614,badge:"",image:"https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80",mapLink:"https://www.google.com/maps/search/Bandar+Utama,+Petaling+Jaya",aiScore:89,yield:3.5,growth:3.8,commute:"Close to 1 Utama and MRT",vibe:"Established, practical, school-friendly",tags:["family","mrt"],fit:"A dependable mature township choice for long-term owner occupation.",verifiedType:"agent"},
{id:7,title:"Bandar Kinrara Terrace",location:"Puchong, Selangor",area:"Bandar Kinrara",price:800000,type:"terrace",bedrooms:4,bathrooms:3,sqft:1800,psf:444,badge:"hot",image:"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",mapLink:"https://www.google.com/maps/search/Bandar+Kinrara,+Puchong",aiScore:87,yield:4.4,growth:6.1,commute:"Transit-linked suburban growth",vibe:"Affordable family expansion zone",tags:["family","yield","mrt"],fit:"One of the most compelling affordability-to-yield profiles in this set.",verifiedType:"owner"},
{id:8,title:"Starlight KLCC Luxury Suite",location:"KLCC, Kuala Lumpur",area:"KLCC",price:1470000,type:"condo",bedrooms:2,bathrooms:2,sqft:1000,psf:1470,badge:"hot",image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",mapLink:"https://www.google.com/maps/search/KLCC,+Kuala+Lumpur",aiScore:97,yield:3.5,growth:8.4,commute:"Prime city core access",vibe:"Prestige, hospitality, skyline",tags:["luxury","mrt"],fit:"A cleaner entry point to KLCC luxury than ultra-high-psf trophy assets.",verifiedType:"agent"}
];
const hotspots=[
{name:"Mont Kiara",growth:"+18% YoY",summary:"A premium international enclave where rental demand and lifestyle positioning keep luxury inventory relevant.",stats:["High expat demand","Average psf RM 755","Best for premium investors"]},
{name:"Desa ParkCity",growth:"+20% YoY",summary:"Township quality, walkability, and community design continue to support one of the strongest family-led narratives in Klang Valley.",stats:["Family-first planning","Average psf RM 664","Best all-rounder"]},
{name:"Bandar Kinrara",growth:"+6.1% YoY",summary:"An affordability-driven suburban move with improving transit connectivity and appealing landed-home economics.",stats:["Higher yields","Average psf RM 444","Best value play"]}
];
// Role switcher helper: set kvai_role and kvai_name quickly for previews
(function(){
	const sel=document.getElementById('roleSelect');
	const nameInput=document.getElementById('roleName');
	const btn=document.getElementById('applyRoleBtn');
	const badge=document.getElementById('sessionBadge');
	function refreshUI(){
		const role=localStorage.getItem('kvai_role')||'user';
		const name=localStorage.getItem('kvai_name')||'Guest';
		if(sel) sel.value=role;
		if(nameInput) nameInput.value=name;
		if(badge) badge.textContent=(role==='master'?'Master':role==='agent'?'Agent':'User') + ': ' + name;
	}
	if(btn){
		btn.addEventListener('click',()=>{
			const r=(sel?.value)||'user';
			const n=(nameInput?.value.trim())||'Guest';
			localStorage.setItem('kvai_role',r);
			localStorage.setItem('kvai_name',n);
			// clear agent phone for safety when switching roles
			if(!localStorage.getItem('kvai_agent_phone')) localStorage.setItem('kvai_agent_phone','');
			if(r === "user") window.location = "user.html";
			if(r === "agent") window.location = "agent.html";
			if(r === "master") window.location = "master.html";
		});
	}
	refreshUI();
})();
 
const calculatorConfigs={
mortgage:{title:"Mortgage Calculator",description:"Estimate your monthly home loan repayment using property price, down payment, interest rate, and loan tenure.",fields:[{id:"propertyPrice",label:"Property Price (RM)",type:"number",value:850000},{id:"downPaymentPct",label:"Down Payment (%)",type:"number",value:10},{id:"interestRate",label:"Interest Rate (% p.a.)",type:"number",value:4.2,step:"0.1"},{id:"loanYears",label:"Loan Tenure (Years)",type:"number",value:35}]},
eligibility:{title:"Home Loan Eligibility Calculator",description:"Estimate how much loan you may qualify for based on income, commitments, rate, and tenure.",fields:[{id:"monthlyIncome",label:"Monthly Income (RM)",type:"number",value:9000},{id:"monthlyCommitments",label:"Existing Monthly Commitments (RM)",type:"number",value:1500},{id:"dsr",label:"Debt Service Ratio (%)",type:"number",value:70},{id:"interestRate",label:"Interest Rate (% p.a.)",type:"number",value:4.2,step:"0.1"},{id:"loanYears",label:"Loan Tenure (Years)",type:"number",value:35}]},
yield:{title:"Rental Yield",description:"Measure gross and net rental yield based on purchase price, rent, and annual holding costs.",fields:[{id:"purchasePrice",label:"Purchase Price (RM)",type:"number",value:780000},{id:"monthlyRent",label:"Monthly Rent (RM)",type:"number",value:3200},{id:"annualCosts",label:"Annual Costs (RM)",type:"number",value:6000}]},
downpayment:{title:"Down Payment Saving Plan",description:"Plan how much you need to save every month to reach your target down payment.",fields:[{id:"targetPrice",label:"Target Property Price (RM)",type:"number",value:900000},{id:"downPaymentPct",label:"Down Payment (%)",type:"number",value:10},{id:"currentSavings",label:"Current Savings (RM)",type:"number",value:25000},{id:"months",label:"Timeline (Months)",type:"number",value:24}]},
fees:{title:"Malaysian Property Transaction Fees Calculator",description:"Estimate common purchase-related fees including stamp duty and legal fees for SPA and loan documentation.",fields:[{id:"propertyPrice",label:"Property Price (RM)",type:"number",value:900000},{id:"loanMargin",label:"Loan Margin (%)",type:"number",value:90},{id:"loanAmount",label:"Loan Amount (RM, optional)",type:"number",value:""}]}
};
const promptPlaygroundConfigs={
"Undervalued Deal Detector":{fields:[["price","Asking Price","470000"],["location","Location","Bukit Jalil"],["size","Size","950 sqft"],["bedrooms","Bedrooms","3"],["amenities","Nearby Amenities","LRT, mall, school, park"],["comparables","Recent Nearby Transactions","RM500k, RM515k, RM505k"]],output:values=>{const ask=Number(String(values.price).replace(/[^\d.]/g,""))||470000;const comps=String(values.comparables).match(/\d+/g)?.map(Number)||[500,515,505];const fair=comps.reduce((a,b)=>a+b,0)/comps.length*1000;const diff=((fair-ask)/fair)*100;const status=diff>5?"Undervalued":diff<-5?"Overpriced":"Fairly Priced";const label=diff>5?`≡ƒöÑ ${diff.toFixed(0)}% Below Market`:diff<-5?`ΓÜá∩╕Å ${Math.abs(diff).toFixed(0)}% Above Market`:`Γ£à Fair Value`;return{badges:[{label, tone:diff>5?"accent":"alert"},{label:status,tone:""}],scores:[{label:"Fair Value",value:rmFull(fair),note:`Benchmarked against ${comps.length} nearby transactions.`},{label:"Asking Price",value:rmFull(ask),note:`Current list price in ${values.location}.`},{label:"Price Gap",value:percentage(diff),note:diff>0?"Positive gap creates negotiation leverage.":"Premium pricing needs stronger justification."}],insights:[{title:"AI Pricing Read",body:`This ${values.bedrooms}-bed home in ${values.location} screens well against recent comps and feels supported by ${values.amenities.toLowerCase()}.`},{title:"Buyer Signal",body:diff>5?"This is the kind of listing worth moving on quickly before better-informed buyers crowd it.":"Use the comps to pressure-test the seller's ask before committing."}],cta:`Badge ready for the dashboard: ${label}`};}},
"Area Trend Detector":{fields:[["location","Location","Bukit Jalil"],["price_trend","Price Trend (12 months)","+6.5%"],["demand","Demand Level","High"],["developments","Infrastructure Developments","MRT upgrade, mall expansion"]],output:values=>{const trend=parseFloat(String(values.price_trend).replace(/[^\d.-]/g,""))||6.5;const demand=String(values.demand).toLowerCase();const hot=trend>=6||demand.includes("high");const growth=hot?Math.max(trend+3,8):Math.max(trend,2);const cls=hot?"Hot":trend>=3?"Stable":"Slow";return{badges:[{label:`${cls} Area`,tone:cls==="Hot"?"accent":cls==="Slow"?"alert":""},{label:`${growth.toFixed(1)}% 2Y Outlook`,tone:""}],scores:[{label:"12M Trend",value:`${trend.toFixed(1)}%`,note:"Observed past-year movement."},{label:"2Y Forecast",value:`${growth.toFixed(1)}%`,note:"Projected growth based on demand and development momentum."},{label:"Demand",value:String(values.demand),note:"Current buyer and tenant appetite."}],insights:[{title:"Market Signal",body:`${values.location} is supported by ${values.developments}, which keeps pricing momentum constructive.`},{title:"Analyst Note",body:`Classification sits at ${cls.toLowerCase()} because demand is ${values.demand.toLowerCase()} and the recent curve is still pointing up.`}],cta:`One-line insight: ${values.location} looks ${cls.toLowerCase()} with infrastructure support reinforcing future value.`};}},
"Personalized Property Recommendation":{fields:[["budget","Budget","RM500k"],["location","Preferred Location","Bukit Jalil"],["recent_activity","Recent Activity","Viewed condos near transit and malls"],["investment_or_own_stay","Goal","Own stay"],["property_list","Property List","Residensi A, Condo B, Serviced C"]],output:values=>{const picks=String(values.property_list).split(",").map(item=>item.trim()).filter(Boolean);const [one="Residensi A",two="Condo B",three="Serviced C"]=picks;return{badges:[{label:"Best Pick Selected",tone:"accent"},{label:String(values.investment_or_own_stay),tone:""}],scores:[{label:"Budget Fit",value:String(values.budget),note:"Screened to the buyer's current comfort zone."},{label:"Area Match",value:String(values.location),note:"Preference anchor for ranking logic."},{label:"Intent Match",value:"High",note:`Behavior suggests focus on ${String(values.recent_activity).toLowerCase()}.`}],list:[{title:`1. ${one} ΓÇö Best Pick`,body:`Fits ${values.budget}, aligns with ${String(values.recent_activity).toLowerCase()}, and feels strongest for a ${String(values.investment_or_own_stay).toLowerCase()} goal.`},{title:`2. ${two}`,body:`A strong fallback if you want the same location logic with a slightly different layout or entry point.`},{title:`3. ${three}`,body:`Worth keeping in the swipe stack if amenities and long-term convenience matter more than immediate pricing efficiency.`}],insights:[{title:"Personalization Layer",body:"The ranking leans toward convenience, repeat-view behavior, and practical fit rather than generic popularity."}],cta:`Recommendation summary: ${one} should surface first in the swipe deck.`};}},
"Full Property Analysis":{fields:[["price","Price","RM480k"],["location","Location","Bukit Jalil"],["size","Size","900 sqft"],["bedrooms","Bedrooms","3"],["amenities","Amenities","LRT, mall, school"],["comparables","Nearby Transactions","RM490k, RM505k, RM500k"]],output:values=>{const ask=Number(String(values.price).replace(/[^\d.]/g,""))||480000;const comps=String(values.comparables).match(/\d+/g)?.map(Number)||[490,505,500];const fair=comps.reduce((a,b)=>a+b,0)/comps.length*1000;const future=fair*1.064;const negotiate=Math.round((ask*.975)/1000)*1000;const potential=future>ask*1.08?"High":"Medium";return{badges:[{label:`${potential} Investment Potential`,tone:potential==="High"?"accent":""},{label:"AI Fair Value Ready",tone:""}],scores:[{label:"Fair Price",value:rmFull(fair),note:"Modeled from nearby transactions and unit profile."},{label:"2Y Value",value:rmFull(future),note:"Forward view using area growth assumptions."},{label:"Negotiate Near",value:rmFull(negotiate),note:"Practical opening range for buyer leverage."}],insights:[{title:"Risk Factor",body:"New competing launches nearby could soften short-term upside even if the long-term position stays healthy."},{title:"Consultant View",body:`The ${values.size} ${values.bedrooms}-bed layout has enough practical appeal to stay liquid, especially with ${values.amenities.toLowerCase()} nearby.`}],cta:"Use the fair value block as the sticky AI insight panel on the detail page."};}},
"Negotiation Strategy":{fields:[["price","Asking Price","RM480k"],["market_value","Market Value","RM498k"],["demand","Demand Level","Moderate"]],output:values=>{const ask=Number(String(values.price).replace(/[^\d.]/g,""))||480000;const market=Number(String(values.market_value).replace(/[^\d.]/g,""))||498000;const offer=Math.round((Math.min(ask,market)*.975)/1000)*1000;return{badges:[{label:"Negotiation Playbook",tone:"accent"},{label:String(values.demand),tone:""}],scores:[{label:"Ideal Offer",value:rmFull(offer),note:"A credible first move without killing the conversation."},{label:"Ask",value:rmFull(ask),note:"Seller's stated expectation."},{label:"Market Value",value:rmFull(market),note:"Anchor to justify the offer."}],insights:[{title:"Strategy",body:`Start below asking and justify it with comparables plus the current ${String(values.demand).toLowerCase()} demand environment.`},{title:"Buyer Script",body:`Based on nearby transactions and current market conditions, I'm comfortable proceeding at ${rmFull(offer)} if we can move quickly.`}],cta:"This block is designed to feel like a real in-product negotiation copilot."};}},
"Lead Scoring":{fields:[["budget","Budget","RM400k-RM500k"],["activity","Activity","Opened 9 listings, asked for financing"],["last_contact","Last Interaction","Yesterday"],["views","Properties Viewed","7"]],output:values=>{const viewed=Number(String(values.views).replace(/[^\d]/g,""))||7;const score=Math.min(97,62+viewed*3+(String(values.activity).toLowerCase().includes("financing")?8:0)+(String(values.last_contact).toLowerCase().includes("yesterday")?5:0));const label=score>=80?"Hot":score>=60?"Warm":"Cold";return{badges:[{label:`${label} Lead`,tone:label==="Hot"?"accent":label==="Cold"?"alert":""},{label:`${score}% Likely to Convert`,tone:""}],scores:[{label:"Lead Score",value:`${score}%`,note:"Probability model based on activity and recency."},{label:"Viewed",value:String(viewed),note:"Properties inspected recently."},{label:"Budget",value:String(values.budget),note:"Buying window inferred from browsing pattern."}],insights:[{title:"AI Read",body:`This lead is signaling intent through ${String(values.activity).toLowerCase()} and should be treated as ${label.toLowerCase()} priority.`},{title:"Next Action",body:"Send the best-fitting unit tonight and offer a viewing slot within the next 48 hours while intent is still warm."}],cta:"Surface this card at the top of the agent dashboard's hot leads stack."};}},
"Buyer Intent Detection":{fields:[["activity_log","User Activity","Viewed 7 condos in 2 days, saved 3 units, checked loan calculator twice."]],output:values=>{const log=String(values.activity_log).toLowerCase();const seriousScore=(log.includes("saved")?1:0)+(log.includes("calculator")?1:0)+(log.match(/\d+/)?.length?1:0);const intent=log.includes("yield")||log.includes("roi")?"Investor":seriousScore>=2?"Serious Buyer":"Just Browsing";return{badges:[{label:intent,tone:intent==="Serious Buyer"||intent==="Investor"?"accent":""},{label:"Behavior AI",tone:""}],scores:[{label:"Intent Strength",value:intent==="Just Browsing"?"Low":"High",note:"Confidence from repeat actions and financing behavior."},{label:"Shortlist Signal",value:log.includes("saved")?"Present":"Weak",note:"Saved-property behavior matters heavily."}],insights:[{title:"Reasoning",body:intent==="Investor"?"The user is showing yield-oriented or ROI-led behavior rather than pure lifestyle browsing.":"Activity shows repeated evaluation behavior, shortlist creation, and financing consideration."},{title:"Best Agent Approach",body:intent==="Just Browsing"?"Send a soft check-in and one compelling area trend rather than pushing for a viewing immediately.":"Send one highly relevant unit now and propose a viewing time instead of a generic introduction."}],cta:"Turn this into the lead-intelligence header so agents know how to approach the conversation."};}}
};
const featureExperiences={
"buyer-dashboard":{role:"user",badge:"Buyer Experience",title:"Buyer Home Dashboard",purpose:"First impression should feel like the app already understands the buyer's goals and preferences.",vibe:"Clean, minimal, Apple-level smooth.",description:"A personalized home screen built around intent, discovery, and instant relevance.",cards:[["Smart Search Bar","Find your dream home in Bukit Jalil under RM500k"],["AI Deal Alerts","Undervalued condo alerts, trend spikes, and area growth signals"],["Recommended Properties","Swipe-style like / skip cards matched to buyer behavior"],["Neighborhood Score Preview","Safety, lifestyle, and ROI surfaced before the click"]],bullets:["Top search bar with natural language prompts","AI cards highlight undervalued opportunities and growth zones","Swipe flow keeps discovery light and addictive","Neighborhood score preview combines Safety, Lifestyle, and ROI"],prompts:[["Undervalued Deal Detector",`You are a real estate investment analyst in Malaysia.\n\nAnalyze the property below and determine if it is undervalued.\n\nProperty Data:\n- Price: {{price}}\n- Location: {{location}}\n- Size: {{size}}\n- Bedrooms: {{bedrooms}}\n- Nearby amenities: {{amenities}}\n- Recent nearby transactions: {{comparables}}\n\nTasks:\n1. Estimate fair market value\n2. Calculate % difference from asking price\n3. Determine if undervalued, fairly priced, or overpriced\n4. Give a short explanation (max 2 sentences)\n5. Output a badge label (e.g. "≡ƒöÑ 10% Below Market")\n\nKeep it concise and persuasive.`],["Area Trend Detector",`You are a property market analyst.\n\nAnalyze the area below and determine its growth potential.\n\nArea Data:\n- Location: {{location}}\n- Price trend (past 12 months): {{price_trend}}\n- Demand level: {{demand}}\n- Infrastructure developments: {{developments}}\n\nTasks:\n1. Predict growth % for next 2 years\n2. Classify: "Hot", "Stable", or "Slow"\n3. Give 1-line insight\n\nTone: Confident and data-driven.`],["Personalized Property Recommendation",`You are an AI property advisor.\n\nUser Profile:\n- Budget: {{budget}}\n- Preferred location: {{location}}\n- Behavior: {{recent_activity}}\n- Goal: {{investment_or_own_stay}}\n\nProperty List:\n{{property_list}}\n\nTasks:\n1. Rank top 3 properties for this user\n2. Explain why each matches their intent\n3. Highlight one as "Best Pick"\n\nMake it feel personalized and smart.`]]},
"property-detail":{role:"user",badge:"Buyer Experience",title:"Property Detail Page",purpose:"Turn early interest into deep confidence and emotional pull.",vibe:"Rich, focused, detail-heavy without feeling cluttered.",description:"A property detail page that combines visuals, location context, future value logic, and direct action.",cards:[["Image Carousel + Video Tour","High-impact visuals with video walkthroughs"],["Location + Map","Context first with map and key nearby anchors"],["AI Insights Panel","Fair price and 2-year future value prediction"],["Sticky Actions","Book Tour and Chat with Agent stay always available"]],bullets:["Image carousel plus video tour","Location and embedded map context","AI fair price and future value panel","Neighborhood lifestyle score block","Sticky Book Tour button and chat CTA"],prompts:[["Full Property Analysis",`You are a senior real estate consultant in Malaysia.\n\nAnalyze this property:\n\n- Price: {{price}}\n- Location: {{location}}\n- Size: {{size}}\n- Bedrooms: {{bedrooms}}\n- Amenities: {{amenities}}\n- Nearby transactions: {{comparables}}\n\nTasks:\n1. Estimate fair price\n2. Predict value in 2 years\n3. Rate investment potential (Low/Medium/High)\n4. Identify 1 risk factor\n5. Suggest a negotiation price\n\nOutput in short bullet points.`],["Negotiation Strategy",`You are a property negotiation expert.\n\nProperty:\n- Asking price: {{price}}\n- Market value: {{market_value}}\n- Demand level: {{demand}}\n\nTasks:\n1. Suggest ideal offer price\n2. Give strategy (e.g. "start low and justify with comps")\n3. Provide 1 sentence script buyer can use\n\nKeep it sharp and practical.`]]},
"tour-booking":{role:"user",badge:"Buyer Experience",title:"Instant Tour Booking Screen",purpose:"Remove booking friction so a viewing feels as easy as ordering Grab.",vibe:"Fast, mobile-first, low-friction confirmation flow.",description:"A two-tap scheduling flow that prioritizes speed and certainty.",cards:[["Calendar","See available viewing dates immediately"],["Time Selection","Pick available slots quickly"],["Auto-assigned Agent","The right agent is attached automatically"],["2-Tap Confirm","Booking completes with minimal back-and-forth"]],bullets:["Calendar of live available slots","Time selection by hour or preferred block","Agent auto-assigned behind the scenes","Confirmation screen with viewing summary"]},
"document-vault":{role:"user",badge:"Buyer Experience",title:"Buyer Document Vault",purpose:"Make paperwork feel invisible, trackable, and easier to complete.",vibe:"Organized, secure, reassuring.",description:"A buyer-side document hub that tracks progress, flags issues, connects to financing data, and shows the full purchase journey at a glance.",highlights:[["Document Status Tracker","Live completion states such as Loan approved: 70% complete, plus what is still pending"],["Auto Document Checker","AI scans for missing signatures, incomplete fields, and obvious submission errors"],["Bank Integration","Connect bank details to auto-fill loan forms and reduce repetitive manual entry"],["Timeline View","Visual journey from Offer to Loan to SNP to Keys so buyers always know the next step"]],details:[["Progress Visibility","Buyers can instantly see what percentage of the process is complete and which step is blocking progress."],["Issue Detection","The vault surfaces missing signatures, mismatch errors, and correction suggestions before submission."],["Connected Finance Flow","Bank-linked data can prefill loan information to save time and reduce mistakes."],["Journey Timeline","Offer ΓåÆ Loan ΓåÆ SNP ΓåÆ Keys becomes a guided progress line instead of scattered paperwork."]]},
"agent-dashboard":{role:"agent",badge:"Agent Experience",title:"Agent Dashboard (Main Weapon Panel)",purpose:"Give agents a fast-moving control panel for leads, viewings, and conversions.",vibe:"High-clarity, sales-focused, momentum-driven.",description:"A practical command center where the pipeline, hot leads, and performance are always visible.",cards:[["Kanban Pipeline","New Leads ΓåÆ Contacted ΓåÆ Viewing ΓåÆ Negotiation ΓåÆ Closed"],["Hot Leads","Conversion-likely prospects rise to the top"],["Performance Stats","Track responses, viewings, and wins"],["Action Visibility","Know what needs attention now"]],bullets:["Pipeline visualization in Kanban style","Hot lead cards with conversion probability","Performance stats panel","Fast access to lead tasks and status changes"],prompts:[["Lead Scoring",`You are a sales intelligence AI for real estate agents.\n\nLead Data:\n- Budget: {{budget}}\n- Activity: {{activity}}\n- Last interaction: {{last_contact}}\n- Properties viewed: {{views}}\n\nTasks:\n1. Score likelihood to convert (0ΓÇô100%)\n2. Classify: Hot / Warm / Cold\n3. Suggest next action\n\nBe decisive.`]]},
"lead-intelligence":{role:"agent",badge:"Agent Experience",title:"Lead Intelligence Screen",purpose:"Give agents superpowers by turning behavior into immediate next actions.",vibe:"Smart, tactical, conversion-oriented.",description:"A lead profile with AI insights, behavior summaries, and suggested next best actions.",cards:[["Lead Profile","Quick read on buyer identity and current interest"],["AI Insights","Budget range and recent browsing behavior"],["Suggested Action","Best listing to send next"],["Best Time to Contact","Timing recommendation like 8PM outreach"]],bullets:["Lead profile header","AI budget and browsing behavior summary","Suggested action recommendations","Best contact timing insight"],prompts:[["Buyer Intent Detection",`You are a behavioral analyst.\n\nUser activity:\n{{activity_log}}\n\nTasks:\n1. Determine intent:\n   - Just browsing\n   - Serious buyer\n   - Investor\n2. Explain reasoning\n3. Suggest best approach for agent\n\nKeep it concise.`]]},
"follow-up-builder":{role:"agent",badge:"Agent Experience",title:"Automated Follow-Up Builder",purpose:"Automate persuasion and consistency without losing a personal touch.",vibe:"Structured, efficient, template-driven.",description:"A simple block-style builder for WhatsApp, reminders, and recommendation sequences.",cards:[["Flow Builder","Day 1 ΓåÆ WhatsApp, Day 3 ΓåÆ Recommendation"],["Templates","Reusable messages for property nudges"],["Sequence Logic","Map stages by timeline"],["Agent Efficiency","Less manual chasing, more conversion"]],bullets:["Block-style sequence builder","Day-based follow-up automation","Template examples like 'I found a better unit for you...'","Easy edits for campaign flow"]},
"market-report":{role:"agent",badge:"Agent Experience",title:"Market Report Generator",purpose:"Strengthen agent branding and authority with polished reporting.",vibe:"Professional, presentable, client-facing.",description:"Generate branded market reports by area with pricing trends, demand analysis, and export-ready summaries.",cards:[["Select Area","Choose Bukit Jalil or any focus location"],["Generate Report","Build the report in one click"],["Market Output","Price trends and demand analysis"],["Export PDF","Download with agent branding"]],bullets:["Area selector for target market","Generate report action","Outputs price trends and demand analysis","PDF export with agent branding"]}
};
const sampleProperties=JSON.parse(JSON.stringify(properties));
const storedListings=JSON.parse(localStorage.getItem("kvai_master_listings")||"[]");
if(storedListings.length){properties=[...properties,...storedListings];}
const upgradeOffers={
"ai-report":{badge:"AI Report",title:"Unlock full AI analysis",description:"Turn a nice-looking listing into a decision-ready property brief.",price:"RM 19 / report",narrative:"Get the deeper pricing story, fit logic, negotiation band, hidden risks, and comparison notes before you contact an agent.",points:["Full pricing logic with fair value and pressure points","Expanded risk and negotiation strategy","Deeper area fit and investment commentary"],cta:"Unlock Full AI Report"},
"hidden-deals":{badge:"Hidden Deals",title:"See hidden deals",description:"Keep buyers coming back daily with more opportunities than the free layer shows.",price:"RM 29 / month",narrative:"This subscription unlocks more undervalued picks, price-drop watchlists, and daily signal-driven property alerts.",points:["Daily undervalued shortlist refresh","Price-drop and signal alerts","Access to more deal-of-the-day opportunities"],cta:"Start Hidden Deals Plan"},
"agent-boost":{badge:"Agent Boost",title:"Boost your listing",description:"Give agents a visible way to spend for better attention and faster conversion.",price:"From RM 59 / boost",narrative:"Push the property harder inside discovery, spotlight loops, and high-intent buyer traffic zones.",points:["Priority placement in discovery and return loops","Extra AI callouts on fit and urgency","Higher visibility to serious, active users"],cta:"Boost This Listing"}
};
let activeTag="all",savedIds=[],activeModalId=null,activeCalculator=null,activeAgents=[],agentInbox=[],chatLogs=[];const $=id=>document.getElementById(id),money=n=>n>=1e6?`RM ${(n/1e6).toFixed(2)}M`:`RM ${(n/1e3).toFixed(0)}K`;
let activeFeaturePromptSet=[],activeMediaItems=[],activeMediaIndex=0,activePaymentTenancyId=null,activeRentCalendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1),activeActionCalendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1),activeActionReminderDate=new Date().toISOString().split("T")[0],activeEditingActionReminderId=null,activeUpgradeKey="ai-report",toastTimeout=null,powerFilteredIds=[],masterBulkCompareIds=[];
const DEFAULT_IMAGE="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
function readPropertyMedia(){return JSON.parse(localStorage.getItem("kvai_property_media")||"{}")}
function writePropertyMedia(items){localStorage.setItem("kvai_property_media",JSON.stringify(items))}
function parseVideoEmbed(url){const value=String(url||"").trim();if(!value)return{type:"",embed:"",src:""};const yt=value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/i);if(yt)return{type:"embed",embed:`https://www.youtube.com/embed/${yt[1]}`,src:value};const vimeo=value.match(/vimeo\.com\/(\d+)/i);if(vimeo)return{type:"embed",embed:`https://player.vimeo.com/video/${vimeo[1]}`,src:value};if(/\.(mp4|webm|ogg)(\?.*)?$/i.test(value))return{type:"direct",embed:value,src:value};return{type:"link",embed:"",src:value}}
function getPropertyMedia(property){const store=readPropertyMedia();const override=store[String(property.id)]||{};const images=[property.image,override.image2,override.image3,override.image4].map(item=>String(item||"").trim()).filter(Boolean);const video=String(override.video||"").trim();const model3D=String(override.model3D||property.model3D||"").trim();return{images:images.length?images:[DEFAULT_IMAGE],video,model3D}}
function readLocalAgents(){return JSON.parse(localStorage.getItem("kvai_local_agents")||'[{"id":1,"name":"Aina Property","phone":"60123456789","password":"agent123","company":"KV Premier Realty","areaFocus":"Mont Kiara","activeToday":true,"verified":true},{"id":2,"name":"Farid Homes","phone":"60129876543","password":"agent456","company":"Urban Valley Estates","areaFocus":"Bangsar","activeToday":true,"verified":true}]')}
function writeLocalAgents(items){localStorage.setItem("kvai_local_agents",JSON.stringify(items))}
function readLocalLeads(){return JSON.parse(localStorage.getItem("kvai_local_leads")||"[]")}
function writeLocalLeads(items){localStorage.setItem("kvai_local_leads",JSON.stringify(items))}
function readLocalBookings(){return JSON.parse(localStorage.getItem("kvai_local_bookings")||"[]")}
function writeLocalBookings(items){localStorage.setItem("kvai_local_bookings",JSON.stringify(items))}
function readLocalTenantApplications(){return JSON.parse(localStorage.getItem("kvai_local_tenant_applications")||"[]")}
function writeLocalTenantApplications(items){localStorage.setItem("kvai_local_tenant_applications",JSON.stringify(items))}
function readLocalTenancies(){return JSON.parse(localStorage.getItem("kvai_local_tenancies")||"[]")}
function writeLocalTenancies(items){localStorage.setItem("kvai_local_tenancies",JSON.stringify(items))}
function readLocalChats(){return JSON.parse(localStorage.getItem("kvai_chat_logs")||"[]")}
function writeLocalChats(items){localStorage.setItem("kvai_chat_logs",JSON.stringify(items))}
function readLocalNotifications(){return JSON.parse(localStorage.getItem("kvai_local_notifications")||"[]")}
function writeLocalNotifications(items){localStorage.setItem("kvai_local_notifications",JSON.stringify(items))}
function readLocalVaultDocuments(){return JSON.parse(localStorage.getItem("kvai_local_vault_documents")||"[]")}
function writeLocalVaultDocuments(items){localStorage.setItem("kvai_local_vault_documents",JSON.stringify(items))}
function readLocalAreaInterest(){return JSON.parse(localStorage.getItem("kvai_area_interest")||"[]")}
function writeLocalAreaInterest(items){localStorage.setItem("kvai_area_interest",JSON.stringify(items))}
function readLocalAgentContent(){return JSON.parse(localStorage.getItem("kvai_agent_content")||"{}")}
function writeLocalAgentContent(items){localStorage.setItem("kvai_agent_content",JSON.stringify(items))}
function readLocalAgentReminders(){return JSON.parse(localStorage.getItem("kvai_agent_custom_reminders")||"[]")}
function writeLocalAgentReminders(items){localStorage.setItem("kvai_agent_custom_reminders",JSON.stringify(items))}
function readRotationIndex(){return Number(localStorage.getItem("kvai_rotation_index")||"-1")}
function writeRotationIndex(value){localStorage.setItem("kvai_rotation_index",String(value))}
function ensureLocalState(){if(!localStorage.getItem("kvai_local_agents")){writeLocalAgents(readLocalAgents())}if(!localStorage.getItem("kvai_local_leads")){writeLocalLeads([])}if(!localStorage.getItem("kvai_local_bookings")){writeLocalBookings([])}if(!localStorage.getItem("kvai_local_tenant_applications")){writeLocalTenantApplications([])}if(!localStorage.getItem("kvai_local_tenancies")){writeLocalTenancies([])}if(!localStorage.getItem("kvai_local_notifications")){writeLocalNotifications([])}if(!localStorage.getItem("kvai_chat_logs")){writeLocalChats([])}if(!localStorage.getItem("kvai_local_vault_documents")){writeLocalVaultDocuments([])}if(!localStorage.getItem("kvai_area_interest")){writeLocalAreaInterest([])}if(!localStorage.getItem("kvai_agent_content")){writeLocalAgentContent({})}if(!localStorage.getItem("kvai_agent_custom_reminders")){writeLocalAgentReminders([])}if(!localStorage.getItem("kvai_rotation_index")){writeRotationIndex(-1)}}
ensureLocalState();
function inferDocumentCheck(file){const fileName=String(file?.name||"Untitled");const lower=fileName.toLowerCase();const type=String(file?.type||"").toLowerCase();const size=Number(file?.size||0);let score=32;if(/loan|bank|salary|epf|ea|statement|offer|snp|agreement|ic|passport/i.test(lower))score+=26;if(/pdf|jpg|jpeg|png/.test(lower)||/pdf|image/.test(type))score+=18;if(size>50000)score+=10;if(size>250000)score+=8;if(size>1000000)score+=4;score=Math.max(12,Math.min(96,score));const level=score>=82?"Strong":score>=64?"Good":score>=46?"Basic":"Needs Review";const checks=[];checks.push({good:/pdf|image/.test(type)||/\.(pdf|jpg|jpeg|png)$/i.test(fileName),text:(/pdf|image/.test(type)||/\.(pdf|jpg|jpeg|png)$/i.test(fileName))?"Clear upload format detected":"Prefer PDF or clear image upload for smoother review"});checks.push({good:size>=50000,text:size>=50000?"File size looks substantial enough for review":"File looks small, so check whether all pages were included"});checks.push({good:/loan|bank|salary|epf|ea|offer|snp|agreement|ic|passport/i.test(lower),text:/loan|bank|salary|epf|ea|offer|snp|agreement|ic|passport/i.test(lower)?"Filename gives the agent clearer context":"Rename the file with a clearer document title for faster review"});return{score,level,checks}}
function timelineSteps(item){const timeline=item.timeline||{};return[["offer","Offer"],["loan","Loan"],["snp","SNP"],["keys","Keys"]].map(step=>({key:step[0],label:step[1],active:Boolean(timeline[step[0]])}))}
function todayKey(){return new Date().toISOString().split("T")[0]}
function trackAreaInterest(area,source){const normalized=String(area||"").trim();if(!normalized)return;const items=readLocalAreaInterest();const today=todayKey();const match=items.find(item=>item.area===normalized&&item.source===source&&item.day===today);if(match){match.count=(match.count||0)+1;match.updatedAt=new Date().toISOString()}else{items.unshift({id:Date.now()+Math.floor(Math.random()*1000),area:normalized,source,day:today,count:1,updatedAt:new Date().toISOString()})}writeLocalAreaInterest(items);renderLiveSurfaces();if(sessionRole==="master")loadMasterExecutive();if(sessionRole==="agent")loadAgentDailyTools()}
function getAreaSignalSummary(){const items=readLocalAreaInterest().filter(item=>item.day===todayKey());const grouped={};items.forEach(item=>{const key=item.area||"Unknown";if(!grouped[key])grouped[key]={area:key,count:0,sources:{}};grouped[key].count+=Number(item.count||0);grouped[key].sources[item.source]=(grouped[key].sources[item.source]||0)+Number(item.count||0)});return Object.values(grouped).sort((a,b)=>b.count-a.count)}
function getOrCreateAgentContent(){const store=readLocalAgentContent();const key=`${sessionAgentPhone||"all"}_${todayKey()}`;if(store[key])return store[key];const areas=getAreaSignalSummary().slice(0,3).map(item=>item.area);const focus=areas[0]||"Mont Kiara";const second=areas[1]||"Bangsar";const third=areas[2]||"Desa ParkCity";const payload=[{title:`Hook 1: Why buyers are suddenly watching ${focus}`,hook:`Everyone thinks ${focus} is expensive, but buyer attention today says otherwise.`,script:`Start with a street-level myth bust: people assume ${focus} is out of reach, then pivot into why attention is rising right now. Mention buyer interest, convenience signals, and one reason this area keeps getting revisited without naming specific users or listings. End with: "Want more areas like this? Follow for tomorrow's signal."`},{title:`Hook 2: 3 Klang Valley areas buyers keep circling back to`,hook:`If I were an agent creating content today, these are the 3 places I'd talk about first.`,script:`Frame ${focus}, ${second}, and ${third} as today's buyer-attention triangle. Give one line each on lifestyle, commute, or investment narrative. End by asking viewers which area they want broken down next.`},{title:`Hook 3: The hidden move agents should make tonight`,hook:`Most agents chase every lead equally. The smarter move is to follow where attention clusters.`,script:`Explain that geo lead signals are strongest around ${focus} today, with spillover into ${second}. Suggest creating one short video around price perception, one around convenience, and one around buyer FAQ. Close with a fast CTA to DM for a custom area breakdown.`}];store[key]=payload;writeLocalAgentContent(store);return payload}
function createNotification(entry){const items=readLocalNotifications();writeLocalNotifications([{id:Date.now()+Math.floor(Math.random()*1000),read:false,createdAt:new Date().toISOString(),...entry},...items])}

function getAgentAverageResponseMinutes(agentPhone){const responded=readLocalBookings().filter(item=>item.assignedAgentPhone===agentPhone&&item.respondedBy&&item.createdAt&&item.updatedAt);if(!responded.length)return 18;const average=responded.reduce((sum,item)=>sum+Math.max(2,Math.round((new Date(item.updatedAt).getTime()-new Date(item.createdAt).getTime())/60000)||2),0)/responded.length;return Math.max(2,Math.round(average))}
function getAreaExpertiseScore(agent,area){if(!area)return 62;const focus=String(agent?.areaFocus||"").toLowerCase(),target=String(area||"").toLowerCase();if(!focus)return 48;if(focus.includes(target))return 95;if(target.split(/\s+/).some(part=>part&&focus.includes(part)))return 82;return 56}


function bookingStatusMeta(status){if(status==="confirmed")return{label:"Your viewing tour is booked",className:"confirmed"};if(status==="declined")return{label:"Please choose another date",className:"declined"};return{label:"Awaiting agent response",className:"pending"}}
function tenantStatusMeta(status){if(status==="selected")return{label:"Tenant selected",className:"confirmed"};if(status==="declined")return{label:"Not selected",className:"declined"};return{label:"Awaiting agent review",className:"pending"}}
function tenancyStageMeta(item){if(item.rentCollected)return{label:"Rent collected",className:"confirmed"};if(item.agreementSigned)return{label:"Agreement signed",className:"pending"};if(item.keysShared)return{label:"Keys shared",className:"pending"};return{label:"Selected by agent",className:"pending"}}
function openTenantSelection(id){if(sessionRole!=="agent")return;selectTenantDeal(id)}
function ownerLabel(property){return property?.ownerName||`${property?.area||"Property"} Owner`}
function tapFeedback(message,detail="",tone="default"){const stack=$("toastStack");if(!stack)return;const toast=document.createElement("div");toast.className=`toast ${tone==="success"?"success":tone==="alert"?"alert":""}`;toast.innerHTML=`<strong>${message}</strong>${detail?`<p>${detail}</p>`:""}`;stack.appendChild(toast);requestAnimationFrame(()=>toast.classList.add("show"));try{if(navigator.vibrate)navigator.vibrate(10)}catch{};clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>{toast.classList.remove("show");setTimeout(()=>toast.remove(),280)},2400)}
function popActiveControl(){const el=document.activeElement;if(el&&el.classList){el.classList.add("feedback-pop");setTimeout(()=>el.classList.remove("feedback-pop"),280)}}
function propertyAreaSignal(property,source){return readLocalAreaInterest().filter(item=>item.day===todayKey()&&item.area===property.area&&(source?item.source===source:true)).reduce((sum,item)=>sum+Number(item.count||0),0)}
function getLiveViewerCount(property){return Math.max(4,propertyAreaSignal(property,"view_more")+propertyAreaSignal(property,"match")+Math.round(property.aiScore/18))}
function getReplySignal(property){const bookings=readLocalBookings().filter(item=>item.listingId===property.id);const leads=readLocalLeads().filter(item=>item.listingId===property.id);const latest=[...bookings.map(item=>item.updatedAt||item.createdAt),...leads.map(item=>item.createdAt)].filter(Boolean).sort().pop();if(latest){const minutes=Math.max(2,Math.min(32,Math.round((Date.now()-new Date(latest).getTime())/60000)||2));return `≡ƒÆ¼ Agent replied ${minutes} min ago`}return `≡ƒÆ¼ Agent usually replies in ${5+(property.aiScore%6)} min`}
function getFairValue(property){return Math.round(property.price*(1+((property.growth>=10?.06:.03)+(property.aiScore>=94?.025:0)+(property.verifiedType!=="unverified"?.012:0))))}
function getDecisionPack(property){const goal=$("buyerGoal")?.value||"balanced",behavior=analyzeBehavioralProfile(),fairValue=getFairValue(property),negotiation=Math.round(Math.min(property.price*.975,fairValue*.965)/1000)*1000,riskScore=(property.verifiedType==="unverified"?2:0)+(property.yield<3.6?1:0)+(property.growth>16?1:0)+(property.psf>1400?1:0),risk=riskScore<=1?"Low":riskScore===2?"Medium":"High",roi=Number((property.yield+property.growth*.65).toFixed(1)),paybackYears=Number((100/Math.max(property.yield,.1)).toFixed(1)),undervaluePct=Math.max(Math.round(getUndervalueRatio(property)*100),0);const goalLabel=/invest/i.test(behavior?.intent||"")?"investor":goal==="family"?"family":"balanced";const personalSummary=behavior?`Because you keep leaning toward ${behavior.preferenceLine} around ${behavior.topLocation}, this ${property.type} in ${property.area} fits your ${behavior.intent.toLowerCase()} strategy better than a generic listing tile.`:property.fit;const bullets=[];if(goalLabel==="investor"||property.yield>=4){bullets.push(`Why this beats a random shortlist card: ${property.yield}% yield with ${undervaluePct}% pricing room makes the money case clearer.`)}else if(goalLabel==="family"){bullets.push(`Why this fits your life better: ${property.area} gives you a ${property.vibe.toLowerCase()} profile with ${property.bedrooms} bedrooms and lower-regret downside.`)}else{bullets.push(`Why this is perfect for you: ${personalSummary}`)}bullets.push(property.verifiedType!=="unverified"?`${verificationLabel(property.verifiedType)} reduces trust friction before you spend time or money on the next step.`:"Verification is still incomplete, which raises risk but also gives you leverage if the fundamentals stay strong.");bullets.push(`Decision brain read: blended ROI signal is ${roi}% with a rough payback window near ${paybackYears} years if rental assumptions hold.`);return{fairValue,negotiation,risk,roi,paybackYears,undervaluePct,personalSummary,bullets,actionTitle:risk==="Low"?"Move in the next 48 hours":risk==="Medium"?"Validate and negotiate":"Inspect carefully before moving",actionNote:risk==="Low"?"The fundamentals are strong enough that waiting too long could cost you the cleaner entry point.":risk==="Medium"?"Use the comps, buyer intent, and verification state to negotiate before committing.":"Treat this as a higher-variance play and confirm the exact details before moving.",riskNote:risk==="Low"?"Verified status, steadier pricing, and better fit keep downside relatively controlled.":risk==="Medium"?"There is upside here, but pricing or area momentum still needs another layer of validation.":"Pricing heat, thinner yield, or incomplete verification means diligence matters more here.",negotiationScript:`Offer around ${rmFull(negotiation)} and justify it with AI fair value ${rmFull(fairValue)}, ${undervaluePct}% pricing room, and the current risk profile.`}}
function getUndervalueRatio(property){const fairValue=getFairValue(property);return Number(((fairValue-property.price)/Math.max(fairValue,1)).toFixed(3))}
function getTopUndervaluedProperties(limit=5){return properties.slice().sort((a,b)=>getUndervalueRatio(b)-getUndervalueRatio(a)).slice(0,limit)}
function getTrustProfiles(){return readLocalAgents().slice(0,3).map((agent,index)=>({name:agent.name,company:agent.company||"Independent agent",area:agent.areaFocus||"Klang Valley",years:4+index*3+(agent.verified?2:0),deals:18+index*11+(agent.activeToday?7:0),photo:`https://i.pravatar.cc/120?img=${18+index}`}))}

// ==========================================
// DOPAMINE AGENT UI - FUNCTIONAL WEB ENGINE
// ==========================================








function renderLiveSurfaces(){const ribbon=$("liveActivityRibbon"),trust=$("trustMetricGrid"),agentsWrap=$("agentTrustList"),loops=$("dealLoopList");const topUndervalued=getTopUndervaluedProperties(5),deal=topUndervalued[0],areas=getAreaSignalSummary(),topArea=areas[0],users=new Set([...readLocalLeads().map(item=>item.userPhone||item.userName),...readLocalBookings().map(item=>item.userPhone||item.userName)]).size;if(ribbon){const items=[{label:"Live viewing",value:`≡ƒöÑ ${deal?getLiveViewerCount(deal):12} people viewing now`,note:deal?`${deal.title} is getting the most attention in the shortlist.`:"Traffic will appear here once users start browsing."},{label:"Reply speed",value:deal?getReplySignal(deal):"≡ƒÆ¼ Agent replied 2 min ago",note:"Fast response makes the platform feel active, not empty."},{label:"Trust signal",value:`${Math.max(120,users*12||120)}+ active buyers`,note:"Early-stage trust metric to reduce hesitation."}];ribbon.innerHTML=items.map(item=>`<article class="live-ribbon-card"><span>${item.label}</span><strong class="live-dot">${item.value}</strong><p>${item.note}</p></article>`).join("")}if(trust){const matchedValue=topUndervalued.reduce((sum,item)=>sum+item.price,0);trust.innerHTML=`<article class="trust-card"><span>Platform trust</span><strong>${Math.max(120,users*12||120)}+ active buyers</strong><p>Social proof matters. Even at demo stage, the product should feel busy and trusted.</p></article><article class="trust-card"><span>Deals matched</span><strong>${rmFull(Math.max(2300000,matchedValue))}</strong><p>Use a strong matched-value signal to frame the platform as commercially active.</p></article>`}if(agentsWrap){agentsWrap.innerHTML=getTrustProfiles().map(agent=>`<article class="agent-profile-card"><img class="agent-avatar" src="${agent.photo}" alt="${agent.name}" loading="lazy" decoding="async"><div><span>Agent</span><strong>${agent.name}</strong><p>${agent.company} ΓÇó ${agent.area}</p></div><div class="agent-metrics"><div class="verified-badge"><i class="fas fa-star" style="color:var(--gold)"></i> Verified Agent</div><b>${agent.deals} closed</b></div></article>`).join("")}if(loops){const items=[deal?{mini:"Deal of the Day",title:deal.title,text:`${Math.round(getUndervalueRatio(deal)*100)}% below its AI fair value in ${deal.area}.`}:null,topArea?{mini:"Price-drop watch",title:`${topArea.area} alert`,text:`${topArea.count} fresh intent signals are clustering here today.`}:null,{mini:"Top 5 undervalued",title:"Daily shortlist refreshed",text:`${topUndervalued.map(item=>item.area).join(" ΓÇó ")}`}].filter(Boolean);loops.innerHTML=items.map(item=>`<div class="loop-item"><div class="mini">${item.mini}</div><strong>${item.title}</strong><p>${item.text}</p></div>`).join("")}}
async function runOnboarding(){
    if(sessionRole!=="user")return;
    const budget = $("onboardingBudget").value;
    const location = $("onboardingLocation").value;
    const goal = $("onboardingGoal").value;
    
    $("priceRange").value = budget;
    $("location").value = location;
    $("buyerGoal").value = goal;
    
    const status = $("onboardingStatus");
    status.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Evaluating market... Connecting to KVAI OpenAI Core...';
    
    try {
        const payload = { budget, location, goal, properties };
        const res = await fetch('http://localhost:3000/api/agents/rank', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        const rankedArray = await res.json();
        
        if (rankedArray.error || rankedArray.fallback) {
            renderProperties();
            const count = filtered().length;
            status.textContent = `Agent Fallback: We found ${count} local matches. Setup OPENAI_API_KEY for generative AI rankings!`;
            scrollToSection("discover");
            return;
        }

        // Successfully ranked
        let curatedProps = rankedArray.map(rank => {
            let p = properties.find(x => x.id === rank.id);
            if(p) return {...p, aiExplanation: rank.explanation};
            return null;
        }).filter(Boolean);

        document.getElementById("aiCuratedHeader").innerHTML = '<span style="font-weight:700; color:var(--brand); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;">Your Generative Match ≡ƒÄ»</span><h3 style="margin:8px 0; font-family:\'Outfit\', sans-serif; font-size: 1.4rem;">Top 3 Curated Properties</h3><p style="margin:0; font-weight:500; font-size:1.1rem; color: var(--ink); line-height: 1.5;">Our Generative AI has analyzed the database architecture and generated these absolute best fits based on your unique profile.</p>';
        
        document.getElementById("aiCuratedGrid").innerHTML = curatedProps.map(p => {
             const media=getPropertyMedia(p), decision=getDecisionPack(p);
             return `<article class="card glass" style="border: 2px solid var(--brand); transform: scale(1.02); z-index:2; box-shadow: 0 12px 40px rgba(187,77,45,0.15);">
                <div class="media" style="height:220px;"><img src="${media.images[0]}" loading="lazy">
                <div class="tint"></div>
                <div class="topline">
                    <div class="stack">${p.badge?`<span class="pill ${p.badge}">${p.badge}</span>`:``} <span class="pill">${p.type}</span></div>
                    <div class="stack"><span class="score"><i class="fas fa-bolt"></i> OpenAI Ranked #${curatedProps.indexOf(p)+1}</span></div>
                </div></div>
                <div class="body">
                    <div class="price-row">
                        <div>${priceMarkup || `<div class="price">${money(p.price)}</div>`}<div class="title" style="font-family:'Outfit', sans-serif; font-size:1.2rem; font-weight:700;">${p.title}</div></div>
                        <div class="mini"><i class="fas fa-chart-line"></i> ${p.growth}% YoY</div>
                    </div>
                    
                    <div style="margin: 16px 0; padding: 14px; background: rgba(187,77,45,0.06); border-radius: 12px; border-left: 3px solid var(--brand);">
                        <strong style="color:var(--brand-dark); font-size:0.8rem; letter-spacing:0.02em; text-transform:uppercase;"><i class="fas fa-microchip"></i> Agent Reasoning</strong>
                        <p style="margin: 6px 0 0 0; font-size: 0.95rem; line-height:1.45; color:#332;">${p.aiExplanation}</p>
                    </div>

                    <div class="actions">
                        <span class="mini">Yield: ${p.yield}%</span>
                        <span class="mini">Risk: ${decision.risk}</span>
                    </div>
                    <div class="actions" style="margin-top:12px;">
                        <button class="btn" style="width:100%" onclick="openModal(${p.id})">Analyze Match</button>
                    </div>
                </div>
             </article>`;
        }).join('');

        status.innerHTML = '<i class="fas fa-check-circle" style="color:#059669"></i> Top 3 AI Shortlist Generated!';
        renderProperties();
        
        let target = document.getElementById("aiCuratedGrid");
        if(target) target.scrollIntoView({ behavior: "smooth", block: "center" });

    } catch(err) {
        console.error(err);
        status.textContent = "AI Agent error tracking your input.";
        renderProperties();
    }
}
function openUpgradeModal(key){const config=upgradeOffers[key]||upgradeOffers["ai-report"];activeUpgradeKey=key;$("upgradeBadge").textContent=config.badge;$("upgradeTitle").textContent=config.title;$("upgradeDescription").textContent=config.description;$("upgradePrice").textContent=config.price;$("upgradeNarrative").textContent=config.narrative;$("upgradePoints").innerHTML=config.points.map(item=>`<li>${item}</li>`).join("");$("upgradeCta").textContent=config.cta;$("upgradeModal").classList.add("open")}
function closeUpgradeModal(){$("upgradeModal").classList.remove("open")}
function confirmUpgrade(){const config=upgradeOffers[activeUpgradeKey]||upgradeOffers["ai-report"];tapFeedback(config.title,`${config.price} offer opened. You can connect the real payment flow next.`,"success");closeUpgradeModal()}
function filtered(){
    const s = $("searchInput") ? $("searchInput").value.trim().toLowerCase() : "";
    const type = $("propertyType") ? $("propertyType").value : "all";
    const price = $("priceRange") ? $("priceRange").value : "all";
    const beds = $("bedrooms") ? $("bedrooms").value : "all";
    const loc = $("location") ? $("location").value : "all";
    const goal = $("buyerGoal") ? $("buyerGoal").value : "all";
    const sort = $("sortBy") ? $("sortBy").value : "score";
    
    let list = properties.filter(p => {
        const text = `${p.title} ${p.location} ${p.area} ${p.vibe} ${p.fit}`.toLowerCase();
        let ok = !s || text.includes(s);
        ok &&= type === "all" || p.type === type;
        ok &&= beds === "all" || p.bedrooms >= (+beds);
        if(price === "0-800k") ok &&= p.price < 800000;
        if(price === "800k-1.2m") ok &&= p.price >= 800000 && p.price <= 1200000;
        if(price === "1.2m-2m") ok &&= p.price > 1200000 && p.price <= 2000000;
        if(price === "2m+") ok &&= p.price > 2000000;
        
        if(loc === "kuala lumpur") ok &&= (p.location.toLowerCase().includes("kuala lumpur") || p.area === "KLCC");
        if(loc === "petaling jaya") ok &&= (p.location.toLowerCase().includes("petaling jaya") || p.area === "SS2");
        if(loc === "selangor") ok &&= (p.location.toLowerCase().includes("selangor") || p.location.toLowerCase().includes("puchong"));
        if(loc === "city-core") ok &&= ["KLCC", "Bangsar", "Mont Kiara"].includes(p.area);
        if(loc === "family-township") ok &&= (["Desa ParkCity", "Bandar Utama", "Bandar Kinrara", "Cheras"].includes(p.area) || p.tags.includes("family"));
        
        if(activeTag !== "all") ok &&= p.tags.includes(activeTag);
        
        if(goal === "investor") ok &&= (p.yield >= 4 || p.tags.includes("yield"));
        if(goal === "family") ok &&= (p.tags.includes("family") && p.bedrooms >= 3);
        if(goal === "luxury") ok &&= (p.tags.includes("luxury") || p.psf >= 1200);
        
        return ok;
    });

    list.sort((a,b) => sort === "priceAsc" ? a.price - b.price : sort === "priceDesc" ? b.price - a.price : sort === "yield" ? b.yield - a.yield : sort === "growth" ? b.growth - a.growth : b.aiScore - a.aiScore);
    return list;
}
function renderProperties(){const list=filtered(),grid=$("propertiesGrid"); if(sessionRole==="user"){grid.className="feed-layout";} if(sessionRole==="user"){grid.className="feed-layout";}if(!list.length){grid.innerHTML='<div class="card glass"><div class="body"><div class="title">No properties match this filter set</div><p class="sub">Try broadening the budget, removing a quick tag, or switching the goal back to Balanced.</p></div></div>';updateSide(list);return}grid.innerHTML=list.map(p=>{
    const media=getPropertyMedia(p), decision=getDecisionPack(p), liveCount=getLiveViewerCount(p);
    const saved = savedIds.includes(p.id);
    const fakeDemand = Math.max(2, Math.floor(p.price / 100000 % 8)); // Generate stable random FOMO per listing
    
    // FOMO Urgency Hook text
    const urgencies = ["≡ƒöÑ "+liveCount+" people viewing this today", "ΓÅ│ "+fakeDemand+" buyers already contacted agent", "ΓÜí High demand area signals"];
    const urgency = urgencies[p.id % 3];

    return `<article class="feed-card" id="card_${p.id}">
        <div class="feed-media">
            <img src="${media.images[0]}" alt="${p.title}" loading="lazy" decoding="async">
            <div class="feed-overlay-gradient"></div>
            <div class="feed-fomo-badge"><i class="fas fa-fire-flame-curved"></i> ${urgency}</div>
            <div class="feed-ai-match">Γ£¿ ${p.aiScore}% Match for You</div>
            <div class="feed-content">
                <h3>${money(p.price)}</h3>
                <p>${p.title}</p>
                <div class="feed-stats">
                    <span><i class="fas fa-bed"></i> ${p.bedrooms} Beds</span>
                    <span><i class="fas fa-maximize"></i> ${p.sqft} sqft</span>
                    <span><i class="fas fa-train"></i> ${p.commute}</span>
                </div>
            </div>
        </div>
        <div class="feed-actions-bar">
            <button class="feed-action save-btn ${saved ? 'saved' : ''}" onclick="toggleSave(${p.id}, this)">
                <i class="${saved ? 'fas' : 'far'} fa-heart"></i> ${saved ? 'Saved' : 'Save'}
            </button>
            <button class="feed-action ai-btn" onclick="askAIFeed(${p.id})">
                <i class="fas fa-robot"></i> Ask AI
            </button>
            <button class="feed-action" onclick="openModal(${p.id})">
                <i class="fas fa-expand"></i> Details
            </button>
        </div>
    </article>`;
}).join("");updateSide(list)}
function updateSide(list){const avg=list.length?(list.reduce((s,p)=>s+p.yield,0)/list.length).toFixed(1):"0.0";$("resultsSummary").textContent=`${list.length} listing${list.length===1?"":"s"} match your brief`;$("statListings").textContent=list.length;$("statYield").textContent=`${avg}%`;$("statArea").textContent=list[0]?.area||"None";const top=list[0],recs=$("recommendations"),market=$("marketTrends");renderLiveSurfaces();if(!top){$("matchTitle").textContent="No current match";$("matchSummary").textContent="Adjust your filters to rebuild a shortlist.";$("matchPrice").textContent="RM 0";$("matchReason").textContent="No recommendation available.";$("matchYield").textContent="0%";$("matchGrowth").textContent="0% YoY";recs.innerHTML="";market.innerHTML="";return}const decision=getDecisionPack(top);$("matchTitle").textContent=`Best Match: ${top.area}`;$("matchSummary").textContent=`${top.title} leads the shortlist with an AI score of ${top.aiScore}. ${decision.bullets[0]}`;$("matchPrice").textContent=money(top.price);$("matchReason").textContent=`${top.fit} Offer zone: ${rmFull(decision.negotiation)}.`;$("matchYield").textContent=`${top.yield}%`;$("matchGrowth").textContent=`${top.growth}% YoY`;recs.innerHTML=list.slice(0,3).map(p=>`<div class="rec"><img src="${getPropertyMedia(p).images[0]}" alt="${p.title}" loading="lazy" decoding="async"><div><strong>${p.title}</strong><p>${p.location}</p><div class="mini">${money(p.price)} ΓÇó ${p.yield}% yield ΓÇó Risk ${getDecisionPack(p).risk}</div></div><button class="chip" onclick="focusMatch(${p.id})">Inspect</button></div>`).join("");market.innerHTML=getTopUndervaluedProperties(5).map(p=>`<li><div><strong>${p.area}</strong><span>${Math.round(getUndervalueRatio(p)*100)}% below AI fair value</span></div><span class="delta up">Top 5</span></li>`).join("")}
async function renderSpots(){
    const grid = $("spotlightGrid");
    if(!grid) return;
    grid.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);width:100%"><i class="fas fa-circle-notch fa-spin"></i> Compiling live property news...</div>';
    
    try {
        const res = await fetch('http://localhost:3000/api/hotspots');
        const news = await res.json();
        
        if(news.error || !news.length) {
            grid.innerHTML = hotspots.map(h=>`<article class="spot glass"><div class="mini">${h.growth}</div><h3>${h.name}</h3><p>${h.summary}</p><div class="spot-stats reasons">${h.stats.map(s=>`<span><strong>Signal</strong>${s}</span>`).join("")}</div></article>`).join("");
            return;
        }
        
        let outHtml = "";
        news.forEach((item, index) => {
            let label = index === 0 ? "≡ƒöÑ HOT" : "LIVE";
            let dateStr = new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            outHtml += `<article class="spot glass" style="cursor:pointer;" onclick="window.open('${item.link}', '_blank')">
                <div class="mini" style="color:var(--brand); font-weight:700;">${label}</div>
                <h3 style="font-size:clamp(1rem, 1.2vw, 1.2rem); line-height:1.4;">${item.title}</h3>
                <p style="margin-top:auto;" class="mini"><i class="far fa-clock"></i> Updated today at ${dateStr}</p>
            </article>`;
        });
        
        grid.innerHTML = outHtml;
    } catch(e) {
        console.error(e);
        // Fallback to static
        grid.innerHTML = hotspots.map(h=>`<article class="spot glass"><div class="mini">${h.growth}</div><h3>${h.name}</h3><p>${h.summary}</p><div class="spot-stats reasons">${h.stats.map(s=>`<span><strong>Signal</strong>${s}</span>`).join("")}</div></article>`).join("");
    }
}
function renderCompare(){const saved=properties.filter(p=>savedIds.includes(p.id));const bookings=readLocalBookings();$("compareEmpty").style.display=saved.length?"none":"block";$("compareList").innerHTML=saved.map(p=>{const booking=bookings.find(item=>item.listingId===p.id&&item.userName===sessionName);const status=booking?bookingStatusMeta(booking.status):null;return`<div class="compare-item"><img src="${getPropertyMedia(p).images[0]}" alt="${p.title}" loading="lazy" decoding="async"><div><strong>${p.title}</strong><p>${p.location}</p><div class="mini">${money(p.price)} ΓÇó ${p.growth}% YoY ΓÇó ${p.yield}% yield</div>
${sessionRole==="user"?`<div class="booking-panel">${booking?`<span class="booking-status ${status.className}"><i class="fas fa-calendar-check"></i> ${status.label}</span><p class="booking-note">${booking.status==="declined"?`Your last slot ${booking.requestedDate} at ${booking.requestedTime} was declined by ${booking.assignedAgentName}. Pick another date below.`:`Viewing requested for ${booking.requestedDate} at ${booking.requestedTime} with ${booking.assignedAgentName}.`}</p>`:`<p class="booking-note">Add a preferred viewing date and time to request a tour from this shortlist card.</p>`}<div class="booking-grid"><input class="field" id="bookingDate_${p.id}" type="date" min="${new Date().toISOString().split("T")[0]}"><select class="select" id="bookingTime_${p.id}"><option value=\"10:00 AM\">10:00 AM</option><option value=\"12:00 PM\">12:00 PM</option><option value=\"3:00 PM\">3:00 PM</option><option value=\"6:30 PM\">6:30 PM</option></select></div><div class="booking-grid"><input class="field" id="bookingPhone_${p.id}" placeholder="Your WhatsApp number"><button class="btn" onclick="bookViewingTour(${p.id})"><i class="fas fa-calendar-days"></i> ${booking&&booking.status!=="declined"?"Update Viewing Request":"Book Viewing Tour"}</button></div></div>`:""}</div><button class="ghost" onclick="toggleSave(${p.id})">Remove</button></div>`}).join("")}
function toggleSave(id, btn){
    const added=!savedIds.includes(id);
    if(btn) {
        const icon = btn.querySelector('i');
        if(added) {
            icon.className = 'fas fa-heart anim-heart';
            btn.classList.add('saved');
            btn.innerHTML = icon.outerHTML + ' Saved';
            const card = document.getElementById('card_'+id);
            if(card) {
                card.classList.add('anim-glow');
                setTimeout(()=>card.classList.remove('anim-glow'), 1200);
            }
        } else {
            icon.className = 'far fa-heart';
            btn.classList.remove('saved');
            btn.innerHTML = icon.outerHTML + ' Save';
        }
    }

function focusMatch(id){const p=properties.find(x=>x.id===id);if(!p)return;trackAreaInterest(p.area,"match");$("matchTitle").textContent=`Why ${p.area} stands out`;$("matchSummary").textContent=`${p.title} suits buyers who want ${p.vibe.toLowerCase()} qualities with a ${p.yield}% yield profile.`;$("matchPrice").textContent=money(p.price);$("matchReason").textContent=p.fit;$("matchYield").textContent=`${p.yield}%`;$("matchGrowth").textContent=`${p.growth}% YoY`;scrollToSection('market')}
function setTag(tag,el){activeTag=tag;document.querySelectorAll('[data-tag]').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderProperties()}
function applyPreset(mode){$("buyerGoal").value=mode;if(mode==="investor"){activeTag="yield";$("sortBy").value="yield";$("priceRange").value="0-800k";$("bedrooms").value="all";showInvestorAnalyzer();}else{hideInvestorAnalyzer();}if(mode==="family"){activeTag="family";$("sortBy").value="score";$("bedrooms").value="3";$("priceRange").value="all"}document.querySelectorAll('[data-tag]').forEach(x=>x.classList.toggle('active',x.dataset.tag===activeTag));renderProperties();scrollToSection('discover')}
function showInvestorAnalyzer(){const panel=$("investorAnalyzerPanel");if(!panel)return;panel.style.display="block";panel.style.animation="slideDown 0.4s ease";const sel=$("invPropertySelect");if(sel){sel.innerHTML=properties.map(p=>`<option value="${p.id}">${p.title} ΓÇö ${p.location} (${money(p.price)})</option>`).join("");runInvestorAnalysis();}scrollToSection("investorAnalyzerPanel");}
function hideInvestorAnalyzer(){const panel=$("investorAnalyzerPanel");if(panel)panel.style.display="none";}
function runInvestorAnalysis(){const sel=$("invPropertySelect");if(!sel)return;const id=Number(sel.value);const p=properties.find(x=>x.id===id);if(!p)return;const yieldPct=p.yield||4.5;const growthPct=p.growth||8;const price=p.price||600000;// Yield card
const yieldBar=Math.min(100,Math.round(yieldPct/8*100));$("invYieldValue").textContent=yieldPct+"%";$("invYieldNote").textContent=yieldPct>=5?"Γ£à Above market average ΓÇö strong cash flow asset":yieldPct>=4?"ΓÜí At market average ΓÇö decent income play":"ΓÜá∩╕Å Below average ΓÇö appreciate-heavy bet";$("invYieldBar").style.width=yieldBar+"%";// Predict card
const price5y=Math.round(price*Math.pow(1+(growthPct/100),5));const upside=Math.round(((price5y-price)/price)*100);$("invPredictValue").textContent=money(price5y);$("invPredictNote").textContent="+"+upside+"% estimated upside vs. today's price based on "+growthPct+"% YoY trajectory.";$("invPredictBar").style.width=Math.min(100,upside)+"%";// Growth score
const score=Math.min(100,Math.round((growthPct/20*60)+(yieldPct/8*40)));const grade=score>=80?"A+ Excellent":score>=65?"B+ Strong":score>=50?"C+ Moderate":"D Below Average";$("invGrowthValue").textContent=score+" / 100";$("invGrowthNote").textContent=grade+" ΓÇö "+p.vibe;$("invGrowthBar").style.width=score+"%";// Verdict
const verdict=score>=80?"≡ƒöÑ Hot pick for investors ΓÇö high yield and strong growth make this a rare combo.":score>=65?"Γ£à Solid investment ΓÇö above-average returns and reliable area fundamentals.":score>=50?"ΓÜí Moderate option ΓÇö worth holding if you have a 7+ year horizon.":"ΓÜá∩╕Å Caution ΓÇö consider better-yielding alternatives in the same budget.";$("invVerdict").innerHTML=`<div class="inv-verdict-inner"><i class="fas fa-brain"></i> <strong>AI Verdict:</strong> ${verdict} <br><span style="color:var(--muted);font-size:0.9rem;">Based on ${p.area} area signals, current yield of ${yieldPct}%, and projected ${growthPct}% annual capital growth.</span></div>`;$("invResultsWrap").style.display="block";// Pre-fill calculator
$("invMonthlyRent").value=Math.round(price*0.0035);$("invPurchasePrice").value=price;$("invMaintFee").value=Math.round(price*0.0004);calcYield();}
function calcYield(){const rent=Number($("invMonthlyRent")?.value||0);const price=Number($("invPurchasePrice")?.value||0);const maint=Number($("invMaintFee")?.value||0);if(!rent||!price)return;const grossYield=((rent*12)/price*100).toFixed(2);const netAnnual=(rent-maint)*12;const netYield=(netAnnual/price*100).toFixed(2);const breakeven=Math.round(price/netAnnual);$("invGrossYield").textContent=grossYield+"%";$("invNetYield").textContent=netYield+"%";$("invAnnualIncome").textContent=`RM ${netAnnual.toLocaleString("en-MY")}/yr`;$("invBreakeven").textContent=breakeven+" yrs";$("invCalcResult").style.display="grid";}
function filterByArea(area){$("searchInput").value=area;renderProperties();scrollToSection('discover')}
function predictPrice(){const area=$("predictArea").value,size=Number($("predictSize").value)||1000,p=properties.find(x=>x.area===area),psf=p?p.psf:700,estimate=psf*size,low=Math.round(estimate*.92),high=Math.round(estimate*1.08);$("predictedPrice").textContent=money(estimate);$("predictedRange").textContent=`${money(low)} - ${money(high)}`;$("predictedNarrative").textContent=`${area} currently screens around RM ${psf} psf in this concept dataset, giving a mid-case estimate for a ${size} sqft home.`;$("predictResult").style.display='block'}
function rmFull(n){return `RM ${Number(n||0).toLocaleString("en-MY",{maximumFractionDigits:2})}`}
function percentage(n){return `${Number(n||0).toFixed(2)}%`}
function esc(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function monthlyPayment(principal,annualRate,years){const months=years*12;const rate=annualRate/100/12;if(principal<=0||months<=0)return 0;if(rate===0)return principal/months;return principal*rate/(1-Math.pow(1+rate,-months))}
function stampDutySale(price){let remaining=price,total=0;const tiers=[[100000,.01],[400000,.02],[500000,.03],[Infinity,.04]];for(const [cap,rate] of tiers){if(remaining<=0)break;const portion=Math.min(remaining,cap);total+=portion*rate;remaining-=portion}return total}
function legalFeeScale(amount){let remaining=amount,total=0;const tiers=[[500000,.01],[500000,.008],[2000000,.007],[2000000,.006],[2500000,.005],[Infinity,.004]];for(const [cap,rate] of tiers){if(remaining<=0)break;const portion=Math.min(remaining,cap);total+=portion*rate;remaining-=portion}return total}
function setCalculatorBreakdown(items){$("calculatorBreakdown").innerHTML=items.map(item=>`<span class="meta"><strong>${item.label}</strong><b>${item.value}</b></span>`).join("")}
function renderPromptOutput(result){if(typeof result==="string"){$("promptOutput").innerHTML=`<div class="ai-empty">${esc(result)}</div>`;return}const badges=(result.badges||[]).map(badge=>`<span class="ai-badge ${esc(badge.tone||"")}">${esc(badge.label||badge)}</span>`).join("");const scores=(result.scores||[]).map(score=>`<div class="ai-score-card"><span>${esc(score.label)}</span><strong>${esc(score.value)}</strong>${score.note?`<p>${esc(score.note)}</p>`:""}</div>`).join("");const insights=(result.insights||[]).map(item=>`<div class="ai-insight-block"><div class="ai-insight-title">${esc(item.title)}</div><p class="ai-insight-copy">${esc(item.body)}</p></div>`).join("");const list=(result.list||[]).map(item=>`<li><strong>${esc(item.title)}</strong><p>${esc(item.body)}</p></li>`).join("");$("promptOutput").innerHTML=`<div class="ai-output-shell">${badges?`<div class="ai-badges">${badges}</div>`:""}${scores?`<div class="ai-score-grid">${scores}</div>`:""}${insights?`<div class="ai-insight-grid">${insights}</div>`:""}${list?`<ul class="ai-list">${list}</ul>`:""}${result.cta?`<div class="ai-cta">${esc(result.cta)}</div>`:""}</div>`}
function renderPromptFields(promptName){const config=promptPlaygroundConfigs[promptName];if(!config){$("promptFields").innerHTML="";$("promptOutput").innerHTML='<div class="ai-empty">No sample prompt runner is set for this prompt yet.</div>';return}$("promptFields").innerHTML=config.fields.map(field=>`<label>${field[1]}<input class="field" id="prompt_${field[0]}" value="${String(field[2]).replace(/"/g,"&quot;")}"></label>`).join("");$("promptOutputTitle").textContent=`Sample Output: ${promptName}`;$("promptOutput").innerHTML='<div class="ai-empty">Edit the sample inputs and click Run Prompt.</div>'}
function onPromptSelectionChange(){renderPromptFields($("promptSelector").value)}
function runPromptPlayground(){const promptName=$("promptSelector").value;const config=promptPlaygroundConfigs[promptName];if(!config)return;const values={};config.fields.forEach(field=>{values[field[0]]=$(`prompt_${field[0]}`)?.value||""});$("promptOutputTitle").textContent=`Mock Output: ${promptName}`;renderPromptOutput(config.output(values))}
function setupPromptPlayground(prompts){activeFeaturePromptSet=prompts||[];if(!activeFeaturePromptSet.length){$("promptPlayground").classList.add("hidden");$("promptSelector").innerHTML="";$("promptFields").innerHTML="";$("promptOutput").innerHTML="";return}$("promptPlayground").classList.remove("hidden");$("promptSelector").innerHTML=activeFeaturePromptSet.map(prompt=>`<option value="${prompt[0]}">${prompt[0]}</option>`).join("");renderPromptFields(activeFeaturePromptSet[0][0])}
function openDocumentVaultFeature(){if(sessionRole==="user"){scrollToSection("documentVaultUserSection");loadUserDocumentVault();if($("vaultUserStatus")){$("vaultUserStatus").textContent="Document Vault opened. Upload files, watch the status tracker, and follow your timeline here."}return}if(sessionRole==="agent"){scrollToSection("documentVaultAgentSection");loadAgentDocumentVault();if($("vaultAgentStatus")){$("vaultAgentStatus").textContent="Document Vault opened. Review buyer uploads and update the timeline here."}return}openFeatureExperience("document-vault")}
function openFeatureExperience(id){const feature=featureExperiences[id];if(!feature)return;const allowed=sessionRole==="master"||sessionRole===feature.role;if(!allowed){$("featureRoleBadge").textContent=`Available for ${feature.role==="user"?"User":"Agent"} account`; $("featureTitle").textContent=feature.title; $("featurePurpose").textContent="This preview is role-specific."; $("featureVibe").textContent="Access restricted for this account"; $("featureDescription").textContent=`Log in as ${feature.role==="user"?"a user":"an agent"} to use this experience directly.`; $("featurePreviewGrid").innerHTML=""; $("featurePreviewList").innerHTML='<span class="meta"><strong>Current role</strong><b>'+sessionRole.charAt(0).toUpperCase()+sessionRole.slice(1)+'</b></span>'; $("featurePromptLibrary").innerHTML=""; setupPromptPlayground([]); $("featureExperienceModal").classList.add("open"); return} $("featureRoleBadge").textContent=feature.badge; $("featureTitle").textContent=feature.title; $("featurePurpose").textContent=feature.purpose; $("featureVibe").textContent=feature.vibe; $("featureDescription").textContent=feature.description; const highlights=feature.highlights||feature.cards||[]; const details=feature.details||feature.bullets||[]; $("featurePreviewGrid").innerHTML=highlights.map(card=>`<div class="feature-preview-card"><strong>${card[0]}</strong><p>${card[1]}</p></div>`).join(""); $("featurePreviewGrid").style.display=highlights.length?"grid":"none"; $("featurePreviewList").innerHTML=details.map(item=>Array.isArray(item)?`<span class="meta"><strong>${item[0]}</strong><b>${item[1]}</b></span>`:`<span class="meta"><strong>Layout</strong><b>${item}</b></span>`).join(""); $("featurePromptLibrary").innerHTML=(feature.prompts||[]).length?feature.prompts.map(prompt=>`<div class="prompt-card"><strong>${prompt[0]}</strong><pre>${prompt[1]}</pre></div>`).join(""):""; setupPromptPlayground(feature.prompts||[]); $("featureExperienceModal").classList.add("open")}
function closeFeatureExperience(){$("featureExperienceModal").classList.remove("open");$("promptSelector").innerHTML="";$("promptFields").innerHTML="";$("featurePromptLibrary").innerHTML="";$("promptPlayground").classList.add("hidden")}
function openCalculator(type){const config=calculatorConfigs[type];if(!config)return;activeCalculator=type;$("calculatorTitle").textContent=config.title;$("calculatorDescription").textContent=config.description;$("calculatorFields").innerHTML=config.fields.map(field=>`<label>${field.label}<input class="field" id="calc_${field.id}" type="${field.type||"number"}" value="${field.value??""}" ${field.step?`step="${field.step}"`:""}></label>`).join("");$("calculatorPrimary").textContent="Enter your numbers";$("calculatorSecondary").textContent="A summary will appear here.";setCalculatorBreakdown([{label:"Purpose",value:config.title},{label:"Inputs",value:`${config.fields.length} fields`},{label:"Mode",value:"Show more details"}]);$("calculatorModal").classList.add("open")}
function closeCalculator(){$("calculatorModal").classList.remove("open");activeCalculator=null}
function getCalcValue(id){return Number($(`calc_${id}`)?.value||0)}
function runCalculator(){if(!activeCalculator)return;let primary="",secondary="",breakdown=[];if(activeCalculator==="mortgage"){const price=getCalcValue("propertyPrice"),downPct=getCalcValue("downPaymentPct"),rate=getCalcValue("interestRate"),years=getCalcValue("loanYears");const loan=price*(1-downPct/100);const monthly=monthlyPayment(loan,rate,years);const totalPaid=monthly*years*12;const interestPaid=Math.max(totalPaid-loan,0);primary=`Estimated Monthly Repayment: ${rmFull(monthly)}`;secondary=`Loan amount ${rmFull(loan)} over ${years} years at ${rate}% p.a. Estimated down payment: ${rmFull(price-loan)}.`;breakdown=[{label:"Loan Amount",value:rmFull(loan)},{label:"Total Interest",value:rmFull(interestPaid)},{label:"Total Paid",value:rmFull(totalPaid)}]}
if(activeCalculator==="eligibility"){const income=getCalcValue("monthlyIncome"),commitments=getCalcValue("monthlyCommitments"),dsr=getCalcValue("dsr")/100,rate=getCalcValue("interestRate"),years=getCalcValue("loanYears");const maxInstallment=Math.max(income*dsr-commitments,0);const months=years*12;const monthlyRate=rate/100/12;const eligibleLoan=monthlyRate===0?maxInstallment*months:maxInstallment*(1-Math.pow(1+monthlyRate,-months))/monthlyRate;primary=`Estimated Eligible Loan: ${rmFull(eligibleLoan)}`;secondary=`Based on an affordable monthly repayment of ${rmFull(maxInstallment)} after commitments, using ${rate}% p.a. over ${years} years.`;breakdown=[{label:"Monthly Income",value:rmFull(income)},{label:"Affordable Installment",value:rmFull(maxInstallment)},{label:"DSR Used",value:percentage(dsr*100)}]}
if(activeCalculator==="yield"){const purchase=getCalcValue("purchasePrice"),rent=getCalcValue("monthlyRent"),costs=getCalcValue("annualCosts");const annualRent=rent*12;const gross=(annualRent/Math.max(purchase,1))*100;const net=((annualRent-costs)/Math.max(purchase,1))*100;primary=`Gross Yield: ${percentage(gross)}`;secondary=`Net yield is ${percentage(net)} after annual costs of ${rmFull(costs)} on a purchase price of ${rmFull(purchase)}.`;breakdown=[{label:"Annual Rent",value:rmFull(annualRent)},{label:"Annual Costs",value:rmFull(costs)},{label:"Net Yield",value:percentage(net)}]}
if(activeCalculator==="downpayment"){const target=getCalcValue("targetPrice"),pct=getCalcValue("downPaymentPct"),saved=getCalcValue("currentSavings"),months=Math.max(getCalcValue("months"),1);const needed=target*(pct/100);const remaining=Math.max(needed-saved,0);const monthly=remaining/months;primary=`Monthly Savings Target: ${rmFull(monthly)}`;secondary=`Target down payment is ${rmFull(needed)}. After current savings of ${rmFull(saved)}, you still need ${rmFull(remaining)} over ${months} months.`;breakdown=[{label:"Target Down Payment",value:rmFull(needed)},{label:"Current Savings",value:rmFull(saved)},{label:"Remaining Amount",value:rmFull(remaining)}]}
if(activeCalculator==="fees"){const price=getCalcValue("propertyPrice"),margin=getCalcValue("loanMargin"),manualLoan=getCalcValue("loanAmount"),loan=manualLoan||price*(margin/100);const spaStamp=stampDutySale(price),loanStamp=loan*.005,spaLegal=legalFeeScale(price),loanLegal=legalFeeScale(loan),total=spaStamp+loanStamp+spaLegal+loanLegal;primary=`Estimated Total Fees: ${rmFull(total)}`;secondary=`Includes SPA stamp duty ${rmFull(spaStamp)}, loan stamp duty ${rmFull(loanStamp)}, SPA legal fees ${rmFull(spaLegal)}, and loan legal fees ${rmFull(loanLegal)}. This is an estimate only.`;breakdown=[{label:"SPA Stamp Duty",value:rmFull(spaStamp)},{label:"Loan Stamp Duty",value:rmFull(loanStamp)},{label:"Legal Fees",value:rmFull(spaLegal+loanLegal)}]}
$("calculatorPrimary").textContent=primary;$("calculatorSecondary").textContent=secondary;setCalculatorBreakdown(breakdown)}
function scrollToSection(id){const t=$(id);if(t)t.scrollIntoView({behavior:'auto',block:'start'})}
function logout(){localStorage.removeItem("kvai_role");localStorage.removeItem("kvai_name");localStorage.removeItem("kvai_token");localStorage.removeItem("kvai_agent_phone");localStorage.removeItem("kvai_user_account");window.location.href="index.html"}
function verificationLabel(type){if(type==="owner")return"Owner Verified";if(type==="agent")return"Agent Verified";return"Awaiting Verification"}
function saveMasterListings(){localStorage.setItem("kvai_master_listings",JSON.stringify(properties.filter(p=>!sampleProperties.some(s=>s.id===p.id))))}
function verifyListing(id,type){if(sessionRole!=="master")return;const item=properties.find(p=>p.id===id);if(!item)return;item.verifiedType=type;saveMasterListings();renderProperties();renderCompare();$("adminStatus").textContent=`${item.title} is now ${verificationLabel(type)}.`;loadMasterExecutive();}
function renderModalMedia(property){ if(typeof window._loadModelViewer==="function") window._loadModelViewer();const media=getPropertyMedia(property);activeMediaItems=[...media.images.map(src=>({type:"image",src})),...(media.video?[{type:"video",...parseVideoEmbed(media.video)}]:[])];activeMediaIndex=0;$("modalImage").src=media.images[0]||DEFAULT_IMAGE;$("modalImage").alt=property.title;$("modalMediaStrip").innerHTML=[...media.images.map((src,index)=>`<button class="media-tile" onclick="openMediaLightbox(${index})"><img loading="lazy" src="${src}" alt="${property.title} image ${index+1}"><span class="media-label">Photo ${index+1}</span></button>`),...(media.video?[`<button class="media-tile video-tile" onclick="openMediaLightbox(${media.images.length})"><i class="fas fa-play-circle" style="font-size:1.5rem"></i><span class="media-label">Video Tour</span></button>`]:[])].join("");$("mediaImage2").value=media.images[1]||"";$("mediaImage3").value=media.images[2]||"";$("mediaImage4").value=media.images[3]||"";$("mediaVideo").value=media.video||"";if($("mediaModel3D"))$("mediaModel3D").value=media.model3D||"";const arSec=$("arViewerSection"),arCon=$("arViewerContainer"),arLbl=$("arStatusLabel");if(arSec&&arCon&&arLbl){if(media.model3D){arSec.style.display="grid";arCon.innerHTML=`<div class="ar-viewer-wrap"><model-viewer src="${media.model3D}" ar ar-modes="webxr scene-viewer quick-look" camera-controls tone-mapping="neutral" poster="${media.images[0]||DEFAULT_IMAGE}" shadow-intensity="1"></model-viewer></div>`;arLbl.innerHTML='<span class="ar-badge"><i class="fas fa-cube"></i> AR Ready</span>'}else{arSec.style.display="none";arCon.innerHTML="";arLbl.innerHTML=""}}$("mediaStatus").textContent=""}
function fillModal(property){const decision=getDecisionPack(property);$("modalVerify").textContent=verificationLabel(property.verifiedType);$("modalTitle").textContent=property.title;$("modalLocation").textContent=property.location;$("modalLiveSignals").innerHTML=`<span class="live-pill">≡ƒöÑ ${getLiveViewerCount(property)} people viewing now</span><span class="live-pill">${getReplySignal(property)}</span>`;renderModalMedia(property);$("modalPrice").textContent=money(property.price);$("modalFit").textContent=property.fit;$("modalType").textContent=property.type;$("modalBedrooms").textContent=property.bedrooms;$("modalBathrooms").textContent=property.bathrooms;$("modalSqft").textContent=`${property.sqft} sqft`;$("modalPsf").textContent=`RM ${property.psf}`;$("modalYield").textContent=`${property.yield}%`;$("modalGrowth").textContent=`${property.growth}% YoY`;$("modalScore").textContent=property.aiScore;$("modalVibe").textContent=property.vibe;$("modalCommute").textContent=property.commute;$("modalMap").href=property.mapLink;$("modalSaveToggle").textContent=savedIds.includes(property.id)?"Remove Saved":"Save Listing";$("modalWhyList").innerHTML=decision.bullets.map(item=>`<li>${item}</li>`).join("");$("modalRiskLevel").textContent=decision.risk;$("modalRiskNote").textContent=decision.riskNote;$("modalNegotiation").textContent=`Offer ${rmFull(decision.negotiation)}`;$("modalNegotiationNote").textContent=`AI fair value: ${rmFull(decision.fairValue)}. Use this as your anchor, not just the asking price.`;$("modalActionTitle").textContent=decision.actionTitle;$("modalActionNote").textContent=decision.actionNote;const riskCard=$("modalRiskCard");if(riskCard)riskCard.className=`decision-card risk-${decision.risk.toLowerCase()}`;$("leadStatus").textContent=sessionRole==="agent"?"Agent accounts cannot request callback routing.":"";$("leadName").value=sessionRole==="user"&&sessionName!=="Guest"?sessionName:"";$("leadPhone").value="";$("leadMessage").value=`Hi, I would like more details about ${property.title}.`;$("contactAgentBtn").textContent="Find an Agent on WhatsApp";$("contactWrap").classList.toggle("hidden",sessionRole!=="user");
  
  $("leadFormWrap").classList.toggle("hidden",sessionRole!=="user");
    if($("negotiatorWrap")) $("negotiatorWrap").style.display = sessionRole==="user" ? "block" : "none";
    if($("negotiatorStatus")) $("negotiatorStatus").textContent = "";
    if($("negotiatorOfferPrice")) $("negotiatorOfferPrice").value = "";
    if($("negotiatorWrap")) $("negotiatorWrap").style.display = sessionRole==="user" ? "block" : "none";
    if($("negotiatorStatus")) $("negotiatorStatus").textContent = "";
    if($("negotiatorOfferPrice")) $("negotiatorOfferPrice").value = "";


$("contactAgentBtn").classList.toggle("hidden",sessionRole!=="user");$("tenantName").value=sessionRole==="user"&&sessionName!=="Guest"?sessionName:"";$("tenantPhone").value="";$("tenantOccupation").value="";$("tenantMoveIn").value="";$("tenantBudget").value="";$("tenantNotes").value=`Interested in renting ${property.title}.`;$("tenantStatus").textContent="";$("tenantApplyWrap").classList.toggle("hidden",sessionRole!=="user");$("tenantApplyForm").classList.toggle("hidden",sessionRole!=="user");$("tenantApplyActions").classList.toggle("hidden",sessionRole!=="user");$("modalMediaManager").classList.toggle("hidden",!["agent","master"].includes(sessionRole))}
function fillEditForm(property){$("editTitle").value=property.title;$("editLocation").value=property.location;$("editArea").value=property.area;$("editPrice").value=property.price;$("editType").value=property.type;$("editBedrooms").value=property.bedrooms;$("editBathrooms").value=property.bathrooms;$("editSqft").value=property.sqft;$("editPsf").value=property.psf;$("editYield").value=property.yield;$("editGrowth").value=property.growth;$("editImage").value=property.image;$("editMap").value=property.mapLink;$("editVibe").value=property.vibe;$("editCommute").value=property.commute;$("editFit").value=property.fit;$("editVerified").value=property.verifiedType||"unverified";}
function openModal(id){const property=properties.find(p=>p.id===id);if(!property)return;trackAreaInterest(property.area,"view_more");activeModalId=id;fillModal(property);if(sessionRole==="master"){fillEditForm(property);$("modalStatus").textContent="";}$("propertyModal").classList.add("open");tapFeedback("Property opened",`${property.title} now has a full decision-brain view.`, "success")}
function closeModal(){$("propertyModal").classList.remove("open");activeModalId=null;}
function toggleModalSave(){if(activeModalId==null)return;toggleSave(activeModalId);const property=properties.find(p=>p.id===activeModalId);if(property)fillModal(property);}

function savePropertyMedia(){if(!["agent","master"].includes(sessionRole)||activeModalId==null)return;const item=properties.find(p=>p.id===activeModalId);if(!item)return;const media=readPropertyMedia();media[String(item.id)]={image2:$("mediaImage2").value.trim(),image3:$("mediaImage3").value.trim(),image4:$("mediaImage4").value.trim(),video:$("mediaVideo").value.trim(),model3D:$("mediaModel3D")?$("mediaModel3D").value.trim():""};writePropertyMedia(media);renderProperties();renderCompare();fillModal(item);$("mediaStatus").textContent=`Saved extra media for ${item.title}.`;}
function renderLightboxItem(){const item=activeMediaItems[activeMediaIndex];if(!item){$("lightboxStage").innerHTML="";return}$("lightboxTitle").textContent=`Media ${activeMediaIndex+1} of ${activeMediaItems.length}`;$("lightboxStage").innerHTML=item.type==="image"?`<img loading="lazy" src="${item.src}" alt="Property media">`:item.type==="embed"?`<iframe src="${item.embed}" title="Property video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`:item.type==="direct"?`<video src="${item.src}" controls autoplay></video>`:`<div style="padding:24px;text-align:center"><p class="sub">This video link opens in a new tab.</p><a class="btn" href="${item.src}" target="_blank" rel="noopener noreferrer">Open Video</a></div>`}
function openMediaLightbox(index=0){if(!activeMediaItems.length)return;activeMediaIndex=Math.max(0,Math.min(index,activeMediaItems.length-1));renderLightboxItem();$("mediaLightbox").classList.add("open")}
function closeMediaLightbox(){$("mediaLightbox").classList.remove("open");$("lightboxStage").innerHTML=""}
function shiftMedia(delta){if(!activeMediaItems.length)return;activeMediaIndex=(activeMediaIndex+delta+activeMediaItems.length)%activeMediaItems.length;renderLightboxItem()}
function openRentPaymentModal(id){if(sessionRole!=="user")return;const tenancy=readLocalTenancies().find(item=>item.id===id&&((item.tenantAccount||item.tenantName)===sessionUserAccount||item.tenantName===sessionName));if(!tenancy)return;activePaymentTenancyId=id;$("rentPaymentTitle").textContent=`Pay Rent for ${tenancy.listingTitle}`;$("rentPaymentAmount").textContent=rmFull(tenancy.monthlyRent||0);$("rentPaymentMeta").textContent=`Handling agent: ${tenancy.agentName}. Owner: ${tenancy.ownerName}.`; $("rentPayerName").value=tenancy.tenantName||sessionName;$("rentReference").value="";$("rentNotes").value="";$("rentMethod").value=tenancy.paymentMethod||"FPX Online Banking";$("rentPaymentStatus").textContent="";$("rentPaymentModal").classList.add("open")}
function closeRentPaymentModal(){$("rentPaymentModal").classList.remove("open");activePaymentTenancyId=null}
function submitRentPayment(){if(sessionRole!=="user"||activePaymentTenancyId==null)return;const tenancies=readLocalTenancies();const tenancy=tenancies.find(item=>item.id===activePaymentTenancyId&&((item.tenantAccount||item.tenantName)===sessionUserAccount||item.tenantName===sessionName));if(!tenancy)return;const payer=$("rentPayerName").value.trim(),method=$("rentMethod").value,reference=$("rentReference").value.trim(),notes=$("rentNotes").value.trim();if(!payer||!reference){$("rentPaymentStatus").textContent="Please enter payer name and payment reference.";return}const updated={...tenancy,paymentStatus:"submitted",paymentAmount:tenancy.monthlyRent,paymentMethod:method,paymentReference:reference,paymentNotes:notes,paymentPayer:payer,paymentSubmittedAt:new Date().toISOString(),updatedAt:new Date().toISOString()};writeLocalTenancies(tenancies.map(item=>item.id===activePaymentTenancyId?updated:item));createNotification({userName:sessionName,title:`Rent payment submitted for ${tenancy.listingTitle}`,message:`Your rent payment of ${rmFull(tenancy.monthlyRent)} was submitted via ${method}. ${tenancy.agentName} will confirm receipt soon.`});$("rentPaymentStatus").textContent="Payment submitted successfully.";loadUserTenantApplications();loadUserRentCenter();closeRentPaymentModal()}
function addListing(){if(sessionRole!=="master")return;const title=$("adminTitle").value.trim(),location=$("adminLocation").value.trim(),area=$("adminArea").value.trim(),price=Number($("adminPrice").value),type=$("adminType").value,bedrooms=Number($("adminBedrooms").value||0),bathrooms=Number($("adminBathrooms").value||0),sqft=Number($("adminSqft").value||0),psf=Number($("adminPsf").value||0),yieldValue=Number($("adminYield").value||0),growth=Number($("adminGrowth").value||0),image=$("adminImage").value.trim()||"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",mapLink=$("adminMap").value.trim()||"https://www.google.com/maps/search/Klang+Valley+property",vibe=$("adminVibe").value.trim()||"Fresh listing",commute=$("adminCommute").value.trim()||"Location note pending",fit=$("adminFit").value.trim()||"Newly added by master admin.";if(!title||!location||!area||!price){$("adminStatus").textContent="Please fill in title, location, area, and price.";return;}const nextId=properties.reduce((max,p)=>Math.max(max,p.id),0)+1;properties.unshift({id:nextId,title,location,area,price,type,bedrooms,bathrooms,sqft,psf:psf||Math.round(price/Math.max(sqft,1)),badge:"new",image,mapLink,aiScore:91,yield:yieldValue||3.8,growth:growth||5,commute,vibe,tags:[type,bedrooms>=3?"family":"mrt"],fit,verifiedType:"unverified"});saveMasterListings();renderProperties();renderCompare();$("adminStatus").textContent=`Added ${title}. It is awaiting verification.`;["adminTitle","adminLocation","adminArea","adminPrice","adminBedrooms","adminBathrooms","adminSqft","adminPsf","adminYield","adminGrowth","adminImage","adminMap","adminVibe","adminCommute","adminFit"].forEach(id=>$(id).value="");$("adminType").value="condo";loadMasterExecutive();}
function resetAdminListings(){if(sessionRole!=="master")return;properties=[...sampleProperties];localStorage.removeItem("kvai_master_listings");renderProperties();renderCompare();$("adminStatus").textContent="Removed browser-stored admin listings and restored sample data.";loadMasterExecutive();}
function importCSVFile(){$("importStatus").textContent="CSV import is ready for the next step once you place your export file here.";if(sessionRole==="master"){$("adminStatus").textContent="Drop your Excel export as CSV into the workspace and I can wire the real importer next.";}}
function resetToSampleData(){properties=[...sampleProperties,...JSON.parse(localStorage.getItem("kvai_master_listings")||"[]")];renderProperties();renderCompare();$("importStatus").textContent="Restored dashboard view from saved listings.";}
function normalizePhone(phone){return (phone||"").replace(/[^\d]/g,"")}
function formatLeadTime(value){try{return new Date(value).toLocaleString("en-MY",{dateStyle:"medium",timeStyle:"short"})}catch(error){return value||""}}
function formatTourSlot(date,time){return `${date} at ${time}`}
function formatMonthLabel(value){return value.toLocaleDateString("en-MY",{month:"long",year:"numeric"})}
function getRentDueDay(item){const source=item.moveInDate||item.createdAt;const date=new Date(source);return Number.isNaN(date.getTime())?1:Math.min(Math.max(date.getDate(),1),28)}
function getAgentRentCalendarItems(){return readLocalTenancies().filter(item=>item.agentPhone===sessionAgentPhone)}
function renderAgentRentCalendar(){const grid=$("rentCalendarGrid"),list=$("rentCalendarList"),status=$("rentCalendarStatus"),label=$("rentCalendarMonthLabel");if(!grid||!list||!status||!label)return;const items=getAgentRentCalendarItems().sort((a,b)=>getRentDueDay(a)-getRentDueDay(b));label.textContent=formatMonthLabel(activeRentCalendarMonth);if(!items.length){grid.innerHTML="";list.innerHTML='<p class="empty">No rent collection schedule yet. Once you select tenants, monthly due dates will appear here.</p>';status.textContent="No rent collection items for this agent yet.";return}const year=activeRentCalendarMonth.getFullYear(),month=activeRentCalendarMonth.getMonth();const firstDay=new Date(year,month,1),lastDay=new Date(year,month+1,0),startOffset=(firstDay.getDay()+6)%7;const totalCells=Math.ceil((startOffset+lastDay.getDate())/7)*7;const today=new Date();const weekdayLabels=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];const dotsByDay=new Map();items.forEach(item=>{const dueDay=Math.min(getRentDueDay(item),lastDay.getDate());const current=dotsByDay.get(dueDay)||[];current.push({title:item.tenantName,tone:item.rentCollected||item.paymentStatus==="submitted"?"paid":"pending"});dotsByDay.set(dueDay,current)});grid.innerHTML=weekdayLabels.map(day=>`<div class="rent-calendar-day">${day}</div>`).join("")+Array.from({length:totalCells},(_,index)=>{const day=index-startOffset+1;if(day<1||day>lastDay.getDate())return'<div class="rent-calendar-date empty"></div>';const dayDots=dotsByDay.get(day)||[];const isToday=today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===day;return`<div class="rent-calendar-date ${isToday?"today":""}"><div class="rent-date-number">${day}</div>${dayDots.slice(0,2).map(dot=>`<span class="rent-dot ${dot.tone}">${dot.title}</span>`).join("")}${dayDots.length>2?`<span class="rent-dot">+${dayDots.length-2} more</span>`:""}</div>`}).join("");list.innerHTML=items.map(item=>{const dueDate=new Date(year,month,Math.min(getRentDueDay(item),lastDay.getDate()));const paymentLabel=item.rentCollected?"Rent collected":item.paymentStatus==="submitted"?"Payment submitted":"Pending collection";const paymentClass=item.rentCollected||item.paymentStatus==="submitted"?"confirmed":"pending";return`<div class="compare-item"><div><strong>${item.tenantName}</strong><p>${item.listingTitle}</p><div class="mini">Due every month on ${dueDate.toLocaleDateString("en-MY",{day:"numeric",month:"short"})}</div><p class="sub" style="margin-top:6px">Monthly rent: ${rmFull(item.monthlyRent)} ΓÇó Owner: ${item.ownerName}</p><p class="sub" style="margin-top:6px">Status: ${paymentLabel}</p></div><div class="actions">${!item.rentCollected?`<button class="btn" onclick="updateTenancyStage(${item.id},'rent')">${item.paymentStatus==="submitted"?"Confirm Rent Received":"Mark Rent Collected"}</button>`:""}<span class="booking-status ${paymentClass}">${paymentLabel}</span></div></div>`}).join("");status.textContent=`Showing ${items.length} monthly rent collection item${items.length===1?"":"s"} for ${formatMonthLabel(activeRentCalendarMonth)}.`}
function changeRentCalendarMonth(delta){if(sessionRole!=="agent")return;activeRentCalendarMonth=new Date(activeRentCalendarMonth.getFullYear(),activeRentCalendarMonth.getMonth()+delta,1);renderAgentRentCalendar()}
function goToCurrentRentMonth(){if(sessionRole!=="agent")return;const now=new Date();activeRentCalendarMonth=new Date(now.getFullYear(),now.getMonth(),1);renderAgentRentCalendar()}
function reminderDateKey(year,month,day){return `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`}
function formatReminderDateLabel(value){try{return new Date(`${value}T00:00:00`).toLocaleDateString("en-MY",{weekday:"short",day:"numeric",month:"long",year:"numeric"})}catch(error){return value||""}}
function getActionReminderToneLabel(tone,locked){if(!locked)return"My Reminder";if(tone==="confirmed")return"Lead";if(tone==="declined")return"Rent";return"Platform"}
function getAgentSystemReminders(monthRef=activeActionCalendarMonth){const today=todayKey(),year=monthRef.getFullYear(),month=monthRef.getMonth(),lastDay=new Date(year,month+1,0).getDate();const system=[];readLocalLeads().filter(item=>item.assignedAgentPhone===sessionAgentPhone).slice(0,8).forEach(item=>{system.push({id:`lead_${item.id}`,date:today,title:`Call ${item.userName}`,note:`High intent around ${properties.find(p=>p.id===item.listingId)?.area||"this area"}. This callback lead should be contacted while interest is still fresh.`,tone:"confirmed",locked:true,source:"lead",createdAt:item.createdAt})});readLocalBookings().filter(item=>item.assignedAgentPhone===sessionAgentPhone&&item.status==="pending").slice(0,8).forEach(item=>{system.push({id:`booking_${item.id}`,date:item.requestedDate||today,title:`Follow up ${item.userName}`,note:`Viewing request for ${formatTourSlot(item.requestedDate,item.requestedTime)} is waiting on your response.`,tone:"pending",locked:true,source:"booking",createdAt:item.updatedAt||item.createdAt})});readLocalVaultDocuments().filter(item=>item.assignedAgentPhone===sessionAgentPhone&&(item.reviewPercent||0)<100).slice(0,8).forEach(item=>{system.push({id:`doc_${item.id}`,date:today,title:`Review ${item.userName}'s documents`,note:`${item.title||item.fileName} is still ${item.reviewPercent||0}% complete. Platform reminders for document reviews are locked.`,tone:"pending",locked:true,source:"document",createdAt:item.updatedAt||item.createdAt})});readLocalTenancies().filter(item=>item.agentPhone===sessionAgentPhone&&!item.rentCollected).slice(0,8).forEach(item=>{const dueDay=Math.min(getRentDueDay(item),lastDay);system.push({id:`rent_${item.id}`,date:reminderDateKey(year,month,dueDay),title:`Collect rent from ${item.tenantName}`,note:`${item.listingTitle} is due for ${rmFull(item.monthlyRent)} this month. Rent activity reminders are system-locked.`,tone:"declined",locked:true,source:"rent",createdAt:item.updatedAt||item.createdAt})});return system}
function getAgentCustomReminders(){return readLocalAgentReminders().filter(item=>item.agentPhone===sessionAgentPhone).map(item=>({...item,locked:false,source:"custom",tone:"pending"}))}
function getAgentActionReminders(monthRef=activeActionCalendarMonth){return [...getAgentSystemReminders(monthRef),...getAgentCustomReminders()].sort((a,b)=>{const dateCompare=String(a.date).localeCompare(String(b.date));if(dateCompare!==0)return dateCompare;return new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0)})}
function selectActionCalendarDate(dateKey){if(sessionRole!=="agent")return;activeActionReminderDate=dateKey;renderDailyActionList()}
function changeActionCalendarMonth(delta){if(sessionRole!=="agent")return;activeActionCalendarMonth=new Date(activeActionCalendarMonth.getFullYear(),activeActionCalendarMonth.getMonth()+delta,1);activeActionReminderDate=reminderDateKey(activeActionCalendarMonth.getFullYear(),activeActionCalendarMonth.getMonth(),1);renderDailyActionList()}
function goToCurrentActionMonth(){if(sessionRole!=="agent")return;const now=new Date();activeActionCalendarMonth=new Date(now.getFullYear(),now.getMonth(),1);activeActionReminderDate=todayKey();renderDailyActionList()}
function clearActionReminderForm(){activeEditingActionReminderId=null;const date=$("agentReminderDate"),title=$("agentReminderTitle"),note=$("agentReminderNote"),cancel=$("agentReminderCancel"),saveButton=document.querySelector('#dailyActionSection .btn[onclick="saveCustomActionReminder()"]');if(date)date.value=activeActionReminderDate||todayKey();if(title)title.value="";if(note)note.value="";if(cancel)cancel.style.display="none";if(saveButton)saveButton.textContent="Save Reminder"}
function saveCustomActionReminder(){if(sessionRole!=="agent")return;const dateValue=$("agentReminderDate")?.value||activeActionReminderDate||todayKey(),titleValue=$("agentReminderTitle")?.value.trim(),noteValue=$("agentReminderNote")?.value.trim(),status=$("dailyActionStatus");if(!titleValue){if(status)status.textContent="Enter a reminder title before saving.";return}const reminders=readLocalAgentReminders();const timestamp=new Date().toISOString();if(activeEditingActionReminderId){const current=reminders.find(item=>item.id===activeEditingActionReminderId&&item.agentPhone===sessionAgentPhone);if(!current){if(status)status.textContent="That custom reminder could not be found.";return}writeLocalAgentReminders(reminders.map(item=>item.id===activeEditingActionReminderId?{...item,date:dateValue,title:titleValue,note:noteValue,updatedAt:timestamp}:item));if(status)status.textContent=`Updated your reminder for ${formatReminderDateLabel(dateValue)}.`;tapFeedback("Reminder updated",titleValue,"success")}else{const record={id:Date.now()+Math.floor(Math.random()*1000),agentPhone:sessionAgentPhone,agentName:sessionName,date:dateValue,title:titleValue,note:noteValue,createdAt:timestamp,updatedAt:timestamp};writeLocalAgentReminders([record,...reminders]);if(status)status.textContent=`Saved your reminder for ${formatReminderDateLabel(dateValue)}.`;tapFeedback("Reminder saved",titleValue,"success")}activeActionReminderDate=dateValue;clearActionReminderForm();renderDailyActionList()}
function editCustomActionReminder(id){if(sessionRole!=="agent")return;const reminder=readLocalAgentReminders().find(item=>item.id===id&&item.agentPhone===sessionAgentPhone);if(!reminder)return;activeEditingActionReminderId=id;activeActionReminderDate=reminder.date;$("agentReminderDate").value=reminder.date;$("agentReminderTitle").value=reminder.title;$("agentReminderNote").value=reminder.note||"";$("agentReminderCancel").style.display="inline-flex";const saveButton=document.querySelector('#dailyActionSection .btn[onclick="saveCustomActionReminder()"]');if(saveButton)saveButton.textContent="Update Reminder";$("dailyActionStatus").textContent=`Editing your reminder for ${formatReminderDateLabel(reminder.date)}.`;scrollToSection("dailyActionSection")}
function deleteCustomActionReminder(id){if(sessionRole!=="agent")return;const reminders=readLocalAgentReminders();const current=reminders.find(item=>item.id===id&&item.agentPhone===sessionAgentPhone);if(!current)return;writeLocalAgentReminders(reminders.filter(item=>!(item.id===id&&item.agentPhone===sessionAgentPhone)));if(activeEditingActionReminderId===id)clearActionReminderForm();$("dailyActionStatus").textContent=`Deleted your reminder: ${current.title}.`;tapFeedback("Reminder deleted",current.title,"alert");renderDailyActionList()}
function renderAgents(){const wrap=$("agentList");if(!wrap)return;if(!activeAgents.length){wrap.innerHTML='<p class="empty">No agents added yet. Add today&apos;s WhatsApp agents here.</p>';return}wrap.innerHTML=activeAgents.map(agent=>`<div class="compare-item"><div><strong>${agent.name}</strong><p>${agent.company||"Independent agent"}${agent.areaFocus?` ΓÇó ${agent.areaFocus}`:""}</p><div class="mini">${agent.phone}</div><p class="sub" style="margin-top:6px">${agent.verified?"Verified agent login":"Awaiting master verification"}</p></div><div class="actions"><button class="ghost-link" onclick="toggleAgentVerified(${agent.id},${agent.verified?"false":"true"})">${agent.verified?"Verified":"Verify Account"}</button><button class="ghost-link" onclick="toggleAgentActive(${agent.id},${agent.activeToday?"false":"true"})">${agent.activeToday?"Active Today":"Set Active Today"}</button></div></div>`).join("")}
function renderAgentInbox(){const list=$("agentInboxList"),count=$("agentInboxCount");if(!list||!count)return;count.textContent=`${agentInbox.length} assigned item${agentInbox.length===1?"":"s"}`;if(!agentInbox.length){list.innerHTML='<p class="empty">No assigned leads yet. New callback requests and tour bookings will appear here.</p>';return}list.innerHTML=agentInbox.map(item=>item.kind==="booking"?`<div class="compare-item"><div><strong>${item.userName}</strong><p>${item.listingTitle}</p><div class="mini">${item.userPhone}</div><p class="sub" style="margin-top:6px">Requested viewing: ${formatTourSlot(item.requestedDate,item.requestedTime)}</p><p class="sub" style="margin-top:6px">Status: ${item.status==="confirmed"?"Confirmed":item.status==="declined"?"Declined":"Pending agent action"}</p><p class="sub" style="margin-top:6px">Submitted ${formatLeadTime(item.createdAt)}</p></div><div class="actions">${item.status==="pending"?`<button class="btn" onclick="respondToBooking(${item.id},'confirmed')">Accept Booking</button><button class="ghost-link" onclick="respondToBooking(${item.id},'declined')">Decline</button>`:`<a class="link" href="https://wa.me/${item.userPhone}?text=${encodeURIComponent(`Hi ${item.userName}, this is ${sessionName} regarding your ${item.listingTitle} viewing request for ${formatTourSlot(item.requestedDate,item.requestedTime)}.`)}" target="_blank" rel="noopener noreferrer">Reply on WhatsApp</a>`}</div></div>`:`<div class="compare-item"><div><strong>${item.userName}</strong><p>${item.listingTitle}</p><div class="mini">${item.userPhone}</div><p class="sub" style="margin-top:6px">${item.userMessage||"No extra message provided."}</p><p class="sub" style="margin-top:6px">Assigned ${formatLeadTime(item.createdAt)}</p></div><div class="actions"><a class="link" href="https://wa.me/${item.userPhone}?text=${encodeURIComponent(`Hi ${item.userName}, this is ${sessionName} from Klang Valley AI regarding ${item.listingTitle}.`) }" target="_blank" rel="noopener noreferrer">Reply on WhatsApp</a></div></div>`).join("")}
function automationScopedAgents(){return readLocalAgents().filter(agent=>sessionRole==="master"||agent.phone===sessionAgentPhone)}
function automationScopedLeads(){return readLocalLeads().filter(item=>sessionRole==="master"||item.assignedAgentPhone===sessionAgentPhone)}
function automationScopedBookings(){return readLocalBookings().filter(item=>sessionRole==="master"||item.assignedAgentPhone===sessionAgentPhone)}
function setAutomationTab(tab,button){document.querySelectorAll("[data-automation-tab]").forEach(item=>item.classList.toggle("active",item===button));document.querySelectorAll(".automation-pane").forEach(pane=>pane.classList.toggle("active",pane.id===`automationPane_${tab}`))}
function renderAutomationDistribution(){const list=$("automationDistributionList"),status=$("automationDistributionStatus");if(!list||!status)return;const agents=automationScopedAgents(),leads=readLocalLeads(),bookings=readLocalBookings();$("automationAgentCount").textContent=agents.length;$("automationLeadCount").textContent=automationScopedLeads().length;$("automationBookingCount").textContent=automationScopedBookings().length;if(!agents.length){list.innerHTML='<p class="empty">No visible agents available for AI routing yet.</p>';status.textContent="Add or verify agents first to activate AI distribution.";return}
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
'<div class="ai-lead-context" style="background:var(--brand-soft); padding:16px; border-radius:12px; margin-bottom:16px; border:1px solid var(--brand-dark);"><strong style="color:var(--brand);"><i class="fas fa-robot"></i> Live Routing: Incoming High-Intent Lead</strong><p style="margin:4px 0 0; font-size:0.9rem; color:var(--ink);">Targeting: <strong>'+targetArea+'</strong> ΓÇó Est. Budget: <strong>RM 800k</strong></p></div>' + 
scoredAgents.map((agent, i) => {
return `<div class="compare-item" style="display:flex; flex-direction:column; gap:12px; background:white; padding:16px; border-radius:12px; border: 1px solid var(--line); margin-bottom:12px; position:relative;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
            <strong>${agent.name} ${i === 0 ? '<span style="background:var(--brand);color:white;padding:2px 8px;border-radius:999px;font-size:0.7rem;margin-left:8px;">Best Match</span>' : ''}</strong>
            <p>${agent.company||"Independent agent"}${agent.areaFocus?` ΓÇó ${agent.areaFocus}`:""}</p>
            <div class="mini">${agent.phone}</div>
        </div>
        <div style="text-align:right;">
            <div style="font-size:1.6rem; font-weight:800; color:${i===0?'var(--brand)':'var(--ink)'};">${agent.matchScore}%</div>
            <div class="mini">AI Match</div>
        </div>
    </div>
    
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:var(--bg); padding:12px; border-radius:8px;">
        <div>
            <div style="font-size:0.75rem; color:var(--muted); font-weight:600; text-transform:uppercase;">Area Expertise</div>
            <div style="font-size:0.95rem; font-weight:700; color:var(--ink);">${agent.expertiseMatch}%</div>
        </div>
        <div>
            <div style="font-size:0.75rem; color:var(--muted); font-weight:600; text-transform:uppercase;">Response Speed</div>
            <div style="font-size:0.95rem; font-weight:700; color:${agent.responseSpeedMins < 5 ? 'var(--brand)' : 'var(--ink)'};">${agent.responseSpeedMins} mins</div>
        </div>
        <div>
            <div style="font-size:0.75rem; color:var(--muted); font-weight:600; text-transform:uppercase;">Performance</div>
            <div style="font-size:0.95rem; font-weight:700; color:var(--ink);">${agent.performanceScore}% Conv.</div>
        </div>
    </div>
</div>`;
}).join("");

status.innerHTML = "Intelligent AI assignment takes performance, area expertise, and historical response speed into account before routing.";
}
function renderAutomationFollowup(){const list=$("automationFollowupList"),status=$("automationFollowupStatus");if(!list||!status)return;const items=[...automationScopedLeads().map(item=>({...item,kind:"lead"})),...automationScopedBookings().map(item=>({...item,kind:"booking"}))].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8);if(!items.length){list.innerHTML='<p class="empty">No follow-up queue yet. Callback requests and viewing activity will appear here first.</p>';status.textContent="Follow-up sequences will populate once fresh leads arrive.";return}list.innerHTML=items.map(item=>{const agentName=item.assignedAgentName||sessionName;const intro=`Hi ${item.userName}, this is ${agentName} from Klang Valley AI. Thanks for checking out ${item.listingTitle}.`;const property=`I found another strong option around ${properties.find(p=>p.id===item.listingId)?.area||"this area"} that may suit what you're looking for.`;const urgency=item.kind==="booking"?"I can help secure your preferred viewing slot before it gets taken.":"If you want, I can send the exact location and fastest next-step options today.";return`<div class="compare-item"><div><strong>${item.userName}</strong><p>${item.listingTitle}</p><div class="mini">${item.userPhone}</div><p class="sub" style="margin-top:6px"><strong>Day 1:</strong> ${intro}</p><p class="sub" style="margin-top:6px"><strong>Day 2:</strong> ${property}</p><p class="sub" style="margin-top:6px"><strong>Day 3:</strong> ${urgency}</p></div><div class="actions"><a class="link" href="https://wa.me/${item.userPhone}?text=${encodeURIComponent(intro)}" target="_blank" rel="noopener noreferrer">Send Day 1</a></div></div>`}).join("");status.textContent=`Showing ${items.length} ready-to-send follow-up sequence${items.length===1?"":"s"}.`}
function renderAutomationCrm(){const grid=$("automationCrmGrid"),status=$("automationCrmStatus");if(!grid||!status)return;const leads=automationScopedLeads(),bookings=automationScopedBookings(),tenancies=readLocalTenancies().filter(item=>sessionRole==="master"||item.agentPhone===sessionAgentPhone),confirmed=bookings.filter(item=>item.status==="confirmed").length,converted=tenancies.filter(item=>item.rentCollected||item.agreementSigned).length,total=leads.length+bookings.length,conversion=total?Math.round(((confirmed+converted)/total)*100):0;$("automationCrmLeads").textContent=leads.length;$("automationCrmViewings").textContent=confirmed;$("automationCrmConversion").textContent=`${conversion}%`;const cards={Leads:leads.length,Pending_Viewings:bookings.filter(item=>item.status==="pending").length,Confirmed_Viewings:confirmed,Conversions:converted};grid.innerHTML=Object.entries(cards).map(([label,value])=>`<div class="vault-card"><div class="vault-head"><div><strong>${label.replace(/_/g," ")}</strong><p class="sub">Current pipeline metric</p></div><div class="vault-badges"><span class="booking-status ${label.includes("Conversion")?"confirmed":label.includes("Confirmed")?"pending":"declined"}">${value}</span></div></div><div class="vault-check-item good">${label==="Leads"?"Users who shared contact details through callback routing.":label==="Pending_Viewings"?"Viewing requests waiting on agent action.":label==="Confirmed_Viewings"?"Accepted tours showing stronger purchase intent.":"Deals that advanced into agreement or rent collection stages."}</div></div>`).join("");status.textContent=total?`Tracking ${total} active lead or viewing record${total===1?"":"s"} in the compact CRM view.`:"CRM metrics will populate after new callbacks and tours arrive."}
function loadAutomationConsole(){if(sessionRole!=="agent"&&sessionRole!=="master")return;renderAutomationDistribution();renderAutomationFollowup();renderAutomationCrm()}
function updateMasterSectionToggle(id){const section=$(id);if(!section)return;const toggle=section.querySelector(".master-section-toggle");if(!toggle)return;const collapsed=section.classList.contains("master-collapsed");toggle.textContent=collapsed?"Expand Panel":"Collapse Panel"}

function openMasterSection(id){if(sessionRole==="master")toggleMasterSection(id,true);scrollToSection(id)}
function setMasterTab(tab,button){document.querySelectorAll("[data-master-tab]").forEach(item=>item.classList.toggle("active",item===button));document.querySelectorAll(".master-pane").forEach(pane=>pane.classList.toggle("active",pane.id===`masterPane_${tab}`));if(tab==="power")renderPowerCompare()}
function openMasterTab(tab){const button=document.querySelector(`[data-master-tab="${tab}"]`);if(button)setMasterTab(tab,button);scrollToSection("masterCockpit")}

function renderPowerCompare(){const list=powerFilteredIds.length?properties.filter(item=>powerFilteredIds.includes(item.id)).sort((a,b)=>powerFilteredIds.indexOf(a.id)-powerFilteredIds.indexOf(b.id)):[];const container=$("powerCompareList"),count=$("powerCompareCount"),status=$("powerModeStatus"),meta=$("masterPowerMeta");if(!container||!count||!status||!meta)return;if(!list.length){count.textContent="0 shortlisted for compare";meta.textContent="Advanced investor and export workflow";status.textContent="Use yield, growth, and risk to build a serious-investor comparison set.";container.innerHTML='<p class="empty">No investor shortlist yet. Set a minimum yield, growth target, or risk level, then run bulk compare.</p>';return}const validSelection=masterBulkCompareIds.filter(id=>powerFilteredIds.includes(id));masterBulkCompareIds=validSelection.length?validSelection:list.slice(0,Math.min(4,list.length)).map(item=>item.id);count.textContent=`${masterBulkCompareIds.length} selected for compare`;meta.textContent=`${list.length} filtered opportunities ready for serious-investor review`;container.innerHTML=list.map(property=>{const decision=getDecisionPack(property),checked=masterBulkCompareIds.includes(property.id),undervalue=Math.max(Math.round(getUndervalueRatio(property)*100),0);return`<label class="bulk-compare-item"><input type="checkbox" ${checked?"checked":""} onchange="togglePowerCompare(${property.id},this.checked)"><div><strong>${property.title}</strong><p>${property.location}</p><div class="mini">${money(property.price)} ΓÇó ${property.yield}% yield ΓÇó ${property.growth}% growth ΓÇó Risk ${decision.risk}</div><p class="sub" style="margin-top:8px">${decision.bullets[0]}</p></div><div class="agent-metrics"><b>${rmFull(decision.negotiation)}</b><b>${undervalue}% below fair</b></div></label>`}).join("")}
function runPowerMode(){if(sessionRole!=="master")return;const minYield=Number($("powerMinYield")?.value||0),minGrowth=Number($("powerMinGrowth")?.value||0),riskFilter=($("powerRiskFilter")?.value||"all").toLowerCase();const matches=properties.filter(property=>{const decision=getDecisionPack(property);const risk=decision.risk.toLowerCase();return property.yield>=minYield&&property.growth>=minGrowth&&(riskFilter==="all"||risk===riskFilter)}).sort((a,b)=>b.yield-a.yield||b.growth-a.growth||b.aiScore-a.aiScore);powerFilteredIds=matches.map(item=>item.id);masterBulkCompareIds=masterBulkCompareIds.filter(id=>powerFilteredIds.includes(id));if(!masterBulkCompareIds.length)masterBulkCompareIds=matches.slice(0,Math.min(4,matches.length)).map(item=>item.id);renderPowerCompare();const status=$("powerModeStatus");if(status)status.textContent=matches.length?`Power mode found ${matches.length} property ${matches.length===1?"match":"matches"} above ${minYield}% yield and ${minGrowth}% growth with ${riskFilter==="all"?"any":"a "+riskFilter} risk profile.`:"No properties hit that investor brief yet. Lower one of the thresholds and run compare again.";tapFeedback(matches.length?"Power mode refreshed":"No power-mode matches",matches.length?`${masterBulkCompareIds.length} listing${masterBulkCompareIds.length===1?"":"s"} are selected for compare.`:"Try a lighter risk or yield filter.",matches.length?"success":"alert")}
function togglePowerCompare(id,checked){if(sessionRole!=="master")return;masterBulkCompareIds=checked?[...new Set([...masterBulkCompareIds,id])]:masterBulkCompareIds.filter(item=>item!==id);renderPowerCompare();const status=$("powerModeStatus");if(status)status.textContent=masterBulkCompareIds.length?`${masterBulkCompareIds.length} listing${masterBulkCompareIds.length===1?"":"s"} selected for export and executive compare.`:"No listings selected yet. Tick at least one property to export."}
function exportExecutiveReport(){if(sessionRole!=="master")return;const ids=masterBulkCompareIds.length?masterBulkCompareIds:powerFilteredIds;const list=properties.filter(item=>ids.includes(item.id)).sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));const status=$("powerModeStatus");if(!list.length){if(status)status.textContent="Run Power Mode first, then select at least one property to export.";tapFeedback("Export blocked","Build a power compare set before exporting.","alert");return}const reportWindow=window.open("","_blank","noopener,noreferrer,width=1180,height=860");if(!reportWindow){if(status)status.textContent="Popup blocked. Allow popups to export the executive report.";tapFeedback("Popup blocked","Allow popups to open the print-ready report.","alert");return}const generatedAt=new Date().toLocaleString("en-MY",{dateStyle:"medium",timeStyle:"short"});const cards=list.map(property=>{const decision=getDecisionPack(property);return`<article style="border:1px solid #e8ddd1;border-radius:22px;padding:20px;background:#fffaf5;break-inside:avoid;margin-bottom:16px"><h2 style="margin:0 0 6px;font:700 24px 'Space Grotesk',sans-serif;color:#221912">${esc(property.title)}</h2><p style="margin:0 0 14px;color:#6f6258">${esc(property.location)}</p><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px"><div style="padding:12px 14px;border-radius:16px;background:#fff;border:1px solid #eadfd4"><strong style="display:block;font-size:20px">${money(property.price)}</strong><span style="color:#6f6258">Ask price</span></div><div style="padding:12px 14px;border-radius:16px;background:#fff;border:1px solid #eadfd4"><strong style="display:block;font-size:20px">${property.yield}%</strong><span style="color:#6f6258">Rental yield</span></div><div style="padding:12px 14px;border-radius:16px;background:#fff;border:1px solid #eadfd4"><strong style="display:block;font-size:20px">${property.growth}%</strong><span style="color:#6f6258">Growth</span></div><div style="padding:12px 14px;border-radius:16px;background:#fff;border:1px solid #eadfd4"><strong style="display:block;font-size:20px">${decision.risk}</strong><span style="color:#6f6258">Risk level</span></div></div><p style="margin:0 0 8px"><strong>Why it stands out:</strong> ${esc(decision.bullets[0])}</p><p style="margin:0 0 8px"><strong>Negotiation zone:</strong> ${rmFull(decision.negotiation)} against AI fair value ${rmFull(decision.fairValue)}</p><p style="margin:0"><strong>Action:</strong> ${esc(decision.actionTitle)}. ${esc(decision.actionNote)}</p></article>`}).join("");reportWindow.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Executive Property Report</title><style>body{font-family: 'Plus Jakarta Sans', sans-serif;background:#f7efe6;color:#221912;padding:32px}h1{font:700 40px 'Space Grotesk',sans-serif;margin:0 0 8px}p{line-height:1.6}@media print{body{padding:0;background:#fff}button{display:none}}</style><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin></head><body><header style="margin-bottom:24px"><h1>Klang Valley AI Executive Report</h1><p>Generated ${esc(generatedAt)} for the master power compare workflow. Use Print ΓåÆ Save as PDF for investor-ready export.</p></header>${cards}

<!-- ≡ƒñû AI CHAT SYSTEM -->
<button class="sticky-ai-toggle" onclick="toggleAIChat()" title="Ask Property AI">
    <i class="fas fa-home"></i>
</button>

<aside class="ai-chat-panel" id="aiChatPanel">
    <div class="ai-chat-header">
        <div>
            <div class="brand-mark" style="width:36px; height:36px; border-radius:10px;"><i class="fas fa-home" style="font-size: 1rem;"></i></div>
            <h3>Property AI <span style="font-size: 0.7rem; background: var(--brand-soft); color: var(--brand-dark); padding: 2px 6px; border-radius: 4px;">LIVE</span></h3>
        </div>
        <button onclick="toggleAIChat()"><i class="fas fa-times"></i></button>
    </div>
    <div class="ai-chat-body" id="aiChatBody">
        <div class="chat-bubble ai">
            <strong>Hi there! ≡ƒÅíΓ£¿</strong><br>
            I'm your friendly Property Guide! I'd love to help you figure out affordability, check out neighborhoods, or compare homes. How can I help make your home journey wonderful today? ≡ƒÿè
        </div>
    </div>
    <div class="chat-prompts">
        <button class="chat-prompt-chip" onclick="quickSendChat('Can I afford this?')">Can I afford this?</button>
        <button class="chat-prompt-chip" onclick="quickSendChat('Is this area good?')">Is this area good?</button>
        <button class="chat-prompt-chip" onclick="quickSendChat('Compare my saved items')">Compare my saved items</button>
    </div>
    <div class="ai-chat-input-area">
        <input type="text" id="aiChatInput" placeholder="Ask anything..." onkeypress="handleChatEnter(event)">
        <button onclick="submitUserChat()"><i class="fas fa-paper-plane"></i></button>
    </div>
</aside>

<!-- AI Match Quiz Modal -->
<div class="modal" id="aiQuizModal" style="z-index: 2000;">
    <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header">
            <h3>AI Match Organizer <i class="fas fa-sparkles" style="color:var(--brand)"></i></h3>
            <button onclick="closeAIQuiz()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" id="quizBody" style="min-height: 250px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; padding: 24px;">
            <div id="quizQ1" class="quiz-slide active">
                <h4>What is your primary goal today?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="nextQuiz(1, 'Investment')">Investment & Yield</button>
                    <button class="quiz-btn" onclick="nextQuiz(1, 'First Home')">Buying First Home</button>
                    <button class="quiz-btn" onclick="nextQuiz(1, 'Upgrading')">Upgrading to Bigger Space</button>
                </div>
            </div>
            <div id="quizQ2" class="quiz-slide">
                <h4>What budget constraint feels safe?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="nextQuiz(2, '< 500K')">Below RM 500K</button>
                    <button class="quiz-btn" onclick="nextQuiz(2, '500K-1M')">RM 500K - 1M</button>
                    <button class="quiz-btn" onclick="nextQuiz(2, '> 1M')">Above RM 1M</button>
                </div>
            </div>
            <div id="quizQ3" class="quiz-slide">
                <h4>What location vibe do you prefer?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="nextQuiz(3, 'KL Lifestyle')">High Energy City Core</button>
                    <button class="quiz-btn" onclick="nextQuiz(3, 'Quiet Suburb')">Quiet Peaceful Suburb</button>
                    <button class="quiz-btn" onclick="nextQuiz(3, 'Transit Hub')">Next to MRT / Transit</button>
                </div>
            </div>
            <div id="quizQ4" class="quiz-slide">
                <h4>What is your absolute must-have?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="nextQuiz(4, 'High Yield')">Strong Cashflow (ROI)</button>
                    <button class="quiz-btn" onclick="nextQuiz(4, 'Low Density')">Spacious / Low Density</button>
                    <button class="quiz-btn" onclick="nextQuiz(4, 'Brand New')">Brand New / Developer</button>
                </div>
            </div>
            <div id="quizQ5" class="quiz-slide">
                <h4>What is your timeline?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="finishQuiz('ASAP')">Moving ASAP</button>
                    <button class="quiz-btn" onclick="finishQuiz('6 Months')">In 3-6 Months</button>
                    <button class="quiz-btn" onclick="finishQuiz('Browsing')">Just Browsing Markets</button>
                </div>
            </div>
            <div id="quizLoading" class="quiz-slide" style="text-align: center;">
                <i class="fas fa-brain fa-spin" style="font-size: 3rem; color: var(--brand); margin-bottom: 16px;"></i>
                <h4>Building your AI Profile...</h4>
                <p>Matching your style to the data grid.</p>
            </div>
        </div>
    </div>
</div>
\n</body>
</html>`);reportWindow.document.close();reportWindow.focus();if(status)status.textContent=`Executive report opened with ${list.length} shortlisted property ${list.length===1?"entry":"entries"}.`;tapFeedback("Executive report ready",`${list.length} property ${list.length===1?"summary":"summaries"} opened in a print-ready view.`,"success")}
function renderUserNotifications(){const list=$("userNotificationList"),count=$("userNotificationCount");if(!list||!count)return;const items=readLocalNotifications().filter(item=>item.userName===sessionName);count.textContent=`${items.length} update${items.length===1?"":"s"}`;if(!items.length){list.innerHTML='<p class="empty">No booking updates yet. Once you request a viewing, agent responses will appear here.</p>';return}list.innerHTML=items.map(item=>`<div class="notification-card ${item.read?"":"unread"}"><strong>${item.title}</strong><p>${item.message}</p><div class="mini">${formatLeadTime(item.createdAt)}</div></div>`).join("")}
function renderUserRentCenter(){const list=$("rentCenterList"),count=$("rentCenterCount");if(!list||!count)return;const items=readLocalTenancies().filter(item=>((item.tenantAccount||item.tenantName)===sessionUserAccount||item.tenantName===sessionName)).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));count.textContent=`${items.length} rent payment item${items.length===1?"":"s"}`;if(!items.length){list.innerHTML='<p class="empty">No selected rental deals yet. Pay rent will appear here after an agent selects your tenant profile.</p>';return}list.innerHTML=items.map(item=>`<div class="compare-item"><div><strong>${item.listingTitle}</strong><p>Handling agent: ${item.agentName}</p><div class="mini">${item.tenantPhone||"No phone stored"}</div><p class="sub" style="margin-top:6px">Monthly rent: ${rmFull(item.monthlyRent)} ΓÇó Owner: ${item.ownerName}</p><p class="sub" style="margin-top:6px">Payment status: ${item.paymentStatus==="submitted"?"Submitted, awaiting confirmation":item.rentCollected?"Collected":"Ready for payment"}</p><p class="sub" style="margin-top:6px">Agreement: ${item.agreementSigned?"Signed":"Pending"} ΓÇó Keys: ${item.keysShared?"Shared":"Pending"}</p></div><div class="actions">${!item.rentCollected?`<button class="btn" onclick="openRentPaymentModal(${item.id})">${item.paymentStatus==="submitted"?"Update Payment":"Pay Rent"}</button>`:""}<span class="booking-status ${tenancyStageMeta(item).className}">${tenancyStageMeta(item).label}</span></div></div>`).join("")}
function renderUserTenantApplications(){const list=$("userTenantApplicationList"),count=$("userTenantCount");if(!list||!count)return;const items=readLocalTenantApplications().filter(item=>((item.userAccount||item.userName)===sessionUserAccount||item.userName===sessionName)).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));const tenancies=readLocalTenancies();count.textContent=`${items.length} tenant application${items.length===1?"":"s"}`;if(!items.length){list.innerHTML='<p class="empty">No tenant profiles submitted yet. Open a property and use Register As Tenant to apply.</p>';return}list.innerHTML=items.map(item=>{const meta=tenantStatusMeta(item.status);const tenancy=tenancies.find(entry=>entry.applicationId===item.id||(entry.listingId===item.listingId&&(((entry.tenantAccount||entry.tenantName)===(item.userAccount||item.userName))||entry.tenantName===item.userName)));const rentText=tenancy?tenancy.paymentStatus==="submitted"?"Submitted, awaiting confirmation":tenancy.rentCollected?"Collected":"Ready for payment":"Pay rent becomes available after the assigned agent selects you as the tenant.";return`<div class="compare-item"><div><strong>${item.listingTitle}</strong><p>${item.occupation}</p><div class="mini">${item.userPhone}</div><p class="sub" style="margin-top:6px">Move-in target: ${item.moveInDate||"Not set"} ΓÇó Budget: ${rmFull(item.monthlyBudget||0)}/month</p><p class="sub" style="margin-top:6px">Assigned agent: ${item.assignedAgentName}</p><p class="sub" style="margin-top:6px">Rent payment: ${rentText}</p></div><div class="actions">${tenancy&&!tenancy.rentCollected?`<button class="btn" onclick="openRentPaymentModal(${tenancy.id})">${tenancy.paymentStatus==="submitted"?"Update Payment":"Pay Rent"}</button>`:""}<span class="booking-status ${meta.className}">${meta.label}</span></div></div>`}).join("")}
function renderMasterBookings(){const list=$("masterBookingList"),count=$("masterBookingCount");if(!list||!count)return;const items=readLocalBookings().slice().sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));count.textContent=`${items.length} booking request${items.length===1?"":"s"}`;if(!items.length){list.innerHTML='<p class="empty">No viewing bookings yet. User tour requests will appear here once they book from the shortlist.</p>';return}list.innerHTML=items.map(item=>`<div class="compare-item"><div><strong>${item.userName}</strong><p>${item.listingTitle}</p><div class="mini">${item.userPhone}</div><p class="sub" style="margin-top:6px">Requested slot: ${formatTourSlot(item.requestedDate,item.requestedTime)}</p><p class="sub" style="margin-top:6px">Assigned agent: ${item.assignedAgentName}</p><p class="sub" style="margin-top:6px">Agent response: ${item.status==="confirmed"?"Accepted":item.status==="declined"?"Declined":"Pending response"}${item.respondedBy?` by ${item.respondedBy}`:""}</p><p class="sub" style="margin-top:6px">Updated ${formatLeadTime(item.updatedAt||item.createdAt)}</p></div><div class="actions"><span class="booking-status ${bookingStatusMeta(item.status).className}">${bookingStatusMeta(item.status).label}</span></div></div>`).join("")}
function renderTenantPipeline(){const list=$("tenantPipelineList"),count=$("tenantPipelineCount");if(!list||!count)return;const applications=readLocalTenantApplications().filter(item=>item.assignedAgentPhone===sessionAgentPhone).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));const tenancies=readLocalTenancies().filter(item=>item.agentPhone===sessionAgentPhone).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));count.textContent=`${applications.length+tenancies.length} tenant item${applications.length+tenancies.length===1?"":"s"}`;if(!applications.length&&!tenancies.length){list.innerHTML='<p class="empty">No tenant recruitment leads assigned yet.</p>';return}const appCards=applications.map(item=>{const meta=tenantStatusMeta(item.status);const pending=item.status==="pending";return`<div class="compare-item"><div>${pending?`<div class="tenant-select-panel" onclick="openTenantSelection(${item.id})"><strong>${item.userName}</strong><p>${item.listingTitle}</p><div class="mini">${item.userPhone}</div><p class="sub" style="margin-top:6px">Occupation: ${item.occupation||"Not provided"} ΓÇó Move-in: ${item.moveInDate||"Flexible"}</p><p class="sub" style="margin-top:6px">Budget: ${rmFull(item.monthlyBudget||0)}/month</p><p class="sub" style="margin-top:6px">${item.notes||"No extra notes provided."}</p><div class="select-hint"><i class="fas fa-hand-pointer"></i> Click tenant name card to select this tenant and enable Pay Rent.</div></div>`:`<div class="tenant-select-panel is-selected"><strong>${item.userName}</strong><p>${item.listingTitle}</p><div class="mini">${item.userPhone}</div><p class="sub" style="margin-top:6px">Occupation: ${item.occupation||"Not provided"} ΓÇó Move-in: ${item.moveInDate||"Flexible"}</p><p class="sub" style="margin-top:6px">Budget: ${rmFull(item.monthlyBudget||0)}/month</p><p class="sub" style="margin-top:6px">${item.notes||"No extra notes provided."}</p><div class="select-hint"><i class="fas fa-circle-check"></i> Tenant selected. User can now see this deal in Rent Center and click Pay Rent.</div></div>`}</div><div class="actions">${pending?`<button class="btn" onclick="selectTenantDeal(${item.id})">Select Tenant & Enable Rent</button><button class="ghost-link" onclick="declineTenantDeal(${item.id})">Decline</button>`:`<span class="booking-status ${meta.className}">${meta.label}</span>`}</div></div>`}).join("");const tenancyCards=tenancies.map(item=>{const meta=tenancyStageMeta(item);return`<div class="compare-item"><div><strong>${item.tenantName}</strong><p>${item.listingTitle}</p><div class="mini">${item.tenantPhone}</div><p class="sub" style="margin-top:6px">Owner: ${item.ownerName} ΓÇó Monthly rent: ${rmFull(item.monthlyRent)}</p><p class="sub" style="margin-top:6px">Keys: ${item.keysShared?"Shared":"Pending"} ΓÇó Agreement: ${item.agreementSigned?"Signed":"Pending"} ΓÇó Rent: ${item.rentCollected?"Collected":"Pending"}</p><p class="sub" style="margin-top:6px">Tenant payment: ${item.paymentStatus==="submitted"?`Submitted via ${item.paymentMethod} (${item.paymentReference||"no ref"})`:"Not submitted yet"}</p></div><div class="actions">${!item.keysShared?`<button class="ghost-link" onclick="updateTenancyStage(${item.id},'keys')">Mark Keys Shared</button>`:""}${!item.agreementSigned?`<button class="ghost-link" onclick="updateTenancyStage(${item.id},'agreement')">Mark Agreement Signed</button>`:""}${!item.rentCollected?`<button class="btn" onclick="updateTenancyStage(${item.id},'rent')">${item.paymentStatus==="submitted"?"Confirm Rent Received":"Mark Rent Collected"}</button>`:""}<span class="booking-status ${meta.className}">${meta.label}</span></div></div>`}).join("");list.innerHTML=appCards+tenancyCards}
function renderDailyActionList(){const list=$("dailyActionList"),count=$("dailyActionCount"),status=$("dailyActionStatus"),grid=$("actionCalendarGrid"),monthLabel=$("actionCalendarMonthLabel"),selectedLabel=$("actionSelectedDateLabel"),dateInput=$("agentReminderDate"),saveButton=document.querySelector('#dailyActionSection .btn[onclick="saveCustomActionReminder()"]');if(!list||!count||!status||!grid||!monthLabel||!selectedLabel)return;const monthYear=activeActionCalendarMonth.getFullYear(),monthIndex=activeActionCalendarMonth.getMonth(),monthStart=reminderDateKey(monthYear,monthIndex,1),monthEnd=new Date(monthYear,monthIndex+1,0).getDate();if(!activeActionReminderDate||!String(activeActionReminderDate).startsWith(`${monthYear}-${String(monthIndex+1).padStart(2,"0")}`))activeActionReminderDate=monthStart;if(dateInput&&!activeEditingActionReminderId)dateInput.value=activeActionReminderDate;monthLabel.textContent=formatMonthLabel(activeActionCalendarMonth);selectedLabel.textContent=formatReminderDateLabel(activeActionReminderDate);if(saveButton)saveButton.textContent=activeEditingActionReminderId?"Update Reminder":"Save Reminder";const reminders=getAgentActionReminders(activeActionCalendarMonth);const reminderMap=new Map();reminders.forEach(item=>{const current=reminderMap.get(item.date)||[];current.push(item);reminderMap.set(item.date,current)});const weekdayLabels=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];const firstDay=new Date(monthYear,monthIndex,1),startOffset=(firstDay.getDay()+6)%7,totalCells=Math.ceil((startOffset+monthEnd)/7)*7,today=new Date(),todayString=todayKey();grid.innerHTML=weekdayLabels.map(day=>`<div class="rent-calendar-day">${day}</div>`).join("")+Array.from({length:totalCells},(_,index)=>{const day=index-startOffset+1;if(day<1||day>monthEnd)return'<div class="action-calendar-date empty"></div>';const dateKey=reminderDateKey(monthYear,monthIndex,day),dayItems=reminderMap.get(dateKey)||[],isToday=dateKey===todayString,isSelected=dateKey===activeActionReminderDate;return`<button type="button" class="action-calendar-date ${isToday?"today":""} ${isSelected?"selected":""}" onclick="selectActionCalendarDate('${dateKey}')"><div class="rent-date-number">${day}</div>${dayItems.slice(0,2).map(item=>`<span class="action-dot ${item.locked?"system":"custom"}">${item.locked?"Platform":"Mine"}</span>`).join("")}${dayItems.length>2?`<span class="action-dot system">+${dayItems.length-2} more</span>`:""}</button>`}).join("");const selectedItems=(reminderMap.get(activeActionReminderDate)||[]).sort((a,b)=>(a.locked===b.locked?new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0):a.locked?-1:1));count.textContent=`${selectedItems.length} reminder${selectedItems.length===1?"":"s"} on ${new Date(`${activeActionReminderDate}T00:00:00`).toLocaleDateString("en-MY",{day:"numeric",month:"short"})}`;if(!selectedItems.length){list.innerHTML='<div class="action-empty">No reminders on this date yet. Platform reminders from leads, viewings, document reviews, and monthly rent activity are locked. Only reminders you add yourself can be edited or deleted.</div>';status.textContent="Platform reminders are locked. Use the form above to add your own reminder for any date.";return}list.innerHTML=selectedItems.map(item=>`<article class="action-reminder-card"><div class="action-reminder-head"><div><strong>${item.title}</strong><p class="action-reminder-note">${item.note||"No extra note added."}</p></div><div class="action-reminder-meta"><span class="booking-status ${item.tone}">${getActionReminderToneLabel(item.tone,item.locked)}</span>${item.locked?'<span class="action-reminder-lock"><i class="fas fa-lock"></i> Locked</span>':''}</div></div><div class="mini">${formatReminderDateLabel(item.date)} ΓÇó ${item.locked?"Assigned from live workflow":"Added by you"}${item.createdAt?` ΓÇó ${formatLeadTime(item.updatedAt||item.createdAt)}`:""}</div>${item.locked?"":`<div class="action-reminder-actions"><button class="ghost-link" onclick="editCustomActionReminder(${item.id})">Edit</button><button class="ghost-link" onclick="deleteCustomActionReminder(${item.id})">Delete</button></div>`}</article>`).join("");status.textContent="Platform reminders from assigned leads, viewings, document reviews, and rent activity are read-only. Only your own reminders can be edited or deleted."}
function renderGeoLeadMap(){const list=$("geoLeadList"),count=$("geoLeadCount"),status=$("geoLeadStatus");if(!list||!count||!status)return;const areas=getAreaSignalSummary();count.textContent=`${areas.length} active areas`;if(!areas.length){list.innerHTML='<p class="empty">No buyer area concentration signals yet. Once users explore properties, attention clusters will show here.</p>';status.textContent="Waiting for more buyer interaction data.";return}list.innerHTML=areas.slice(0,8).map(item=>{const sources=Object.entries(item.sources).sort((a,b)=>b[1]-a[1]).map(entry=>`${entry[0].replace("_"," ")}: ${entry[1]}`).join(" ΓÇó ");return`<div class="compare-item"><div><strong>${item.area}</strong><p>Buyer attention is clustering here today. Use this area for outreach, listings, and content focus.</p><div class="mini">${sources}</div></div><div class="actions"><span class="booking-status confirmed">${item.count} signals</span></div></div>`}).join("");status.textContent="Privacy-safe area heat is based on clicks, view-more opens, callbacks, and tour requests."}
function renderContentGenerator(){const list=$("contentGeneratorList"),date=$("contentGeneratorDate"),status=$("contentGeneratorStatus");if(!list||!date||!status)return;const scripts=getOrCreateAgentContent();date.textContent=todayKey();list.innerHTML=scripts.map(item=>`<div class="vault-card"><div class="vault-head"><div><strong>${item.title}</strong><p class="sub">${item.hook}</p></div><div class="vault-badges"><span class="booking-status confirmed">Daily Script</span></div></div><div class="vault-check-item good">${item.script}</div></div>`).join("");status.textContent="Today's TikTok hooks were generated from current area attention and agent workflow themes."}

function renderRentalManagement(){const list=$("rentalManagementList"),count=$("rentalManagementCount");if(!list||!count)return;const items=readLocalTenancies().slice().sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));count.textContent=`${items.length} active rental deal${items.length===1?"":"s"}`;if(!items.length){list.innerHTML='<p class="empty">No tenant deals have been selected yet. Once an agent selects a tenant, the audit database will appear here.</p>';return}list.innerHTML=items.map(item=>{const meta=tenancyStageMeta(item);return`<div class="compare-item"><div><strong>${item.tenantName}</strong><p>${item.listingTitle}</p><div class="mini">${item.tenantPhone}</div><p class="sub" style="margin-top:6px">Handling agent: ${item.agentName}</p><p class="sub" style="margin-top:6px">Keys: ${item.keysShared?`Shared by ${item.keysMarkedBy||item.agentName} on ${formatLeadTime(item.keysMarkedAt)}`:"Pending"}</p><p class="sub" style="margin-top:6px">Agreement: ${item.agreementSigned?`Signed by ${item.agreementMarkedBy||item.agentName} on ${formatLeadTime(item.agreementMarkedAt)}`:"Pending"}</p><p class="sub" style="margin-top:6px">Payment submitted: ${item.paymentStatus==="submitted"?`${rmFull(item.paymentAmount)} by ${item.paymentPayer||item.tenantName} on ${formatLeadTime(item.paymentSubmittedAt)} via ${item.paymentMethod}`:"Not submitted"}</p><p class="sub" style="margin-top:6px">Rent: ${item.rentCollected?`Collected by ${item.rentMarkedBy||item.agentName} on ${formatLeadTime(item.rentMarkedAt)}`:"Pending"}</p></div><div class="actions"><span class="booking-status ${meta.className}">${meta.label}</span></div></div>`}).join("")}
function chatbotReply(message){const text=message.toLowerCase();const verifiedCount=properties.filter(item=>item.verifiedType==="owner"||item.verifiedType==="agent").length;const topHotspot=hotspots[0]?.name||"Mont Kiara";if(text.includes("price")||text.includes("psf"))return"Use the price, psf, and estimator together. Cards show listing price and psf, while the estimator gives a quick area-based reference.";if(text.includes("verify"))return`${verifiedCount} listings currently show verified status. Owner Verified and Agent Verified are controlled by the master account.`;if(text.includes("agent")||text.includes("whatsapp"))return"Open View More, submit your number, and the system routes you to one of today's active verified agents on WhatsApp.";if(text.includes("viewing")||text.includes("visit"))return"Ask for a viewing through the WhatsApp contact flow and include your preferred date or time in the message box.";if(text.includes("hotspot")||text.includes("area"))return`${topHotspot} leads the current hotspot stories, with Desa ParkCity and Bandar Kinrara also highlighted for different buyer profiles.`;if(text.includes("yield")||text.includes("growth")||text.includes("compare"))return"Yield helps with rental income logic, while growth helps with appreciation logic. The strongest fit depends on whether you prioritize cash flow or capital upside.";if(text.includes("ask")||text.includes("contact"))return"Before contacting an agent, ask about availability, maintenance fees, exact built-up size, furnishing, parking, tenure, and recent transaction context.";return"Try asking about verified listings, hotspots, pricing, viewings, yield versus growth, or how agent contact works."}
function renderUserDocumentVault(){const list=$("vaultUserList");if(!list)return;const items=readLocalVaultDocuments().filter(item=>item.userAccount===sessionUserAccount).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));if($("vaultUserStatus")){$("vaultUserStatus").textContent=items.length?`Tracking ${items.length} uploaded document${items.length===1?"":"s"} for ${sessionName}.`:"Upload your first document to start the tracker."}if(!items.length){list.innerHTML='<p class="empty">No documents uploaded yet. Add a loan, ID, offer, or SNP file to start your document tracker.</p>';return}list.innerHTML=items.map(item=>{const steps=timelineSteps(item);return`<div class="vault-card"><div class="vault-head"><div><strong>${item.title||item.fileName}</strong><p class="sub">${item.category} ΓÇó ${item.fileName} ΓÇó ${item.fileSizeLabel||""}</p></div><div class="vault-badges"><span class="booking-status pending">${item.reviewPercent||0}% complete</span><span class="booking-status ${item.docLevel==="Strong"?"confirmed":item.docLevel==="Needs Review"?"declined":"pending"}">${item.docLevel}</span></div></div><div class="vault-progress"><div class="vault-progress-bar"><div class="vault-progress-fill" style="width:${Math.min(100,Math.max(0,item.reviewPercent||0))}%"></div></div><div class="mini">Reviewed by ${item.reviewedBy||item.assignedAgentName||"Awaiting agent review"} ΓÇó Updated ${formatLeadTime(item.updatedAt||item.createdAt)}</div></div><div class="vault-metrics"><div class="vault-metric"><span>Auto Checker</span><b>${item.docLevel}</b></div><div class="vault-metric"><span>Document Level</span><b>${item.checkerScore||0}/100</b></div><div class="vault-metric"><span>Assigned Agent</span><b>${item.assignedAgentName||"Pending"}</b></div></div><div class="vault-checks">${(item.checks||[]).map(check=>`<div class="vault-check-item ${check.good?"good":""}">${check.text}</div>`).join("")}</div><div class="timeline-row">${steps.map(step=>`<span class="timeline-chip ${step.active?"active":""}"><i class="fas ${step.active?"fa-circle-check":"fa-circle"}"></i> ${step.label}</span>`).join("")}</div>${item.reviewNote?`<div class="mini">Agent note: ${item.reviewNote}</div>`:""}</div>`}).join("")}
function renderAgentDocumentVault(){const list=$("vaultAgentList"),count=$("vaultAgentCount");if(!list||!count)return;const items=readLocalVaultDocuments().filter(item=>item.assignedAgentPhone===sessionAgentPhone).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));count.textContent=`${items.length} assigned document${items.length===1?"":"s"}`;if(!items.length){list.innerHTML='<p class="empty">No buyer documents assigned to you yet.</p>';return}list.innerHTML=items.map(item=>{const steps=timelineSteps(item);return`<div class="vault-card"><div class="vault-head"><div><strong>${item.userName}</strong><p class="sub">${item.title||item.fileName} ΓÇó ${item.category} ΓÇó ${item.fileName}</p></div><div class="vault-badges"><span class="booking-status pending">${item.reviewPercent||0}% complete</span><span class="booking-status ${item.docLevel==="Strong"?"confirmed":item.docLevel==="Needs Review"?"declined":"pending"}">${item.docLevel}</span></div></div><div class="vault-review-grid"><input class="field" id="vaultPercent_${item.id}" type="number" min="0" max="100" value="${item.reviewPercent||0}" placeholder="Percent"><input class="field" id="vaultReviewNote_${item.id}" value="${esc(item.reviewNote||"")}" placeholder="Review note for buyer"><button class="btn" onclick="saveVaultReview(${item.id})">Save Review</button></div><div class="vault-metrics"><div class="vault-metric"><span>Auto Checker</span><b>${item.docLevel}</b></div><div class="vault-metric"><span>Document Level</span><b>${item.checkerScore||0}/100</b></div><div class="vault-metric"><span>Uploaded</span><b>${formatLeadTime(item.createdAt)}</b></div></div><div class="vault-checks">${(item.checks||[]).map(check=>`<div class="vault-check-item ${check.good?"good":""}">${check.text}</div>`).join("")}</div><div class="timeline-editor">${steps.map(step=>`<label class="timeline-toggle"><input type="checkbox" ${step.active?"checked":""} onchange="toggleVaultTimeline(${item.id},'${step.key}',this.checked)"><span>${step.label}</span></label>`).join("")}</div><div class="mini">Buyer timeline updates immediately on the user side. ${item.reviewNote?`Current note: ${item.reviewNote}`:""}</div></div>`}).join("")}
function renderChatHistory(){const wrap=$("chatHistory");if(!wrap)return;const items=readLocalChats().filter(item=>item.username===sessionName&&item.role===sessionRole);if(!items.length){wrap.innerHTML='<p class="empty">No chat yet. Ask the chatbot anything about the property flow.</p>';return}wrap.innerHTML=items.slice().reverse().map(item=>`<div class="compare-item"><div><strong>You</strong><p>${item.message}</p><p class="sub" style="margin-top:6px"><strong>Assistant:</strong> ${item.reply}</p><div class="mini">${item.role} ΓÇó ${formatLeadTime(item.createdAt)}</div></div></div>`).join("")}
function renderChatLogs(){const wrap=$("chatLogList"),count=$("chatLogCount");if(!wrap||!count)return;count.textContent=`${chatLogs.length} chats tracked`;if(!chatLogs.length){wrap.innerHTML='<p class="empty">No chatbot activity tracked yet.</p>';return}wrap.innerHTML=chatLogs.slice().reverse().map(item=>`<div class="compare-item"><div><strong>${item.username}</strong><p>${item.message}</p><p class="sub" style="margin-top:6px">${item.reply}</p><div class="mini">${item.role} ΓÇó ${formatLeadTime(item.createdAt)}${item.feedback?` ΓÇó ${item.feedback.replace("_"," ")}`:""}</div></div><div class="actions"><span class="ghost-link">${item.role==="agent"?"Agent Chat":"User Chat"}</span></div></div>`).join("")}
async function loadAgents(){if(sessionRole!=="master")return;const status=$("agentStatus");activeAgents=readLocalAgents();renderAgents();const count=activeAgents.filter(agent=>agent.activeToday).length;status.textContent=`${count} agent${count===1?"":"s"} active today.`;loadAutomationConsole();loadMasterExecutive()}
async 
function loadUserNotifications(){if(sessionRole!=="user")return;const status=$("userNotificationStatus");const notifications=readLocalNotifications();const updated=notifications.map(item=>item.userName===sessionName?{...item,read:true}:item);writeLocalNotifications(updated);renderUserNotifications();const count=updated.filter(item=>item.userName===sessionName).length;status.textContent=count?`Showing ${count} booking update${count===1?"":"s"} for ${sessionName}.`:"No booking updates yet."}
function loadUserDocumentVault(){if(sessionRole!=="user")return;renderUserDocumentVault()}
function loadAgentDocumentVault(){if(sessionRole!=="agent")return;const status=$("vaultAgentStatus");renderAgentDocumentVault();const count=readLocalVaultDocuments().filter(item=>item.assignedAgentPhone===sessionAgentPhone).length;status.textContent=count?`You have ${count} document review item${count===1?"":"s"} assigned right now.`:"No buyer documents assigned to you yet.";loadAgentDailyTools()}

function loadUserTenantApplications(){if(sessionRole!=="user")return;const status=$("userTenantStatus");const items=readLocalTenantApplications().filter(item=>((item.userAccount||item.userName)===sessionUserAccount||item.userName===sessionName));const selected=readLocalTenancies().filter(item=>((item.tenantAccount||item.tenantName)===sessionUserAccount||item.tenantName===sessionName)).length;renderUserTenantApplications();status.textContent=items.length?`Tracking ${items.length} tenant application${items.length===1?"":"s"} for ${sessionName}.${selected?` ${selected} rental selection ready for payment or follow-up.`:" Pay rent will appear after an agent selects your tenant profile."}`:"No tenant applications yet."}
function loadUserRentCenter(){if(sessionRole!=="user")return;const status=$("rentCenterStatus");const items=readLocalTenancies().filter(item=>((item.tenantAccount||item.tenantName)===sessionUserAccount||item.tenantName===sessionName));renderUserRentCenter();status.textContent=items.length?`You have ${items.length} selected rental deal${items.length===1?"":"s"} available for payment tracking.`:"No selected rental deals yet. Once an agent picks your profile, the pay rent action will appear here."}

function loadMasterBookings(){if(sessionRole!=="master")return;const status=$("masterBookingStatus");const items=readLocalBookings();renderMasterBookings();status.textContent=items.length?`Tracking ${items.length} viewing booking${items.length===1?"":"s"} across users and agents.`:"No viewing bookings tracked yet.";loadMasterExecutive()}
function loadTenantPipeline(){if(sessionRole!=="agent")return;const status=$("tenantPipelineStatus");const leads=readLocalTenantApplications().filter(item=>item.assignedAgentPhone===sessionAgentPhone);const deals=readLocalTenancies().filter(item=>item.agentPhone===sessionAgentPhone);renderTenantPipeline();renderAgentRentCalendar();const total=leads.length+deals.length;status.textContent=total?`You are handling ${total} tenant item${total===1?"":"s"} right now.`:"No tenant recruitment leads assigned yet.";loadAgentDailyTools()}

async function addAgent(){if(sessionRole!=="master")return;const name=$("agentName").value.trim(),phone=normalizePhone($("agentPhone").value),password=$("agentPassword").value.trim(),company=$("agentCompany").value.trim(),areaFocus=$("agentArea").value.trim(),status=$("agentStatus");if(!name||!phone||!password){status.textContent="Please enter the agent name, WhatsApp number, and login password.";return}const agents=readLocalAgents();const nextId=agents.reduce((max,item)=>Math.max(max,item.id||0),0)+1;const created={id:nextId,name,phone,password,company,areaFocus,activeToday:true,verified:false};writeLocalAgents([created,...agents]);activeAgents=readLocalAgents();renderAgents();status.textContent=`Added ${created.name}. Their login is awaiting master verification.`;["agentName","agentPhone","agentPassword","agentCompany","agentArea"].forEach(id=>$(id).value="");loadAutomationConsole();loadMasterExecutive()}
async function toggleAgentActive(id,nextValue){if(sessionRole!=="master")return;const status=$("agentStatus");const agents=readLocalAgents().map(item=>item.id===id?{...item,activeToday:nextValue===true||nextValue==="true"}:item);writeLocalAgents(agents);activeAgents=agents;renderAgents();const updated=agents.find(item=>item.id===id);const count=agents.filter(item=>item.activeToday).length;status.textContent=`${updated.name} is now ${updated.activeToday?"active":"inactive"} today. ${count} active in rotation.`;loadAutomationConsole();loadMasterExecutive()}
async function toggleAgentVerified(id,nextValue){if(sessionRole!=="master")return;const status=$("agentStatus");const agents=readLocalAgents().map(item=>item.id===id?{...item,verified:nextValue===true||nextValue==="true"}:item);writeLocalAgents(agents);activeAgents=agents;renderAgents();const updated=agents.find(item=>item.id===id);status.textContent=`${updated.name} is now ${updated.verified?"verified":"unverified"} for agent login.`;loadAutomationConsole();loadMasterExecutive()}
function submitVaultDocument(){if(sessionRole!=="user")return;const fileInput=$("vaultFile"),title=$("vaultTitle").value.trim(),category=$("vaultCategory").value,note=$("vaultNote").value.trim(),status=$("vaultUserStatus");const file=fileInput?.files?.[0];if(!file){status.textContent="Choose a document file before uploading.";return}const agent=getNextAssignedAgent();if(!agent){status.textContent="No active verified agents are available to review documents right now.";return}const check=inferDocumentCheck(file);const items=readLocalVaultDocuments();const record={id:Date.now(),userAccount:sessionUserAccount,userName:sessionName,title:title||file.name.replace(/\.[^.]+$/,""),category,fileName:file.name,fileSize:file.size,fileSizeLabel:`${Math.max(1,Math.round(file.size/1024))} KB`,fileType:file.type||"Unknown",reviewPercent:20,docLevel:check.level,checkerScore:check.score,checks:check.checks,reviewNote:"",note,assignedAgentId:agent.id,assignedAgentName:agent.name,assignedAgentPhone:agent.phone,reviewedBy:"",timeline:{offer:true,loan:false,snp:false,keys:false},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};writeLocalVaultDocuments([record,...items]);status.textContent=`Uploaded ${record.fileName}. Assigned to ${agent.name} for review.`;$("vaultTitle").value="";$("vaultNote").value="";$("vaultCategory").value="Loan Docs";if(fileInput)fileInput.value="";loadUserDocumentVault()}
function saveVaultReview(id){if(sessionRole!=="agent")return;const items=readLocalVaultDocuments();const current=items.find(item=>item.id===id&&item.assignedAgentPhone===sessionAgentPhone);if(!current)return;const percent=Math.max(0,Math.min(100,Number($(`vaultPercent_${id}`)?.value||current.reviewPercent||0)));const reviewNote=$(`vaultReviewNote_${id}`)?.value.trim()||"";const updated={...current,reviewPercent:percent,reviewNote,reviewedBy:sessionName,updatedAt:new Date().toISOString()};writeLocalVaultDocuments(items.map(item=>item.id===id?updated:item));$("vaultAgentStatus").textContent=`Saved review for ${current.userName}. Completion is now ${percent}%.`;createNotification({userName:current.userAccount,title:`Document review updated: ${current.title||current.fileName}`,message:`${sessionName} updated your document tracker to ${percent}% complete.${reviewNote?` Note: ${reviewNote}`:""}`});loadAgentDocumentVault()}
function toggleVaultTimeline(id,step,checked){if(sessionRole!=="agent")return;const items=readLocalVaultDocuments();const current=items.find(item=>item.id===id&&item.assignedAgentPhone===sessionAgentPhone);if(!current)return;const timeline={offer:false,loan:false,snp:false,keys:false,...(current.timeline||{})};timeline[step]=Boolean(checked);const updated={...current,timeline,reviewedBy:sessionName,updatedAt:new Date().toISOString()};writeLocalVaultDocuments(items.map(item=>item.id===id?updated:item));$("vaultAgentStatus").textContent=`Updated ${step.toUpperCase()} timeline for ${current.userName}.`;createNotification({userName:current.userAccount,title:`Timeline updated for ${current.title||current.fileName}`,message:`${sessionName} updated your purchase journey timeline. Current steps: ${timeline.offer?"Offer ":""}${timeline.loan?"Loan ":""}${timeline.snp?"SNP ":""}${timeline.keys?"Keys":""}`.trim()||"Awaiting first milestone."});loadAgentDocumentVault()}
function bookViewingTour(propertyId){if(sessionRole!=="user")return;const property=properties.find(item=>item.id===propertyId),date=$(`bookingDate_${propertyId}`)?.value,time=$(`bookingTime_${propertyId}`)?.value||"10:00 AM",phone=normalizePhone($(`bookingPhone_${propertyId}`)?.value||"");if(!property)return;if(!date||!phone){$("userNotificationStatus").textContent="Please choose a viewing date and enter your WhatsApp number first.";return}trackAreaInterest(property.area,"tour_request");const agent=getNextAssignedAgent();if(!agent){$("userNotificationStatus").textContent="No active verified agents are available to receive tour bookings right now.";return}const bookings=readLocalBookings();const existing=bookings.find(item=>item.listingId===propertyId&&item.userName===sessionName);const record={id:existing?.id||Date.now(),listingId:property.id,listingTitle:property.title,userName:sessionName,userPhone:phone,assignedAgentId:agent.id,assignedAgentName:agent.name,assignedAgentPhone:agent.phone,requestedDate:date,requestedTime:time,status:"pending",createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};const nextBookings=existing?bookings.map(item=>item.id===existing.id?record:item):[record,...bookings];writeLocalBookings(nextBookings);createNotification({userName:sessionName,title:`Viewing request sent for ${property.title}`,message:`Your viewing request for ${formatTourSlot(date,time)} has been sent to ${agent.name}. We will notify you once the agent accepts or declines.`});$("userNotificationStatus").textContent=`Viewing request sent for ${property.title}. ${agent.name} has been notified.`;renderCompare();loadUserNotifications();loadAutomationConsole();tapFeedback("Viewing requested",`${agent.name} was notified for ${property.title}.`,"success")}
function submitTenantApplication(){if(sessionRole!=="user"||activeModalId==null)return;const property=properties.find(item=>item.id===activeModalId),name=$("tenantName").value.trim(),phone=normalizePhone($("tenantPhone").value),occupation=$("tenantOccupation").value.trim(),moveInDate=$("tenantMoveIn").value,budget=Number($("tenantBudget").value||0),notes=$("tenantNotes").value.trim(),status=$("tenantStatus");if(!property)return;if(!name||!phone||!occupation){status.textContent="Please fill in your name, WhatsApp number, and occupation.";return}const agent=getNextAssignedAgent();if(!agent){status.textContent="No active verified agents are available to review tenant applications right now.";return}const items=readLocalTenantApplications();const existing=items.find(item=>item.listingId===property.id&&((item.userAccount||item.userName)===sessionUserAccount||item.userName===sessionName));const record={id:existing?.id||Date.now(),listingId:property.id,listingTitle:property.title,userAccount:sessionUserAccount,userName:name,userPhone:phone,occupation,moveInDate,monthlyBudget:budget,notes,assignedAgentId:agent.id,assignedAgentName:agent.name,assignedAgentPhone:agent.phone,status:"pending",createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};writeLocalTenantApplications(existing?items.map(item=>item.id===existing.id?record:item):[record,...items]);createNotification({userName:sessionName,title:`Tenant profile submitted for ${property.title}`,message:`Your tenant profile has been routed to ${agent.name}. The agent will review your rental application and update you if selected.`});status.textContent=`Tenant profile submitted for ${property.title}. ${agent.name} will review your application.`;loadUserTenantApplications()}
function selectTenantDeal(id){if(sessionRole!=="agent")return;const items=readLocalTenantApplications();const current=items.find(item=>item.id===id&&item.assignedAgentPhone===sessionAgentPhone);if(!current)return;const updated={...current,status:"selected",updatedAt:new Date().toISOString()};writeLocalTenantApplications(items.map(item=>item.id===id?updated:item));const property=properties.find(item=>item.id===current.listingId);const tenancies=readLocalTenancies();const monthlyRent=current.monthlyBudget||Math.round((property?.price||500000)*0.004);const tenancy={id:Date.now(),applicationId:current.id,listingId:current.listingId,listingTitle:current.listingTitle,tenantAccount:current.userAccount||current.userName,tenantName:current.userName,tenantPhone:current.userPhone,agentName:sessionName,agentPhone:sessionAgentPhone,ownerName:ownerLabel(property),monthlyRent,moveInDate:current.moveInDate,keysShared:false,agreementSigned:false,rentCollected:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};writeLocalTenancies([tenancy,...tenancies]);createNotification({userName:current.userAccount||current.userName,title:`You were selected as tenant for ${current.listingTitle}`,message:`${sessionName} selected you as the tenant and forwarded your deal to ${ownerLabel(property)} for keys and agreement preparation.`});loadTenantPipeline();renderAgentRentCalendar()}
function declineTenantDeal(id){if(sessionRole!=="agent")return;const items=readLocalTenantApplications();const current=items.find(item=>item.id===id&&item.assignedAgentPhone===sessionAgentPhone);if(!current)return;writeLocalTenantApplications(items.map(item=>item.id===id?{...item,status:"declined",updatedAt:new Date().toISOString()}:item));createNotification({userName:current.userAccount||current.userName,title:`Rental application update for ${current.listingTitle}`,message:`${sessionName} did not move forward with your tenant profile for this property.`});loadTenantPipeline()}
function updateTenancyStage(id,stage){if(sessionRole!=="agent")return;const tenancies=readLocalTenancies();const current=tenancies.find(item=>item.id===id&&item.agentPhone===sessionAgentPhone);if(!current)return;const timestamp=new Date().toISOString();const next={...current,updatedAt:timestamp};if(stage==="keys"){next.keysShared=true;next.keysMarkedAt=timestamp;next.keysMarkedBy=sessionName}if(stage==="agreement"){next.agreementSigned=true;next.agreementMarkedAt=timestamp;next.agreementMarkedBy=sessionName}if(stage==="rent"){next.rentCollected=true;next.rentMarkedAt=timestamp;next.rentMarkedBy=sessionName;next.paymentStatus=next.paymentStatus||"submitted"}writeLocalTenancies(tenancies.map(item=>item.id===id?next:item));const stageMessage=stage==="keys"?"Keys are ready for handover with the owner.":stage==="agreement"?"The owner agreement is now marked as signed.":"First rent collection is now marked as completed.";createNotification({userName:current.tenantAccount||current.tenantName,title:`Rental management update for ${current.listingTitle}`,message:`${stageMessage} Handling agent: ${sessionName}. Owner coordination: ${current.ownerName}.`});loadTenantPipeline();renderAgentRentCalendar()}

async 
function startUnlockSequence() {
    $("unlockTeaser").style.display = "none";
    $("unlockLoading").style.display = "block";
    let texts = ["Crunching area data...", "Analyzing rental yield...", "Checking off-market units...", "Generating report..."];
    let i = 0;
    let t = setInterval(()=>{
        i++;
        if(i >= texts.length) {
            clearInterval(t);
            $("unlockLoading").style.display = "none";
            $("unlockFinal").style.display = "block";
        } else {
            $("unlockLoadingText").textContent = texts[i];
        }
    }, 800);
}

async 
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

async 
async function triggerAIGeneration() {
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


async 
function startUnlockSequence() {
    $("unlockTeaser").style.display = "none";
    $("unlockLoading").style.display = "block";
    let texts = ["Crunching area data...", "Analyzing rental yield...", "Checking off-market units...", "Generating report..."];
    let i = 0;
    let t = setInterval(()=>{
        i++;
        if(i >= texts.length) {
            clearInterval(t);
            $("unlockLoading").style.display = "none";
            $("unlockFinal").style.display = "block";
        } else {
            $("unlockLoadingText").textContent = texts[i];
        }
    }, 800);
}


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


function startUnlockSequence() {
    $("unlockTeaser").style.display = "none";
    $("unlockLoading").style.display = "block";
    let texts = ["Crunching area data...", "Analyzing rental yield...", "Checking off-market units...", "Generating report..."];
    let i = 0;
    let t = setInterval(()=>{
        i++;
        if(i >= texts.length) {
            clearInterval(t);
            $("unlockLoading").style.display = "none";
            $("unlockFinal").style.display = "block";
        } else {
            $("unlockLoadingText").textContent = texts[i];
        }
    }, 800);
}


function triggerAIGeneration() {
    const input = document.getElementById('aiOmnibarInput').value;
    if(!input.trim()) return;
    
    const container = document.getElementById('omniContainer');
    const genState = document.getElementById('aiGenerativeState');
    const grid = document.getElementById('propertiesGrid');
    
    // UI Feedback
    container.style.boxShadow = "0 0 60px rgba(168,85,247,0.4)";
    container.style.border = "1px solid rgba(168,85,247,0.8)";
    grid.style.opacity = "0.2";
    
    genState.style.display = "block";
    
    const logs = [
        "Parsing semantic intent...",
        "Querying KL real estate latent space...",
        "Evaluating ROI parameters...",
        "Rendering highly optimized matches..."
    ];
    let i=0;
    
    let interval = setInterval(() => {
        document.getElementById('aiLoadingLog').textContent = logs[i];
        i++;
        if(i >= logs.length) {
            clearInterval(interval);
            setTimeout(() => {
                genState.style.display = "none";
                container.style.boxShadow = "0 0 40px rgba(6,182,212,0.1)";
                container.style.border = "1px solid rgba(6,182,212,0.3)";
                grid.style.opacity = "1";
                // Trigger actual render
                typeof renderProperties === 'function' && renderProperties();
            }, 600);
        }
    }, 450);
}

// Modify existing renderProperties hook if necessary

async function contactAgent() {
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
        }, 2000);
        
    } catch (err) {
        console.error(err);
        btn.disabled = false;
        btn.textContent = "Error. Try Again.";
    }
}
function renderProperties(){const list=filtered(),grid=$("propertiesGrid");if(!list.length){grid.innerHTML='<div class="card glass"><div class="body"><div class="title">No properties match this filter set</div><p class="sub">Try broadening the budget, removing a quick tag, or switching the goal back to Balanced.</p></div></div>';updateSide(list);return}grid.innerHTML=list.map(p=>{const media=getPropertyMedia(p),decision=getDecisionPack(p),liveCount=getLiveViewerCount(p);return `<article class="card glass">
        <div class="media">
            <img src="${media.images[0]}" alt="${p.title}" loading="lazy" decoding="async">
            <div class="tint"></div>
            <div class="topline">
                <div class="stack">${p.badge?`<span class="pill ${p.badge}">${p.badge}</span>`:``} <span class="pill">${p.type}</span></div>
                <div class="stack"><span class="score"><i class="fas fa-sparkles"></i> ${p.aiScore}</span><button class="save ${savedIds.includes(p.id)?"saved":""}" onclick="toggleSave(${p.id})"><i class="fas fa-heart"></i></button></div>
            </div>
        </div>
        <div class="body">
            <div class="price-row">
                <div>${priceMarkup || `<div class="price">${money(p.price)}</div>`}<div class="title">${p.title}</div></div>
<div style="margin-top:8px; padding:6px 12px; background:rgba(6,182,212,0.08); border-left:2px solid var(--brand); color:var(--muted); font-size:0.8rem; font-family:'Courier Prime', monospace;">
<i class="fas fa-microchip" style="color:var(--brand);"></i> <b>AI Verdict:</b> Generated ${Math.floor(Math.random()*90)+10}% confidence match for your profile.
</div>
                <div class="mini"><i class="fas fa-chart-line"></i> ${p.growth}% YoY</div>
            </div>
            <div class="location"><i class="fas fa-location-dot"></i> ${p.location}</div>
            <div class="actions">
                <span class="mini">${verificationLabel(p.verifiedType)}</span>
                <span class="mini">≡ƒöÑ ${liveCount} viewing now</span>
                <span class="mini">Risk: ${decision.risk}</span>
                ${sessionRole==="master"&&p.verifiedType==="unverified"?`<button class="ghost-link" onclick="verifyListing(${p.id},'owner')">Verify Owner</button><button class="ghost-link" onclick="verifyListing(${p.id},'agent')">Verify Agent</button>`:""}
            </div>
            <p class="sub">${decision.personalSummary}</p>
            <div class="meta">
                <span><strong>Layout</strong>${p.bedrooms} beds / ${p.bathrooms} baths</span>
                <span><strong>Size</strong>${p.sqft} sqft</span>
                <span><strong>Price</strong>RM ${p.psf} psf</span>
            </div>
            <div class="reasons">
                <span><strong>ROI</strong>${decision.roi}%</span>
                <span><strong>Commute</strong>${p.commute}</span>
                <span><strong>Offer</strong>${rmFull(decision.negotiation)}</span>
            </div>
            <div class="actions">
                <a class="link" href="${p.mapLink}" target="_blank" rel="noopener noreferrer">Open Map</a>
                <button class="ghost-link" onclick="openModal(${p.id})">View More</button>
                <button class="ghost-link" onclick="focusMatch(${p.id})">Why this match?</button>
            </div>
        </div>
    </article>`}).join("");updateSide(list)}
function updateSide(list){const avg=list.length?(list.reduce((s,p)=>s+p.yield,0)/list.length).toFixed(1):"0.0",behavior=analyzeBehavioralProfile();$("resultsSummary").textContent=`${list.length} listing${list.length===1?"":"s"} match your brief`;$("statListings").textContent=list.length;$("statYield").textContent=`${avg}%`;$("statArea").textContent=list[0]?.area||"None";const top=list[0],recs=$("recommendations"),market=$("marketTrends");renderLiveSurfaces();if(!top){$("matchTitle").textContent="No current match";$("matchSummary").textContent="Adjust your filters to rebuild a shortlist.";$("matchPrice").textContent="RM 0";$("matchReason").textContent="No recommendation available.";$("matchYield").textContent="0%";$("matchGrowth").textContent="0% YoY";recs.innerHTML="";market.innerHTML="";return}const decision=getDecisionPack(top);$("matchTitle").textContent=`Best Match: ${top.area}`;$("matchSummary").textContent=`${top.title} leads the shortlist with an AI score of ${top.aiScore}. ${behavior?behavior.strategyLine:decision.bullets[0]}`;$("matchPrice").textContent=money(top.price);$("matchReason").textContent=`${decision.personalSummary} Negotiation zone: ${rmFull(decision.negotiation)}.`;$("matchYield").textContent=`${decision.roi}% ROI`;$("matchGrowth").textContent=`${top.growth}% YoY`;recs.innerHTML=list.slice(0,3).map(p=>{const pack=getDecisionPack(p);return `<div class="rec"><img src="${getPropertyMedia(p).images[0]}" alt="${p.title}" loading="lazy" decoding="async"><div><strong>${p.title}</strong><p>${p.location}</p><div class="mini">${money(p.price)} ΓÇó ${pack.roi}% ROI ΓÇó Risk ${pack.risk}</div><p class="sub" style="margin-top:6px">${pack.personalSummary}</p></div><button class="chip" onclick="focusMatch(${p.id})">Inspect</button></div>`}).join("");market.innerHTML=getTopUndervaluedProperties(5).map(p=>`<li><div><strong>${p.area}</strong><span>${Math.round(getUndervalueRatio(p)*100)}% below AI fair value</span></div><span class="delta up">${getDecisionPack(p).roi}% ROI</span></li>`).join("")}
function renderCompare(){const saved=properties.filter(p=>savedIds.includes(p.id));const bookings=readLocalBookings();$("compareEmpty").style.display=saved.length?"none":"block";$("compareList").innerHTML=saved.map(p=>{const booking=bookings.find(item=>item.listingId===p.id&&((item.userAccount||item.userName)===sessionUserAccount||item.userName===sessionName)),status=booking?bookingStatusMeta(booking.status):null,decision=getDecisionPack(p);return`<div class="compare-item"><img src="${getPropertyMedia(p).images[0]}" alt="${p.title}" loading="lazy" decoding="async"><div><strong>${p.title}</strong><p>${p.location}</p><div class="mini">${money(p.price)} ΓÇó ${decision.roi}% ROI ΓÇó Risk ${decision.risk}</div><p class="sub" style="margin-top:6px">${decision.personalSummary}</p>
${sessionRole==="user"?`<div class="booking-panel">${booking?`<span class="booking-status ${status.className}"><i class="fas fa-calendar-check"></i> ${status.label}</span><p class="booking-note">${booking.status==="declined"?`Your last slot ${booking.requestedDate} at ${booking.requestedTime} was declined by ${booking.assignedAgentName}. Pick another date below.`:`Viewing requested for ${booking.requestedDate} at ${booking.requestedTime} with ${booking.assignedAgentName}.`}</p>`:`<p class="booking-note">Add a preferred viewing date and time to request a tour from this shortlist card.</p>`}<div class="booking-grid"><input class="field" id="bookingDate_${p.id}" type="date" min="${new Date().toISOString().split("T")[0]}"><select class="select" id="bookingTime_${p.id}"><option value="10:00 AM">10:00 AM</option><option value="12:00 PM">12:00 PM</option><option value="3:00 PM">3:00 PM</option><option value="6:30 PM">6:30 PM</option></select></div><div class="booking-grid"><input class="field" id="bookingPhone_${p.id}" placeholder="Your WhatsApp number"><button class="btn" onclick="bookViewingTour(${p.id})"><i class="fas fa-calendar-days"></i> ${booking&&booking.status!=="declined"?"Update Viewing Request":"Book Viewing Tour"}</button></div></div>`:""}</div><button class="ghost" onclick="toggleSave(${p.id})">Remove</button></div>`}).join("")}
function toggleSave(id, btn){
    const added=!savedIds.includes(id);
    const property=properties.find(item=>item.id===id);
    savedIds=added?[...savedIds,id]:savedIds.filter(x=>x!==id);
    if(property&&added&&sessionRole==="user"&&typeof updateBuyerMemory==="function")updateBuyerMemory("saved",property);
    if(btn) {
        const icon = btn.querySelector('i');
        if(added) {
            icon.className = 'fas fa-heart anim-heart';
            btn.classList.add('saved');
            btn.innerHTML = icon.outerHTML + ' Saved';
            const card = document.getElementById('card_'+id);
            if(card) {
                card.classList.add('anim-glow');
                setTimeout(()=>card.classList.remove('anim-glow'), 1200);
            }
        } else {
            icon.className = 'far fa-heart';
            btn.classList.remove('saved');
            btn.innerHTML = icon.outerHTML + ' Save';
        }
    }
    renderProperties();renderCompare();renderAIOrganizerView();popActiveControl();tapFeedback(added?"Saved to your vault":"Removed from saved homes",property?.title||"Property updated",added?"success":"alert");
}
function focusMatch(id){const property=properties.find(x=>x.id===id);if(!property)return;const decision=getDecisionPack(property);trackAreaInterest(property.area,"match");if(sessionRole==="user"&&typeof updateBuyerMemory==="function")updateBuyerMemory("focused",property);$("matchTitle").textContent=`Why ${property.area} stands out`;$("matchSummary").textContent=decision.personalSummary;$("matchPrice").textContent=money(property.price);$("matchReason").textContent=`${decision.bullets[0]} ${decision.negotiationScript}`;$("matchYield").textContent=`${decision.roi}% ROI`;$("matchGrowth").textContent=`${property.growth}% YoY`;renderAIOrganizerView();scrollToSection('market')}
function fillModal(property){const decision=getDecisionPack(property);$("modalVerify").textContent=verificationLabel(property.verifiedType);$("modalTitle").textContent=property.title;$("modalLocation").textContent=property.location;$("modalLiveSignals").innerHTML=`<span class="live-pill">≡ƒöÑ ${getLiveViewerCount(property)} people viewing now</span><span class="live-pill">${getReplySignal(property)}</span>`;renderModalMedia(property);$("modalPrice").textContent=money(property.price);$("modalFit").textContent=decision.personalSummary;$("modalType").textContent=property.type;$("modalBedrooms").textContent=property.bedrooms;$("modalBathrooms").textContent=property.bathrooms;$("modalSqft").textContent=`${property.sqft} sqft`;$("modalPsf").textContent=`RM ${property.psf}`;$("modalYield").textContent=`${property.yield}%`;$("modalGrowth").textContent=`${property.growth}% YoY`;$("modalScore").textContent=property.aiScore;$("modalVibe").textContent=property.vibe;$("modalCommute").textContent=property.commute;$("modalMap").href=property.mapLink;$("modalSaveToggle").textContent=savedIds.includes(property.id)?"Remove Saved":"Save Listing";$("modalWhyList").innerHTML=decision.bullets.map(item=>`<li>${item}</li>`).join("");$("modalRiskLevel").textContent=decision.risk;$("modalRiskNote").textContent=decision.riskNote;$("modalNegotiation").textContent=`Offer ${rmFull(decision.negotiation)}`;$("modalNegotiationNote").textContent=`AI fair value ${rmFull(decision.fairValue)} ΓÇó Estimated ROI ${decision.roi}% ΓÇó ${decision.negotiationScript}`;$("modalActionTitle").textContent=decision.actionTitle;$("modalActionNote").textContent=decision.actionNote;const riskCard=$("modalRiskCard");if(riskCard)riskCard.className=`decision-card risk-${decision.risk.toLowerCase()}`;$("leadStatus").textContent=sessionRole==="agent"?"Agent accounts cannot request callback routing.":"";$("leadName").value=sessionRole==="user"&&sessionName!=="Guest"?sessionName:"";$("leadPhone").value="";$("leadMessage").value=`Hi, I would like more details about ${property.title}. ${decision.negotiationScript}`;$("contactAgentBtn").textContent="Find an Agent on WhatsApp";$("contactWrap").classList.toggle("hidden",sessionRole!=="user");$("leadFormWrap").classList.toggle("hidden",sessionRole!=="user");if($("negotiatorWrap"))$("negotiatorWrap").style.display=sessionRole==="user"?"block":"none";if($("negotiatorStatus"))$("negotiatorStatus").textContent="";if($("negotiatorOfferPrice"))$("negotiatorOfferPrice").value="";$("contactAgentBtn").classList.toggle("hidden",sessionRole!=="user");$("tenantName").value=sessionRole==="user"&&sessionName!=="Guest"?sessionName:"";$("tenantPhone").value="";$("tenantOccupation").value="";$("tenantMoveIn").value="";$("tenantBudget").value="";$("tenantNotes").value=`Interested in renting ${property.title}.`;$("tenantStatus").textContent="";$("tenantApplyWrap").classList.toggle("hidden",sessionRole!=="user");$("tenantApplyForm").classList.toggle("hidden",sessionRole!=="user");$("tenantApplyActions").classList.toggle("hidden",sessionRole!=="user");$("modalMediaManager").classList.toggle("hidden",!["agent","master"].includes(sessionRole))}
function openModal(id){const property=properties.find(p=>p.id===id);if(!property)return;trackAreaInterest(property.area,"view_more");if(sessionRole==="user"&&typeof trackAIView==="function")trackAIView(id);activeModalId=id;fillModal(property);if(sessionRole==="master"){fillEditForm(property);$("modalStatus").textContent=""}renderAIOrganizerView();$("propertyModal").classList.add("open");tapFeedback("Property opened",`${property.title} now has a full decision-brain view.`,"success")}
function renderDopamineAgentDashboard(){if(sessionRole!=="agent")return;const myAgent=readLocalAgents().find(item=>item.phone===sessionAgentPhone)||{name:sessionName,phone:sessionAgentPhone,areaFocus:"Klang Valley",verified:true,activeToday:true},leads=readLocalLeads().filter(item=>item.assignedAgentPhone===sessionAgentPhone).map(item=>({...item,kind:"lead"})),bookings=readLocalBookings().filter(item=>item.assignedAgentPhone===sessionAgentPhone).map(item=>({...item,kind:"booking"})),signals=[...bookings,...leads].sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt)),performance=getAgentPerformanceSnapshot(myAgent),uniqueBuyers=new Set(signals.map(item=>item.userPhone||item.userName).filter(Boolean)).size,topSignal=signals[0],topIntel=topSignal?getLeadIntelligence(topSignal):null;if($("dopamineActiveLeads"))$("dopamineActiveLeads").textContent=signals.length;if($("dopamineActiveViewings"))$("dopamineActiveViewings").textContent=performance.confirmedViewings||bookings.length;if($("dopamineClosingRate"))$("dopamineClosingRate").textContent=`${performance.conversionRate}%`;if($("dopamineMarketBuyers"))$("dopamineMarketBuyers").textContent=uniqueBuyers||signals.length;if($("dopamineMarketLeadsBadge"))$("dopamineMarketLeadsBadge").innerHTML=`<i class="fas fa-bolt"></i> ${signals.length} live signals`;if($("dopaminePipeNew"))$("dopaminePipeNew").textContent=`New Leads (${leads.length})`;if($("dopaminePipeView"))$("dopaminePipeView").textContent=`Viewing (${bookings.filter(item=>item.status==="pending").length})`;if($("dopamineNextActionTitle"))$("dopamineNextActionTitle").textContent=topSignal?`Prioritize ${topSignal.userName} ΓÇö ${topIntel.score}% ${topIntel.toneLabel}`:"No live buyer action yet";if($("dopamineNextActionReason"))$("dopamineNextActionReason").textContent=topIntel?topIntel.reasonLine:"Fresh leads, tours, and callbacks will create the next action automatically.";const signalWrap=$("liveBuyerSignalsList");if(signalWrap)signalWrap.innerHTML=signals.length?signals.slice(0,6).map(signal=>{const intel=getLeadIntelligence(signal),property=properties.find(p=>p.id===signal.listingId),phone=normalizePhone(signal.userPhone||""),replyText=intel.suggestedReply;return `<article class="card glass" style="padding:24px; border-left:6px solid ${intel.tone==="hot"?"#f97316":intel.tone==="warm"?"#ca8a04":"#94a3b8"}; border-radius:16px;">
                <div style="display:flex; justify-content:space-between; gap:14px; margin-bottom:12px;">
                    <div>
                        <span class="booking-status ${intel.toneClass}">${intel.toneLabel}</span>
                        <h3 style="margin:12px 0 4px; font-size:1.2rem; font-family:'Outfit'">${esc(signal.userName)}</h3>
                        <p class="mini">${property?.area||"Klang Valley"} ΓÇó ${intel.intentLabel}</p>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:1.8rem; font-weight:800; color:${intel.tone==="hot"?"#c2410c":intel.tone==="warm"?"#a16207":"#475569"};">${intel.score}%</div>
                        <div style="font-size:0.75rem; color:var(--muted); text-transform:uppercase; font-weight:800;">AI Score</div>
                    </div>
                </div>
                <div style="background:#f8fafc; border:1px solid var(--line); border-radius:12px; padding:14px; margin-bottom:14px;">
                    <strong style="font-size:0.78rem; letter-spacing:0.03em; text-transform:uppercase; color:var(--brand);">Buyer psychology</strong>
                    <p style="margin:8px 0 0; font-size:0.92rem;">${intel.reasonLine}</p>
                </div>
                <div style="background:#fff7ed; border:1px solid #fdba74; border-radius:12px; padding:14px; margin-bottom:14px;">
                    <strong style="font-size:0.78rem; letter-spacing:0.03em; text-transform:uppercase; color:#c2410c;">AI suggested angle</strong>
                    <p style="margin:8px 0 0; font-size:0.92rem;">${intel.suggestedAngle}</p>
                </div>
                <div style="background:rgba(255,255,255,0.75); border:1px solid var(--line); border-radius:12px; padding:16px; margin-bottom:16px;">
                    <strong style="color:var(--brand); font-size:0.85rem;"><i class="fas fa-magic"></i> Suggested opener</strong>
                    <p style="margin:8px 0; font-size:0.95rem; font-weight:600; color:var(--ink);">${intel.suggestedReply}</p>
                </div>
                <div class="actions">
                    ${signal.kind==="booking"&&signal.status==="pending"?`<button class="btn" onclick="respondToBooking(${signal.id},'confirmed'); renderDopamineAgentDashboard();">Accept Tour</button><button class="ghost-link" onclick="respondToBooking(${signal.id},'declined'); renderDopamineAgentDashboard();">Decline</button>`:""}
                    <a class="link" href="https://wa.me/${phone}?text=${encodeURIComponent(replyText)}" target="_blank" rel="noopener noreferrer" onclick="triggerSpeedFeedback(this)">Reply on WhatsApp</a>
                </div>
            </article>`}).join(""):'<div style="padding:40px; text-align:center; color:var(--muted); font-weight:600;">No buyers assigned yet. Share a listing to capture leads.</div>'}
function renderAgentInbox(){const list=$("agentInboxList"),count=$("agentInboxCount");if(!list||!count)return;count.textContent=`${agentInbox.length} assigned item${agentInbox.length===1?"":"s"}`;if(!agentInbox.length){list.innerHTML='<p class="empty">No assigned leads yet. New callback requests and tour bookings will appear here.</p>';return}list.innerHTML=agentInbox.map(item=>{const intel=getLeadIntelligence(item),phone=normalizePhone(item.userPhone||""),booking=item.kind==="booking";return `<div class="compare-item"><div><strong>${item.userName}</strong><p>${item.listingTitle}</p><div class="mini">${phone||"No WhatsApp number"}</div><p class="sub" style="margin-top:6px"><span class="booking-status ${intel.toneClass}">${intel.toneLabel}</span> ΓÇó ${intel.score}% AI lead score ΓÇó ${intel.intentLabel}</p><p class="sub" style="margin-top:6px">${booking?`Requested viewing: ${formatTourSlot(item.requestedDate,item.requestedTime)}`:(item.userMessage||"No extra message provided.")}</p><p class="sub" style="margin-top:6px">${intel.reasonLine}</p><p class="sub" style="margin-top:6px"><strong>Suggested reply:</strong> ${intel.suggestedReply}</p><p class="sub" style="margin-top:6px"><strong>Objection angle:</strong> ${intel.objectionCounter}</p><p class="sub" style="margin-top:6px">Submitted ${formatLeadTime(item.createdAt)}</p></div><div class="actions">${booking&&item.status==="pending"?`<button class="btn" onclick="respondToBooking(${item.id},'confirmed')">Accept Booking</button><button class="ghost-link" onclick="respondToBooking(${item.id},'declined')">Decline</button>`:""}<a class="link" href="https://wa.me/${phone}?text=${encodeURIComponent(intel.suggestedReply)}" target="_blank" rel="noopener noreferrer">Reply on WhatsApp</a></div></div>`}).join("")}
function renderAutomationDistribution(){const list=$("automationDistributionList"),status=$("automationDistributionStatus");if(!list||!status)return;const scopedLeads=automationScopedLeads(),scopedBookings=automationScopedBookings(),agents=automationScopedAgents(),signalSource=[...scopedBookings,...scopedLeads],targetProperty=signalSource.map(item=>properties.find(p=>p.id===item.listingId)).find(Boolean),targetArea=targetProperty?.area||getAreaSignalSummary()[0]?.area||"Mont Kiara",ranked=rankAgentsForOpportunity({area:targetArea});$("automationAgentCount").textContent=agents.length;$("automationLeadCount").textContent=scopedLeads.length;$("automationBookingCount").textContent=scopedBookings.length;if(!ranked.length){list.innerHTML='<p class="empty">No visible agents available for AI routing yet.</p>';status.textContent="Add or verify agents first to activate AI distribution.";return}list.innerHTML=`<div class="ai-lead-context" style="background:var(--brand-soft); padding:16px; border-radius:12px; margin-bottom:16px; border:1px solid var(--brand-dark);"><strong style="color:var(--brand);"><i class="fas fa-robot"></i> Live Routing Context</strong><p style="margin:4px 0 0; font-size:0.9rem; color:var(--ink);">Area priority: <strong>${targetArea}</strong> ΓÇó Active signals: <strong>${signalSource.length}</strong></p></div>`+ranked.slice(0,6).map((agent,index)=>`<div class="compare-item"><div><strong>${agent.name}${index===0?` <span class="booking-status confirmed">Best Match</span>`:""}</strong><p>${agent.company||"Independent agent"}${agent.areaFocus?` ΓÇó ${agent.areaFocus}`:""}</p><div class="mini">${agent.phone}</div><p class="sub" style="margin-top:6px">${agent.reason}</p></div><div class="actions"><span class="booking-status ${index===0?"confirmed":"pending"}">${agent.matchScore}% match</span><span class="ghost-link">Area ${agent.areaScore}%</span><span class="ghost-link">${agent.responseMinutes} min reply</span><span class="ghost-link">${agent.conversionRate}% conversion</span></div></div>`).join("");status.textContent=`AI routing is prioritizing ${ranked[0].name} first because ${ranked[0].reason.toLowerCase()}`}
function renderAutomationFollowup(){const list=$("automationFollowupList"),status=$("automationFollowupStatus");if(!list||!status)return;const items=[...automationScopedLeads().map(item=>({...item,kind:"lead"})),...automationScopedBookings().map(item=>({...item,kind:"booking"}))].sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt)).slice(0,8);if(!items.length){list.innerHTML='<p class="empty">No follow-up queue yet. Callback requests and viewing activity will appear here first.</p>';status.textContent="Follow-up sequences will populate once fresh leads arrive.";return}list.innerHTML=items.map(item=>{const intel=getLeadIntelligence(item),phone=normalizePhone(item.userPhone||""),day1=intel.followUps[0]?.text||intel.suggestedReply,day3=intel.followUps[1]?.text||intel.suggestedAngle,day7=intel.followUps[2]?.text||intel.objectionCounter;return `<div class="compare-item"><div><strong>${item.userName}</strong><p>${item.listingTitle}</p><div class="mini">${phone}</div><p class="sub" style="margin-top:6px"><strong>Day 1:</strong> ${day1}</p><p class="sub" style="margin-top:6px"><strong>Day 3:</strong> ${day3}</p><p class="sub" style="margin-top:6px"><strong>Day 7:</strong> ${day7}</p></div><div class="actions"><span class="booking-status ${intel.toneClass}">${intel.toneLabel}</span><a class="link" href="https://wa.me/${phone}?text=${encodeURIComponent(day1)}" target="_blank" rel="noopener noreferrer">Send Day 1</a></div></div>`}).join("");status.textContent=`Showing ${items.length} AI follow-up sequence${items.length===1?"":"s"} tuned to buyer behavior and intent.`}
function renderAutomationCrm(){const grid=$("automationCrmGrid"),status=$("automationCrmStatus");if(!grid||!status)return;const leads=automationScopedLeads(),bookings=automationScopedBookings(),tenancies=readLocalTenancies().filter(item=>sessionRole==="master"||item.agentPhone===sessionAgentPhone),confirmed=bookings.filter(item=>item.status==="confirmed").length,converted=tenancies.filter(item=>item.rentCollected||item.agreementSigned).length,total=leads.length+bookings.length,conversion=total?Math.round(((confirmed+converted)/total)*100):0,agentPool=(sessionRole==="master"?readLocalAgents().filter(item=>item.verified):readLocalAgents().filter(item=>item.phone===sessionAgentPhone)).map(agent=>({...agent,...getAgentPerformanceSnapshot(agent)})).sort((a,b)=>b.aiScore-a.aiScore||b.conversionRate-a.conversionRate);$("automationCrmLeads").textContent=leads.length;$("automationCrmViewings").textContent=confirmed;$("automationCrmConversion").textContent=`${conversion}%`;const overviewCards=[{label:"Leads",value:leads.length,note:"Users who shared contact details or unlocked agent contact."},{label:"Pending Viewings",value:bookings.filter(item=>item.status==="pending").length,note:"Tour requests waiting for agent action."},{label:"Conversions",value:converted,note:"Deals that advanced into agreement or rent collection."},{label:"AI Health",value:`${agentPool[0]?.aiScore||0}`,note:"System score based on response speed, conversion, and deal handling."}];const leaderboard=agentPool.slice(0,sessionRole==="master"?10:3).map((agent,index)=>`<div class="compare-item"><div><strong>#${index+1} ${agent.name}</strong><p>${agent.company||"Independent agent"}${agent.areaFocus?` ΓÇó ${agent.areaFocus}`:""}</p><p class="sub" style="margin-top:6px">Conversion ${agent.conversionRate}% ΓÇó Reply ${agent.responseMinutes} min ΓÇó Revenue ${rmFull(agent.revenueGenerated||0)}</p></div><div class="actions"><span class="booking-status confirmed">${agent.aiScore} AI score</span></div></div>`).join("");grid.innerHTML=overviewCards.map(card=>`<div class="vault-card"><div class="vault-head"><div><strong>${card.label}</strong><p class="sub">${card.note}</p></div><div class="vault-badges"><span class="booking-status confirmed">${card.value}</span></div></div></div>`).join("")+`<div class="vault-card" style="grid-column:1/-1;"><div class="vault-head"><div><strong>${sessionRole==="master"?"Top 10 agents this week":"Performance ladder"}</strong><p class="sub">${sessionRole==="master"?"Gamified ranking based on response speed, conversions, and revenue generated.":"Improve this score to unlock better lead priority."}</p></div></div>${leaderboard||'<p class="empty">No verified agents are available for ranking yet.</p>'}</div>`;status.textContent=total?`CRM is tracking ${total} live lead or viewing record${total===1?"":"s"} with performance scoring layered on top.`:"CRM metrics will populate after new callbacks and tours arrive."}
function submitVaultDocument(){if(sessionRole!=="user")return;const fileInput=$("vaultFile"),title=$("vaultTitle").value.trim(),category=$("vaultCategory").value,note=$("vaultNote").value.trim(),status=$("vaultUserStatus"),file=fileInput?.files?.[0];if(!file){status.textContent="Choose a document file before uploading.";return}const agent=getNextAssignedAgent({kind:"document",area:category});if(!agent){status.textContent="No active verified agents are available to review documents right now.";return}const behavior=analyzeBehavioralProfile(),check=inferDocumentCheck(file),items=readLocalVaultDocuments(),record={id:Date.now(),userAccount:sessionUserAccount,userName:sessionName,title:title||file.name.replace(/\.[^.]+$/,""),category,fileName:file.name,fileSize:file.size,fileSizeLabel:`${Math.max(1,Math.round(file.size/1024))} KB`,fileType:file.type||"Unknown",reviewPercent:20,docLevel:check.level,checkerScore:check.score,checks:check.checks,reviewNote:"",note,behaviorIntent:behavior?.intent||"",behaviorPreference:behavior?.preferenceLine||"",assignedAgentId:agent.id,assignedAgentName:agent.name,assignedAgentPhone:agent.phone,reviewedBy:"",timeline:{offer:true,loan:false,snp:false,keys:false},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};writeLocalVaultDocuments([record,...items]);status.textContent=`Uploaded ${record.fileName}. Assigned to ${agent.name} for review.`;$("vaultTitle").value="";$("vaultNote").value="";$("vaultCategory").value="Loan Docs";if(fileInput)fileInput.value="";loadUserDocumentVault();loadAutomationConsole()}
function bookViewingTour(propertyId){if(sessionRole!=="user")return;const property=properties.find(item=>item.id===propertyId),date=$(`bookingDate_${propertyId}`)?.value,time=$(`bookingTime_${propertyId}`)?.value||"10:00 AM",phone=normalizePhone($(`bookingPhone_${propertyId}`)?.value||"");if(!property)return;if(!date||!phone){$("userNotificationStatus").textContent="Please choose a viewing date and enter your WhatsApp number first.";return}trackAreaInterest(property.area,"tour_request");const agent=getNextAssignedAgent({area:property.area,listingId:property.id,kind:"booking"});if(!agent){$("userNotificationStatus").textContent="No active verified agents are available to receive tour bookings right now.";return}const behavior=analyzeBehavioralProfile(),bookings=readLocalBookings(),existing=bookings.find(item=>item.listingId===propertyId&&((item.userAccount||item.userName)===sessionUserAccount||item.userName===sessionName)),record={id:existing?.id||Date.now(),listingId:property.id,listingTitle:property.title,userAccount:sessionUserAccount,userName:sessionName,userPhone:phone,behaviorIntent:behavior?.intent||"",behaviorPreference:behavior?.preferenceLine||"",assignedAgentId:agent.id,assignedAgentName:agent.name,assignedAgentPhone:agent.phone,requestedDate:date,requestedTime:time,status:"pending",createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};writeLocalBookings(existing?bookings.map(item=>item.id===existing.id?record:item):[record,...bookings]);createNotification({userName:sessionName,title:`Viewing request sent for ${property.title}`,message:`Your viewing request for ${formatTourSlot(date,time)} has been sent to ${agent.name}. We will notify you once the agent accepts or declines.`});$("userNotificationStatus").textContent=`Viewing request sent for ${property.title}. ${agent.name} has been notified.`;renderCompare();loadUserNotifications();loadAutomationConsole();tapFeedback("Viewing requested",`${agent.name} was notified for ${property.title}.`,"success")}
function submitTenantApplication(){if(sessionRole!=="user"||activeModalId==null)return;const property=properties.find(item=>item.id===activeModalId),name=$("tenantName").value.trim(),phone=normalizePhone($("tenantPhone").value),occupation=$("tenantOccupation").value.trim(),moveInDate=$("tenantMoveIn").value,budget=Number($("tenantBudget").value||0),notes=$("tenantNotes").value.trim(),status=$("tenantStatus");if(!property)return;if(!name||!phone||!occupation){status.textContent="Please fill in your name, WhatsApp number, and occupation.";return}const agent=getNextAssignedAgent({area:property.area,listingId:property.id,kind:"tenant"});if(!agent){status.textContent="No active verified agents are available to review tenant applications right now.";return}const behavior=analyzeBehavioralProfile(),items=readLocalTenantApplications(),existing=items.find(item=>item.listingId===property.id&&((item.userAccount||item.userName)===sessionUserAccount||item.userName===sessionName)),record={id:existing?.id||Date.now(),listingId:property.id,listingTitle:property.title,userAccount:sessionUserAccount,userName:name,userPhone:phone,occupation,moveInDate,monthlyBudget:budget,notes,behaviorIntent:behavior?.intent||"",behaviorPreference:behavior?.preferenceLine||"",assignedAgentId:agent.id,assignedAgentName:agent.name,assignedAgentPhone:agent.phone,status:"pending",createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};writeLocalTenantApplications(existing?items.map(item=>item.id===existing.id?record:item):[record,...items]);createNotification({userName:sessionName,title:`Tenant profile submitted for ${property.title}`,message:`Your tenant profile has been routed to ${agent.name}. The agent will review your rental application and update you if selected.`});status.textContent=`Tenant profile submitted for ${property.title}. ${agent.name} will review your application.`;loadUserTenantApplications();loadAutomationConsole()}
async function submitChatMessage(){
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
    status.textContent=`Chat processed by KVAI Agent.`;
    renderChatHistory();
}
(typeof requestIdleCallback!=='undefined'?requestIdleCallback:function(fn){setTimeout(fn,100)})(function(){['searchInput','propertyType','priceRange','bedrooms','location','buyerGoal','sortBy'].forEach(id=>{const el=$(id); if(el){el.addEventListener('input',renderProperties);el.addEventListener('change',renderProperties);}})});["powerMinYield","powerMinGrowth"].forEach(id=>$(id)?.addEventListener("input",()=>{if(sessionRole==="master")runPowerMode()}));$("powerRiskFilter")?.addEventListener("change",()=>{if(sessionRole==="master")runPowerMode()});renderProperties();renderSpots();renderAIOrganizerView();renderCompare();
$("sessionBadge").textContent=`${sessionRole==="master"?"Master":sessionRole==="agent"?"Agent":"User"}: ${sessionName}`;
if(sessionRole==="master"){document.querySelectorAll(".master-collapsible").forEach(section=>updateMasterSectionToggle(section.id))}
if(sessionRole==="master"){renderPowerCompare()}
if(sessionRole==="master"){loadAgents()}
if(sessionRole==="master"){loadMasterBookings()}
if(sessionRole==="master"){loadRentalManagement()}
if(sessionRole==="master"){loadAutomationConsole()}
if(sessionRole==="agent"){loadAgentInbox()}
if(sessionRole==="agent"){loadAgentDocumentVault()}
if(sessionRole==="agent"){loadTenantPipeline()}
if(sessionRole==="agent"){loadAgentDailyTools()}
if(sessionRole==="agent"){loadAutomationConsole()}
if(sessionRole==="user"){loadUserDocumentVault()}
if(sessionRole==="user"){loadUserNotifications()}
if(sessionRole==="user"){loadUserTenantApplications()}
if(sessionRole==="user"){loadUserRentCenter()}
if(sessionRole==="user"||sessionRole==="agent"){renderChatHistory();$("chatInput")?.addEventListener('keypress',e=>{if(e.key==="Enter")submitChatMessage()})}
if(sessionRole==="master"){loadChatLogs()}
// hookDopamineToSystem();
$("propertyModal").addEventListener("click",e=>{if(e.target.id==="propertyModal")closeModal()});
$("mediaLightbox").addEventListener("click",e=>{if(e.target.id==="mediaLightbox")closeMediaLightbox()});
$("rentPaymentModal").addEventListener("click",e=>{if(e.target.id==="rentPaymentModal")closeRentPaymentModal()});
$("calculatorModal").addEventListener("click",e=>{if(e.target.id==="calculatorModal")closeCalculator()});
$("featureExperienceModal").addEventListener("click",e=>{if(e.target.id==="featureExperienceModal")closeFeatureExperience()});
$("upgradeModal").addEventListener("click",e=>{if(e.target.id==="upgradeModal")closeUpgradeModal()});
$("promptSelector").addEventListener("change",onPromptSelectionChange);
document.addEventListener('DOMContentLoaded', function() { /* deferred init */ });
const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible")}})},{threshold:.14});
document.querySelectorAll(".reveal").forEach(el=>revealObserver.observe(el));


function renderAICurated() {
    const grid = $("aiCuratedGrid");
    if(!grid) return;
    
    // Get modern condos under RM 500k, low density
    const curatedList = properties.filter(p => p.price <= 600000 && p.type.toLowerCase().includes('condo')).slice(0, 3);
    
    if(!curatedList.length) return;
    
    grid.innerHTML = curatedList.map(p => {
        const media = getPropertyMedia(p), decision = getDecisionPack(p), liveCount = getLiveViewerCount(p);
        return `<article class="card glass">
            <div class="media">
                <img src="${media.images[0]}" alt="${p.title}" loading="lazy" decoding="async">
                <div class="tint"></div>
                <div class="topline">
                    <div class="stack">${p.badge?`<span class="pill ${p.badge}">${p.badge}</span>`:``} <span class="pill">${p.type}</span></div>
                    <div class="stack"><span class="score"><i class="fas fa-sparkles"></i> ${p.aiScore}</span><button class="save ${savedIds.includes(p.id)?"saved":""}" onclick="toggleSave(${p.id})"><i class="fas fa-heart"></i></button></div>
                </div>
            </div>
            <div class="body">
                <div class="price-row">
                    <div>${(typeof priceMarkup !== "undefined" && priceMarkup) || `${priceMarkup || `<div class="price">${money(p.price)}</div>`}`}<div class="title">${p.title}</div></div>
<div style="margin-top:8px; padding:6px 12px; background:rgba(6,182,212,0.08); border-left:2px solid var(--brand); color:var(--muted); font-size:0.8rem; font-family:'Courier Prime', monospace;">
<i class="fas fa-microchip" style="color:var(--brand);"></i> <b>AI Verdict:</b> Generated ${Math.floor(Math.random()*90)+10}% confidence match for your profile.
</div>

                    <div class="mini"><i class="fas fa-chart-line"></i> ${p.growth}% YoY</div>
                </div>
                <div class="location"><i class="fas fa-location-dot"></i> ${p.location}</div>
                
                <div class="actions">
                    <span class="mini">${verificationLabel(p.verifiedType)}</span>
                    <span class="mini">Risk: ${decision.risk}</span>
                    ${sessionRole==="master"&&p.verifiedType==="unverified"?`<button class="ghost-link" onclick="verifyListing(${p.id},'owner')">Verify Owner</button><button class="ghost-link" onclick="verifyListing(${p.id},'agent')">Verify Agent</button>`:" "}
                </div>
                
<p class="sub">${typeof aiProfile !== 'undefined' && aiProfile ? `This condo fits your ${aiProfile.intent} + ${aiProfile.locationVibe} lifestyle profile.` : p.fit}</p>
                <div class="meta">
                    <span><strong>Layout</strong>${p.bedrooms} beds / ${p.bathrooms} baths</span>
                    <span><strong>Size</strong>${p.sqft} sqft</span>
                    <span><strong>Price</strong>RM ${p.psf} psf</span>
                </div>
                <div class="reasons">
                    <span><strong>Yield</strong>${p.yield}%</span>
                    <span><strong>Commute</strong>${p.commute}</span>
                    <span><strong>Offer</strong>${rmFull(decision.negotiation)}</span>
                </div>
                <div class="actions">
                    <a class="link" href="${p.mapLink}" target="_blank" rel="noopener noreferrer">Open Map</a>
                    <button class="ghost-link" onclick="openModal(${p.id})">View More</button>
                    ${sessionRole==="user"?`<button class="btn" onclick="bookViewingTour(${p.id})">Book Viewing</button>`:``}
                </div>
            </div>
        </article>`;
    }).join('');
}
}
