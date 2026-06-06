const fs = require('fs');

let html = fs.readFileSync('dashboard.html', 'utf8');

const regex = /<span class="live-pill">🔥 \${liveCount} viewing now<\/span>/g;
if (!regex.test(html)) {
    // We already added it in prior functions to `renderAICurated()`, but let's add FOMO to the main `renderProperties()`
    html = html.replace(
        '<div class="actions">\n<span class="mini">${verificationLabel(p.verifiedType)}</span>',
        '<div class="live-signal-row" style="margin-top:6px; margin-bottom:6px;"><span class="live-pill" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); padding:4px 8px; border-radius:999px; font-size:0.75rem; font-weight:700;"><i class="fas fa-eye"></i> ${Math.floor(Math.random()*6)+1} viewing now</span> <span class="live-pill" style="background:rgba(245,158,11,0.1); color:#f59e0b; border:1px solid rgba(245,158,11,0.2); padding:4px 8px; border-radius:999px; font-size:0.75rem; font-weight:700;">${getReplySignal(p)}</span></div>\n<div class="actions">\n<span class="mini">${verificationLabel(p.verifiedType)}</span>'
    );
    
    fs.writeFileSync('dashboard.html', html, 'utf8');
    console.log('FOMO HTML injected');
} else {
    // If we want to inject it heavily into propertiesGrid
    // Find the renderProperties map function
    html = html.replace(
        /<span class="mini">\${verificationLabel\(p\.verifiedType\)}<\/span>/g,
        '<span class="mini">${verificationLabel(p.verifiedType)}</span><span class="live-pill" style="margin-left:8px;background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); padding:2px 8px; border-radius:999px; font-size:0.65rem; font-weight:700;">🔥 ${Math.floor(Math.random()*6)+2} active viewers</span>'
    );
    fs.writeFileSync('dashboard.html', html, 'utf8');
    console.log('FOMO badges added to all properties.');
}
