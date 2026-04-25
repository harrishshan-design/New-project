const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject CSS
const styleBlock = `
/* 🤖 ASK PROPERTY AI CHAT */
.sticky-ai-toggle { position: fixed; bottom: 30px; right: 30px; background: linear-gradient(135deg, var(--brand), var(--brand-dark)); color: white; border: none; padding: 14px 24px; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; font-weight: 700; box-shadow: 0 12px 30px rgba(187,77,45,0.3); cursor: pointer; display: flex; align-items: center; gap: 10px; z-index: 90; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.sticky-ai-toggle:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 16px 40px rgba(187,77,45,0.4); }
.ai-chat-panel { position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: rgba(255,250,245,0.95); backdrop-filter: blur(24px); border-left: 1px solid rgba(255,255,255,0.8); z-index: 100; transform: translateX(100%); transition: 0.4s cubic-bezier(0.25, 1, 0.5, 1); display: flex; flex-direction: column; box-shadow: -10px 0 40px rgba(0,0,0,0.08); }
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
</style>`;
content = content.replace(/<\/style>/, styleBlock);

// 2. Inject HTML before </body>
const htmlBlock = `
<!-- 🤖 AI CHAT SYSTEM -->
<button class="sticky-ai-toggle user-only" onclick="toggleAIChat()">
    <i class="fas fa-robot"></i> Ask Property AI
</button>

<aside class="ai-chat-panel user-only" id="aiChatPanel">
    <div class="ai-chat-header">
        <div>
            <div class="brand-mark" style="width:36px; height:36px; border-radius:10px;"><i class="fas fa-robot" style="font-size: 1rem;"></i></div>
            <h3>Property AI <span style="font-size: 0.7rem; background: var(--brand-soft); color: var(--brand-dark); padding: 2px 6px; border-radius: 4px;">LIVE</span></h3>
        </div>
        <button onclick="toggleAIChat()"><i class="fas fa-times"></i></button>
    </div>
    <div class="ai-chat-body" id="aiChatBody">
        <div class="chat-bubble ai">
            <strong>Hi, I'm your AI Analyst.</strong><br>
            I can calculate affordability, analyze area trends, and compare properties instantly. What do you need help with?
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

</body>`;
content = content.replace(/<\/body>/, htmlBlock);

// 3. Inject Javascript logic
const jsBlock = `
// AI CHAT LOGIC
function toggleAIChat() {
    const p = $("aiChatPanel");
    if(p) p.classList.toggle("open");
}

function quickSendChat(text) {
    if(!$("aiChatInput")) return;
    $("aiChatInput").value = text;
    submitUserChat();
}

function handleChatEnter(e) {
    if(e.key === "Enter") submitUserChat();
}

function submitUserChat() {
    const input = $("aiChatInput");
    const text = (input.value || "").trim();
    if(!text) return;
    
    appendChatMessage(text, "user");
    input.value = "";
    
    // Simulate AI thinking delay
    setTimeout(() => {
        let response = "";
        const lower = text.toLowerCase();
        
        if(lower.includes("afford")) {
            response = "<strong>Affordability Check:</strong> Based on general DSR logic, a home around RM 500,000 requires a combined net income of roughly RM 4,500/month (assuming minimal other debts). Should I open the calculator for a precise breakdown?";
        } else if(lower.includes("area") || lower.includes("good")) {
            response = "<strong>Area Insight:</strong> Areas like Mont Kiara and Bukit Jalil are currently screening 'Hot' with a projected 6.5% YoY growth due to nearby transit upgrades. They are highly liquid if you're looking for an exit strategy.";
        } else if(lower.includes("compare")) {
            if(savedIds.length > 0) {
                response = \`<strong>Comparison:</strong> You have \${savedIds.length} properties saved. Generally, the yield profiles in your saved list average above 4.5%, meaning they lean slightly towards Investor strength over pure lifestyle parameters.\`;
            } else {
                response = "You don't have any saved properties yet! Try saving a few 'Future Homes' to your list, and I'll analyze how they stack up against each other.";
            }
        } else {
            response = "That's an interesting point! Since I'm integrated directly into the KL market data, I can pull pricing trends, calculate yields, or summarize a property for you instantly. Just ask!";
        }
        
        appendChatMessage(response, "ai");
    }, 600);
}

function appendChatMessage(html, role) {
    const body = $("aiChatBody");
    if(!body) return;
    const div = document.createElement("div");
    div.className = "chat-bubble " + role;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}
</script>`;
content = content.replace(/<\/script>/, jsBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected Ask Property AI Chat System!');
