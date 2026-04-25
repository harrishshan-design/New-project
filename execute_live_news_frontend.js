const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// 1. REWRITE renderSpots as an async function that fetches our new LIVE News endpoint
const oldSpotsRegex = /function renderSpots\(\)\{[\s\S]*?spotlightGrid"\)\.innerHTML=hotspots\.map[\s\S]*?join\(""\)\}/;
const newSpotsFunction = `async function renderSpots(){
    const grid = $("spotlightGrid");
    if(!grid) return;
    grid.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);width:100%"><i class="fas fa-circle-notch fa-spin"></i> Compiling live property news...</div>';
    
    try {
        const res = await fetch('http://localhost:3000/api/hotspots');
        const news = await res.json();
        
        if(news.error || !news.length) {
            grid.innerHTML = hotspots.map(h=>\`<article class="spot glass"><div class="mini">\${h.growth}</div><h3>\${h.name}</h3><p>\${h.summary}</p><div class="spot-stats reasons">\${h.stats.map(s=>\`<span><strong>Signal</strong>\${s}</span>\`).join("")}</div></article>\`).join("");
            return;
        }
        
        let outHtml = "";
        news.forEach((item, index) => {
            let label = index === 0 ? "🔥 HOT" : "LIVE";
            let dateStr = new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            outHtml += \`<article class="spot glass" style="cursor:pointer;" onclick="window.open('\${item.link}', '_blank')">
                <div class="mini" style="color:var(--brand); font-weight:700;">\${label}</div>
                <h3 style="font-size:clamp(1rem, 1.2vw, 1.2rem); line-height:1.4;">\${item.title}</h3>
                <p style="margin-top:auto;" class="mini"><i class="far fa-clock"></i> Updated today at \${dateStr}</p>
            </article>\`;
        });
        
        grid.innerHTML = outHtml;
    } catch(e) {
        console.error(e);
        // Fallback to static
        grid.innerHTML = hotspots.map(h=>\`<article class="spot glass"><div class="mini">\${h.growth}</div><h3>\${h.name}</h3><p>\${h.summary}</p><div class="spot-stats reasons">\${h.stats.map(s=>\`<span><strong>Signal</strong>\${s}</span>\`).join("")}</div></article>\`).join("");
    }
}`;

html = html.replace(oldSpotsRegex, newSpotsFunction);

// 2. ENHANCE TYPOGRAPHY IN CARDS (Readable, Bold, High Contrast)
const typographyCSS = `
/* Energetic Typography and Card Upgrades */
.card .title { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: #111; letter-spacing:-0.01em; margin-bottom: 4px; line-height: 1.2; }
.card .price { font-size: 1.5rem; font-weight: 800; color: var(--brand); letter-spacing:-0.03em; margin-bottom: 2px; }
.card .location { font-size: 0.9rem; color: #554; font-weight: 500; }
.card .mini { font-weight: 600; color:#443; }

/* Lively Chips & Tags */
.chip, .tag {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.chip:hover, .tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(187, 77, 45, 0.15); /* Brand tint */
    border-color: var(--brand);
    color: var(--brand);
}
`;

if(!html.includes('Energetic Typography')) {
    html = html.replace('</style>', typographyCSS + '\n</style>');
}

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log("Rewired frontend Hotspots & lively chips!");
