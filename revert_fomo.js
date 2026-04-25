const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// The psychological injections across renderProperties we need to remove to return to the pure classic layout:

// 1. the live-signal-row
html = html.replace(/<div class="live-signal-row">[\s\S]*?<\/div>/g, "");

// 2. the fake live viewers count badge near the action buttons
html = html.replace(/<span class="live-pill" style="margin-left:8px;background:rgba[\s\S]*?active viewers<\/span>/g, "");

// 3. The social-proof-pill and appreciation-pill wrappers
html = html.replace(/<div style="margin-top:10px; margin-bottom:10px;">\s*<span class="social-proof-pill">[\s\S]*?<\/div>/g, "");

// 4. In renderAICurated (if injected), strip it there too:
// The curated HTML might have similar tags:
html = html.replace(/<div class="live-signal-row">[\s\S]*?<\/div>/g, "");

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Restored the pure Classic Template by scrubbing out the psychological UX features.');
