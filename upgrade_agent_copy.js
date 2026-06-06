const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// Inject the Premium Agent Monetization Banner right above the Agent Pipeline
const monetizationBanner = `
<!-- Premium Workspace Banner -->
<section class="panel glass agent-only reveal" style="background: linear-gradient(135deg, rgba(15,25,35,0.95), rgba(26,37,53,0.95)); border-color: rgba(99,179,237,0.3); margin-top: 24px;">
<div style="display: flex; gap: 24px; align-items: center; padding: 12px; color: white;">
  <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 16px; border-radius: 20px; font-size: 2rem;">
    <i class="fas fa-crown"></i>
  </div>
  <div>
    <h2 style="color: white; margin: 0 0 8px; font-size: 1.4rem;">Boost Your Workspace: PropAI Pro <span style="font-size:0.7rem; background:rgba(99,179,237,0.2); color:#63b3ed; padding:4px 8px; border-radius:999px; vertical-align:middle; margin-left:8px;">HIGH ROI</span></h2>
    <p style="color: rgba(255,255,255,0.7); margin: 0 0 12px; font-size: 0.95rem;">Unlock Priority Lead Assignment, WhatsApp Auto-Closing Scripts, and Deep Buyer Insights.</p>
    <button class="btn" style="background: white; color: #1d4ed8; border: none;" onclick="alert('Upgrade flow simulated')">Upgrade to Pro Workspace — RM 199/mo</button>
  </div>
</div>
</section>
`;

// Only add if not already there
if (!html.includes('Boost Your Workspace: PropAI Pro')) {
    html = html.replace(
        '<section class="panel glass agent-only reveal" id="agentInboxSection"',
        monetizationBanner + '\n<section class="panel glass agent-only reveal" id="agentInboxSection"'
    );
}

// Update the Agent Inbox Header
html = html.replace(
    '<div class="section"><h2>Agent Inbox</h2><p>Your verified agent account can see assigned leads and viewing tour requests tied to your WhatsApp number. Follow up quickly.</p></div>',
    '<div class="section"><h2><i class="fas fa-inbox" style="color:var(--brand)"></i> Live Revenue Pipeline</h2><p>Your dedicated command center. Claim your AI-routed leads fast, schedule guaranteed viewings, and start closing. This is where your money is made.</p></div>'
);

// Update Document Vault Headers
html = html.replace(
    '<div class="section"><h2>Document Vault</h2><p>Your agent-side document hub. Review buyer uploads, assign percentage completion, and update the Offer status directly to the user dashboard.</p></div>',
    '<div class="section"><h2><i class="fas fa-folder-open" style="color:var(--brand)"></i> Deal Docs & Fast Approvals</h2><p>Never chase paperwork on WhatsApp again. Review user ICs/loans instantly, push percentage completions, and fast-track the SPA agreement directly to their dashboard.</p></div>'
);

// Update Tenant Pipeline
html = html.replace(
    '<div class="section"><h2>Tenant Recruitment Pipeline</h2><p>Review tenant candidates, pick the best fit, and manage keys, agreement, and rent collection lifecycle. Only users who select "Rental" are pushed here.</p></div>',
    '<div class="section"><h2><i class="fas fa-users" style="color:var(--brand)"></i> Tenant Sourcing Engine</h2><p>Stop filtering bad profiles. Review pre-qualified tenant candidates, vet the absolute best fit, and push them to agreement closing within 48 hours.</p></div>'
);

// Update Rent Calendar
html = html.replace(
    '<div class="section"><h2>Monthly Rent Collection Calendar</h2><p>Track each tenant\'s expected rent due date every month and monitor who is pending or paid. Missing data indicates the feature simulation.</p></div>',
    '<div class="section"><h2><i class="fas fa-calendar-alt" style="color:var(--brand)"></i> Automated Rent Tracking</h2><p>Let the system remember due dates. Track every tenant\'s monthly rent drops, see who is pending, and automate your property management completely.</p></div>'
);

// Update Daily Action List
html = html.replace(
    '<div class="section"><h2>Daily Action List</h2><p>AI-style reminders based on your assigned leads, viewings, document reviews, and monthly rent activity over the last rolling week.</p></div>',
    '<div class="section"><h2><i class="fas fa-bolt" style="color:var(--brand)"></i> AI Assistant Daily Tasks</h2><p>Wake up and execute. The AI generates your highest-priority follow-up list based on deal momentum and aging pipeline items so you never drop a lead.</p></div>'
);

// Update Geo Demand Map
html = html.replace(
    '<div class="section"><h2>Geo Lead Map</h2><p>Privacy-safe area demand signals from buyer behavior. Focus on places getting the most attention without specific user data targeting.</p></div>',
    '<div class="section"><h2><i class="fas fa-map-marked-alt" style="color:var(--brand)"></i> Geo Demand Intelligence</h2><p>See exactly where buyers are clicking right now in real-time. Target your listings, ads, and focus to the highest demand zones before the rest of the market does.</p></div>'
);

// Update Content Generator
html = html.replace(
    '<div class="section"><h2>Content Generator (for TikTok)</h2><p>Daily hooks and ready-to-record scripts based on current buyer attention zones and agent dashboard metrics.</p></div>',
    '<div class="section"><h2><i class="fas fa-video" style="color:var(--brand)"></i> Viral Copy & Brand Engine</h2><p>Stop staring at blank pages. Get daily hooks and ready-to-record TikTok/IG scripts generated from live buyer attention zones so you can dominate social media.</p></div>'
);

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Agent Workspace copy upgraded to SaaS premium styling!');
