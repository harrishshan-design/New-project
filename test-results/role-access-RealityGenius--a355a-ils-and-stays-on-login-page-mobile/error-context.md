# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: role-access.spec.js >> RealityGenius role access >> invalid login fails and stays on login page
- Location: tests\e2e\role-access.spec.js:26:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "https://realitygenius.company/login.html?role=user&next=/user.html", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to login form" [ref=e2] [cursor=pointer]:
    - /url: "#loginForm"
  - main [ref=e3]:
    - region "RealityGenius login intro" [ref=e4]:
      - generic [ref=e5]:
        - button "RealityGenius internal access unlock" [ref=e6] [cursor=pointer]:
          - text: RealityGenius
          - superscript [ref=e7]: TM
        - link "Homepage" [ref=e8] [cursor=pointer]:
          - /url: ./index.html
      - generic [ref=e9]:
        - paragraph [ref=e10]: Login
        - heading "Welcome back." [level=1] [ref=e11]
        - paragraph [ref=e12]: Choose Buyer or Agent, enter basic details, then continue. No email code is needed for public signup.
        - link " Go to login" [ref=e13] [cursor=pointer]:
          - /url: "#loginForm"
          - generic [ref=e14]: 
          - text: Go to login
      - generic "Choose login role" [ref=e15]:
        - button " Buyer" [ref=e16] [cursor=pointer]:
          - generic [ref=e17]: 
          - text: Buyer
        - button " Agent" [ref=e18] [cursor=pointer]:
          - generic [ref=e19]: 
          - text: Agent
        - button " Admin" [ref=e20] [cursor=pointer]:
          - generic [ref=e21]: 
          - text: Admin
        - button " Master" [ref=e22] [cursor=pointer]:
          - generic [ref=e23]: 
          - text: Master
    - region "RealityGenius account login" [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e26]:
          - heading "RealityGeniusTM" [level=2] [ref=e27]:
            - text: RealityGenius
            - superscript [ref=e28]: TM
          - paragraph [ref=e29]: Login
        - generic "Login trust signals" [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e32]: 
            - text: Quick signup
          - generic [ref=e33]:
            - generic [ref=e34]: 
            - text: Simple login
          - generic [ref=e35]:
            - generic [ref=e36]: 
            - text: No email code
        - generic "Choose account action" [ref=e37]:
          - button "Login" [ref=e38] [cursor=pointer]
          - button "Sign up" [ref=e39] [cursor=pointer]
        - generic [ref=e40]:
          - text:   
          - generic [ref=e41]:
            - generic [ref=e42]: Email
            - generic [ref=e43]:
              - generic [ref=e44]: 
              - textbox "Email " [ref=e45]:
                - /placeholder: you@example.com
          - generic [ref=e46]:
            - generic [ref=e47]: Password
            - generic [ref=e48]:
              - generic [ref=e49]: 
              - textbox "Password " [ref=e50]:
                - /placeholder: Enter password
          - text: 
          - button " Next" [ref=e51] [cursor=pointer]:
            - generic [ref=e52]: 
            - text: Next
          - button "Forgot password?" [ref=e53] [cursor=pointer]
          - generic [ref=e54]:
            - generic [ref=e55]: Buyer
            - generic [ref=e56]: Agent
          - generic [ref=e57]:
            - generic [ref=e58]: 
            - generic [ref=e59]: Use one real email and password. RealityGenius detects your role automatically.
          - status [ref=e60]
        - paragraph [ref=e61]: We will open the right dashboard automatically.
```

# Test source

```ts
  1  | const { test, expect } = require("@playwright/test");
  2  | 
  3  | const protectedRoutes = [
  4  |   { path: "/agent.html", role: "agent" },
  5  |   { path: "/admin.html", role: "admin" },
  6  |   { path: "/master.html", role: "master" }
  7  | ];
  8  | 
  9  | test.describe("RealityGenius role access", () => {
  10 |   for (const route of protectedRoutes) {
  11 |     test(`guest is redirected away from ${route.path}`, async ({ page }) => {
  12 |       await page.goto(route.path);
  13 |       await expect(page).toHaveURL(new RegExp(`/login\\.html\\?(.+&)?next=.*${route.path.replace("/", "%2F")}`));
  14 |       await expect(page.locator("#loginForm")).toBeVisible();
  15 |     });
  16 |   }
  17 | 
  18 |   test("buyer page is browseable before login but protected actions ask for login", async ({ page }) => {
  19 |     await page.goto("/user.html");
  20 |     await expect(page.locator("#searchInput")).toBeVisible();
  21 |     await page.locator("#saveSearchButton").click();
  22 |     await expect(page).toHaveURL(/\/login\.html\?/);
  23 |     await expect(page.locator("#loginForm")).toBeVisible();
  24 |   });
  25 | 
  26 |   test("invalid login fails and stays on login page", async ({ page }) => {
> 27 |     await page.goto("/login.html?role=user&next=/user.html");
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  28 |     await page.locator("#loginId").fill(`invalid-${Date.now()}@example.com`);
  29 |     await page.locator("#loginPassword").fill("wrong-password");
  30 |     await page.locator("#loginButton").click();
  31 |     await expect(page.locator("#sharedStatus")).toContainText(/invalid|credentials|email|password/i);
  32 |     await expect(page).toHaveURL(/\/login\.html/);
  33 |   });
  34 | });
  35 | 
  36 | test.describe("RealityGenius API fail-closed checks", () => {
  37 |   test("agent subscription endpoint requires auth", async ({ request }) => {
  38 |     const res = await request.post("/api/billing/create-checkout-session", {
  39 |       data: { plan: "starter_rg" }
  40 |     });
  41 |     expect(res.status()).toBe(401);
  42 |   });
  43 | 
  44 |   test("agent profile endpoint requires auth", async ({ request }) => {
  45 |     const res = await request.get("/api/agent/me");
  46 |     expect(res.status()).toBe(401);
  47 |   });
  48 | 
  49 |   test("stripe webhook rejects unsigned payloads", async ({ request }) => {
  50 |     const res = await request.post("/api/stripe/webhook", {
  51 |       data: { type: "checkout.session.completed", data: { object: {} } }
  52 |     });
  53 |     expect(res.status()).toBe(400);
  54 |   });
  55 | });
  56 | 
```