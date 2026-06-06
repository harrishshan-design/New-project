const fs = require('fs');
const src = fs.readFileSync('../js/user.js', 'utf8');
let b = 0;
let inString = false;
let stringChar = '';
let inTemplateLiteral = 0; // depth for template literals
let i = 0;
while (i < src.length) {
    const c = src[i];
    if (!inString) {
        if (c === '{') b++;
        else if (c === '}') {
            b--;
            if (b < 0) {
                console.log('Unmatched } at char', i, 'line ~' + src.substring(0, i).split('\n').length);
                b = 0;
            }
        }
    }
    i++;
}
console.log('Final brace count (open - close):', b, b > 0 ? '→ UNCLOSED BRACE(s)' : '→ Balanced');
