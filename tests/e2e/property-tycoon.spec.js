const { test, expect } = require("@playwright/test");

const gamePath = process.env.RG_GAME_PATH || "/tycoon";

test.describe("RealityGenius Property Tycoon", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(gamePath);
    await page.evaluate(() => localStorage.removeItem("rg_property_tycoon_v1"));
    await page.reload();
  });

  test("plays the core buy, rent, upgrade and persistence loop", async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));

    await expect(page.getByRole("heading", { name: /Build Your Property Empire/i })).toBeVisible();
    await expect(page.getByText(/RM\s*1,000,000/).first()).toBeVisible();
    await page.getByRole("button", { name: "Start Building" }).click();
    await expect(page.locator("#mapCanvas")).toBeVisible();

    const paintedPixels = await page.locator("#mapCanvas").evaluate(canvas => {
      const context = canvas.getContext("2d");
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0;
      for (let index = 3; index < pixels.length; index += 64) if (pixels[index] > 0) count += 1;
      return count;
    });
    expect(paintedPixels).toBeGreaterThan(100);

    await page.locator('[data-action="buy"][data-location="shah-alam"]').click();
    await expect(page.getByText(/RM\s*540,000/).first()).toBeVisible();
    await page.getByRole("button", { name: "End turn" }).click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("rg_property_tycoon_v1")).turn)).toBe(2);

    await page.getByRole("button", { name: "Open Portfolio" }).click();
    await expect(page.getByRole("heading", { name: "Shah Alam" })).toBeVisible();
    await page.getByRole("button", { name: "Upgrade" }).click();
    await page.getByRole("button", { name: "Install upgrade" }).first().click();
    await expect(page.getByText("Basic Renovation", { exact: true })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: "Shah Alam" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("supports learning, advisor chat and virtual auction settlement", async ({ page, isMobile }) => {
    const openSecondary = async (name) => {
      if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
      await page.getByRole("button", { name: `Open ${name}` }).click();
    };
    await openSecondary("Learn");
    await page.getByRole("button", { name: "Complete lesson" }).first().click();
    await expect(page.locator("#modalCard").getByRole("heading", { name: "Rental yield" })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    await openSecondary("RG Genius");
    await page.getByLabel("Ask RG Genius").fill("How is my risk?");
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(page.getByText(/concentration risk/i)).toBeVisible();

    await openSecondary("Auction Night");
    await page.getByRole("button", { name: "Bid +RM15k" }).click();
    await page.getByRole("button", { name: "Win practice lot now" }).click();
    await page.getByRole("button", { name: "Open Portfolio" }).click();
    await expect(page.getByRole("heading", { name: "Petaling Jaya" })).toBeVisible();

    await openSecondary("Real Listings");
    await expect(page.getByText(/Reality check:/i)).toBeVisible();
    await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Book viewing" }).first()).toBeVisible();
  });

  test("fits a narrow mobile viewport and exposes the five primary controls", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile layout check");
    await expect(page.locator(".bottom-nav")).toBeVisible();
    for (const label of ["Home", "Map", "Portfolio", "Play", "Rankings"]) {
      await expect(page.getByRole("button", { name: `Open ${label}` })).toBeVisible();
    }
    const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
    await page.getByRole("button", { name: "Open Map" }).click();
    await expect(page.locator("#mapCanvas")).toBeVisible();
  });
});
