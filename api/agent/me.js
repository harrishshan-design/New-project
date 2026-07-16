const {
  PLAN_FEATURES,
  getAuthUser,
  findUser,
  normalizePlan
} = require("../_subscription");

async function founderListingsSubmitted(agentId) {
  const restUrl = String(process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
  if (!restUrl || !key || !agentId) return 0;
  const base = restUrl.endsWith("/rest/v1") ? restUrl : `${restUrl}/rest/v1`;
  try {
    const response = await fetch(`${base}/agent_engagement?select=listings_submitted&agent_id=eq.${encodeURIComponent(agentId)}&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" }
    });
    const rows = await response.json().catch(() => []);
    return response.ok && Array.isArray(rows) ? Number(rows[0]?.listings_submitted || 0) : 0;
  } catch {
    return 0;
  }
}

async function publicAgentProfile(row = {}, authUser = {}) {
  const subscriptionPlan = normalizePlan(row.subscription_plan || row.profile_json?.subscription?.subscriptionPlan || row.plan) || "free";
  const status = String(row.subscription_status || row.profile_json?.subscription?.status || "inactive").toLowerCase();
  const active = status === "active" || status === "trialing";
  const effectivePlan = active ? subscriptionPlan : "free";
  const permissions = PLAN_FEATURES[effectivePlan] || PLAN_FEATURES.free;
  const founderPromo = Boolean(row.profile_json?.founderPromo);

  return {
    id: row.id || authUser.id || "",
    email: row.email || authUser.email || "",
    full_name: row.full_name || row.name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || "",
    role: row.role || "",
    subscription_plan: effectivePlan,
    raw_subscription_plan: subscriptionPlan,
    subscription_status: status,
    stripe_customer_id: row.stripe_customer_id || "",
    stripe_subscription_id: row.stripe_subscription_id || "",
    auction_slots_monthly: Number(row.auction_slots_monthly ?? permissions.auction_slots ?? 0),
    permissions,
    features_unlocked: active && effectivePlan !== "free",
    founder_promo: founderPromo,
    founder_listings_required: founderPromo ? (row.profile_json?.founderListingsRequired || 10) : 0,
    founder_listings_submitted: founderPromo ? await founderListingsSubmitted(row.id) : 0
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end();
  }

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const authUser = await getAuthUser(req);
  if (!authUser?.email) return res.status(401).json({ error: "Login required." });

  const row = await findUser({ email: authUser.email });
  if (!row?.id) return res.status(404).json({ error: "Agent profile not found." });

  const profile = await publicAgentProfile(row, authUser);
  if (String(profile.role || "").toLowerCase() !== "agent") {
    return res.status(403).json({ error: "Agent account required." });
  }

  return res.status(200).json({ agent: profile });
};
