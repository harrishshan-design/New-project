const crypto = require("crypto");

const ALLOWED_OPPORTUNITIES = new Set([
  "taman-kim-chuan-double-storey",
  "subang-family-courtyard",
  "johor-medini-suites"
]);

const ALLOWED_BANDS = new Set([
  "RM10,000 - RM25,000",
  "RM25,001 - RM50,000",
  "RM50,001 - RM100,000",
  "Above RM100,000",
  "Just exploring"
]);

function env(...names) {
  for (const name of names) {
    if (process.env[name]) return String(process.env[name]).trim();
  }
  return "";
}

function supabaseConfig() {
  const url = env("SUPABASE_URL", "REALTYGENIUS_SUPABASE_URL", "SUPABASE_PROJECT_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL").replace(/\/rest\/v1\/?$/, "");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
  return { url, serviceKey };
}

function clean(value, maxLength) {
  return String(value == null ? "" : value).trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 180;
}

function isPhone(value) {
  return /^[+()\-\s\d]{8,24}$/.test(value);
}

function clientIp(req) {
  return clean(String(req.headers["x-forwarded-for"] || "").split(",")[0] || req.socket?.remoteAddress || "unknown", 80);
}

function safeEqual(leftValue, rightValue) {
  const left = Buffer.from(String(leftValue || ""));
  const right = Buffer.from(String(rightValue || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

async function supabaseRequest(path, options = {}) {
  const { url, serviceKey } = supabaseConfig();
  if (!url || !serviceKey) throw new Error("Investment interest storage is not configured.");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: options.prefer || "return=representation"
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`Storage request failed (${response.status}).`);
  return data;
}

module.exports = {
  ALLOWED_BANDS,
  ALLOWED_OPPORTUNITIES,
  clean,
  clientIp,
  env,
  isEmail,
  isPhone,
  safeEqual,
  sendJson,
  supabaseRequest
};
