import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

interface AgentRun {
  ok: boolean;
  error?: { message: string };
  open?: { error?: unknown; buttons?: string[] }[];
}

/** The page's agent bridge presses an item of the menu on the area named `ref`. */
const agentPress = async (
  page: Page,
  ref: string,
  words: string
): Promise<AgentRun> =>
  await page.evaluate(
    async ([area, item]) => {
      // SAFETY: the example calls pageAgent(), which puts the agent bridge on window.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see SAFETY
      const bridge = Reflect.get(window, "damskoAgent") as {
        act: (plan: { steps: unknown[] }) => Promise<AgentRun>;
      };
      return await bridge.act({
        steps: [{ ref: area, action: "press", args: [item] }],
      });
    },
    [ref, words] as const
  );

test("an agent runs an action by its words, and a failed one fails with the words the person sees", async ({
  page,
}) => {
  await openExample(page, "context-menu", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const ran = await agentPress(page, "Q3 forecast", "Duplicate");
  expect(ran.ok).toBe(true);
  await expect(page.locator("body")).toHaveAttribute("data-ran", "duplicate");

  const failed = await agentPress(page, "Q3 forecast", "Share with the team");
  const reported = failed.open?.find((entry) => entry.error !== undefined);
  expect(failed.ok && reported === undefined).toBe(false);
  expect(
    [failed.error?.message ?? "", ...(reported?.buttons ?? [])].join(" ")
  ).toContain("Could not share");
  await expect(
    page.getByRole("menuitem", { name: /Share with the team/u })
  ).toContainText("Could not share");
});

test("a right-click opens it at the pointer without moving the page, and a press outside closes it", async ({
  page,
}) => {
  await openExample(page, "context-menu", "file");
  const area = page.getByRole("group", { name: "Q3 forecast" });
  const box = await area.boundingBox();
  if (box === null) {
    throw new Error("the area is not drawn");
  }
  const x = box.x + 40;
  const y = box.y + box.height / 2;
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.click(x, y, { button: "right" });
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const placed = await menu.boundingBox();
  expect(Math.abs((placed?.x ?? 0) - x)).toBeLessThan(24);
  expect(Math.abs((placed?.y ?? 0) - y)).toBeLessThan(24);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await page.mouse.click(5, 5);
  await expect(menu).toBeHidden();
});

test("the area is a tab stop; Shift+F10 opens it on the first item, and the arrows, Home, End and letters move", async ({
  page,
}) => {
  await openExample(page, "context-menu", "file");
  const area = page.getByRole("group", { name: "Q3 forecast" });
  await page.keyboard.press("Tab");
  await expect(area).toBeFocused();
  await page.keyboard.press("Shift+F10");
  await expect(page.getByRole("menu")).toBeVisible();
  const item = (name: string) => page.getByRole("menuitem", { name });
  await expect(item("Open")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(item("Duplicate")).toBeFocused();
  await page.keyboard.press("End");
  await expect(item("Move to trash")).toBeFocused();
  // The arrows wrap at the ends.
  await page.keyboard.press("ArrowDown");
  await expect(item("Open")).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(item("Move to trash")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(item("Open")).toBeFocused();
  // A letter jumps to the next item that starts with it.
  await page.keyboard.press("c");
  await expect(item("Copy link")).toBeFocused();
  // An item out of use is reached by the keys, as the menu pattern asks, and does nothing.
  await page.keyboard.press("ArrowDown");
  const disabled = item("Export as CSV");
  await expect(disabled).toBeFocused();
  await expect(disabled).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
});

test("Escape closes it and focus goes back to the area", async ({ page }) => {
  await openExample(page, "context-menu", "file");
  const area = page.getByRole("group", { name: "Q3 forecast" });
  await area.focus();
  await page.keyboard.press("Shift+F10");
  await expect(page.getByRole("menuitem", { name: "Open" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(area).toBeFocused();
});

test("Enter runs an item and closes the menu, giving focus back to the area", async ({
  page,
}) => {
  await openExample(page, "context-menu", "agent");
  const area = page.getByRole("group", { name: "Q3 forecast" });
  await area.focus();
  await page.keyboard.press("Shift+F10");
  await expect(page.getByRole("menuitem", { name: "Duplicate" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(page.locator("body")).toHaveAttribute("data-ran", "duplicate");
  await expect(area).toBeFocused();
});

test("an item with a shortcut names its keys to assistive tech", async ({
  page,
}) => {
  await openExample(page, "context-menu", "file");
  await page.getByRole("group", { name: "Q3 forecast" }).focus();
  await page.keyboard.press("Shift+F10");
  await expect(
    page.getByRole("menuitem", { name: "Duplicate" })
  ).toHaveAttribute("aria-keyshortcuts", /D/u);
});

test("a checkbox item turns on and off, and a radio item is chosen", async ({
  page,
}) => {
  await openExample(page, "context-menu", "view");
  const area = page.getByRole("group", { name: "Launch board" });
  await area.click({ button: "right" });
  await expect(
    page.getByRole("menuitemcheckbox", { name: "Show finished tasks" })
  ).toBeChecked();
  const compact = page.getByRole("menuitemcheckbox", { name: "Compact cards" });
  await expect(compact).not.toBeChecked();
  await compact.click();
  await expect(compact).toBeChecked();
  await page.keyboard.press("Space");
  await expect(compact).not.toBeChecked();
  const priority = page.getByRole("menuitemradio", { name: "Priority" });
  await priority.click();
  await expect(priority).toBeChecked();
  await expect(
    page.getByRole("menuitemradio", { name: "Due date" })
  ).not.toBeChecked();
});

test("the chosen radio item shows a dot and the checked checkbox item a tick", async ({
  page,
}) => {
  await openExample(page, "context-menu", "view");
  await page
    .getByRole("group", { name: "Launch board" })
    .click({ button: "right" });
  const tick = await page
    .getByRole("menuitemcheckbox", { name: "Show finished tasks" })
    .evaluate((item) => item.querySelector("svg") !== null);
  expect(tick).toBe(true);
  const dot = await page
    .getByRole("menuitemradio", { name: "Due date" })
    .evaluate((item) => {
      const mark = item.lastElementChild;
      return {
        tick: item.querySelector("svg") !== null,
        dot:
          mark !== null &&
          getComputedStyle(mark, "::before").content !== "none",
      };
    });
  expect(dot).toEqual({ tick: false, dot: true });
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("its items are 44px tall", async ({ page }) => {
    await openExample(page, "context-menu", "file");
    await page.getByRole("group", { name: "Q3 forecast" }).focus();
    await page.keyboard.press("Shift+F10");
    const items = page.getByRole("menuitem");
    await expect(items.first()).toBeVisible();
    const heights = await items.evaluateAll((all) =>
      all.map((item) => Math.round(item.getBoundingClientRect().height))
    );
    expect(heights.every((height) => height >= 44)).toBe(true);
  });
});

test("round a link that takes the keys, the area takes no tab stop, and focus goes back to the link", async ({
  page,
}) => {
  await openExample(page, "context-menu", "link-inside");
  const link = page.getByRole("link", { name: "Q3 forecast" });
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  await page.keyboard.press("Shift+F10");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(link).toBeFocused();
});

test("a submenu opens with Right on its item, keeps the arrows to itself, and Left closes it", async ({
  page,
}) => {
  await openExample(page, "context-menu", "submenu");
  await page.getByRole("group", { name: "Roadmap" }).focus();
  await page.keyboard.press("Shift+F10");
  const share = page.getByRole("menuitem", { name: "Share" });
  await page.keyboard.press("s");
  await expect(share).toBeFocused();
  await expect(share).toHaveAttribute("aria-haspopup", "menu");
  await page.keyboard.press("ArrowRight");
  const team = page.getByRole("menuitem", { name: "With the team" });
  await expect(team).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "By email" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(team).toBeHidden();
  await expect(share).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "Move to trash" })
  ).toBeFocused();
});

test("an item can be a link: Enter follows it and closes the menu", async ({
  page,
}) => {
  await openExample(page, "context-menu", "submenu");
  await page.getByRole("group", { name: "Roadmap" }).focus();
  await page.keyboard.press("Shift+F10");
  const open = page.getByRole("menuitem", { name: "Open" });
  await expect(open).toBeFocused();
  await expect(open).toHaveAttribute("href", "#roadmap");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#roadmap$/u);
  await expect(page.getByRole("menu")).toBeHidden();
});
