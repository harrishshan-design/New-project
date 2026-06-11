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
const SUPABASE_PROJECT_URL = normalizeSupabaseProjectUrl(readEnv('SUPABASE_URL'));
const SUPABASE_SERVICE_ROLE_KEY = readEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY');
const SUPABASE_PROPERTY_MEDIA_BUCKET = readEnv('SUPABASE_PROPERTY_MEDIA_BUCKET') || 'property-media';
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

function normalizeSupabaseProjectUrl(value) {
    const raw = String(value || '').trim().replace(/\/+$/, '');
    if (!raw) return '';
    return raw.replace(/\/rest\/v1$/i, '');
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
    const callback = update?.callback_query || null;
    const message = callback?.message || update?.message || update?.channel_post || update?.edited_message || update?.edited_channel_post || {};
    const text = [message.text, message.caption].filter(Boolean).join('\n').trim();
    const photos = Array.isArray(message.photo) ? message.photo : [];
    const bestPhoto = photos.length ? photos[photos.length - 1] : null;
    return {
        updateId: update?.update_id,
        updateType: callback ? 'callback_query' : update?.channel_post ? 'channel_post' : update?.edited_channel_post ? 'edited_channel_post' : update?.edited_message ? 'edited_message' : 'message',
        callbackId: callback?.id || '',
        callbackData: callback?.data || '',
        chatId: message.chat?.id ? String(message.chat.id) : '',
        chatTitle: message.chat?.title || message.chat?.username || '',
        messageId: message.message_id || null,
        messageDate: message.date ? new Date(message.date * 1000).toISOString() : new Date().toISOString(),
        senderId: (callback?.from?.id || message.from?.id) ? String(callback?.from?.id || message.from?.id) : '',
        senderUsername: callback?.from?.username || message.from?.username || '',
        text: callback ? '' : text,
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

function malaysiaDateKey(date = new Date()) {
    try {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kuala_Lumpur',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(date);
        const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
        return `${map.year}-${map.month}-${map.day}`;
    } catch {
        return new Date(date.getTime() + (8 * 60 * 60 * 1000)).toISOString().slice(0, 10);
    }
}

function normalizeDateKey(value = '') {
    const raw = String(value || '').trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : '';
}

function malaysiaDateRange(dateKey) {
    const normalized = normalizeDateKey(dateKey) || malaysiaDateKey();
    const start = new Date(`${normalized}T00:00:00+08:00`);
    const end = new Date(start.getTime() + (24 * 60 * 60 * 1000));
    return {
        date: normalized,
        startIso: start.toISOString(),
        endIso: end.toISOString()
    };
}

function isPlaceholderImportedListing(item = {}) {
    const title = String(item.title || '').trim().toLowerCase();
    const raw = String(item.original_text || item.description || '').trim().toLowerCase();
    const combined = `${title}\n${raw}`;
    const hasTextDetails = raw.length > 30 && !combined.includes('media post without caption');
    return (
        !title
        || combined.includes('[telegram media post without caption]')
        || combined.includes('telegram media post without caption')
        || combined.includes('media post without caption')
        || (title === 'ai imported property' && !hasTextDetails)
    );
}

function hasReviewableListingSignal(item = {}) {
    if (!item || isPlaceholderImportedListing(item)) return false;
    const imageUrls = Array.isArray(item.image_urls) ? item.image_urls : normalizeJsonArray(item.image_urls);
    const searchable = `${item.title || ''} ${item.property_type || ''} ${item.description || ''} ${item.original_text || ''}`;
    return Boolean(
        Number(item.price || 0) > 0
        || Number(item.built_up_sqft || 0) > 0
        || Number(item.bedrooms || 0) > 0
        || Number(item.bathrooms || 0) > 0
        || imageUrls.length >= 4
        || /condo|apartment|residence|terrace|semi|bungalow|shop|office|factory|warehouse|landed|serviced/i.test(searchable)
    );
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

function normalizeJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        const parsed = safeJsonParse(value, null);
        return Array.isArray(parsed) ? parsed : [];
    }
    return [];
}

function hasStorageConfig() {
    return Boolean(SUPABASE_PROJECT_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function sanitizeStorageSegment(value, fallback = 'item') {
    return String(value || fallback)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80) || fallback;
}

function encodeStoragePath(storagePath) {
    return String(storagePath || '')
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');
}

function storagePublicUrl(storagePath) {
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${encodeURIComponent(SUPABASE_PROPERTY_MEDIA_BUCKET)}/${encodeStoragePath(storagePath)}`;
}

function imageExtensionFromMime(mime = '', fallback = 'jpg') {
    const normalized = String(mime || '').toLowerCase();
    if (normalized.includes('png')) return 'png';
    if (normalized.includes('webp')) return 'webp';
    if (normalized.includes('gif')) return 'gif';
    return fallback;
}

function imageMimeFromPath(filePath = '') {
    const lower = String(filePath || '').toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
}

function parseDataImageUrl(value = '') {
    const match = String(value || '').match(/^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([a-z0-9+/=\s]+)$/i);
    if (!match) return null;
    const mime = match[1].toLowerCase().replace('image/jpg', 'image/jpeg');
    const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
    if (!buffer.length) return null;
    if (buffer.length > 10 * 1024 * 1024) {
        throw new Error('Each property photo must be 10MB or smaller after compression.');
    }
    return { buffer, mime, extension: imageExtensionFromMime(mime) };
}

async function uploadSupabaseStorageObject(storagePath, buffer, mime) {
    if (!hasStorageConfig()) {
        throw new Error('Supabase Storage is not configured.');
    }
    const response = await fetch(`${SUPABASE_PROJECT_URL}/storage/v1/object/${encodeURIComponent(SUPABASE_PROPERTY_MEDIA_BUCKET)}/${encodeStoragePath(storagePath)}`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': mime,
            'Cache-Control': '31536000',
            'x-upsert': 'true'
        },
        body: buffer
    });
    const text = await response.text();
    if (!response.ok) {
        throw new Error(`Supabase Storage upload failed: ${text || response.statusText}`);
    }
    return storagePublicUrl(storagePath);
}

async function uploadDataImageToStorage(dataUrl, context = {}) {
    const parsed = parseDataImageUrl(dataUrl);
    if (!parsed) return '';
    const agent = sanitizeStorageSegment(context.agentId || 'agent');
    const listing = sanitizeStorageSegment(context.title || context.listingId || 'listing');
    const label = sanitizeStorageSegment(context.label || `photo-${context.index || 0}`);
    const hash = crypto.createHash('sha1').update(parsed.buffer).digest('hex').slice(0, 16);
    const storagePath = `agent-listings/${agent}/${listing}/${String(context.index || 0).padStart(2, '0')}-${label}-${hash}.${parsed.extension}`;
    return uploadSupabaseStorageObject(storagePath, parsed.buffer, parsed.mime);
}

function normalizePublicGalleryUrls(value) {
    return normalizeJsonArray(value)
        .map((item, index) => {
            const rawUrl = typeof item === 'string' ? item : item?.url || item?.display || item?.image || '';
            const url = String(rawUrl || '').trim();
            if (!url || /^data:image\//i.test(url)) return null;
            if (!/^https?:\/\//i.test(url)) return null;
            return {
                label: typeof item === 'object' && item?.label ? String(item.label) : index === 0 ? "Front View" : `Photo ${index + 1}`,
                required: Boolean(typeof item === 'object' ? item?.required : index < 5),
                url,
                original: typeof item === 'object' ? item?.original || url : url,
                source: typeof item === 'object' ? item?.source || "Agent upload" : "Agent upload",
                status: "verified"
            };
        })
        .filter(Boolean)
        .slice(0, 10);
}

async function prepareAgentGalleryUrls(value, context = {}) {
    const prepared = [];
    const rawItems = normalizeJsonArray(value).slice(0, 10);
    for (let index = 0; index < rawItems.length; index += 1) {
        const item = rawItems[index];
        const rawUrl = typeof item === 'string' ? item : item?.url || item?.display || item?.image || '';
        const url = String(rawUrl || '').trim();
        if (!url) continue;
        const label = typeof item === 'object' && item?.label ? String(item.label) : index === 0 ? 'Front View' : `Photo ${index + 1}`;
        let finalUrl = '';
        let source = typeof item === 'object' ? item?.source || 'Agent upload' : 'Agent upload';
        if (/^data:image\//i.test(url)) {
            finalUrl = await uploadDataImageToStorage(url, { ...context, index, label });
            source = 'Supabase Storage upload';
        } else if (/^https?:\/\//i.test(url)) {
            finalUrl = url;
        }
        if (!finalUrl) continue;
        prepared.push({
            label,
            required: Boolean(typeof item === 'object' ? item?.required : index < 5),
            url: finalUrl,
            original: typeof item === 'object' ? item?.original || finalUrl : finalUrl,
            source,
            status: 'verified'
        });
    }
    return prepared;
}

function parseListingPrice(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value || '').replace(/rm/gi, '').replace(/,/g, '').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeAgentListingStatus(value = 'pending_qc') {
    const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (['approve', 'approved'].includes(normalized)) return 'live';
    if (normalized === 'live') return 'live';
    if (normalized === 'reject' || normalized === 'rejected') return 'rejected';
    return 'pending_qc';
}

async function pickAgentListingPayload(payload = {}) {
    const price = parseListingPrice(payload.price);
    const title = String(payload.title || payload.original_title || '').trim();
    const area = String(payload.area || payload.location || '').trim();
    const agentId = payload.agent_id || payload.agentId || null;

    if (!title) return { error: "Listing title is required." };
    if (!area) return { error: "Listing area is required." };
    if (!price || price <= 0) return { error: "Listing price must be a positive number." };

    const gallery = await prepareAgentGalleryUrls(
        payload.gallery_urls || payload.galleryUrls || payload.gallery || payload.photos || [],
        { agentId, title }
    );
    if (gallery.length < 4) {
        return {
            error: "At least 4 property photos are required. Upload from device/computer or paste public image links."
        };
    }

    return {
        agent_id: agentId,
        title,
        area,
        price,
        property_type: String(payload.property_type || payload.propertyType || "Residential").trim() || "Residential",
        address: String(payload.address || payload.location || area).trim(),
        landlord_name: String(payload.landlord_name || payload.landlordName || '').trim(),
        landlord_phone: cleanPhone(payload.landlord_phone || payload.landlordPhone || ''),
        gallery_urls: gallery,
        ar_link: String(payload.ar_link || payload.arLink || payload.modelUrl || '').trim(),
        status: "pending_qc",
        updated_at: new Date().toISOString()
    };
}

function agentListingToPublicProperty(item) {
    const gallery = normalizePublicGalleryUrls(item.gallery_urls);
    const price = parseListingPrice(item.price);
    const propertyType = item.property_type || "Residential";
    const image = gallery[0]?.url || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";
    const area = item.area || item.address || "Malaysia";
    const type = inferPropertyType(propertyType).toLowerCase();
    const sqft = Number(item.built_up_sqft || 0);
    return {
        id: numericPublicId(`agent-${item.id}`),
        agentListingId: item.id,
        source: "agent_live_upload",
        badge: "live-agent",
        title: item.title || "Agent Property Listing",
        area,
        location: item.address || area,
        type,
        intent: /industrial|commercial/i.test(propertyType) ? "investment" : "family",
        price,
        bedrooms: Number(item.bedrooms || 0),
        bathrooms: Number(item.bathrooms || 0),
        beds: Number(item.bedrooms || 0),
        baths: Number(item.bathrooms || 0),
        sqft,
        psf: sqft && price ? Math.round(price / sqft) : 0,
        image,
        gallery,
        galleryCount: gallery.length,
        whatsapp: item.landlord_phone || "",
        aiScore: 88,
        confidenceScore: 88,
        yield: 4.2,
        growth: 5.1,
        summary: `${propertyType} in ${area}. Admin-approved agent listing with ${gallery.length} verified public image URLs.`,
        vibe: "Admin-approved agent listing",
        tags: ["agent-upload", type, "admin-approved"],
        verifiedType: "agent",
        verificationSource: "admin_approved",
        adminApproved: true,
        approvalStatus: "approved",
        liveStatus: "approved_live",
        freshnessStatus: "fresh",
        createdAt: item.created_at,
        updatedAt: item.updated_at || item.created_at,
        mapLink: `https://www.google.com/maps/search/${encodeURIComponent(item.address || item.area || item.title || "Malaysia")}`,
        agentName: "RealityGenius Verified Agent",
        agencyName: "RealityGenius Agent Network",
        arLink: item.ar_link || "",
        modelUrl: item.ar_link || ""
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

async function sendTelegramMessage(chatId, text, options = {}) {
    if (!TELEGRAM_BOT_TOKEN || !chatId || !text) return null;
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                disable_web_page_preview: true,
                ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {})
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

async function answerTelegramCallback(callbackId, text = '') {
    if (!TELEGRAM_BOT_TOKEN || !callbackId) return null;
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: callbackId, text })
        });
    } catch (error) {
        console.error('[TELEGRAM CALLBACK] Ack failed:', error.message);
    }
    return null;
}

async function getTelegramFilePath(fileId) {
    if (!TELEGRAM_BOT_TOKEN || !fileId) return '';
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok || !payload.result?.file_path) {
        throw new Error(payload.description || 'Telegram file lookup failed.');
    }
    return payload.result.file_path;
}

async function uploadTelegramPhotoToStorage(fileId, meta = {}) {
    if (!fileId || !hasStorageConfig()) return '';
    const filePath = await getTelegramFilePath(fileId);
    const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
    const response = await fetch(downloadUrl);
    if (!response.ok) {
        throw new Error(`Telegram file download failed: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length) return '';
    if (buffer.length > 10 * 1024 * 1024) {
        throw new Error('Telegram photo is larger than the 10MB property media limit.');
    }
    const mime = response.headers.get('content-type')?.startsWith('image/')
        ? response.headers.get('content-type')
        : imageMimeFromPath(filePath);
    const extension = imageExtensionFromMime(mime, path.extname(filePath).replace('.', '') || 'jpg');
    const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 16);
    const chat = sanitizeStorageSegment(meta.chatId || 'telegram');
    const message = sanitizeStorageSegment(meta.messageId || Date.now());
    const storagePath = `telegram-imports/${chat}/${message}/${hash}.${extension}`;
    return uploadSupabaseStorageObject(storagePath, buffer, mime);
}

async function uploadTelegramMediaToStorage(meta = {}) {
    const primaryIds = [
        meta.primaryFileId,
        Array.isArray(meta.fileIds) ? meta.fileIds[meta.fileIds.length - 1] : ''
    ].filter(Boolean);
    const fileIds = [...new Set(primaryIds)].slice(0, 4);
    const urls = [];
    for (const fileId of fileIds) {
        try {
            const uploaded = await uploadTelegramPhotoToStorage(fileId, meta);
            if (uploaded) urls.push(uploaded);
        } catch (error) {
            console.error('[TELEGRAM STORAGE] Photo upload failed:', error.message);
        }
    }
    return urls;
}

function isTelegramDoneText(text = '') {
    return /^(\/done|done|siap|selesai)$/i.test(String(text || '').trim());
}

function isTelegramNewListingText(text = '') {
    return /^(\/newlisting|\/new|new listing|listing baru)$/i.test(String(text || '').trim());
}

function telegramInlineKeyboard(buttons = []) {
    return { inline_keyboard: buttons.map((row) => row.map((button) => ({ text: button.text, callback_data: button.data }))) };
}

function sessionPhotoDoneKeyboard(sessionId) {
    return telegramInlineKeyboard([[{ text: 'Done photos', data: `rg_done_photos:${sessionId}` }]]);
}

function sessionDetailsDoneKeyboard(sessionId) {
    return telegramInlineKeyboard([[{ text: 'Done details - send to admin QC', data: `rg_done_details:${sessionId}` }]]);
}

function sessionCancelKeyboard(sessionId) {
    return telegramInlineKeyboard([[{ text: 'Cancel this listing', data: `rg_cancel:${sessionId}` }]]);
}

async function findActiveTelegramListingSession(chatId) {
    if (!chatId) return null;
    const rows = await selectSupabaseRows(
        'telegram_listing_sessions',
        `select=*&chat_id=${supabaseEq(chatId)}&status=in.(collecting_photos,awaiting_details)&order=updated_at.desc&limit=1`
    );
    return Array.isArray(rows) ? rows[0] || null : null;
}

async function getTelegramListingSession(id) {
    if (!id) return null;
    const rows = await selectSupabaseRows(
        'telegram_listing_sessions',
        `select=*&id=${supabaseEq(id)}&limit=1`
    );
    return Array.isArray(rows) ? rows[0] || null : null;
}

async function createTelegramListingSession(meta) {
    return insertSupabaseRow('telegram_listing_sessions', {
        chat_id: meta.chatId,
        chat_title: meta.chatTitle,
        started_by: meta.senderUsername || meta.senderId || '',
        status: 'collecting_photos',
        updated_at: new Date().toISOString()
    });
}

async function cancelTelegramListingSession(sessionId) {
    return patchSupabaseRow('telegram_listing_sessions', sessionId, {
        status: 'cancelled',
        updated_at: new Date().toISOString()
    });
}

async function appendTelegramSessionPhotos(session, meta) {
    const existing = Array.isArray(session.telegram_file_ids) ? session.telegram_file_ids : [];
    const next = [...new Set([...existing, ...(meta.fileIds || [])])].slice(0, 10);
    return patchSupabaseRow('telegram_listing_sessions', session.id, {
        telegram_file_ids: next,
        updated_at: new Date().toISOString()
    });
}

async function uploadTelegramSessionPhotos(session, meta) {
    const existingUrls = Array.isArray(session.image_urls) ? session.image_urls : [];
    if (existingUrls.length >= 4) return existingUrls;
    const fileIds = Array.isArray(session.telegram_file_ids) ? session.telegram_file_ids.slice(0, 10) : [];
    const urls = [];
    for (const fileId of fileIds) {
        try {
            const uploaded = await uploadTelegramPhotoToStorage(fileId, { ...meta, messageId: session.id });
            if (uploaded) urls.push(uploaded);
        } catch (error) {
            console.error('[TELEGRAM SESSION STORAGE] Photo upload failed:', error.message);
        }
    }
    return [...new Set([...existingUrls, ...urls])].slice(0, 10);
}

async function markTelegramPhotosDone(session, meta) {
    const fileCount = Array.isArray(session.telegram_file_ids) ? session.telegram_file_ids.length : 0;
    if (fileCount < 4) {
        await sendTelegramMessage(
            meta.chatId,
            `Need at least 4 photos before details. Current: ${fileCount}/4. Send more property photos first.`
        );
        return { ok: true, waiting: 'photos', sessionId: session.id };
    }

    await sendTelegramMessage(meta.chatId, 'Uploading photos to RealityGenius cloud storage. One moment...');
    const imageUrls = await uploadTelegramSessionPhotos(session, meta);
    if (imageUrls.length < 4) {
        await sendTelegramMessage(meta.chatId, `Only ${imageUrls.length}/4 photos uploaded successfully. Please send more photos and press Done photos again.`);
        return { ok: true, waiting: 'photos', sessionId: session.id };
    }

    const updated = await patchSupabaseRow('telegram_listing_sessions', session.id, {
        status: 'awaiting_details',
        image_urls: imageUrls,
        updated_at: new Date().toISOString()
    });
    await sendTelegramMessage(
        meta.chatId,
        [
            `Photos saved: ${imageUrls.length}.`,
            'Now send the property details in one message.',
            '',
            'Include: title/location, price, size sqft, bedrooms, bathrooms, property type, tenure, contact phone, and remarks.',
            'After sending details, click Done details.'
        ].join('\n'),
        { replyMarkup: sessionCancelKeyboard(updated.id) }
    );
    return { ok: true, waiting: 'details', sessionId: updated.id };
}

async function saveTelegramSessionDetails(session, meta, rawMessage = null) {
    const existing = String(session.details_text || '').trim();
    const incoming = String(meta.text || '').trim();
    const detailsText = [existing, incoming].filter(Boolean).join('\n\n').slice(0, 5000);
    const updated = await patchSupabaseRow('telegram_listing_sessions', session.id, {
        details_text: detailsText,
        updated_at: new Date().toISOString()
    });
    if (rawMessage?.id) {
        await patchSupabaseRow('telegram_raw_messages', rawMessage.id, {
            processed_status: 'guided_details_collected',
            processed_at: new Date().toISOString()
        });
    }
    await sendTelegramMessage(
        meta.chatId,
        'Property details saved. Click Done details when this one listing is complete.',
        { replyMarkup: sessionDetailsDoneKeyboard(updated.id) }
    );
    return { ok: true, waiting: 'details_done', sessionId: updated.id };
}

async function submitTelegramListingSession(session, meta, rawMessage) {
    const imageUrls = Array.isArray(session.image_urls) ? session.image_urls : [];
    const detailsText = String(session.details_text || '').trim();
    if (imageUrls.length < 4) {
        return markTelegramPhotosDone(session, meta);
    }
    if (!detailsText) {
        await sendTelegramMessage(meta.chatId, 'Send the property details first, then click Done details.');
        return { ok: true, waiting: 'details', sessionId: session.id };
    }

    await sendTelegramMessage(meta.chatId, 'Creating AI import for admin QC...');
    const importMeta = {
        ...meta,
        messageId: Number.isFinite(Number(meta.messageId)) ? meta.messageId : null,
        text: detailsText
    };
    const extraction = await extractListingWithAI(detailsText, importMeta);
    extraction.imageUrls = [...new Set([...imageUrls, ...(extraction.imageUrls || [])])].slice(0, 12);
    extraction.missingFields = (extraction.missingFields || []).filter((field) => field !== 'imageUrls');
    extraction.adminReviewNote = `${extraction.adminReviewNote || ''} Guided Telegram import: ${imageUrls.length} photos collected before details.`.trim();

    const imported = await saveImportedListing(rawMessage, importMeta, extraction);
    await patchSupabaseRow('telegram_listing_sessions', session.id, {
        status: 'submitted',
        import_id: imported.id,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
    await patchSupabaseRow('telegram_raw_messages', rawMessage.id, {
        processed_status: 'guided_import_submitted',
        ai_summary: extraction.title,
        processed_at: new Date().toISOString()
    });
    await createAdminNotification(
        'Telegram guided listing needs review',
        `${extraction.title} was submitted with ${imageUrls.length} photos and is waiting for admin QC.`,
        { importId: imported.id, rawMessageId: rawMessage.id, sessionId: session.id, status: imported.status }
    );
    await sendTelegramMessage(
        meta.chatId,
        `Done. RealityGenius created one complete listing for admin QC: ${extraction.title}. Status: needs_review.`
    );
    return { ok: true, importId: imported.id, sessionId: session.id, status: imported.status };
}

async function handleTelegramCallback(meta, rawMessage) {
    await answerTelegramCallback(meta.callbackId, 'Received');
    const [action, sessionId] = String(meta.callbackData || '').split(':');
    const session = await getTelegramListingSession(sessionId);
    if (!session) {
        await sendTelegramMessage(meta.chatId, 'This listing session was not found. Send /newlisting to start again.');
        return { ok: true, ignored: true, reason: 'Session not found' };
    }
    if (action === 'rg_cancel') {
        await cancelTelegramListingSession(session.id);
        await sendTelegramMessage(meta.chatId, 'Listing draft cancelled. Send /newlisting or send photos to start again.');
        return { ok: true, status: 'cancelled', sessionId: session.id };
    }
    if (action === 'rg_done_photos') return markTelegramPhotosDone(session, meta);
    if (action === 'rg_done_details') return submitTelegramListingSession(session, meta, rawMessage);
    return { ok: true, ignored: true, reason: 'Unknown callback action' };
}

async function handleGuidedTelegramListing(meta, rawMessage) {
    if (meta.callbackData) return handleTelegramCallback(meta, rawMessage);

    if (isTelegramNewListingText(meta.text)) {
        const existing = await findActiveTelegramListingSession(meta.chatId);
        if (existing) await cancelTelegramListingSession(existing.id);
        const session = await createTelegramListingSession(meta);
        await sendTelegramMessage(meta.chatId, 'New listing started. Send at least 4 property photos first. After the 4th photo, click Done photos.');
        return { ok: true, status: 'collecting_photos', sessionId: session.id };
    }

    let session = await findActiveTelegramListingSession(meta.chatId);
    if (meta.fileIds.length) {
        if (!session) session = await createTelegramListingSession(meta);
        if (session.status === 'awaiting_details') {
            await sendTelegramMessage(meta.chatId, 'This listing already has photos. Send property details now, or cancel and start a new listing.');
            return { ok: true, waiting: 'details', sessionId: session.id };
        }
        const updated = await appendTelegramSessionPhotos(session, meta);
        const count = Array.isArray(updated.telegram_file_ids) ? updated.telegram_file_ids.length : 0;
        await patchSupabaseRow('telegram_raw_messages', rawMessage.id, { processed_status: 'guided_photo_collected' });
        await sendTelegramMessage(
            meta.chatId,
            count >= 4
                ? `Photo ${count}/10 received. Minimum 4 reached. Click Done photos when this listing's pictures are complete.`
                : `Photo ${count}/4 received. Send ${4 - count} more photo${4 - count === 1 ? '' : 's'} for this listing.`,
            { replyMarkup: count >= 4 ? sessionPhotoDoneKeyboard(updated.id) : sessionCancelKeyboard(updated.id) }
        );
        return { ok: true, status: 'collecting_photos', photoCount: count, sessionId: updated.id };
    }

    if (session && session.status === 'collecting_photos' && isTelegramDoneText(meta.text)) {
        return markTelegramPhotosDone(session, meta);
    }

    if (session && session.status === 'awaiting_details') {
        if (isTelegramDoneText(meta.text)) return submitTelegramListingSession(session, meta, rawMessage);
        if (meta.text) return saveTelegramSessionDetails(session, meta, rawMessage);
    }

    if (meta.text) {
        await sendTelegramMessage(meta.chatId, 'For Telegram import, send at least 4 photos first. Then click Done photos, send property details, and click Done details.');
        await patchSupabaseRow('telegram_raw_messages', rawMessage.id, { processed_status: 'guided_waiting_for_photos' });
        return { ok: true, waiting: 'photos_first' };
    }

    return null;
}

async function handleTelegramWebhook(update) {
    if (!hasSupabaseConfig()) {
        return { ok: false, error: "Supabase is not configured." };
    }

    const meta = extractTelegramMessage(update);
    if (!meta.updateId) return { ok: true, ignored: true, reason: "No Telegram update id." };

    const rawMessage = await saveRawTelegramMessage(meta);
    const guidedResponse = await handleGuidedTelegramListing(meta, rawMessage);
    if (guidedResponse) return guidedResponse;

    if (!meta.text && !meta.fileIds.length) {
        await patchSupabaseRow("telegram_raw_messages", rawMessage.id, { processed_status: "ignored_empty" });
        await sendTelegramMessage(meta.chatId, "Send at least 4 property photos first. Then click Done photos, send property details, and click Done details.");
        return { ok: true, ignored: true, rawMessageId: rawMessage.id };
    }
    return { ok: true, waiting: "guided_listing_flow" };
}

async function listAdminAiImports(params = {}) {
    const range = malaysiaDateRange(params.date);
    const rows = await selectSupabaseRows(
        "ai_imported_listings",
        [
            "select=*",
            `created_at=gte.${encodeURIComponent(range.startIso)}`,
            `created_at=lt.${encodeURIComponent(range.endIso)}`,
            "order=created_at.desc",
            "limit=100"
        ].join("&")
    );
    return {
        date: range.date,
        items: (rows || []).filter(hasReviewableListingSignal)
    };
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

async function createAgentListing(payload = {}) {
    if (!hasSupabaseConfig()) return { __status: 500, error: "Supabase is not configured." };
    const listing = await pickAgentListingPayload(payload);
    if (listing.error) return { __status: 400, error: listing.error };

    const row = await insertSupabaseRow("agent_property_listings", listing);
    await createAdminNotification(
        "Agent listing needs QC",
        `${row?.title || "New agent listing"} was submitted and is waiting for admin approval.`,
        { listingId: row?.id, category: "agent_listing_qc" }
    );
    return { item: row };
}

async function listAdminAgentListings() {
    if (!hasSupabaseConfig()) return { __status: 500, error: "Supabase is not configured." };
    const rows = await selectSupabaseRows(
        "agent_property_listings",
        "select=*&order=created_at.desc&limit=200"
    );
    return { items: rows || [] };
}

async function reviewAgentListing(payload = {}) {
    if (!hasSupabaseConfig()) return { __status: 500, error: "Supabase is not configured." };
    const id = payload.id;
    if (!id) return { __status: 400, error: "Listing id is required." };

    const status = normalizeAgentListingStatus(payload.status || payload.action);
    const updates = {
        status,
        rejection_reason: status === "rejected" ? String(payload.rejection_reason || payload.rejectionReason || '').trim() : null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: payload.reviewedBy || "admin",
        updated_at: new Date().toISOString()
    };

    const row = await patchSupabaseRow("agent_property_listings", id, updates);
    await createAdminNotification(
        `Agent listing ${status}`,
        `${row?.title || "Agent listing"} is now ${status}.`,
        { listingId: id, category: "agent_listing_qc", status }
    );
    return { item: row };
}

async function listPublicProperties() {
    if (!hasSupabaseConfig()) return { items: [] };
    const importedRows = await selectSupabaseRows(
        "ai_imported_listings",
        "select=*&status=in.(approved,live)&order=updated_at.desc&limit=100"
    );
    const agentRows = await selectSupabaseRows(
        "agent_property_listings",
        "select=*&status=in.(approved,live)&order=updated_at.desc&limit=100"
    );
    const items = [
        ...(importedRows || []).map(importedListingToPublicProperty),
        ...(agentRows || []).map(agentListingToPublicProperty)
    ]
        .filter((item) => item && item.title && Number(item.price || 0) > 0)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    return { items };
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
                routes: [
                    "/api/telegram/webhook",
                    "/api/telegram/health",
                    "/api/agent/listings",
                    "/api/admin/listings",
                    "/api/admin/listings/review",
                    "/api/admin/ai-imports?date=YYYY-MM-DD",
                    "/api/properties"
                ],
                config: {
                    supabase: hasSupabaseConfig(),
                    storage: hasStorageConfig(),
                    mediaBucket: SUPABASE_PROPERTY_MEDIA_BUCKET,
                    openai: Boolean(HAS_OPENAI && openai),
                    telegramBot: Boolean(TELEGRAM_BOT_TOKEN),
                    telegramWebhookSecret: Boolean(TELEGRAM_WEBHOOK_SECRET),
                    guidedTelegramListingFlow: true,
                    dailyAiImportCalendar: true,
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
            return listAdminAiImports(payload);
        }

        if (url === '/api/admin/ai-imports/review') {
            const auth = requireAdminAccess(req);
            if (!auth.ok) return { __status: auth.status, error: auth.error };
            return reviewAiImport(payload);
        }

        if (url === '/api/agent/listings') {
            return createAgentListing(payload);
        }

        if (url === '/api/admin/listings') {
            const auth = requireAdminAccess(req);
            if (!auth.ok) return { __status: auth.status, error: auth.error };
            return listAdminAgentListings();
        }

        if (url === '/api/admin/listings/review') {
            const auth = requireAdminAccess(req);
            if (!auth.ok) return { __status: auth.status, error: auth.error };
            return reviewAgentListing(payload);
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
            const response = await routeManager(routePath, Object.fromEntries(requestUrl.searchParams.entries()));
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
        const maxBodyBytes = routePath === '/api/agent/listings' ? 35 * 1024 * 1024 : 1024 * 1024;
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > maxBodyBytes) {
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
