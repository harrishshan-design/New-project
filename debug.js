const fs = require('fs');
const html = fs.readFileSync('dashboard.html', 'utf8');
const lines = html.split('\n');

for(let i=0; i<lines.length; i++) {
    const l = lines[i];
    if (l.includes('<section') || l.includes('class="search-row"') || l.includes('id="propertiesGrid"')) {
        console.log((i+1) + ': ' + l.trim().substring(0, 80));
    }
}
