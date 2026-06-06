const fs = require('fs');
let content = fs.readFileSync('dashboard.html', 'utf8');

// 1. Inject trackAIView function and behavioral logic
const trackingLogic = `
function trackAIView(id) {
    let views = JSON.parse(localStorage.getItem('ai_user_views') || '[]');
    if(!views.includes(id)) {
        views.push(id);
        localStorage.setItem('ai_user_views', JSON.stringify(views));
        if(typeof renderAIOrganizerView === "function") renderAIOrganizerView();
    }
}

function analyzeBehavioralProfile() {
    let views = JSON.parse(localStorage.getItem('ai_user_views') || '[]');
    let allInt = [...new Set([...(typeof savedIds !== "undefined" ? savedIds : []), ...views])];

    if(allInt.length === 0) return null;

    let totalVal = 0, locCounts = {}, topLoc = "", topLocCount = 0;
    
    allInt.forEach(id => {
        let p = properties.find(x => x.id === id);
        if(p) {
            totalVal += p.price;
            let l = p.location || p.area || "City Region";
            locCounts[l] = (locCounts[l] || 0) + 1;
            if(locCounts[l] > topLocCount) { topLocCount = locCounts[l]; topLoc = l; }
        }
    });

    let avgPrice = totalVal / allInt.length;
    let roundedPrice = Math.round(avgPrice / 100000) * 100000;
    let labelPrice = roundedPrice >= 1000000 ? (roundedPrice/1000000).toFixed(1) + "M" : (roundedPrice/1000) + "K";
    
    return {
        count: allInt.length,
        avgBudget: "RM " + labelPrice,
        topLocation: topLoc
    };
}
`;

if(!content.includes('function trackAIView')) {
    content = content.replace('</script>', trackingLogic + '\\n</script>');
}

// 2. Hook openModal
const openModalRegex = /function openModal\\(id\\)\\{/g;
if(!content.includes('trackAIView(id);')) {
    content = content.replace(openModalRegex, 'function openModal(id){if(typeof trackAIView==="function")trackAIView(id);');
}

// 3. Rewrite renderAIOrganizerView to incorporate both!
const oldRenderFunc = /function renderAIOrganizerView\\(\\) \\{[\\s\\S]*?\\n\\}/g;

const newRenderFunc = `function renderAIOrganizerView() {
    const header = $("aiCuratedHeader");
    if(!header) return;
    
    let behave = analyzeBehavioralProfile();
    
    if(!aiProfile && !behave) {
        header.innerHTML = '<span style="font-weight:700; color:var(--brand-dark); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;">Your AI Match 🎯</span>' +
            '<h3 style="margin:8px 0; font-family:\\'Space Grotesk\\', sans-serif; font-size: 1.4rem;">Unlock your perfect feed</h3>' +
            '<p style="margin:0; font-weight:500; font-size:1.1rem; color: var(--ink); line-height: 1.5;">Let the AI build your real estate profile. Tell us what you want in just 5 clicks.</p>' +
            '<button class="btn" style="margin-top: 14px;" onclick="openAIQuiz()">Build My Profile <i class="fas fa-arrow-right"></i></button>';
        $("aiCuratedGrid").innerHTML = "";
    } else {
        let profileHtml = '';
        if(aiProfile) {
            profileHtml += '<div style="margin-bottom:12px; padding-bottom:12px; border-bottom: 1px solid rgba(0,0,0,0.05);">' +
                '<p style="margin:0; font-weight:500; font-size:1.1rem; color: var(--ink); line-height: 1.5;"><strong>Declared Taste:</strong> You prefer <strong style="color:var(--brand);">' + aiProfile.budget + '</strong> properties near a <strong style="color:var(--teal);">' + aiProfile.locationVibe + '</strong> with <strong style="color:var(--gold);">' + aiProfile.priority + '</strong>.</p>' +
                '</div>';
        }
        
        if(behave) {
            profileHtml += '<div>' +
                '<p style="margin:0; font-weight:500; font-size:1.1rem; color: var(--ink); line-height: 1.5;"><strong>Observed Taste:</strong> Based on the ' + behave.count + ' homes you viewed/saved, you actually look mostly at <strong style="color:var(--brand);">' + behave.avgBudget + '</strong> properties in <strong style="color:var(--teal);">' + behave.topLocation + '</strong>.</p>' +
                '</div>';
        }

        header.innerHTML = '<span style="font-weight:700; color:var(--brand-dark); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;"><i class="fas fa-radar"></i> AI Analysis Flow 🎯</span>' +
            '<h3 style="margin:8px 0; font-family:\\'Space Grotesk\\', sans-serif; font-size: 1.4rem;">Your Hybrid Profile</h3>' +
            profileHtml +
            '<p style="margin:8px 0 0; color: var(--muted); font-size: 0.95rem;">I\\'ve curated these exact matches based on this hybrid analysis.</p>' +
            (!aiProfile ? '<button class="chip" style="margin-top: 12px; background: transparent; border: 1px solid var(--line); color: var(--muted);" onclick="openAIQuiz()">Take Accuracy Quiz</button>' : '<button class="chip" style="margin-top: 12px; background: transparent; border: 1px solid var(--line); color: var(--muted);" onclick="openAIQuiz()">Retake Quiz</button>');
        
        if(typeof renderAICurated === "function") renderAICurated();
    }
}`;

// Because of how oldRenderFunc was created by earlier injections, it's safer to use split/join tricks to remove it.
// Let's find exactly where function renderAIOrganizerView() starts, and where it ends.
const beginIdx = content.indexOf('function renderAIOrganizerView() {');
if (beginIdx !== -1) {
    let scriptEndIdx = content.indexOf('</script>', beginIdx);
    
    // In our last injection, it was literally the last function before </script>
    if(scriptEndIdx !== -1) {
        let beforeContent = content.slice(0, beginIdx);
        let afterContent = content.slice(scriptEndIdx);
        content = beforeContent + newRenderFunc + '\\n' + afterContent;
    }
}

fs.writeFileSync('dashboard.html', content, 'utf8');
console.log('Behavior analysis successfully integrated.');
