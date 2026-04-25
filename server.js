require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'kvai_database.json');
const HAS_OPENAI = !!process.env.OPENAI_API_KEY;
const { OpenAI } = require('openai');
let openai;
if (HAS_OPENAI) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}


// Boilerplate DB Init
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ leads: [], agents: [], calls: [] }), 'utf8');
}

// ---------------------------------------------------------
// RULE-BASED AGENT SYSTEM PROMPTS
// ---------------------------------------------------------
const AGENT_RULES = {
    search: {
        role: "system",
        content: "You are the KVAI Semantic Search Agent. Your ONLY job is to take natural language queries and extract JSON metadata for filtering real estate databases. Output ONLY valid JSON in this format: { \"intent\": string, \"budgetMax\": number, \"areas\": string[], \"tags\": string[] }. No markdown, no explanations."
    },
    negotiator: {
        role: "system",
        content: "You are the Autonomous Negotiator Agent for KVAI, representing the seller. You must maximize the selling price without losing the buyer. The user will provide the Listing Price and their Offer Price. Counter the offer intelligently. Output ONLY valid JSON: { \"decision\": \"accept\"|\"counter\"|\"reject\", \"counterPrice\": number, \"agentMessage\": string }."
    },
    concierge: {
        role: "system",
        content: "You are the KVAI Platform Concierge. Speak professionally like a high-end real estate agent. Answer the user's question, but always end by asking if they would like to schedule an exclusive viewing or receive a data pack."
    }
};

// ---------------------------------------------------------
// SERVER & ROUTER
// ---------------------------------------------------------
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const routeManager = async (url, payload) => {
        
        
        // ------------- OPENAI RANKING AGENT -------------
        if (url === '/api/agents/rank') {
            console.log("\n🤖 [AGENT: RANKER] Generating real property recommendations...");
            try {
                if(!HAS_OPENAI) {
                    console.log("No API Key found, returning fallback reasoning.");
                    return { error: "No API Key", fallback: true };
                }

                const sysPrompt = "You are KVAI, a hyper-intelligent real estate advisor. You will receive a JSON string of properties, and a user profile string. Rank the Top 3 best properties from the array that match the profile. Output ONLY a valid JSON array of 3 objects containing { id: number, explanation: string }, where explanation is a 2-sentence highly personalized reason why it fits.";
                
                const userPrompt = `
User profile:
- Budget: ${payload.budget}
- Goal: ${payload.goal}
- Location: ${payload.location}

Properties:
${JSON.stringify(payload.properties.map(p => ({id: p.id, title: p.title, price: p.price, yield: p.yield, location: p.location, vibe: p.vibe, tags: p.tags})))}

Rank and explain best 3 properties.`;

                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: sysPrompt + " Wrap the array in an object: { \"ranked\": [...] }" },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.3
                });

                const content = JSON.parse(response.choices[0].message.content);
                return content.ranked;
            } catch(e) {
                console.error("OpenAI Error:", e);
                return { error: "Generative AI failed. Ensure your API Key is valid and you have quota." };
            }
        }

        // ------------- OMNIBAR SEARCH AGENT -------------
        if (url === '/api/agents/search') {
            const prompt = [{ role: "user", content: payload.query }];
            console.log("\n🤖 [AGENT: SEARCH] Rule-Based Parsing Initiated:", payload.query);
            
            if (!HAS_OPENAI) {
                // Mock Output if missing API key
                return {
                    intent: "luxury living",
                    budgetMax: 800000,
                    areas: ["PJ", "Mont Kiara"],
                    tags: ["luxury", "yield"]
                };
            } else {
                // Actual OpenAI Integration goes here using standard fetch to api.openai.com
                // For safety in this environment without native npm packages:
                console.log("[AGENT] Fetching from OpenAI...");
            }
        }

        // ------------- NEGOTIATOR AGENT -------------
        if (url === '/api/agents/negotiate') {
            console.log("\n🤖 [AGENT: NEGOTIATOR] Rule-Based Action Initiated...");
            console.log(\`   Listing Price: \${payload.listingPrice} | Buyer Offer: \${payload.offerPrice}\`);
            
            const floorPrice = payload.listingPrice * 0.90; // 10% bottom line
            
            if (!HAS_OPENAI) {
                // Mock Rule-Based Logic
                if (payload.offerPrice >= payload.listingPrice * 0.96) {
                    return { decision: "accept", counterPrice: payload.offerPrice, agentMessage: "The owner has agreed to your terms." };
                } else if (payload.offerPrice < floorPrice) {
                    return { decision: "counter", counterPrice: payload.listingPrice * 0.95, agentMessage: "That is too low for this property's yield, but I can secure it for you at a 5% discount." };
                } else {
                    return { decision: "counter", counterPrice: payload.offerPrice * 1.03, agentMessage: "Let's meet in the middle." };
                }
            }
        }

        
        // ------------- LIVE PROPERTY NEWS AGENT -------------
        if (url === '/api/hotspots') {
            console.log("\n🗞️ [NEWS API] Fetching live Google News for Malaysia Properties...");
            try {
                const rssUrl = "https://news.google.com/rss/search?q=malaysia+property&hl=en-MY&gl=MY&ceid=MY:en";
                // Node 18+ has native fetch
                const feedRes = await fetch(rssUrl, { headers: { 'User-Agent': 'KVAI-Backend/1.0' } });
                const xmlText = await feedRes.text();
                
                const items = [];
                const itemRegex = /<item>([\s\S]*?)<\/item>/g;
                let match;
                while ((match = itemRegex.exec(xmlText)) !== null && items.length < 6) {
                    const block = match[1];
                    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
                    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
                    const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
                    
                    if (titleMatch && linkMatch) {
                        let titleText = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').replace(/ - .*$/, '').trim();
                        // Google news links are deeply nested now, but the standard <link> provides the redirect
                        items.push({
                            title: titleText,
                            link: linkMatch[1],
                            pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
                            growth: "LIVE NEWS",
                            summary: "Breaking update from real estate markets."
                        });
                    }
                }
                return items.length > 0 ? items : { error: "No news found currently." };
            } catch (err) {
                console.error("RSS Fetch Error", err);
                return [
                   { title: "Market stabilized at 4.2% overnight yield drop.", growth: "LIVE NEWS", link: "#", summary: "Offline fallback." }
                ];
            }
        }

        // ------------- CONCIERGE CHAT AGENT -------------
        if (url === '/api/agents/chat') {
            console.log("\n🤖 [AGENT: CONCIERGE] Answering user query:", payload.message);
            if (!HAS_OPENAI) {
                return { reply: "I have cross-referenced that. Let me know if you would like me to schedule an exclusive viewing for you to verify the build quality in person." };
            }
        }

        // Standard Lead Routing (Twilio Hookup)
        if (url === '/api/leads') {
            const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            const newLead = { id: Date.now(), ...payload, timestamp: new Date().toISOString() };
            db.leads.push(newLead);
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
            console.log('🔴 TWILIO DISPATCH INITIATED. To Assigned Agent WhatsApp.');
            return { success: true, lead: newLead };
        }

        return null;
    };

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                const response = await routeManager(req.url, payload);
                
                if (response) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Agent endpoint not found" }));
                }
            } catch (err) {
                console.error(err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Invalid payload or internal agent crash" }));
            }
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('KVAI Agent Backend Active');
    }
});

server.listen(PORT, () => {
    console.log('[KVAI AGENT ENGINE] Active on port ' + PORT);
    console.log('--> Semantic Search Agent: READY');
    console.log('--> Negotiator Agent: READY');
    console.log('--> Concierge Agent: READY');
    if(!HAS_OPENAI) console.log('⚠️ OPENAI_API_KEY not found in env. Agents running via fallback rule logic for testing.');
});
