const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// The earlier script erroneously changed text colors in buttons and tags to var(--ink) (dark slate). We must revert them to white for contrast on colorful backgrounds.
html = html.replace(/\.btn \{\s*background: linear-gradient\(135deg, var\(--brand\), var\(--brand-dark\)\);\s*color: var\(--ink\);/g, '.btn {\n  background: linear-gradient(135deg, var(--brand), var(--brand-dark));\n  color: #ffffff;');

html = html.replace(/\.tag \{\s*background: rgba\(0, 0, 0, 0\.6\);\s*backdrop-filter: blur\(8px\);\s*color: var\(--ink\);/g, '.tag {\n  background: rgba(0, 0, 0, 0.6);\n  backdrop-filter: blur(8px);\n  color: #ffffff;');

html = html.replace(/\.master-copy \{\s*color: var\(--ink\);/g, '.master-copy { color: #ffffff;');

// Fix button text colors generally where they were overwritten
html = html.replace(/color: var\(--ink\);([^}]*?box-shadow.*?)/g, 'color: #ffffff;$1'); 

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log("Restored white text readability on buttons/tags!");
