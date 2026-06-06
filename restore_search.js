const fs = require('fs');

let html = fs.readFileSync('dashboard.html', 'utf8');

// Restore the original event listeners for the traditional search boxes so the user can search again
const brokenListenersComment = /\/\* AI Omnibar replaces traditional listeners \*\//g;
html = html.replace(brokenListenersComment, "['searchInput','propertyType','priceRange','bedrooms','location','buyerGoal','sortBy'].forEach(id=>{const el=$(id); if(el){el.addEventListener('input',renderProperties);el.addEventListener('change',renderProperties);}})");

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Restored traditional search listeners safely!');
