

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
            response = `<strong>Data-backed Investment Analysis 📊</strong><br>
            Based on live market data for <strong>${activeProp.location}</strong>:<br><br>
            • <strong>Estimated ROI (Annual):</strong> ${activeProp.growth + activeProp.yield}%<br>
            • <strong>Rental Yield:</strong> <strong style="color:var(--brand);">${activeProp.yield}%</strong><br>
            • <strong>Nearby Developments:</strong> Upcoming transit lines and high-density commercial hubs are aggressively pushing capital appreciation up by ${activeProp.growth}% YOY.<br><br>
            <strong>Verdict:</strong> This is a high-demand, high-yield asset class moving fast.<br><br>
            <button class="btn" style="width:100%; margin-top:8px;" onclick="contactAgent()">Want me to connect you to an agent now? <i class="fas fa-bolt"></i></button>`;
        } else if(lower.includes("afford")) {
            response = "<strong>Let's check your budget! 🏦</strong><br>For a lovely RM 500k home, you'll generally want a combined net income around RM 4,500/month (assuming you don't have too many other loans). It's totally doable! Would you like me to open the calculator so we can crunch the exact numbers together? 💕";
        } else if(lower.includes("area") || lower.includes("good")) {
            response = "<strong>Great question! 🌟</strong><br>Areas like Mont Kiara and Bukit Jalil are super popular right now! They're growing at about 6.5% a year thanks to amazing new transit spots. They are perfect places to nest, and if you ever want to sell later, plenty of people will want to buy! Do you have a favorite spot in mind? 🏡";
        } else if(lower.includes("compare")) {
            if(savedIds.length > 0) {
                response = `<strong>Let's compare! ✨</strong><br>I see you've saved ${savedIds.length} wonderful homes! Most of these have a great yield profile over 4.5%, meaning they make fantastic investments alongside being great places to live. I think you've got amazing taste! 🥰`;
            } else {
                response = "Oh! 🙈 It looks like you haven't saved any 'Future Homes' just yet! Try tapping the heart icon on a few properties you love, and I'll jump right in to help you compare them! ❤️";
            }
        } else {
            response = "Ooh, that's such a great thought! 🌸 Since I have all the latest numbers for KV right here, I can help you check prices, growth, or area vibes instantly. What else are you wondering about? 😊";
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
