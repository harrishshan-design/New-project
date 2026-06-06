const fs = require('fs');

let cssContent = `
/* UI Overhaul CSS Updates */

:root{
  --bg: #09090b;               /* Deep black main background */
  --bg-soft: #18181b;          /* Slightly lighter card background */
  --panel: rgba(24, 24, 27, 0.7); /* Translucent panel */
  --panel-strong: rgba(24, 24, 27, 0.95);
  --ink: #f8fafc;              /* Crisp white text */
  --muted: #a1a1aa;            /* Soft gray muted text */
  --line: rgba(255, 255, 255, 0.1); /* Thin ultra-light border */
  --line-strong: rgba(255, 255, 255, 0.2);
  
  --brand: #3b82f6;            /* Tech Blue / AI Primary */
  --brand-dark: #1d4ed8;       
  --brand-soft: rgba(59, 130, 246, 0.15); /* Soft glowing blue */
  
  --teal: #10b981;             /* Matrix Green / Success */
  --gold: #f59e0b;
  
  --shadow-lg: 0 32px 80px rgba(0, 0, 0, 0.6);
  --shadow-md: 0 16px 40px rgba(0, 0, 0, 0.4);
  
  --radius-xl: 32px;
  --radius-lg: 24px;
  --radius-md: 16px;
  --radius-sm: 8px;
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background-color: var(--bg);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%);
  color: var(--ink);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1,h2,h3,h4,.brand {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  letter-spacing:-0.02em;
}

/* Redesign Glass Panels */
.glass {
  background: var(--panel);
  border: 1px solid var(--line);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

/* Input Fields */
.field, .select {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line-strong);
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
}
.field:focus, .select:focus {
  background: rgba(255, 255, 255, 0.07);
  border-color: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-soft);
  outline: none;
}
.field::placeholder { color: var(--muted); }
.select option { background: var(--bg-soft); color: var(--ink); }

/* Buttons & Chips */
.btn {
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
}

.chip {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--line-strong);
  color: var(--ink);
  border-radius: var(--radius-sm);
}
.chip.active {
  background: var(--brand-soft);
  color: #60a5fa;
  border-color: var(--brand);
}

/* Property Cards */
.card {
  background: var(--bg-soft);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
}
.card-image {
  height: 240px;
}
.card-image::after {
  content:'';
  position:absolute; inset:0;
  background: linear-gradient(to top, var(--bg-soft) 0%, transparent 60%);
}
.card-tags {
  top: 16px; left: 16px; bottom: auto; right: auto;
  display: flex; gap: 8px; flex-wrap: wrap; z-index: 2;
}
.tag {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
}

/* Detail copy inside cards */
.card-details {
  padding: 0 20px 24px;
  position: relative; z-index: 2;
}
.card-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 4px; }
.card-price { color: #60a5fa; font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; }
.card-meta { color: var(--muted); border-top: 1px solid var(--line); padding-top: 12px; margin-top: 12px; }

/* Discovery Filters */
#discover .search-row, #discover .filters {
  background: rgba(0,0,0,0.2);
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
}
#discover .section {
  background: rgba(9, 9, 11, 0.85) !important;
  border-bottom: 1px solid var(--line);
}

/* User Feature Cards */
.buyer-feature-card {
  background: var(--bg-soft);
  border-color: var(--line-strong);
}
.buyer-feature-card strong { color: var(--ink); }
.buyer-feature-card::after {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent);
}
.buyer-feature-card:hover {
  border-color: var(--brand);
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15);
}

/* Hero Section */
.user-hero {
  background: radial-gradient(circle at 50% 0%, rgba(29, 78, 216, 0.2), var(--bg) 60%);
  border-bottom: 1px solid var(--line);
}
.hero-copy h1 { color: #fff; text-shadow: 0 0 40px rgba(255,255,255,0.3); }

/* Invert AI chat button */
.chat-trigger {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border: 1px solid rgba(99, 102, 241, 0.4);
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.5);
  color: white;
}
.chat-trigger:hover {
  box-shadow: 0 10px 40px rgba(79, 70, 229, 0.8), 0 0 20px rgba(129, 140, 248, 0.6);
}

/* Global scrollbars for dark mode */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
`;

console.log("Saving new CSS to apply_premium_ui.js...");
fs.writeFileSync('premium_theme.css', cssContent);
