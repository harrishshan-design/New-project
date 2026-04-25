const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// The line is: ['searchInput','propertyType','priceRange','bedrooms','location','buyerGoal','sortBy'].forEach(id=>{$(id).addEventListener('input',renderProperties);$(id).addEventListener('change',renderProperties)});
const eventListenersRegex = /\['searchInput','propertyType','priceRange','bedrooms','location','buyerGoal','sortBy'\]\.forEach.*?\}\);/g;
html = html.replace(eventListenersRegex, "/* AI Omnibar replaces traditional listeners */");

// Also remove: $("searchInput").addEventListener('keypress',e=>{if(e.key==='Enter')renderProperties()});
html = html.replace(/\$\("searchInput"\)\.addEventListener\('keypress'.*?\);/g, "");

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log("Successfully removed old event listeners that cause null reference errors.");
