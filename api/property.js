const SITE_URL = "https://realitygenius.company";
const API_BASE = process.env.PROPERTIES_API_BASE || "https://hh-empire.onrender.com/api";

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(value) {
  const amount = Number(value || 0);
  return amount ? `RM ${Math.round(amount).toLocaleString("en-MY")}` : "Price on request";
}

async function fetchProperties() {
  const response = await fetch(`${API_BASE}/properties`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Properties API ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.items || [];
}

function renderPage(property) {
  const title = `${property.title} | ${property.area || "Malaysia"} | RealityGenius`;
  const description = `${property.title} in ${property.location || property.area || "Malaysia"}. ${money(property.price)}. ${property.bedrooms || 0} bed, ${property.bathrooms || 0} bath${property.sqft ? `, ${property.sqft} sqft` : ""}. Verified listing with AI insights on RealityGenius.`;
  const image = property.image || `${SITE_URL}/og-cover.png`;
  const url = `${SITE_URL}/property/${property.id}`;
  const gallery = (property.gallery || []).map((slot) => slot.url).filter(Boolean).slice(0, 6);
  const panoCount = (property.panoramas || []).length;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    url,
    image: gallery.length ? gallery : [image],
    description,
    offers: { "@type": "Offer", price: Number(property.price || 0), priceCurrency: "MYR" },
    address: { "@type": "PostalAddress", addressLocality: property.area || "", addressCountry: "MY" }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="RealityGenius">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(property.title)} · ${esc(money(property.price))}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(property.title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <link rel="icon" href="/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-100QC1J9RT"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-100QC1J9RT');</script>
  <style>
    :root{--bg:#eff2e7;--card:#fbf8ef;--text:#172018;--muted:#68725f;--brand:#315f38;--gold:#c29048}
    *{box-sizing:border-box;margin:0}
    body{font-family:"Rethink Sans","Inter",system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.5}
    .wrap{max-width:960px;margin:0 auto;padding:22px 18px 60px}
    .topbar{display:flex;justify-content:space-between;align-items:center;padding:14px 0}
    .brand{font-weight:900;color:var(--brand);text-decoration:none;font-size:18px}
    .hero{border-radius:22px;overflow:hidden;background:var(--card);box-shadow:0 24px 70px rgba(45,67,38,.12)}
    .hero img{width:100%;height:420px;object-fit:cover;display:block}
    .body{padding:26px}
    h1{font-size:clamp(22px,4vw,32px);font-weight:900;margin-bottom:6px}
    .loc{color:var(--muted);margin-bottom:14px}
    .price{font-size:26px;font-weight:900;color:var(--brand);margin-bottom:14px}
    .stats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px}
    .stats span{background:#ecf2e3;border-radius:999px;padding:8px 15px;font-weight:700;font-size:14px}
    .pano{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(120deg,#1d4024,#2f7869);color:#f0e3c6;border-radius:999px;padding:8px 15px;font-weight:800;font-size:13px}
    .cta{display:inline-block;background:var(--brand);color:#fff;font-weight:900;padding:16px 30px;border-radius:16px;text-decoration:none;margin-top:8px}
    .cta:hover{background:#1d4024}
    .gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:0 26px 26px}
    .gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px}
    @media(max-width:640px){.hero img{height:260px}.body{padding:18px}}
  </style>
</head>
<body>
  <div class="wrap">
    <nav class="topbar">
      <a class="brand" href="/">RealityGenius</a>
      <a href="/user.html" style="color:var(--brand);font-weight:800;text-decoration:none">Browse all properties →</a>
    </nav>
    <article class="hero">
      <img src="${esc(image)}" alt="${esc(property.title)}">
      <div class="body">
        <h1>${esc(property.title)}</h1>
        <p class="loc">📍 ${esc(property.location || property.area || "Malaysia")}</p>
        <p class="price">${esc(money(property.price))}</p>
        <div class="stats">
          <span>🛏 ${Number(property.bedrooms || 0)} bed</span>
          <span>🛁 ${Number(property.bathrooms || 0)} bath</span>
          ${property.sqft ? `<span>📐 ${Number(property.sqft)} sqft</span>` : ""}
          ${property.aiScore ? `<span>🤖 AI Score ${Number(property.aiScore)}</span>` : ""}
          ${panoCount ? `<span class="pano">🌐 ${panoCount}x 360° tour</span>` : ""}
        </div>
        <p style="color:var(--muted);margin-bottom:18px">${esc(property.summary || property.vibe || "Verified listing on RealityGenius with AI-backed pricing insight and direct agent contact.")}</p>
        <a class="cta" href="/user.html">View with AI insights &amp; Immersive View</a>
      </div>
      ${gallery.length > 1 ? `<div class="gallery">${gallery.slice(1).map((g) => `<img src="${esc(g)}" alt="${esc(property.title)} photo" loading="lazy">`).join("")}</div>` : ""}
    </article>
  </div>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  try {
    const id = String(req.query.id || "").trim();
    if (!id) {
      res.statusCode = 400;
      return res.end("Property id required");
    }
    const properties = await fetchProperties();
    const property = properties.find((item) => String(item.id) === id || String(item.agentListingId || "") === id);
    if (!property) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.end('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Listing not found | RealityGenius</title><meta name="robots" content="noindex"></head><body style="font-family:sans-serif;padding:40px"><h1>Listing not found</h1><p>This property may have been sold or removed. <a href="/user.html">Browse live listings</a>.</p></body></html>');
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    res.end(renderPage(property));
  } catch (error) {
    res.statusCode = 500;
    res.end("Unable to load this listing right now.");
  }
};
