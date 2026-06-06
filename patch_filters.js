const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

const oldFiltered = /function filtered\(\)\{.*?return list\}/s;
const newFiltered = `function filtered() {
    let s = "";
    const omni = document.getElementById("aiOmnibarInput");
    if(omni) s = omni.value.trim().toLowerCase();
    
    let list = properties.filter(p => {
        const text = \`\${p.title} \${p.location} \${p.area} \${p.vibe} \${p.fit}\`.toLowerCase();
        let ok = !s || text.includes(s) || s.split(' ').some(word => word.length > 3 && text.includes(word));
        if(activeTag !== "all") ok &&= p.tags.includes(activeTag);
        return ok;
    });
    
    list.sort((a,b) => b.aiScore - a.aiScore);
    return list;
}`;

if(oldFiltered.test(html)) {
    html = html.replace(oldFiltered, newFiltered);
    fs.writeFileSync('dashboard.html', html, 'utf8');
    console.log("Safely bypassed old filter logic. Generative AI filtering active.");
} else {
    console.log("Could not find filtered function.");
}
