const SITE_URL = "https://realitygenius.company";
const API_BASE = process.env.PROPERTIES_API_BASE || "https://hh-empire.onrender.com/api";

const STATIC_PAGES = ["/", "/user.html", "/agents.html", "/agent-plans.html", "/privacy.html", "/terms.html"];

module.exports = async function handler(req, res) {
  let propertyUrls = [];
  try {
    const response = await fetch(`${API_BASE}/properties`, { headers: { Accept: "application/json" } });
    if (response.ok) {
      const payload = await response.json();
      const items = Array.isArray(payload) ? payload : payload.items || [];
      propertyUrls = items
        .filter((item) => item && item.id != null)
        .map((item) => ({
          loc: `${SITE_URL}/property/${item.id}`,
          lastmod: String(item.updatedAt || item.createdAt || "").slice(0, 10)
        }));
    }
  } catch {
    // Static pages still ship if the properties API is unreachable.
  }

  const urls = [
    ...STATIC_PAGES.map((page) => `  <url><loc>${SITE_URL}${page}</loc></url>`),
    ...propertyUrls.map((item) => `  <url><loc>${item.loc}</loc>${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ""}</url>`)
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
};
