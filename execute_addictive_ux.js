const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject Gamification CSS and Feed Styles
const styleRegex = /<\/style>/;
const newStyles = `
/* FOMO & ADDICTION LOOPS */
.gamification-bar { background: var(--ink); color: #fff; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); animation: slideDown 0.5s ease; }
.progress-track { flex-grow: 1; height: 6px; background: rgba(255,255,255,0.2); border-radius: 99px; margin: 0 16px; overflow: hidden; position: relative; }
.progress-fill { width: 70%; height: 100%; background: linear-gradient(90deg, #bb4d2d, #ff8a65); border-radius: 99px; box-shadow: 0 0 10px rgba(255,138,101,0.5); }
@keyframes slideDown { from { transform: translateY(-20px); opacity: 0;} to { transform: translateY(0); opacity: 1; } }

/* THE FEED */
.feed-layout { display: grid; grid-template-columns: 1fr; max-width: 650px; margin: 0 auto; gap: 48px; }
.feed-card { background: var(--panel-strong); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); scroll-snap-align: start; display: flex; flex-direction: column; position: relative; border: 1px solid rgba(255,255,255,0.8); }
.feed-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 32px 90px rgba(84,51,25,0.22); }
.feed-media { width: 100%; height: 440px; position: relative; overflow: hidden; }
.feed-media img { width: 100%; height: 100%; object-fit: cover; }
.feed-overlay-gradient { position: absolute; bottom: 0; width: 100%; height: 60%; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%); pointer-events: none; }
.feed-fomo-badge { position: absolute; top: 16px; left: 16px; background: rgba(255,0,50,0.15); border: 1px solid rgba(255,0,50,0.3); backdrop-filter: blur(8px); color: #ffebee; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 6px; }
.feed-fomo-badge i { color: #ff5252; }
.feed-ai-match { position: absolute; top: 16px; right: 16px; background: rgba(15,118,110,0.9); color: white; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.feed-content { padding: 24px; position: absolute; bottom: 0; width: 100%; color: white; }
.feed-content h3 { font-size: 1.8rem; margin: 0 0 8px; font-family: 'Space Grotesk', sans-serif; line-height: 1.1; }
.feed-content p { font-size: 1.05rem; opacity: 0.9; margin-bottom: 0; font-weight: 500; }
.feed-stats { display: flex; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); }
.feed-stats span { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; font-weight: 600; }
.feed-actions-bar { display: grid; grid-template-columns: 1fr 1fr 1fr; background: #fff; padding: 12px; border-top: 1px solid var(--line); }
.feed-action { border: none; background: transparent; padding: 12px; font-size: 1rem; font-weight: 700; color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s ease; border-radius: 8px; outline: none; }
.feed-action i { font-size: 1.3rem; }
.feed-action:hover { background: var(--bg); color: var(--ink); }
.feed-action.save-btn:hover { background: rgba(255, 0, 50, 0.05); color: #ff1744; }
.feed-action.save-btn.saved { color: #ff1744; }
.feed-action.ai-btn:hover { background: rgba(15, 118, 110, 0.05); color: var(--teal); }

/* MICRO-DOPAMINE ANIMATIONS */
@keyframes heartBurst { 0% { transform: scale(1); } 30% { transform: scale(1.6); color: #ff1744; } 100% { transform: scale(1); color: #ff1744; } }
.anim-heart { animation: heartBurst 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes matchGlow { 0% { box-shadow: var(--shadow-lg); } 50% { box-shadow: 0 0 40px rgba(187,77,45,0.6); border-color: rgba(187,77,45,0.8); } 100% { box-shadow: var(--shadow-lg); } }
.anim-glow { animation: matchGlow 1.2s ease; }

/* AI PERSONALITY BANNER */
.ai-curator-banner { background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(247,214,203,0.3)); border: 1px solid var(--brand-soft); padding: 24px; border-radius: var(--radius-md); display: flex; gap: 20px; align-items: center; margin-bottom: 40px; box-shadow: 0 12px 30px rgba(187,77,45,0.06); }
.ai-curator-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--brand), var(--brand-dark)); display: grid; place-items: center; color: white; font-size: 1.8rem; box-shadow: 0 8px 24px rgba(187,77,45,0.3); flex-shrink: 0; }

/* FUTURE HOMES SYSTEM */
.future-moods { display: flex; gap: 8px; margin-top: 12px; }
.mood-tag { font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; font-weight: 700; background: var(--bg); border: 1px solid var(--line); cursor: pointer; transition: 0.2s ease; }
.mood-tag.active { background: var(--brand); color: white; border-color: var(--brand); }
.future-note { width: 100%; border: 1px dashed var(--line-strong); background: rgba(255,255,255,0.5); padding: 12px; border-radius: 8px; font-size: 0.9rem; margin-top: 12px; resize: vertical; min-height: 50px; font-family: inherit; }

/* STICKY NOTIFICATION */
.floating-fomo { position: fixed; bottom: 30px; right: 30px; background: rgba(34,25,18,0.95); color: white; padding: 16px 20px; border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 12px; font-weight: 600; z-index: 100; opacity: 0; transform: translateY(20px); pointer-events: none; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); backdrop-filter: blur(8px); }
.floating-fomo.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
</style>
`;
content = content.replace(styleRegex, newStyles);


// 2. Inject Gamification Bar into Discover Navbar/Section
const discoverRegex = /(<section class="panel glass reveal" id="discover">[\s\S]*?<div class="section">)/;
const topHooks = `
<div class="gamification-bar user-only">
    <div style="display:flex; align-items:center; gap:12px;">
        <i class="fas fa-trophy" style="color: var(--brand-soft); font-size:1.4rem;"></i>
        <div>
            <strong style="display:block; font-size:0.95rem;">You are 70% close to finding your ideal home</strong>
            <span style="font-size:0.8rem; color:rgba(255,255,255,0.7); font-weight:500;">Review 3 more picks to unlock Tomorrow's VIP Deals.</span>
        </div>
    </div>
    <div class="progress-track"><div class="progress-fill"></div></div>
</div>
<div class="ai-curator-banner user-only">
    <div class="ai-curator-avatar"><i class="fas fa-brain"></i></div>
    <div>
        <span style="font-weight:700; color:var(--brand-dark); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;">Daily Recommendation Drop</span>
        <h3 style="margin:4px 0 8px; font-family:'Space Grotesk', sans-serif;">Based on your taste in Mont Kiara...</h3>
        <p style="margin:0; font-weight:500; font-size:1.05rem; opacity:0.85;">You prefer <strong>modern low-density condos</strong> under RM1.2M. I've curated a fresh feed that highly matches this signal today. Scroll slowly to build the addiction.</p>
    </div>
</div>
$1`;
content = content.replace(discoverRegex, topHooks);


// 3. Rewrite renderProperties logic to output the Feed format instead of old cards
const renderPropertiesMatch = /function renderProperties\(\)\{[\s\S]*?renderProperties/;
// We target the return string inside map. 
const cardMapRegex = /grid\.innerHTML=list\.map\(p=>\{[\s\S]*?\}\)\.join\(""\);/;

const newFeedRender = `grid.innerHTML=list.map(p=>{
    const media=getPropertyMedia(p), decision=getDecisionPack(p), liveCount=getLiveViewerCount(p);
    const saved = savedIds.includes(p.id);
    const fakeDemand = Math.max(2, Math.floor(p.price / 100000 % 8)); // Generate stable random FOMO per listing
    
    // FOMO Urgency Hook text
    const urgencies = ["🔥 "\+liveCount\+" people viewing this today", "⏳ "\+fakeDemand\+" buyers already contacted agent", "⚡ High demand area signals"];
    const urgency = urgencies[p.id % 3];

    return \`<article class="feed-card" id="card_\${p.id}">
        <div class="feed-media">
            <img src="\${media.images[0]}" alt="\${p.title}" loading="lazy" decoding="async">
            <div class="feed-overlay-gradient"></div>
            <div class="feed-fomo-badge"><i class="fas fa-fire-flame-curved"></i> \${urgency}</div>
            <div class="feed-ai-match">✨ \${p.aiScore}% Match for You</div>
            <div class="feed-content">
                <h3>\${money(p.price)}</h3>
                <p>\${p.title}</p>
                <div class="feed-stats">
                    <span><i class="fas fa-bed"></i> \${p.bedrooms} Beds</span>
                    <span><i class="fas fa-maximize"></i> \${p.sqft} sqft</span>
                    <span><i class="fas fa-train"></i> \${p.commute}</span>
                </div>
            </div>
        </div>
        <div class="feed-actions-bar">
            <button class="feed-action save-btn \${saved ? 'saved' : ''}" onclick="toggleSave(\${p.id}, this)">
                <i class="\${saved ? 'fas' : 'far'} fa-heart"></i> \${saved ? 'Saved' : 'Save'}
            </button>
            <button class="feed-action ai-btn" onclick="askAIFeed(\${p.id})">
                <i class="fas fa-robot"></i> Ask AI
            </button>
            <button class="feed-action" onclick="openModal(\${p.id})">
                <i class="fas fa-expand"></i> Details
            </button>
        </div>
    </article>\`;
}).join("");`;

// If we can't find it exactly, we will hook via a different approach, but let's carefully replace the single line in renderProperties
content = content.replace(/grid\.innerHTML=list\.map\(p=>\{[\s\S]*?\}\)\.join\(""\);/, newFeedRender);

// Also change the flex layout of propertiesGrid to feed-layout if user role
const sidePanelRegex = /function renderProperties\(\)\{([\s\S]*?)const list=filtered\(\),grid=\$\("propertiesGrid"\);/;
content = content.replace(sidePanelRegex, `function renderProperties(){$1const list=filtered(),grid=$("propertiesGrid"); if(sessionRole==="user"){grid.className="feed-layout";}`);


// 4. Update toggleSave to inject DOM micro-dopamine animation
const toggleSaveRefRegex = /function toggleSave\(id\)\{/;
content = content.replace(toggleSaveRefRegex, `function toggleSave(id, btn){
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
`);


// 5. Update "Saved properties" -> "Your Future Homes" in HTML 
content = content.replace(/<h2>Saved properties<\/h2>/g, '<h2>💭 Your Future Homes</h2><p>Houses you\'ve loved. Refine your vision by adding mood notes.</p>');


// Add Global Floating Notification engine & Ask AI stub
const scriptEndRegex = /<\/script>/;
const scriptHooks = `
// PSYCHOLOGICAL WARFARE NOTIFICATIONS
setInterval(() => {
    if(sessionRole !== 'user' || savedIds.length === 0) return;
    if(Math.random() > 0.4) {
        const pId = savedIds[Math.floor(Math.random()*savedIds.length)];
        const p = properties.find(x=>x.id===pId);
        if(!p) return;
        
        const fomoMessages = [
            \`Someone else is viewing \${p.title} right now\`,
            \`Price drop alert: RM 20K off \${p.title} this week\`,
            \`🔥 High intent! 3 buyers contacted agents about \${p.title}\`
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
    f.innerHTML = \`<i class="fas fa-bell" style="color:var(--brand); font-size:1.2rem;"></i> <span>\${msg}</span>\`;
    f.classList.add("show");
    
    setTimeout(() => {
        f.classList.remove("show");
    }, 6000);
}

function askAIFeed(id) {
    const p = properties.find(x=>x.id===id);
    tapFeedback('🤖 Ask AI Opened', \`Analyzing \${p.title}... Wait, I'll launch the chat.\`, 'success');
}
</script>`;
content = content.replace(scriptEndRegex, scriptHooks);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected TikTok feed layout, FOMO engine, gamification, and micro-animations to dashboard.html');
