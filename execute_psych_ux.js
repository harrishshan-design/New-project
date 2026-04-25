const fs = require('fs');

let html = "";
try {
    html = fs.readFileSync('dashboard.html', 'utf8');
} catch (e) {
    console.error("Could not read file");
    process.exit(1);
}

// 1. Replace the plain contact form with the "Curiosity Gap" lock
const oldLeadForm = /<div class="edit-grid" id="leadFormWrap">.*?<\/button>/s;
const newLeadForm = `<div class="edit-grid" id="leadFormWrap" style="position:relative;">
<div id="unlockTeaser" style="text-align:center; padding:12px; background:rgba(59,130,246,0.1); border-radius:12px; border:1px solid rgba(59,130,246,0.3);">
  <i class="fas fa-lock" style="color:var(--brand); font-size:1.4rem; margin-bottom:8px;"></i>
  <h3 style="margin:0 0 4px; font-size:1rem; color:var(--ink);">5-Year ROI & Off-Market Data</h3>
  <p style="margin:0 0 12px; font-size:0.8rem; color:var(--muted);">Unlock full investment logic and off-market analytics for this property.</p>
  <button class="btn pulse-glow" id="startUnlockBtn" onclick="startUnlockSequence()" style="width:100%; border-radius:8px;">Unlock Data Pack</button>
</div>

<div id="unlockLoading" style="display:none; text-align:center; padding:20px;">
  <i class="fas fa-circle-notch fa-spin" style="color:var(--brand); font-size:2rem; margin-bottom:12px;"></i>
  <p id="unlockLoadingText" style="font-weight:600; color:var(--ink);">Crunching area data...</p>
</div>

<div id="unlockFinal" style="display:none; text-align:left; background:rgba(16,185,129,0.05); padding:16px; border-radius:12px; border:1px solid rgba(16,185,129,0.3);">
  <h3 style="margin:0 0 8px; color:var(--teal); font-size:1rem;"><i class="fas fa-check-circle"></i> Data Pack Ready</h3>
  <p style="margin:0 0 12px; font-size:0.85rem; color:var(--muted);">Where should our AI send the full report and connect you with the area specialist?</p>
  <input class="field" id="leadPhone" placeholder="Enter WhatsApp Number" style="margin-bottom:8px;">
  <input type="hidden" id="leadName" value="Stealth Lead">
  <input type="hidden" id="leadMessage" value="Unlocked Data Pack">
  <button class="btn" id="contactAgentBtn" onclick="contactAgent()" style="width:100%; background:linear-gradient(135deg,var(--teal),#059669);">Send to my WhatsApp</button>
</div>
</div>`;

html = html.replace(oldLeadForm, newLeadForm);

// 2. Add the startUnlockSequence logic into the script block
const newJs = `
function startUnlockSequence() {
    $("unlockTeaser").style.display = "none";
    $("unlockLoading").style.display = "block";
    let texts = ["Crunching area data...", "Analyzing rental yield...", "Checking off-market units...", "Generating report..."];
    let i = 0;
    let t = setInterval(()=>{
        i++;
        if(i >= texts.length) {
            clearInterval(t);
            $("unlockLoading").style.display = "none";
            $("unlockFinal").style.display = "block";
        } else {
            $("unlockLoadingText").textContent = texts[i];
        }
    }, 800);
}
`;
html = html.replace('function contactAgent', newJs + '\nfunction contactAgent');


// 3. Overhaul the Master Suite Header
const oldMaster = /<header class="master-suite admin-only reveal" id="masterSuite">[\s\S]*?<\/header>/;
const newMaster = `
<header class="master-suite admin-only reveal" id="masterSuite" style="margin-bottom:24px;">
<section class="master-hero" style="background: linear-gradient(135deg, #020617, #0f172a); border: 1px solid rgba(59,130,246,0.3); border-radius: 24px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); position:relative; overflow:hidden;">

  <div style="position:relative; z-index:2; display:flex; justify-content:space-between; align-items:flex-end;">
    <div class="master-copy">
      <div class="eyebrow" style="color:var(--brand); font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;"><i class="fas fa-crown"></i> CEO Revenue Center</div>
      <h1 style="color:white; margin:0 0 8px; font-size:2.4rem;">The Money Making King.</h1>
      <p style="color:rgba(255,255,255,0.6); max-width:500px; margin:0;">You command the ecosystem. Observe live leads converting, agents paying for priority, and rent flowing automatically.</p>
    </div>
    
    <div style="display:flex; gap:24px; text-align:right;">
        <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); padding:16px 24px; border-radius:16px;">
            <div style="color:rgba(255,255,255,0.5); font-size:0.8rem; text-transform:uppercase; font-weight:700; margin-bottom:4px;">Pipeline Value</div>
            <div style="color:#10b981; font-size:2.5rem; font-weight:800; font-family:'Space Grotesk', sans-serif;">RM 14.2M</div>
            <div style="color:#34d399; font-size:0.8rem;"><i class="fas fa-arrow-up"></i> +12% today</div>
        </div>
        <div style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); padding:16px 24px; border-radius:16px;">
            <div style="color:rgba(255,255,255,0.5); font-size:0.8rem; text-transform:uppercase; font-weight:700; margin-bottom:4px;">Platform Revenue</div>
            <div style="color:#60a5fa; font-size:2.5rem; font-weight:800; font-family:'Space Grotesk', sans-serif;">RM 42,500</div>
            <div style="color:#93c5fd; font-size:0.8rem;">Monthly Active Agents</div>
        </div>
    </div>
  </div>

  <div style="position:absolute; bottom:0; left:0; width:100%; background:rgba(0,0,0,0.5); border-top:1px solid rgba(255,255,255,0.1); padding:8px 0; overflow:hidden; white-space:nowrap;">
    <div style="display:inline-block; animation: ticker-scroll 25s linear infinite; color:rgba(255,255,255,0.8); font-family:monospace; font-size:0.85rem;">
      <span style="color:#10b981; margin:0 16px;">● Agent John accepted a lead (RM850k)</span>
      <span style="color:#3b82f6; margin:0 16px;">● User 409X unlocked ROI data (Mont Kiara)</span>
      <span style="color:#f59e0b; margin:0 16px;">● Agent Sarah upgraded to Pro Workspace</span>
      <span style="color:#10b981; margin:0 16px;">● RM2,500 Rent Collected via Smart Pipeline</span>
      <span style="color:#10b981; margin:0 16px;">● Agent John accepted a lead (RM850k)</span>
    </div>
  </div>

</section>
</header>
<style>
@keyframes ticker-scroll { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
.pulse-glow { animation: pulseGlow 2s infinite cubic-bezier(0.4, 0, 0.6, 1); }
@keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px rgba(59,130,246,0.4); border-color: rgba(59,130,246,0.6); } 50% { box-shadow: 0 0 40px rgba(59,130,246,0.8); border-color: rgba(96,165,250,1); } }
</style>
`;
html = html.replace(oldMaster, newMaster);

// Finally write back
fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Successfully injected curiosity gap lead gen and Master Revenue UI');
