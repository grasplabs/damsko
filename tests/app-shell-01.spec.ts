import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import {
  listenToLiveRegions,
  openExample,
  openExampleAsleep,
} from "./example.ts";

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

test("the bar draws its path as a slash between steps, the page in medium weight, a rule at its foot", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByText("/", { exact: true })).toBeVisible();
  const name = crumbs.getByRole("button", { name: "Spring launch" });
  await expect(name).toHaveCSS("font-weight", "500");
  // The rule: a hairline across the foot of the bar the path stands in.
  const rule = await crumbs.evaluate((node) => {
    const bar = node.closest("header");
    return bar === null ? "" : getComputedStyle(bar).borderBottomWidth;
  });
  expect(rule).toBe("1px");
});

test("the sidebar is a named landmark with the fold in its head, beside the main page, which holds the bar", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await expect(sidebar.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(sidebar.getByRole("button", { name: TOGGLE })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Home" })).toBeVisible();
  const main = page.getByRole("main");
  await expect(
    main.getByRole("navigation", { name: "Breadcrumb" })
  ).toBeVisible();
  // While the sidebar is open its head holds the fold: the bar has none.
  await expect(main.getByRole("button", { name: TOGGLE })).toHaveCount(0);
  // The bar is the page's, inside main: no banner landmark of its own.
  await expect(page.getByRole("banner")).toHaveCount(0);
});

test("the head's fold puts the sidebar away and the bar's brings it back, focus going on to the head's", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  const fold = sidebar.getByRole("button", { name: TOGGLE });
  const row = sidebar.getByRole("link", { name: "Chat" });
  await expect(fold).toHaveAttribute("aria-expanded", "true");
  await fold.click();
  await expect(row).toBeHidden();
  const barFold = page.getByRole("main").getByRole("button", { name: TOGGLE });
  await expect(barFold).toHaveAttribute("aria-expanded", "false");
  await barFold.focus();
  await page.keyboard.press("Enter");
  await expect(row).toBeVisible();
  // The bar's fold went with the sidebar's return: focus is on the head's, never lost.
  await expect(barFold).toHaveCount(0);
  await expect(fold).toBeFocused();
});

test("Cmd+B or Ctrl+B fold the sidebar away and bring it back", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const row = page
    .getByRole("complementary", { name: "Sidebar" })
    .getByRole("link", { name: "Chat" });
  await pressKeys(page);
  await expect(row).toBeHidden();
  await pressKeys(page);
  await expect(row).toBeVisible();
});

test("the fold is kept for the next visit (storageKey)", async ({ page }) => {
  await openExample(page, "app-shell-01", "basic");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar.getByRole("button", { name: TOGGLE }).click();
  await expect(sidebar.getByRole("link", { name: "Chat" })).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole("main").getByRole("button", { name: TOGGLE })
  ).toHaveAttribute("aria-expanded", "false");
  await expect(
    page
      .getByRole("complementary", { name: "Sidebar" })
      .getByRole("link", { name: "Chat" })
  ).toBeHidden();
});

test("the head's search opens the product's search, and names its keys", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const search = page
    .getByRole("complementary", { name: "Sidebar" })
    .getByRole("button", { name: "Search" });
  await expect(search).toHaveAttribute(
    "aria-keyshortcuts",
    /^(?:Meta|Control)\+J$/u
  );
  await expect(search).toHaveAttribute("title", /^Search \(.+J.*\)$/u);
  await search.click();
  const dialog = page.getByRole("dialog", { name: "Search" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(search).toBeFocused();
});

test("the search's keys open it from the page and from rich text, and close it again", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "composed");
  const assistant = page.getByRole("region", { name: "Assistant" });
  await page.getByRole("heading", { name: "Dashboard", level: 1 }).click();
  await page.keyboard.press("ControlOrMeta+j");
  await expect(assistant).toBeVisible();
  await page.keyboard.press("ControlOrMeta+j");
  await expect(assistant).toBeHidden();
  // Rich text that binds no keys of its own: the keys open it from there too.
  await page.getByRole("textbox", { name: "Notes" }).click();
  await page.keyboard.press("ControlOrMeta+j");
  await expect(assistant).toBeVisible();
});

test("the sidebar's keys fold it from rich text that binds none, and an editor that binds them keeps them", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "composed");
  const notes = page.getByRole("textbox", { name: "Notes" });
  const row = page
    .getByRole("complementary", { name: "Sidebar" })
    .getByRole("link", { name: "Dashboard" });
  await notes.click();
  await pressKeys(page);
  await expect(row).toBeHidden();
  await notes.click();
  await pressKeys(page);
  await expect(row).toBeVisible();
  // An editor that makes text bold on the same keys, and marks them handled, keeps them.
  await notes.evaluate((editor: HTMLElement) => {
    editor.addEventListener("keydown", (event) => {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        editor.dataset.bold = "yes";
      }
    });
  });
  await notes.click();
  await pressKeys(page);
  await expect(notes).toHaveAttribute("data-bold", "yes");
  await expect(row).toBeVisible();
});

test("an editor that binds the search's keys itself keeps them", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "composed");
  const notes = page.getByRole("textbox", { name: "Notes" });
  // The editor takes the keys for itself, as one that inserts a link on Cmd+K does.
  await notes.evaluate((editor: HTMLElement) => {
    editor.addEventListener("keydown", (event) => {
      if (event.key === "j" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        editor.dataset.heard = "yes";
      }
    });
  });
  await notes.click();
  await page.keyboard.press("ControlOrMeta+j");
  await expect(notes).toHaveAttribute("data-heard", "yes");
  await expect(page.getByRole("region", { name: "Assistant" })).toBeHidden();
});

test("the search's keys close the search dialog they opened, from inside it, and focus goes back", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "basic");
  const projects = page
    .getByRole("complementary", { name: "Sidebar" })
    .getByRole("link", { name: "Projects" });
  await projects.focus();
  await page.keyboard.press("ControlOrMeta+j");
  const dialog = page.getByRole("dialog", { name: "Search" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("ControlOrMeta+j");
  await expect(dialog).toBeHidden();
  // The focus goes back to where it was before the keys opened it.
  await expect(projects).toBeFocused();
});

test("room under the page: a page that fills the card scrolls its last row clear of the dock", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "dock");
  const entries = page.getByRole("list", { name: "Entries" });
  const last = entries.getByRole("listitem").last();
  const dock = await page.getByRole("group", { name: "Dock" }).boundingBox();
  // The wheel over the page scrolls it to its end.
  await entries.hover();
  await page.mouse.wheel(0, 5000);
  await expect
    .poll(async () => {
      const box = await last.boundingBox();
      return (box?.y ?? 0) + (box?.height ?? 0);
    })
    .toBeLessThanOrEqual((dock?.y ?? 0) - 15);
  // And it went as far as it goes: past the row, only the room kept for the dock.
  await expect(last).toBeInViewport();
});

test("composed by hand: the overlay stands over the card and keeps the bar's room; covered, the page is out of reach and the overlay is not", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "composed");
  const main = page.getByRole("main");
  const open = main.getByRole("button", { name: "Assistant", exact: true });
  const bar = main.locator("[data-slot=app-shell-header]");
  const [barBox, openBox] = await Promise.all([
    bar.boundingBox(),
    open.boundingBox(),
  ]);
  // The button stands in the bar's row, at its end, past where the bar keeps its own room.
  expect(
    Math.abs(
      (openBox?.y ?? 0) +
        (openBox?.height ?? 0) / 2 -
        ((barBox?.y ?? 0) + (barBox?.height ?? 0) / 2)
    )
  ).toBeLessThan(1);
  const padding = await bar.evaluate((node) =>
    Number(getComputedStyle(node).paddingInlineEnd.replace("px", ""))
  );
  expect(padding).toBeGreaterThan(24 + (openBox?.width ?? 0));
  await open.click();
  await expect(open).toHaveAttribute("aria-expanded", "true");
  const covered = await main
    .getByRole("heading", { name: "Dashboard", level: 1 })
    .evaluate((title) => title.closest("[inert]") !== null);
  expect(covered).toBe(true);
  await open.click();
  await expect(page.getByRole("region", { name: "Assistant" })).toBeHidden();
});

test("the sidebar's state is kept by the parent when it holds it (open and onOpenChange)", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "states");
  const state = page.getByRole("main").getByText(/^Sidebar (?:open|folded)$/u);
  await expect(state).toHaveText("Sidebar open");
  await page
    .getByRole("complementary", { name: "Sidebar" })
    .getByRole("button", { name: TOGGLE })
    .click();
  await expect(state).toHaveText("Sidebar folded");
  await page.getByRole("main").getByRole("button", { name: TOGGLE }).click();
  await expect(state).toHaveText("Sidebar open");
});

test("before the page wakes, a kept fold is drawn folded, with the bar's fold in place", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("app-shell-01-basic", "false");
  });
  const wake = await openExampleAsleep(page, "app-shell-01", "basic");
  const row = page.locator('[data-slot=sidebar] a[href="#chat"]');
  await expect(row).toBeHidden();
  const barFold = page
    .locator("[data-slot=app-shell-header]")
    .locator("[data-slot=sidebar-trigger]");
  await expect(barFold).toBeVisible();
  await wake();
  await expect(row).toBeHidden();
  await expect(barFold).toBeVisible();
});

test("before the page wakes on a phone, the bar's menu button is already there", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  const wake = await openExampleAsleep(page, "app-shell-01", "basic");
  const barFold = page
    .locator("[data-slot=app-shell-header]")
    .locator("[data-slot=sidebar-trigger]");
  await expect(barFold).toBeVisible();
  await wake();
  await expect(barFold).toBeVisible();
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("focus follows the fold across, once the sidebar has slid", async ({
    page,
  }) => {
    await openExample(page, "app-shell-01", "basic");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    const fold = sidebar.getByRole("button", { name: TOGGLE });
    await fold.focus();
    await page.keyboard.press("Enter");
    const barFold = page
      .getByRole("main")
      .getByRole("button", { name: TOGGLE });
    await expect(barFold).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(fold).toBeFocused();
    await expect(barFold).toBeHidden();
  });

  test("focus follows the fold though something in the page moves for ever", async ({
    page,
  }) => {
    await openExample(page, "patterns", "chat-page");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    const fold = sidebar.getByRole("button", { name: TOGGLE });
    await fold.focus();
    await page.keyboard.press("Enter");
    const barFold = page
      .getByRole("main")
      .getByRole("button", { name: TOGGLE });
    await expect(barFold).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(fold).toBeFocused();
  });

  test("focus follows the fold past a working mark in the sidebar, which moves for ever", async ({
    page,
  }) => {
    await openExample(page, "app-shell-01", "frame");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    const fold = sidebar.getByRole("button", { name: TOGGLE });
    await fold.focus();
    await page.keyboard.press("Enter");
    const barFold = page
      .getByRole("main")
      .getByRole("button", { name: TOGGLE });
    await expect(barFold).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(fold).toBeFocused();
  });

  test("focus the person moves while the sidebar slides stays where they put it", async ({
    page,
  }) => {
    await openExample(page, "app-shell-01", "basic");
    const fold = page
      .getByRole("complementary", { name: "Sidebar" })
      .getByRole("button", { name: TOGGLE });
    await fold.focus();
    await page.keyboard.press("Enter");
    const share = page.getByRole("button", { name: "Share" });
    await page.waitForTimeout(30);
    await share.focus();
    // Past the slide: focus is still on Share.
    await page.waitForTimeout(600);
    await expect(share).toBeFocused();
  });
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

test("on a phone the sheet's head closes it, and its search opens over the page with the sheet gone, focus coming back to the bar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "app-shell-01", "basic");
  const open = page.getByRole("button", { name: TOGGLE });
  await open.click();
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  await sheet.getByRole("button", { name: "Close" }).click();
  await expect(sheet).toBeHidden();
  await expect(open).toBeFocused();
  await open.click();
  await sheet.getByRole("button", { name: "Search" }).click();
  await expect(sheet).toBeHidden();
  const search = page.getByRole("dialog", { name: "Search" });
  await expect(search).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(search).toBeHidden();
  await expect(open).toBeFocused();
});

test("on a phone with no title yet, the bar ends with the last step", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "app-shell-01", "states");
  const trail = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(trail).toHaveText("Reports");
  await expect(trail.getByRole("link", { name: "Reports" })).toBeVisible();
});

test("on a phone the bar says the page and the step before it, and drops the step when both don't fit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "page-header", "band");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  // Notes / Reports / Finance: the page and its step, the first step left out.
  await expect(crumbs).toHaveText(/^Reports\s*\/\s*Finance$/u);
  await expect(crumbs.getByRole("link", { name: "Reports" })).toBeVisible();
  await expect(crumbs.getByText("Finance")).toHaveAttribute(
    "aria-current",
    "page"
  );
  // A name too long for both: the page stands alone, and its step is out of reach.
  await openExample(page, "app-shell-01", "basic");
  const trail = page.getByRole("navigation", { name: "Breadcrumb" });
  const step = trail.getByRole("link", { name: "Projects" });
  await expect(step).toBeVisible();
  await trail.getByRole("button", { name: "Spring launch" }).click();
  await page
    .getByRole("textbox", { name: "Rename" })
    .fill("Spring launch for every team in the northern region");
  await page.keyboard.press("Enter");
  // Wrapped onto the trail's hidden second line, and out of the keys' and a screen reader's reach.
  await expect
    .poll(async () => await step.evaluate((link) => link.closest("li")?.inert))
    .toBe(true);
  const [line, under] = await step.evaluate((link) => {
    const list = link.closest("ol")?.getBoundingClientRect();
    return [link.getBoundingClientRect().top, list?.bottom ?? 0];
  });
  expect(line).toBeGreaterThanOrEqual(under);
});

test("a banner stands above the bar, across the page", async ({ page }) => {
  await openExample(page, "app-shell-01", "banner");
  const notice = page.getByText("Scheduled maintenance");
  const where = page.getByRole("main").getByText("Dashboard").first();
  const above = await topOf(notice);
  const bar = await topOf(where);
  expect(above).toBeLessThan(bar);
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

test("under Settings' address the sidebar shows Settings' own level, and Back shows the main one", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "levels");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  const opener = sidebar.getByRole("link", { name: "Settings" });
  await opener.focus();
  await page.keyboard.press("Enter");
  const settings = sidebar.getByRole("navigation", { name: "Settings" });
  await expect(settings).toBeVisible();
  await expect(sidebar.getByRole("navigation", { name: "Main" })).toBeHidden();
  await expect(settings.getByRole("link", { name: "General" })).toBeFocused();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("General");
  await settings.getByRole("link", { name: "Members" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Members");
  await sidebar.getByRole("link", { name: "Back" }).focus();
  await page.keyboard.press("Enter");
  await expect(sidebar.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(opener).toBeFocused();
  await expect(sidebar.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});

test("on a phone a link into another level closes the sheet, which opens on that level", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "app-shell-01", "levels");
  const trigger = page.getByRole("button", { name: TOGGLE });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  await sheet.getByRole("link", { name: "Settings" }).click();
  await expect(sheet).toBeHidden();
  await trigger.click();
  await expect(
    sheet.getByRole("navigation", { name: "Settings" })
  ).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Back" })).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Projects" })).toHaveCount(0);
});

test("on a phone the page fills the window in the card's own ground", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "app-shell-01", "basic");
  // What stands under the page's words, the card's ground, against the card's colour.
  const [ground, card] = await page
    .getByRole("heading", { name: "Spring launch" })
    .evaluate((title) => {
      let box: Element | null = title;
      while (
        box !== null &&
        getComputedStyle(box).backgroundColor === "rgba(0, 0, 0, 0)"
      ) {
        box = box.parentElement;
      }
      const probe = document.createElement("span");
      probe.style.color = "var(--damsko-sidebar-card)";
      title.append(probe);
      const pair = [
        box === null ? "" : getComputedStyle(box).backgroundColor,
        getComputedStyle(probe).color,
      ];
      probe.remove();
      return pair;
    });
  expect(ground).toBe(card);
});

test("the shell writes every slash in its path, each as far from the step before it as from the one after", async ({
  page,
}) => {
  await openExample(page, "page-header", "band");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  const path = await crumbs.evaluate((nav) => {
    const parts = [
      ...nav.querySelectorAll(
        "[data-slot=breadcrumb-item], [data-slot=breadcrumb-separator]"
      ),
    ];
    // Each part's ink: a step's words, a separator's slash, without the boxes round them.
    const inks = parts.map((part) => {
      const walk = document.createTreeWalker(part, NodeFilter.SHOW_TEXT);
      const texts: Text[] = [];
      while (walk.nextNode() !== null) {
        if (
          walk.currentNode instanceof Text &&
          walk.currentNode.data.trim() !== ""
        ) {
          texts.push(walk.currentNode);
        }
      }
      const words = document.createRange();
      const first = texts.at(0);
      const last = texts.at(-1);
      if (first !== undefined && last !== undefined) {
        words.setStart(first, 0);
        words.setEnd(last, last.length);
      }
      return words.getBoundingClientRect();
    });
    return {
      kinds: parts.map((part) =>
        part.matches("[data-slot=breadcrumb-separator]")
          ? (part.textContent ?? "")
          : "step"
      ),
      gaps: inks
        .slice(1)
        .map((box, at) => Math.round(box.left - (inks[at]?.right ?? 0))),
    };
  });
  // Notes / Reports / Finance: one slash between every two steps, none doubled.
  expect(path.kinds).toEqual(["step", "/", "step", "/", "step"]);
  // Every step and slash the same room apart, the slash the shell writes before the page too.
  expect(new Set(path.gaps).size).toBe(1);
});

test("a slow page keeps its bar and says once that it is loading; a missing or failed one stands in the card's middle", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "states");
  const main = page.getByRole("main");
  const loading = main.getByRole("status", { name: "Loading…" });
  await expect(loading).toHaveAttribute("aria-busy", "true");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar.getByRole("button", { name: "Missing page" }).click();
  const missing = main.getByRole("heading", {
    level: 1,
    name: "This page is not here",
  });
  await expect(missing).toBeVisible();
  await expect(main.getByRole("link", { name: "Go home" })).toBeVisible();
  // In the middle of what the bar leaves of the card.
  const card = await main.boundingBox();
  const title = await missing.boundingBox();
  if (card === null || title === null) {
    throw new Error("The page has no box.");
  }
  const middle = card.y + 48 + (card.height - 48) / 2;
  expect(Math.abs(title.y - middle)).toBeLessThan(card.height / 4);
  await sidebar.getByRole("button", { name: "Failed page" }).click();
  await expect(
    main.getByRole("heading", { level: 1, name: "This page didn’t load" })
  ).toBeVisible();
  await main.getByRole("button", { name: "Try again" }).click();
  await expect(loading).toBeVisible();
});

test("the view switch is one tab stop: the arrows move and choose, the Inbox's count is said, and its rows take the list's place", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  const views = sidebar.getByRole("tablist", { name: "Views" });
  const home = views.getByRole("tab", { name: "Home" });
  const inbox = views.getByRole("tab", { name: "Inbox 4 things wait" });
  await expect(home).toHaveAttribute("aria-selected", "true");
  await expect(inbox).toHaveAttribute("tabindex", "-1");
  await home.focus();
  await page.keyboard.press("ArrowRight");
  await expect(inbox).toBeFocused();
  await expect(inbox).toHaveAttribute("aria-selected", "true");
  const panel = sidebar.getByRole("tabpanel", { name: "Inbox 4 things wait" });
  await expect(
    panel.getByRole("navigation", { name: "Inbox" }).getByRole("link", {
      name: "The agreement on handling data is not signed yet.",
    })
  ).toBeVisible();
  await page.keyboard.press("Home");
  await expect(home).toHaveAttribute("aria-selected", "true");
  await expect(sidebar.getByRole("navigation", { name: "Main" })).toBeVisible();
});

test("a row says its count, its time, the Working mark and the unread dot in words; a group folds, and is a landmark of its own", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await expect(
    sidebar.getByRole("link", { name: "Answering Acme 3 things wait" })
  ).toBeVisible();
  await expect(
    sidebar.getByRole("link", { name: "Q3 numbers 2h ago Working" })
  ).toBeVisible();
  const unread = sidebar.getByRole("link", {
    name: "Kickoff notes 1d ago Unread",
  });
  await expect(unread).toBeVisible();
  // Its name stands out while its dot shows; a read row's stays in its weight.
  await expect(unread).toHaveCSS("font-weight", "600");
  await expect(
    sidebar.getByRole("link", { name: "Hiring plan 3d ago" })
  ).toHaveCSS("font-weight", "400");
  const organisations = sidebar.getByRole("navigation", {
    name: "Organisations",
  });
  const fold = organisations.getByRole("button", { name: "Organisations 2" });
  await expect(fold).toHaveAttribute("aria-expanded", "true");
  await fold.click();
  await expect(fold).toHaveAttribute("aria-expanded", "false");
  await expect(
    organisations.getByRole("link", { name: /Answering Acme/u })
  ).toBeHidden();
});

test("a row's menu, from its dots or a right-click, renames it in place; F2 does too, and Escape keeps the name", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  const row = sidebar.getByRole("link", { name: /^Hiring plan/u });
  await row.hover();
  await sidebar.getByRole("button", { name: "More for Hiring plan" }).click();
  await page.getByRole("menuitem", { name: "Rename" }).click();
  const field = page.getByRole("textbox", { name: "Rename Hiring plan" });
  await expect(field).toBeFocused();
  await field.fill("Hiring plan 2027");
  await page.keyboard.press("Enter");
  const renamed = sidebar.getByRole("link", { name: /^Hiring plan 2027/u });
  await expect(renamed).toBeFocused();
  await page.keyboard.press("F2");
  await page
    .getByRole("textbox", { name: "Rename Hiring plan 2027" })
    .fill("Gone");
  await page.keyboard.press("Escape");
  await expect(renamed).toBeVisible();
  await expect(renamed).toBeFocused();
  await renamed.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(renamed).toHaveCount(0);
});

test("a row's rename field takes its words' weight, so nothing jumps: an unread row's semibold, a quiet row's regular", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  const renamedIn = async (name: string, weight: string): Promise<void> => {
    const row = sidebar.getByRole("link", {
      name: new RegExp(`^${name}`, "u"),
    });
    await expect(row).toHaveCSS("font-weight", weight);
    await row.focus();
    await page.keyboard.press("F2");
    const field = page.getByRole("textbox", { name: `Rename ${name}` });
    await expect(field).toHaveCSS("font-weight", weight);
    await page.keyboard.press("Escape");
    await expect(field).toHaveCount(0);
  };
  await renamedIn("Kickoff notes", "600");
  await renamedIn("Hiring plan", "400");
});

test("an organisation's level heads itself with Back and its name as one row, its name the level's own first page", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar
    .getByRole("link", { name: "Answering Acme 3 things wait" })
    .click();
  const name = sidebar.getByRole("heading", {
    level: 2,
    name: "Answering Acme",
  });
  await expect(name.getByRole("link")).toHaveAttribute("aria-current", "page");
  const back = sidebar.getByRole("link", { name: "Back" });
  const [backBox, nameBox] = await Promise.all([
    back.boundingBox(),
    name.boundingBox(),
  ]);
  // One row: Back and the name stand side by side, on the same line.
  expect(Math.abs((backBox?.y ?? 0) - (nameBox?.y ?? 1))).toBeLessThan(2);
  await back.click();
  await expect(sidebar.getByRole("navigation", { name: "Main" })).toBeVisible();
});

test("the person at the foot opens their menu: presses, the theme as segments the arrows choose, a submenu of choices", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const person = page
    .getByRole("complementary", { name: "Sidebar" })
    .getByRole("button", { name: "Anna de Vries" });
  await person.click();
  const menu = page.getByRole("menu");
  await expect(menu.getByRole("menuitem", { name: "Settings" })).toBeVisible();
  const theme = menu.getByRole("group", { name: "Appearance" });
  await expect(
    theme.getByRole("menuitemradio", { name: "System" })
  ).toHaveAttribute("aria-checked", "true");
  await theme.getByRole("menuitemradio", { name: "Dark" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(
    theme.getByRole("menuitemradio", { name: "Light" })
  ).toHaveAttribute("aria-checked", "true");
  await expect(menu.getByRole("menuitem", { name: "Sign out" })).toBeVisible();
  await menu.getByRole("menuitem", { name: "Switch organisation" }).click();
  await expect(
    page.getByRole("menuitemradio", { name: "Northwind Finance" })
  ).toHaveAttribute("aria-checked", "true");
});

test("a row's menu opens from the keys too: Shift+F10 on its link", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar.getByRole("link", { name: /^Hiring plan/u }).focus();
  await page.keyboard.press("Shift+F10");
  await expect(page.getByRole("menuitem", { name: "Rename" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    sidebar.getByRole("link", { name: /^Hiring plan/u })
  ).toBeFocused();
});

test("a rename saves as the field is left, keeps the name when blank, and waits while a word is being composed", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar.getByRole("link", { name: /^Hiring plan/u }).dblclick();
  const field = page.getByRole("textbox", { name: "Rename Hiring plan" });
  await field.fill("Hiring");
  await page.getByRole("heading", { level: 1 }).click();
  await expect(
    sidebar.getByRole("link", { name: /^Hiring 3d/u })
  ).toBeVisible();
  await sidebar.getByRole("link", { name: /^Hiring 3d/u }).dblclick();
  const again = page.getByRole("textbox", { name: "Rename Hiring" });
  await again.fill("   ");
  await page.keyboard.press("Enter");
  await expect(
    sidebar.getByRole("link", { name: /^Hiring 3d/u })
  ).toBeVisible();
  await sidebar.getByRole("link", { name: /^Hiring 3d/u }).dblclick();
  const composing = page.getByRole("textbox", { name: "Rename Hiring" });
  await composing.fill("Hiring plan");
  await composing.evaluate((input) => {
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        isComposing: true,
        bubbles: true,
      })
    );
  });
  await expect(composing).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(
    sidebar.getByRole("link", { name: /^Hiring plan 3d/u })
  ).toBeVisible();
});

test("rows are kept by their ids: of two rows of one name, only the one renamed changes", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  const second = sidebar.getByRole("link", { name: /^Untitled 5d/u });
  await second.focus();
  await page.keyboard.press("F2");
  await page.getByRole("textbox", { name: "Rename Untitled" }).fill("Budget");
  await page.keyboard.press("Enter");
  await expect(
    sidebar.getByRole("link", { name: /^Budget 5d/u })
  ).toBeVisible();
  await expect(
    sidebar.getByRole("link", { name: /^Untitled 4d/u })
  ).toBeVisible();
});

test("deleting a row from its menu leaves focus in the list, on the next row", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar.getByRole("link", { name: /^Hiring plan/u }).focus();
  await page.keyboard.press("Shift+F10");
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(
    sidebar.getByRole("link", { name: /^Hiring plan/u })
  ).toHaveCount(0);
  await expect(
    sidebar.getByRole("link", { name: /^Untitled 4d/u })
  ).toBeFocused();
});

test("a count is said again when it changes: a note read leaves one less waiting", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar
    .getByRole("link", { name: /^Kickoff notes 1d ago Unread/u })
    .click();
  await expect(
    sidebar.getByRole("tab", { name: "Inbox 3 things wait" })
  ).toBeVisible();
  await expect.poll(said).toContain("3 things wait");
});

test("a group's fold is kept for the next visit", async ({ page }) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  const labs = sidebar.getByRole("button", { name: "Labs" });
  await expect(labs).toHaveAttribute("aria-expanded", "true");
  await labs.click();
  await expect(labs).toHaveAttribute("aria-expanded", "false");
  await page.reload();
  await expect(
    page
      .getByRole("complementary", { name: "Sidebar" })
      .getByRole("button", { name: "Labs" })
  ).toHaveAttribute("aria-expanded", "false");
});

test("a row's own control stands at its end; a row without words of its own says its count as the number", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await expect(
    sidebar.getByRole("link", {
      name: "Brightwater is not read now. Open its Setup",
    })
  ).toBeVisible();
  await sidebar
    .getByRole("link", { name: "Answering Acme 3 things wait" })
    .click();
  await expect(sidebar.getByRole("link", { name: "People 2" })).toBeVisible();
});

test("the person's row says their name and the line under it; the search's keys are Cmd+K or Ctrl+K", async ({
  page,
}) => {
  await openExample(page, "app-shell-01", "frame");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await expect(
    sidebar.getByRole("button", { name: "Anna de Vries Northwind Finance" })
  ).toBeVisible();
  await expect(sidebar.getByRole("button", { name: "Search" })).toHaveAttribute(
    "aria-keyshortcuts",
    /^(?:Meta|Control)\+K$/u
  );
});

test("on a phone a row that acts closes the sheet, as a link followed does", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "app-shell-01", "frame");
  await page.getByRole("button", { name: TOGGLE }).click();
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  await sheet.getByRole("button", { name: "All notes" }).click();
  await expect(sheet).toBeHidden();
});
