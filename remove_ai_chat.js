const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the sticky AI toggle CSS block
const cssEndPattern = '@media (max-width: 600px) { .ai-chat-panel { width: 100%; } }';
const idxCssOut = content.lastIndexOf('.sticky-ai-toggle { position: fixed;');
if (idxCssOut !== -1) {
    const endCss = content.indexOf(cssEndPattern) + cssEndPattern.length;
    if (endCss > idxCssOut) {
        content = content.slice(0, idxCssOut) + content.slice(endCss);
    }
}
// Strip the updated large CSS block as well if present
const pulseGlowIdx = content.indexOf('@keyframes pulseGlow');
if (pulseGlowIdx !== -1) {
    const endCss = content.indexOf('</style>', pulseGlowIdx);
    if (endCss > pulseGlowIdx) {
        content = content.slice(0, pulseGlowIdx) + content.slice(endCss);
    }
}

// 2. Remove the AI Chat HTML block
const htmlStart = '<!-- 🤖 AI CHAT SYSTEM -->';
const htmlEnd = '</aside>';
const idxHtml = content.indexOf(htmlStart);
if (idxHtml !== -1) {
    const endHtml = content.indexOf(htmlEnd, idxHtml) + htmlEnd.length;
    content = content.slice(0, idxHtml) + content.slice(endHtml);
}

// 3. Remove the AI Chat JS Logic
const jsStart = '// ==========================================';
const jsEndStr = 'body.scrollTop = body.scrollHeight;\\n}';
const idxJs = content.indexOf(jsStart);
if (idxJs !== -1) {
    const endJs = content.indexOf(jsEndStr, idxJs) + jsEndStr.length;
    content = content.slice(0, idxJs) + content.slice(endJs);
}

// 4. Re-hide the admin/role panels
const showPattern1 = '/* Role hiding disabled by user request */\\n/* .admin-panel,.agent-only,.chat-only,.admin-only,.staff-only,.user-only{display:none} */\\n.admin-panel,.agent-only,.chat-only,.admin-only,.staff-only,.user-only{display:block;}';
content = content.replace(showPattern1, '.admin-panel,.agent-only,.chat-only,.admin-only,.staff-only,.user-only{display:none}');

const showPattern2 = '/* body:not(.master) #modalEditWrap{display:none} */';
content = content.replace(showPattern2, 'body:not(.master) #modalEditWrap{display:none}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Ask Property AI has been totally stripped and roles are acting normal again!');
