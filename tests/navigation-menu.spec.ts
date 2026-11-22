import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { openExample } from "./example.ts";

/** The height a press reaches on a control: its own box or the unseen target inside it. */
const pressHeight = async (control: Locator): Promise<number> =>
  await control.evaluate((element) =>
    Math.max(
      element.getBoundingClientRect().height,
      ...[...element.querySelectorAll("*")].map(
        (inner) => inner.getBoundingClientRect().height
      )
    )
  );

test("Enter on a trigger opens its panel, Tab moves into its links, and Escape closes it and gives focus back", async ({
  page,
}) => {
  await openExample(page, "navigation-menu", "main");
  const nav = page.getByRole("navigation", { name: "Main" });
  const product = nav.getByRole("button", { name: "Product" });
  await page.keyboard.press("Tab");
  await expect(product).toBeFocused();
  await expect(product).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await expect(product).toHaveAttribute("aria-expanded", "true");
  const reports = page.getByRole("link", { name: /Reports/u });
  await expect(reports).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(reports).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(reports).toBeHidden();
  await expect(product).toBeFocused();
});

test("resting the pointer on a trigger opens its panel", async ({ page }) => {
  await openExample(page, "navigation-menu", "main");
  await page.getByRole("button", { name: "Resources" }).hover();
  await expect(page.getByRole("link", { name: "Guides" })).toBeVisible();
});

test("with openOnHover off, resting does nothing and a press opens it; a trigger out of use opens nothing", async ({
  page,
}) => {
  await openExample(page, "navigation-menu", "press");
  const projects = page.getByRole("button", { name: "Projects" });
  await projects.hover();
  const launch = page.getByRole("link", { name: /Spring launch/u });
  await expect(launch).toBeHidden();
  await projects.click();
  await expect(launch).toBeVisible();
  await page.keyboard.press("Escape");
  const archive = page.getByRole("button", { name: "Archive" });
  await archive.click({ force: true });
  await expect(
    page.getByRole("link", { name: /Projects from 2025/u })
  ).toBeHidden();
  await expect(archive).not.toHaveAttribute("aria-expanded", "true");
});

test("the links are ordinary links, and the page you are on is marked as the current page", async ({
  page,
}) => {
  await openExample(page, "navigation-menu", "main");
  await expect(page.getByRole("link", { name: "Pricing" })).toHaveAttribute(
    "href",
    "#pricing"
  );
  await page.getByRole("button", { name: "Product" }).click();
  const sharing = page.getByRole("link", { name: /Sharing/u });
  await expect(sharing).toHaveAttribute("aria-current", "page");
  await expect(sharing).toHaveAttribute("href", "#sharing");
  await expect(
    page.getByRole("link", { name: /Reports/u })
  ).not.toHaveAttribute("aria-current", "page");
});

test("every panel's links are in the server's HTML, for crawlers and find in page", async ({
  page,
}) => {
  await openExample(page, "navigation-menu", "main");
  const response = await page.request.get(page.url());
  const html = await response.text();
  for (const words of ["Forecasts", "Alerts", "Community", "Changelog"]) {
    expect(html).toContain(words);
  }
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("every trigger and link in the row has a 44px target", async ({
    page,
  }) => {
    await openExample(page, "navigation-menu", "main");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const control of [
      nav.getByRole("button", { name: "Product" }),
      nav.getByRole("button", { name: "Resources" }),
      nav.getByRole("link", { name: "Pricing" }),
      nav.getByRole("link", { name: "Status" }),
    ]) {
      // oxlint-disable-next-line no-await-in-loop -- one control after the other
      expect(await pressHeight(control)).toBeGreaterThanOrEqual(44);
    }
  });
});

test("the arrows move along the row, and Home and End jump to its ends", async ({
  page,
}) => {
  await openExample(page, "navigation-menu", "main");
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("button", { name: "Product" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(nav.getByRole("button", { name: "Resources" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(nav.getByRole("link", { name: "Pricing" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(nav.getByRole("button", { name: "Resources" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(nav.getByRole("link", { name: "Status" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(nav.getByRole("button", { name: "Product" })).toBeFocused();
});
