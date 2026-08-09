const { test, expect } = require("@playwright/test");

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("Property description experience", () => {
  test("turns an imported listing into a clean, evidence-led description", async ({ page }) => {
    await page.goto("/property/730277");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Double Storey House for Sale – Taman Kim Chuan, Port Klang");
    await expect(page.getByRole("heading", { name: "A clearer look at this home" })).toBeVisible();
    await expect(page.getByText("Fully Furnished Double Storey", { exact: true })).toBeVisible();
    await expect(page.getByText("Spacious Car Porch", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Know what was checked" })).toBeVisible();
    await expect(page.getByText("QC does not prove ownership", { exact: false })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("ðŸ");
    await expectNoHorizontalOverflow(page);
  });

  test("supports an interactive, keyboard-labelled photo gallery", async ({ page }) => {
    await page.goto("/property/730277");
    const hero = page.locator("#heroImage");
    const firstSource = await hero.getAttribute("src");
    const secondPhoto = page.getByRole("button", { name: "Show property photo 2" });
    await secondPhoto.click();
    await expect(hero).not.toHaveAttribute("src", firstSource);
    await expect(secondPhoto).toHaveAttribute("aria-current", "true");
  });

  test("opens the same structured description inside the buyer marketplace", async ({ page }) => {
    await page.goto("/user.html?listing=730277", { waitUntil: "domcontentloaded" });
    const modal = page.locator("#propertyModal");
    await expect(modal).toHaveClass(/is-open/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "A clearer look at the home" })).toBeVisible();
    await expect(page.locator("#modalDescriptionFacts")).toContainText("Built-up");
    await expect(page.locator("#modalDescriptionHighlights")).toContainText("Well maintained");
    await expectNoHorizontalOverflow(page);
  });
});
