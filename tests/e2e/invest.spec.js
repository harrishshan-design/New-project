const { test, expect } = require("@playwright/test");

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("RealityGenius Invest pre-launch experience", () => {
  test("lands on a public, risk-labelled investment education page", async ({ page }) => {
    await page.goto("/invest");
    await expect(page.getByRole("heading", { name: "Own property from a fraction." })).toBeVisible();
    await expect(page.getByLabel("Investment risk notice")).toContainText("not an offer");
    await expect(page.getByRole("link", { name: "Explore properties", exact: true }).first()).toBeVisible();
    await expect(page.getByText("RM0", { exact: true })).toBeVisible();
    await expect(page.getByText("Accepted during this preview")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("shows curated opportunity previews without a payment action", async ({ page }) => {
    await page.goto("/invest/properties");
    await expect(page.getByRole("heading", { name: "Explore investment opportunity previews." })).toBeVisible();
    await expect(page.locator(".inv-property-card")).toHaveCount(3);
    await expect(page.getByText("Double-Storey House, Taman Kim Chuan")).toBeVisible();
    await expect(page.getByRole("button", { name: /pay|checkout|buy now/i })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("recalculates scenarios and registers non-binding interest", async ({ page }) => {
    await page.route("**/api/invest/interest", async (route) => {
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true, reference: "test-reference" }) });
    });
    await page.goto("/invest/property/taman-kim-chuan-double-storey");
    await expect(page.getByRole("link", { name: "View the live buyer listing" })).toHaveAttribute("href", "/property/730277");
    await expect(page.getByRole("heading", { name: "Investment scenario calculator" })).toBeVisible();
    await expect(page.getByTestId("investment-amount-output")).toContainText("RM 50,000");
    await page.getByTestId("investment-amount").evaluate((element) => {
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      valueSetter.call(element, "100000");
      element.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.getByRole("button", { name: "Conservative" }).click();
    await expect(page.getByTestId("investment-amount-output")).toContainText("RM 100,000");
    await expect(page.getByText("0.5% annual value movement")).toBeVisible();

    const form = page.getByTestId("investment-interest-form");
    await form.getByLabel("Full name").fill("Test Investor");
    await form.getByLabel("Email address").fill("investor@example.com");
    await form.getByLabel("Phone number").fill("0123456789");
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Express interest - no payment" }).click();
    await expect(form.getByRole("status")).toContainText("No slot or payment has been created");
    await expectNoHorizontalOverflow(page);
  });

  test("homepage provides a direct Invest path", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('.rg-nav-links a[href="/invest"]')).toHaveAttribute("href", "/invest");
    await expect(page.getByRole("heading", { name: "Invest in property differently." })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
