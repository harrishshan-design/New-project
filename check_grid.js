const fs = require('fs');
const lines = fs.readFileSync('dashboard.html', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('propertyGrid') || l.includes('property-grid') || l.includes('"grid"') || l.includes('renderProperties') || l.includes('id="listings"')) {
        console.log((i+1) + ': ' + l.trim().substring(0, 150));
    }
});
