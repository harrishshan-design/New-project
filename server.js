require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Stripe = require('stripe');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'kvai_database.json');
const LISTINGS_FILE = path.join(__dirname, 'backend', 'data', 'listings.json');
const aiProvider = require('./ai-provider');
const HAS_OPENAI = aiProvider.HAS_OPENAI;
const HAS_ANTHROPIC = aiProvider.HAS_ANTHROPIC;
const GOOGLE_MAPS_API_KEY = readEnv('GOOGLE_MAPS_API_KEY', 'GOOGLE_API_KEY');
const FRONTEND_URL = normalizeOrigin(readEnv('FRONTEND_URL'));
const SUPABASE_REST_URL = normalizeSupabaseRestUrl(readEnv('SUPABASE_URL'));
const SUPABASE_PROJECT_URL = normalizeSupabaseProjectUrl(readEnv('SUPABASE_URL'));
const SUPABASE_SERVICE_ROLE_KEY = readEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY');
const SUPABASE_PROPERTY_MEDIA_BUCKET = readEnv('SUPABASE_PROPERTY_MEDIA_BUCKET') || 'property-media';
const TELEGRAM_BOT_TOKEN = readEnv('TELEGRAM_BOT_TOKEN');
const TELEGRAM_WEBHOOK_SECRET = readEnv('TELEGRAM_WEBHOOK_SECRET');
const REALITYGENIUS_MASTER_PHONE = cleanPhone(readEnv('REALITYGENIUS_MASTER_PHONE') || '018-9676625');
const ADMIN_API_KEY = readEnv('ADMIN_API_KEY');
const STRIPE_SECRET_KEY = readEnv('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = readEnv('STRIPE_WEBHOOK_SECRET');
const STRIPE_STARTER_PRICE_ID = readEnv('STRIPE_STARTER_PRICE_ID');
const STRIPE_PRO_PRICE_ID = readEnv('STRIPE_PRO_PRICE_ID');
const STRIPE_ELITE_PRICE_ID = readEnv('STRIPE_ELITE_PRICE_ID');
const STRIPE_EXTRA_AUCTION_PRICE_ID = readEnv('STRIPE_EXTRA_AUCTION_PRICE_ID');
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' }) : null;
const {
    DEMO_IMAGES: AR_DEMO_IMAGES,
    imageDataUrl: arImageDataUrl,
    makeArProjectId,
    normalizeStyle: normalizeArStyle,
    parseMultipart: parseArMultipart,
    stagingPrompt: arStagingPrompt,
    tryOpenAiImageEdit
} = require('./api/ar/_utils');

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

// Local JSON store is a dev-only fallback for when Supabase isn't configured
// (production writes leads/location searches straight to Supabase - see
// logLocationDemand() and the /api/leads handler below).
if (!hasSupabaseConfig()) {
    if (!fs.existsSync(DB_FILE)) {
        writeDatabase({});
    } else {
        writeDatabase(readDatabase());
    }
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

async function logLocationDemand(payload, google, suggestions) {
    const query = normalizeQuery(payload.query);
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

    if (hasSupabaseConfig()) {
        try {
            await insertSupabaseRow('location_searches', {
                query_hash: entry.queryHash,
                redacted_query: entry.redactedQuery,
                query_type: entry.queryType,
                filter: entry.filter,
                google_status: entry.googleStatus,
                suggestion_count: entry.suggestionCount,
                source: entry.source
            });
        } catch (error) {
            console.error('[Supabase] Failed to log location demand:', error.message);
        }
        return entry;
    }

    const db = readDatabase();
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

async function upsertSupabaseRow(table, body, conflict = 'email') {
    const rows = await supabaseRequest(`${table}?on_conflict=${encodeURIComponent(conflict)}`, {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=representation',
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

function normalizeAuthRole(role = '') {
    const normalized = String(role || '').trim().toLowerCase();
    if (normalized === 'buyer' || normalized === 'customer') return 'user';
    if (['user', 'agent', 'admin', 'master'].includes(normalized)) return normalized;
    return '';
}

function getBearerToken(req) {
    return normalizeHeaderValue(req.headers.authorization).replace(/^Bearer\s+/i, '').trim();
}

const PLAN_FEATURES = {
    free: {
        ai_content_creator: false,
        whatsapp_followups: false,
        ar_builder_demo: false,
        ar_builder_saved: false,
        document_vault: false,
        dsr_calculator: false,
        viewing_itinerary: false,
        co_broke_matchmaker: false,
        auction_slots: 0,
        referral_autopilot: false,
        team_setup: false
    },
    starter_rg: {
        ai_content_creator: true,
        whatsapp_followups: true,
        ar_builder_demo: true,
        ar_builder_saved: false,
        document_vault: false,
        dsr_calculator: false,
        viewing_itinerary: false,
        co_broke_matchmaker: false,
        auction_slots: 0,
        referral_autopilot: false,
        team_setup: false
    },
    elite_agent: {
        ai_content_creator: true,
        whatsapp_followups: true,
        ar_builder_demo: true,
        ar_builder_saved: true,
        document_vault: true,
        dsr_calculator: true,
        viewing_itinerary: true,
        co_broke_matchmaker: true,
        auction_slots: 1,
        referral_autopilot: false,
        team_setup: false
    },
    best_closers: {
        ai_content_creator: true,
        whatsapp_followups: true,
        ar_builder_demo: true,
        ar_builder_saved: true,
        document_vault: true,
        dsr_calculator: true,
        viewing_itinerary: true,
        co_broke_matchmaker: true,
        auction_slots: 4,
        referral_autopilot: true,
        team_setup: true
    }
};

function stripePriceMap() {
    return {
        starter_rg: STRIPE_STARTER_PRICE_ID,
        elite_agent: STRIPE_ELITE_PRICE_ID || STRIPE_PRO_PRICE_ID,
        extra_auction_slot: STRIPE_EXTRA_AUCTION_PRICE_ID
    };
}

function normalizeStripePlan(plan = '') {
    const normalized = String(plan || '').trim().toLowerCase();
    if (['starter', 'starter_rg'].includes(normalized)) return 'starter_rg';
    if (['pro', 'elite', 'premium', 'elite_agent'].includes(normalized)) return 'elite_agent';
    if (['best', 'best_closers'].includes(normalized)) return 'best_closers';
    if (normalized === 'free') return 'free';
    return '';
}

function legacyStripePlan(plan = '') {
    const normalized = normalizeStripePlan(plan);
    if (normalized === 'starter_rg') return 'starter';
    if (normalized === 'elite_agent' || normalized === 'best_closers') return 'elite';
    return 'free';
}

async function findUserByEmail(email = '') {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) return null;
    const rows = await selectSupabaseRows(
        'users',
        `select=*&email=${supabaseEq(cleanEmail)}&limit=1`
    );
    return Array.isArray(rows) ? rows[0] || null : null;
}

async function updateAgentStripePlan({ email, userId, plan, status, customerId, subscriptionId, checkoutSessionId }) {
    const cleanPlan = normalizeStripePlan(plan);
    const legacyPlan = legacyStripePlan(cleanPlan);
    const permissions = PLAN_FEATURES[cleanPlan] || PLAN_FEATURES.free;
    let user = null;
    if (userId) {
        const rows = await selectSupabaseRows('users', `select=*&id=${supabaseEq(userId)}&limit=1`);
        user = Array.isArray(rows) ? rows[0] || null : null;
    }
    if (!user?.id) {
        user = await findUserByEmail(email);
    }
    if (!user?.id || !cleanPlan) return null;
    const currentProfile = typeof user.profile_json === 'string' ? safeJsonParse(user.profile_json, {}) : user.profile_json || {};
    return patchSupabaseRow('users', user.id, {
        plan: legacyPlan,
        subscription_plan: cleanPlan,
        subscription_status: status || 'active',
        stripe_customer_id: customerId || user.stripe_customer_id || null,
        stripe_subscription_id: subscriptionId || user.stripe_subscription_id || null,
        auction_slots_monthly: Number(permissions.auction_slots || 0),
        features_unlocked: (status || 'active') === 'active' && cleanPlan !== 'free',
        profile_json: {
            ...currentProfile,
            subscription: {
                planId: legacyPlan,
                subscriptionPlan: cleanPlan,
                status,
                provider: 'stripe',
                customerId: customerId || currentProfile.subscription?.customerId || '',
                subscriptionId: subscriptionId || currentProfile.subscription?.subscriptionId || '',
                checkoutSessionId: checkoutSessionId || currentProfile.subscription?.checkoutSessionId || '',
                updatedAt: new Date().toISOString()
            }
        },
        updated_at: new Date().toISOString()
    });
}

async function createStripeCheckoutSession(payload = {}, req = null) {
    if (!stripe) return { __status: 500, error: 'STRIPE_SECRET_KEY is not configured.' };
    const plan = normalizeStripePlan(payload.plan || payload.planId);
    const price = stripePriceMap()[plan];
    if (!['starter_rg', 'elite_agent'].includes(plan)) return { __status: 400, error: 'Choose starter_rg or elite_agent.' };
    if (!price) return { __status: 500, error: `Stripe price id is missing for ${plan}.` };

    let profile = null;
    const token = req ? getBearerToken(req) : '';
    if (!token) return { __status: 401, error: 'Login required before upgrading.' };
    try {
        const authUser = await getSupabaseAuthUser(token);
        const row = await findUserByEmail(authUser.email);
        if (!row?.id) return { __status: 404, error: 'Approved agent profile not found.' };
        profile = profileFromAuthUser(authUser, row);
    } catch {
        return { __status: 401, error: 'Login required before upgrading.' };
    }
    if (String(profile?.role || '').toLowerCase() !== 'agent') return { __status: 403, error: 'Only agent accounts can buy agent subscriptions.' };
    if (!['active', 'approved'].includes(String(profile?.status || '').toLowerCase())) {
        return { __status: 403, error: `Agent account is ${profile?.status || 'not approved'}.` };
    }

    const email = profile.email;
    const agentId = profile.id || profile.auth_user_id || '';
    const origin = FRONTEND_URL || 'https://realitygenius.company';
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email || undefined,
        client_reference_id: agentId || undefined,
        line_items: [{ price, quantity: 1 }],
        success_url: `${origin}/agent.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/agent.html?payment=cancelled`,
        metadata: {
            plan,
            email,
            agent_id: agentId,
            userId: agentId
        },
        subscription_data: {
            metadata: {
                plan,
                email,
                agent_id: agentId,
                userId: agentId
            }
        }
    });

    return { id: session.id, url: session.url };
}

async function handleStripeWebhook(rawBody, signature) {
    if (!stripe) return { __status: 500, error: 'STRIPE_SECRET_KEY is not configured.' };
    if (!STRIPE_WEBHOOK_SECRET) return { __status: 500, error: 'STRIPE_WEBHOOK_SECRET is not configured.' };

    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        return { __status: 400, error: `Stripe webhook signature failed: ${error.message}` };
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        await updateAgentStripePlan({
            email: session.customer_details?.email || session.metadata?.email,
            userId: session.metadata?.agent_id || session.metadata?.userId || session.client_reference_id,
            plan: session.metadata?.plan,
            status: 'active',
            customerId: session.customer,
            subscriptionId: session.subscription,
            checkoutSessionId: session.id
        });
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        await updateAgentStripePlan({
            email: subscription.metadata?.email,
            userId: subscription.metadata?.agent_id || subscription.metadata?.userId,
            plan: subscription.metadata?.plan,
            status: event.type === 'customer.subscription.deleted' ? 'cancelled' : subscription.status,
            customerId: subscription.customer,
            subscriptionId: subscription.id
        });
    }

    if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.payment_failed') {
        const invoice = event.data.object;
        const metadata = invoice.subscription_details?.metadata || invoice.metadata || {};
        await updateAgentStripePlan({
            email: metadata.email || invoice.customer_email,
            userId: metadata.agent_id || metadata.userId,
            plan: metadata.plan,
            status: event.type === 'invoice.payment_failed' ? 'past_due' : 'active',
            customerId: invoice.customer,
            subscriptionId: invoice.subscription || invoice.parent?.subscription_details?.subscription
        });
    }

    return { received: true, type: event.type };
}

async function getSupabaseAuthUser(accessToken) {
    if (!SUPABASE_PROJECT_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase Auth is not configured.');
    }
    const response = await fetch(`${SUPABASE_PROJECT_URL}/auth/v1/user`, {
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
        }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.id) {
        throw new Error(payload?.msg || payload?.message || 'Invalid or expired session.');
    }
    return payload;
}

function profileFromAuthUser(authUser, row = null) {
    const metadata = {
        ...(authUser?.user_metadata || {}),
        ...(authUser?.app_metadata || {}),
        ...(row?.profile_json || {})
    };
    const rowRole = normalizeAuthRole(row?.role || '');
    const metadataRole = normalizeAuthRole(metadata.role || metadata.account_role || '');
    const hasAgentSignals = Boolean(
        metadataRole === 'agent'
        || metadata.launchAccess?.source === 'agent_signup_product_key'
        || metadata.featuresUnlocked === true
        || metadata.subscriptionPlan === 'elite_agent'
        || row?.subscription_plan === 'elite_agent'
        || row?.agency_name
        || row?.ren_id
    );
    const privilegedRole = ['admin', 'master'].includes(rowRole)
        ? rowRole
        : ['admin', 'master'].includes(metadataRole)
            ? metadataRole
            : '';
    const role = privilegedRole || (hasAgentSignals ? 'agent' : (rowRole || metadataRole));
    return {
        id: row?.id || authUser?.id || '',
        auth_user_id: authUser?.id || '',
        name: row?.name || metadata.name || metadata.full_name || String(authUser?.email || '').split('@')[0] || 'RealityGenius User',
        email: row?.email || authUser?.email || '',
        phone: row?.phone || metadata.phone || '',
        role,
        status: row?.status || metadata.status || 'active',
        agency_name: row?.agency_name || metadata.agency_name || '',
        ren_id: row?.ren_id || metadata.ren_id || '',
        profile_json: row?.profile_json || {}
    };
}

function normalizeProductKey(value = '') {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function validAgentProductKeys() {
    return String(readEnv('REALTYGENIUS_AGENT_PRODUCT_KEYS', 'NEXT_PUBLIC_AGENT_PRODUCT_KEYS') || 'RG-AGENT-FULL-2026')
        .split(/[,\s]+/)
        .map(normalizeProductKey)
        .filter(Boolean);
}

function hasAgentFullAccessKey(productKey = '') {
    const normalized = normalizeProductKey(productKey);
    return Boolean(normalized && validAgentProductKeys().includes(normalized));
}

function isValidEmailAddress(value = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function nameFromEmail(email = '') {
    return String(email || '').split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'RealityGenius User';
}

async function createConfirmedSupabaseAuthUser({ email, password, metadata }) {
    if (!SUPABASE_PROJECT_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase Auth admin is not configured.');
    }
    const response = await fetch(`${SUPABASE_PROJECT_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            email_confirm: true,
            user_metadata: metadata,
            app_metadata: {
                role: metadata.role,
                account_role: metadata.account_role
            }
        })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = payload.msg || payload.message || payload.error_description || payload.error || 'Could not create auth user.';
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }
    return payload;
}

async function createDirectSignup(payload = {}) {
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const role = normalizeAuthRole(payload.role || 'user') || 'user';
    const name = String(payload.name || payload.fullName || '').trim() || nameFromEmail(email);
    const phone = cleanPhone(payload.phone || payload.whatsapp || payload.mobile || '');
    const productKey = String(payload.productKey || '');
    const agentFullAccess = role === 'agent' && hasAgentFullAccessKey(productKey);
    const status = role === 'agent' && !agentFullAccess ? 'pending' : 'active';
    const subscriptionPlan = agentFullAccess ? 'elite_agent' : 'free';
    const subscriptionStatus = agentFullAccess ? 'active' : 'inactive';

    if (!['user', 'agent'].includes(role)) return { __status: 403, error: 'Only buyer and agent public signup is allowed.' };
    if (!isValidEmailAddress(email)) return { __status: 400, error: 'Enter a valid email address.' };
    if (password.length < 6) return { __status: 400, error: 'Use a password with at least 6 characters.' };
    if (!phone || phone.length < 8) return { __status: 400, error: 'Enter a valid phone / WhatsApp number.' };

    const metadata = {
        name,
        full_name: name,
        phone,
        role,
        account_role: role,
        status,
        subscriptionPlan,
        subscriptionStatus,
        featuresUnlocked: agentFullAccess,
        emailConfirmedByBackend: true,
        launchAccess: agentFullAccess ? {
            productKey: normalizeProductKey(productKey),
            grantedAt: new Date().toISOString(),
            source: 'agent_signup_product_key'
        } : null
    };

    let authUser;
    try {
        authUser = await createConfirmedSupabaseAuthUser({ email, password, metadata });
    } catch (error) {
        const message = String(error.message || '').toLowerCase();
        if (error.status === 422 || error.status === 409 || message.includes('already')) {
            return { __status: 409, error: 'Email is already registered. Please login instead.' };
        }
        throw error;
    }

    const profilePayload = {
        id: authUser.id,
        email,
        name,
        phone,
        role,
        status,
        plan: agentFullAccess ? 'elite' : 'free',
        subscription_plan: subscriptionPlan,
        subscription_status: subscriptionStatus,
        features_unlocked: agentFullAccess,
        profile_json: metadata,
        updated_at: new Date().toISOString()
    };

    const userRow = await upsertSupabaseRow('users', {
        ...profilePayload,
        password_hash: 'supabase-auth-confirmed',
        created_at: new Date().toISOString()
    }).catch(() => null);
    const profileRow = await upsertSupabaseRow('profiles', profilePayload).catch(() => null);

    return {
        ok: true,
        confirmationRequired: false,
        needsApproval: role === 'agent' && !agentFullAccess,
        profile: profileRow || userRow || profilePayload
    };
}

async function getAuthenticatedProfile(req) {
    const accessToken = getBearerToken(req);
    if (!accessToken) return { __status: 401, error: 'Bearer token is required.' };

    const authUser = await getSupabaseAuthUser(accessToken);
    let row = null;
    if (authUser.email) {
        const rows = await selectSupabaseRows(
            'users',
            `select=*&email=${supabaseEq(authUser.email)}&limit=1`
        );
        row = Array.isArray(rows) ? rows[0] || null : null;
    }

    const profile = profileFromAuthUser(authUser, row);
    if (!row?.id || !profile.role) return { __status: 403, error: 'Account profile is missing or incomplete.', profile };
    return { profile };
}

async function getAgentMe(req) {
    const accessToken = getBearerToken(req);
    if (!accessToken) return { __status: 401, error: 'Bearer token is required.' };

    const authUser = await getSupabaseAuthUser(accessToken);
    const row = authUser.email ? await findUserByEmail(authUser.email) : null;
    if (!row?.id) return { __status: 404, error: 'Agent profile not found.' };

    const profile = profileFromAuthUser(authUser, row);
    if (String(profile.role || '').toLowerCase() !== 'agent') return { __status: 403, error: 'Agent account required.' };

    const subscriptionPlan = normalizeStripePlan(row.subscription_plan || row.profile_json?.subscription?.subscriptionPlan || row.plan) || 'free';
    const subscriptionStatus = String(row.subscription_status || row.profile_json?.subscription?.status || 'inactive').toLowerCase();
    const active = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
    const effectivePlan = active ? subscriptionPlan : 'free';
    const permissions = PLAN_FEATURES[effectivePlan] || PLAN_FEATURES.free;

    return {
        agent: {
            id: row.id,
            email: row.email || authUser.email,
            full_name: row.name || profile.name,
            role: profile.role,
            subscription_plan: effectivePlan,
            raw_subscription_plan: subscriptionPlan,
            subscription_status: subscriptionStatus,
            stripe_customer_id: row.stripe_customer_id || '',
            stripe_subscription_id: row.stripe_subscription_id || '',
            auction_slots_monthly: Number(row.auction_slots_monthly ?? permissions.auction_slots ?? 0),
            permissions,
            features_unlocked: active && effectivePlan !== 'free'
        }
    };
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

function phoneLookupVariants(value = '') {
    const clean = cleanPhone(value);
    if (!clean) return [];
    const variants = new Set([clean, `+${clean}`]);
    if (clean.startsWith('60')) {
        variants.add(`0${clean.slice(2)}`);
    }
    return [...variants];
}

async function findUserByPhone(phone = '') {
    const variants = phoneLookupVariants(phone);
    if (!variants.length) return null;
    const quoted = variants.map((item) => `"${String(item).replace(/"/g, '\\"')}"`).join(',');
    const rows = await selectSupabaseRows(
        'users',
        `select=*&phone=in.(${quoted})&limit=1`
    );
    return Array.isArray(rows) ? rows[0] || null : null;
}

function extractTelegramMessage(update) {
    const callback = update?.callback_query || null;
    const message = callback?.message || update?.message || update?.channel_post || update?.edited_message || update?.edited_channel_post || {};
    const text = [message.text, message.caption].filter(Boolean).join('\n').trim();
    const photos = Array.isArray(message.photo) ? message.photo : [];
    const bestPhoto = photos.length ? photos[photos.length - 1] : null;
    const contactPhone = cleanPhone(message.contact?.phone_number || '');
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
        text: callback ? '' : (contactPhone || text),
        contactPhone,
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
    if (!aiProvider.HAS_AI) return normalizeAiExtraction(null, text, meta);

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
        const content = await aiProvider.generateJsonContent({ system, user });
        return normalizeAiExtraction(safeJsonParse(content || "{}"), text, meta);
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
    const agentProfile = typeof item.agent_profile_json === "string"
        ? safeJsonParse(item.agent_profile_json, {})
        : item.agent_profile_json || {};
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
        whatsapp: agentProfile.phone || item.contact_phone || "",
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
        agentName: agentProfile.name || "RealityGenius AI Import Desk",
        agencyName: agentProfile.agencyName || "RealityGenius"
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
    if (['approve', 'approved'].includes(normalized)) return 'approved';
    if (normalized === 'live') return 'live';
    if (normalized === 'reject' || normalized === 'rejected') return 'rejected';
    return 'pending_qc';
}

async function pickAgentListingPayload(payload = {}) {
    const price = parseListingPrice(payload.price);
    const title = String(payload.title || payload.original_title || '').trim();
    const area = String(payload.area || payload.location || '').trim();
    const agentId = payload.agent_id || payload.agentId || null;
    const existingId = String(payload.id || payload.listingId || payload.backendId || '').trim();

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
        id: existingId || undefined,
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
        source: "admin_approved_agent_listing",
        badge: "verified-agent",
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
    const telegramProfile = await getOrCreateTelegramAgentProfile(meta);
    const agentUser = telegramProfile
        ? await resolveAgentUserForTelegramProfile(telegramProfile, { phone: extraction.contactPhone })
        : null;
    const agentProfileJson = telegramProfile ? {
        name: telegramProfile.full_name || telegramProfile.username || agentUser?.name || '',
        email: telegramProfile.email || agentUser?.email || '',
        phone: cleanPhone(telegramProfile.phone || agentUser?.phone || extraction.contactPhone || ''),
        renId: telegramProfile.ren_id || agentUser?.ren_id || '',
        agencyName: telegramProfile.agency_name || agentUser?.agency_name || 'RealityGenius Telegram Desk',
        telegramUsername: telegramProfile.username || '',
        telegramUserId: telegramProfile.telegram_user_id || meta.senderId || '',
        telegramProfileId: telegramProfile.id || ''
    } : {};
    const existing = await selectSupabaseRows(
        "ai_imported_listings",
        `select=*&dedup_hash=${supabaseEq(dedupHash)}&limit=1`
    );
    if (Array.isArray(existing) && existing[0]) {
        return patchSupabaseRow("ai_imported_listings", existing[0].id, {
            extraction_json: extraction,
            missing_fields: extraction.missingFields,
            confidence_score: extraction.confidenceScore,
            source_sender_id: meta.senderId || existing[0].source_sender_id || null,
            telegram_profile_id: telegramProfile?.id || existing[0].telegram_profile_id || null,
            approved_agent_user_id: agentUser?.id || existing[0].approved_agent_user_id || null,
            agent_profile_json: {
                ...(typeof existing[0].agent_profile_json === 'string' ? safeJsonParse(existing[0].agent_profile_json, {}) : existing[0].agent_profile_json || {}),
                ...agentProfileJson
            },
            updated_at: new Date().toISOString()
        });
    }

    return insertSupabaseRow("ai_imported_listings", {
        raw_message_id: rawMessage.id,
        source: "telegram",
        source_chat_id: meta.chatId,
        source_chat_title: meta.chatTitle,
        source_sender_id: meta.senderId,
        telegram_profile_id: telegramProfile?.id || null,
        approved_agent_user_id: agentUser?.id || null,
        agent_profile_json: agentProfileJson,
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
    return /^(\/newlisting|\/new|new listing|start new listing|listing baru|upload listing)$/i.test(String(text || '').trim());
}

function isTelegramResetText(text = '') {
    return /^(\/reset|reset|start over|restart|mula semula)$/i.test(String(text || '').trim());
}

function isValidProfileEmail(value = '') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function cleanRenId(value = '') {
    const text = String(value || '').trim();
    if (/^skip$/i.test(text)) return '';
    return text;
}

async function getOrCreateTelegramAgentProfile(meta) {
    if (!meta.senderId) return null;
    const rows = await selectSupabaseRows(
        'telegram_agent_profiles',
        `select=*&telegram_user_id=${supabaseEq(meta.senderId)}&limit=1`
    );
    if (Array.isArray(rows) && rows[0]) return rows[0];
    return insertSupabaseRow('telegram_agent_profiles', {
        telegram_user_id: meta.senderId,
        chat_id: meta.chatId,
        chat_title: meta.chatTitle || null,
        username: meta.senderUsername || null,
        onboarding_step: 'full_name',
        updated_at: new Date().toISOString()
    });
}

function telegramReplyKeyboard(rows = []) {
    return {
        keyboard: rows,
        resize_keyboard: true,
        one_time_keyboard: true
    };
}

function telegramContactKeyboard() {
    return telegramReplyKeyboard([[{ text: 'Share my phone', request_contact: true }]]);
}

function telegramRemoveKeyboard() {
    return { remove_keyboard: true };
}

function telegramAgentMenuKeyboard() {
    return telegramReplyKeyboard([
        [{ text: 'Start new listing' }],
        [{ text: 'Reset signup' }, { text: `Contact master ${REALITYGENIUS_MASTER_PHONE}` }]
    ]);
}

async function updateTelegramAgentProfile(profile, updates) {
    return patchSupabaseRow('telegram_agent_profiles', profile.id, {
        ...updates,
        updated_at: new Date().toISOString()
    });
}

async function resetTelegramAgentProfile(meta) {
    const profile = await getOrCreateTelegramAgentProfile(meta);
    if (!profile?.id) return null;
    return updateTelegramAgentProfile(profile, {
        full_name: null,
        email: null,
        phone: null,
        ren_id: null,
        agency_name: null,
        co_broke_interest: null,
        onboarding_step: 'full_name',
        onboarding_completed_at: null
    });
}

async function resolveAgentUserForTelegramProfile(profile = {}, fallback = {}) {
    const phone = cleanPhone(profile.phone || fallback.phone || fallback.contact_phone || '');
    const email = String(profile.email || fallback.email || '').trim().toLowerCase();
    const name = String(profile.full_name || profile.username || fallback.name || '').trim();
    const renId = cleanRenId(profile.ren_id || fallback.ren_id || '');
    const agencyName = String(profile.agency_name || fallback.agency_name || 'RealityGenius Telegram Desk').trim();
    const coBrokeInterest = String(profile.co_broke_interest || fallback.co_broke_interest || '').trim();

    let user = phone ? await findUserByPhone(phone) : null;
    if (!user && email) user = await findUserByEmail(email);
    if (!user && (phone || email)) {
        user = await insertSupabaseRow('users', {
            name: name || profile.username || 'Telegram Agent',
            email: email || `telegram-${profile.telegram_user_id || Date.now()}@realitygenius.local`,
            phone,
            role: 'agent',
            status: 'pending',
            agency_name: agencyName,
            ren_id: renId || null,
            password_hash: `telegram-profile:${crypto.randomUUID()}`,
            profile_json: {
                source: 'telegram_onboarding',
                telegramUserId: profile.telegram_user_id || null,
                telegramUsername: profile.username || null,
                telegramProfileId: profile.id || null,
                coBrokeInterest,
                masterPhone: REALITYGENIUS_MASTER_PHONE,
                createdFromTelegramAt: new Date().toISOString()
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    } else if (user?.id) {
        const currentProfile = typeof user.profile_json === 'string' ? safeJsonParse(user.profile_json, {}) : user.profile_json || {};
        user = await patchSupabaseRow('users', user.id, {
            name: user.name || name || profile.username || 'Telegram Agent',
            phone: user.phone || phone,
            role: 'agent',
            agency_name: user.agency_name || agencyName,
            ren_id: user.ren_id || renId || null,
            profile_json: {
                ...currentProfile,
                telegramUserId: profile.telegram_user_id || currentProfile.telegramUserId || null,
                telegramUsername: profile.username || currentProfile.telegramUsername || null,
                telegramProfileId: profile.id || currentProfile.telegramProfileId || null,
                coBrokeInterest: coBrokeInterest || currentProfile.coBrokeInterest || '',
                masterPhone: currentProfile.masterPhone || REALITYGENIUS_MASTER_PHONE,
                telegramLinkedAt: currentProfile.telegramLinkedAt || new Date().toISOString()
            },
            updated_at: new Date().toISOString()
        });
    }

    if (user?.id && profile.id) {
        await patchSupabaseRow('telegram_agent_profiles', profile.id, {
            user_id: user.id,
            phone,
            email: email || profile.email || user.email || null,
            updated_at: new Date().toISOString()
        }).catch(() => null);
    }
    return user || null;
}

async function handleTelegramAgentOnboarding(meta) {
    if (meta.callbackData) return null;
    const profile = await getOrCreateTelegramAgentProfile(meta);
    if (!profile || profile.onboarding_step === 'complete') return null;

    const text = String(meta.text || '').trim();
    if (isTelegramResetText(text)) {
        await resetTelegramAgentProfile(meta);
        await sendTelegramMessage(
            meta.chatId,
            'RealityGenius signup reset. Let us start simple. What is your full name?',
            { replyMarkup: telegramRemoveKeyboard() }
        );
        return { ok: true, onboarding: true, step: 'full_name', reset: true };
    }

    if (!text || /^\/start\b/i.test(text)) {
        await sendTelegramMessage(
            meta.chatId,
            [
                'Welcome to RealityGenius.',
                'Quick agent signup takes less than 1 minute.',
                '',
                'We only collect enough information to contact you, assign listings, and support co-broke.',
                '',
                'What is your full name?'
            ].join('\n'),
            { replyMarkup: telegramRemoveKeyboard() }
        );
        return { ok: true, onboarding: true, step: profile.onboarding_step };
    }

    if (profile.onboarding_step === 'full_name') {
        if (text.length < 2) {
            await sendTelegramMessage(meta.chatId, 'Please send your full name first.');
            return { ok: true, onboarding: true, step: 'full_name' };
        }
        await updateTelegramAgentProfile(profile, { full_name: text, onboarding_step: 'phone' });
        await sendTelegramMessage(
            meta.chatId,
            'Thanks. What is your phone / WhatsApp number? Example: 0189676625 or +60189676625.',
            { replyMarkup: telegramContactKeyboard() }
        );
        return { ok: true, onboarding: true, step: 'phone' };
    }

    if (profile.onboarding_step === 'email') {
        const email = isValidProfileEmail(text) ? text.toLowerCase() : '';
        await updateTelegramAgentProfile(profile, { email: email || null, onboarding_step: 'phone' });
        await sendTelegramMessage(meta.chatId, 'What is your phone / WhatsApp number? Example: 0189676625 or +60189676625.');
        return { ok: true, onboarding: true, step: 'phone' };
    }

    if (profile.onboarding_step === 'phone') {
        const phone = cleanPhone(meta.contactPhone || text);
        if (!phone) {
            await sendTelegramMessage(meta.chatId, 'Please send a valid phone number. Example: +60123456789.');
            return { ok: true, onboarding: true, step: 'phone' };
        }
        const updatedProfile = await updateTelegramAgentProfile(profile, { phone, onboarding_step: 'agency_name' });
        await resolveAgentUserForTelegramProfile(updatedProfile, { phone });
        await sendTelegramMessage(
            meta.chatId,
            'Which agency / area do you focus on? Example: IQI KL, REN team Shah Alam, Klang Valley rentals. Type skip if not ready.',
            { replyMarkup: telegramReplyKeyboard([[{ text: 'Skip' }]]) }
        );
        return { ok: true, onboarding: true, step: 'agency_name' };
    }

    if (profile.onboarding_step === 'agency_name') {
        const agencyName = /^skip$/i.test(text) ? 'RealityGenius Telegram Desk' : text.slice(0, 120);
        await updateTelegramAgentProfile(profile, { agency_name: agencyName, onboarding_step: 'co_broke_interest' });
        await sendTelegramMessage(
            meta.chatId,
            'Are you open to co-broke opportunities with other RealityGenius agents?',
            {
                replyMarkup: telegramInlineKeyboard([
                    [{ text: 'Yes, co-broke', data: 'rg_cobroke:yes' }],
                    [{ text: 'Not now', data: 'rg_cobroke:no' }]
                ])
            }
        );
        return { ok: true, onboarding: true, step: 'co_broke_interest' };
    }

    if (profile.onboarding_step === 'co_broke_interest') {
        const answer = /^(yes|y|open|co.?broke|sure|ok)/i.test(text) ? 'yes' : /^(no|not now|later)/i.test(text) ? 'no' : '';
        if (!answer) {
            await sendTelegramMessage(
                meta.chatId,
                'Please choose one option.',
                {
                    replyMarkup: telegramInlineKeyboard([
                        [{ text: 'Yes, co-broke', data: 'rg_cobroke:yes' }],
                        [{ text: 'Not now', data: 'rg_cobroke:no' }]
                    ])
                }
            );
            return { ok: true, onboarding: true, step: 'co_broke_interest' };
        }
        const updatedProfile = await updateTelegramAgentProfile(profile, {
            co_broke_interest: answer,
            onboarding_step: 'complete',
            onboarding_completed_at: new Date().toISOString()
        });
        await resolveAgentUserForTelegramProfile(updatedProfile, { co_broke_interest: answer });
        await createAdminNotification(
            'Telegram agent signed up',
            `${updatedProfile.full_name || updatedProfile.username || 'New agent'} signed up by Telegram. Phone: ${updatedProfile.phone || 'pending'}. Co-broke: ${answer}. Master contact: ${REALITYGENIUS_MASTER_PHONE}.`,
            { category: 'telegram_agent_signup', telegramProfileId: updatedProfile.id, phone: updatedProfile.phone, coBrokeInterest: answer }
        );
        await sendTelegramMessage(
            meta.chatId,
            [
                'Done. Your RealityGenius agent profile is created.',
                `Co-broke: ${answer === 'yes' ? 'Yes' : 'Not now'}`,
                `Master contact: ${REALITYGENIUS_MASTER_PHONE}`,
                '',
                'Now upload your listing: send at least 4 property photos first, then click Done photos.'
            ].join('\n'),
            { replyMarkup: telegramAgentMenuKeyboard() }
        );
        return { ok: true, onboarding: true, step: 'complete' };
    }

    if (profile.onboarding_step === 'ren_id') {
        const updatedProfile = await updateTelegramAgentProfile(profile, {
            ren_id: cleanRenId(text) || null,
            onboarding_step: 'complete',
            onboarding_completed_at: new Date().toISOString()
        });
        await resolveAgentUserForTelegramProfile(updatedProfile);
        await sendTelegramMessage(meta.chatId, 'Profile received. Now upload your listing: send at least 4 property photos first, then click Done photos.');
        return { ok: true, onboarding: true, step: 'complete' };
    }

    return null;
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
    if (action === 'rg_cobroke') {
        const profile = await getOrCreateTelegramAgentProfile(meta);
        if (!profile) return { ok: true, ignored: true, reason: 'No Telegram profile' };
        const answer = sessionId === 'yes' ? 'yes' : 'no';
        const updatedProfile = await updateTelegramAgentProfile(profile, {
            co_broke_interest: answer,
            onboarding_step: 'complete',
            onboarding_completed_at: new Date().toISOString()
        });
        await resolveAgentUserForTelegramProfile(updatedProfile, { co_broke_interest: answer });
        await createAdminNotification(
            'Telegram agent signed up',
            `${updatedProfile.full_name || updatedProfile.username || 'New agent'} signed up by Telegram. Phone: ${updatedProfile.phone || 'pending'}. Co-broke: ${answer}. Master contact: ${REALITYGENIUS_MASTER_PHONE}.`,
            { category: 'telegram_agent_signup', telegramProfileId: updatedProfile.id, phone: updatedProfile.phone, coBrokeInterest: answer }
        );
        await sendTelegramMessage(
            meta.chatId,
            [
                'Done. Your RealityGenius agent profile is created.',
                `Co-broke: ${answer === 'yes' ? 'Yes' : 'Not now'}`,
                `Master contact: ${REALITYGENIUS_MASTER_PHONE}`,
                '',
                'Now upload your listing: send at least 4 property photos first, then click Done photos.'
            ].join('\n'),
            { replyMarkup: telegramAgentMenuKeyboard() }
        );
        return { ok: true, onboarding: true, step: 'complete' };
    }
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
        await sendTelegramMessage(
            meta.chatId,
            'New listing started. Send at least 4 property photos first. After the 4th photo, click Done photos.',
            { replyMarkup: sessionCancelKeyboard(session.id) }
        );
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
        await sendTelegramMessage(
            meta.chatId,
            'For Telegram import, tap Start new listing or send at least 4 photos first. Then click Done photos, send property details, and click Done details.',
            { replyMarkup: telegramAgentMenuKeyboard() }
        );
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
    if (isTelegramResetText(meta.text)) {
        await resetTelegramAgentProfile(meta);
        await patchSupabaseRow("telegram_raw_messages", rawMessage.id, { processed_status: "agent_onboarding_reset" });
        await sendTelegramMessage(
            meta.chatId,
            'RealityGenius signup reset. Let us start simple. What is your full name?',
            { replyMarkup: telegramRemoveKeyboard() }
        );
        return { ok: true, onboarding: true, step: 'full_name', reset: true };
    }
    const onboardingResponse = await handleTelegramAgentOnboarding(meta);
    if (onboardingResponse) {
        await patchSupabaseRow("telegram_raw_messages", rawMessage.id, { processed_status: "agent_onboarding" });
        return onboardingResponse;
    }

    const guidedResponse = await handleGuidedTelegramListing(meta, rawMessage);
    if (guidedResponse) return guidedResponse;

    if (!meta.text && !meta.fileIds.length) {
        await patchSupabaseRow("telegram_raw_messages", rawMessage.id, { processed_status: "ignored_empty" });
        await sendTelegramMessage(
            meta.chatId,
            "Tap Start new listing or send at least 4 property photos first. Then click Done photos, send property details, and click Done details.",
            { replyMarkup: telegramAgentMenuKeyboard() }
        );
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
    const items = await attachTelegramProfilesToImports((rows || []).filter(hasReviewableListingSignal));
    return {
        date: range.date,
        items
    };
}

async function attachTelegramProfilesToImports(items = []) {
    const senderIds = [...new Set(items.map((item) => item.source_sender_id).filter(Boolean))];
    if (!senderIds.length) return items;
    try {
        const profileRows = await selectSupabaseRows(
            "telegram_agent_profiles",
            `select=*&telegram_user_id=in.(${senderIds.map((id) => `"${String(id).replace(/"/g, '\\"')}"`).join(",")})`
        );
        const profilesBySender = new Map((profileRows || []).map((profile) => [String(profile.telegram_user_id), profile]));
        return items.map((item) => ({
            ...item,
            telegram_profile: profilesBySender.get(String(item.source_sender_id)) || null
        }));
    } catch (error) {
        console.error("[ADMIN AI IMPORTS] Unable to attach Telegram profiles:", error.message);
        return items;
    }
}

function pickAgentProfileEdits(payload = {}) {
    const edits = payload.agentProfile || payload.profile || {};
    const cleanEmail = String(edits.email || "").trim().toLowerCase();
    return {
        full_name: String(edits.fullName || edits.full_name || "").trim(),
        email: cleanEmail,
        phone: cleanPhone(edits.phone || ""),
        ren_id: /^skip$/i.test(String(edits.renId || edits.ren_id || "").trim()) ? "" : String(edits.renId || edits.ren_id || "").trim(),
        agency_name: String(edits.agencyName || edits.agency_name || "RealityGenius Telegram Desk").trim()
    };
}

function isValidEmailAddress(value = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

async function resolveImportTelegramProfile(importRow) {
    if (!importRow?.source_sender_id) return null;
    const rows = await selectSupabaseRows(
        "telegram_agent_profiles",
        `select=*&telegram_user_id=${supabaseEq(importRow.source_sender_id)}&limit=1`
    );
    return Array.isArray(rows) ? rows[0] || null : null;
}

async function createOrUpdateAgentFromTelegramProfile(importRow, payload) {
    const telegramProfile = await resolveImportTelegramProfile(importRow);
    const edits = pickAgentProfileEdits(payload);
    const name = edits.full_name || telegramProfile?.full_name || "";
    const email = edits.email || telegramProfile?.email || "";
    const phone = edits.phone || telegramProfile?.phone || importRow.contact_phone || "";
    const renId = edits.ren_id || telegramProfile?.ren_id || "";
    const agencyName = edits.agency_name || "RealityGenius Telegram Desk";

    if (!name || name.length < 2) throw new Error("Agent full name is required before approving.");
    if (!isValidEmailAddress(email)) throw new Error("Valid agent email is required before approving.");
    if (!phone || phone.length < 7) throw new Error("Agent phone is required before approving.");

    if (telegramProfile?.id) {
        await patchSupabaseRow("telegram_agent_profiles", telegramProfile.id, {
            full_name: name,
            email,
            phone,
            ren_id: renId || null,
            onboarding_step: "complete",
            onboarding_completed_at: telegramProfile.onboarding_completed_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }

    const existingByPhone = await findUserByPhone(phone);
    const existingByEmail = email ? await findUserByEmail(email) : null;
    const existingUser = existingByPhone || existingByEmail;
    const profileJson = {
        source: "telegram_admin_qc",
        telegramUserId: importRow.source_sender_id || telegramProfile?.telegram_user_id || null,
        telegramProfileId: telegramProfile?.id || null,
        sourceChatId: importRow.source_chat_id || null,
        sourceChatTitle: importRow.source_chat_title || null,
        approvedImportId: importRow.id,
        approvedAt: new Date().toISOString()
    };
    const userPayload = {
        name,
        email,
        phone,
        role: "agent",
        status: "active",
        agency_name: agencyName,
        ren_id: renId || null,
        profile_json: profileJson,
        updated_at: new Date().toISOString()
    };

    const user = existingUser?.id
        ? await patchSupabaseRow("users", existingUser.id, userPayload)
        : await insertSupabaseRow("users", {
            ...userPayload,
            password_hash: `telegram-qc:${crypto.randomUUID()}`,
            created_at: new Date().toISOString()
        });

    if (telegramProfile?.id) {
        await patchSupabaseRow("telegram_agent_profiles", telegramProfile.id, {
            user_id: user.id,
            updated_at: new Date().toISOString()
        }).catch(() => null);
    }

    return { user, telegramProfile, cleanedProfile: { name, email, phone, renId, agencyName } };
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

    const currentRows = await selectSupabaseRows(
        "ai_imported_listings",
        `select=*&id=${supabaseEq(id)}&limit=1`
    );
    const currentImport = Array.isArray(currentRows) ? currentRows[0] : null;
    if (!currentImport) return { __status: 404, error: "AI import was not found." };

    let agentApproval = null;
    if (["approve", "approved", "live"].includes(action)) {
        agentApproval = await createOrUpdateAgentFromTelegramProfile(currentImport, payload);
    }

    const updates = {
        ...pickImportEdits(payload),
        updated_at: new Date().toISOString()
    };
    if (agentApproval?.user) {
        updates.approved_agent_user_id = agentApproval.user.id;
        updates.telegram_profile_id = agentApproval.telegramProfile?.id || null;
        updates.agent_profile_json = agentApproval.cleanedProfile;
    }
    const status = statusByAction[action];
    if (status) {
        updates.status = status;
        updates.reviewed_at = new Date().toISOString();
        updates.reviewed_by = payload.reviewedBy || "admin";
    }

    const row = await patchSupabaseRow("ai_imported_listings", id, updates);
    await createAdminNotification(
        `AI import ${status || "edited"}`,
        `${row?.title || "Imported listing"} is now ${status || "edited"}${agentApproval?.user ? ` for ${agentApproval.user.name}` : ""}.`,
        { importId: id, action, agentUserId: agentApproval?.user?.id || null }
    );
    return { item: { ...row, telegram_profile: agentApproval?.telegramProfile || null, approved_agent: agentApproval?.user || null } };
}

async function createAgentListing(payload = {}) {
    if (!hasSupabaseConfig()) return { __status: 500, error: "Supabase is not configured." };
    const listing = await pickAgentListingPayload(payload);
    if (listing.error) return { __status: 400, error: listing.error };

    const existingId = listing.id;
    delete listing.id;
    const row = existingId
        ? await patchSupabaseRow("agent_property_listings", existingId, listing)
        : await insertSupabaseRow("agent_property_listings", listing);
    await createAdminNotification(
        existingId ? "Updated agent listing needs QC" : "Agent listing needs QC",
        `${row?.title || "Agent listing"} was ${existingId ? "updated" : "submitted"} and is waiting for admin approval.`,
        { listingId: row?.id || existingId, category: "agent_listing_qc", action: existingId ? "updated" : "created" }
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
                    "/api/auth/signup",
                    "/api/auth/me",
                    "/api/agent/me",
                    "/api/billing/create-checkout-session",
                    "/api/agent/listings",
                    "/api/admin/listings",
                    "/api/admin/listings/review",
                    "/api/admin/ai-imports?date=YYYY-MM-DD",
                    "/api/create-checkout-session",
                    "/api/stripe/create-checkout-session",
                    "/api/stripe/webhook",
                    "/api/properties",
                    "/api/ar/generate",
                    "/api/ar/save"
                ],
                config: {
                    supabase: hasSupabaseConfig(),
                    storage: hasStorageConfig(),
                    mediaBucket: SUPABASE_PROPERTY_MEDIA_BUCKET,
                    authRoleLookup: true,
                    openai: HAS_OPENAI,
                    anthropic: HAS_ANTHROPIC,
                    telegramBot: Boolean(TELEGRAM_BOT_TOKEN),
                    telegramWebhookSecret: Boolean(TELEGRAM_WEBHOOK_SECRET),
                    guidedTelegramListingFlow: true,
                    dailyAiImportCalendar: true,
                    adminApiKey: Boolean(ADMIN_API_KEY),
                    stripe: Boolean(stripe),
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

        if (url === '/api/auth/me') {
            return getAuthenticatedProfile(req);
        }

        if (url === '/api/auth/signup') {
            return createDirectSignup(payload);
        }

        if (url === '/api/agent/me') {
            return getAgentMe(req);
        }

        if (url === '/api/create-checkout-session' || url === '/api/stripe/create-checkout-session' || url === '/api/billing/create-checkout-session') {
            return createStripeCheckoutSession(payload, req);
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

        if (url === '/api/ar/generate') {
            const parsed = payload.__multipart || { fields: payload, files: {} };
            const style = normalizeArStyle(parsed.fields?.style || payload.style);
            const file = parsed.files?.image;

            if (!file || !file.buffer || !file.buffer.length) {
                return { __status: 400, error: "Upload a room image first." };
            }

            let imageUrl = "";
            let demoMode = true;
            let aiError = "";
            try {
                imageUrl = await tryOpenAiImageEdit(file, style);
                demoMode = !imageUrl;
            } catch (error) {
                aiError = error.message || "AI staging failed.";
            }

            if (!imageUrl) imageUrl = AR_DEMO_IMAGES[style];

            return {
                id: makeArProjectId(),
                imageUrl,
                sourceImageUrl: arImageDataUrl(file).slice(0, 400000),
                style,
                prompt: arStagingPrompt(style),
                demoMode,
                aiError,
                createdAt: new Date().toISOString()
            };
        }

        if (url === '/api/ar/save') {
            return {
                ok: true,
                id: payload.id || makeArProjectId(),
                imageUrl: payload.imageUrl || "",
                style: payload.style || "modern luxury",
                prompt: payload.prompt || "",
                furnitureModel: payload.furnitureModel || "/models/sofa.glb",
                storage: "node-memory-mvp",
                savedAt: new Date().toISOString()
            };
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
                : await logLocationDemand(payload, google, suggestions);
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
                if(!aiProvider.HAS_AI) {
                    console.log("No API Key found, returning fallback reasoning.");
                    return { error: "No API Key", fallback: true };
                }

                const sysPrompt = "You are KVAI, a hyper-intelligent real estate advisor. You will receive a JSON string of properties, and a user profile string. Rank the Top 3 best properties from the array that match the profile. Output ONLY a valid JSON array of 3 objects containing { id: number, explanation: string }, where explanation is a 2-sentence highly personalized reason why it fits." + " Wrap the array in an object: { \"ranked\": [...] }";

                const userPrompt = `
User profile:
- Budget: ${payload.budget}
- Goal: ${payload.goal}
- Location: ${payload.location}

Properties:
${JSON.stringify(payload.properties.map(p => ({id: p.id, title: p.title, price: p.price, yield: p.yield, location: p.location, vibe: p.vibe, tags: p.tags})))}

Rank and explain best 3 properties.`;

                const content = await aiProvider.generateJsonContent({ system: sysPrompt, user: userPrompt });
                return JSON.parse(content).ranked;
            } catch(e) {
                console.error("AI ranking error:", e);
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
            const newLead = { id: Date.now(), ...payload, timestamp: new Date().toISOString() };

            if (hasSupabaseConfig()) {
                try {
                    await insertSupabaseRow('leads', {
                        property_id: payload.propertyId != null ? String(payload.propertyId) : null,
                        buyer_name: payload.buyerName || null,
                        buyer_phone: payload.buyerPhone || null,
                        source: payload.source || null,
                        inquiry_type: payload.inquiryType || null,
                        payload: newLead
                    });
                } catch (error) {
                    console.error('[Supabase] Failed to store lead:', error.message);
                }
            } else {
                const db = readDatabase();
                db.leads.push(newLead);
                writeDatabase(db);
            }

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
        const chunks = [];
        let bodySize = 0;
        const isArGenerate = routePath === '/api/ar/generate';
        const maxBodyBytes = isArGenerate || routePath === '/api/agent/listings' ? 35 * 1024 * 1024 : 1024 * 1024;
        req.on('data', chunk => {
            bodySize += chunk.length;
            if (bodySize > maxBodyBytes) {
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', async () => {
            try {
                const rawBody = Buffer.concat(chunks);
                if (routePath === '/api/stripe/webhook') {
                    const response = await handleStripeWebhook(rawBody, normalizeHeaderValue(req.headers['stripe-signature']));
                    return sendJson(response.__status || (response.error ? 400 : 200), response);
                }
                const payload = isArGenerate
                    ? { __multipart: parseArMultipart(rawBody, req.headers['content-type']) }
                    : (rawBody.length ? JSON.parse(rawBody.toString('utf8')) : {});
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
    if(!HAS_OPENAI && !HAS_ANTHROPIC) console.log('[WARN] No AI provider configured (OPENAI_API_KEY / ANTHROPIC_API_KEY). Agents running via fallback rule logic for testing.');
});
