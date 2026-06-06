const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the broken injected JS block from the top of the file.
// The broken insertion replaced the </script> of model-viewer.
const startMarker = '// AI CHAT LOGIC';
const endRegex = /function appendChatMessage\\(html, role\\) \\{[^}]+\\}\\nbody\\.scrollTop = body\\.scrollHeight;\\n\\}/;

const startIndex = content.indexOf(startMarker);
const match = endRegex.exec(content);

if (startIndex > -1 && match) {
    const endIndex = match.index + match[0].length;
    // We remove it from the top and replace with the missing `</script>` that got overwritten originally.
    content = content.slice(0, startIndex) + '</script>' + content.slice(endIndex);
}

// 2. Prepare the new, FIXED AI CHAT LOGIC
const newJsBlock = `
// ==========================================
// 🤖 AI CHAT LOGIC (Fully CRM-Connected)
// ==========================================
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
        
        // Smart Contextual Overrides
        if(lower.includes("afford") || lower.includes("budget")) {
            response = "<strong>Let's check your budget! 🏦</strong><br>For a lovely RM 500k home, you'll generally want a combined net income around RM 4,500/month (assuming you don't have too many other loans). It's totally doable! Would you like me to open the calculator so we can crunch the exact numbers together? 💕";
        } else if(lower.includes("area") || lower.includes("good") || lower.includes("hotspot")) {
            response = "<strong>Great question! 🌟</strong><br>Areas like Mont Kiara and Bukit Jalil are super popular right now! They're growing at about 6.5% a year thanks to amazing new transit spots. They are perfect places to nest, and if you ever want to sell later, plenty of people will want to buy! Do you have a favorite spot in mind? 🏡";
        } else if(lower.includes("compare") || lower.includes("saved items")) {
            if(typeof savedIds !== "undefined" && savedIds.length > 0) {
                response = \`<strong>Let's compare! ✨</strong><br>I see you've saved \${savedIds.length} wonderful homes! Most of these have a great yield profile over 4.5%, meaning they make fantastic investments alongside being great places to live. I think you've got amazing taste! 🥰\`;
            } else {
                response = "Oh! 🙈 It looks like you haven't saved any 'Future Homes' just yet! Try tapping the heart icon on a few properties you love, and I'll jump right in to help you compare them! ❤️";
            }
        } else {
            // FALLBACK TO MAIN DASHBOARD ASSISTANT LOGIC IF IT EXISTS
            if(typeof chatbotReply === "function") {
                response = "<strong>Here's what I found! ✨</strong><br>" + chatbotReply(text);
            } else {
                response = "Ooh, that's such a great thought! 🌸 Since I have all the latest numbers for KV right here, I can help you check prices, growth, or area vibes instantly. What else are you wondering about? 😊";
            }
        }
        
        appendChatMessage(response, "ai");
        
        // 💾 SAVE TO MASTER CRM DATABASE SO AGENTS CAN SEE IT
        if (typeof writeLocalChats === "function" && typeof readLocalChats === "function") {
            const entry = {
                id: Date.now(),
                username: typeof sessionName !== "undefined" ? sessionName : "User",
                role: typeof sessionRole !== "undefined" ? sessionRole : "user",
                message: text,
                reply: response,
                createdAt: new Date().toISOString()
            };
            writeLocalChats([...readLocalChats(), entry]);
            
            // Re-render chat history in the dashboard if available
            if (typeof renderChatHistory === "function") renderChatHistory();
        }
        
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
`;

// Insert the new JS logic right before the FINAL </script>
const lastScriptEndPos = content.lastIndexOf('</script>');
if (lastScriptEndPos > -1) {
    content = content.slice(0, lastScriptEndPos) + newJsBlock + '\\n</script>' + content.slice(lastScriptEndPos + 9);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully migrated chat JS and connected it to the CRM pipeline!");
