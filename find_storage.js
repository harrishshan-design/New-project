const fs = require('fs');
const lines = fs.readFileSync('dashboard.html', 'utf8').split('\n');
const storageKeys = new Set();

const regex1 = /localStorage\.setItem\(['"]([^'"]+)['"]/g;
const regex2 = /localStorage\.getItem\(['"]([^'"]+)['"]/g;

lines.forEach(l => {
    let match;
    while ((match = regex1.exec(l)) !== null) {
        storageKeys.add(match[1]);
    }
    while ((match = regex2.exec(l)) !== null) {
        storageKeys.add(match[1]);
    }
});

console.log('Local Storage Keys found:');
console.log(Array.from(storageKeys).join(', '));
