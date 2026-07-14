const {
  PLAN_FEATURES,
  getAuthUser,
  findUser,
  normalizePlan
} = require("../_subscription");

function publicAgentProfile(row = {}, authUser = {}) {
  const subscriptionPlan = normalizePlan(row.subscription_plan || row.profile_json?.subscription?.subscriptionPlan || row.plan) || "free";
  const status = String(row.subscription_status || row.profile_json?.subscription?.status || "inactive").toLowerCase();
  const active = status === "active" || status === "trialing";
  const effectivePlan = active ? subscriptionPlan : "free";
  const permissions = PLAN_FEATURES[effectivePlan] || PLAN_FEATURES.free;

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
    features_unlocked: active && effectivePlan !== "free"
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

  const profile = publicAgentProfile(row, authUser);
  if (String(profile.role || "").toLowerCase() !== "agent") {
    return res.status(403).json({ error: "Agent account required." });
  }

  return res.status(200).json({ agent: profile });
};
