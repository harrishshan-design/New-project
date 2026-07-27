const { test, expect } = require("@playwright/test");

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

  test("buyer page is browseable before login but protected actions ask for login", async ({ page }) => {
    await page.goto("/user.html");
    await expect(page.locator("#searchInput")).toBeVisible();
    await page.locator("#saveSearchButton").click();
    await expect(page).toHaveURL(/\/login\.html\?/);
    await expect(page.locator("#loginForm")).toBeVisible();
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
  test("agent subscription endpoint requires auth", async ({ request }) => {
    const res = await request.post("/api/billing/create-checkout-session", {
      data: { plan: "starter_rg" }
    });
    expect(res.status()).toBe(401);
  });

  test("agent profile endpoint requires auth", async ({ request }) => {
    const res = await request.get("/api/agent/me");
    expect(res.status()).toBe(401);
  });

  test("stripe webhook rejects unsigned payloads", async ({ request }) => {
    const res = await request.post("/api/stripe/webhook", {
      data: { type: "checkout.session.completed", data: { object: {} } }
    });
    expect(res.status()).toBe(400);
  });
});
