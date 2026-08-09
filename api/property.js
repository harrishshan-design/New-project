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

function repairText(value) {
  const source = String(value == null ? "" : value);
  if (!/[\u00c2-\u00f0]/.test(source)) return source;
  try {
    const repaired = Buffer.from(source, "latin1").toString("utf8");
    const sourceNoise = (source.match(/[\u00c2\u00c3\u00e2\u00f0\ufffd]/g) || []).length;
    const repairedNoise = (repaired.match(/[\u00c2\u00c3\u00e2\u00f0\ufffd]/g) || []).length;
    return !repaired.includes("\ufffd") && repairedNoise < sourceNoise ? repaired : source;
  } catch {
    return source;
  }
}

function cleanText(value) {
  return repairText(value)
    .replace(/[*_`]+/g, "")
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]+/gu, " ")
    .replace(/[\u0000-\u001f\u007f-\u009f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(property) {
  return cleanText(property.title)
    .replace(/^[\s\-|:]+/, "")
    .replace(/\s+[\-|:]\s*$/, "")
    .slice(0, 120) || "Malaysian property listing";
}

function descriptionLines(property) {
  return repairText(property.summary || property.description || "")
    .split(/\r?\n/)
    .map(cleanText)
    .map((line) => line.replace(/^[\s\-\u2022]+/, "").trim())
    .filter(Boolean);
}

function cleanLocation(property, title, lines) {
  const titleLower = title.toLowerCase();
  const direct = [property.location, property.area, property.address]
    .map(cleanText)
    .find((value) => value
      && value.length <= 90
      && value.toLowerCase() !== titleLower
      && !/(for sale|for rent|bedroom|bathroom|asking price)/i.test(value));
  if (direct) return direct;
  const labelled = lines.find((line) => /^(location|address|lokasi)\s*:/i.test(line));
  if (labelled) return labelled.replace(/^(location|address|lokasi)\s*:\s*/i, "").slice(0, 110);
  const titleLocation = title.split(/\s[\-\u2013\u2014]\s/).pop();
  return titleLocation && titleLocation !== title ? titleLocation.slice(0, 110) : "Malaysia";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function descriptionModel(property, title, location) {
  const lines = descriptionLines(property);
  const facts = [];
  const highlights = [];
  const paragraphs = [];
  const skipLabels = /^(location|address|lokasi|selling price|asking price|price|rental|contact)$/i;
  const usefulLabels = /^(type|property type|land size|built-up area|built up|built-up|condition|furnishing|tenure|maintenance fee|parking|floor|title)$/i;
  const featurePattern = /(move[- ]?in|well[- ]?maintained|fully furnished|car porch|quiet|mature neighbourhood|easy access|gated|guarded|security|renovated|nearby|strategic location|non[- ]?flood|no flood|tenanted|vacant|open parking|playground|lift)/i;

  for (const line of lines) {
    if (line.toLowerCase() === title.toLowerCase()) continue;
    if (/^[=_.|\-]+$/.test(line) || /^#/.test(line)) continue;
    if (/^(share|like|berminat|whatsapp|wasap|contact|call)\b/i.test(line)) continue;

    const pair = line.match(/^([^:]{2,32})\s*:\s*(.+)$/);
    if (pair) {
      const label = pair[1].trim();
      const value = pair[2].trim();
      if (skipLabels.test(label)) continue;
      if (usefulLabels.test(label) && value && !facts.some((fact) => fact.label.toLowerCase() === label.toLowerCase())) {
        facts.push({ label, value });
        continue;
      }
    }

    if (/\b(?:bedrooms?|bathrooms?)\b/i.test(line)) continue;
    if (/\brm\s*[\d,.]+/i.test(line)) continue;
    if (featurePattern.test(line) && line.length <= 90) {
      highlights.push(line.replace(/[.;,]+$/, ""));
      continue;
    }
    if (line.length >= 24 && line.length <= 220 && !line.toLowerCase().includes(location.toLowerCase())) {
      paragraphs.push(line);
    }
  }

  const typeFact = facts.find((fact) => /^(type|property type)$/i.test(fact.label));
  const bedrooms = Number(property.bedrooms || property.beds || 0);
  const bathrooms = Number(property.bathrooms || property.baths || 0);
  const rooms = [bedrooms ? `${bedrooms} bedrooms` : "", bathrooms ? `${bathrooms} bathrooms` : ""].filter(Boolean).join(" and ");
  const type = typeFact?.value || cleanText(property.propertyType || property.type || "residential property");
  const overview = paragraphs[0]
    || `${type.charAt(0).toUpperCase()}${type.slice(1)} in ${location}${rooms ? ` with ${rooms}` : ""}. Review the listing facts, photos and QC scope before arranging a viewing.`;

  return {
    overview,
    facts: facts.slice(0, 8),
    highlights: unique(highlights).slice(0, 8)
  };
}

function galleryImages(property) {
  const images = unique([
    ...(property.gallery || []).map((slot) => typeof slot === "string" ? slot : slot?.url),
    property.image
  ]).slice(0, 10);
  if (property.source === "telegram_ai_import" && images.length >= 8) {
    const preferred = [images[3], images[7], images[9]].filter(Boolean);
    return unique([...preferred, ...images]);
  }
  return images;
}

function phoneDigits(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("0") ? `6${digits}` : digits;
}

async function fetchProperties() {
  const response = await fetch(`${API_BASE}/properties`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Properties API ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.items || [];
}

function renderPage(property) {
  const lines = descriptionLines(property);
  const propertyTitle = cleanTitle(property);
  const location = cleanLocation(property, propertyTitle, lines);
  const model = descriptionModel(property, propertyTitle, location);
  const gallery = galleryImages(property);
  const image = gallery[0] || `${SITE_URL}/og-cover.png`;
  const url = `${SITE_URL}/property/${property.id}`;
  const bedrooms = Number(property.bedrooms || property.beds || 0);
  const bathrooms = Number(property.bathrooms || property.baths || 0);
  const sqft = Number(property.sqft || property.builtUpSqft || 0);
  const price = Number(property.price || 0);
  const psf = price > 0 && sqft > 0 ? Math.round(price / sqft) : 0;
  const monthly = price > 0 && String(property.purpose || "sale").toLowerCase() !== "rent"
    ? Math.round(((price * 0.9) * (0.043 / 12)) / (1 - Math.pow(1 + (0.043 / 12), -(35 * 12))))
    : 0;
  const purpose = /rent/i.test(`${property.purpose || ""} ${propertyTitle}`) ? "For rent" : "For sale";
  const qcApproved = property.adminApproved === true || property.verificationSource === "admin_approved" || String(property.approvalStatus || "").toLowerCase() === "approved";
  const statusLabel = qcApproved ? "Admin QC reviewed" : "Listing review pending";
  const renLabel = property.renVerified ? `REN ${cleanText(property.renNumber || "verified")}` : "REN not verified";
  const description = `${propertyTitle} in ${location}. ${money(price)}.${bedrooms ? ` ${bedrooms} bedrooms.` : ""}${bathrooms ? ` ${bathrooms} bathrooms.` : ""}${sqft ? ` ${sqft.toLocaleString("en-MY")} sq ft.` : ""} View listing facts, photos and QC scope on RealityGenius.`;
  const phone = phoneDigits(property.whatsapp || property.phone || property.agentPhone);
  const buyerUrl = `/user.html?listing=${encodeURIComponent(property.id)}`;
  const whatsappUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hi, I would like to know more about ${propertyTitle} in ${location}. I found listing #${property.id} on RealityGenius.`)}` : "";
  const galleryJson = JSON.stringify(gallery).replace(/</g, "\\u003c");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: propertyTitle,
    url,
    image: gallery.length ? gallery : [image],
    description,
    offers: { "@type": "Offer", price, priceCurrency: "MYR" },
    address: { "@type": "PostalAddress", streetAddress: location, addressCountry: "MY" }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(`${propertyTitle} | ${location} | RealityGenius`)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="RealityGenius">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(propertyTitle)} · ${esc(money(price))}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(propertyTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <link rel="icon" href="/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
  <style>
    :root{--bg:#f3f5ef;--surface:#fff;--soft:#edf2e8;--text:#172018;--muted:#667065;--brand:#275a34;--brand-dark:#173d23;--accent:#a87532;--line:#dce3d7;--shadow:0 18px 50px rgba(28,49,29,.1)}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,"Segoe UI",system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.55}a{color:inherit}button,a{touch-action:manipulation}.wrap{width:min(1180px,calc(100% - 36px));margin:auto}.topbar{position:sticky;top:0;z-index:20;background:rgba(243,245,239,.94);border-bottom:1px solid var(--line);backdrop-filter:blur(14px)}.topbar-inner{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{font-size:18px;font-weight:900;color:var(--brand-dark);text-decoration:none;letter-spacing:-.02em}.back-link{font-size:14px;font-weight:800;color:var(--brand);text-decoration:none}.breadcrumbs{padding:24px 0 14px;color:var(--muted);font-size:13px}.breadcrumbs a{text-decoration:none}.listing-hero{display:grid;grid-template-columns:minmax(0,1.42fr) minmax(330px,.72fr);gap:20px;align-items:start}.gallery-card,.summary-card,.content-card,.trust-card{background:var(--surface);border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow)}.gallery-card{padding:10px}.gallery-stage{position:relative;overflow:hidden;border-radius:6px;background:#dfe5db;aspect-ratio:4/3}.gallery-stage img{width:100%;height:100%;display:block;object-fit:cover}.gallery-count{position:absolute;right:12px;bottom:12px;padding:7px 10px;border-radius:6px;background:rgba(23,32,24,.82);color:#fff;font-size:12px;font-weight:800}.gallery-thumbs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:9px}.thumb{display:block;width:100%;padding:0;border:2px solid transparent;border-radius:6px;background:none;overflow:hidden;cursor:pointer}.thumb img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}.thumb[aria-current="true"]{border-color:var(--brand)}.summary-card{position:sticky;top:88px;padding:24px}.eyebrow{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.pill{display:inline-flex;min-height:28px;align-items:center;padding:0 9px;border-radius:999px;background:var(--soft);color:var(--brand-dark);font-size:11px;font-weight:900;letter-spacing:.03em;text-transform:uppercase}.pill.warn{background:#f4eee3;color:#77501e}.summary-card h1{font-size:clamp(26px,3vw,38px);line-height:1.08;letter-spacing:-.035em;margin:0 0 12px}.location{margin:0;color:var(--muted);font-size:15px}.price{margin:24px 0 16px;font-size:32px;line-height:1;font-weight:900;color:var(--brand-dark);letter-spacing:-.03em}.quick-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:7px;overflow:hidden;margin:0 0 18px}.quick-fact{background:#fff;padding:12px}.quick-fact span{display:block;color:var(--muted);font-size:11px;font-weight:800;text-transform:uppercase}.quick-fact strong{display:block;margin-top:3px;font-size:15px}.finance-note{padding:12px;border-left:3px solid var(--accent);background:#faf7f0;color:var(--muted);font-size:12px;margin-bottom:16px}.actions{display:grid;gap:9px}.button{display:flex;min-height:48px;align-items:center;justify-content:center;padding:0 18px;border:1px solid var(--brand);border-radius:7px;font-weight:900;text-decoration:none}.button.primary{background:var(--brand);color:#fff}.button.secondary{background:#fff;color:var(--brand)}.content-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(280px,.65fr);gap:20px;align-items:start;padding:26px 0 60px}.content-card,.trust-card{padding:26px}.section-kicker{color:var(--accent);font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.content-card h2,.trust-card h2{margin:5px 0 12px;font-size:24px;letter-spacing:-.025em}.overview{margin:0;color:#39433a;font-size:17px;line-height:1.7}.subsection{padding-top:24px;margin-top:24px;border-top:1px solid var(--line)}.subsection h3{font-size:16px;margin:0 0 14px}.detail-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.detail{padding:13px;background:var(--soft);border-radius:7px}.detail span{display:block;color:var(--muted);font-size:11px;font-weight:800;text-transform:uppercase}.detail strong{display:block;margin-top:3px;font-size:14px}.highlights{display:flex;flex-wrap:wrap;gap:8px}.highlight{padding:9px 11px;border:1px solid var(--line);border-radius:7px;background:#fff;font-size:13px;font-weight:800}.trust-card{box-shadow:none}.trust-status{padding:13px;border-radius:7px;background:var(--soft);color:var(--brand-dark);font-weight:900}.trust-card p{color:var(--muted);font-size:13px}.trust-card dl{margin:18px 0 0}.trust-card dl div{padding:11px 0;border-top:1px solid var(--line)}.trust-card dt{color:var(--muted);font-size:11px;font-weight:800;text-transform:uppercase}.trust-card dd{margin:3px 0 0;font-weight:800;font-size:14px}.mobile-actions{display:none}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media(max-width:860px){.listing-hero,.content-grid{grid-template-columns:1fr}.summary-card{position:static}.gallery-stage{aspect-ratio:16/11}.content-grid{padding-bottom:90px}.mobile-actions{position:fixed;display:grid;grid-template-columns:1fr 1fr;gap:8px;z-index:30;left:0;right:0;bottom:0;padding:10px 18px calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);border-top:1px solid var(--line);backdrop-filter:blur(12px)}.mobile-actions .button{min-height:46px}.summary-card .actions{display:none}}
    @media(max-width:560px){.wrap{width:min(100% - 24px,1180px)}.topbar-inner{min-height:60px}.breadcrumbs{padding-top:18px}.gallery-card{padding:7px}.gallery-thumbs{grid-template-columns:repeat(3,minmax(0,1fr));overflow:hidden}.gallery-thumbs .thumb:nth-child(n+4){display:none}.summary-card,.content-card,.trust-card{padding:19px}.summary-card h1{font-size:27px}.price{font-size:28px}.detail-list{grid-template-columns:1fr}.overview{font-size:15px}.back-link{font-size:12px}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
  </style>
</head>
<body>
  <header class="topbar"><div class="wrap topbar-inner"><a class="brand" href="/">RealityGenius</a><a class="back-link" href="/user.html">Browse all properties</a></div></header>
  <main class="wrap">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/user.html">Properties</a> / <span>Listing #${esc(property.id)}</span></nav>
    <section class="listing-hero">
      <div class="gallery-card">
        <div class="gallery-stage"><img id="heroImage" src="${esc(image)}" alt="${esc(propertyTitle)} main view" fetchpriority="high"><span class="gallery-count">${gallery.length} photo${gallery.length === 1 ? "" : "s"}</span></div>
        ${gallery.length > 1 ? `<div class="gallery-thumbs" aria-label="Property photo gallery">${gallery.slice(0, 10).map((photo, index) => `<button class="thumb" type="button" data-photo-index="${index}" aria-label="Show property photo ${index + 1}" aria-current="${photo === image ? "true" : "false"}"><img src="${esc(photo)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      </div>
      <aside class="summary-card">
        <div class="eyebrow"><span class="pill">${esc(purpose)}</span><span class="pill">${esc(statusLabel)}</span><span class="pill warn">${esc(renLabel)}</span></div>
        <h1>${esc(propertyTitle)}</h1>
        <p class="location">${esc(location)}</p>
        <div class="price">${esc(money(price))}</div>
        <div class="quick-facts">
          ${bedrooms ? `<div class="quick-fact"><span>Bedrooms</span><strong>${bedrooms}</strong></div>` : ""}
          ${bathrooms ? `<div class="quick-fact"><span>Bathrooms</span><strong>${bathrooms}</strong></div>` : ""}
          ${sqft ? `<div class="quick-fact"><span>Built-up</span><strong>${sqft.toLocaleString("en-MY")} sq ft</strong></div>` : ""}
          ${psf ? `<div class="quick-fact"><span>Asking price</span><strong>RM ${psf.toLocaleString("en-MY")} / sq ft</strong></div>` : ""}
        </div>
        ${monthly ? `<div class="finance-note">Estimated RM ${monthly.toLocaleString("en-MY")}/month with 90% financing, 4.3% p.a. and 35 years. Estimate only; bank approval and rates vary.</div>` : ""}
        <div class="actions">
          ${whatsappUrl ? `<a class="button primary" href="${esc(whatsappUrl)}" target="_blank" rel="noopener noreferrer">WhatsApp listing contact</a>` : `<a class="button primary" href="${esc(buyerUrl)}">Request a viewing</a>`}
          <a class="button secondary" href="#description">Read property details</a>
        </div>
      </aside>
    </section>

    <section class="content-grid" id="description">
      <article class="content-card">
        <span class="section-kicker">Property description</span>
        <h2>A clearer look at this home</h2>
        <p class="overview">${esc(model.overview)}</p>
        ${model.facts.length ? `<div class="subsection"><h3>Listing details</h3><div class="detail-list">${model.facts.map((fact) => `<div class="detail"><span>${esc(fact.label)}</span><strong>${esc(fact.value)}</strong></div>`).join("")}</div></div>` : ""}
        ${model.highlights.length ? `<div class="subsection"><h3>What stands out</h3><div class="highlights">${model.highlights.map((highlight) => `<span class="highlight">${esc(highlight)}</span>`).join("")}</div></div>` : ""}
      </article>
      <aside class="trust-card">
        <span class="section-kicker">Listing evidence</span>
        <h2>Know what was checked</h2>
        <div class="trust-status">${esc(statusLabel)}</div>
        <p>${esc(property.qcScope || "An admin reviewed listing completeness, media presence and contactability.")}</p>
        <p><strong>Important:</strong> ${esc(property.qcLimitations || "QC does not prove ownership, legal title, current availability or market value.")}</p>
        <dl>
          <div><dt>Listing reference</dt><dd>#${esc(property.id)}</dd></div>
          <div><dt>Representative</dt><dd>${esc(cleanText(property.agentName || "Listing contact pending"))}</dd></div>
          <div><dt>Agency</dt><dd>${esc(cleanText(property.agencyName || "Not provided"))}</dd></div>
          <div><dt>REN status</dt><dd>${esc(renLabel)}</dd></div>
        </dl>
      </aside>
    </section>
  </main>
  <div class="mobile-actions" aria-label="Property actions">${whatsappUrl ? `<a class="button primary" href="${esc(whatsappUrl)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : `<a class="button primary" href="${esc(buyerUrl)}">Enquire</a>`}<a class="button secondary" href="#description">Details</a></div>
  <script>
    (() => {
      const photos = ${galleryJson};
      const hero = document.getElementById("heroImage");
      document.querySelectorAll("[data-photo-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.photoIndex || 0);
          if (!photos[index] || !hero) return;
          hero.src = photos[index];
          hero.alt = ${JSON.stringify(propertyTitle)} + " photo " + (index + 1);
          document.querySelectorAll("[data-photo-index]").forEach((item) => item.setAttribute("aria-current", String(item === button)));
        });
      });
    })();
  </script>
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
      return res.end('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Listing not found | RealityGenius</title><meta name="robots" content="noindex"></head><body style="font-family:system-ui;padding:40px"><h1>Listing not found</h1><p>This property may have been sold or removed. <a href="/user.html">Browse live listings</a>.</p></body></html>');
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    res.end(renderPage(property));
  } catch (error) {
    res.statusCode = 500;
    res.end("Unable to load this listing right now.");
  }
};
