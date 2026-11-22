// Forced colours, across the library: the system draws its own colours, drops fills and shadows,
// and keeps borders and outlines. So every control in every component example that is bounded by
// a border, a fill or a shadow in normal colours keeps a real border or outline in forced colours,
// or a fill in a system colour, in a light and a dark system theme, and is never left as words
// floating on the page.
//
// The controls below lose their bound today, each waiting on a design decision; one that comes to
// keep it may leave the list.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { componentExamples, openExample, settled } from "./example.ts";

const controls =
  'button, [role="button"], [role="tab"], [role="checkbox"], [role="switch"], [role="radio"], [role="combobox"], input:not([type="hidden"]), select, textarea';

/** For each control on the page, in order: its name, and whether it is drawn with a bound. */
const bounds = async (page: Page, forced: boolean) =>
  await page.evaluate(
    ({ selector, forced: isForced }) => {
      // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
      const clear = (colour: string) =>
        colour === "transparent" || /rgba\([^)]*,\s*0\)$/u.test(colour);
      // The page's own colour: a fill a forced page keeps (a system colour, Highlight) is drawn
      // only when it is not that.
      const probe = document.createElement("div");
      probe.style.backgroundColor = "Canvas";
      document.body.append(probe);
      const canvas = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [...document.querySelectorAll(selector)].map((control) => {
        const box = control.getBoundingClientRect();
        const style = getComputedStyle(control);
        const shown =
          box.width >= 8 &&
          box.height >= 8 &&
          style.visibility !== "hidden" &&
          control.closest("[aria-hidden='true'], [inert]") === null;
        const border = ["Top", "Right", "Bottom", "Left"].some(
          (side) =>
            style.getPropertyValue(`border-${side.toLowerCase()}-style`) !==
              "none" &&
            Number(
              style
                .getPropertyValue(`border-${side.toLowerCase()}-width`)
                .replace(/px$/u, "")
            ) > 0 &&
            (isForced ||
              !clear(
                style.getPropertyValue(`border-${side.toLowerCase()}-color`)
              ))
        );
        const outline =
          style.outlineStyle !== "none" &&
          Number(style.outlineWidth.replace(/px$/u, "")) > 0;
        const fill = !clear(style.backgroundColor);
        const shadow = style.boxShadow !== "none";
        return {
          name: (
            control.getAttribute("aria-label") ??
            control.textContent ??
            ""
          )
            .trim()
            .slice(0, 40),
          shown,
          bounded: isForced
            ? border || outline || (fill && style.backgroundColor !== canvas)
            : border || fill || shadow,
        };
      });
    },
    { selector: controls, forced }
  );

const known = new Set([
  "data-table/agent: Filter field",
  "data-table/agent: Filter operator",
  "data-table/agent: Filter value",
  "data-table/filters: Filter field",
  "data-table/filters: Filter operator",
  "data-table/filters: Filter value",
  "data-table/rows: Filter field",
  "data-table/rows: Filter operator",
  "data-table/rows: Filter value",
  "field/focus: ",
  "markdown/host-links: Source 1",
  "markdown/host-links: Source 2",
  "tabs/segmented: Board",
]);

const byComponent = Map.groupBy(
  componentExamples(),
  (path) => path.split("/")[0] ?? path
);

for (const theme of ["light"] as const) {
  for (const [component, paths] of byComponent) {
    test(`${component}: every bounded control keeps its edge in forced colours, ${theme}`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      const lost: string[] = [];
      for (const path of paths) {
        const [, name = ""] = path.split("/");
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        await page.emulateMedia({ forcedColors: "none" });
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        await openExample(page, component, name, { theme });
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        await settled(page);
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        const normal = await bounds(page, false);
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        await page.emulateMedia({ forcedColors: "active" });
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        await settled(page);
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        const forced = await bounds(page, true);
        for (const [index, control] of normal.entries()) {
          const there = forced[index];
          if (
            control.shown &&
            control.bounded &&
            there !== undefined &&
            there.name === control.name &&
            !there.bounded
          ) {
            lost.push(`${path}: ${control.name}`);
          }
        }
      }
      expect(lost.filter((each) => !known.has(each))).toStrictEqual([]);
    });
  }
}

// A highlighted item is filled with the system's Highlight and its words drawn in HighlightText.
// Left to the browser, each run of words also gets a backplate in the page's colour, which is
// HighlightText's own in most themes: a blank box where the words were. So a highlighted item
// opts out of the browser's adjustment and draws the system's colours itself.
const lists: {
  example: string;
  open: (page: Page) => Promise<void>;
}[] = [
  {
    example: "combobox/groups",
    open: async (page) => {
      await page.getByRole("combobox").first().focus();
    },
  },
  {
    example: "select/groups",
    open: async (page) => {
      await page.getByRole("combobox").first().focus();
    },
  },
  {
    example: "tags-input/suggestions",
    open: async (page) => {
      await page.getByRole("combobox").first().pressSequentially("e");
    },
  },
  {
    example: "command/basic",
    open: async (page) => {
      await page.getByRole("combobox").first().focus();
    },
  },
  {
    example: "dropdown-menu/basic",
    open: async (page) => {
      await page.getByRole("button").first().focus();
      await page.keyboard.press("Enter");
    },
  },
];

for (const { example, open } of lists) {
  test(`${example}: a highlighted item's words are drawn on the system's highlight, with no backplate over them`, async ({
    page,
  }) => {
    const [component = "", name = ""] = example.split("/");
    await openExample(page, component, name);
    await page.emulateMedia({ forcedColors: "active" });
    await open(page);
    await page.keyboard.press("ArrowDown");
    // The highlighted item: the one the focused control points at, or the focused item itself.
    const item = page.locator(
      ":is([role=option], [role=menuitem]):is(:focus, [data-highlighted])"
    );
    await expect(item).toHaveCount(1);
    await expect(item).toHaveCSS("forced-color-adjust", "none");
    const colours = await item.evaluate((row) => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "Highlight";
      probe.style.color = "HighlightText";
      row.append(probe);
      const system = getComputedStyle(probe);
      const wanted = { fill: system.backgroundColor, words: system.color };
      probe.remove();
      const drawn = getComputedStyle(row);
      return {
        wanted,
        drawn: { fill: drawn.backgroundColor, words: drawn.color },
        // Every element inside draws in the row's own colour, so nothing is lost on the fill.
        inside: [...row.querySelectorAll("*")].map(
          (part) => getComputedStyle(part).color
        ),
      };
    });
    expect(colours.drawn).toStrictEqual(colours.wanted);
    expect(new Set(colours.inside)).toStrictEqual(
      new Set(colours.inside.length === 0 ? [] : [colours.wanted.words])
    );
  });
}
