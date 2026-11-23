import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

test("an agent runs an action by the menu's name and the action's words", async ({
  page,
}) => {
  await openExample(page, "menubar", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const ran = await page.evaluate(async () => {
    // SAFETY: the example calls pageAgent(), which puts the agent bridge on window.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see SAFETY
    const bridge = Reflect.get(window, "damskoAgent") as {
      act: (plan: { steps: unknown[] }) => Promise<{ ok: boolean }>;
    };
    return await bridge.act({
      steps: [{ ref: "File", action: "press", args: ["Export as PDF"] }],
    });
  });
  expect(ran.ok).toBe(true);
  await expect(page.locator("body")).toHaveAttribute("data-ran", "export");
});

test("the bar is one tab stop, and the arrows move between its menus and through them", async ({
  page,
}) => {
  await openExample(page, "menubar", "editor");
  const bar = page.getByRole("menubar", { name: "Editor" });
  const trigger = (name: string) => bar.getByRole("menuitem", { name });
  await page.keyboard.press("Tab");
  await expect(trigger("File")).toBeFocused();
  await page.keyboard.press("Tab");
  expect(
    await bar.evaluate((element) => element.contains(document.activeElement))
  ).toBe(false);
  await page.keyboard.press("Shift+Tab");
  await expect(trigger("File")).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(trigger("Edit")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  // The first item is out of use: the keys still reach it, as the menu pattern asks.
  await expect(menu.getByRole("menuitem", { name: "Undo" })).toHaveAttribute(
    "aria-disabled",
    "true"
  );
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("menuitemcheckbox", { name: "Show outline" })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(trigger("View")).toBeFocused();
  // The menu out of use keeps its place in the bar and opens nothing.
  await page.keyboard.press("ArrowRight");
  await expect(trigger("Share")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menu")).toBeHidden();
  // Right wraps from the last menu to the first.
  await page.keyboard.press("ArrowRight");
  await expect(trigger("File")).toBeFocused();
});

test("in an open menu, Down, Up, End, Home and a letter move, and Enter runs an item and closes it", async ({
  page,
}) => {
  await openExample(page, "menubar", "agent");
  const file = page.getByRole("menuitem", { name: "File" });
  await file.focus();
  await page.keyboard.press("ArrowDown");
  const item = (name: string) => page.getByRole("menuitem", { name });
  await expect(item("New document")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(item("Export as PDF")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(item("New document")).toBeFocused();
  await page.keyboard.press("End");
  await expect(item("Export as PDF")).toBeFocused();
  await page.keyboard.press("n");
  await expect(item("New document")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(page.locator("body")).toHaveAttribute("data-ran", "new");
  await expect(file).toBeFocused();
});

test("while a menu is open, pointing at another trigger opens its menu instead", async ({
  page,
}) => {
  await openExample(page, "menubar", "editor");
  await page.getByRole("menuitem", { name: "File" }).click();
  await expect(
    page.getByRole("menuitem", { name: "New document" })
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Edit" }).hover();
  await expect(page.getByRole("menuitem", { name: "Redo" })).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "New document" })
  ).toBeHidden();
});

test("a checkbox item turns over and a radio item is chosen", async ({
  page,
}) => {
  await openExample(page, "menubar", "editor");
  await page.getByRole("menuitem", { name: "View" }).click();
  const comments = page.getByRole("menuitemcheckbox", {
    name: "Show comments",
  });
  await expect(comments).not.toBeChecked();
  await comments.click();
  await expect(comments).toBeChecked();
  const full = page.getByRole("menuitemradio", { name: "Full width" });
  await full.click();
  await expect(full).toBeChecked();
  await expect(
    page.getByRole("menuitemradio", { name: "Normal" })
  ).not.toBeChecked();
});

test("the chosen radio item shows a dot and the checked checkbox item a tick", async ({
  page,
}) => {
  await openExample(page, "menubar", "editor");
  await page.getByRole("menuitem", { name: "View" }).click();
  const tick = await page
    .getByRole("menuitemcheckbox", { name: "Show outline" })
    .evaluate((item) => item.querySelector("svg") !== null);
  expect(tick).toBe(true);
  const dot = await page
    .getByRole("menuitemradio", { name: "Normal" })
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

test("in a menu where an item has an icon, an item without one starts its words on the others'", async ({
  page,
}) => {
  await openExample(page, "menubar", "editor");
  await page.getByRole("menuitem", { name: "Edit" }).click();
  // Where the item's own words start: the text that is its name.
  const startOf = async (name: string) =>
    await page.getByRole("menuitem", { name }).evaluate((item, words) => {
      const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.textContent?.includes(words) === true) {
          const range = document.createRange();
          range.selectNodeContents(node);
          return range.getBoundingClientRect().left;
        }
      }
      return Number.NaN;
    }, name);
  expect(
    Math.abs((await startOf("Redo")) - (await startOf("Copy link to section")))
  ).toBeLessThanOrEqual(1);
});

/** A row of an open menu as drawn: its box, its words, its keys and the marks on it. */
interface DrawnRow {
  name: string;
  top: number;
  height: number;
  middle: number;
  /** Where its words start, in the reading direction, and their baseline. */
  start: number;
  baseline: number;
  /** Where the row's own padding ends at its start. */
  padded: number;
  /** The keys' baseline, when it has keys. */
  keys: number | null;
  /** The middle, and the place along the row, of each icon, tick and dot. */
  marks: { middle: number; x: number }[];
}

/** Every open menu's rows, outermost menu first, as they are drawn. */
const drawnMenus = async (page: Page): Promise<DrawnRow[][]> =>
  await page.evaluate(() => {
    const rtl = getComputedStyle(document.documentElement).direction === "rtl";
    const context = document.createElement("canvas").getContext("2d");
    // A run of text's box is its font's ascent above its baseline and descent below.
    const baselineOf = (text: Text): number => {
      const range = document.createRange();
      range.selectNodeContents(text);
      const [box] = range.getClientRects();
      const style = text.parentElement && getComputedStyle(text.parentElement);
      if (context === null || style === null || box === undefined) {
        return Number.NaN;
      }
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      return box.top + context.measureText("x").fontBoundingBoxAscent;
    };
    const startOf = (text: Text): number => {
      const range = document.createRange();
      range.selectNodeContents(text);
      const box = range.getBoundingClientRect();
      return rtl ? box.right : box.left;
    };
    const menus = [...document.querySelectorAll('[role="menu"]')].filter(
      (menu) => menu.getBoundingClientRect().height > 0
    );
    return menus.map((menu) =>
      [...menu.querySelectorAll('[role^="menuitem"]')]
        .filter((row) => row.closest('[role="menu"]') === menu)
        .map((row) => {
          const box = row.getBoundingClientRect();
          const style = getComputedStyle(row);
          const texts: Text[] = [];
          const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (node instanceof Text && (node.textContent ?? "").trim()) {
              texts.push(node);
            }
          }
          const [words, keys] = texts;
          const marks = [...row.querySelectorAll("*")]
            .filter(
              (part) =>
                part instanceof SVGSVGElement ||
                (part.childElementCount === 0 &&
                  (part.textContent ?? "") === "" &&
                  !["none", "normal"].includes(
                    getComputedStyle(part, "::before").content
                  ))
            )
            .map((part) => {
              const mark = part.getBoundingClientRect();
              return {
                middle: mark.top + mark.height / 2,
                x: mark.left + mark.width / 2,
              };
            });
          return {
            name: (row.textContent ?? "").trim(),
            top: box.top,
            height: box.height,
            middle: box.top + box.height / 2,
            start: words === undefined ? Number.NaN : startOf(words),
            baseline: words === undefined ? Number.NaN : baselineOf(words),
            padded: rtl
              ? box.right - Number(style.paddingRight.replace("px", ""))
              : box.left + Number(style.paddingLeft.replace("px", "")),
            keys: keys === undefined ? null : baselineOf(keys),
            marks,
          };
        })
    );
  });

/** The editor's bar at a width, in a theme, in a reading direction. */
const openEditor = async (
  page: Page,
  width: number,
  theme: "light" | "dark",
  dir: "ltr" | "rtl"
) => {
  await page.setViewportSize({ width, height: 900 });
  await openExample(page, "menubar", "editor", { theme });
  await page.evaluate((direction) => {
    document.documentElement.setAttribute("dir", direction);
  }, dir);
};

/** A menu of the bar, opened from its trigger, with the menu opened before it closed. */
const openMenu = async (page: Page, name: string): Promise<DrawnRow[]> => {
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.getByRole("menuitem", { name, exact: true }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  const menus = await drawnMenus(page);
  return menus.flat();
};

/** The File menu, with its Export submenu open: each menu's rows. */
const openExport = async (page: Page): Promise<DrawnRow[][]> => {
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export" }).hover();
  await expect(page.getByRole("menuitem", { name: "As PDF" })).toBeVisible();
  return await drawnMenus(page);
};

for (const width of [1440, 390]) {
  for (const theme of ["light", "dark"] as const) {
    for (const dir of ["ltr", "rtl"] as const) {
      const look = `${width}px, ${theme}, ${dir}`;

      test(`every icon, chevron, tick and dot stands at its row's middle, and keys sit on the words' baseline without making their row taller, ${look}`, async ({
        page,
      }) => {
        await openEditor(page, width, theme, dir);
        const menus = await openExport(page);
        const file = menus.flat();
        const rows = [
          ...file,
          ...(await openMenu(page, "Edit")),
          ...(await openMenu(page, "View")),
        ];
        for (const row of rows) {
          for (const mark of row.marks) {
            expect(
              Math.abs(mark.middle - row.middle),
              row.name
            ).toBeLessThanOrEqual(0.5);
          }
          if (row.keys !== null) {
            expect(
              Math.abs(row.keys - row.baseline),
              row.name
            ).toBeLessThanOrEqual(0.5);
          }
          // One height for every one-line row: keys and a chevron add none.
          expect(Math.abs(row.height - 36), row.name).toBeLessThanOrEqual(0.5);
        }
        // The chevron stands at the row's end, past its words, the way the submenu opens.
        const exportRow = file.find((row) => row.name === "Export");
        const chevron = exportRow?.marks.at(-1)?.x ?? Number.NaN;
        const words = exportRow?.start ?? Number.NaN;
        expect(dir === "rtl" ? chevron < words : chevron > words).toBe(true);
        // And it points that way: drawn as it is left to right, turned once right to left.
        await page.keyboard.press("Escape");
        await page.getByRole("menuitem", { name: "File", exact: true }).click();
        const turn = await page
          .getByRole("menuitem", { name: "Export" })
          .locator("svg")
          .last()
          .evaluate((svg) =>
            svg instanceof SVGSVGElement
              ? Math.sign(svg.getScreenCTM()?.a ?? 0)
              : 0
          );
        expect(turn).toBe(dir === "rtl" ? -1 : 1);
      });

      test(`a submenu with no icons starts its words at its rows' padding, its first row level with the item that opened it, ${look}`, async ({
        page,
      }) => {
        await openEditor(page, width, theme, dir);
        const [file = [], submenu = []] = await openExport(page);
        // The File menu's rows have icons: their words start on one edge, past the icons.
        expect(new Set(file.map((row) => Math.round(row.start))).size).toBe(1);
        expect(submenu.map((row) => row.name)).toEqual([
          "As PDF",
          "As Markdown",
        ]);
        for (const row of submenu) {
          expect(
            Math.abs(row.start - row.padded),
            row.name
          ).toBeLessThanOrEqual(0.5);
        }
        const opener = file.find((row) => row.name === "Export");
        expect(
          Math.abs((submenu[0]?.top ?? 0) - (opener?.top ?? Number.NaN))
        ).toBeLessThanOrEqual(1);
      });
    }
  }
}

test("a submenu opens with Right on its item and Left closes it", async ({
  page,
}) => {
  await openExample(page, "menubar", "editor");
  await page.getByRole("menuitem", { name: "File" }).focus();
  await page.keyboard.press("ArrowDown");
  const exportItem = page.getByRole("menuitem", { name: "Export" });
  await page.keyboard.press("e");
  await expect(exportItem).toBeFocused();
  await page.keyboard.press("ArrowRight");
  const pdf = page.getByRole("menuitem", { name: "As PDF" });
  await expect(pdf).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "As Markdown" })
  ).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(pdf).toBeHidden();
  await expect(exportItem).toBeFocused();
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("its triggers have a 44px target and its items are 44px tall", async ({
    page,
  }) => {
    await openExample(page, "menubar", "editor");
    // The bar's room above and below holds each trigger's 44px target.
    const bar = await page
      .getByRole("menubar", { name: "Editor" })
      .boundingBox();
    expect(bar?.height ?? 0).toBeGreaterThanOrEqual(44);
    await page.getByRole("menuitem", { name: "File" }).focus();
    await page.keyboard.press("ArrowDown");
    const items = page.getByRole("menu").getByRole("menuitem");
    await expect(items.first()).toBeVisible();
    const heights = await items.evaluateAll((all) =>
      all.map((item) => Math.round(item.getBoundingClientRect().height))
    );
    expect(heights.every((height) => height >= 44)).toBe(true);
  });
});

test("an item can be a link: a press follows it and closes the menu", async ({
  page,
}) => {
  await openExample(page, "menubar", "editor");
  await page.getByRole("menuitem", { name: "Edit" }).click();
  const link = page.getByRole("menuitem", { name: "Keyboard shortcuts" });
  await expect(link).toHaveAttribute("href", "#shortcuts");
  await link.click();
  await expect(page).toHaveURL(/#shortcuts$/u);
  await expect(page.getByRole("menu")).toBeHidden();
});
