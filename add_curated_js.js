const fs = require('fs');

let content = fs.readFileSync('dashboard.html', 'utf8');

const logicBlock = `
function renderAICurated() {
    const grid = $("aiCuratedGrid");
    if(!grid) return;
    
    // Get modern condos under RM 500k, low density
    const curatedList = properties.filter(p => p.price <= 600000 && p.type.toLowerCase().includes('condo')).slice(0, 3);
    
    if(!curatedList.length) return;
    
    grid.innerHTML = curatedList.map(p => {
        const media = getPropertyMedia(p), decision = getDecisionPack(p), liveCount = getLiveViewerCount(p);
        return \`<article class="card glass">
            <div class="media">
                <img src="\${media.images[0]}" alt="\${p.title}" loading="lazy" decoding="async">
                <div class="tint"></div>
                <div class="topline">
                    <div class="stack">\${p.badge?\`<span class="pill \${p.badge}">\${p.badge}</span>\`:\`\`} <span class="pill">\${p.type}</span></div>
                    <div class="stack"><span class="score"><i class="fas fa-sparkles"></i> \${p.aiScore}</span><button class="save \${savedIds.includes(p.id)?"saved":""}" onclick="toggleSave(\${p.id})"><i class="fas fa-heart"></i></button></div>
                </div>
            </div>
            <div class="body">
                <div class="price-row">
                    <div><div class="price">\${money(p.price)}</div><div class="title">\${p.title}</div></div>
                    <div class="mini"><i class="fas fa-chart-line"></i> \${p.growth}% YoY</div>
                </div>
                <div class="location"><i class="fas fa-location-dot"></i> \${p.location}</div>
                <div class="live-signal-row">
                    <span class="live-pill">🔥 \${liveCount} viewing now</span>
                    <span class="live-pill">\${getReplySignal(p)}</span>
                </div>
                <div class="actions">
                    <span class="mini">\${verificationLabel(p.verifiedType)}</span>
                    <span class="mini">Risk: \${decision.risk}</span>
                    \${sessionRole==="master"&&p.verifiedType==="unverified"?\`<button class="ghost-link" onclick="verifyListing(\${p.id},'owner')">Verify Owner</button><button class="ghost-link" onclick="verifyListing(\${p.id},'agent')">Verify Agent</button>\`:" "}
                </div>
                <p class="sub">\${p.fit}</p>
                <div class="meta">
                    <span><strong>Layout</strong>\${p.bedrooms} beds / \${p.bathrooms} baths</span>
                    <span><strong>Size</strong>\${p.sqft} sqft</span>
                    <span><strong>Price</strong>RM \${p.psf} psf</span>
                </div>
                <div class="reasons">
                    <span><strong>Yield</strong>\${p.yield}%</span>
                    <span><strong>Commute</strong>\${p.commute}</span>
                    <span><strong>Offer</strong>\${rmFull(decision.negotiation)}</span>
                </div>
                <div class="actions">
                    <a class="link" href="\${p.mapLink}" target="_blank" rel="noopener noreferrer">Open Map</a>
                    <button class="ghost-link" onclick="openModal(\${p.id})">View More</button>
                    \${sessionRole==="user"?\`<button class="btn" onclick="bookViewingTour(\${p.id})">Book Viewing</button>\`:\`\`}
                </div>
            </div>
        </article>\`;
    }).join('');
}
`;

// Insert the logic before the last </script>
const lastScriptPos = content.lastIndexOf('</script>');
content = content.slice(0, lastScriptPos) + logicBlock + '\\n</script>' + content.slice(lastScriptPos + 9);

// Add the call to renderAICurated() where renderProperties() is called
content = content.replace('renderProperties();renderSpots();', 'renderProperties();renderSpots();renderAICurated();');

fs.writeFileSync('dashboard.html', content, 'utf8');
console.log('AI Curated rendering logic successfully injected!');
