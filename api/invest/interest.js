const {
  ALLOWED_BANDS,
  ALLOWED_OPPORTUNITIES,
  clean,
  clientIp,
  isEmail,
  isPhone,
  sendJson,
  supabaseRequest
} = require("./_utils");

const rateBuckets = new Map();

function rateAllowed(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const current = rateBuckets.get(ip);
  if (!current || now - current.startedAt > windowMs) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= 5;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed." });

  const ip = clientIp(req);
  if (!rateAllowed(ip)) return sendJson(res, 429, { error: "Too many attempts. Please try again in 15 minutes." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (clean(body.website, 100)) return sendJson(res, 200, { success: true });

    const opportunityId = clean(body.opportunityId, 80);
    const fullName = clean(body.fullName, 100);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone, 24);
    const amountBand = clean(body.amountBand, 40);
    const interestType = clean(body.interestType, 30) || "waitlist";

    if (!ALLOWED_OPPORTUNITIES.has(opportunityId)) return sendJson(res, 400, { error: "Select a valid property preview." });
    if (fullName.length < 2) return sendJson(res, 400, { error: "Enter your full name." });
    if (!isEmail(email)) return sendJson(res, 400, { error: "Enter a valid email address." });
    if (!isPhone(phone)) return sendJson(res, 400, { error: "Enter a valid phone number." });
    if (!ALLOWED_BANDS.has(amountBand)) return sendJson(res, 400, { error: "Select an indicative budget band." });
    if (body.consent !== true) return sendJson(res, 400, { error: "Consent is required to register interest." });

    const rows = await supabaseRequest("investment_interests", {
      method: "POST",
      body: {
        opportunity_id: opportunityId,
        full_name: fullName,
        email,
        phone,
        indicative_amount_band: amountBand,
        interest_type: interestType === "waitlist" ? "waitlist" : "opportunity_interest",
        status: "new",
        source: "realitygenius_invest_preview",
        consent_at: new Date().toISOString(),
        metadata: { user_agent: clean(req.headers["user-agent"], 240) }
      }
    });

    return sendJson(res, 201, { success: true, reference: Array.isArray(rows) ? rows[0]?.id : undefined });
  } catch (error) {
    console.error("[Invest interest]", error);
    return sendJson(res, 503, { error: "Interest registration is temporarily unavailable. Please use the WhatsApp option." });
  }
};
