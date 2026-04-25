const fs = require('fs');

let html = "";
try {
    html = fs.readFileSync('dashboard.html', 'utf8');
} catch(e) {
    console.error("Could not read file");
    process.exit(1);
}

// 1. Better Contrast Variables
html = html.replace('--bg: #09090b;', '--bg: #000000;');
html = html.replace('--bg-soft: #18181b;', '--bg-soft: #121212;');
html = html.replace('--ink: #f8fafc;', '--ink: #ffffff;');
html = html.replace('--muted: #a1a1aa;', '--muted: #cbd5e1;');
html = html.replace('--panel: rgba(24, 24, 27, 0.7);', '--panel: rgba(30, 30, 30, 0.85);');
html = html.replace('--line: rgba(255, 255, 255, 0.1);', '--line: rgba(255, 255, 255, 0.18);');

// 2. Remove the old conflicting body block completely
const oldBodyRegex = /body\{\s*font-family:Manrope,sans-serif;\s*color:var\(--ink\);\s*background:[\s\S]*?overflow-x:hidden;\s*\}/s;
html = html.replace(oldBodyRegex, '');

// 3. Make base font bigger globally on the remaining body tag
html = html.replace('line-height: 1.6;', 'line-height: 1.6;\n  font-size: 105%; /* Increased readability */');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Colors and contrast fixed by stripping old body block and increasing base font!');
