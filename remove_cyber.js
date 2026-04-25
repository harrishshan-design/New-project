const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// The injected cybernetic code:
const cyberRegex = /<div style="margin-top:8px; padding:6px 12px; background:rgba\(6,182,212,0\.08\);[\s\S]*?<\/div>/g;
html = html.replace(cyberRegex, "");

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Removed cybernetic UI fragments from the classic template!');
