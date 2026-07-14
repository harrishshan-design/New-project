const {
  getAuthUser,
  findUser,
  normalizePlan,
  stripeClient,
  stripePriceForPlan
} = require("../_subscription");

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

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(204).end();
    }

    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const authUser = await getAuthUser(req);
    if (!authUser?.email) return res.status(401).json({ error: "Login required before upgrading." });

    const profile = await findUser({ email: authUser.email });
    if (!profile?.id) {
      return res.status(404).json({ error: "Approved agent profile not found." });
    }
    if (String(profile.role || "").toLowerCase() !== "agent") {
      return res.status(403).json({ error: "Only agent accounts can buy agent subscriptions." });
    }
    const profileStatus = String(profile.status || "active").toLowerCase();
    if (!["active", "approved"].includes(profileStatus)) {
      return res.status(403).json({ error: `Agent account is ${profileStatus || "not approved"}.` });
    }

    const stripe = stripeClient();
    if (!stripe) return res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured." });

    const body = requestBody(req);
    const plan = normalizePlan(body.plan || body.planId);
    if (!["starter_rg", "elite_agent"].includes(plan)) {
      return res.status(400).json({ error: "Choose starter_rg or elite_agent." });
    }

    const price = stripePriceForPlan(plan);
    if (!price) return res.status(500).json({ error: `Stripe price id is missing for ${plan}.` });

    const origin = String(process.env.FRONTEND_URL || "https://realitygenius.company").replace(/\/+$/, "");
    const agentId = profile.id || "";
    const email = String(profile.email || authUser.email || "").trim().toLowerCase();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email || undefined,
      client_reference_id: agentId || undefined,
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/agent.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/agent.html?payment=cancelled`,
      metadata: {
        agent_id: agentId,
        userId: agentId,
        email,
        plan
      },
      subscription_data: {
        metadata: {
          agent_id: agentId,
          userId: agentId,
          email,
          plan
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
