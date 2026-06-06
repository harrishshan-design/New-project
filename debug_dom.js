const fs = require('fs');

const content = fs.readFileSync('dashboard.html', 'utf8');
const jsParts = content.split('<script>');
if (jsParts.length < 2) {
    console.log("No scripts found");
    process.exit(1);
}

// Extract all scripts
let jsCode = '';
for(let i = 1; i < jsParts.length; i++) {
    jsCode += jsParts[i].split('</script>')[0] + '\\n';
}

// We will mock the environment
const mockEnv = `
const localStorage = { 
    getItem: (key) => null, 
    setItem: () => {} 
};
const document = { 
    getElementById: (id) => ({ innerHTML: '', classList: { add:()=>{}, remove:()=>{} }, style: {} }),
    querySelectorAll: () => [],
    querySelector: () => ({ classList: { toggle:()=>{} }})
};
const window = { open: () => {} };
function alert(x) { console.log("Alert:", x); }

const getElementById = document.getElementById;
`;

try {
    const sandbox = mockEnv + jsCode;
    // We execute it in the global scope 
    eval(sandbox);
    console.log("Script executed perfectly without errors in MOCK DOM.");
} catch(e) {
    console.log("Crash Error: " + e.stack);
}
