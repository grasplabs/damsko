import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

interface AgentRun {
  ok: boolean;
  error?: { message: string };
  open?: { error?: unknown; buttons?: string[] }[];
}

/** The page's agent bridge presses `ref`, or an item of the menu it opens. */
const agentPress = async (
  page: Page,
  ref: string,
  words?: string
): Promise<AgentRun> =>
  await page.evaluate(
    async ([trigger, item]) => {
      // SAFETY: the example calls pageAgent(), which puts the agent bridge on window.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see SAFETY
      const bridge = Reflect.get(window, "damskoAgent") as {
        act: (plan: { steps: unknown[] }) => Promise<AgentRun>;
      };
      return await bridge.act({
        steps: [
          item === undefined
            ? { ref: trigger, action: "press" }
            : { ref: trigger, action: "press", args: [item] },
        ],
      });
    },
    [ref, words] as const
  );

/** What the agent example's items have run, in order. */
const ran = async (page: Page): Promise<string[]> =>
  await page.evaluate(() => {
    const log: unknown = Reflect.get(window, "menuLog");
    return Array.isArray(log) ? log.map(String) : [];
  });

test("Enter, Space and Down open it on the first item, Up on the last", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "basic");
  const trigger = page.getByRole("button", { name: "Report" });
  const menu = page.getByRole("menu");
  const item = (name: string) => page.getByRole("menuitem", { name });
  const opensOnFirst = async (key: string) => {
    await trigger.focus();
    await page.keyboard.press(key);
    await expect(menu).toBeVisible();
    await expect(item("Rename")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  };
  await opensOnFirst("Enter");
  await opensOnFirst("Space");
  await opensOnFirst("ArrowDown");
  await trigger.focus();
  await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  await page.keyboard.press("ArrowUp");
  await expect(item("Archive")).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("the arrows wrap, Home and End go to the ends, and a letter finds its item", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "icons");
  await page.getByRole("button", { name: "Edit" }).focus();
  await page.keyboard.press("Enter");
  const item = (name: string) => page.getByRole("menuitem", { name });
  await expect(item("Rename")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(item("Duplicate")).toBeFocused();
  await page.keyboard.press("End");
  await expect(item("Archive")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(item("Rename")).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(item("Archive")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(item("Rename")).toBeFocused();
  await page.keyboard.press("c");
  await expect(item("Copy link")).toBeFocused();
});

test("an item with a shortcut names its keys to assistive tech", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "icons");
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(
    page.getByRole("menuitem", { name: "Duplicate" })
  ).toHaveAttribute("aria-keyshortcuts", /D/u);
});

test("Enter runs an item and closes the menu, giving focus back to the trigger", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "agent");
  const trigger = page.getByRole("button", { name: "Report" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitem", { name: "Duplicate" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeHidden();
  expect(await ran(page)).toEqual(["duplicated"]);
  await expect(trigger).toBeFocused();
});

test("Escape closes it with focus back on the trigger, and a press outside closes it", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "basic");
  const trigger = page.getByRole("button", { name: "Report" });
  const menu = page.getByRole("menu");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(menu).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(menu).toBeHidden();
});

test("an item out of use is reached by the arrows, says so, and does nothing", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "basic");
  await page.getByRole("button", { name: "Report" }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const disabled = page.getByRole("menuitem", { name: "Move to folder" });
  await expect(disabled).toBeFocused();
  await expect(disabled).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
});

test("checkbox and radio items say they are on, turn over with the menu open, and a label names their group", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "choices");
  await page.getByRole("button", { name: "View" }).click();
  const grid = page.getByRole("menuitemcheckbox", { name: "Show the grid" });
  const rulers = page.getByRole("menuitemcheckbox", { name: "Show rulers" });
  await expect(grid).toBeChecked();
  await expect(rulers).not.toBeChecked();
  await rulers.click();
  await expect(rulers).toBeChecked();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(rulers).not.toBeChecked();
  await expect(page.getByRole("group", { name: "Sort by" })).toBeVisible();
  const name = page.getByRole("menuitemradio", { name: "Name" });
  await expect(
    page.getByRole("menuitemradio", { name: "Date modified" })
  ).toBeChecked();
  await name.click();
  await expect(name).toBeChecked();
  await expect(
    page.getByRole("menuitemradio", { name: "Date modified" })
  ).not.toBeChecked();
  await expect(page.getByRole("menu")).toBeVisible();
});

test("the chosen radio item shows a dot and the checked checkbox item a tick", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "choices");
  await page.getByRole("button", { name: "View" }).click();
  const tick = await page
    .getByRole("menuitemcheckbox", { name: "Show the grid" })
    .evaluate((item) => item.querySelector("svg") !== null);
  expect(tick).toBe(true);
  const dot = await page
    .getByRole("menuitemradio", { name: "Date modified" })
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

test("an item with no icon starts its words where the others' do", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "groups");
  await page.getByRole("button", { name: "Account", exact: true }).click();
  const starts = await page.getByRole("menuitem").evaluateAll((items) =>
    items.map((item) => {
      const words = [...item.querySelectorAll("span")].find(
        (span) =>
          span.children.length === 0 &&
          (span.textContent ?? "") === (item.textContent ?? "").trim()
      );
      const range = document.createRange();
      range.selectNodeContents(words ?? item);
      return Math.round(range.getBoundingClientRect().left);
    })
  );
  expect(starts.length).toBeGreaterThan(3);
  expect(new Set(starts).size).toBe(1);
});

test("an item with work stays open and busy while it runs, closes once done, and gives focus back", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "agent");
  const trigger = page.getByRole("button", { name: "Report" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("End");
  const trash = page.getByRole("menuitem", { name: "Move to trash" });
  await expect(trash).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trash).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByRole("menu")).toBeHidden();
  expect(await ran(page)).toEqual(["trashed"]);
  await expect(trigger).toBeFocused();
});

test("an item whose work fails says so and the menu stays open; an item out of use never runs", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "agent");
  await page.getByRole("button", { name: "Report" }).click();
  await page.getByRole("menuitem", { name: "Publish" }).click();
  await expect(page.getByRole("menuitem", { name: /Publish/u })).toContainText(
    "Could not publish"
  );
  await expect(page.getByRole("menu")).toBeVisible();
  const exporting = page.getByRole("menuitem", { name: "Export" });
  await exporting.click({ force: true });
  await exporting.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  expect(await ran(page)).toEqual([]);
});

test("an agent opens it by the trigger's name and presses an item by its words", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const opened = await agentPress(page, "Report");
  expect(opened.ok).toBe(true);
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  const pressed = await agentPress(page, "Report", "Duplicate");
  expect(pressed.ok).toBe(true);
  await expect.poll(async () => await ran(page)).toEqual(["duplicated"]);
});

test("a destructive item waits for the person's yes, and a failed one answers with its words", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  await page.evaluate(() => {
    Reflect.set(window, "damskoAgentYes", false);
  });
  const refused = await agentPress(page, "Report", "Move to trash");
  expect(refused.ok).toBe(false);
  expect(await ran(page)).not.toContain("trashed");
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    Reflect.set(window, "damskoAgentYes", true);
  });
  const allowed = await agentPress(page, "Report", "Move to trash");
  expect(allowed.ok).toBe(true);
  await expect.poll(async () => await ran(page)).toContain("trashed");
  await page.keyboard.press("Escape");

  // UI SDK's bridge does not wait on a menu item's Promise, so the failure reaches the agent as the
  // open menu shows it: on the item, in the words the person sees.
  await agentPress(page, "Report", "Publish");
  await expect(page.getByRole("menuitem", { name: /Publish/u })).toContainText(
    "Could not publish"
  );
});

test("an item can be a router's link or an <a href>: a press and Enter follow it and close the menu", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "links");
  const trigger = page.getByRole("button", { name: "Apps" });
  const host = page.locator("[data-open]").first();
  await trigger.click();
  const items = page.getByRole("menuitem");
  await expect(items).toHaveCount(3);
  const links = await items.evaluateAll((all) =>
    all.map((item) => item.tagName === "A" && item.getAttribute("href") !== "")
  );
  expect(links).toEqual([true, true, true]);
  await page.getByRole("menuitem", { name: "Hiring board" }).click();
  await expect(host).toHaveAttribute("data-open", "hiring");
  await expect(page.getByRole("menu")).toBeHidden();
  const menu = page.getByRole("menu");
  await trigger.click();
  await expect(menu).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(host).toHaveAttribute("data-open", "spend");
  await expect(menu).toBeHidden();
  await trigger.focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByRole("menuitem", { name: "All apps" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#all-apps$/u);
});

test("it stands 10px off its trigger, below and above", async ({ page }) => {
  await openExample(page, "dropdown-menu", "placement");
  const standsOff = async (name: string, side: "bottom" | "top") => {
    const trigger = page.getByRole("button", { name, exact: true });
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const at = await trigger.boundingBox();
    const placed = await menu.boundingBox();
    if (at === null || placed === null) {
      throw new Error("the trigger or the menu is not drawn");
    }
    const gap =
      side === "bottom"
        ? placed.y - (at.y + at.height)
        : at.y - (placed.y + placed.height);
    expect(Math.abs(gap - 10)).toBeLessThan(1);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  };
  await standsOff("Below", "bottom");
  await standsOff("Above", "top");
});

test("right to left, start and end follow the reading direction", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "placement");
  await page.evaluate(() => {
    document.documentElement.setAttribute("dir", "rtl");
  });
  const linesUp = async (name: string, edge: "left" | "right") => {
    const trigger = page.getByRole("button", { name, exact: true });
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const off = await page.evaluate(
      ([words, side]) => {
        const panel = document
          .querySelector('[role="menu"][data-open]')
          ?.getBoundingClientRect();
        const button = [...document.querySelectorAll("button")]
          .find((each) => each.textContent?.trim() === words)
          ?.getBoundingClientRect();
        return panel === undefined || button === undefined
          ? Number.POSITIVE_INFINITY
          : panel[side] - button[side];
      },
      [name, edge] as const
    );
    expect(Math.abs(off)).toBeLessThan(1);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  };
  await linesUp("Start", "right");
  await linesUp("End", "left");
});

test.describe("on a phone", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 800 },
  });

  test("it stays inside the window less the gutter, its items are 44px tall, and the page does not scroll sideways", async ({
    page,
  }) => {
    await openExample(page, "dropdown-menu", "placement");
    const staysInside = async (name: string) => {
      await page.getByRole("button", { name, exact: true }).tap();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      const box = await menu.boundingBox();
      if (box === null) {
        throw new Error("the menu is not drawn");
      }
      expect(box.x).toBeGreaterThanOrEqual(15.5);
      expect(box.x + box.width).toBeLessThanOrEqual(390 - 15.5);
      const heights = await page
        .getByRole("menuitem")
        .evaluateAll((all) =>
          all.map((item) => item.getBoundingClientRect().height)
        );
      expect(heights.every((height) => height >= 44)).toBe(true);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(390);
      await page.mouse.click(5, 790);
      await expect(menu).toBeHidden();
    };
    await staysInside("Below");
    await staysInside("Start");
    await staysInside("End");
  });
});

test("a submenu opens with Right on its item, keeps the arrows to itself, and Left closes it", async ({
  page,
}) => {
  await openExample(page, "dropdown-menu", "submenu");
  await page.getByRole("button", { name: "Roadmap" }).focus();
  await page.keyboard.press("Enter");
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
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Roadmap" })).toBeFocused();
});

test("two items with the same words are each their own", async ({ page }) => {
  await openExample(page, "dropdown-menu", "same-words");
  await page.getByRole("button", { name: "Panels" }).click();
  const sidebar = page
    .getByRole("group", { name: "Sidebar" })
    .getByRole("menuitemcheckbox", { name: "Pinned" });
  const inspector = page
    .getByRole("group", { name: "Inspector" })
    .getByRole("menuitemcheckbox", { name: "Pinned" });
  await expect(sidebar).toBeChecked();
  await expect(inspector).not.toBeChecked();
  await inspector.click();
  await expect(inspector).toBeChecked();
  await expect(sidebar).toBeChecked();
  await sidebar.click();
  await expect(sidebar).not.toBeChecked();
  await expect(inspector).toBeChecked();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Report actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Open" })).toHaveCount(2);
});
