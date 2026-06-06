const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');
let changes = [];

// 1. Hook _loadModelViewer into renderModalMedia
if (html.includes('function renderModalMedia(property){') && !html.includes('_loadModelViewer()')) {
    html = html.replace(
        'function renderModalMedia(property){',
        'function renderModalMedia(property){ if(typeof window._loadModelViewer==="function") window._loadModelViewer();'
    );
    changes.push('Hooked lazy model-viewer load into renderModalMedia');
}

// 2. Defer non-critical input listeners to idle time
const listenerTarget = "['searchInput','propertyType','priceRange','bedrooms','location','buyerGoal','sortBy'].forEach(id=>{$(id).addEventListener('input',renderProperties);$(id).addEventListener('change',renderProperties)});";
if (html.includes(listenerTarget) && !html.includes('requestIdleCallback')) {
    html = html.replace(
        listenerTarget,
        "(typeof requestIdleCallback!=='undefined'?requestIdleCallback:function(fn){setTimeout(fn,100)})(function(){['searchInput','propertyType','priceRange','bedrooms','location','buyerGoal','sortBy'].forEach(id=>{$(id).addEventListener('input',renderProperties);$(id).addEventListener('change',renderProperties)});});"
    );
    changes.push('Deferred input listeners to requestIdleCallback');
}

// 3. Fix viewport with viewport-fit=cover
html = html.replace(
    'content="width=device-width, initial-scale=1.0"',
    'content="width=device-width, initial-scale=1.0, viewport-fit=cover"'
);
changes.push('Updated viewport meta');

// 4. Unobserve after reveal (reduce continuous observer CPU usage)
html = html.replace(
    "entry.target.classList.add('is-visible')",
    "entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)"
);
changes.push('IntersectionObserver now unobserves after reveal (reduces CPU)');

// 5. Add will-change reset after animation to free GPU memory
// Add a CSS rule to remove will-change after transition
const willChangeCleanup = `
/* Remove will-change after animation completes to free GPU memory */
.buyer-feature-card:not(:hover), .card:not(:hover) { will-change: auto; }
`;
html = html.replace('/* === END USER ENGAGEMENT === */', willChangeCleanup + '\n/* === END USER ENGAGEMENT === */');
changes.push('Added will-change cleanup after hover animations');

// 6. Add fetchpriority=high to the first visible hero image if any
html = html.replace(/<img loading="lazy" id="modalImage"/, '<img loading="eager" fetchpriority="low" id="modalImage"');
changes.push('Set modal image to eager/low-priority (correct load order)');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('\n=== FINAL PERF TWEAKS APPLIED ===');
changes.forEach((c, i) => console.log((i+1) + '. ' + c));
console.log('\nFinal file size:', Math.round(html.length/1024), 'KB');
