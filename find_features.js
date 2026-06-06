const fs=require('fs');
const html=fs.readFileSync('dashboard.html','utf8');
const lines=html.split('\\n');
lines.forEach((line, i) => {
    if(line.includes('id="') && (line.toLowerCase().includes('vault') || line.toLowerCase().includes('feature') || line.toLowerCase().includes('cockpit'))) {
        console.log(i + ': ' + line.trim().substring(0, 80));
    }
});
