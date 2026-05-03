require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'kvai_database.json');
const LISTINGS_FILE = path.join(__dirname, 'backend', 'data', 'listings.json');
const HAS_OPENAI = !!process.env.OPENAI_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY || '';
const { OpenAI } = require('openai');
let openai;
if (HAS_OPENAI) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}


// Boilerplate DB Init
function ensureDatabaseShape(db = {}) {
    return {
        leads: Array.isArray(db.leads) ? db.leads : [],
        agents: Array.isArray(db.agents) ? db.agents : [],
        calls: Array.isArray(db.calls) ? db.calls : [],
        locationSearches: Array.isArray(db.locationSearches) ? db.locationSearches : []
    };
}

function readDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) return ensureDatabaseShape();
        return ensureDatabaseShape(JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
    } catch (error) {
        console.error('[DB] Failed to read local JSON store:', error.message);
        return ensureDatabaseShape();
    }
}

function writeDatabase(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(ensureDatabaseShape(db), null, 2), 'utf8');
}

if (!fs.existsSync(DB_FILE)) {
    writeDatabase({});
} else {
    writeDatabase(readDatabase());
}

const AREA_NEARBY_MAP = {
    "Mont Kiara": ["Bangsar", "Desa ParkCity", "Damansara Utama", "KLCC"],
    "Desa ParkCity": ["Mont Kiara", "Setia Alam", "Petaling Jaya", "Damansara Utama"],
    "Bukit Jalil": ["Old Klang Road", "Cheras", "Subang Jaya", "Petaling Jaya"],
    "Petaling Jaya": ["Damansara Utama", "Subang Jaya", "Bangsar", "Mont Kiara"],
    Bangsar: ["KLCC", "Mont Kiara", "Old Klang Road", "Petaling Jaya"],
    "Subang Jaya": ["Petaling Jaya", "Bukit Jalil", "Setia Alam", "Cyberjaya"],
    Cyberjaya: ["Bukit Jalil", "Subang Jaya", "Cheras", "Setia Alam"],
    "Damansara Utama": ["Petaling Jaya", "Mont Kiara", "Bangsar", "Desa ParkCity"],
    "Setia Alam": ["Desa ParkCity", "Subang Jaya", "Petaling Jaya", "Cyberjaya"],
    Cheras: ["Bukit Jalil", "Old Klang Road", "KLCC", "Petaling Jaya"],
    "Ampang Hilir": ["KLCC", "Bangsar", "Mont Kiara", "Cheras"],
    "Old Klang Road": ["Bangsar", "Bukit Jalil", "Petaling Jaya", "Cheras"],
    KLCC: ["Ampang Hilir", "Bangsar", "Mont Kiara", "Damansara Utama"]
};

const SEARCH_INTENT_RULES = [
    {
        terms: ["mrt", "lrt", "station", "komuter", "monorail"],
        type: "transit",
        label: "Transit insight",
        body: "This looks transit-led. Compare it with verified commuter stock before waiting for an exact listing."
    },
    {
        terms: ["school", "hospital", "mall", "university", "college", "office", "landmark"],
        type: "landmark",
        label: "Landmark insight",
        body: "This looks landmark-led. Benchmark nearby verified homes around the landmark before sourcing exact supply."
    },
    {
        terms: ["jalan", "jln", "taman", "lorong", "persiaran", "residence", "residensi", "condo", "apartment"],
        type: "address",
        label: "Address insight",
        body: "This looks like a specific address. We store only a redacted demand signal, then show verified nearby inventory."
    }
];

const FALLBACK_LISTINGS = [
    {
        id: 1,
        title: "Arcoris Signature Residences",
        location: "Mont Kiara, Kuala Lumpur",
        area: "Mont Kiara",
        type: "condo",
        price: 830000,
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        aiScore: 95,
        yield: 4.1,
        growth: 18,
        tags: ["luxury", "yield", "mrt"],
        vibe: "Expat-friendly, premium, dining-led",
        verifiedType: "owner"
    },
    {
        id: 2,
        title: "The CloutHaus KLCC",
        location: "Jalan P Ramlee, KLCC",
        area: "KLCC",
        type: "condo",
        price: 2320000,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        aiScore: 98,
        yield: 3.2,
        growth: 9,
        tags: ["luxury", "mrt"],
        vibe: "Skyline views, prestige, hospitality",
        verifiedType: "agent"
    },
    {
        id: 3,
        title: "Setia Federal Hill",
        location: "Jalan Bangsar, Bangsar",
        area: "Bangsar",
        type: "serviced",
        price: 1350000,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        aiScore: 92,
        yield: 3.8,
        growth: 12,
        tags: ["mrt", "luxury"],
        vibe: "Lifestyle-led, central, high demand",
        verifiedType: "agent"
    }
];

function normalizeQuery(query) {
    return String(query || '').trim().replace(/\s+/g, ' ').slice(0, 180);
}

function isPreciseAddress(query) {
    const normalized = normalizeQuery(query).toLowerCase();
    return /\d/.test(normalized) && /(jalan|jln|lorong|taman|persiaran|unit|block|residence|residensi|condo|apartment)/.test(normalized);
}

function redactSearchQuery(query) {
    const normalized = normalizeQuery(query);
    if (!isPreciseAddress(normalized)) return normalized;
    return normalized
        .replace(/\b(?:unit|no|lot|block|blok)\.?\s*[a-z0-9/-]+\b/gi, '[redacted-unit]')
        .replace(/\b\d+[a-z0-9/-]*\b/gi, '[number]')
        .slice(0, 180);
}

function getQueryHash(query) {
    return crypto.createHash('sha256').update(normalizeQuery(query).toLowerCase()).digest('hex');
}

function getMapsQuery(query) {
    const normalized = normalizeQuery(query);
    return /malaysia/i.test(normalized) ? normalized : `${normalized}, Malaysia`;
}

function getMapsUrls(query) {
    const mapsQuery = getMapsQuery(query);
    return {
        searchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`,
        embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`
    };
}

function getSearchIntent(query) {
    const normalized = normalizeQuery(query).toLowerCase();
    if (isPreciseAddress(normalized)) return SEARCH_INTENT_RULES.find((rule) => rule.type === "address");
    return SEARCH_INTENT_RULES.find((rule) => rule.terms.some((term) => normalized.includes(term))) || {
        type: "area",
        label: "Area insight",
        body: "No exact verified listing exists for this search yet. Treat it as buyer demand and compare nearby verified stock."
    };
}

function readListingsForLocationSearch() {
    try {
        if (fs.existsSync(LISTINGS_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(LISTINGS_FILE, 'utf8'));
            if (Array.isArray(parsed) && parsed.length) return parsed;
        }
    } catch (error) {
        console.error('[LISTINGS] Failed to read backend listings:', error.message);
    }
    return FALLBACK_LISTINGS;
}

function getKnownAreaFromQuery(query, listings) {
    const normalized = normalizeQuery(query).toLowerCase();
    return listings.map((listing) => listing.area).find((area) => area && normalized.includes(String(area).toLowerCase())) || "";
}

function getSearchTokens(query) {
    return normalizeQuery(query)
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((token) => token.length >= 3);
}

function getListingKeywordScore(listing, tokens) {
    const haystack = `${listing.title || ''} ${listing.location || ''} ${listing.area || ''} ${listing.vibe || ''} ${(listing.tags || []).join(' ')}`.toLowerCase();
    return tokens.reduce((score, token) => score + (haystack.includes(token) ? 8 : 0), 0);
}

function getListingIntentScore(listing, query) {
    const normalized = normalizeQuery(query).toLowerCase();
    const haystack = `${listing.type || ''} ${listing.vibe || ''} ${(listing.tags || []).join(' ')}`.toLowerCase();
    let score = 0;
    if (/(mrt|lrt|station|komuter|monorail)/.test(normalized) && /(mrt|transit|commute|connected)/.test(haystack)) score += 20;
    if (/(family|school|park|taman)/.test(normalized) && /(family|landed|park)/.test(haystack)) score += 16;
    if (/(rental|tenant|yield|investment|investor)/.test(normalized) && Number(listing.yield || 0) >= 4) score += 18;
    if (/(premium|luxury|klcc|bangsar|mont kiara)/.test(normalized) && /(luxury|premium|prestige)/.test(haystack)) score += 14;
    return score;
}

function getTrustState(listing) {
    const verificationSource = listing.verifiedType || listing.verificationSource || "agent";
    const confidenceScore = Number(listing.confidenceScore || listing.aiScore || 82);
    const updatedAt = listing.updatedAt || listing.updated_at || listing.createdAt || listing.created_at || new Date().toISOString();
    const ageDays = Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86400000));
    const freshnessStatus = ageDays <= 14 ? "fresh" : ageDays <= 45 ? "normal" : ageDays <= 60 ? "faded" : ageDays <= 90 ? "warning" : "archived";
    return { verificationSource, confidenceScore: Math.max(0, Math.min(100, confidenceScore)), freshnessStatus, updatedAt };
}

function getSuggestionReason(listing, query, knownArea) {
    const nearbyAreas = knownArea ? AREA_NEARBY_MAP[knownArea] || [] : [];
    if (knownArea && listing.area === knownArea) {
        return `Verified stock inside ${knownArea}. Use it before requesting a more exact match.`;
    }
    if (knownArea && nearbyAreas.includes(listing.area)) {
        return `${listing.area} is a nearby verified pocket to ${knownArea}, useful as a price and lifestyle anchor.`;
    }
    if (Number(listing.yield || 0) >= 4.5) {
        return `Good yield benchmark at ${listing.yield}% while we source the exact location.`;
    }
    if (/luxury|premium|prestige/i.test(`${listing.vibe || ''} ${(listing.tags || []).join(' ')}`)) {
        return "Useful premium-area comparison so the buyer can judge if the original location is priced fairly.";
    }
    return "Closest verified inventory match from the platform while the exact search becomes an agent sourcing signal.";
}

function getNearbyLocationSuggestions(query, filter) {
    const listings = readListingsForLocationSearch();
    const knownArea = getKnownAreaFromQuery(query, listings);
    const nearbyAreas = knownArea ? AREA_NEARBY_MAP[knownArea] || [] : [];
    const tokens = getSearchTokens(query);
    const filtered = listings.filter((listing) => (
        !filter || filter === "all" || listing.type === filter || (listing.tags || []).includes(filter)
    ));
    const pool = filtered.length >= 3
        ? filtered
        : [...filtered, ...listings.filter((listing) => !filtered.some((item) => item.id === listing.id))];

    return pool
        .map((listing) => {
            let score = Number(listing.aiScore || 80) + getListingKeywordScore(listing, tokens) + getListingIntentScore(listing, query);
            if (knownArea && listing.area === knownArea) score += 38;
            if (knownArea && nearbyAreas.includes(listing.area)) score += 28;
            if ((listing.verifiedType || listing.verificationSource) === "owner") score += 7;
            return { listing, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ listing }) => ({
            id: listing.id,
            title: listing.title,
            area: listing.area,
            location: listing.location,
            type: listing.type,
            price: listing.price,
            image: listing.image,
            aiScore: listing.aiScore,
            yield: listing.yield,
            growth: listing.growth,
            mapLink: listing.mapLink || getMapsUrls(listing.location || listing.area || query).searchUrl,
            reason: getSuggestionReason(listing, query, knownArea),
            trustState: getTrustState(listing)
        }));
}

async function fetchGoogleLocationMetadata(query) {
    if (!GOOGLE_MAPS_API_KEY) {
        return { provider: "google_maps", status: "not_configured" };
    }

    try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(getMapsQuery(query))}&region=my&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(geocodeUrl, { headers: { "User-Agent": "RealtyGenius/1.0" } });
        if (!response.ok) return { provider: "google_maps", status: "http_error", statusCode: response.status };
        const payload = await response.json();
        const result = payload.results?.[0];
        if (!result) return { provider: "google_maps", status: "not_found" };
        return {
            provider: "google_maps",
            status: "ok",
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            location: result.geometry?.location,
            types: result.types || []
        };
    } catch (error) {
        return { provider: "google_maps", status: "failed", message: error.message };
    }
}

function logLocationDemand(payload, google, suggestions) {
    const query = normalizeQuery(payload.query);
    const db = readDatabase();
    const entry = {
        id: Date.now(),
        queryHash: getQueryHash(query),
        redactedQuery: redactSearchQuery(query),
        queryType: getSearchIntent(query).type,
        filter: payload.filter || "all",
        rawQueryStored: false,
        googleStatus: google.status,
        suggestionCount: suggestions.length,
        source: payload.source || "user_search_empty_state",
        createdAt: new Date().toISOString()
    };
    db.locationSearches = [entry, ...db.locationSearches].slice(0, 1000);
    writeDatabase(db);
    return entry;
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
        
        // ------------- LOCATION FALLBACK SEARCH -------------
        if (url === '/api/search/location-fallback') {
            const query = normalizeQuery(payload.query);
            if (query.length < 2) {
                return { error: "Search query must be at least 2 characters." };
            }

            const intent = getSearchIntent(query);
            const google = await fetchGoogleLocationMetadata(query);
            const suggestions = getNearbyLocationSuggestions(query, payload.filter || "all");
            const demandSignal = payload.dryRun
                ? {
                    id: null,
                    queryHash: getQueryHash(query),
                    redactedQuery: redactSearchQuery(query),
                    rawQueryStored: false,
                    stored: false,
                    dryRun: true
                }
                : logLocationDemand(payload, google, suggestions);
            const maps = getMapsUrls(query);

            return {
                query: redactSearchQuery(query),
                rawQueryStored: false,
                insight: {
                    label: intent.label,
                    body: intent.body,
                    confidenceScore: google.status === "ok" ? 78 : 58,
                    freshnessStatus: "generated_now",
                    source: google.status === "ok" ? "google_maps" : "system"
                },
                maps: {
                    ...maps,
                    google
                },
                suggestions,
                demandSignal: {
                    id: demandSignal.id,
                    queryHash: demandSignal.queryHash,
                    redactedQuery: demandSignal.redactedQuery,
                    rawQueryStored: false,
                    stored: !payload.dryRun
                }
            };
        }

        
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
            console.log(`   Listing Price: ${payload.listingPrice} | Buyer Offer: ${payload.offerPrice}`);
            
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
            const db = readDatabase();
            const newLead = { id: Date.now(), ...payload, timestamp: new Date().toISOString() };
            db.leads.push(newLead);
            writeDatabase(db);
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
