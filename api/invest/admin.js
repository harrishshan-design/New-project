const { clean, env, safeEqual, sendJson, supabaseRequest } = require("./_utils");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed." });
  const expected = env("ADMIN_API_KEY");
  const provided = clean(req.headers["x-admin-api-key"] || String(req.headers.authorization || "").replace(/^Bearer\s+/i, ""), 300);
  if (!expected) return sendJson(res, 503, { error: "Admin access is not configured." });
  if (!provided || !safeEqual(provided, expected)) return sendJson(res, 401, { error: "Valid admin API key required." });

  try {
    const rows = await supabaseRequest("investment_interests?select=id,opportunity_id,full_name,email,phone,indicative_amount_band,status,created_at&order=created_at.desc&limit=100", { method: "GET" });
    const items = Array.isArray(rows) ? rows : [];
    return sendJson(res, 200, { count: items.length, items });
  } catch (error) {
    console.error("[Invest admin]", error);
    return sendJson(res, 503, { error: "Unable to load the protected investment queue." });
  }
};
