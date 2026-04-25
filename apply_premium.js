const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// 1. Replace Google Fonts
const newFonts = `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Space\+Grotesk[^>]*>/, newFonts);

// 2. Erase old :root completely
const oldRootMatch = html.match(/:root\s*\{[^}]*\}/);
if (oldRootMatch) {
    html = html.replace(oldRootMatch[0], '');
}

// 3. Inject new CSS block into <style>
const premiumCSS = fs.readFileSync('premium_theme.css', 'utf8');

// Insert after <style>
html = html.replace('<style>', '<style>\n' + premiumCSS + '\n');

// 4. Update hardcoded colors in inline styles to CSS variables or dark mode colors
html = html.replace(/background: rgba\(251,246,240,0\.92\)/g, 'background: rgba(9,9,11,0.85)'); // Sticky nav
html = html.replace(/color:var\(--ink\)/g, 'color:var(--ink)'); 

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Premium Dark Theme applied successfully to dashboard.html!');
