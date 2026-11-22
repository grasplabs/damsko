import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

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

test("folded to its icons, every place keeps its name and shows it in a tooltip", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
  const sidebar = sidebarOf(page);
  const dashboard = sidebar.getByRole("link", { name: "Dashboard" });
  // Open, the words show: no tooltip.
  await dashboard.hover();
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

test("the rail folds and opens it, and says whether it is open", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
  const rail = sidebarOf(page).getByRole("button", { name: TOGGLE });
  await expect(rail).toHaveAttribute("aria-expanded", "true");
  await rail.click();
  await expect(rail).toHaveAttribute("aria-expanded", "false");
  await expect(triggerOf(page)).toHaveAttribute("aria-expanded", "false");
  await rail.click();
  await expect(triggerOf(page)).toHaveAttribute("aria-expanded", "true");
});

test("Tab goes down the places, a place's own rows after it, the rail no stop, then the page", async ({
  page,
}) => {
  await openExample(page, "sidebar", "basic");
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
  await openExample(page, "sidebar", "basic");
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

test("the page's own control folds it with an updater, and two in one moment build on each other", async ({
  page,
}) => {
  await openExample(page, "sidebar", "from-the-page");
  const focus = page.getByRole("button", { name: "Focus mode" });
  const trigger = triggerOf(page);
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

test("a name longer than its row ends in an ellipsis, inside the row", async ({
  page,
}) => {
  await openExample(page, "sidebar", "actions");
  const row = page.getByRole("link", {
    name: "Every supplier contract and the day each one is up for renewal",
  });
  const words = row.getByText("Every supplier contract");
  await expect(words).toHaveCSS("text-overflow", "ellipsis");
  const [inside, cut] = await words.evaluate((node) => {
    const link = node.closest("a");
    const edge =
      link === null
        ? 0
        : link.getBoundingClientRect().right -
          Number(getComputedStyle(link).paddingInlineEnd.replace(/px$/u, ""));
    return [
      node.getBoundingClientRect().right <= edge,
      node.scrollWidth > node.clientWidth,
    ];
  });
  expect(inside).toBe(true);
  expect(cut).toBe(true);
});
