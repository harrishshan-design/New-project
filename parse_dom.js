const fs = require('fs');
const html = fs.readFileSync('dashboard.html', 'utf8');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(html);
const document = dom.window.document;

let output = '';
for (let child of document.body.children) {
    if (child.tagName !== 'SCRIPT') {
        output += `TAG: ${child.tagName}, ID: ${child.id}, CLASS: ${child.className}\n`;
    }
}
fs.writeFileSync('dom_structure.txt', output);
