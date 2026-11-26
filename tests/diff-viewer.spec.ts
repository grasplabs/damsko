import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { liveRegion, openExample, tokenColour } from "./example.ts";

test("a unified diff is a table of lines, its columns named", async ({
  page,
}) => {
  await openExample(page, "diff-viewer", "unified");
  const table = page.getByRole("table", { name: "invoice.ts" });
  await expect(table).toBeVisible();
  await Promise.all(
    ["Line before", "Line after", "Change", "Text"].map(async (name) => {
      await expect(table.getByRole("columnheader", { name })).toHaveCount(1);
    })
  );
  await expect(page.getByRole("region", { name: "invoice.ts" })).toBeVisible();
});

test("added and removed are said in words, not only in colour", async ({
  page,
}) => {
  await openExample(page, "diff-viewer", "unified");
  const table = page.getByRole("table", { name: "invoice.ts" });
  // The header's counts, said: +7 −5 is drawn.
  await expect(page.getByText("7 lines added, 5 removed")).toBeAttached();
  await expect(
    table.getByRole("cell", { name: "Added", exact: true })
  ).toHaveCount(7);
  await expect(
    table.getByRole("cell", { name: "Removed", exact: true })
  ).toHaveCount(5);
});

test("line numbers are never selected with the code", async ({ page }) => {
  await openExample(page, "diff-viewer", "unified");
  const row = page
    .getByRole("row")
    .filter({ hasText: 'currency: "GBP" | "EUR";' });
  const number = row.getByRole("cell").nth(1);
  await expect(number).toHaveText("7");
  expect(
    await number.evaluate((cell) => getComputedStyle(cell).userSelect)
  ).toBe("none");
});

test("a folded run opens in place, and by keys focus stays in the diff", async ({
  page,
}) => {
  await openExample(page, "diff-viewer", "unified");
  const fold = page.getByRole("button", {
    name: /^Show \d+ unchanged lines$/u,
  });
  const before = await page.getByRole("row").count();
  await fold.first().focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => await page.getByRole("row").count())
    .toBeGreaterThan(before);
  const diff = page.getByRole("region", { name: "invoice.ts" });
  await expect
    .poll(
      async () =>
        await diff.evaluate(
          (node) =>
            document.activeElement !== null &&
            document.activeElement !== document.body &&
            node.contains(document.activeElement)
        )
    )
    .toBe(true);
});

test("side by side, the columns are before and after", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "diff-viewer", "split");
  const table = page.getByRole("table", { name: "invoice.ts" });
  await expect(table.getByRole("columnheader", { name: "Before" })).toHaveCount(
    1
  );
  await expect(table.getByRole("columnheader", { name: "After" })).toHaveCount(
    1
  );
});

test("the view switches between unified and side by side", async ({ page }) => {
  await openExample(page, "diff-viewer", "view");
  const table = page.getByRole("table", { name: "invoice.ts" });
  await expect(
    table.getByRole("columnheader", { name: "Line before" })
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Split" }).click();
  await expect(table.getByRole("columnheader", { name: "Before" })).toHaveCount(
    1
  );
  await expect(
    table.getByRole("columnheader", { name: "Line before" })
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Unified" }).click();
  await expect(
    table.getByRole("columnheader", { name: "Line before" })
  ).toHaveCount(1);
});

test("a review takes an answer, says it, and Undo puts it back", async ({
  page,
}) => {
  await openExample(page, "diff-viewer", "review");
  const accept = page.getByRole("button", { name: "Accept" }).first();
  await accept.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Accepted").first()).toBeVisible();
  await expect(
    liveRegion(page).filter({ hasText: "Change 1 accepted" })
  ).toHaveCount(1);
  const undo = page.getByRole("button", { name: "Undo" }).first();
  await expect(undo).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Accept" }).first()
  ).toBeFocused();
});

test("prose marks what was taken out and put in, each said", async ({
  page,
}) => {
  await openExample(page, "diff-viewer", "prose");
  const region = page.getByRole("region", { name: "Order email" });
  await expect(region.getByRole("insertion").first()).toContainText("Added:");
  await expect(region.getByRole("deletion").first()).toContainText("Removed:");
});

test("a long diff draws only the rows in view", async ({ page }) => {
  await openExample(page, "diff-viewer", "long");
  const table = page.getByRole("table", { name: "items.ts" });
  const rows = Number(await table.getAttribute("aria-rowcount"));
  expect(rows).toBeGreaterThan(400);
  expect(await table.getByRole("row").count()).toBeLessThan(200);
});

test("several files: a total, and each file named by its path", async ({
  page,
}) => {
  await openExample(page, "diff-viewer", "basic");
  await expect(page.getByText("3 files changed")).toBeVisible();
  await Promise.all(
    [
      "apps/web/src/routes/index.tsx",
      "apps/web/src/server/expenses.ts",
      "apps/web/src/data/mock-expenses.ts",
    ].map(async (path) => {
      // The file, and inside it its lines, are each named by its path.
      await expect(
        page.getByRole("region", { name: path, exact: true }).first()
      ).toBeVisible();
    })
  );
  const added = page
    .getByRole("region", { name: "apps/web/src/server/expenses.ts" })
    .first();
  await expect(added.getByText("Added", { exact: true }).first()).toBeVisible();
  // A hunk's header is said in words, its @@ hidden.
  await expect(
    page
      .getByRole("region", { name: "apps/web/src/data/mock-expenses.ts" })
      .first()
      .getByText("Lines 1 to 5 before, no lines after")
  ).toBeAttached();
});

test("a big file opens folded; its header opens and folds it by keys", async ({
  page,
}) => {
  await openExample(page, "diff-viewer", "folded");
  const file = page
    .getByRole("region", { name: "apps/web/src/data/seed.ts" })
    .first();
  const header = file.getByRole("button", { name: /seed\.ts/u });
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await header.focus();
  await page.keyboard.press("Enter");
  await expect(header).toHaveAttribute("aria-expanded", "true");
  await expect(file.getByRole("table")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(header).toHaveAttribute("aria-expanded", "false");
});

test("at a phone's width the page never scrolls sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "diff-viewer", "basic");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390);
});

/** A diff's runs of code drawn in a colour of their own whose text is `text`. */
const runOf = (table: Locator, text: RegExp) =>
  table.locator("[data-diff-code] span:not(:has(span))", { hasText: text });

/** The colour a run is drawn in. */
const colourOf = async (run: Locator) =>
  await run.first().evaluate((node) => getComputedStyle(node).color);

for (const theme of ["light", "dark"] as const) {
  test(`code takes Damsko's syntax colours, inside a changed word's mark too, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "diff-viewer", "unified", { theme });
    const table = page.getByRole("table", { name: "invoice.ts" });
    const keyword = runOf(table, /^export\b/u);
    const syntaxKeyword = await tokenColour(page, "--damsko-syntax-keyword");
    await expect.poll(async () => await colourOf(keyword)).toBe(syntaxKeyword);
    expect(await colourOf(runOf(table, /"Your invoice is due"/u))).toBe(
      await tokenColour(page, "--damsko-syntax-string")
    );
    // ", days = 30" was put into the line: one mark, and its number in its colour inside it.
    const row = table
      .getByRole("row")
      .filter({ hasText: "dueDate(issued: Date, days = 30)" });
    const number = runOf(row, /^30$/u);
    expect(await colourOf(number)).toBe(
      await tokenColour(page, "--damsko-syntax-constant")
    );
    expect(
      await number
        .first()
        .evaluate((node) =>
          node.parentElement === null
            ? ""
            : getComputedStyle(node.parentElement).backgroundColor
        )
    ).toBe(
      await page.evaluate(() => {
        const probe = document.createElement("span");
        probe.style.backgroundColor = "var(--damsko-diff-viewer-added-word)";
        document.body.append(probe);
        const { backgroundColor } = getComputedStyle(probe);
        probe.remove();
        return backgroundColor;
      })
    );
  });
}

test("in forced colours every run of code is drawn in the system's colour", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await openExample(page, "diff-viewer", "unified");
  const table = page.getByRole("table", { name: "invoice.ts" });
  // Coloured: the keyword is a run of its own.
  await expect(runOf(table, /^export\b/u).first()).toBeAttached();
  const colours = await table.evaluate(
    (node) =>
      new Set(
        [
          ...node.querySelectorAll("[data-diff-code], [data-diff-code] span"),
        ].map((each) => getComputedStyle(each).color)
      ).size
  );
  expect(colours).toBe(1);
});

test("files are coloured in the language their extension names", async ({
  page,
}) => {
  await openExample(page, "diff-viewer", "basic");
  const file = page
    .getByRole("table", { name: "apps/web/src/server/expenses.ts" })
    .first();
  await expect
    .poll(async () => await colourOf(runOf(file, /^export\b/u)))
    .toBe(await tokenColour(page, "--damsko-syntax-keyword"));
});

test("a selection across lines copies the code alone: no numbers, marks or words said", async ({
  page,
}) => {
  await openExample(page, "diff-viewer", "unified");
  // Coloured first: the selection crosses the runs, not plain text.
  const table = page.getByRole("table", { name: "invoice.ts" });
  await expect
    .poll(async () => await colourOf(runOf(table, /^export\b/u)))
    .toBe(await tokenColour(page, "--damsko-syntax-keyword"));
  const code = (text: string) =>
    page.getByRole("row").filter({ hasText: text }).locator("[data-diff-code]");
  const from = await code(
    "export function dueDate(issued: Date): Date {"
  ).boundingBox();
  const to = await code("due.setDate(due.getDate() + days);").boundingBox();
  if (from === null || to === null) {
    throw new Error("the rows are not drawn");
  }
  await page.mouse.move(from.x + 1, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width - 2, to.y + to.height / 2, {
    steps: 5,
  });
  await page.mouse.up();
  expect(await page.evaluate(() => getSelection()?.toString())).toBe(
    [
      "export function dueDate(issued: Date): Date {",
      "export function dueDate(issued: Date, days = 30): Date {",
      "  const due = new Date(issued);",
      "  due.setDate(due.getDate() + 30);",
      "  due.setDate(due.getDate() + days);",
    ].join("\n")
  );
});

test("5,000 lines with 300 changed are compared, drawn and coloured with no long frame", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.longTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.longTasks?.push(entry.duration);
      }
    }).observe({ type: "longtask", buffered: true });
  });
  await openExample(page, "diff-viewer", "long");
  const table = page.getByRole("table", { name: "items.ts" });
  await expect
    .poll(async () => await colourOf(runOf(table, /^"Item 26 \(refill\)"$/u)))
    .toBe(await tokenColour(page, "--damsko-syntax-string"));
  await expect(page.getByText("200 lines added, 100 removed")).toBeAttached();
  // Measured at 0 long tasks locally (a task over 50 ms); a slow runner gets room.
  const longest = Math.max(
    0,
    ...(await page.evaluate(() => window.longTasks ?? []))
  );
  expect(longest).toBeLessThan(250);
});

test("a diff with no language never loads the lexers; one with a language does", async ({
  page,
}) => {
  /** How many of the scripts the page has loaded are the highlighter's core. */
  const lexers = async () => {
    await page.waitForLoadState("networkidle");
    const scripts = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => name.endsWith(".js"))
    );
    const texts = await Promise.all(
      scripts.map(async (url) => {
        const response = await page.request.get(url);
        return await response.text();
      })
    );
    return texts.filter((text) =>
      text.includes("highlights is not initialized")
    ).length;
  };
  await openExample(page, "diff-viewer", "states");
  expect(await lexers()).toBe(0);
  await openExample(page, "diff-viewer", "unified");
  expect(await lexers()).toBe(1);
});

declare global {
  interface Window {
    longTasks?: number[];
  }
}

/** Where an element's top stands on the screen. */
const topOf = async (element: Locator) => {
  const box = await element.boundingBox();
  return box?.y ?? Number.NaN;
};

test.describe("many files", () => {
  test("only the rows near the view are drawn; every file's header and row count are there", async ({
    page,
  }) => {
    await openExample(page, "diff-viewer", "many");
    const list = page.getByRole("region", { name: "Changed files" });
    await expect(page.getByText("60 files changed")).toBeVisible();
    await expect(
      list.getByRole("button", { name: /step-\d{3}\.ts/u })
    ).toHaveCount(60);
    const tables = list.getByRole("table");
    await expect(tables).toHaveCount(60);
    const counted = await tables.evaluateAll((all) =>
      all.reduce(
        (sum, table) => sum + Number(table.getAttribute("aria-rowcount")) - 1,
        0
      )
    );
    expect(counted).toBeGreaterThan(1200);
    expect(await list.getByRole("row").count()).toBeLessThan(400);
    // The last file, out of reach, draws no rows yet: its table is only the room they take.
    const last = list.getByRole("table", { name: "src/steps/step-060.ts" });
    await expect(last.locator("[data-diff-code]")).toHaveCount(0);
  });

  test("a file's rows are a table: column headers, and each drawn row at its place in the count", async ({
    page,
  }) => {
    await openExample(page, "diff-viewer", "many");
    const table = page.getByRole("table", { name: "src/steps/step-001.ts" });
    await expect(table.getByRole("columnheader")).toHaveCount(4);
    const count = Number(await table.getAttribute("aria-rowcount"));
    // Row 1 is the column headers; the lines are 2 onwards.
    const places = await table
      .locator("[role=row]:has([data-diff-code])")
      .evaluateAll((rows) =>
        rows.map((row) => Number(row.getAttribute("aria-rowindex")))
      );
    expect(places.length).toBeGreaterThan(0);
    expect(places).toStrictEqual(places.toSorted((a, b) => a - b));
    expect(Math.min(...places)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...places)).toBeLessThanOrEqual(count);
  });

  test("scrolled to a file far down, its rows are drawn and coloured", async ({
    page,
  }) => {
    await openExample(page, "diff-viewer", "many");
    const header = page.getByRole("button", { name: /step-050\.ts/u });
    await header.scrollIntoViewIfNeeded();
    const table = page.getByRole("table", { name: "src/steps/step-050.ts" });
    await expect(table.getByRole("row").nth(3)).toBeVisible();
    await expect
      .poll(async () => await colourOf(runOf(table, /^export\b/u)))
      .toBe(await tokenColour(page, "--damsko-syntax-keyword"));
  });

  test("by keys, the files' headers come in order, past the first screen", async ({
    page,
  }) => {
    await openExample(page, "diff-viewer", "many");
    await page.getByRole("button", { name: /step-001\.ts/u }).focus();
    const seen: string[] = [];
    for (let press = 0; press < 400 && seen.length < 30; press += 1) {
      // oxlint-disable-next-line no-await-in-loop -- one key after the other
      await page.keyboard.press("Tab");
      // oxlint-disable-next-line no-await-in-loop -- one key after the other
      const name = await page.evaluate(() => {
        const focused = document.activeElement;
        return focused?.matches("[data-slot=diff-viewer-file-header]") === true
          ? (/step-(?<at>\d{3})/u.exec(focused.textContent ?? "")?.groups?.at ??
              "")
          : "";
      });
      if (name !== "") {
        seen.push(name);
      }
    }
    expect(seen).toStrictEqual(
      Array.from({ length: 30 }, (_, at) => String(at + 2).padStart(3, "0"))
    );
  });

  test("closing files above brings the next files' rows into view, drawn", async ({
    page,
  }) => {
    await openExample(page, "diff-viewer", "many");
    const list = page.getByRole("region", { name: "Changed files" });
    for (const at of ["021", "022", "023"]) {
      const header = page.getByRole("button", {
        name: new RegExp(`step-${at}\\.ts`, "u"),
      });
      // oxlint-disable-next-line no-await-in-loop -- one file after the other
      await header.scrollIntoViewIfNeeded();
      // oxlint-disable-next-line no-await-in-loop -- one file after the other
      await header.click();
      // oxlint-disable-next-line no-await-in-loop -- one file after the other
      await expect(header).toHaveAttribute("aria-expanded", "false");
    }
    // Every line row in view has its words drawn: no blank room where the rows should be.
    await expect
      .poll(
        async () =>
          await list.evaluate((scroller) => {
            const view = scroller.getBoundingClientRect();
            const blank: number[] = [];
            for (const room of scroller.querySelectorAll("[role=table]")) {
              const box = room.getBoundingClientRect();
              const top = Math.max(box.top + 40, view.top);
              const bottom = Math.min(box.bottom, view.bottom);
              if (bottom - top > 40) {
                const drawn = [
                  ...room.querySelectorAll("[data-diff-code]"),
                ].some((cell) => {
                  const at = cell.getBoundingClientRect();
                  return at.bottom > top && at.top < bottom;
                });
                if (!drawn) {
                  blank.push(Math.round(bottom - top));
                }
              }
            }
            return blank;
          })
      )
      .toStrictEqual([]);
  });

  test("a control that holds focus stays when its file is scrolled far away", async ({
    page,
  }) => {
    await openExample(page, "diff-viewer", "many");
    const file = page.getByRole("region", { name: "src/steps/step-002.ts" });
    const control = file
      .getByRole("button", { name: /^Show \d+ unchanged lines$/u })
      .first();
    await control.focus();
    await page
      .getByRole("region", { name: "Changed files" })
      .evaluate((scroller) => {
        scroller.scrollTop += scroller.clientHeight * 6;
      });
    await page.waitForTimeout(300);
    await expect(control).toBeFocused();
  });

  test("opening an unchanged run or a file moves nothing above it", async ({
    page,
  }) => {
    await openExample(page, "diff-viewer", "many");
    const header = page.getByRole("button", { name: /step-040\.ts/u });
    await header.scrollIntoViewIfNeeded();
    const file = page.getByRole("region", { name: "src/steps/step-040.ts" });
    const fold = file.getByRole("button", {
      name: /^Show \d+ unchanged lines$/u,
    });
    await fold.first().scrollIntoViewIfNeeded();
    const before = await topOf(header);
    const rows = Number(
      await file.getByRole("table").getAttribute("aria-rowcount")
    );
    await fold.first().click();
    // The run's lines are let out where it was folded; the file's header has not moved.
    await expect
      .poll(async () =>
        Number(await file.getByRole("table").getAttribute("aria-rowcount"))
      )
      .toBeGreaterThan(rows);
    expect(await topOf(header)).toBe(before);
    // Folding a file keeps its header where it is, under the pointer that pressed it.
    const next = page.getByRole("button", { name: /step-041\.ts/u });
    await next.scrollIntoViewIfNeeded();
    const place = await topOf(next);
    await next.click();
    await expect(next).toHaveAttribute("aria-expanded", "false");
    expect(await topOf(next)).toBe(place);
  });
});
