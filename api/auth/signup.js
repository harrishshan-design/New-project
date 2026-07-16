function supabaseRestUrl() {
  const raw = String(process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  return raw.endsWith("/rest/v1") ? raw : `${raw}/rest/v1`;
}

function supabaseProjectUrl() {
  return String(process.env.SUPABASE_URL || "").trim().replace(/\/rest\/v1$/i, "").replace(/\/+$/, "");
}

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
}

function jsonHeaders(key = serviceKey()) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
}

function requestBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function normalizeRole(role = "") {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "buyer" || normalized === "customer") return "user";
  if (["user", "agent"].includes(normalized)) return normalized;
  return "";
}

function normalizeProductKey(value = "") {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function validAgentProductKeys() {
  return String(process.env.REALTYGENIUS_AGENT_PRODUCT_KEYS || process.env.NEXT_PUBLIC_AGENT_PRODUCT_KEYS || "RG-AGENT-FULL-2026")
    .split(/[,\s]+/)
    .map(normalizeProductKey)
    .filter(Boolean);
}

function hasAgentFullAccessKey(productKey = "") {
  const normalized = normalizeProductKey(productKey);
  return Boolean(normalized && validAgentProductKeys().includes(normalized));
}

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function nameFromEmail(email = "") {
  return String(email || "").split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "RealityGenius User";
}

function cleanPhone(value = "") {
  return String(value || "").trim().replace(/[^\d+]/g, "");
}

function isValidPhone(value = "") {
  return /^[+]?[\d]{8,15}$/.test(cleanPhone(value));
}

async function createConfirmedAuthUser({ email, password, metadata }) {
  const base = supabaseProjectUrl();
  const key = serviceKey();
  if (!base || !key) {
    const error = new Error("Supabase Auth admin is not configured.");
    error.status = 500;
    throw error;
  }

  const response = await fetch(`${base}/auth/v1/admin/users`, {
    method: "POST",
    headers: jsonHeaders(key),
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
    const error = new Error(payload.msg || payload.message || payload.error_description || payload.error || "Could not create account.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

const FOUNDER_AGENT_SLOT_LIMIT = 10;
const FOUNDER_LISTINGS_REQUIRED = 10;

async function countExistingAgentSignups() {
  const restUrl = supabaseRestUrl();
  const key = serviceKey();
  if (!restUrl || !key) return 0;
  const response = await fetch(`${restUrl}/users?select=id&role=eq.agent&limit=1000`, {
    headers: jsonHeaders(key)
  });
  const rows = await response.json().catch(() => []);
  return response.ok && Array.isArray(rows) ? rows.length : 0;
}

async function upsertRow(table, body, conflict = "email") {
  const restUrl = supabaseRestUrl();
  const key = serviceKey();
  if (!restUrl || !key) return null;
  const response = await fetch(`${restUrl}/${table}?on_conflict=${encodeURIComponent(conflict)}`, {
    method: "POST",
    headers: {
      ...jsonHeaders(key),
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(body)
  });
  const rows = await response.json().catch(() => []);
  if (!response.ok) return null;
  return Array.isArray(rows) ? rows[0] || null : rows;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).end();
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const body = requestBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = normalizeRole(body.role || "user") || "user";
    const name = String(body.name || body.fullName || "").trim() || nameFromEmail(email);
    const phone = cleanPhone(body.phone || body.whatsapp || body.mobile || "");
    const agentFullAccess = role === "agent" && hasAgentFullAccessKey(body.productKey);
    let isFounderAgent = false;
    if (role === "agent" && !agentFullAccess) {
      const existingAgents = await countExistingAgentSignups().catch(() => FOUNDER_AGENT_SLOT_LIMIT);
      isFounderAgent = existingAgents < FOUNDER_AGENT_SLOT_LIMIT;
    }
    const grantsFullAccess = agentFullAccess || isFounderAgent;
    const status = role === "agent" && !grantsFullAccess ? "pending" : "active";
    const subscriptionPlan = agentFullAccess ? "elite_agent" : (isFounderAgent ? "founder_free" : "free");
    const subscriptionStatus = grantsFullAccess ? "active" : "inactive";

    if (!isValidEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
    if (password.length < 6) return res.status(400).json({ error: "Use a password with at least 6 characters." });
    if (!isValidPhone(phone)) return res.status(400).json({ error: "Enter a valid phone / WhatsApp number." });

    const metadata = {
      name,
      full_name: name,
      phone,
      role,
      account_role: role,
      status,
      subscriptionPlan,
      subscriptionStatus,
      featuresUnlocked: grantsFullAccess,
      emailConfirmedByBackend: true,
      founderPromo: isFounderAgent,
      founderListingsRequired: isFounderAgent ? FOUNDER_LISTINGS_REQUIRED : null,
      launchAccess: agentFullAccess ? {
        productKey: normalizeProductKey(body.productKey),
        grantedAt: new Date().toISOString(),
        source: "agent_signup_product_key"
      } : isFounderAgent ? {
        grantedAt: new Date().toISOString(),
        source: "founder_agent_promo"
      } : null
    };

    const authUser = await createConfirmedAuthUser({ email, password, metadata });
    const profilePayload = {
      id: authUser.id,
      email,
      name,
      phone,
      role,
      status,
      plan: grantsFullAccess ? "elite" : "free",
      subscription_plan: subscriptionPlan,
      subscription_status: subscriptionStatus,
      features_unlocked: grantsFullAccess,
      profile_json: metadata,
      updated_at: new Date().toISOString()
    };

    const userRow = await upsertRow("users", {
      ...profilePayload,
      password_hash: "supabase-auth-confirmed",
      created_at: new Date().toISOString()
    });
    const profileRow = await upsertRow("profiles", profilePayload);

    return res.status(201).json({
      ok: true,
      confirmationRequired: false,
      needsApproval: role === "agent" && !grantsFullAccess,
      founderPromo: isFounderAgent,
      founderListingsRequired: isFounderAgent ? FOUNDER_LISTINGS_REQUIRED : null,
      profile: profileRow || userRow || profilePayload
    });
  } catch (error) {
    const message = String(error.message || "Signup failed.");
    if (error.status === 422 || error.status === 409 || /already/i.test(message)) {
      return res.status(409).json({ error: "Email is already registered. Please login instead." });
    }
    return res.status(error.status || 500).json({ error: message });
  }
};
