const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixFile(fileName) {
    const filePath = path.join(__dirname, '../js', fileName);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check current syntax
    let attempts = 0;
    while (attempts < 3) {
        try {
            execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
            console.log(`${fileName}: OK`);
            return;
        } catch(e) {
            const errMsg = e.stderr.toString();
            const lineMatch = errMsg.match(/:(\d+)\n/);
            const lineNum = lineMatch ? parseInt(lineMatch[1]) : 0;
            console.log(`${fileName}: Error at line ${lineNum}: ${errMsg.substring(0, 120)}`);
            
            if (errMsg.includes('Unexpected end of input')) {
                content = content.trimEnd() + '\n}\n';
                fs.writeFileSync(filePath, content, 'utf8');
                content = fs.readFileSync(filePath, 'utf8');
                console.log(`Added closing brace to ${fileName}`);
            } else if (errMsg.includes("Unexpected token ')'")) {
                // Extra closing parenthesis somewhere ─ try to find and remove it
                // Look at offending line
                const lines = content.split('\n');
                console.log(`Line ${lineNum}: ${lines[lineNum-1].substring(0, 200)}`);
                break;
            } else {
                break;
            }
        }
        attempts++;
    }
}

fixFile('agent.js');
fixFile('master.js');
