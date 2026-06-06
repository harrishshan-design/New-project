const fs = require('fs');
const lines = fs.readFileSync('dashboard.html', 'utf8').split('\n');
let inAgent = false;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('class="panel glass agent-only') || lines[i].includes('admin-only')) {
      console.log((i+1) + ': ' + lines[i].trim().substring(0, 150));
      for (let j = 1; j < 5; j++) {
         console.log('   ' + lines[i+j].trim().substring(0, 150));
      }
   }
}
