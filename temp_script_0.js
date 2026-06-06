
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
            `🔥 High intent! 3 buyers contacted agents about ${p.title}`
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
    tapFeedback('🤖 Ask AI Opened', `Analyzing ${p.title}... Wait, I'll launch the chat.`, 'success');
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
            `🔥 High intent! 3 buyers contacted agents about ${p.title}`
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
    tapFeedback('🤖 Ask AI Opened', `Analyzing ${p.title}... Wait, I'll launch the chat.`, 'success');
}
