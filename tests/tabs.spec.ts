import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { openExample } from "./example.ts";

/** The height and width a press reaches on a control: its own box or the unseen target inside it. */
const pressBox = async (
  control: Locator
): Promise<{ width: number; height: number }> =>
  await control.evaluate((element) => {
    const boxes = [element, ...element.querySelectorAll("*")].map((each) =>
      each.getBoundingClientRect()
    );
    return {
      width: Math.max(...boxes.map((box) => box.width)),
      height: Math.max(...boxes.map((box) => box.height)),
    };
  });

test("Tab reaches the chosen tab; the arrows, Home and End choose, and Tab goes on to its panel", async ({
  page,
}) => {
  await openExample(page, "tabs", "basic");
  const list = page.getByRole("tablist", { name: "Project" });
  const overview = list.getByRole("tab", { name: "Overview" });
  const activity = list.getByRole("tab", { name: "Activity" });
  const members = list.getByRole("tab", { name: "Members" });
  await page.keyboard.press("Tab");
  await expect(overview).toBeFocused();
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(activity).toBeFocused();
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await expect(overview).toHaveAttribute("aria-selected", "false");
  await expect(page.getByRole("tabpanel", { name: "Activity" })).toHaveText(
    "Every change, newest first."
  );
  await page.keyboard.press("End");
  await expect(members).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(overview).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tabpanel", { name: "Overview" })).toBeFocused();
});

test("each tab controls its panel, and the panel is named by its tab", async ({
  page,
}) => {
  await openExample(page, "tabs", "basic");
  const overview = page.getByRole("tab", { name: "Overview" });
  const panel = page.getByRole("tabpanel", { name: "Overview" });
  await expect(panel).toBeVisible();
  const id = await panel.getAttribute("id");
  await expect(overview).toHaveAttribute("aria-controls", id ?? "");
  await page.getByRole("tab", { name: "Members" }).click();
  await expect(page.getByRole("tabpanel", { name: "Members" })).toBeVisible();
  await expect(panel).toBeHidden();
});

test("right to left, the arrows follow the reading direction", async ({
  page,
}) => {
  await openExample(page, "tabs", "basic");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const overview = page.getByRole("tab", { name: "Overview" });
  await overview.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Activity" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await page.keyboard.press("ArrowRight");
  await expect(overview).toHaveAttribute("aria-selected", "true");
});

test("a disabled tab is reached by the arrows but never chosen", async ({
  page,
}) => {
  await openExample(page, "tabs", "many");
  const billing = page.getByRole("tab", { name: "Billing" });
  await expect(billing).toBeDisabled();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.keyboard.press("ArrowRight");
  await expect(billing).toBeFocused();
  await expect(billing).toHaveAttribute("aria-selected", "false");
  await expect(page.getByRole("tab", { name: "Settings" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test.describe("at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("more tabs than room scroll inside the row; the page does not", async ({
    page,
  }) => {
    await openExample(page, "tabs", "many");
    const list = page.getByRole("tablist", { name: "Workspace" });
    const { scroll, client } = await list.evaluate((element) => ({
      scroll: element.scrollWidth,
      client: element.clientWidth,
    }));
    expect(scroll).toBeGreaterThan(client);
    const page_ = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(page_.scroll).toBeLessThanOrEqual(page_.client);
  });

  test("links that do not fit fold to one button with the current view, whose menu holds them all", async ({
    page,
  }) => {
    await openExample(page, "tabs", "links-fold");
    const navs = page.getByRole("navigation", { name: "Pipeline" });
    await expect(navs).toHaveCount(2);
    const many = navs.nth(1);
    // The row is moved out of sight, and out of reach.
    await expect(many.getByRole("link", { name: "Runs" })).not.toBeInViewport();
    const fold = many.getByRole("button", { name: "Flow" });
    await fold.click();
    const menu = page.getByRole("menu");
    await expect(menu.getByRole("menuitem")).toHaveCount(6);
    await expect(menu.getByRole("menuitem", { name: "Flow" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    await expect(
      menu.getByRole("menuitem", { name: "Settings" })
    ).toHaveAttribute("href", "#settings");
  });
});

test("a tab that closes has its own button, and Delete closes the focused tab", async ({
  page,
}) => {
  await openExample(page, "tabs", "files");
  const list = page.getByRole("tablist", { name: "Open files" });
  const close = page.getByRole("button", { name: "Close app.tsx" });
  await expect(close).toBeVisible();
  // The chosen tab's × is the one Tab stop after it.
  await list.getByRole("tab", { name: "app.tsx" }).focus();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(list.getByRole("tab", { name: "app.tsx" })).toHaveCount(0);
  const next = list.getByRole("tab", { name: "invoice-table.tsx" });
  await expect(next).toBeFocused();
  await expect(next).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Delete");
  await expect(next).toHaveCount(0);
  await expect(list.getByRole("tab", { name: "invoices.ts" })).toBeFocused();
});

test("views with their own address are a navigation of links, one of them the current page, and the arrows move along it", async ({
  page,
}) => {
  await openExample(page, "tabs", "links");
  const nav = page.getByRole("navigation", { name: "Run" });
  await expect(page.getByRole("tablist")).toHaveCount(0);
  const overview = nav.getByRole("link", { name: "Overview" });
  await expect(overview).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Logs" })).not.toHaveAttribute(
    "aria-current"
  );
  await expect(nav.getByRole("link", { name: "Settings" })).toHaveAttribute(
    "href",
    "#settings"
  );
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(nav.getByRole("link", { name: "Logs" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(nav.getByRole("link", { name: "Settings" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(overview).toBeFocused();
});

test("a small view switch names every link by its words, and shows them as a tooltip on an icon alone", async ({
  page,
}) => {
  await openExample(page, "tabs", "views");
  const nav = page.getByRole("navigation", { name: "App" });
  const code = nav.getByRole("link", { name: "Code" });
  await expect(code).not.toHaveAttribute("aria-current");
  await nav.getByRole("link", { name: "Preview" }).focus();
  await page.keyboard.press("Tab");
  await expect(code).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText("Code");
  await code.click();
  await expect(code).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Preview" })).not.toHaveAttribute(
    "aria-current"
  );
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("every tab has a 44px target", async ({ page }) => {
    for (const example of ["basic", "segmented"]) {
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      await openExample(page, "tabs", example);
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      for (const tab of await page.getByRole("tab").all()) {
        // oxlint-disable-next-line no-await-in-loop -- one tab after the other
        const target = await pressBox(tab);
        expect(target.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test("on the segmented track the first and last tab stand as far from its sides as from its top", async ({
  page,
}) => {
  await openExample(page, "tabs", "segmented");
  const list = page.getByRole("tablist").first();
  const tabs = list.getByRole("tab");
  const track = await list.boundingBox();
  const first = await tabs.first().boundingBox();
  const last = await tabs.last().boundingBox();
  if (track === null || first === null || last === null) {
    throw new Error("The track or its tabs are not drawn.");
  }
  const above = first.y - track.y;
  expect(first.x - track.x).toBeCloseTo(above, 0);
  expect(track.x + track.width - (last.x + last.width)).toBeCloseTo(above, 0);
});
