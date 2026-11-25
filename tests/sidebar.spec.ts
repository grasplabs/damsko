import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import {
  fixedTime,
  hasFocusRing,
  listenToLiveRegions,
  openExample,
  openExampleAsleep,
} from "./example.ts";

const TOGGLE = "Show or hide the sidebar";

const sidebarOf = (page: Page) =>
  page.getByRole("complementary", { name: "Sidebar" });
const triggerOf = (page: Page) =>
  page.getByRole("main").getByRole("button", { name: TOGGLE });

// The keys as the sidebar names them on its buttons ("Meta+B" on a Mac, "Control+B" elsewhere): the
// browser's platform decides, which need not be the machine's.
const pressKeys = async (page: Page): Promise<void> => {
  const keys = await page
    .getByRole("button", { name: TOGGLE })
    .first()
    .getAttribute("aria-keyshortcuts");
  expect(keys).toMatch(/\+B$/u);
  await page.keyboard.press(keys?.replace(/B$/u, "b") ?? "");
};

const focusedName = async (page: Page): Promise<string> =>
  await page.evaluate(() => {
    const active = document.activeElement;
    return active === null || active === document.body
      ? "the page"
      : (active.getAttribute("aria-label") ?? active.textContent ?? "").trim();
  });

test("a landmark named Sidebar holds the Main navigation, the current page said so", async ({
  page,
}) => {
  await openExample(page, "sidebar", "collapsible");
  const sidebar = sidebarOf(page);
  await expect(sidebar).toBeVisible();
  const nav = sidebar.getByRole("navigation", { name: "Main" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(nav.getByRole("link", { name: "Projects" })).not.toHaveAttribute(
    "aria-current",
    /.+/u
  );
});

test("Cmd+B or Ctrl+B folds it away from anywhere on the page, and opens it again", async ({
  page,
}) => {
  await openExample(page, "sidebar", "collapsible");
  const row = sidebarOf(page).getByRole("link", { name: "Dashboard" });
  await expect(row).toBeVisible();
  await pressKeys(page);
  await expect(row).toBeHidden();
  await pressKeys(page);
  await expect(row).toBeVisible();
});

test("its trigger folds it off the canvas, says so, and nothing folded is a tab stop", async ({
  page,
}) => {
  await openExample(page, "sidebar", "collapsible");
  const trigger = triggerOf(page);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toHaveAttribute("aria-keyshortcuts", /\+B$/u);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeHidden();
  // From the trigger, Shift+Tab goes back past where the sidebar stood.
  await trigger.focus();
  await page.keyboard.press("Shift+Tab");
  expect(await focusedName(page)).not.toBe("Dashboard");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
});

test("folded off the canvas by the keys while focus is inside, focus goes to the trigger", async ({
  page,
}) => {
  await openExample(page, "sidebar", "collapsible");
  await page.getByRole("link", { name: "Inbox" }).focus();
  await pressKeys(page);
  await expect(triggerOf(page)).toBeFocused();
});

test("folded to its icons by the keys while focus is on a nested row the rail hides, focus goes to the trigger", async ({
  page,
}) => {
  await openExample(page, "sidebar", "icon");
  await sidebarOf(page).getByRole("link", { name: "Plan" }).focus();
  await pressKeys(page);
  await expect(
    sidebarOf(page).getByRole("link", { name: "Plan" })
  ).toBeHidden();
  await expect(triggerOf(page)).toBeFocused();
});

test("opened from the page's trigger, which shows only while the sidebar is away, focus goes to the sidebar's own trigger as it slides in", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "sidebar", "basic");
  const own = sidebarOf(page).getByRole("button", { name: TOGGLE });
  await own.focus();
  await page.keyboard.press("Enter");
  // Folded off the canvas with focus inside: the page's trigger, which now shows, takes it.
  const bar = triggerOf(page);
  await expect(bar).toBeFocused();
  // Once it has slid away whole, opened again.
  await expect(own).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(bar).toBeHidden();
  await expect(own).toBeFocused();
});

test("a row and a nested row keep their own slots under their tooltips, for a product's styles", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
  const sidebar = sidebarOf(page);
  await expect(sidebar.getByRole("link", { name: "Brain" })).toHaveAttribute(
    "data-slot",
    "sidebar-menu-button"
  );
  await expect(sidebar.getByRole("link", { name: "Claims" })).toHaveAttribute(
    "data-slot",
    "sidebar-menu-sub-button"
  );
});

test("on a phone the keys open the sheet and close it again, and focus goes back to the trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "sidebar", "basic");
  const trigger = triggerOf(page);
  const keys = (await trigger.getAttribute("aria-keyshortcuts")) ?? "";
  expect(keys).toMatch(/\+B$/u);
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  await trigger.focus();
  await page.keyboard.press(keys.replace(/B$/u, "b"));
  await expect(sheet).toBeVisible();
  await page.keyboard.press(keys.replace(/B$/u, "b"));
  await expect(sheet).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

test("on a phone the page can keep the sheet's state, the one copy: the trigger, the keys and a place chosen all change it there", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "sidebar", "from-the-page");
  const trigger = triggerOf(page);
  const keys = (await trigger.getAttribute("aria-keyshortcuts")) ?? "";
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  await trigger.click();
  await expect(sheet).toBeVisible();
  await page.keyboard.press(keys.replace(/B$/u, "b"));
  await expect(sheet).toBeHidden();
  await page.keyboard.press(keys.replace(/B$/u, "b"));
  await expect(sheet).toBeVisible();
  // The page closes it itself as a place is chosen; the next press builds on the page's state.
  await sheet.getByRole("link", { name: "Inbox" }).click();
  await expect(sheet).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press(keys.replace(/B$/u, "b"));
  await expect(sheet).toBeVisible();
});

test("folded to its icons, every place keeps its name and shows it in a tooltip", async ({
  page,
}) => {
  await openExample(page, "sidebar", "icon");
  const sidebar = sidebarOf(page);
  const dashboard = sidebar.getByRole("link", { name: "Dashboard" });
  // Open, the words show whole: no tooltip, however long the pointer rests.
  await page.clock.install();
  await dashboard.hover();
  await page.clock.runFor(2000);
  await expect(page.getByRole("tooltip")).toBeHidden();
  await triggerOf(page).click();
  await expect(triggerOf(page)).toHaveAttribute("aria-expanded", "false");
  await expect(dashboard).toBeVisible();
  const box = await dashboard.boundingBox();
  expect(box?.width).toBeLessThan(48);
  await dashboard.hover();
  await expect(page.getByRole("tooltip")).toHaveText("Dashboard");
  // The keys show it too.
  await page.mouse.move(800, 400);
  await expect(page.getByRole("tooltip")).toBeHidden();
  await dashboard.focus();
  await page.keyboard.press("Tab");
  await expect(sidebar.getByRole("link", { name: "Messages" })).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText("Messages");
  // The rows within a place go while it is folded to its icons.
  await expect(sidebar.getByRole("link", { name: "Plan" })).toBeHidden();
});

test("Tab goes down the places, a place's own rows after it, a disabled place no stop, then the page", async ({
  page,
}) => {
  await openExample(page, "sidebar", "icon");
  await sidebarOf(page).getByRole("link", { name: "Northwind" }).focus();
  const order = ["Northwind"];
  for (let step = 0; step < 8; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other
    await page.keyboard.press("Tab");
    // oxlint-disable-next-line no-await-in-loop -- see above
    order.push(await focusedName(page));
  }
  expect(order).toEqual([
    "Northwind",
    "Inbox",
    "Dashboard",
    "Messages",
    "Spring launch",
    "Plan",
    "Budget",
    "Settings",
    TOGGLE,
  ]);
  // A place within a place is a link in a list under its row.
  const project = sidebarOf(page)
    .getByRole("listitem")
    .filter({ has: page.getByRole("link", { name: "Spring launch" }) });
  await expect(
    project.getByRole("list").getByRole("link", { name: "Budget" })
  ).toBeVisible();
});

test("on a phone it is a sheet: Tab stays inside, and Escape gives focus back to the trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "sidebar", "icon");
  await expect(sidebarOf(page)).toBeHidden();
  const trigger = page.getByRole("button", { name: TOGGLE });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  await expect(sheet).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(sheet.getByRole("navigation", { name: "Main" })).toBeVisible();
  for (let step = 0; step < 10; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other
    await page.keyboard.press("Tab");
    expect(
      // oxlint-disable-next-line no-await-in-loop -- see above
      await sheet.evaluate((node) => node.contains(document.activeElement))
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("it stands at the start in either direction, and at the end when told", async ({
  page,
}) => {
  await openExample(page, "sidebar", "collapsible");
  const at = async () => {
    const aside = await sidebarOf(page).boundingBox();
    const main = await page.getByRole("main").boundingBox();
    return (aside?.x ?? 0) < (main?.x ?? 0) ? "left" : "right";
  };
  expect(await at()).toBe("left");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  expect(await at()).toBe("right");
  await openExample(page, "sidebar", "side");
  expect(await at()).toBe("right");
  // Folded at the end in right to left, it is gone from the page's left.
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  expect(await at()).toBe("left");
  await pressKeys(page);
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeHidden();
});

test("with a storage key the person's choice stays across a reload", async ({
  page,
}) => {
  await openExample(page, "sidebar", "persisted");
  await triggerOf(page).click();
  await expect(triggerOf(page)).toHaveAttribute("aria-expanded", "false");
  await page.reload();
  await expect(triggerOf(page)).toHaveAttribute("aria-expanded", "false");
  await triggerOf(page).click();
  await page.reload();
  await expect(triggerOf(page)).toHaveAttribute("aria-expanded", "true");
});

test("a group folds from its label, and the header's field filters the rows", async ({
  page,
}) => {
  await openExample(page, "sidebar", "groups");
  const label = page.getByRole("button", { name: "Projects", exact: true });
  await expect(label).toHaveAttribute("aria-expanded", "true");
  await label.click();
  await expect(label).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("link", { name: "Hiring" })).toBeHidden();
  await label.click();
  await page.getByRole("searchbox", { name: "Filter" }).fill("fin");
  await expect(page.getByRole("link", { name: "Finance" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Hiring" })).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Add to Teams" })
  ).toBeVisible();
});

test("with a storage key a group's fold stays when the page is loaded again, apart from the sidebar's own", async ({
  page,
}) => {
  await openExample(page, "sidebar", "groups");
  const projects = page.getByRole("button", { name: "Projects", exact: true });
  const teams = page.getByRole("button", { name: "Teams", exact: true });
  await projects.click();
  await expect(projects).toHaveAttribute("aria-expanded", "false");
  await openExample(page, "sidebar", "groups");
  await expect(projects).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("link", { name: "Hiring" })).toBeHidden();
  await expect(teams).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Finance" })).toBeVisible();
  await expect(triggerOf(page)).toHaveAttribute("aria-expanded", "true");
  await projects.click();
  await openExample(page, "sidebar", "groups");
  await expect(projects).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Hiring" })).toBeVisible();
});

test("the head script draws a kept fold before the page wakes, and waking moves nothing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("examples-sidebar-groups:projects", "false");
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const wake = await openExampleAsleep(page, "sidebar", "groups");
  const hiring = page.getByRole("link", { name: "Hiring" });
  const finance = page.getByRole("link", { name: "Finance" });
  await expect(finance).toBeVisible();
  await expect(hiring).toBeHidden();
  const asleep = await finance.boundingBox();
  // Every frame from here on: the kept group never shows, and the group under it never moves.
  await page.evaluate(() => {
    const tops = new Set<number>();
    const look = () => {
      const links = [...document.querySelectorAll("a")];
      const row = (name: string) =>
        links.find((link) => link.textContent.trim() === name);
      if (row("Hiring")?.checkVisibility() === true) {
        document.body.dataset.keptShown = "";
      }
      tops.add(Math.round(row("Finance")?.getBoundingClientRect().top ?? -1));
      document.body.dataset.tops = String(tops.size);
      requestAnimationFrame(look);
    };
    look();
  });
  await wake();
  const projects = page.getByRole("button", { name: "Projects", exact: true });
  await expect(projects).toHaveAttribute("aria-expanded", "false");
  expect(await finance.boundingBox()).toEqual(asleep);
  await expect(page.locator("body")).not.toHaveAttribute("data-kept-shown");
  await expect(page.locator("body")).toHaveAttribute("data-tops", "1");
  // Awake, it opens from its label as any other.
  await projects.click();
  await expect(hiring).toBeVisible();
});

test("focus on a kept-folded group's label before the page wakes stays on it as it wakes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("examples-sidebar-groups:projects", "false");
  });
  const wake = await openExampleAsleep(page, "sidebar", "groups");
  const projects = page.getByRole("button", { name: "Projects", exact: true });
  // Drawn as kept before waking: the label says the group is folded.
  await expect(projects).toHaveAttribute("aria-expanded", "false");
  await projects.focus();
  await expect(projects).toBeFocused();
  await wake();
  await expect(projects).toBeFocused();
});

test("levels: a group's fold in a level is kept by its name too", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  const sidebar = sidebarOf(page);
  await sidebar.getByRole("link", { name: "Settings" }).click();
  const account = sidebar.getByRole("button", { name: "Your account" });
  await account.click();
  await expect(account).toHaveAttribute("aria-expanded", "false");
  // Opened again, and live again before the press: the same visit, loaded anew.
  await openExample(page, "sidebar", "levels");
  await sidebar.getByRole("link", { name: "Settings" }).click();
  await expect(account).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar.getByRole("link", { name: "Profile" })).toBeHidden();
});

test("a row's action shows on the row and opens its menu, and focus reaches it after the row", async ({
  page,
}) => {
  await openExample(page, "sidebar", "actions");
  const more = page.getByRole("button", {
    name: "More for Supplier invoices",
  });
  const row = page.getByRole("link", { name: "Supplier invoices" });
  await row.focus();
  await page.keyboard.press("Tab");
  await expect(more).toBeFocused();
  await expect(more).toHaveCSS("opacity", "1");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitem", { name: "Rename" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(more).toBeFocused();
});

test("before the rows arrive its bars are hidden from a screen reader", async ({
  page,
}) => {
  await openExample(page, "sidebar", "states");
  const menu = page.getByRole("list", { name: "Projects, loading" });
  await expect(menu).toHaveAttribute("aria-busy", "true");
  await expect(menu.getByRole("listitem")).toHaveCount(5);
  await expect(menu.getByRole("link")).toHaveCount(0);
});

test("the head script draws what was kept before the page wakes, and only a kept true or false", async ({
  page,
}) => {
  // The page as the parser draws it, before React wakes: its own scripts are held back.
  await page.route("**/*.{js,mjs}", async (route) => {
    await route.abort();
  });
  const widthWith = async (kept: string | null) => {
    await page.addInitScript((value) => {
      if (value === null) {
        localStorage.removeItem("examples-sidebar");
      } else {
        localStorage.setItem("examples-sidebar", value);
      }
    }, kept);
    await page.goto(
      new URL("/examples/sidebar/persisted", process.env.BASE_URL).href
    );
    const box = await sidebarOf(page).boundingBox();
    return box?.width ?? 0;
  };
  const open = await widthWith(null);
  expect(await widthWith("folded")).toBe(open);
  expect(await widthWith("false")).toBeLessThan(open / 2);
  expect(await widthWith("true")).toBe(open);
});

test("with its shortcut off it still draws, folds by its trigger, and names no keys", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openExample(page, "sidebar", "no-shortcut");
  const trigger = triggerOf(page);
  await expect(trigger).not.toHaveAttribute("aria-keyshortcuts", /./u);
  await page.keyboard.press("ControlOrMeta+b");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(errors).toStrictEqual([]);
});

test("the page can keep whether it is open, the one copy: its own control folds it with an updater, two in one moment build on each other, and the keys and the trigger change it there", async ({
  page,
}) => {
  await openExample(page, "sidebar", "from-the-page");
  const focus = page.getByRole("button", { name: "Focus mode" });
  const trigger = triggerOf(page);
  await pressKeys(page);
  await expect(focus).toHaveAttribute("aria-pressed", "true");
  await trigger.click();
  await expect(focus).toHaveAttribute("aria-pressed", "false");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await focus.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(focus).toHaveAttribute("aria-pressed", "true");
  // Two presses before React draws again: the second builds on the first, so it opens again.
  await focus.evaluate((button: HTMLElement) => {
    button.click();
    button.click();
  });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await focus.evaluate((button: HTMLElement) => {
    button.click();
  });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});

// ---- The look: the original design's, part by part (examples/sidebar/basic.tsx) ------------------

// The tokens' values as the browser reports them. In light the ground is rgb(241, 241, 241) and the
// rows' grey rgb(105, 105, 105); in dark rgb(18, 18, 18) and rgb(164, 164, 164).
const LOOK = {
  light: {
    ground: "oklch(0.957 0 0)",
    current: "oklch(0 0 0 / 0.05)",
    hover: "oklch(0 0 0 / 0.035)",
    rule: "oklch(0 0 0 / 0.08)",
    text: "oklch(0.269 0 0)",
    secondary: "oklch(0.52 0 0)",
    tertiary: "oklch(0.64 0 0)",
    count: "oklch(1 0 0)",
  },
  dark: {
    ground: "oklch(0.18 0 0)",
    current: "oklch(1 0 0 / 0.07)",
    hover: "oklch(1 0 0 / 0.05)",
    rule: "oklch(1 0 0 / 0.1)",
    text: "oklch(0.96 0 0)",
    secondary: "oklch(0.72 0 0)",
    tertiary: "oklch(0.6 0 0)",
    count: "oklch(0.215 0 0)",
  },
} as const;

/** The ground an element stands on: the first fill behind it. */
const groundOf = async (element: Locator): Promise<string> =>
  await element.evaluate((node) => {
    let at: Element | null = node;
    while (
      at !== null &&
      getComputedStyle(at).backgroundColor === "rgba(0, 0, 0, 0)"
    ) {
      at = at.parentElement;
    }
    return at === null ? "none" : getComputedStyle(at).backgroundColor;
  });

/** An element's box, which the test needs to exist. */
const boxOf = async (element: Locator) => {
  const box = await element.boundingBox();
  if (box === null) {
    throw new Error("The element has no box.");
  }
  return box;
};

/** Where an element's own words are drawn. */
const wordsOf = async (element: Locator) =>
  await element.evaluate((node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let text = walker.nextNode();
    while (text !== null && (text.textContent ?? "").trim() === "") {
      text = walker.nextNode();
    }
    if (text === null) {
      throw new Error("The element has no words.");
    }
    range.selectNodeContents(text);
    const { left, right, top, bottom } = range.getBoundingClientRect();
    return { bottom, left, right, top };
  });

/**
 * Whether a press lands on the row all along its end edge and at both ends' corners, just inside
 * their curve: a container that cut the row's fill, corners or ring would take the press instead.
 */
const wholeAtItsEnds = async (row: Locator): Promise<boolean> =>
  await row.evaluate((node) => {
    const { left, right, top, bottom } = node.getBoundingClientRect();
    const corner = Number(
      getComputedStyle(node).borderTopLeftRadius.replace("px", "")
    );
    const points = [left + 0.5, right - 0.5].flatMap((x) => [
      [x, top + corner + 0.5],
      [x, (top + bottom) / 2],
      [x, bottom - corner - 0.5],
    ]);
    const inward = [left + corner + 0.5, right - corner - 0.5].flatMap((x) => [
      [x, top + 0.5],
      [x, bottom - 0.5],
    ]);
    return [...points, ...inward].every(([x = 0, y = 0]) => {
      const hit = document.elementFromPoint(x, y);
      return hit !== null && node.contains(hit);
    });
  });

for (const theme of ["light", "dark"] as const) {
  const look = LOOK[theme];

  test(`${theme}: its ground is the neutral grey with no line at its end, and the current row a flat fill`, async ({
    page,
  }) => {
    await openExample(page, "sidebar", "basic", { theme });
    const sidebar = sidebarOf(page);
    const nav = sidebar.getByRole("navigation", { name: "Main" });
    expect(await groundOf(nav)).toBe(look.ground);
    // No edge: the ground runs the sidebar's whole width.
    const whole = await boxOf(sidebar);
    const inside = await boxOf(nav);
    expect(inside.width).toBe(whole.width);
    const current = sidebar.getByRole("link", { name: "Chat" });
    await expect(current).toHaveCSS("background-color", look.current);
    await expect(current).toHaveCSS("box-shadow", "none");
    await expect(current).toHaveCSS("color", look.text);
  });

  test(`${theme}: rows, their icons, counts and the group's label are in the sidebar's greys`, async ({
    page,
  }) => {
    await openExample(page, "sidebar", "basic", { theme });
    const sidebar = sidebarOf(page);
    const row = sidebar.getByRole("link", { name: "Brain" });
    await expect(row).toHaveCSS("color", look.secondary);
    await expect(row).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(sidebar.getByText("From your Apps")).toHaveCSS(
      "color",
      look.secondary
    );
    const count = sidebar.getByText("3", { exact: true });
    await expect(count).toHaveCSS("background-color", look.count);
    await expect(count).toHaveCSS("border-top-color", look.rule);
    await expect(count).toHaveCSS("color", look.secondary);
    // Under the pointer a row takes the hover fill and the ink read first; pressed, it stays so.
    await row.hover();
    await expect(row).toHaveCSS("background-color", look.hover);
    await expect(row).toHaveCSS("color", look.text);
    await page.mouse.down();
    await expect(row).toHaveCSS("background-color", look.hover);
    await expect(row).toHaveCSS("scale", "none");
    await page.mouse.up();
    // The current row keeps its fill under the pointer.
    const current = sidebar.getByRole("link", { name: "Chat" });
    await current.hover();
    await expect(current).toHaveCSS("background-color", look.current);
  });

  test(`${theme}: the head's buttons are round and grey, and the foot a person's row under a hairline`, async ({
    page,
  }) => {
    await openExample(page, "sidebar", "basic", { theme });
    const sidebar = sidebarOf(page);
    for (const name of ["Search", TOGGLE]) {
      const button = sidebar.getByRole("button", { name });
      // oxlint-disable-next-line no-await-in-loop -- one button after the other
      const box = await boxOf(button);
      expect([box.width, box.height]).toEqual([28, 28]);
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(button).toHaveCSS("color", look.secondary);
      // oxlint-disable-next-line no-await-in-loop -- see above
      await button.hover();
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(button).toHaveCSS("background-color", look.hover);
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(button).toHaveCSS("color", look.text);
    }
    const person = sidebar.getByRole("button", { name: /Anna de Vries/u });
    const row = await boxOf(person);
    expect(row.height).toBe(46);
    await expect(person).toHaveCSS("color", look.text);
    await expect(person.getByText("Northwind Finance")).toHaveCSS(
      "color",
      look.secondary
    );
    // The hairline: over the foot's 8px of room, as far in as the rows, in the sidebar's rule.
    const rule = await page.evaluate(
      ([x, y]) => {
        const hit = document.elementFromPoint(x ?? 0, y ?? 0);
        if (hit === null) {
          return null;
        }
        const { width, height } = hit.getBoundingClientRect();
        return {
          colour: getComputedStyle(hit).backgroundColor,
          height,
          width,
        };
      },
      [row.x + row.width / 2, row.y - 9]
    );
    expect(rule).toEqual({ colour: look.rule, height: 1, width: row.width });
  });
}

test("rows are 32px, 8px in and 2px apart, their icons 16px; groups stand 8px apart", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
  const sidebar = sidebarOf(page);
  const whole = await boxOf(sidebar);
  const chat = await boxOf(sidebar.getByRole("link", { name: "Chat" }));
  const dashboard = await boxOf(
    sidebar.getByRole("link", { name: "Dashboard" })
  );
  expect(chat.height).toBe(32);
  expect(chat.x - whole.x).toBe(8);
  expect(whole.x + whole.width - (chat.x + chat.width)).toBe(8);
  expect(dashboard.y - (chat.y + chat.height)).toBe(2);
  // The first row stands 56px down: the head's room, its 28px buttons and the list's own room.
  expect(chat.y - whole.y).toBe(56);
  const icon = await sidebar
    .getByRole("link", { name: "Chat" })
    .evaluate((node) => {
      const box = node.querySelector("svg")?.getBoundingClientRect();
      return [box?.width, box?.height];
    });
  expect(icon).toEqual([16, 16]);
  const last = await boxOf(sidebar.getByRole("link", { name: "Integrations" }));
  const label = await wordsOf(sidebar.getByText("From your Apps"));
  const first = await boxOf(sidebar.getByRole("link", { name: "Expenses" }));
  // The label's own row starts 8px under the group above, its words low in it, 2px over its rows.
  expect(first.y - (last.y + last.height)).toBe(8 + 32 + 2);
  expect(first.y - label.bottom).toBeLessThanOrEqual(8);
  // A count: 22px high, 8px in from the row's end, in the middle of its row.
  const count = await boxOf(sidebar.getByText("3", { exact: true }));
  expect(count.height).toBe(22);
  expect(dashboard.x + dashboard.width - (count.x + count.width)).toBe(8);
  expect(count.y - dashboard.y).toBe(5);
});

test("a nested row is a row's height and weight, its words in line with its parent's, with no guide line", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
  const sidebar = sidebarOf(page);
  const parent = sidebar.getByRole("link", { name: "Expenses" });
  const nested = sidebar.getByRole("link", { name: "Claims" });
  const box = await boxOf(nested);
  const above = await boxOf(parent);
  expect(box.height).toBe(32);
  expect(box.x).toBe(above.x);
  expect(box.width).toBe(above.width);
  expect(box.y - (above.y + above.height)).toBe(2);
  await expect(nested).toHaveCSS("font-weight", "500");
  const nestedWords = await wordsOf(nested);
  const parentWords = await wordsOf(parent);
  expect(nestedWords.left).toBe(parentWords.left);
  const list = sidebar
    .getByRole("list")
    .filter({ has: page.getByRole("link", { name: "Claims" }) })
    .filter({ hasNot: page.getByRole("link", { name: "Expenses" }) });
  await expect(list).toHaveCSS("border-left-width", "0px");
  await expect(list).toHaveCSS("border-right-width", "0px");
});

test("it folds away whole by default, and the trigger in the page brings it back", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
  const sidebar = sidebarOf(page);
  await sidebar.getByRole("button", { name: TOGGLE }).click();
  await expect(page.getByRole("link", { name: "Chat" })).toBeHidden();
  // Nothing of it stays: no rail of icons, and the page starts where it stood.
  const back = triggerOf(page);
  await expect(back).toBeFocused();
  const main = await boxOf(page.getByRole("main"));
  const whole = await boxOf(page.getByRole("main").locator(".."));
  expect(main.x).toBe(whole.x);
  await back.click();
  await expect(sidebar.getByRole("link", { name: "Chat" })).toBeVisible();
});

test("the keyboard's ring shows on a row, a nested row and the head's buttons, whole", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
  const sidebar = sidebarOf(page);
  await sidebar.getByRole("button", { name: "Search" }).focus();
  await page.keyboard.press("Tab");
  const trigger = sidebar.getByRole("button", { name: TOGGLE });
  await expect(trigger).toBeFocused();
  expect(await hasFocusRing(trigger)).toBe(true);
  await page.keyboard.press("Tab");
  const row = sidebar.getByRole("link", { name: "Chat" });
  await expect(row).toBeFocused();
  expect(await hasFocusRing(row)).toBe(true);
  expect(await wholeAtItsEnds(row)).toBe(true);
  const nested = sidebar.getByRole("link", { name: "Approvals" });
  await nested.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  expect(await hasFocusRing(nested)).toBe(true);
  expect(await wholeAtItsEnds(nested)).toBe(true);
});

test("a disabled place is drawn at half strength and takes no press", async ({
  page,
}) => {
  await openExample(page, "sidebar", "icon");
  const archive = sidebarOf(page).getByRole("button", { name: "Archive" });
  await expect(archive).toBeDisabled();
  await expect(archive).toHaveCSS("opacity", "0.5");
  await expect(archive).toHaveCSS("pointer-events", "none");
});

test("on a phone the sheet is the sidebar's ground from edge to edge, its rows the sheet's width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "sidebar", "basic");
  await page.getByRole("button", { name: TOGGLE }).click();
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  const nav = sheet.getByRole("navigation", { name: "Main" });
  await expect(nav).toBeVisible();
  expect(await groundOf(nav)).toBe(LOOK.light.ground);
  const whole = await boxOf(sheet);
  const row = await boxOf(sheet.getByRole("link", { name: "Chat" }));
  expect(row.x - whole.x).toBe(8);
  expect(whole.x + whole.width - (row.x + row.width)).toBe(8);
  expect(row.height).toBe(32);
  await expect(sheet.getByRole("link", { name: "Chat" })).toHaveCSS(
    "background-color",
    LOOK.light.current
  );
});

test("right to left, a row's icon, its words, its count and its nested rows mirror", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const sidebar = sidebarOf(page);
  const row = sidebar.getByRole("link", { name: "Dashboard" });
  // The icon 8px in from the row's right end, the words 10px to its left; once the row has settled.
  await expect(async () => {
    const box = await boxOf(row);
    const words = await wordsOf(row);
    const icon = await row.evaluate(
      (node) => node.querySelector("svg")?.getBoundingClientRect().right ?? 0
    );
    expect(box.x + box.width - icon).toBe(8);
    expect(icon - 16 - words.right).toBe(10);
    const count = await boxOf(sidebar.getByText("3", { exact: true }));
    expect(count.x - box.x).toBe(8);
  }).toPass();
  const parent = await wordsOf(sidebar.getByRole("link", { name: "Expenses" }));
  const nested = await wordsOf(sidebar.getByRole("link", { name: "Claims" }));
  expect(nested.right).toBe(parent.right);
});

// ---- Long names ----------------------------------------------------------------------------------

test("a name longer than its row ends in an ellipsis inside the row, and its tooltip shows it whole", async ({
  page,
}) => {
  await openExample(page, "sidebar", "long-names");
  const sidebar = sidebarOf(page);
  const name = "Every supplier contract and the day each one is up for renewal";
  const row = sidebar.getByRole("link", { name });
  const words = row.getByText(name);
  await expect(words).toHaveCSS("text-overflow", "ellipsis");
  const box = await boxOf(row);
  const cut = await boxOf(words);
  expect(cut.x + cut.width).toBeLessThanOrEqual(box.x + box.width - 8);
  expect(
    await words.evaluate((node) => node.scrollWidth > node.clientWidth)
  ).toBe(true);
  await row.hover();
  await expect(page.getByRole("tooltip")).toHaveText(name);
  // The tooltip repeats the row's own name: it is no description of it.
  await expect(row).not.toHaveAttribute("aria-describedby", /.+/u);
  // The keyboard reaches it too.
  await page.mouse.move(900, 300);
  await expect(page.getByRole("tooltip")).toBeHidden();
  await sidebar.getByRole("link", { name: "Hiring" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("tooltip")).toHaveText(
    "What happens in the first week, day by day"
  );
});

test("a name that fits shows no tooltip", async ({ page }) => {
  await openExample(page, "sidebar", "long-names");
  await page.clock.install();
  await sidebarOf(page).getByRole("link", { name: "Hiring" }).hover();
  await page.clock.runFor(2000);
  await expect(page.getByRole("tooltip")).toBeHidden();
});

test("a cut name stops before the row's count and before a mark the row holds, which keep their size", async ({
  page,
}) => {
  await openExample(page, "sidebar", "long-names");
  const sidebar = sidebarOf(page);
  const counted = sidebar.getByRole("link", { name: /Supplier invoices/u });
  const count = await boxOf(sidebar.getByText("12", { exact: true }));
  const words = await boxOf(
    counted.getByText("Supplier invoices waiting on a second approval")
  );
  expect(words.x + words.width).toBeLessThanOrEqual(count.x);
  expect(count.width).toBeGreaterThanOrEqual(20);
  const marked = sidebar.getByRole("link", { name: /The handbook/u });
  const mark = marked.getByText("Draft");
  const name = marked.getByText(
    "The handbook for everyone who joins this quarter"
  );
  await expect(name).toHaveCSS("text-overflow", "ellipsis");
  // The mark is whole: as wide as its words need, inside the row.
  expect(
    await mark.evaluate((node) => node.scrollWidth <= node.clientWidth)
  ).toBe(true);
  const row = await boxOf(marked);
  const badge = await boxOf(mark);
  const cut = await boxOf(name);
  expect(cut.x + cut.width).toBeLessThanOrEqual(badge.x);
  expect(badge.x + badge.width).toBeLessThanOrEqual(row.x + row.width - 8);
});

test("no row's fill or corners are cut at either end, in a group that folds too", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
  for (const name of ["Chat", "Claims"]) {
    const row = sidebarOf(page).getByRole("link", { name });
    // oxlint-disable-next-line no-await-in-loop -- one row after the other
    expect(await wholeAtItsEnds(row)).toBe(true);
  }
  await openExample(page, "sidebar", "groups");
  expect(
    await wholeAtItsEnds(page.getByRole("link", { name: "Spring launch" }))
  ).toBe(true);
});

// ---- The docs site's own sidebar -----------------------------------------------------------------

test("the docs site's sidebar: the theme's ground, runs as labels, and the current page a flat row cut nowhere", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(
    new URL("/components/breadcrumb?mode=light", process.env.BASE_URL).href
  );
  const sidebar = sidebarOf(page);
  const nav = sidebar.getByRole("navigation", { name: "Pages" });
  // Evergreen's paper, a step darker: rgb(238, 243, 240).
  expect(await groundOf(nav)).toBe("oklch(0.962 0.006 165.08)");
  const current = nav.getByRole("link", { name: "Breadcrumb", exact: true });
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(current).toHaveCSS("background-color", LOOK.light.current);
  await expect(current).toHaveCSS("box-shadow", "none");
  await expect(current).toHaveCSS("font-weight", "500");
  const row = await boxOf(current);
  const whole = await boxOf(sidebar);
  expect(row.height).toBe(32);
  // A run's pages stand 12px in from its label; they end where every row ends, 8px in.
  expect(row.x - whole.x).toBe(20);
  expect(whole.x + whole.width - (row.x + row.width)).toBe(8);
  expect(await wholeAtItsEnds(current)).toBe(true);
  await current.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  expect(await hasFocusRing(current)).toBe(true);
  expect(await wholeAtItsEnds(current)).toBe(true);
  // A run's label: the group label's small grey words, its count and chevron at its end.
  const run = nav.getByRole("button", { name: /^Navigation/u });
  await expect(run).toHaveAttribute("aria-expanded", "true");
  await expect(run).toHaveCSS("color", LOOK.light.secondary);
  await expect(run).toHaveCSS("font-size", "13px");
  const label = await boxOf(run);
  expect(label.height).toBe(32);
  expect(label.x - whole.x).toBe(8);
  // The page's card: the paper, 6px from the sidebar and from the window's edges.
  const main = await boxOf(page.getByRole("main"));
  expect(main.x - (whole.x + whole.width)).toBe(6);
  expect(main.y).toBe(6);
  await expect(page.getByRole("main")).toHaveCSS(
    "background-color",
    "oklch(0.992 0.002 165.08)"
  );
});

// ---- Levels --------------------------------------------------------------------------------------

/**
 * How what holds a navigation is moving in, if it is: the first keyframe of the move, its time in
 * ms and its curve. Null once it stands still.
 */
const moveOf = async (nav: Locator) =>
  await nav.evaluate((node) => {
    for (const move of document.getAnimations()) {
      const { effect } = move;
      if (
        effect instanceof KeyframeEffect &&
        effect.target !== null &&
        effect.target !== node &&
        effect.target.contains(node)
      ) {
        const [from] = effect.getKeyframes();
        return {
          duration: effect.getComputedTiming().duration,
          easing: getComputedStyle(effect.target).animationTimingFunction,
          opacity: from?.opacity,
          transform: from?.transform,
        };
      }
    }
    return null;
  });

test("levels: a row shows another level in the main one's place, and the header and the footer stay", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  const sidebar = sidebarOf(page);
  const main = sidebar.getByRole("navigation", { name: "Main" });
  const settings = sidebar.getByRole("navigation", { name: "Settings" });
  await expect(main).toBeVisible();
  await expect(settings).toBeHidden();
  const where = await main.boundingBox();
  await main.getByRole("link", { name: "Settings" }).click();
  await expect(settings).toBeVisible();
  await expect(main).toBeHidden();
  await expect(
    sidebar.getByRole("heading", { name: "Settings" })
  ).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Back" })).toBeVisible();
  await expect(settings.getByRole("link", { name: "General" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(sidebar.getByRole("button", { name: TOGGLE })).toBeVisible();
  await expect(
    sidebar.getByRole("button", { name: /Anna de Vries/u })
  ).toBeVisible();
  // Folded and opened again, it is still the level it was.
  await pressKeys(page);
  await expect(settings).toBeHidden();
  await pressKeys(page);
  await expect(settings).toBeVisible();
  await sidebar.getByRole("link", { name: "Back" }).click();
  await expect(main).toBeVisible();
  await expect(settings).toBeHidden();
  // Nothing round the levels moved: the main list stands where it stood.
  expect(await main.boundingBox()).toEqual(where);
});

test("levels: by the keys, focus lands on the new level's current row, and Back gives it to the row that opened it", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "sidebar", "levels");
  const sidebar = sidebarOf(page);
  const opener = sidebar.getByRole("link", { name: "Settings" });
  await sidebar.getByRole("link", { name: "Projects" }).focus();
  await page.keyboard.press("Tab");
  await expect(opener).toBeFocused();
  await page.keyboard.press("Enter");
  const current = sidebar.getByRole("link", { name: "General" });
  await expect(current).toBeFocused();
  expect(await hasFocusRing(current)).toBe(true);
  // Each level's name is said once as it is shown, never on the first paint.
  await expect.poll(said).toEqual(["Settings"]);
  // Up from the current row: the way back, the level's first stop.
  await page.keyboard.press("Shift+Tab");
  await expect(sidebar.getByRole("link", { name: "Back" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(opener).toBeFocused();
  expect(await hasFocusRing(opener)).toBe(true);
  await expect.poll(said).toEqual(["Settings", "Main"]);
});

test("levels: focus lands on the level's first row in sight when its current row is folded away", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  const sidebar = sidebarOf(page);
  const opener = sidebar.getByRole("link", { name: "Settings" });
  await opener.click();
  await sidebar.getByRole("link", { name: "Profile" }).click();
  await sidebar.getByRole("button", { name: "Your account" }).click();
  await expect(sidebar.getByRole("link", { name: "Profile" })).toBeHidden();
  await sidebar.getByRole("link", { name: "Back" }).click();
  await opener.focus();
  await page.keyboard.press("Enter");
  await expect(sidebar.getByRole("link", { name: "Back" })).toBeFocused();
});

test("levels: changed again and again in a moment, only the level it ends on is said", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "sidebar", "levels", { time: fixedTime });
  const sidebar = sidebarOf(page);
  for (let turn = 0; turn < 4; turn += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one press after the other
    await sidebar.getByRole("link", { name: "Settings" }).click();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await sidebar.getByRole("link", { name: "Back" }).click();
  }
  await sidebar.getByRole("link", { name: "Settings" }).click();
  // Long after everything that waited to be said has been.
  await page.clock.runFor(10_000);
  expect(await said()).toEqual(["Settings"]);
});

test("levels: a level that is not shown is out of reach of Tab and of a screen reader", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  const sidebar = sidebarOf(page);
  const stops = async () => {
    const names: string[] = [];
    await sidebar.getByRole("button", { name: TOGGLE }).focus();
    for (let step = 0; step < 30; step += 1) {
      // oxlint-disable-next-line no-await-in-loop -- one key after the other
      await page.keyboard.press("Tab");
      // oxlint-disable-next-line no-await-in-loop -- see above
      const inside = await sidebar.evaluate((node) =>
        node.contains(document.activeElement)
      );
      if (!inside) {
        break;
      }
      // oxlint-disable-next-line no-await-in-loop -- see above
      names.push(await focusedName(page));
    }
    return names;
  };
  expect(await stops()).toEqual([
    "Chat",
    "Projects",
    "Settings",
    "Anna de Vries",
  ]);
  await expect(sidebar.getByRole("link", { name: "General" })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: "Back" })).toHaveCount(0);
  await expect(sidebar.getByRole("heading", { name: "Settings" })).toHaveCount(
    0
  );
  await sidebar.getByRole("link", { name: "Settings" }).click();
  const inSettings = await stops();
  expect(inSettings.slice(0, 3)).toEqual([
    "Back",
    "General",
    "Members and roles",
  ]);
  expect(inSettings).not.toContain("Chat");
  expect(inSettings.at(-1)).toBe("Anna de Vries");
  await expect(sidebar.getByRole("link", { name: "Chat" })).toHaveCount(0);
});

test("levels: each level keeps its own scroll place and its folded groups", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  const sidebar = sidebarOf(page);
  await sidebar.getByRole("link", { name: "Settings" }).click();
  const settings = sidebar.getByRole("navigation", { name: "Settings" });
  await settings.hover();
  await page.mouse.wheel(0, 60);
  await expect
    .poll(async () => await settings.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(30);
  const place = await settings.evaluate((node) => node.scrollTop);
  await sidebar.getByRole("link", { name: "Back" }).click();
  await expect(settings).toBeHidden();
  await sidebar.getByRole("link", { name: "Settings" }).click();
  await expect(settings).toBeVisible();
  expect(await settings.evaluate((node) => node.scrollTop)).toBe(place);
  // The rows under a label folded in one level stay folded while another is shown.
  await settings.getByRole("button", { name: "Your account" }).click();
  await expect(settings.getByRole("link", { name: "Profile" })).toBeHidden();
  await sidebar.getByRole("link", { name: "Back" }).click();
  await sidebar.getByRole("link", { name: "Settings" }).click();
  await expect(settings.getByRole("link", { name: "Profile" })).toBeHidden();
});

test("levels: the new level moves in from the way the person went, 16px and a fade in 250ms", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const sidebar = sidebarOf(page);
  const main = sidebar.getByRole("navigation", { name: "Main" });
  const settings = sidebar.getByRole("navigation", { name: "Settings" });
  // Nothing moves on the first paint.
  expect(await moveOf(main)).toBeNull();
  await sidebar.getByRole("link", { name: "Settings" }).click();
  expect(await moveOf(settings)).toEqual({
    duration: 250,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    opacity: "0",
    transform: "translateX(16px)",
  });
  // The level left is gone at once: the two never stand over each other.
  await expect(main).toBeHidden();
  await sidebar.getByRole("link", { name: "Back" }).click();
  const back = await moveOf(main);
  expect(back?.transform).toBe("translateX(-16px)");
  // Once it has arrived nothing is left running.
  await expect.poll(async () => await moveOf(main)).toBeNull();
});

test("levels: in right-to-left text the new level moves in from the other side", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const sidebar = sidebarOf(page);
  await sidebar.getByRole("link", { name: "Settings" }).click();
  const forward = await moveOf(
    sidebar.getByRole("navigation", { name: "Settings" })
  );
  expect(forward?.transform).toBe("translateX(-16px)");
  await sidebar.getByRole("link", { name: "Back" }).click();
  const back = await moveOf(sidebar.getByRole("navigation", { name: "Main" }));
  expect(back?.transform).toBe("translateX(16px)");
});

test("levels: with reduced motion the new level is simply there", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  const sidebar = sidebarOf(page);
  const main = sidebar.getByRole("navigation", { name: "Main" });
  const settings = sidebar.getByRole("navigation", { name: "Settings" });
  const before = await main.boundingBox();
  await sidebar.getByRole("link", { name: "Settings" }).click();
  // Whatever is still said to run takes no time.
  const move = await moveOf(settings);
  expect(move?.duration ?? 0).toBe(0);
  await expect(settings).toBeVisible();
  const after = await settings.boundingBox();
  expect(after?.x).toBe(before?.x);
});

test("levels: a level shown from outside the levels leaves focus where it is", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  const sidebar = sidebarOf(page);
  const person = sidebar.getByRole("button", { name: /Anna de Vries/u });
  await person.focus();
  await page.keyboard.press("Enter");
  await expect(
    sidebar.getByRole("navigation", { name: "Settings" })
  ).toBeVisible();
  await expect(person).toBeFocused();
});

test("levels: in forced colours the level's name is not boxed as a row", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels");
  await page.emulateMedia({ forcedColors: "active" });
  const sidebar = sidebarOf(page);
  await sidebar.getByRole("link", { name: "Settings" }).click();
  await expect(sidebar.getByRole("link", { name: "Back" })).toHaveCSS(
    "border-top-width",
    "1px"
  );
  await expect(sidebar.getByRole("heading", { name: "Settings" })).toHaveCSS(
    "border-top-width",
    "0px"
  );
});

test("levels: before the page wakes, the level shown is the only one drawn and in reach", async ({
  page,
}) => {
  const wake = await openExampleAsleep(page, "sidebar", "levels");
  const sidebar = sidebarOf(page);
  await expect(sidebar.getByRole("link", { name: "Chat" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "General" })).toHaveCount(0);
  // Its rows are in the page, kept for when it is shown, and unseen.
  const kept = sidebar.getByText("Members and roles").first();
  await expect(kept).toBeAttached();
  await expect(kept).toBeHidden();
  await wake();
  await expect(sidebar.getByRole("link", { name: "Chat" })).toBeVisible();
  await expect(kept).toBeHidden();
});

test("levels: the server draws the level a page opens on, with no script", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(
    new URL("/examples/sidebar/levels-rail?mode=light", process.env.BASE_URL)
      .href
  );
  const sidebar = sidebarOf(page);
  await expect(
    sidebar.getByRole("navigation", { name: "Settings" })
  ).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Members" })).toBeVisible();
  await expect(sidebar.getByRole("navigation", { name: "Main" })).toHaveCount(
    0
  );
  await expect(sidebar.getByRole("link", { name: "Inbox" })).toHaveCount(0);
  await context.close();
});

test("levels: waking on a level that is not the first says nothing to the console and moves nothing", async ({
  page,
}) => {
  const faults: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      faults.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    faults.push(error.message);
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const wake = await openExampleAsleep(page, "sidebar", "levels-rail");
  const settings = sidebarOf(page).getByRole("navigation", {
    name: "Settings",
  });
  // Once its styles have arrived, the rail stands at its width.
  await expect(sidebarOf(page)).toHaveCSS("width", "56px");
  const asleep = await settings.boundingBox();
  await wake();
  expect(await moveOf(settings)).toBeNull();
  expect(await settings.boundingBox()).toEqual(asleep);
  expect(faults).toEqual([]);
});

test("levels: a sidebar that keeps the level itself opens on its first one and changes by its triggers, round a wrapper too", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "sidebar", "levels-rail");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const sidebar = sidebarOf(page);
  const main = sidebar.getByRole("navigation", { name: "Main" });
  const settings = sidebar.getByRole("navigation", { name: "Settings" });
  await expect(settings).toBeVisible();
  await sidebar.getByRole("button", { name: "Back" }).press("Enter");
  await expect(main).toBeVisible();
  const back = await moveOf(main);
  expect(back?.transform).toBe("translateX(-16px)");
  await expect(main.getByRole("link", { name: "Inbox" })).toBeFocused();
  await expect.poll(said).toEqual(["Main"]);
  // Into the level a wrapper of the product's stands round: it moves, takes focus and is said.
  await main.getByRole("button", { name: "Settings" }).press("Enter");
  await expect(settings).toBeVisible();
  const forward = await moveOf(settings);
  expect(forward?.transform).toBe("translateX(16px)");
  await expect(settings.getByRole("link", { name: "Members" })).toBeFocused();
  await expect.poll(said).toEqual(["Main", "Settings"]);
});

test("levels: folded to its icons, the level's name is its icon, a row's square", async ({
  page,
}) => {
  await openExample(page, "sidebar", "levels-rail");
  const sidebar = sidebarOf(page);
  const title = sidebar.getByRole("heading", { name: "Settings" });
  await expect(title).toBeVisible();
  const box = await title.boundingBox();
  const row = await sidebar.getByRole("button", { name: "Back" }).boundingBox();
  expect(box?.width).toBe(32);
  expect(box?.height).toBe(32);
  expect(box?.x).toBe(row?.x);
  // Opened, its words show beside the icon.
  await sidebar.getByRole("button", { name: TOGGLE }).click();
  await expect
    .poll(
      async () =>
        await title.evaluate((node) => node.getBoundingClientRect().width)
    )
    .toBeGreaterThan(100);
});

test("levels: on a phone the sheet shows the level, and Back and focus stay inside it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "sidebar", "levels");
  await page.getByRole("button", { name: TOGGLE }).click();
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  await expect(sheet).toBeVisible();
  const opener = sheet.getByRole("link", { name: "Settings" });
  await opener.focus();
  await page.keyboard.press("Enter");
  const settings = sheet.getByRole("navigation", { name: "Settings" });
  await expect(settings).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Chat" })).toHaveCount(0);
  await expect(settings.getByRole("link", { name: "General" })).toBeFocused();
  await sheet.getByRole("link", { name: "Back" }).press("Enter");
  await expect(sheet.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(opener).toBeFocused();
  await expect(sheet).toBeVisible();
});

test("a floating sidebar nests round its rows in the squircle; the page card beside an inset one keeps its plain corner", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openExample(page, "sidebar", "floating");
  // The sidebar's own card is the part of it that carries the edge.
  const floating = await page
    .getByRole("complementary")
    .locator("xpath=descendant-or-self::*")
    .evaluateAll((elements) => {
      const edged = elements.find(
        (element) => getComputedStyle(element).borderTopWidth !== "0px"
      );
      if (edged === undefined) {
        return null;
      }
      const look = getComputedStyle(edged);
      return [
        look.borderTopLeftRadius,
        look.getPropertyValue("corner-top-left-shape"),
      ];
    });
  // A row's 16px corner plus the 8px the sidebar keeps round its rows.
  expect(floating?.[0]).toBe("24px");
  expect(floating?.[1]).not.toBe("round");
  expect(floating?.[1]).not.toBe("superellipse(1)");

  await openExample(page, "sidebar", "inset");
  // The app's main surface holds no sidebar rows: the original's plain 12px corner.
  const inset = await page.getByRole("main").evaluate((element) => {
    const look = getComputedStyle(element);
    return [
      look.borderTopLeftRadius,
      look.getPropertyValue("corner-top-left-shape"),
    ];
  });
  expect(inset[0]).toBe("12px");
  expect(["round", "superellipse(1)"]).toContain(inset[1]);
});

// A box's top-start corner: its radius, and round where the browser draws a squircle as round.
const cornerOf = async (locator: Locator): Promise<string> =>
  await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const shape = style.getPropertyValue("corner-top-left-shape");
    return `${style.borderTopLeftRadius} ${shape === "superellipse(1)" || shape === "" ? "round" : shape}`;
  });

test("a row and a group's label take the original's plain 6px corner, the large row 10px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openExample(page, "sidebar", "basic");
  const sidebar = sidebarOf(page);
  const row = sidebar.getByRole("link", { name: "Chat" });
  expect(await cornerOf(row)).toBe("6px round");
  const person = sidebar.locator(
    "[data-slot=sidebar-menu-button][data-size=lg]"
  );
  expect(await cornerOf(person.first())).toBe("10px round");
  const label = sidebar.locator("[data-slot=sidebar-group-label]").first();
  expect(await cornerOf(label)).toBe("6px round");
});

test("a row's action takes the original's corner, a small icon button's: 14px, half its height, not the row's", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openExample(page, "sidebar", "actions");
  const more = page.getByRole("button", { name: "More for Supplier invoices" });
  expect(await cornerOf(more)).toMatch(/^14px (?:superellipse\(2\)|round)$/u);
});

test.describe("on a narrow window", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("its sheet takes the page card's plain 12px corner", async ({
    page,
  }) => {
    await openExample(page, "sidebar", "basic");
    await triggerOf(page).click();
    const sheet = page.locator(
      "[data-slot=drawer-content]:has(> [data-slot=sidebar])"
    );
    await expect(sheet).toBeVisible();
    expect(await cornerOf(sheet)).toBe("12px round");
  });

  test("its head stands as high in the window as beside the page: the sheet's inset taken from its room above", async ({
    page,
  }) => {
    await openExample(page, "sidebar", "basic");
    await triggerOf(page).click();
    const sheet = page.locator(
      "[data-slot=drawer-content]:has(> [data-slot=sidebar])"
    );
    await expect(sheet).toBeVisible();
    const [panel, search] = await Promise.all([
      boxOf(sheet),
      boxOf(sheet.getByRole("button", { name: "Search" })),
    ]);
    expect(search.y - panel.y).toBeCloseTo(10, 0);
  });

  test("the trigger in the page's bar stands in the page's ink; in the sidebar's head, in the sidebar's", async ({
    page,
  }) => {
    await openExample(page, "sidebar", "basic");
    const [bar, ink] = await Promise.all([
      triggerOf(page).evaluate((node) => getComputedStyle(node).color),
      page.evaluate(() => {
        const probe = document.createElement("span");
        probe.style.color = "var(--damsko-foreground)";
        document.body.append(probe);
        const { color } = getComputedStyle(probe);
        probe.remove();
        return color;
      }),
    ]);
    expect(bar).toBe(ink);
  });
});

/** A colour token as the page draws it, read from a probe. */
const ink = async (page: Page, name: string) =>
  await page.evaluate((token) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${token})`;
    document.body.append(probe);
    const { color } = getComputedStyle(probe);
    probe.remove();
    return color;
  }, name);

test.describe("a row with an action, as the original's row and its dots", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the action stands 4px from the row's end, in the ink while the row is pointed at", async ({
    page,
  }) => {
    await openExample(page, "sidebar", "actions");
    const more = page.getByRole("button", {
      name: "More for Supplier invoices",
    });
    const row = page.getByRole("link", { name: "Supplier invoices" });
    const [rowBox, moreBox] = await Promise.all([boxOf(row), boxOf(more)]);
    expect(rowBox.x + rowBox.width - (moreBox.x + moreBox.width)).toBeCloseTo(
      4,
      0
    );
    await page.mouse.move(rowBox.x + 20, rowBox.y + rowBox.height / 2);
    await expect(more).toHaveCSS(
      "color",
      await ink(page, "--damsko-foreground")
    );
    await expect(more).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("the row keeps its fill and ink while the pointer is on its action and while the action's menu is open", async ({
    page,
  }) => {
    await openExample(page, "sidebar", "actions");
    const more = page.getByRole("button", {
      name: "More for Supplier invoices",
    });
    const row = page.getByRole("link", { name: "Supplier invoices" });
    const words = await ink(page, "--damsko-sidebar-foreground");
    await more.hover();
    await expect(row).toHaveCSS("color", words);
    const hovered = await row.evaluate(
      (node) => getComputedStyle(node).backgroundColor
    );
    expect(hovered).not.toBe("rgba(0, 0, 0, 0)");
    await more.click();
    await expect(page.getByRole("menuitem", { name: "Rename" })).toBeVisible();
    await page.mouse.move(1400, 880);
    await expect(row).toHaveCSS("background-color", hovered);
    await expect(row).toHaveCSS("color", words);
  });
});

test("a quiet row's words are in the regular weight, cut where the row ends and shown whole in its tooltip", async ({
  page,
}) => {
  await openExample(page, "sidebar", "long-names");
  const sidebar = sidebarOf(page);
  const name = "Which suppliers changed their payment terms this spring";
  const row = sidebar.getByRole("link", { name });
  await expect(row).toHaveCSS("font-weight", "400");
  await expect(
    sidebar.getByRole("link", { name: /Every supplier contract/u })
  ).toHaveCSS("font-weight", "500");
  await expect(row.getByText(name)).toHaveCSS("text-overflow", "ellipsis");
  await row.hover();
  await expect(page.getByRole("tooltip")).toHaveText(name);
});

for (const [width, place] of [
  [1440, "beside the page"],
  [390, "in its sheet"],
] as const) {
  test(`a row renamed ${place} with F2 takes the words typed in place of its whole name`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await openExample(page, "patterns", "sidebar-rows");
    if (width < 1024) {
      await page
        .getByRole("button", { name: "Show or hide the sidebar" })
        .first()
        .click();
    }
    const row = page.getByRole("link", { name: "Spring launch plan" });
    await row.focus();
    await page.keyboard.press("F2");
    const field = page.getByRole("textbox", {
      name: "Name of Spring launch plan",
    });
    await expect(field).toBeFocused();
    await page.keyboard.type("Launch notes");
    await expect(field).toHaveValue("Launch notes");
  });
}
