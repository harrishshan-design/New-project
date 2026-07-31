const { test, expect } = require("@playwright/test");
const apiBase = String(process.env.RG_API_BASE || "").replace(/\/$/, "");

function apiPath(path) {
  return `${apiBase}${path}`;
}

const protectedRoutes = [
  { path: "/agent.html", role: "agent" },
  { path: "/admin.html", role: "admin" },
  { path: "/master.html", role: "master" }
];

test.describe("RealityGenius role access", () => {
  for (const route of protectedRoutes) {
    test(`guest is redirected away from ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).toHaveURL(new RegExp(`/login\\.html\\?(.+&)?next=.*${route.path.replace("/", "%2F")}`));
      await expect(page.locator("#loginForm")).toBeVisible();
    });
  }

  test("buyer can search, open details, save, and create a local alert before login", async ({ page }) => {
    await page.goto("/user.html");
    await expect(page.locator("#searchInput")).toBeVisible();
    await page.locator('[data-action="open-details"]').first().click();
    await expect(page.locator("#propertyModal")).toHaveClass(/is-open/);
    await page.locator("#modalSaveAction").click();
    await expect(page.locator("#favoritesCount")).toHaveText("1");
    await page.locator('[data-close="propertyModal"]').click();
    await page.locator("#searchInput").fill("Shah Alam");
    await page.locator("#saveSearchButton").click();
    await expect(page).toHaveURL(/\/user\.html/);
    await expect(page.locator("#searchAlertStrip")).toContainText(/saved alert/i);
  });

  test("buyer viewing request captures consented intent details without login", async ({ page }) => {
    await page.goto("/user.html");
    await page.locator('[data-action="open-details"]').first().click();
    await expect(page.locator("#bookingBudget")).toBeVisible();
    await expect(page.locator("#bookingTimeline")).toBeVisible();
    await expect(page.locator("#bookingFinancing")).toBeVisible();
    await expect(page.locator("#bookingConsent")).toBeVisible();
  });

  test("public agent page explains the commercial and trust model", async ({ page }) => {
    await page.goto("/agents.html");
    await expect(page.locator("#agentModel")).toContainText("Trust cannot be bought");
    await expect(page.locator("#agentPricing")).toContainText("not a trust badge or feed position");
    await expect(page.locator("body")).toContainText("does not hold booking fees");
  });

  test("public buyer and agent pages do not overflow horizontally", async ({ page }) => {
    for (const path of ["/user.html", "/agents.html"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });

  test("invalid login fails and stays on login page", async ({ page }) => {
    await page.goto("/login.html?role=user&next=/user.html");
    await page.locator("#loginId").fill(`invalid-${Date.now()}@example.com`);
    await page.locator("#loginPassword").fill("wrong-password");
    await page.locator("#loginButton").click();
    await expect(page.locator("#sharedStatus")).toContainText(/invalid|credentials|email|password/i);
    await expect(page).toHaveURL(/\/login\.html/);
  });
});

test.describe("RealityGenius API fail-closed checks", () => {
  test("public inventory stays inside the declared Klang Valley wedge", async ({ request }) => {
    const res = await request.get(apiPath("/api/properties"));
    expect(res.status()).toBe(200);

    const payload = await res.json();
    const items = Array.isArray(payload) ? payload : (payload.items || payload.properties || []);
    expect(items.length).toBeGreaterThan(0);

    const klangValleyPlace = /kuala lumpur|\bkl\b|\bklcc\b|\bpj\b|putrajaya|cyberjaya|shah alam|petaling jaya|subang|klang|puchong|cheras|kajang|ampang|gombak|setapak|kepong|damansara|bangsar|mont kiara|bukit jalil|sri petaling|sentul|serdang|sri kembangan|rawang|semenyih|bandar utama|sungai buloh|ara damansara/i;
    for (const item of items) {
      expect(`${item.title || ""} ${item.area || ""} ${item.location || ""}`).toMatch(klangValleyPlace);
      expect(item.badge).toBe("qc-approved");
      expect(item.qcScope).toMatch(/reviewed by an admin/i);
      expect(item.qcLimitations).toMatch(/does not prove ownership/i);
      expect(String(item.title || "").replace(/[^a-z]/gi, "").toLowerCase()).not.toBe("available");
    }
  });

  test("agent subscription endpoint requires auth", async ({ request }) => {
    const res = await request.post(apiPath("/api/billing/create-checkout-session"), {
      data: { plan: "starter_rg" }
    });
    expect(res.status()).toBe(401);
  });

  test("agent profile endpoint requires auth", async ({ request }) => {
    const res = await request.get(apiPath("/api/agent/me"));
    expect(res.status()).toBe(401);
  });

  test("agent listing write requires auth", async ({ request }) => {
    const res = await request.post(apiPath("/api/agent/listings"), {
      data: { title: "Unauthorized listing", area: "Shah Alam", price: 500000, galleryUrls: [] }
    });
    expect(res.status()).toBe(401);
  });

  test("assigned agent leads require auth", async ({ request }) => {
    const res = await request.get(apiPath("/api/agent/leads"));
    expect(res.status()).toBe(401);
  });

  test("stripe webhook rejects unsigned payloads", async ({ request }) => {
    const res = await request.post(apiPath("/api/stripe/webhook"), {
      data: { type: "checkout.session.completed", data: { object: {} } }
    });
    expect(res.status()).toBe(400);
  });
});
