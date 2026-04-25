const fs = require('fs');

let html = "";
try {
    html = fs.readFileSync('dashboard.html', 'utf8');
} catch(e) {
    console.error("Could not read file");
    process.exit(1);
}

// 1. Upgrade Font Links
const fontLinkRegex = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=.*?rel="stylesheet">/;
const newFonts = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">';
html = html.replace(fontLinkRegex, newFonts);

// 2. Upgrade Body Font
html = html.replace(/font-family:\s*['"]?(Manrope|Inter|Space Grotesk)['"]?,.*?sans-serif;/g, "font-family: 'Plus Jakarta Sans', sans-serif;");

// 3. Ensure Headers use Outfit
const headerRegex = /h1,\s*h2,\s*h3,\s*h4\s*\{[^}]*?\}/s;
const newHeadersBlock = `h1, h2, h3, h4 { margin: 0 0 10px; font-family: 'Outfit', sans-serif; font-weight: 700; letter-spacing: -0.02em; }`;

if(headerRegex.test(html)) {
    html = html.replace(headerRegex, newHeadersBlock);
} else {
    // Inject if absent right after body tag
    html = html.replace(/body\s*\{[^}]*?\}/s, match => match + '\\n' + newHeadersBlock);
}

// 4. Upgrade CTAs for High Conversion
// Replace original button style block. We might have '.btn { ... }' in the style block.
// First, we find where .btn { ... } is and overwrite it completely.
const btnRegex = /\.btn\s*\{[^}]*?\}/s;
const newBtnBlock = `.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  border-radius: 99px;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  color: white !important;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(187, 77, 45, 0.25);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(187, 77, 45, 0.4);
}
.btn:active {
  transform: translateY(1px);
  box-shadow: 0 4px 12px rgba(187, 77, 45, 0.2);
}`;

if(html.includes('.btn:hover')) {
    // If it has hover explicitly, remove it or we will duplicate
    html = html.replace(/\.btn:hover\s*\{[^}]*?\}/s, "");
}
if(html.includes('.btn:active')) {
    html = html.replace(/\.btn:active\s*\{[^}]*?\}/s, "");
}

html = html.replace(btnRegex, newBtnBlock);


// Fix pill/tag styling slightly to match
html = html.replace(/\.tag\s*\{[^}]*?\}/s, match => match.replace('border-radius: 8px;', 'border-radius: 99px;'));

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Successfully injected High Conversions UI elements (Fonts & Buttons)!');
