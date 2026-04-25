const fs = require('fs');

let html = "";
try {
    html = fs.readFileSync('dashboard.html', 'utf8');
} catch(e) {
    console.error("Could not read file");
    process.exit(1);
}

// 1. Restore Fonts
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Outfit:wght.*?rel="stylesheet">/, 
    '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">');

// 2. Restore Variables Block completely
const newRootBlock = `
:root{
  --bg: #f6efe6;
  --bg-soft: #fbf6f0;
  --panel: rgba(255, 250, 245, 0.82);
  --panel-strong: rgba(255, 255, 255, 0.92);
  --ink: #221912;
  --muted: #6f6258;
  --line: rgba(52, 34, 18, 0.12);
  --line-strong: rgba(52, 34, 18, 0.18);
  --brand: #bb4d2d;
  --brand-dark: #8a3118;
  --brand-soft: #f7d6cb;
  --teal: #0f766e;
  --gold: #c28b2c;
  --shadow-lg: 0 28px 80px rgba(84, 51, 25, 0.18);
  --shadow-md: 0 16px 40px rgba(84, 51, 25, 0.12);
  --radius-xl: 32px;
  --radius-lg: 24px;
  --radius-md: 16px;
  --radius-sm: 8px;
}
`;
html = html.replace(/:root\s*\{.*?\}/s, newRootBlock.trim());

// 3. Restore Body CSS block mapping
const bodyRegex = /body\s*\{\s*font-family:\s*'Inter'.*?-webkit-font-smoothing:\s*antialiased;\s*\}/s;
const newBodyBlock = `body {
  font-family: 'Manrope', sans-serif;
  color: var(--ink);
  background: 
    radial-gradient(circle at top left, rgba(194, 139, 44, 0.14), transparent 24%),
    radial-gradient(circle at 86% 8%, rgba(15, 118, 110, 0.10), transparent 20%),
    radial-gradient(circle at 60% 120%, rgba(187, 77, 45, 0.12), transparent 30%),
    linear-gradient(180deg, #faf5ee 0%, #f5ede3 50%, #f2e6d8 100%);
  min-height: 100vh;
  overflow-x: hidden;
  line-height: 1.6;
}`;
html = html.replace(bodyRegex, newBodyBlock);

// 4. Restore Headers to Space Grotesk
html = html.replace(/font-family:\s*'Outfit',\s*sans-serif;/g, "font-family: 'Space Grotesk', sans-serif;");

// 5. Restore inputs and cards background
html = html.replace(/background: #ffffff;/g, "background: var(--bg-soft);");
html = html.replace('.btn {\n  background: linear-gradient(135deg, var(--brand), var(--brand-dark));\n  color: #ffffff;', '.btn {\n  background: linear-gradient(135deg, var(--brand), var(--brand-dark));\n  color: white;');
html = html.replace('.tag {\n  background: rgba(0, 0, 0, 0.6);\n  backdrop-filter: blur(8px);\n  color: #ffffff;', '.tag {\n  background: rgba(255, 255, 255, 0.9);\n  backdrop-filter: blur(8px);\n  color: var(--ink);');


// 6. Restore Master Dashboard
html = html.replace('background: var(--bg-soft); border: 1px solid rgba(15,23,42,0.1); border-radius: 24px; padding: 32px; box-shadow: 0 20px 60px rgba(37,99,235,0.08);', 'background: var(--panel); border: 1px solid var(--line); border-radius: 24px; padding: 32px; box-shadow: var(--shadow-md);');

// 7. Fix AI Chat button gradient back to warm
html = html.replace('background: linear-gradient(135deg, #2563eb, #1d4ed8);', 'background: linear-gradient(135deg, var(--brand), var(--brand-dark));');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Successfully reverted to the Earthy Brown template!');
