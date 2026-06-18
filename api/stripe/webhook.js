const Stripe = require("stripe");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

module.exports.config = {
  api: {
    bodyParser: false
  }
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function supabaseRestUrl() {
  const raw = String(process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  return raw.endsWith("/rest/v1") ? raw : `${raw}/rest/v1`;
}

function normalizePlan(plan = "") {
  const normalized = String(plan || "").trim().toLowerCase();
  if (normalized === "premium") return "elite";
  if (["starter", "pro", "elite"].includes(normalized)) return normalized;
  return "";
}

async function updateAgentSubscription({ email, plan, status, customerId, subscriptionId, checkoutSessionId }) {
  const restUrl = supabaseRestUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPlan = normalizePlan(plan);
  if (!restUrl || !key || !cleanEmail || !cleanPlan) return false;

  const lookup = await fetch(`${restUrl}/users?select=*&email=eq.${encodeURIComponent(cleanEmail)}&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json"
    }
  });
  const rows = await lookup.json().catch(() => []);
  const user = Array.isArray(rows) ? rows[0] : null;
  if (!lookup.ok || !user?.id) return false;

  const profile = typeof user.profile_json === "string"
    ? JSON.parse(user.profile_json || "{}")
    : user.profile_json || {};

  const patch = await fetch(`${restUrl}/users?id=eq.${encodeURIComponent(user.id)}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      profile_json: {
        ...profile,
        subscription: {
          ...(profile.subscription || {}),
          planId: cleanPlan,
          status,
          provider: "stripe",
          customerId: customerId || profile.subscription?.customerId || "",
          subscriptionId: subscriptionId || profile.subscription?.subscriptionId || "",
          checkoutSessionId: checkoutSessionId || profile.subscription?.checkoutSessionId || "",
          updatedAt: new Date().toISOString()
        }
      },
      updated_at: new Date().toISOString()
    })
  });

  return patch.ok;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!stripe) return res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured." });

  const rawBody = await readRawBody(req);
  let event;

  try {
    event = process.env.STRIPE_WEBHOOK_SECRET
      ? stripe.webhooks.constructEvent(rawBody, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET)
      : JSON.parse(rawBody.toString("utf8"));
  } catch (error) {
    return res.status(400).json({ error: error.message || "Invalid Stripe webhook payload." });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await updateAgentSubscription({
      email: session.customer_details?.email || session.metadata?.email,
      plan: session.metadata?.plan,
      status: "active",
      customerId: session.customer,
      subscriptionId: session.subscription,
      checkoutSessionId: session.id
    });
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await updateAgentSubscription({
      email: subscription.metadata?.email,
      plan: subscription.metadata?.plan,
      status: event.type === "customer.subscription.deleted" ? "cancelled" : subscription.status,
      customerId: subscription.customer,
      subscriptionId: subscription.id
    });
  }

  return res.status(200).json({ received: true, type: event.type });
};
