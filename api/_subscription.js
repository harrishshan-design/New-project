const Stripe = require("stripe");

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
  pro_agent: {
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
  // Elite is the top self-serve tier - every feature flag unlocked,
  // matching or exceeding best_closers so nothing stays locked for it.
  elite_agent: {
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
  },
  // First 10 agent signups: full features free, contingent on submitting
  // 10 listings. See createDirectSignup() in server.js.
  founder_free: {
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

// Stripe Payment Links (buy.stripe.com/...) don't carry metadata.plan the
// way a dynamically-created Checkout Session does, so the webhook
// identifies the plan from the payment_link id on the initial
// checkout.session.completed event instead.
const PAYMENT_LINK_PLAN_MAP = {
  plink_1TszRB77rIkUQD3362McP8au: "starter_rg",
  plink_1TszU177rIkUQD33v3a1g8Gf: "pro_agent",
  plink_1TszUo77rIkUQD33IzB33sdS: "elite_agent"
};

function normalizePlan(plan = "") {
  const normalized = String(plan || "").trim().toLowerCase();
  const aliases = {
    starter: "starter_rg",
    starter_rg: "starter_rg",
    pro: "pro_agent",
    pro_agent: "pro_agent",
    elite: "elite_agent",
    elite_agent: "elite_agent",
    premium: "elite_agent",
    best: "best_closers",
    best_closers: "best_closers",
    founder_free: "founder_free"
  };
  return aliases[normalized] || (normalized === "free" ? "free" : "");
}

function planFromPaymentLink(paymentLinkId = "") {
  return PAYMENT_LINK_PLAN_MAP[paymentLinkId] || "";
}

function legacyPlan(plan = "") {
  const normalized = normalizePlan(plan);
  if (normalized === "starter_rg") return "starter";
  if (normalized === "pro_agent") return "pro";
  if (normalized === "elite_agent") return "elite";
  if (normalized === "best_closers") return "elite";
  if (normalized === "founder_free") return "elite";
  return "free";
}

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

async function getAuthUser(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  const base = supabaseProjectUrl();
  const key = serviceKey();
  if (!token || !base || !key) return null;
  const response = await fetch(`${base}/auth/v1/user`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  });
  const user = await response.json().catch(() => ({}));
  if (!response.ok || !user?.email) return null;
  return user;
}

async function findUser({ id = "", email = "", stripeCustomerId = "" } = {}) {
  const restUrl = supabaseRestUrl();
  const key = serviceKey();
  if (!restUrl || !key) return null;
  const field = id ? "id" : email ? "email" : "stripe_customer_id";
  const value = id || email || stripeCustomerId;
  if (!value) return null;
  const profileResponse = await fetch(`${restUrl}/profiles?select=*&${field}=eq.${encodeURIComponent(value)}&limit=1`, {
    headers: jsonHeaders(key)
  });
  const profileRows = await profileResponse.json().catch(() => []);
  if (profileResponse.ok && Array.isArray(profileRows) && profileRows[0]) {
    const profile = profileRows[0];
    return {
      ...profile,
      name: profile.name || profile.full_name || "",
      role: profile.role || "",
      _sourceTable: "profiles"
    };
  }

  const userResponse = await fetch(`${restUrl}/users?select=*&${field}=eq.${encodeURIComponent(value)}&limit=1`, {
    headers: jsonHeaders(key)
  });
  const userRows = await userResponse.json().catch(() => []);
  if (!userResponse.ok) return null;
  const user = Array.isArray(userRows) ? userRows[0] || null : null;
  return user ? { ...user, _sourceTable: "users" } : null;
}

async function patchUserSubscription(user, data) {
  const restUrl = supabaseRestUrl();
  const key = serviceKey();
  if (!restUrl || !key || !user?.id) return false;
  // Subscription lifecycle events (renewal, cancellation) carry no plan
  // info at all once past the initial Payment Link checkout - fall back
  // to whatever's already recorded instead of resetting to free.
  const plan = normalizePlan(data.plan) || normalizePlan(user.subscription_plan) || "free";
  const legacy = legacyPlan(plan);
  const status = data.status || "active";
  const profile = typeof user.profile_json === "string"
    ? JSON.parse(user.profile_json || "{}")
    : user.profile_json || {};
  const permissions = PLAN_FEATURES[plan] || PLAN_FEATURES.free;
  const patch = {
    plan: legacy,
    subscription_plan: plan,
    subscription_status: status,
    stripe_customer_id: data.customerId || user.stripe_customer_id || null,
    stripe_subscription_id: data.subscriptionId || user.stripe_subscription_id || null,
    auction_slots_monthly: Number(permissions.auction_slots || 0),
    features_unlocked: status === "active" && plan !== "free",
    profile_json: {
      ...profile,
      subscription: {
        ...(profile.subscription || {}),
        planId: legacy,
        subscriptionPlan: plan,
        status,
        provider: "stripe",
        customerId: data.customerId || profile.subscription?.customerId || "",
        subscriptionId: data.subscriptionId || profile.subscription?.subscriptionId || "",
        checkoutSessionId: data.checkoutSessionId || profile.subscription?.checkoutSessionId || "",
        updatedAt: new Date().toISOString()
      }
    },
    updated_at: new Date().toISOString()
  };
  const table = user._sourceTable === "profiles" ? "profiles" : "users";
  const url = `${restUrl}/${table}?id=eq.${encodeURIComponent(user.id)}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: { ...jsonHeaders(key), Prefer: "return=minimal" },
    body: JSON.stringify(patch)
  });
  if (response.ok) return true;

  const fallbackPatch = {
    plan: legacy,
    profile_json: patch.profile_json,
    updated_at: patch.updated_at
  };
  const fallbackResponse = await fetch(url, {
    method: "PATCH",
    headers: { ...jsonHeaders(key), Prefer: "return=minimal" },
    body: JSON.stringify(fallbackPatch)
  });
  return fallbackResponse.ok;
}

function stripeClient() {
  return process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
    : null;
}

function stripePriceForPlan(plan) {
  const normalized = normalizePlan(plan);
  if (normalized === "starter_rg") return process.env.STRIPE_STARTER_PRICE_ID;
  if (normalized === "pro_agent") return process.env.STRIPE_PRO_PRICE_ID;
  if (normalized === "elite_agent") return process.env.STRIPE_ELITE_PRICE_ID;
  return "";
}

module.exports = {
  PLAN_FEATURES,
  normalizePlan,
  legacyPlan,
  planFromPaymentLink,
  getAuthUser,
  findUser,
  patchUserSubscription,
  stripeClient,
  stripePriceForPlan
};
