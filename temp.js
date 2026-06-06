const fs = require('fs');
const content = fs.readFileSync('dashboard.html', 'utf8');
const rx = /id="([^"]+)"/g;
const ids = new Set();
let match;
while ((match = rx.exec(content)) !== null) {
  ids.add(match[1]);
}
console.log(Array.from(ids).filter(x => x.toLowerCase().includes('vault') || x.toLowerCase().includes('feature') || x.toLowerCase().includes('playground') || x.toLowerCase().includes('cockpit') || x.toLowerCase().includes('user')).join(', '));
