const fs = require('fs');
const content = fs.readFileSync('dashboard.html', 'utf8');

const htmlBlock = `
<!-- 🤖 AI CHAT SYSTEM -->
<button class="sticky-ai-toggle" onclick="toggleAIChat()" title="Ask Property AI">
    <i class="fas fa-home"></i>
</button>

<aside class="ai-chat-panel" id="aiChatPanel">
    <div class="ai-chat-header">
        <div>
            <div class="brand-mark" style="width:36px; height:36px; border-radius:10px;"><i class="fas fa-home" style="font-size: 1rem;"></i></div>
            <h3>Property AI <span style="font-size: 0.7rem; background: var(--brand-soft); color: var(--brand-dark); padding: 2px 6px; border-radius: 4px;">LIVE</span></h3>
        </div>
        <button onclick="toggleAIChat()"><i class="fas fa-times"></i></button>
    </div>
    <div class="ai-chat-body" id="aiChatBody">
        <div class="chat-bubble ai">
            <strong>Hi there! 🏡✨</strong><br>
            I'm your friendly Property Guide! I'd love to help you figure out affordability, check out neighborhoods, or compare homes. How can I help make your home journey wonderful today? 😊
        </div>
    </div>
    <div class="chat-prompts">
        <button class="chat-prompt-chip" onclick="quickSendChat('Can I afford this?')">Can I afford this?</button>
        <button class="chat-prompt-chip" onclick="quickSendChat('Is this area good?')">Is this area good?</button>
        <button class="chat-prompt-chip" onclick="quickSendChat('Compare my saved items')">Compare my saved items</button>
    </div>
    <div class="ai-chat-input-area">
        <input type="text" id="aiChatInput" placeholder="Ask anything..." onkeypress="handleChatEnter(event)">
        <button onclick="submitUserChat()"><i class="fas fa-paper-plane"></i></button>
    </div>
</aside>
`;

const cssBlock = `
.sticky-ai-toggle { position: fixed; bottom: 30px; right: 30px; background: linear-gradient(135deg, var(--brand), var(--brand-dark)); color: white; border: none; padding: 0; width: 75px; height: 75px; border-radius: 50%; font-size: 2.1rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 40px rgba(187,77,45,0.6); cursor: pointer; z-index: 1000; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); animation: pulseGlow 2s infinite; }
.sticky-ai-toggle:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 16px 40px rgba(187,77,45,0.4); }
@keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(187,77,45,0.7); } 70% { box-shadow: 0 0 0 15px rgba(187,77,45,0); } 100% { box-shadow: 0 0 0 0 rgba(187,77,45,0); } }

.ai-chat-panel { position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: rgba(255,250,245,0.95); backdrop-filter: blur(24px); border-left: 1px solid rgba(255,255,255,0.8); z-index: 1100; transform: translateX(100%); transition: 0.4s cubic-bezier(0.25, 1, 0.5, 1); display: flex; flex-direction: column; box-shadow: -10px 0 40px rgba(0,0,0,0.08); }
.ai-chat-panel.open { transform: translateX(0); }
.ai-chat-header { padding: 20px 24px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; background: white; }
.ai-chat-header div { display: flex; align-items: center; gap: 12px; }
.ai-chat-header h3 { margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; color: var(--ink); }
.ai-chat-header button { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: var(--muted); }
.ai-chat-body { flex-grow: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth; }
.chat-bubble { max-width: 85%; padding: 14px 18px; border-radius: 20px; font-size: 0.95rem; line-height: 1.5; animation: popUp 0.3s ease; }
.chat-bubble.ai { align-self: flex-start; background: white; border: 1px solid var(--brand-soft); color: var(--ink); box-shadow: 0 4px 12px rgba(187,77,45,0.05); border-top-left-radius: 4px; }
.chat-bubble.user { align-self: flex-end; background: var(--brand); color: white; border-top-right-radius: 4px; }
.chat-prompts { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px 24px; background: rgba(255,255,255,0.5); border-top: 1px solid var(--line); }
.chat-prompt-chip { background: var(--bg); border: 1px solid var(--brand-soft); color: var(--brand-dark); font-size: 0.8rem; font-weight: 700; padding: 6px 12px; border-radius: 20px; cursor: pointer; transition: 0.2s; }
.chat-prompt-chip:hover { background: var(--brand-soft); }
.ai-chat-input-area { padding: 16px 24px 24px; background: white; border-top: 1px solid var(--line); display: flex; gap: 10px; }
.ai-chat-input-area input { flex-grow: 1; padding: 12px 16px; border: 1px solid var(--line); border-radius: 999px; background: var(--bg); font-family: inherit; font-size: 0.95rem; outline: none; }
.ai-chat-input-area button { width: 44px; height: 44px; border-radius: 50%; background: var(--brand); color: white; border: none; cursor: pointer; display: grid; place-items: center; transition: 0.2s; }
.ai-chat-input-area button:hover { background: var(--brand-dark); transform: scale(1.05); }
@keyframes popUp { 0% { opacity: 0; transform: translateY(10px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
@media (max-width: 600px) { .ai-chat-panel { width: 100%; } }
`;

let result = content;
const lastBodyIndex = result.lastIndexOf('</body>');
if (lastBodyIndex !== -1) {
    result = result.slice(0, lastBodyIndex) + htmlBlock + '\\n</body>' + result.slice(lastBodyIndex + 7);
}

const lastStyleIndex = result.lastIndexOf('</style>');
if (lastStyleIndex !== -1) {
    result = result.slice(0, lastStyleIndex) + cssBlock + '\\n</style>' + result.slice(lastStyleIndex + 8);
}

fs.writeFileSync('dashboard.html', result, 'utf8');
console.log('Successfully injected floating Ask AI Chat securely!');
