const fs = require('fs');

let html = fs.readFileSync('dashboard.html', 'utf8');

const oldRunRegex = /function runOnboarding\(\)\{[\s\S]*?scrollToSection\("discover"\)\}/;

const newRunOnboarding = `async function runOnboarding(){
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
            status.textContent = \`Agent Fallback: We found \${count} local matches. Setup OPENAI_API_KEY for generative AI rankings!\`;
            scrollToSection("discover");
            return;
        }

        // Successfully ranked
        let curatedProps = rankedArray.map(rank => {
            let p = properties.find(x => x.id === rank.id);
            if(p) return {...p, aiExplanation: rank.explanation};
            return null;
        }).filter(Boolean);

        document.getElementById("aiCuratedHeader").innerHTML = '<span style="font-weight:700; color:var(--brand); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;">Your Generative Match 🎯</span><h3 style="margin:8px 0; font-family:\\'Outfit\\', sans-serif; font-size: 1.4rem;">Top 3 Curated Properties</h3><p style="margin:0; font-weight:500; font-size:1.1rem; color: var(--ink); line-height: 1.5;">Our Generative AI has analyzed the database architecture and generated these absolute best fits based on your unique profile.</p>';
        
        document.getElementById("aiCuratedGrid").innerHTML = curatedProps.map(p => {
             const media=getPropertyMedia(p), decision=getDecisionPack(p);
             return \`<article class="card glass" style="border: 2px solid var(--brand); transform: scale(1.02); z-index:2; box-shadow: 0 12px 40px rgba(187,77,45,0.15);">
                <div class="media" style="height:220px;"><img src="\${media.images[0]}" loading="lazy">
                <div class="tint"></div>
                <div class="topline">
                    <div class="stack">\${p.badge?\`<span class="pill \${p.badge}">\${p.badge}</span>\`:\`\`} <span class="pill">\${p.type}</span></div>
                    <div class="stack"><span class="score"><i class="fas fa-bolt"></i> OpenAI Ranked #\${curatedProps.indexOf(p)+1}</span></div>
                </div></div>
                <div class="body">
                    <div class="price-row">
                        <div><div class="price">\${money(p.price)}</div><div class="title" style="font-family:'Outfit', sans-serif; font-size:1.2rem; font-weight:700;">\${p.title}</div></div>
                        <div class="mini"><i class="fas fa-chart-line"></i> \${p.growth}% YoY</div>
                    </div>
                    
                    <div style="margin: 16px 0; padding: 14px; background: rgba(187,77,45,0.06); border-radius: 12px; border-left: 3px solid var(--brand);">
                        <strong style="color:var(--brand-dark); font-size:0.8rem; letter-spacing:0.02em; text-transform:uppercase;"><i class="fas fa-microchip"></i> Agent Reasoning</strong>
                        <p style="margin: 6px 0 0 0; font-size: 0.95rem; line-height:1.45; color:#332;">\${p.aiExplanation}</p>
                    </div>

                    <div class="actions">
                        <span class="mini">Yield: \${p.yield}%</span>
                        <span class="mini">Risk: \${decision.risk}</span>
                    </div>
                    <div class="actions" style="margin-top:12px;">
                        <button class="btn" style="width:100%" onclick="openModal(\${p.id})">Analyze Match</button>
                    </div>
                </div>
             </article>\`;
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
}`;

html = html.replace(oldRunRegex, newRunOnboarding);

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Frontend OpenAI hooks established.');
