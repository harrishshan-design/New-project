const { test, expect } = require("@playwright/test");

test.describe("Public homepage affordability tool", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("is available before login with clear assumptions", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Can I afford this home?" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Run your numbers" })).toBeVisible();
    await expect(page.getByTestId("affordability-dsr")).toHaveText("42.9%");
    await expect(page.getByTestId("affordability-monthly")).toContainText("RM 3,119");
    await expect(page.getByTestId("affordability-fair")).toContainText("RM 617,500 - RM 682,500");
    await expect(page.locator("#affordability-tool")).toContainText("not a valuation or loan approval");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByTestId("affordability-income").fill("");
    await expect(page.getByTestId("affordability-dsr")).toHaveText("--");
    await expect(page.locator("#affordability-tool")).toContainText("Add monthly income");
  });

  test("recalculates DSR, monthly cost, fair range and WhatsApp handoff", async ({ page }) => {
    await page.getByTestId("affordability-price").fill("800000");
    await page.getByTestId("affordability-income").fill("12000");
    await page.getByTestId("affordability-commitments").fill("1500");
    await page.getByTestId("affordability-deposit").fill("20");
    await page.getByTestId("affordability-size").fill("1200");
    await page.getByTestId("affordability-psf").fill("600");

    await expect(page.getByTestId("affordability-dsr")).toHaveText("36.8%");
    await expect(page.getByTestId("affordability-monthly")).toContainText("RM 3,464");
    await expect(page.getByTestId("affordability-fair")).toContainText("RM 684,000 - RM 756,000");
    await expect(page.locator("#affordability-tool")).toContainText("Above nearby asking context");

    const href = await page.getByTestId("affordability-whatsapp").getAttribute("href");
    expect(href).toMatch(/^https:\/\/wa\.me\/60189676625\?text=/);
    const message = new URL(href).searchParams.get("text") || "";
    expect(message).toMatch(/Target home price: RM\s*800,000/);
    expect(message).not.toContain("Gross income");
    expect(message).not.toContain("Monthly commitments");
  });
});
