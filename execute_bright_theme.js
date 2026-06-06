const fs = require('fs');

let html = "";
try {
    html = fs.readFileSync('dashboard.html', 'utf8');
} catch(e) {
    console.error("Could not read file");
    process.exit(1);
}

// 1. CSS Variables - Bright Theme Overhaul
html = html.replace('--bg: #000000;', '--bg: #f8fafc;');
html = html.replace('--bg-soft: #121212;', '--bg-soft: #ffffff;');
html = html.replace('--panel: rgba(30, 30, 30, 0.85);', '--panel: rgba(255, 255, 255, 0.9);');
html = html.replace('--panel-strong: rgba(24, 24, 27, 0.95);', '--panel-strong: rgba(255, 255, 255, 1);');
html = html.replace('--ink: #ffffff;', '--ink: #0f172a;');
html = html.replace('--muted: #cbd5e1;', '--muted: #64748b;');
html = html.replace('--line: rgba(255, 255, 255, 0.18);', '--line: rgba(15, 23, 42, 0.1);');
html = html.replace('--line-strong: rgba(255, 255, 255, 0.2);', '--line-strong: rgba(15, 23, 42, 0.15);');

// 2. Adjust Body and Hero Gradients
html = html.replace(/radial-gradient.*?rgba\(59, 130, 246, 0\.05\).*?;/s, 'linear-gradient(to bottom, #f8fafc, #f1f5f9);');
html = html.replace(/radial-gradient\(circle at 50% 0%, rgba\(29, 78, 216, 0\.2\), var\(--bg\) 60%\)/s, 'linear-gradient(to bottom, #eff6ff, var(--bg))');

// 3. Fix the AI Chat Inverse button text
html = html.replace('background: linear-gradient(135deg, #1e1b4b, #312e81);', 'background: linear-gradient(135deg, #2563eb, #1d4ed8);');

// 4. Update the Master Dashboard (CEO Control Center) to Bright Mode
html = html.replace('background: linear-gradient(135deg, #020617, #0f172a); border: 1px solid rgba(59,130,246,0.3); border-radius: 24px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.8);', 'background: #ffffff; border: 1px solid rgba(15,23,42,0.1); border-radius: 24px; padding: 32px; box-shadow: 0 20px 60px rgba(37,99,235,0.08);');
html = html.replace(/<h1 style="color:white;/g, '<h1 style="color:var(--ink);');
html = html.replace(/<p style="color:rgba\(255,255,255,0\.6\);/g, '<p style="color:var(--muted);');
html = html.replace(/background:rgba\(0,0,0,0\.5\); border-top:1px solid rgba\(255,255,255,0\.1\);/g, 'background:rgba(241,245,249,1); border-top:1px solid rgba(15,23,42,0.1);');
html = html.replace(/color:rgba\(255,255,255,0\.8\);/g, 'color:var(--ink);');
html = html.replace(/color:rgba\(255,255,255,0\.5\);/g, 'color:var(--muted);');

// 5. Brighten the forms and inputs
html = html.replace(/background: rgba\(255, 255, 255, 0\.03\);/g, 'background: #ffffff;');
html = html.replace(/background: rgba\(255, 255, 255, 0\.06\);/g, 'background: #ffffff;');
html = html.replace(/color: white;/g, 'color: var(--ink);'); 

// 6. Fix "Unlock Data Pack" modal background
html = html.replace('background:rgba(0,0,0,0.4);', 'background:#ffffff;');

// 7. Fix text shadows turning things dark
html = html.replace(/text-shadow: 0 0 40px rgba\(255,255,255,0\.3\);/g, '');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Successfully pivoted dashboard completely to Bright Lively Trust Theme!');
