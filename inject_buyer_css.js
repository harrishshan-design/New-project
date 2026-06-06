const fs = require('fs');
let content = fs.readFileSync('dashboard.html', 'utf8');

const target = 'NT ANALYZER === */\n.sticky-ai-toggle';
const buyerCSS = `NT ANALYZER === */

/* === USER SIDE ENGAGEMENT & BUYER FEATURES === */
/* Smooth scroll pacing */
html { scroll-behavior: smooth; }
section.reveal { margin-bottom: 32px; }

/* Buyer feature grid */
.buyer-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media(max-width:900px){ .buyer-features-grid { grid-template-columns: repeat(2,1fr); } }
@media(max-width:560px){ .buyer-features-grid { grid-template-columns: 1fr; } }

.buyer-feature-card {
    background: white;
    border-radius: 20px;
    padding: 28px 24px;
    border: 1px solid var(--line);
    cursor: pointer;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    overflow: hidden;
}
.buyer-feature-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(187,77,45,0.04), transparent);
    opacity: 0;
    transition: opacity 0.25s;
}
.buyer-feature-card:hover { transform: translateY(-5px); box-shadow: 0 20px 60px rgba(187,77,45,0.13); }
.buyer-feature-card:hover::after { opacity: 1; }
.bf-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: linear-gradient(135deg, var(--brand-soft), rgba(187,77,45,0.08));
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; color: var(--brand);
}
.bf-badge {
    display: inline-block;
    font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--teal); background: rgba(15,118,110,0.08);
    border-radius: 999px; padding: 3px 10px; width: fit-content;
}
.buyer-feature-card strong { font-size: 1.05rem; font-weight: 800; color: var(--ink); line-height: 1.3; }
.buyer-feature-card p { font-size: 0.88rem; color: var(--muted); line-height: 1.6; margin: 0; flex-grow: 1; }
.bf-action {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.82rem; font-weight: 700; color: var(--brand);
    margin-top: 4px; transition: gap 0.2s;
}
.buyer-feature-card:hover .bf-action { gap: 10px; }

/* Sticky discovery header when scrolling */
#discover .section { position: sticky; top: 0; background: rgba(251,246,240,0.92); backdrop-filter: blur(12px); z-index: 10; padding: 12px 0 8px; margin-bottom: 0; }

/* Property grid smooth appearance */
#propertiesGrid .card { animation: cardPop 0.35s ease both; }
@keyframes cardPop { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

/* Scroll engagement: section entry animation delay stagger */
.reveal { transition: opacity 0.5s ease, transform 0.5s ease; opacity: 0; transform: translateY(24px); }
.reveal.is-visible { opacity: 1; transform: translateY(0); }

/* Engagement: pulse on save button */
@keyframes savePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
.saved-pulse { animation: savePulse 0.4s ease; }

/* Sticky progress bar on scroll */
.gamification-bar { position: sticky; top: 0; z-index: 50; }

/* User-only: hide agent-feature cells in any leftover matrix */
body.user .agent-feature { display: none !important; }
/* === END USER ENGAGEMENT === */

.sticky-ai-toggle`;

content = content.replace(target, buyerCSS);
fs.writeFileSync('dashboard.html', content, 'utf8');
console.log('User engagement CSS injected. Size: ' + content.length);
