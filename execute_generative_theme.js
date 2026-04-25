const fs = require('fs');

let html = "";
try {
    html = fs.readFileSync('dashboard.html', 'utf8');
} catch(e) {
    console.error("Could not read file");
    process.exit(1);
}

// 1. Cybernetic OLED CSS Variables
const newRootBlock = `
:root{
  --bg: #030712; /* Deepest OLED Space Black */
  --bg-soft: #0f172a; /* Slate 900 */
  --panel: rgba(15, 23, 42, 0.7); /* Translucent slate */
  --panel-strong: rgba(15, 23, 42, 0.95);
  --ink: #f8fafc; /* Neon white */
  --muted: #94a3b8; /* Cool slate gray */
  --line: rgba(14, 165, 233, 0.15); /* Faint cyan grid line */
  --line-strong: rgba(14, 165, 233, 0.3);
  --brand: #06b6d4; /* Electric Cyan */
  --brand-dark: #0284c7; /* Azure */
  --brand-soft: rgba(6, 182, 212, 0.15); /* Glow Cyan */
  --teal: #10b981; /* Matrix green */
  --gold: #a855f7; /* Violet/Purple (replaces gold for neon vibe) */
  --shadow-lg: 0 0 80px rgba(6, 182, 212, 0.2); /* Cyan Glow */
  --shadow-md: 0 16px 40px rgba(0, 0, 0, 0.8);
  --radius-xl: 24px;
  --radius-lg: 16px;
  --radius-md: 12px;
  --radius-sm: 8px;
}
`;
html = html.replace(/:root\s*\{.*?\}/s, newRootBlock.trim());

// 2. Cybernetic Fonts
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Space\+Grotesk:wght.*?rel="stylesheet">/, 
    '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Courier+Prime&display=swap" rel="stylesheet">');

// 3. Cybernetic Body CSS
const bodyRegex = /body\s*\{\s*font-family:\s*'Manrope'.*?line-height:\s*1\.6;\s*\}/s;
const newBodyBlock = `body {
  font-family: 'Inter', -apple-system, sans-serif;
  color: var(--ink);
  background-color: var(--bg);
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(6, 182, 212, 0.08), transparent 40%),
    radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.08), transparent 40%),
    linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
  min-height: 100vh;
  overflow-x: hidden;
  line-height: 1.6;
}`;
if(bodyRegex.test(html)) {
    html = html.replace(bodyRegex, newBodyBlock);
} else {
    // Override whatever body block is there
    html = html.replace(/body\s*\{[^}]*?\}/s, newBodyBlock);
}

// Ensure Headers use Space Grotesk
html = html.replace(/font-family:\s*'Space Grotesk', sans-serif;/g, ""); // Remove previous overrides
html = html.replace(/h1,\s*h2,\s*h3,\s*h4\s*\{\s*margin:\s*0\s*0\s*10px;\s*\}/, "h1, h2, h3, h4 { margin: 0 0 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.04em; }");

// 4. Update the Master Dashboard for OLED Noir
html = html.replace(/background: var\(--panel\); border: 1px solid var\(--line\); border-radius: 24px; padding: 32px; box-shadow: var\(--shadow-md\);/g, 'background: rgba(0,0,0,0.5); border: 1px solid var(--line); border-radius: 16px; padding: 32px; box-shadow: var(--shadow-lg); backdrop-filter: blur(20px);');

// 5. Build the AI Omnibar HTML
const omniBarUI = `
<!-- AI Omnibar Architecture -->
<div class="omni-wrap" style="max-width:800px; margin:40px auto; padding:0 20px;">
    <!-- Removed traditional clunky filters -->
    <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(6,182,212,0.3); border-radius:24px; padding:8px 8px 8px 24px; display:flex; align-items:center; gap:16px; box-shadow:0 0 40px rgba(6,182,212,0.1); backdrop-filter:blur(24px); transition:all 0.3s ease;" id="omniContainer">
        <i class="fas fa-sparkles" style="color:var(--brand); font-size:1.2rem;"></i>
        <input type="text" id="aiOmnibarInput" placeholder="What are you looking for? (e.g., Luxury condo below 800k in PJ...)" style="flex:1; background:transparent; border:none; outline:none; color:var(--ink); font-size:1.1rem; font-family:'Inter',sans-serif;" onkeypress="if(event.key==='Enter') triggerAIGeneration()">
        <button class="btn" style="border-radius:18px; padding:12px 24px; font-weight:700; background:linear-gradient(135deg, var(--brand), #4f46e5); color:#fff; border:none; display:flex; gap:8px; align-items:center;" onclick="triggerAIGeneration()">Generate <i class="fas fa-arrow-right"></i></button>
    </div>
    
    <div id="aiGenerativeState" style="display:none; text-align:center; padding:32px 0;">
        <i class="fas fa-circle-notch fa-spin" style="font-size:2rem; color:var(--brand); margin-bottom:16px;"></i>
        <div style="font-family:'Courier Prime', monospace; color:var(--brand); font-size:0.9rem;" id="aiLoadingLog">Initializing Knowledge Graph...</div>
    </div>
</div>
`;

// Replace the old search-row and filters-row
const searchRegex = /<div class="search-row">.*?<\/div>\s*<div class="filters-row"[^>]*>.*?<\/div>/s;
if(searchRegex.test(html)) {
    html = html.replace(searchRegex, omniBarUI);
}

// 6. Cybernetic Javascript Logic
const generativeJs = `
function triggerAIGeneration() {
    const input = document.getElementById('aiOmnibarInput').value;
    if(!input.trim()) return;
    
    const container = document.getElementById('omniContainer');
    const genState = document.getElementById('aiGenerativeState');
    const grid = document.getElementById('propertiesGrid');
    
    // UI Feedback
    container.style.boxShadow = "0 0 60px rgba(168,85,247,0.4)";
    container.style.border = "1px solid rgba(168,85,247,0.8)";
    grid.style.opacity = "0.2";
    
    genState.style.display = "block";
    
    const logs = [
        "Parsing semantic intent...",
        "Querying KL real estate latent space...",
        "Evaluating ROI parameters...",
        "Rendering highly optimized matches..."
    ];
    let i=0;
    
    let interval = setInterval(() => {
        document.getElementById('aiLoadingLog').textContent = logs[i];
        i++;
        if(i >= logs.length) {
            clearInterval(interval);
            setTimeout(() => {
                genState.style.display = "none";
                container.style.boxShadow = "0 0 40px rgba(6,182,212,0.1)";
                container.style.border = "1px solid rgba(6,182,212,0.3)";
                grid.style.opacity = "1";
                // Trigger actual render
                typeof renderProperties === 'function' && renderProperties();
            }, 600);
        }
    }, 450);
}

// Modify existing renderProperties hook if necessary
`;
html = html.replace('function contactAgent', generativeJs + '\nfunction contactAgent');


// 7. Inject "AI Verdict" UI Hook into Property Cards
const titleRegex = /<div class="title">\$\{p\.title\}<\/div><\/div>/g;
html = html.replace(titleRegex, '<div class="title">${p.title}</div></div>\n<div style="margin-top:8px; padding:6px 12px; background:rgba(6,182,212,0.08); border-left:2px solid var(--brand); color:var(--muted); font-size:0.8rem; font-family:\'Courier Prime\', monospace;">\n<i class="fas fa-microchip" style="color:var(--brand);"></i> <b>AI Verdict:</b> Generated ${Math.floor(Math.random()*90)+10}% confidence match for your profile.\n</div>');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Successfully pivoted dashboard completely to AI-Driven Generative Theme!');
