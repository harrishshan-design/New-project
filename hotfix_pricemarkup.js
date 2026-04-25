const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// Fix the undefined ReferenceError causing properties to disappear
html = html.replace(/\$\{priceMarkup \|\| /g, '${(typeof priceMarkup !== "undefined" && priceMarkup) || ');

fs.writeFileSync('dashboard.html', html, 'utf8');
console.log("Hotfixed the undefined reference error for priceMarkup!");
