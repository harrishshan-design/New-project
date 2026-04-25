const fs = require('fs');
const html = fs.readFileSync('dashboard.html', 'utf8');

const regex = /<([a-z]+)[^>]*id=['"]([^'"]+)['"][^>]*class=['"]([^'"]*)['"]/gi;
let match;
let results = [];
while ((match = regex.exec(html)) !== null) {
    results.push(`Tag: ${match[1]}, ID: ${match[2]}, Class: ${match[3]}`);
}

fs.writeFileSync('struct.txt', results.join('\n'));
