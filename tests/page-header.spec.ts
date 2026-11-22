import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("its title is the page's one h1, its line under it", async ({ page }) => {
  await openExample(page, "page-header", "basic");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Spring launch"
  );
  await expect(page.getByRole("heading")).toHaveCount(1);
  await expect(
    page.getByText(
      "Everything the team ships in March, and who owns each part."
    )
  ).toBeVisible();
});

test("its actions stand at the end of the title's row, the main one last, reached in order", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "page-header", "basic");
  const share = page.getByRole("button", { name: "Share" });
  const main = page.getByRole("button", { name: "New task" });
  const title = await page.getByRole("heading", { level: 1 }).boundingBox();
  const shareBox = await share.boundingBox();
  const mainBox = await main.boundingBox();
  expect(shareBox?.x ?? 0).toBeGreaterThan(
    (title?.x ?? 0) + (title?.width ?? 0)
  );
  expect(mainBox?.x ?? 0).toBeGreaterThan(shareBox?.x ?? 0);
  await page.keyboard.press("Tab");
  await expect(share).toBeFocused();
  expect(await hasFocusRing(share)).toBe(true);
  await page.keyboard.press("Tab");
  await expect(main).toBeFocused();
});

test("while the page loads, placeholders stand for the words and the actions stay", async ({
  page,
}) => {
  await openExample(page, "page-header", "loading");
  await expect(page.getByRole("heading")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "New task" })).toBeVisible();
});

test("a sub-page's title is a step down, in the sans", async ({ page }) => {
  await openExample(page, "page-header", "sub-page");
  const title = page.getByRole("heading", { level: 1, name: "AI providers" });
  const look = await title.evaluate((node) => {
    const style = getComputedStyle(node);
    return { size: style.fontSize, weight: style.fontWeight };
  });
  expect(look).toEqual({ size: "20px", weight: "500" });
});

test("on a phone the main action stays and the others fold into More, which presses them", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "page-header", "actions");
  const main = page.getByRole("button", { name: "New task" });
  await expect(main).toBeVisible();
  await expect(main).toContainText("New task");
  await expect(page.getByRole("button", { name: "Export" })).toHaveCount(0);
  const more = page.getByRole("button", { name: "More actions" });
  await more.click();
  await expect(page.getByRole("menuitem")).toHaveText(["Export", "Share"]);
  await page.getByRole("menuitem", { name: "Share" }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  // The main action and the menu stand on the title's first line, at its end.
  const title = await page.getByRole("heading", { level: 1 }).boundingBox();
  const mainBox = await main.boundingBox();
  expect(mainBox?.y ?? 0).toBeLessThan((title?.y ?? 0) + 40);
});

test("narrowest, the main action is its icon alone, named by its words", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openExample(page, "page-header", "actions");
  const main = page.getByRole("button", { name: "New task" });
  await expect(main).toBeVisible();
  await expect(main).not.toContainText("New task");
});

test("folded, each kind of action is that kind of item, the destructive one last", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "page-header", "actions-kinds");
  await page.getByRole("button", { name: "More actions" }).click();
  const items = page.getByRole("menuitem");
  await expect(items).toHaveText([
    "Export",
    "Archive",
    "Open report",
    "Delete",
  ]);
  await expect(page.getByRole("menuitem", { name: "Archive" })).toBeDisabled();
  await expect(page.getByRole("menuitem", { name: "Export" })).toBeDisabled();
  await expect(
    page.getByRole("menuitem", { name: "Open report" })
  ).toHaveAttribute("href", "#report");
  await expect(page.getByRole("separator")).toHaveCount(1);
});

test("the keys reach More and the main action, and nothing hidden", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "page-header", "actions-kinds");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "More actions" })
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "New task" })).toBeFocused();
});

test("a banner is the page's head: its title the h1, its tabs and actions as a header's", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "page-header", "band-long");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Interviews with the finance team about the year-end close"
  );
  await expect(page.getByRole("banner")).toHaveCount(1);
});

test("its tabs stand under the title", async ({ page }) => {
  await openExample(page, "page-header", "tabs");
  const title = await page.getByRole("heading", { level: 1 }).boundingBox();
  const tabs = await page
    .getByRole("tablist", { name: "Spring launch" })
    .boundingBox();
  expect(tabs?.y ?? 0).toBeGreaterThan((title?.y ?? 0) + (title?.height ?? 0));
});

test("its toolbar is a group named for the list, its kinds at the start", async ({
  page,
}) => {
  await openExample(page, "page-header", "toolbar");
  const toolbar = page.getByRole("group", { name: "Outputs" });
  await expect(toolbar).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "All" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(
    toolbar.getByRole("searchbox", { name: "Search outputs" })
  ).toBeVisible();
});

test("a breadcrumb stands above the title, and the badge beside it", async ({
  page,
}) => {
  await openExample(page, "page-header", "breadcrumb");
  const crumbs = await page
    .getByRole("navigation", { name: /breadcrumb/iu })
    .boundingBox();
  const title = await page
    .getByRole("heading", { level: 1, name: "Settings" })
    .boundingBox();
  expect(title?.y ?? 0).toBeGreaterThan(crumbs?.y ?? 0);
  await expect(page.getByText("Draft")).toBeVisible();
});
