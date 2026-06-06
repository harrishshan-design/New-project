const fs = require('fs');

let html = fs.readFileSync('dashboard.html', 'utf8');

const newStyles = `
/* -------------------------------------
 PREMIUM DISTINCTIVE FILTER BLOCKS
-------------------------------------- */
.field, .select {
  background: #ffffff !important;
  color: var(--ink) !important;
  border: 1px solid rgba(187, 77, 45, 0.2) !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 12px rgba(84, 51, 25, 0.05) !important;
}
.field:focus, .select:focus {
  background: rgba(255, 255, 255, 1) !important;
  border-color: var(--brand) !important;
  box-shadow: 0 0 0 4px rgba(187, 77, 45, 0.15) !important;
}
.select option {
  background: #ffffff !important;
  color: var(--ink) !important;
}
`;

if(!html.includes('PREMIUM DISTINCTIVE FILTER BLOCKS')) {
    html = html.replace('</style>', newStyles + '\n</style>');
    fs.writeFileSync('dashboard.html', html, 'utf8');
    console.log("Injected distinctive filter block styles!");
}
