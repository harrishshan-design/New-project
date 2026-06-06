const fs = require('fs');
let content = fs.readFileSync('dashboard.html', 'utf8');

// Find and replace the feature matrix section entirely using a regex
const oldMatrix = /<section class="panel glass feature-matrix reveal">[\s\S]*?<\/section>/;
const newMatrix = `<!-- Buyer Features Showcase -->
<section class="panel glass feature-matrix reveal user-buyer-features">
<div class="section"><h2>What You Get as a Buyer \uD83C\uDFE0</h2><p>Everything built to help you find, understand, and secure your ideal home \u2014 faster and smarter.</p></div>
<div class="buyer-features-grid">
  <div class="buyer-feature-card" onclick="openFeatureExperience('buyer-dashboard')">
    <div class="bf-icon"><i class="fas fa-bolt"></i></div>
    <div class="bf-badge">AI Powered</div>
    <strong>Deal Alerts</strong>
    <p>Get notified when a property that matches your profile drops in price or becomes available. Never miss the right deal again.</p>
    <div class="bf-action">Explore <i class="fas fa-arrow-right"></i></div>
  </div>
  <div class="buyer-feature-card" onclick="openDocumentVaultFeature()">
    <div class="bf-icon"><i class="fas fa-folder-open"></i></div>
    <div class="bf-badge">Smart Vault</div>
    <strong>Document Vault</strong>
    <p>Keep your loan pre-approval, IC, and SNP docs in one secure place. Track review progress and get agent feedback instantly.</p>
    <div class="bf-action">Open Vault <i class="fas fa-arrow-right"></i></div>
  </div>
  <div class="buyer-feature-card" onclick="openFeatureExperience('property-detail')">
    <div class="bf-icon"><i class="fas fa-map-marked-alt"></i></div>
    <div class="bf-badge">Area Intel</div>
    <strong>Neighbourhood Scores</strong>
    <p>Compare areas by commute time, school proximity, LRT access, mall distance, and lifestyle fit. Know before you go.</p>
    <div class="bf-action">Explore Areas <i class="fas fa-arrow-right"></i></div>
  </div>
  <div class="buyer-feature-card" onclick="openFeatureExperience('tour-booking')">
    <div class="bf-icon"><i class="fas fa-calendar-check"></i></div>
    <div class="bf-badge">One Click</div>
    <strong>Instant Tour Booking</strong>
    <p>Book a viewing in seconds. No back-and-forth. Pick your slot, confirm, and get a WhatsApp reminder from your agent.</p>
    <div class="bf-action">Book Now <i class="fas fa-arrow-right"></i></div>
  </div>
  <div class="buyer-feature-card" onclick="applyPreset('investor')">
    <div class="bf-icon"><i class="fas fa-chart-line"></i></div>
    <div class="bf-badge">Investor</div>
    <strong>Investment Analyzer</strong>
    <p>Calculate rental yield, predict 5-year value growth, and get an AI verdict on whether it's worth your money.</p>
    <div class="bf-action">Analyze Now <i class="fas fa-arrow-right"></i></div>
  </div>
  <div class="buyer-feature-card" onclick="scrollToSection('compare')">
    <div class="bf-icon"><i class="fas fa-balance-scale"></i></div>
    <div class="bf-badge">Side by Side</div>
    <strong>Save &amp; Compare</strong>
    <p>Heart the homes you love, then compare them side-by-side on price, yield, area score, and agent rating all at once.</p>
    <div class="bf-action">Compare <i class="fas fa-arrow-right"></i></div>
  </div>
</div>
</section>`;

if (oldMatrix.test(content)) {
    content = content.replace(oldMatrix, newMatrix);
    fs.writeFileSync('dashboard.html', content, 'utf8');
    console.log('Feature matrix replaced successfully.');
} else {
    console.log('Pattern not found.');
}
