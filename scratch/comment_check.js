const fs = require('fs');
const src = fs.readFileSync('../js/user.js', 'utf8');
let inBlock = false;
let blockStart = -1;
let lineNum = 1;

for (let i = 0; i < src.length - 1; i++) {
    if (src[i] === '\n') lineNum++;
    
    if (!inBlock && src[i] === '/' && src[i+1] === '*') {
        inBlock = true;
        blockStart = lineNum;
        i++; // skip *
    } else if (inBlock && src[i] === '*' && src[i+1] === '/') {
        inBlock = false;
        console.log(`Block comment closed on line ${lineNum} (opened on ${blockStart})`);
        i++; // skip /
    }
}

if (inBlock) {
    console.log(`UNCLOSED block comment started at line ${blockStart}`);
} else {
    console.log('All block comments properly closed.');
}
