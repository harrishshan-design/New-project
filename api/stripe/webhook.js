const {
  findUser,
  normalizePlan,
  patchUserSubscription,
  stripeClient
} = require("../_subscription");

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

async function updateFromStripeObject(object = {}, statusOverride = "") {
  const metadata = object.metadata || {};
  const customerEmail = object.customer_details?.email || object.customer_email || metadata.email || "";
  const agentId = metadata.agent_id || metadata.userId || object.client_reference_id || "";
  const plan = normalizePlan(metadata.plan);
  if (!plan) return false;

  const user = await findUser({ id: agentId }) || await findUser({ email: customerEmail });
  if (!user?.id) return false;

  return patchUserSubscription(user, {
    plan,
    status: statusOverride || object.status || "active",
    customerId: object.customer,
    subscriptionId: object.subscription || object.id,
    checkoutSessionId: object.object === "checkout.session" ? object.id : ""
  });
}

async function updateFromInvoice(invoice = {}, status) {
  const metadata = invoice.subscription_details?.metadata || invoice.metadata || {};
  return updateFromStripeObject({
    object: "invoice",
    metadata,
    customer: invoice.customer,
    customer_email: metadata.email || invoice.customer_email,
    subscription: invoice.subscription || invoice.parent?.subscription_details?.subscription
  }, status);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const stripe = stripeClient();
  if (!stripe) return res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured." });
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).json({ error: "STRIPE_WEBHOOK_SECRET is not configured." });

  const rawBody = await readRawBody(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).json({ error: error.message || "Invalid Stripe webhook payload." });
  }

  if (event.type === "checkout.session.completed") {
    await updateFromStripeObject(event.data.object, "active");
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    await updateFromStripeObject(event.data.object, event.data.object.status || "active");
  }

  if (event.type === "customer.subscription.deleted") {
    await updateFromStripeObject(event.data.object, "cancelled");
  }

  if (event.type === "invoice.payment_succeeded") {
    await updateFromInvoice(event.data.object, "active");
  }

  if (event.type === "invoice.payment_failed") {
    await updateFromInvoice(event.data.object, "past_due");
  }

  return res.status(200).json({ received: true, type: event.type });
};
