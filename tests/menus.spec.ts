// What every menu's rows share, as they are drawn: dropdown menu, context menu, menubar, the command
// palette's action menu and the mention menu. Each icon, tick, dot and submenu chevron stands at its
// row's middle; keys sit on the words' baseline and add no height; in each menu the words start on
// one edge; a submenu's rows keep the parent's padding and decide their own icon room. Generated for
// each look: two widths, both reading directions and 1x to 3x screens.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** A row of an open menu as drawn: its box, its words, its keys and the marks on it. */
interface DrawnRow {
  name: string;
  top: number;
  height: number;
  middle: number;
  /** Where its words start, in the reading direction, and their baseline. */
  start: number;
  baseline: number;
  /** Where the row's own padding ends at its start, and how far that is from its menu's edge. */
  padded: number;
  inset: number;
  /** The keys' baseline, when it has keys. */
  keys: number | null;
  /** The middle, and the place along the row, of each icon, tick, dot and chevron. */
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
      // Firefox gives the keys' direction marks boxes of their own, with no height: skipped.
      const box = [...range.getClientRects()].find((each) => each.height > 0);
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
    // A row's words are its first text; its keys the text of its shortcut part.
    const shortcut = '[data-slot$="-shortcut"]';
    const textOf = (part: Node, keysOnly: boolean): Text | undefined => {
      const walker = document.createTreeWalker(part, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const inKeys = node.parentElement?.closest(shortcut) !== null;
        if (
          node instanceof Text &&
          (node.textContent ?? "").trim() !== "" &&
          inKeys === keysOnly
        ) {
          return node;
        }
      }
      return undefined;
    };
    const menus = [
      ...document.querySelectorAll('[role="menu"], [role="listbox"]'),
    ].filter((menu) => menu.getBoundingClientRect().height > 0);
    return menus.map((menu) => {
      const panel = menu.getBoundingClientRect();
      return [...menu.querySelectorAll('[role^="menuitem"], [role="option"]')]
        .filter(
          (row) => row.closest('[role="menu"], [role="listbox"]') === menu
        )
        .map((row) => {
          const box = row.getBoundingClientRect();
          const style = getComputedStyle(row);
          const words = textOf(row, false);
          const keys = textOf(row, true);
          // A drawing, or an empty part that draws a mark (the radio item's dot).
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
          const padded = rtl
            ? box.right - Number(style.paddingRight.replace("px", ""))
            : box.left + Number(style.paddingLeft.replace("px", ""));
          return {
            name: (row.textContent ?? "").trim(),
            top: box.top,
            height: box.height,
            middle: box.top + box.height / 2,
            start: words === undefined ? Number.NaN : startOf(words),
            baseline: words === undefined ? Number.NaN : baselineOf(words),
            padded,
            inset: rtl ? panel.right - padded : padded - panel.left,
            keys: keys === undefined ? null : baselineOf(keys),
            marks,
          };
        });
    });
  });

/** A menu with a submenu: how to open both, the submenu's trigger and its first item. */
interface Submenu {
  component: string;
  example: string;
  open: (page: Page) => Promise<void>;
  trigger: string;
  first: string;
}

const submenus: Submenu[] = [
  {
    component: "menubar",
    example: "editor",
    open: async (page) => {
      await page.getByRole("menuitem", { name: "File", exact: true }).click();
    },
    trigger: "Export",
    first: "As PDF",
  },
  {
    component: "dropdown-menu",
    example: "submenu",
    open: async (page) => {
      await page.getByRole("button", { name: "Roadmap" }).click();
    },
    trigger: "Share",
    first: "With the team",
  },
  {
    component: "context-menu",
    example: "submenu",
    open: async (page) => {
      await page.getByLabel("Roadmap").click({ button: "right" });
    },
    trigger: "Share",
    first: "With the team",
  },
];

/** Menus without a submenu whose rows hold keys, ticks, dots or icons. */
const others: {
  label: string;
  component: string;
  example: string;
  open: (page: Page, dir: "ltr" | "rtl") => Promise<void>;
  /** Whether its rows are a menu's 36px rows (the mention menu's carry a second line). */
  rows36: boolean;
}[] = [
  {
    label: "the menubar's Edit menu",
    component: "menubar",
    example: "editor",
    open: async (page) => {
      await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
      await expect(page.getByRole("menu")).toBeVisible();
    },
    rows36: true,
  },
  {
    label: "the menubar's View menu",
    component: "menubar",
    example: "editor",
    open: async (page) => {
      await page.getByRole("menuitem", { name: "View", exact: true }).click();
      await expect(page.getByRole("menu")).toBeVisible();
    },
    rows36: true,
  },
  {
    label: "the command palette's action menu",
    component: "command",
    example: "actions",
    open: async (page, dir) => {
      await page
        .getByRole("combobox", { name: "Search the workspace" })
        .focus();
      await page.keyboard.type("spring");
      // The arrow that points to the row's end opens its actions.
      await page.keyboard.press(dir === "rtl" ? "ArrowLeft" : "ArrowRight");
      await expect(page.getByRole("menu")).toBeVisible();
    },
    rows36: true,
  },
  {
    label: "the mention menu",
    component: "prompt-input",
    example: "mentions",
    open: async (page) => {
      await page.getByRole("textbox", { name: "Message" }).click();
      await page.keyboard.type("@");
      await expect(page.getByRole("option").first()).toBeVisible();
    },
    rows36: false,
  },
];

/** Each icon, tick, dot and chevron at the row's middle; keys on the words' baseline. */
const expectCentred = (rows: DrawnRow[], rows36: boolean) => {
  expect(rows.length).toBeGreaterThan(1);
  for (const row of rows) {
    for (const mark of row.marks) {
      expect(Math.abs(mark.middle - row.middle), row.name).toBeLessThanOrEqual(
        0.5
      );
    }
    if (row.keys !== null) {
      expect(Math.abs(row.keys - row.baseline), row.name).toBeLessThanOrEqual(
        0.5
      );
    }
    if (rows36) {
      // One height for every one-line row: keys and a chevron add none.
      expect(Math.abs(row.height - 36), row.name).toBeLessThanOrEqual(0.5);
    }
  }
};

/** In a menu the words start on one edge: past the icons when a row has one, else at the padding. */
const expectOneEdge = (rows: DrawnRow[], icons: boolean) => {
  const [first] = rows;
  for (const row of rows) {
    expect(Math.abs(row.start - (first?.start ?? 0)), row.name).toBeLessThan(
      0.5
    );
    if (!icons) {
      expect(Math.abs(row.start - row.padded), row.name).toBeLessThan(0.5);
    }
  }
};

const looks = [1, 2, 3].flatMap((scale) =>
  [1440, 390].flatMap((width) =>
    (["ltr", "rtl"] as const).map((dir) => ({ scale, width, dir }))
  )
);

for (const { scale, width, dir } of looks) {
  const look = `${width}px, ${dir}, ${scale}x`;

  test.describe(look, () => {
    test.use({
      deviceScaleFactor: scale,
      viewport: { width, height: 900 },
    });

    const open = async (page: Page, component: string, example: string) => {
      await openExample(page, component, example);
      await page.evaluate((direction) => {
        document.documentElement.setAttribute("dir", direction);
      }, dir);
    };

    for (const menu of submenus) {
      test(`${menu.component}: a submenu's chevron stands at its row's middle and end and points the way it opens; the submenu keeps the parent's padding, its own icon room, and its first row level with its trigger, ${look}`, async ({
        page,
      }) => {
        await open(page, menu.component, menu.example);
        await menu.open(page);
        await page.getByRole("menuitem", { name: menu.trigger }).hover();
        await expect(
          page.getByRole("menuitem", { name: menu.first })
        ).toBeVisible();
        const [parent = [], child = []] = await drawnMenus(page);
        expectCentred(parent, true);
        expectCentred(child, true);

        const trigger = parent.find((row) => row.name === menu.trigger);
        const chevron = trigger?.marks.at(-1)?.x ?? Number.NaN;
        const words = trigger?.start ?? Number.NaN;
        expect(dir === "rtl" ? chevron < words : chevron > words).toBe(true);
        // Drawn as it is left to right, turned once right to left.
        const turn = await page
          .getByRole("menuitem", { name: menu.trigger })
          .locator("svg")
          .last()
          .evaluate((svg) =>
            svg instanceof SVGSVGElement
              ? Math.sign(svg.getScreenCTM()?.a ?? 0)
              : 0
          );
        expect(turn).toBe(dir === "rtl" ? -1 : 1);

        // The rows of both menus are padded alike; each menu lines its own words up, past its own
        // icons (the chevron is not one).
        for (const row of child) {
          expect(
            Math.abs(row.inset - (parent[0]?.inset ?? Number.NaN)),
            row.name
          ).toBeLessThan(0.5);
        }
        expectOneEdge(parent, true);
        expectOneEdge(
          child,
          child.some((row) => row.marks.length > 0)
        );
        expect(
          Math.abs((child[0]?.top ?? 0) - (trigger?.top ?? Number.NaN))
        ).toBeLessThanOrEqual(1);
      });
    }

    for (const menu of others) {
      test(`${menu.label}: every icon, tick and dot stands at its row's middle, the words start on one edge, and keys sit on the words' baseline without making their row taller, ${look}`, async ({
        page,
      }) => {
        await open(page, menu.component, menu.example);
        await menu.open(page, dir);
        // The menu opened last: the command palette's results stand behind its action menu.
        const menus = await drawnMenus(page);
        const rows = menus.at(-1) ?? [];
        expectCentred(rows, menu.rows36);
        expectOneEdge(
          rows,
          rows.some((row) => row.marks.length > 0)
        );
      });
    }
  });
}
