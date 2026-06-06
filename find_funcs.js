const fs = require('fs');
const lines = fs.readFileSync('dashboard.html', 'utf8').split('\\n');
lines.forEach((l, i) => {
    if (l.includes('renderProperties') && l.includes('function')) {
        console.log(i + 1 + ': ' + l.substring(0, 100));
    }
});
