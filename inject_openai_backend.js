const fs = require('fs');

let serverJS = fs.readFileSync('server.js', 'utf8');

// 1. Inject OpenAI configuration at the top
if(!serverJS.includes("const { OpenAI } = require('openai');")) {
    const aiConfig = `
const { OpenAI } = require('openai');
let openai;
if (HAS_OPENAI) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
`;
    serverJS = serverJS.replace('const HAS_OPENAI = !!process.env.OPENAI_API_KEY;', 'const HAS_OPENAI = !!process.env.OPENAI_API_KEY;' + aiConfig);
}

// 2. Add the Ranking Endpoint
if(!serverJS.includes("'/api/agents/rank'")) {
    const rankEndpoint = `
        // ------------- OPENAI RANKING AGENT -------------
        if (url === '/api/agents/rank') {
            console.log("\\n🤖 [AGENT: RANKER] Generating real property recommendations...");
            try {
                if(!HAS_OPENAI) {
                    console.log("No API Key found, returning fallback reasoning.");
                    return { error: "No API Key", fallback: true };
                }

                const sysPrompt = "You are KVAI, a hyper-intelligent real estate advisor. You will receive a JSON string of properties, and a user profile string. Rank the Top 3 best properties from the array that match the profile. Output ONLY a valid JSON array of 3 objects containing { id: number, explanation: string }, where explanation is a 2-sentence highly personalized reason why it fits.";
                
                const userPrompt = \`
User profile:
- Budget: \${payload.budget}
- Goal: \${payload.goal}
- Location: \${payload.location}

Properties:
\${JSON.stringify(payload.properties.map(p => ({id: p.id, title: p.title, price: p.price, yield: p.yield, location: p.location, vibe: p.vibe, tags: p.tags})))}

Rank and explain best 3 properties.\`;

                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: sysPrompt + " Wrap the array in an object: { \\"ranked\\": [...] }" },
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
`;

    // Insert it into routeManager
    serverJS = serverJS.replace('// ------------- OMNIBAR SEARCH AGENT -------------', rankEndpoint + '\n        // ------------- OMNIBAR SEARCH AGENT -------------');
}

fs.writeFileSync('server.js', serverJS, 'utf8');
console.log("Successfully injected OpenAI Ranking API into server.js");
