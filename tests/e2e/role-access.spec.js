const { test, expect } = require("@playwright/test");
const { PLAN_FEATURES } = require("../../api/_subscription");
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
    await expect(page.locator("#agentModel")).toContainText("Trust stays independent");
    await expect(page.locator("#agentJoin")).toContainText("Join as an Agent for Free");
    await expect(page.locator("#agentJoin")).toContainText("complete AgentOS workspace");
    await expect(page.locator("body")).not.toContainText(/RM(?:29|49|59|99)|Starter RG|Upgrade to (?:Starter|Pro|Elite)/i);
    await expect(page.locator("body")).toContainText("does not hold property booking fees");
  });

  test("agent signup is free and does not ask for a product key", async ({ page }) => {
    await page.goto("/login.html?role=agent&mode=signup");
    await expect(page.locator("#optionAgent")).toHaveClass(/active/);
    await expect(page.locator("#agentProductKey")).toHaveCount(0);
    await expect(page.locator("#roleNote")).toContainText("Join as an agent for free");
    await expect(page.locator("#roleNote")).toContainText("Admin approval");
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
  test("the free agent permission set includes every workspace tool", () => {
    expect(PLAN_FEATURES.free).toEqual({
      ai_content_creator: true,
      whatsapp_followups: true,
      ar_builder_demo: true,
      ar_builder_saved: true,
      document_vault: true,
      dsr_calculator: true,
      viewing_itinerary: true,
      co_broke_matchmaker: true,
      auction_slots: 4,
      referral_autopilot: true,
      team_setup: true
    });
  });

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
