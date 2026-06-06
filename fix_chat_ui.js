const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the chat system from inside the javascript export function
const chatSystemBlockStart = content.indexOf('<!-- 🤖 AI CHAT SYSTEM -->');
const chatSystemBlockEnd = content.indexOf('</body></html>`);reportWindow.document.close();');

if (chatSystemBlockStart > -1 && chatSystemBlockEnd > -1) {
    const extractedHTML = content.substring(chatSystemBlockStart, chatSystemBlockEnd);
    
    // Remove it from the JS string and just keep </body>
    content = content.slice(0, chatSystemBlockStart) + '</body>' + content.slice(chatSystemBlockEnd + 7); // keep </html>`);
    
    // Now insert it at the VERY end, right before the FINAL </body>
    const finalBodyPos = content.lastIndexOf('</body>');
    content = content.slice(0, finalBodyPos) + extractedHTML + '\\n</body>' + content.slice(finalBodyPos + 7);
}

// 2. Make it bigger 75px
const oldStyles = `.sticky-ai-toggle { position: fixed; bottom: 30px; right: 30px; background: linear-gradient(135deg, var(--brand), var(--brand-dark)); color: white; border: none; padding: 0; width: 64px; height: 64px; border-radius: 50%; font-size: 1.6rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(187,77,45,0.4); cursor: pointer; z-index: 90; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }`;
const newStyles = `.sticky-ai-toggle { position: fixed; bottom: 30px; right: 30px; background: linear-gradient(135deg, var(--brand), var(--brand-dark)); color: white; border: none; padding: 0; width: 75px; height: 75px; border-radius: 50%; font-size: 2.1rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 40px rgba(187,77,45,0.6); cursor: pointer; z-index: 90; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(187,77,45,0.7); } 70% { box-shadow: 0 0 0 15px rgba(187,77,45,0); } 100% { box-shadow: 0 0 0 0 rgba(187,77,45,0); } }
.sticky-ai-toggle { animation: pulseGlow 2s infinite; }
`;
content = content.replace(oldStyles, newStyles);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed chat placement and increased float size!');
