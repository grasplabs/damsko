import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { openExample } from "./example.ts";

const TOGGLE = "Show or hide the sidebar";
const PANEL = "Show or hide the panel";

const widthOf = async (locator: Locator): Promise<number> => {
  const box = await locator.boundingBox();
  return box?.width ?? 0;
};
const topOf = async (locator: Locator): Promise<number> => {
  const box = await locator.boundingBox();
  return box?.y ?? 0;
};

// The keys as the sidebar names them on its trigger ("Meta+B" on a Mac, "Control+B" elsewhere).
const pressKeys = async (page: Page): Promise<void> => {
  const keys = await page
    .getByRole("button", { name: TOGGLE })
    .first()
    .getAttribute("aria-keyshortcuts");
  expect(keys).toMatch(/\+B$/u);
  await page.keyboard.press(keys?.replace(/B$/u, "b") ?? "");
};

test("the breadcrumb says where the page is, the page itself last", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Projects" })).toBeVisible();
  await expect(crumbs).toContainText("Spring launch");
  await expect(page.getByRole("button", { name: "Share" })).toBeVisible();
});

test("the sidebar is a named landmark beside the main page, which holds the header", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await expect(sidebar.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  const main = page.getByRole("main");
  await expect(main.getByRole("button", { name: TOGGLE })).toBeVisible();
  await expect(
    main.getByRole("navigation", { name: "Breadcrumb" })
  ).toBeVisible();
  // The header is the page's, inside main: no banner landmark of its own.
  await expect(page.getByRole("banner")).toHaveCount(0);
});

test("the trigger and Cmd+B or Ctrl+B fold the sidebar away and bring it back", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const trigger = page.getByRole("main").getByRole("button", { name: TOGGLE });
  const row = page
    .getByRole("complementary", { name: "Sidebar" })
    .getByRole("link", { name: "Inbox" });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(row).toBeHidden();
  await pressKeys(page);
  await expect(row).toBeVisible();
  await pressKeys(page);
  await expect(row).toBeHidden();
});

test("the page's name renames in place: Enter saves, and the page says the new name", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await crumbs.getByRole("button", { name: "Spring launch" }).click();
  const field = page.getByRole("textbox", { name: "Rename" });
  await expect(field).toBeFocused();
  await field.fill("Summer launch");
  await page.keyboard.press("Enter");
  await expect(crumbs).toContainText("Summer launch");
  await expect(
    page.getByRole("heading", { name: "Summer launch" })
  ).toBeVisible();
});

test("the end panel resizes from its handle with the arrow keys, and its button hides it", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "panel");
  const panel = page.getByRole("complementary", { name: "Note details" });
  await expect(panel).toBeVisible();
  const before = await widthOf(panel);
  const handle = page.getByRole("separator", { name: "Resize the panel" });
  await handle.focus();
  // The page before the handle narrows, so the panel after it grows: in reading order, back.
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => await widthOf(panel)).toBeGreaterThan(before);
  const button = page.getByRole("button", { name: PANEL });
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await button.click();
  await expect(panel).toBeHidden();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await button.click();
  await expect(panel).toBeVisible();
});

test("on a phone the panel is a sheet: Tab stays inside, and Escape gives focus back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "app-shell-01", "panel");
  const button = page.getByRole("button", { name: PANEL });
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("complementary", { name: "Note details" })
  ).toBeHidden();
  await button.click();
  const sheet = page.getByRole("dialog", { name: "Details" });
  await expect(sheet).toBeVisible();
  await expect(
    sheet.getByRole("complementary", { name: "Note details" })
  ).toBeVisible();
  for (let step = 0; step < 4; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other
    await page.keyboard.press("Tab");
    expect(
      // oxlint-disable-next-line no-await-in-loop -- see above
      await sheet.evaluate((node) => node.contains(document.activeElement))
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(button).toBeFocused();
});

test("on a phone the sidebar is a sheet, and a link followed in it closes it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "app-shell-01", "basic");
  await page.getByRole("button", { name: TOGGLE }).click();
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("link", { name: "Dashboard" }).click();
  await expect(sheet).toBeHidden();
  await expect(page).toHaveURL(/#dashboard$/u);
});

test("a banner stands above the header, across the page", async ({ page }) => {
  await openExample(page, "app-shell-01", "banner");
  const notice = page.getByText("Scheduled maintenance");
  const trigger = page.getByRole("main").getByRole("button", { name: TOGGLE });
  const above = await topOf(notice);
  const header = await topOf(trigger);
  expect(above).toBeLessThan(header);
});

test("right to left, the sidebar stands at the right and the panel at the left", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "panel");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const sidebar = await page
    .getByRole("complementary", { name: "Sidebar" })
    .boundingBox();
  const panel = await page
    .getByRole("complementary", { name: "Note details" })
    .boundingBox();
  const heading = await page
    .getByRole("heading", { name: "Launch notes" })
    .boundingBox();
  expect(sidebar?.x ?? 0).toBeGreaterThan(heading?.x ?? 0);
  expect(panel?.x ?? 0).toBeLessThan(heading?.x ?? 0);
});

for (const [theme, ground, card] of [
  ["light", "oklch(0.957 0 0)", "oklch(1 0 0)"],
  ["dark", "oklch(0.18 0 0)", "oklch(0.215 0 0)"],
] as const) {
  test(`${theme}: the page is a card on the sidebar's neutral ground, 6px in on every side`, async ({
    page,
  }) => {
    await openExample(page, "app-shell-01", "basic", { theme });
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    const main = page.getByRole("main");
    await expect(main).toHaveCSS("background-color", card);
    await expect(main).toHaveCSS("box-shadow", "none");
    // The ground under the card is the sidebar's own.
    await expect(main.locator("..")).toHaveCSS("background-color", ground);
    const aside = await sidebar.boundingBox();
    const page_ = await main.boundingBox();
    const shell = await main.locator("..").boundingBox();
    if (aside === null || page_ === null || shell === null) {
      throw new Error("The shell has no box.");
    }
    expect(page_.x - (aside.x + aside.width)).toBe(6);
    expect(page_.y - shell.y).toBe(6);
    expect(shell.x + shell.width - (page_.x + page_.width)).toBe(6);
    expect(shell.y + shell.height - (page_.y + page_.height)).toBe(6);
    // The rows reach 8px from the sidebar's edges: nothing stands between it and the window.
    const row = await sidebar
      .getByRole("link", { name: "Projects" })
      .boundingBox();
    expect((row?.x ?? 0) - aside.x).toBe(8);
    expect(aside.width - (row?.width ?? 0)).toBe(16);
  });
}
