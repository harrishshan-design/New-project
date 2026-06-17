function normalizePlan(plan = "") {
  const normalized = String(plan || "").trim().toLowerCase();
  if (normalized === "premium") return "elite";
  if (["starter", "pro", "elite"].includes(normalized)) return normalized;
  return "";
}

module.exports = async function handler(req, res) {
  try {
  const Stripe = require("stripe");
  const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
    : null;
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!stripe) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured." });
  }

  const plan = normalizePlan(req.body?.plan || req.body?.planId);
  const prices = {
    starter: process.env.STRIPE_STARTER_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
    elite: process.env.STRIPE_ELITE_PRICE_ID
  };

  if (!plan) {
    return res.status(400).json({ error: "Choose starter, pro, or elite." });
  }

  if (!prices[plan]) {
    return res.status(500).json({ error: `Stripe price id is missing for ${plan}.` });
  }

  const origin = process.env.FRONTEND_URL || "https://realitygenius.company";
  const email = String(req.body?.email || "").trim().toLowerCase();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email || undefined,
    line_items: [{ price: prices[plan], quantity: 1 }],
    success_url: `${origin}/agent.html?success=true&billing=success&plan=${encodeURIComponent(plan)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/agent.html?cancelled=true&billing=cancelled&plan=${encodeURIComponent(plan)}`,
    metadata: {
      plan,
      email
    },
    subscription_data: {
      metadata: {
        plan,
        email
      }
    }
  });

  return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Stripe checkout failed.",
      type: error?.type || "checkout_error"
    });
  }
};
