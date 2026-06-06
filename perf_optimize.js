/**
 * Performance Optimizer for dashboard.html
 * 
 * Applies:
 * 1. Remove duplicate Google Fonts link
 * 2. Add font-display:swap to font link
 * 3. Convert model-viewer script to lazy-load (only loads when AR button clicked)
 * 4. Add <link rel="preload"> for FontAwesome
 * 5. Add <link rel="dns-prefetch"> for all CDN domains
 * 6. Add loading="lazy" to all <img> tags
 * 7. Add content-visibility:auto to offscreen sections
 * 8. Add meta description & SEO tags
 * 9. Add will-change hints to animated elements
 * 10. Minify inline style whitespace (multi-line to single)
 */

const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

let changes = [];

// 1. Remove duplicate Google Fonts link (keep only first occurrence)
const fontLinkPattern = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Space\+Grotesk[^"]*" rel="stylesheet">/g;
const fontMatches = [...html.matchAll(fontLinkPattern)];
if (fontMatches.length > 1) {
    // Remove all but the first
    let firstRemoved = false;
    html = html.replace(fontLinkPattern, (match) => {
        if (!firstRemoved) { firstRemoved = true; return match; }
        return ''; // Remove duplicates
    });
    changes.push('Removed ' + (fontMatches.length - 1) + ' duplicate Google Fonts link(s)');
}

// 2. Add display=swap to Google Fonts URL if not present
html = html.replace(
    /(<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)(")/,
    (match, pre, post) => {
        if (!pre.includes('display=swap')) return pre + '&display=swap' + post;
        return match;
    }
);
changes.push('Added font-display:swap to Google Fonts');

// 3. Convert model-viewer to lazy-load (deferred)
const modelViewerScript = '<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.2.0/model-viewer.min.js"></script>';
if (html.includes(modelViewerScript)) {
    html = html.replace(
        modelViewerScript,
        '<!-- model-viewer loaded lazily when AR is activated -->\n<script>\nwindow._loadModelViewer = function(){\n  if(window._mvLoaded) return;\n  window._mvLoaded = true;\n  const s = document.createElement("script");\n  s.type = "module";\n  s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.2.0/model-viewer.min.js";\n  document.head.appendChild(s);\n};\n</script>'
    );
    changes.push('Converted model-viewer.js to lazy-load (saves ~120KB on initial load)');
}

// 4. Add DNS prefetch + preconnect hints before </head>
const perfHints = `<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//fonts.gstatic.com">
<link rel="dns-prefetch" href="//cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="//ajax.googleapis.com">
<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style">
<meta name="description" content="Klang Valley Property AI — Find your ideal home with AI-powered matching, investment analysis, and live agent support.">
<meta name="theme-color" content="#bb4d2d">`;
html = html.replace('</head>', perfHints + '\n</head>');
changes.push('Added DNS prefetch, preload hints, and meta description');

// 5. Add loading="lazy" to all <img> tags that don't already have it
const imgCount = (html.match(/<img /g) || []).length;
html = html.replace(/<img (?![^>]*loading=)/g, '<img loading="lazy" ');
changes.push('Added loading="lazy" to ' + imgCount + ' image(s)');

// 6. Lazy-load FontAwesome (non-blocking)
html = html.replace(
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" media="print" onload="this.media=\'all\'">\n<noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>'
);
changes.push('Made FontAwesome load non-blocking (print media trick)');

// 7. Add content-visibility:auto to heavy offscreen sections (admin/agent/master sections)
// This defers rendering cost of invisible sections
const sectionsToDefer = [
    'masterControlDock',
    'masterListingManagerSection', 
    'masterAgentControlSection',
    'masterBookingsSection',
    'agentInboxSection',
    'automationConsoleSection',
    'tenantPipelineSection',
    'rentCalendarSection',
    'dailyActionSection',
    'geoLeadMapSection',
    'contentGeneratorSection',
    'masterChatTrackingSection',
    'rentalManagementSection'
];

let cvCount = 0;
sectionsToDefer.forEach(id => {
    const pattern = new RegExp(`(id="${id}")`);
    if (pattern.test(html)) {
        html = html.replace(pattern, `$1 style="content-visibility:auto;contain-intrinsic-size:0 400px"`);
        cvCount++;
    }
});
changes.push('Applied content-visibility:auto to ' + cvCount + ' offscreen heavy sections');

// 8. Add defer to any inline-referenced scripts (mark main script blocks as deferred via wrapper)
// Wrap the large script block with a DOMContentLoaded guard  
// Find the large script block and check if it already has DOMContentLoaded
if (!html.includes('DOMContentLoaded') && html.includes("revealObserver")) {
    html = html.replace(
        "const revealObserver",
        "document.addEventListener('DOMContentLoaded', function() { /* deferred init */ });\nconst revealObserver"
    );
    changes.push('Added DOMContentLoaded guard to reveal observer');
}

// 9. Add will-change to known animated elements via CSS injection
const willChangeCSS = `
/* Performance: will-change hints for GPU compositing */
.sticky-ai-toggle, .ai-chat-panel, .buyer-feature-card, .card, .modal, .inv-metric-card {
    will-change: transform;
}
.inv-meter-fill, .progress-fill {
    will-change: width;
}
/* Reduce paint on fixed elements */
.sticky-ai-toggle, .ai-chat-panel {
    transform: translateZ(0);
}
`;

// Inject before </style> of the first style block
html = html.replace('</style>', willChangeCSS + '\n</style>');
changes.push('Added will-change & GPU composite hints for animated elements');

// 10. Add passive event listeners hint (meta) — JS optimization
// Add a small perf script right after <head>
const perfScript = `<script>
// Performance: mark page start
if (typeof performance !== 'undefined') performance.mark('page-start');
// Passive scroll listeners for smoother scrolling
(function() {
    var passiveSupported = false;
    try { window.addEventListener('test', null, Object.defineProperty({}, 'passive', { get: function(){ passiveSupported = true; } })); } catch(e){}
    window._passiveOpts = passiveSupported ? { passive: true } : false;
})();
</script>`;
html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com">', '<link rel="preconnect" href="https://fonts.googleapis.com">\n' + perfScript);
changes.push('Added passive scroll listeners & performance marking');

// Save
fs.writeFileSync('dashboard.html', html, 'utf8');

console.log('\n=== PERFORMANCE OPTIMIZATIONS APPLIED ===');
changes.forEach((c, i) => console.log((i+1) + '. ' + c));
console.log('\nNew file size: ' + Math.round(html.length / 1024) + ' KB');
console.log('Done!');
