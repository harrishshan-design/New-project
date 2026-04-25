const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Restore Grid class for propertiesGrid
const sidePanelRegex = /const list=filtered\(\),grid=\$\("propertiesGrid"\); if\(sessionRole==="user"\)\{grid\.className="feed-layout";\}/;
content = content.replace(sidePanelRegex, 'const list=filtered(),grid=$("propertiesGrid");');

// 2. Revert renderProperties card loop
const cardMapRegex = /grid\.innerHTML=list\.map\(p=>\{[\s\S]*?\}\)\.join\(""\);/;

const classicRender = `grid.innerHTML=list.map(p=>{
    const media=getPropertyMedia(p),decision=getDecisionPack(p),liveCount=getLiveViewerCount(p);
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
                \${sessionRole==="master"&&p.verifiedType==="unverified"?\`<button class="ghost-link" onclick="verifyListing(\${p.id},'owner')">Verify Owner</button><button class="ghost-link" onclick="verifyListing(\${p.id},'agent')">Verify Agent</button>\`:""}
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
                <button class="ghost-link" onclick="focusMatch(\${p.id})">Why this match?</button>
            </div>
        </div>
    </article>\`;
}).join("");`;

content = content.replace(cardMapRegex, classicRender);

// 3. Revert toggleSave
const toggleSaveRefRegex = /function toggleSave\(id, btn\)\{[\s\S]*?\}\nconst added=!savedIds\.includes\(id\)/;
content = content.replace(toggleSaveRefRegex, 'function toggleSave(id){\nconst added=!savedIds.includes(id)');


// 4. Revert "💭 Your Future Homes" back to "Saved properties"
content = content.replace(/<h2>💭 Your Future Homes<\/h2><p>Houses you've loved\. Refine your vision by adding mood notes\.<\/p>/g, '<h2>Saved properties</h2>');


// 5. Revert renderCompare to strip the future moods tags
const moodTagsRegex = /\$\{sessionRole === "user" \? `<div class="future-moods">[\s\S]*?<\/textarea>` : ""\}/;
content = content.replace(moodTagsRegex, '');


// 6. Delete the FOMO script at the end
const scriptEndMatch = `// PSYCHOLOGICAL WARFARE NOTIFICATIONS`;
let blockStartIdx = content.indexOf(scriptEndMatch);
if (blockStartIdx !== -1) {
    let scriptEndRegex = /<\/script>/;
    let endIdx = content.indexOf('</script>', blockStartIdx);
    if(endIdx !== -1) {
        content = content.substring(0, blockStartIdx) + content.substring(endIdx);
    }
}


// 7. Strip out ONLY the feed CSS, leaving gamification
const feedStylesStart = content.indexOf('/* THE FEED */');
const feedStylesEnd = content.indexOf('/* AI PERSONALITY BANNER */');
if (feedStylesStart !== -1 && feedStylesEnd !== -1) {
    content = content.substring(0, feedStylesStart) + content.substring(feedStylesEnd);
}

// Strip STICKY NOTIFICATION
const stickyFomoStart = content.indexOf('/* STICKY NOTIFICATION */');
const stickyFomoEnd = content.indexOf('</style>', stickyFomoStart);
if (stickyFomoStart !== -1 && stickyFomoEnd !== -1) {
    content = content.substring(0, stickyFomoStart) + content.substring(stickyFomoEnd);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully reverted feed but kept Gamification & Recommendations!');
