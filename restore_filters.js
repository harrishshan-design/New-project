const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

const oldFiltered = /function filtered\(\) \{[\s\S]*?return list;\s*\}/s;
const originalFiltered = `function filtered(){
    const s = $("searchInput") ? $("searchInput").value.trim().toLowerCase() : "";
    const type = $("propertyType") ? $("propertyType").value : "all";
    const price = $("priceRange") ? $("priceRange").value : "all";
    const beds = $("bedrooms") ? $("bedrooms").value : "all";
    const loc = $("location") ? $("location").value : "all";
    const goal = $("buyerGoal") ? $("buyerGoal").value : "all";
    const sort = $("sortBy") ? $("sortBy").value : "score";
    
    let list = properties.filter(p => {
        const text = \`\${p.title} \${p.location} \${p.area} \${p.vibe} \${p.fit}\`.toLowerCase();
        let ok = !s || text.includes(s);
        ok &&= type === "all" || p.type === type;
        ok &&= beds === "all" || p.bedrooms >= (+beds);
        if(price === "0-800k") ok &&= p.price < 800000;
        if(price === "800k-1.2m") ok &&= p.price >= 800000 && p.price <= 1200000;
        if(price === "1.2m-2m") ok &&= p.price > 1200000 && p.price <= 2000000;
        if(price === "2m+") ok &&= p.price > 2000000;
        
        if(loc === "kuala lumpur") ok &&= (p.location.toLowerCase().includes("kuala lumpur") || p.area === "KLCC");
        if(loc === "petaling jaya") ok &&= (p.location.toLowerCase().includes("petaling jaya") || p.area === "SS2");
        if(loc === "selangor") ok &&= (p.location.toLowerCase().includes("selangor") || p.location.toLowerCase().includes("puchong"));
        if(loc === "city-core") ok &&= ["KLCC", "Bangsar", "Mont Kiara"].includes(p.area);
        if(loc === "family-township") ok &&= (["Desa ParkCity", "Bandar Utama", "Bandar Kinrara", "Cheras"].includes(p.area) || p.tags.includes("family"));
        
        if(activeTag !== "all") ok &&= p.tags.includes(activeTag);
        
        if(goal === "investor") ok &&= (p.yield >= 4 || p.tags.includes("yield"));
        if(goal === "family") ok &&= (p.tags.includes("family") && p.bedrooms >= 3);
        if(goal === "luxury") ok &&= (p.tags.includes("luxury") || p.psf >= 1200);
        
        return ok;
    });

    list.sort((a,b) => sort === "priceAsc" ? a.price - b.price : sort === "priceDesc" ? b.price - a.price : sort === "yield" ? b.yield - a.yield : sort === "growth" ? b.growth - a.growth : b.aiScore - a.aiScore);
    return list;
}`;

html = html.replace(oldFiltered, originalFiltered);
fs.writeFileSync('dashboard.html', html, 'utf8');
console.log('Restored the original filter function explicitly.');
