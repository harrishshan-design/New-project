const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Change the button HTML
const oldBtn = `<button class="sticky-ai-toggle user-only" onclick="toggleAIChat()">
    <i class="fas fa-robot"></i> Ask Property AI
</button>`;
const newBtn = `<button class="sticky-ai-toggle user-only" onclick="toggleAIChat()" title="Ask Property AI">
    <i class="fas fa-home"></i>
</button>`;
content = content.replace(oldBtn, newBtn);


// 2. Adjust CSS for the round floating home icon replacing the pill
const oldStyles = `.sticky-ai-toggle { position: fixed; bottom: 30px; right: 30px; background: linear-gradient(135deg, var(--brand), var(--brand-dark)); color: white; border: none; padding: 14px 24px; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; font-weight: 700; box-shadow: 0 12px 30px rgba(187,77,45,0.3); cursor: pointer; display: flex; align-items: center; gap: 10px; z-index: 90; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }`;
const newStyles = `.sticky-ai-toggle { position: fixed; bottom: 30px; right: 30px; background: linear-gradient(135deg, var(--brand), var(--brand-dark)); color: white; border: none; padding: 0; width: 64px; height: 64px; border-radius: 50%; font-size: 1.6rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(187,77,45,0.4); cursor: pointer; z-index: 90; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }`;
content = content.replace(oldStyles, newStyles);


// 3. Change Initial Chat HTML message
const oldChatInit = `<div class="chat-bubble ai">
            <strong>Hi, I'm your AI Analyst.</strong><br>
            I can calculate affordability, analyze area trends, and compare properties instantly. What do you need help with?
        </div>`;
const newChatInit = `<div class="chat-bubble ai">
            <strong>Hi there! 🏡✨</strong><br>
            I'm your friendly Property Guide! I'd love to help you figure out affordability, check out neighborhoods, or compare homes. How can I help make your home journey wonderful today? 😊
        </div>`;
content = content.replace(oldChatInit, newChatInit);

// Also change the panel header to a home icon just for consistency
content = content.replace(
    `<div class="brand-mark" style="width:36px; height:36px; border-radius:10px;"><i class="fas fa-robot" style="font-size: 1rem;"></i></div>`,
    `<div class="brand-mark" style="width:36px; height:36px; border-radius:10px;"><i class="fas fa-home" style="font-size: 1rem;"></i></div>`
);


// 4. Change JavaScript AI logic string (Friendly Tone)
const jsBefore = `if(lower.includes("afford")) {
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
        }`;

const jsAfter = `if(lower.includes("afford")) {
            response = "<strong>Let's check your budget! 🏦</strong><br>For a lovely RM 500k home, you'll generally want a combined net income around RM 4,500/month (assuming you don't have too many other loans). It's totally doable! Would you like me to open the calculator so we can crunch the exact numbers together? 💕";
        } else if(lower.includes("area") || lower.includes("good")) {
            response = "<strong>Great question! 🌟</strong><br>Areas like Mont Kiara and Bukit Jalil are super popular right now! They're growing at about 6.5% a year thanks to amazing new transit spots. They are perfect places to nest, and if you ever want to sell later, plenty of people will want to buy! Do you have a favorite spot in mind? 🏡";
        } else if(lower.includes("compare")) {
            if(savedIds.length > 0) {
                response = \`<strong>Let's compare! ✨</strong><br>I see you've saved \${savedIds.length} wonderful homes! Most of these have a great yield profile over 4.5%, meaning they make fantastic investments alongside being great places to live. I think you've got amazing taste! 🥰\`;
            } else {
                response = "Oh! 🙈 It looks like you haven't saved any 'Future Homes' just yet! Try tapping the heart icon on a few properties you love, and I'll jump right in to help you compare them! ❤️";
            }
        } else {
            response = "Ooh, that's such a great thought! 🌸 Since I have all the latest numbers for KV right here, I can help you check prices, growth, or area vibes instantly. What else are you wondering about? 😊";
        }`;

content = content.replace(jsBefore, jsAfter);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated AI chat to super friendly tone & floating home icon!');
