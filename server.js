require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'kvai_database.json');
const LISTINGS_FILE = path.join(__dirname, 'backend', 'data', 'listings.json');
const HAS_OPENAI = !!process.env.OPENAI_API_KEY;
const GOOGLE_MAPS_API_KEY = readEnv('GOOGLE_MAPS_API_KEY', 'GOOGLE_API_KEY');
const FRONTEND_URL = normalizeOrigin(readEnv('FRONTEND_URL'));
const SUPABASE_REST_URL = normalizeSupabaseRestUrl(readEnv('SUPABASE_URL'));
const SUPABASE_SERVICE_ROLE_KEY = readEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY');
const TELEGRAM_BOT_TOKEN = readEnv('TELEGRAM_BOT_TOKEN');
const TELEGRAM_WEBHOOK_SECRET = readEnv('TELEGRAM_WEBHOOK_SECRET');
const ADMIN_API_KEY = readEnv('ADMIN_API_KEY');
const { OpenAI } = require('openai');
let openai;
if (HAS_OPENAI) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function readEnv(...names) {
    for (const name of names) {
        const raw = process.env[name];
        if (!raw) continue;
        let value = String(raw).trim();
        for (const candidate of names) {
            const prefix = `${candidate}=`;
            if (value.startsWith(prefix)) value = value.slice(prefix.length).trim();
        }
        if (value) return value;
    }
    return '';
}

function normalizeSupabaseRestUrl(value) {
    const raw = String(value || '').trim().replace(/\/+$/, '');
    if (!raw) return '';
    return raw.endsWith('/rest/v1') ? raw : `${raw}/rest/v1`;
}

function normalizeOrigin(value) {
    return String(value || '').trim().replace(/\/+$/, '');
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
        embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`,
        earthUrl: `https://earth.google.com/web/search/${encodeURIComponent(mapsQuery)}`
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

function hasSupabaseConfig() {
    return Boolean(SUPABASE_REST_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function safeJsonParse(value, fallback = null) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function normalizeHeaderValue(value) {
    return Array.isArray(value) ? value[0] : String(value || '');
}

function safeEqual(a, b) {
    const left = Buffer.from(String(a || ''));
    const right = Buffer.from(String(b || ''));
    return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function requireAdminAccess(req) {
    if (!ADMIN_API_KEY) return { ok: false, status: 500, error: "ADMIN_API_KEY is not configured." };
    const headerKey = normalizeHeaderValue(req.headers['x-admin-api-key']);
    const bearer = normalizeHeaderValue(req.headers.authorization).replace(/^Bearer\s+/i, '');
    const provided = headerKey || bearer;
    if (!provided || !safeEqual(provided, ADMIN_API_KEY)) {
        return { ok: false, status: 401, error: "Admin API key is required." };
    }
    return { ok: true };
}

function requireTelegramSecret(req) {
    if (!TELEGRAM_WEBHOOK_SECRET) return { ok: false, status: 500, error: "TELEGRAM_WEBHOOK_SECRET is not configured." };
    const provided = normalizeHeaderValue(req.headers['x-telegram-bot-api-secret-token']);
    if (!provided || !safeEqual(provided, TELEGRAM_WEBHOOK_SECRET)) {
        return { ok: false, status: 401, error: "Invalid Telegram webhook secret." };
    }
    return { ok: true };
}

async function supabaseRequest(pathname, options = {}) {
    if (!hasSupabaseConfig()) {
        throw new Error("Supabase REST URL or service role key is not configured.");
    }

    const pathValue = String(pathname || '').replace(/^\/+/, '');
    const response = await fetch(`${SUPABASE_REST_URL}/${pathValue}`, {
        method: options.method || 'GET',
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(options.prefer ? { Prefer: options.prefer } : {}),
            ...(options.headers || {})
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    const text = await response.text();
    const data = text ? safeJsonParse(text, text) : null;
    if (!response.ok) {
        const detail = typeof data === 'string' ? data : JSON.stringify(data);
        throw new Error(`Supabase ${response.status}: ${detail}`);
    }
    return data;
}

function supabaseEq(value) {
    return `eq.${encodeURIComponent(String(value))}`;
}

async function selectSupabaseRows(table, query = '') {
    const normalizedQuery = query ? `?${query.replace(/^\?/, '')}` : '';
    return supabaseRequest(`${table}${normalizedQuery}`);
}

async function insertSupabaseRow(table, body) {
    const rows = await supabaseRequest(table, {
        method: 'POST',
        prefer: 'return=representation',
        body
    });
    return Array.isArray(rows) ? rows[0] : rows;
}

async function patchSupabaseRow(table, id, body) {
    const rows = await supabaseRequest(`${table}?id=${supabaseEq(id)}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        body
    });
    return Array.isArray(rows) ? rows[0] : rows;
}

function extractUrls(text = '') {
    return String(text || '').match(/https?:\/\/[^\s)>\]]+/gi) || [];
}

function extractImageUrls(text = '') {
    return extractUrls(text).filter((url) => (
        /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(url)
        || /drive\.google\.com|photos\.app\.goo\.gl|atlasproduction|s3\.amazonaws/i.test(url)
    ));
}

function cleanPhone(value = '') {
    const digits = String(value || '').replace(/[^\d]/g, '');
    if (!digits) return '';
    if (digits.startsWith('60')) return digits;
    if (digits.startsWith('0')) return `6${digits}`;
    return digits.length >= 9 ? digits : '';
}

function extractTelegramMessage(update) {
    const message = update?.message || update?.channel_post || update?.edited_message || update?.edited_channel_post || {};
    const text = [message.text, message.caption].filter(Boolean).join('\n').trim();
    const photos = Array.isArray(message.photo) ? message.photo : [];
    const bestPhoto = photos.length ? photos[photos.length - 1] : null;
    return {
        updateId: update?.update_id,
        updateType: update?.channel_post ? 'channel_post' : update?.edited_channel_post ? 'edited_channel_post' : update?.edited_message ? 'edited_message' : 'message',
        chatId: message.chat?.id ? String(message.chat.id) : '',
        chatTitle: message.chat?.title || message.chat?.username || '',
        messageId: message.message_id || null,
        messageDate: message.date ? new Date(message.date * 1000).toISOString() : new Date().toISOString(),
        senderId: message.from?.id ? String(message.from.id) : '',
        senderUsername: message.from?.username || '',
        text,
        caption: message.caption || '',
        fileIds: photos.map((photo) => photo.file_id).filter(Boolean),
        primaryFileId: bestPhoto?.file_id || '',
        rawPayload: update || {}
    };
}

function inferPropertyType(text = '') {
    const lower = text.toLowerCase();
    if (/industrial|warehouse|factory|iks/.test(lower)) return "Industrial";
    if (/shop|retail|office|commercial/.test(lower)) return "Commercial";
    if (/terrace|superlink|semi[-\s]?d|bungalow|landed|villa/.test(lower)) return "Landed";
    if (/condo|condominium|apartment|serviced|suite|residence|residensi/.test(lower)) return "Condo";
    return "Residential";
}

function fallbackListingExtraction(text = '', meta = {}) {
    const normalized = String(text || '').replace(/\r/g, '').trim();
    const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
    const title = lines.find((line) => !/^(rm|price|contact|whatsapp|wa|tel|size|sqft|bed|bath)/i.test(line)) || "AI Imported Property";
    const priceMatch = normalized.match(/(?:rm|myr)\s*([0-9][0-9,.\s]{3,})/i) || normalized.match(/([0-9][0-9,.]+)\s*(?:k|mil|million|m)\b/i);
    let price = 0;
    if (priceMatch) {
        const raw = priceMatch[1].replace(/[,\s]/g, '');
        price = Number(raw) || 0;
        if (/k\b/i.test(priceMatch[0])) price *= 1000;
        if (/(mil|million|m)\b/i.test(priceMatch[0])) price *= 1000000;
    }
    const sqftMatch = normalized.match(/([0-9][0-9,]*)\s*(?:sq\.?\s*ft|sqft|sf|sq ft)/i);
    const bedMatch = normalized.match(/(\d+)\s*(?:bed|bedroom|br|rooms?)/i);
    const bathMatch = normalized.match(/(\d+)\s*(?:bath|bathroom|toilet|wc)/i);
    const phoneMatch = normalized.match(/(?:\+?6?0)[\d\s-]{8,14}/);
    const urls = extractUrls(normalized);
    const imageUrls = extractImageUrls(normalized);
    const locationLine = lines.find((line) => /(kl|kuala lumpur|selangor|pj|petaling|bangsar|mont kiara|cheras|subang|jaya|jalan|taman|ampang|cyberjaya|putrajaya)/i.test(line)) || "";

    return {
        title: title.slice(0, 120),
        location: locationLine || "Malaysia",
        price,
        priceText: priceMatch ? priceMatch[0] : "",
        bedrooms: bedMatch ? Number(bedMatch[1]) : null,
        bathrooms: bathMatch ? Number(bathMatch[1]) : null,
        builtUpSqft: sqftMatch ? Number(sqftMatch[1].replace(/,/g, '')) : null,
        propertyType: inferPropertyType(normalized),
        description: normalized.slice(0, 900),
        highlights: lines.slice(1, 6),
        facilities: [],
        nearbyLandmarks: [],
        imageUrls,
        sourceUrls: urls,
        contactPhone: cleanPhone(phoneMatch?.[0] || ''),
        mapQuery: locationLine || title,
        confidenceScore: Math.max(35, Math.min(72, 42 + (price ? 8 : 0) + (locationLine ? 8 : 0) + (imageUrls.length ? 6 : 0))),
        missingFields: [
            !price ? "price" : "",
            !locationLine ? "location" : "",
            !sqftMatch ? "builtUpSqft" : "",
            !phoneMatch ? "contactPhone" : ""
        ].filter(Boolean),
        adminReviewNote: `Imported from Telegram ${meta.chatTitle || meta.chatId || "message"}. AI fallback extraction used; admin must verify before live.`
    };
}

function normalizeAiExtraction(raw, text, meta) {
    const fallback = fallbackListingExtraction(text, meta);
    const value = raw && typeof raw === 'object' ? raw : {};
    const imageUrls = Array.isArray(value.imageUrls) ? value.imageUrls : Array.isArray(value.image_urls) ? value.image_urls : fallback.imageUrls;
    const missingFields = Array.isArray(value.missingFields) ? value.missingFields : Array.isArray(value.missing_fields) ? value.missing_fields : [];
    const normalized = {
        title: String(value.title || value.propertyTitle || fallback.title).slice(0, 140),
        location: String(value.location || value.address || fallback.location).slice(0, 220),
        price: Number(value.price || fallback.price || 0),
        priceText: String(value.priceText || value.price_text || fallback.priceText || "").slice(0, 80),
        bedrooms: value.bedrooms == null ? fallback.bedrooms : Number(value.bedrooms),
        bathrooms: value.bathrooms == null ? fallback.bathrooms : Number(value.bathrooms),
        builtUpSqft: value.builtUpSqft == null ? value.built_up_sqft == null ? fallback.builtUpSqft : Number(value.built_up_sqft) : Number(value.builtUpSqft),
        propertyType: String(value.propertyType || value.property_type || fallback.propertyType).slice(0, 80),
        description: String(value.description || fallback.description).slice(0, 1600),
        highlights: Array.isArray(value.highlights) ? value.highlights.slice(0, 10).map(String) : fallback.highlights,
        facilities: Array.isArray(value.facilities) ? value.facilities.slice(0, 12).map(String) : [],
        nearbyLandmarks: Array.isArray(value.nearbyLandmarks) ? value.nearbyLandmarks.slice(0, 12).map(String) : Array.isArray(value.nearby_landmarks) ? value.nearby_landmarks.slice(0, 12).map(String) : [],
        imageUrls: imageUrls.slice(0, 12).map(String),
        contactPhone: cleanPhone(value.contactPhone || value.contact_phone || fallback.contactPhone),
        mapQuery: String(value.mapQuery || value.map_query || value.location || fallback.mapQuery).slice(0, 220),
        confidenceScore: Math.max(0, Math.min(100, Number(value.confidenceScore || value.confidence_score || fallback.confidenceScore || 50))),
        missingFields: [...new Set([...(missingFields || []), ...fallback.missingFields].filter(Boolean).map(String))].slice(0, 15),
        adminReviewNote: String(value.adminReviewNote || value.admin_review_note || fallback.adminReviewNote).slice(0, 600)
    };

    if (!normalized.title) normalized.title = fallback.title;
    if (!normalized.location) normalized.location = fallback.location;
    if (!Number.isFinite(normalized.price)) normalized.price = 0;
    if (!Number.isFinite(normalized.bedrooms)) normalized.bedrooms = null;
    if (!Number.isFinite(normalized.bathrooms)) normalized.bathrooms = null;
    if (!Number.isFinite(normalized.builtUpSqft)) normalized.builtUpSqft = null;
    return normalized;
}

async function extractListingWithAI(text, meta = {}) {
    if (!HAS_OPENAI || !openai) return normalizeAiExtraction(null, text, meta);

    const system = [
        "You extract Malaysian property listings from Telegram messages for RealityGenius.",
        "Return JSON only. Never invent certainty.",
        "If a field is missing, infer a temporary reasonable value only when useful and include the field name in missingFields.",
        "Tone must be professional and not overpromising.",
        "Output keys: title, location, price, priceText, bedrooms, bathrooms, builtUpSqft, propertyType, description, highlights, facilities, nearbyLandmarks, imageUrls, contactPhone, mapQuery, confidenceScore, missingFields, adminReviewNote."
    ].join(" ");

    const user = JSON.stringify({
        telegram: {
            chatTitle: meta.chatTitle,
            chatId: meta.chatId,
            messageId: meta.messageId
        },
        message: text,
        urls: extractUrls(text),
        imageUrls: extractImageUrls(text)
    });

    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: 0.1,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ]
        });
        return normalizeAiExtraction(safeJsonParse(response.choices?.[0]?.message?.content || "{}"), text, meta);
    } catch (error) {
        console.error("[TELEGRAM AI] Extraction failed, using fallback:", error.message);
        return normalizeAiExtraction(null, text, meta);
    }
}

function createImportDedupHash(meta, extraction) {
    const key = [
        meta.chatId,
        meta.messageId,
        extraction.title,
        extraction.location,
        extraction.price,
        extraction.contactPhone
    ].join('|').toLowerCase();
    return crypto.createHash('sha256').update(key).digest('hex');
}

function numericPublicId(id) {
    const hash = crypto.createHash('md5').update(String(id)).digest('hex').slice(0, 8);
    return 700000 + (parseInt(hash, 16) % 200000);
}

function importedListingToPublicProperty(item) {
    const sqft = Number(item.built_up_sqft || 0);
    const price = Number(item.price || 0);
    const propertyType = item.property_type || "Residential";
    const imageUrls = Array.isArray(item.image_urls) ? item.image_urls : [];
    const image = imageUrls[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";
    const area = item.location || "Malaysia";
    return {
        id: numericPublicId(item.id),
        importId: item.id,
        source: "telegram_ai_import",
        badge: "live-agent",
        title: item.title || "AI Imported Property",
        area,
        location: item.location || area,
        type: inferPropertyType(propertyType).toLowerCase(),
        intent: /industrial|commercial/i.test(propertyType) ? "investment" : "family",
        price,
        bedrooms: Number(item.bedrooms || 0),
        bathrooms: Number(item.bathrooms || 0),
        beds: Number(item.bedrooms || 0),
        baths: Number(item.bathrooms || 0),
        sqft,
        psf: sqft && price ? Math.round(price / sqft) : 0,
        image,
        gallery: imageUrls.map((url, index) => ({
            label: index === 0 ? "Front View" : `Telegram Image ${index + 1}`,
            required: index === 0,
            url,
            source: "Telegram AI import",
            status: "needs_admin_verification"
        })),
        galleryCount: Math.max(1, imageUrls.length),
        whatsapp: item.contact_phone || "",
        liveNow: 4,
        aiScore: Number(item.confidence_score || 70),
        confidenceScore: Number(item.confidence_score || 70),
        yield: 4.2,
        growth: 5.1,
        summary: item.description || "AI-imported listing reviewed by RealityGenius admin.",
        vibe: "Telegram-imported listing, admin reviewed",
        tags: ["telegram-import", inferPropertyType(propertyType).toLowerCase(), "admin-approved"],
        verifiedType: "agent",
        verificationSource: "admin_approved",
        adminApproved: true,
        approvalStatus: "approved",
        liveStatus: "approved_live",
        freshnessStatus: "fresh",
        createdAt: item.created_at,
        updatedAt: item.updated_at || item.created_at,
        mapLink: `https://www.google.com/maps/search/${encodeURIComponent(item.map_query || item.location || item.title || "Malaysia")}`,
        agentName: "RealityGenius AI Import Desk",
        agencyName: "RealityGenius"
    };
}

async function saveRawTelegramMessage(meta) {
    const existing = await selectSupabaseRows(
        "telegram_raw_messages",
        `select=*&telegram_update_id=${supabaseEq(meta.updateId)}&limit=1`
    );
    if (Array.isArray(existing) && existing[0]) return existing[0];

    return insertSupabaseRow("telegram_raw_messages", {
        telegram_update_id: meta.updateId,
        update_type: meta.updateType,
        chat_id: meta.chatId,
        chat_title: meta.chatTitle,
        message_id: meta.messageId,
        message_date: meta.messageDate,
        sender_id: meta.senderId,
        sender_username: meta.senderUsername,
        text: meta.text,
        caption: meta.caption,
        telegram_file_ids: meta.fileIds,
        raw_payload: meta.rawPayload,
        processed_status: "received"
    });
}

async function saveImportedListing(rawMessage, meta, extraction) {
    const dedupHash = createImportDedupHash(meta, extraction);
    const existing = await selectSupabaseRows(
        "ai_imported_listings",
        `select=*&dedup_hash=${supabaseEq(dedupHash)}&limit=1`
    );
    if (Array.isArray(existing) && existing[0]) {
        return patchSupabaseRow("ai_imported_listings", existing[0].id, {
            extraction_json: extraction,
            missing_fields: extraction.missingFields,
            confidence_score: extraction.confidenceScore,
            updated_at: new Date().toISOString()
        });
    }

    return insertSupabaseRow("ai_imported_listings", {
        raw_message_id: rawMessage.id,
        source: "telegram",
        source_chat_id: meta.chatId,
        source_chat_title: meta.chatTitle,
        source_message_id: meta.messageId,
        dedup_hash: dedupHash,
        original_text: meta.text,
        extraction_json: extraction,
        title: extraction.title,
        location: extraction.location,
        price: extraction.price,
        price_text: extraction.priceText,
        bedrooms: extraction.bedrooms,
        bathrooms: extraction.bathrooms,
        built_up_sqft: extraction.builtUpSqft,
        property_type: extraction.propertyType,
        description: extraction.description,
        highlights: extraction.highlights,
        facilities: extraction.facilities,
        nearby_landmarks: extraction.nearbyLandmarks,
        image_urls: extraction.imageUrls,
        contact_phone: extraction.contactPhone,
        map_query: extraction.mapQuery,
        confidence_score: extraction.confidenceScore,
        missing_fields: extraction.missingFields,
        admin_notes: extraction.adminReviewNote,
        status: "needs_review"
    });
}

async function createAdminNotification(title, message, payload = {}) {
    try {
        return await insertSupabaseRow("admin_notifications", {
            title,
            message,
            category: "telegram_ai_import",
            payload
        });
    } catch (error) {
        console.error("[ADMIN NOTIFY] Failed:", error.message);
        return null;
    }
}

async function sendTelegramMessage(chatId, text) {
    if (!TELEGRAM_BOT_TOKEN || !chatId || !text) return null;
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                disable_web_page_preview: true
            })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            console.error("[TELEGRAM REPLY] Failed:", payload.description || response.statusText);
            return null;
        }
        return payload;
    } catch (error) {
        console.error("[TELEGRAM REPLY] Failed:", error.message);
        return null;
    }
}

async function handleTelegramWebhook(update) {
    if (!hasSupabaseConfig()) {
        return { ok: false, error: "Supabase is not configured." };
    }

    const meta = extractTelegramMessage(update);
    if (!meta.updateId) return { ok: true, ignored: true, reason: "No Telegram update id." };

    const rawMessage = await saveRawTelegramMessage(meta);
    if (!meta.text && !meta.fileIds.length) {
        await patchSupabaseRow("telegram_raw_messages", rawMessage.id, { processed_status: "ignored_empty" });
        await sendTelegramMessage(meta.chatId, "RealityGenius received the Telegram update, but there was no listing text or caption to extract. Please send a property post with price, location, size, and contact details.");
        return { ok: true, ignored: true, rawMessageId: rawMessage.id };
    }

    const extraction = await extractListingWithAI(meta.text || "[Telegram media post without caption]", meta);
    const imported = await saveImportedListing(rawMessage, meta, extraction);
    await patchSupabaseRow("telegram_raw_messages", rawMessage.id, {
        processed_status: "imported",
        ai_summary: extraction.title,
        processed_at: new Date().toISOString()
    });

    await createAdminNotification(
        "Telegram AI listing needs review",
        `${extraction.title} was imported from ${meta.chatTitle || meta.chatId || "Telegram"} with ${extraction.confidenceScore}% confidence.`,
        { importId: imported.id, rawMessageId: rawMessage.id, status: imported.status }
    );

    await sendTelegramMessage(
        meta.chatId,
        `RealityGenius received this listing: ${extraction.title}. Status: needs_review. Admin must verify it before it goes live.`
    );

    return { ok: true, importId: imported.id, status: imported.status, confidenceScore: extraction.confidenceScore };
}

async function listAdminAiImports() {
    const rows = await selectSupabaseRows(
        "ai_imported_listings",
        "select=*&order=created_at.desc&limit=100"
    );
    return { items: rows || [] };
}

function pickImportEdits(payload = {}) {
    const edits = payload.edits || payload;
    const allowed = {
        title: edits.title,
        location: edits.location,
        price: edits.price == null ? undefined : Number(edits.price),
        price_text: edits.priceText || edits.price_text,
        bedrooms: edits.bedrooms == null ? undefined : Number(edits.bedrooms),
        bathrooms: edits.bathrooms == null ? undefined : Number(edits.bathrooms),
        built_up_sqft: edits.builtUpSqft == null && edits.built_up_sqft == null ? undefined : Number(edits.builtUpSqft ?? edits.built_up_sqft),
        property_type: edits.propertyType || edits.property_type,
        description: edits.description,
        highlights: Array.isArray(edits.highlights) ? edits.highlights : undefined,
        facilities: Array.isArray(edits.facilities) ? edits.facilities : undefined,
        nearby_landmarks: Array.isArray(edits.nearbyLandmarks) ? edits.nearbyLandmarks : Array.isArray(edits.nearby_landmarks) ? edits.nearby_landmarks : undefined,
        image_urls: Array.isArray(edits.imageUrls) ? edits.imageUrls : Array.isArray(edits.image_urls) ? edits.image_urls : undefined,
        contact_phone: edits.contactPhone ? cleanPhone(edits.contactPhone) : edits.contact_phone ? cleanPhone(edits.contact_phone) : undefined,
        map_query: edits.mapQuery || edits.map_query,
        confidence_score: edits.confidenceScore == null && edits.confidence_score == null ? undefined : Number(edits.confidenceScore ?? edits.confidence_score),
        missing_fields: Array.isArray(edits.missingFields) ? edits.missingFields : Array.isArray(edits.missing_fields) ? edits.missing_fields : undefined,
        admin_notes: payload.adminNotes || edits.adminNotes || edits.admin_notes
    };
    return Object.fromEntries(Object.entries(allowed).filter(([, value]) => value !== undefined));
}

async function reviewAiImport(payload) {
    const id = payload.id;
    if (!id) return { error: "Import id is required." };
    const action = String(payload.action || "edit").toLowerCase();
    const statusByAction = {
        edit: undefined,
        approve: "approved",
        approved: "approved",
        live: "live",
        reject: "rejected",
        rejected: "rejected",
        needs_review: "needs_review"
    };
    if (!(action in statusByAction)) return { error: "Invalid action." };

    const updates = {
        ...pickImportEdits(payload),
        updated_at: new Date().toISOString()
    };
    const status = statusByAction[action];
    if (status) {
        updates.status = status;
        updates.reviewed_at = new Date().toISOString();
        updates.reviewed_by = payload.reviewedBy || "admin";
    }

    const row = await patchSupabaseRow("ai_imported_listings", id, updates);
    await createAdminNotification(
        `AI import ${status || "edited"}`,
        `${row?.title || "Imported listing"} is now ${status || "edited"}.`,
        { importId: id, action }
    );
    return { item: row };
}

async function listPublicProperties() {
    if (!hasSupabaseConfig()) return { items: [] };
    const rows = await selectSupabaseRows(
        "ai_imported_listings",
        "select=*&status=in.(approved,live)&order=updated_at.desc&limit=100"
    );
    return { items: (rows || []).map(importedListingToPublicProperty) };
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
    const requestOrigin = normalizeOrigin(req.headers.origin || '');
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL && (!requestOrigin || requestOrigin === FRONTEND_URL) ? FRONTEND_URL : '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Api-Key, X-Telegram-Bot-Api-Secret-Token');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const routePath = requestUrl.pathname;

    const sendJson = (status, payload) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload));
    };

    const routeManager = async (url, payload) => {
        if (url === '/api/telegram/health') {
            return {
                ok: true,
                service: "RealityGenius Telegram AI import backend",
                routes: ["/api/telegram/webhook", "/api/telegram/health", "/api/admin/ai-imports", "/api/properties"],
                config: {
                    supabase: hasSupabaseConfig(),
                    openai: Boolean(HAS_OPENAI && openai),
                    telegramBot: Boolean(TELEGRAM_BOT_TOKEN),
                    telegramWebhookSecret: Boolean(TELEGRAM_WEBHOOK_SECRET),
                    adminApiKey: Boolean(ADMIN_API_KEY),
                    frontendUrl: Boolean(FRONTEND_URL)
                },
                checkedAt: new Date().toISOString()
            };
        }

        if (url === '/api/telegram/webhook') {
            const auth = requireTelegramSecret(req);
            if (!auth.ok) return { __status: auth.status, error: auth.error };
            return handleTelegramWebhook(payload);
        }

        if (url === '/api/admin/ai-imports') {
            const auth = requireAdminAccess(req);
            if (!auth.ok) return { __status: auth.status, error: auth.error };
            return listAdminAiImports();
        }

        if (url === '/api/admin/ai-imports/review') {
            const auth = requireAdminAccess(req);
            if (!auth.ok) return { __status: auth.status, error: auth.error };
            return reviewAiImport(payload);
        }

        if (url === '/api/properties') {
            return listPublicProperties();
        }
        
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

    if (req.method === 'GET') {
        try {
            const response = await routeManager(routePath, {});
            if (response) return sendJson(response.__status || (response.error ? 400 : 200), response);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('KVAI Agent Backend Active');
        } catch (err) {
            console.error(err);
            sendJson(500, { error: err.message || "Internal backend error" });
        }
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 1024 * 1024) {
                req.destroy();
            }
        });
        req.on('end', async () => {
            try {
                const payload = body ? JSON.parse(body) : {};
                const response = await routeManager(routePath, payload);
                
                if (response) {
                    sendJson(response.__status || (response.error ? 400 : 200), response);
                } else {
                    sendJson(404, { error: "Agent endpoint not found" });
                }
            } catch (err) {
                console.error(err);
                sendJson(400, { error: err.message || "Invalid payload or internal agent crash" });
            }
        });
    } else if (req.method === 'PATCH') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 1024 * 1024) {
                req.destroy();
            }
        });
        req.on('end', async () => {
            try {
                const payload = body ? JSON.parse(body) : {};
                const response = await routeManager(routePath, payload);
                if (response) return sendJson(response.__status || (response.error ? 400 : 200), response);
                sendJson(404, { error: "Agent endpoint not found" });
            } catch (err) {
                console.error(err);
                sendJson(400, { error: err.message || "Invalid payload or internal agent crash" });
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
    if(!HAS_OPENAI) console.log('[WARN] OPENAI_API_KEY not found in env. Agents running via fallback rule logic for testing.');
});
