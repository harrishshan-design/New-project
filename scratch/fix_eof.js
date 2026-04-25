const fs = require('fs');
const path = require('path');

// Append a closing brace to user.js
const filePath = path.join(__dirname, '../js/user.js');
let content = fs.readFileSync(filePath, 'utf8');
content = content.trimEnd() + '\n}\n';
fs.writeFileSync(filePath, content, 'utf8');
console.log('Added closing brace. Checking syntax...');

const { execSync } = require('child_process');
try {
    execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
    console.log('user.js: OK');
} catch(e) {
    console.log('Still error:', e.stderr.toString().substring(0, 300));
    // If it fails now check the count
    const src = fs.readFileSync(filePath, 'utf8');
    let open = 0, close = 0;
    for (const c of src) {
        if (c === '{') open++;
        else if (c === '}') close++;
    }
    console.log(`Open braces: ${open}, Close braces: ${close}, Diff: ${open - close}`);
}
