import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { fixedTime, openExample } from "./example.ts";

// Only Chromium has the clipboard's permissions: a context asked for them elsewhere does not open.
test.use({
  permissions: async ({ browserName }, give) => {
    await give(
      browserName === "chromium" ? ["clipboard-read", "clipboard-write"] : []
    );
  },
});

const clipboard = async (page: Page) =>
  await page.evaluate(async () => await navigator.clipboard.readText());

// The copy button is named Copy (copyButton.copy).
const COPY = "Copy";

const basicCode = `import { Badge } from "@grasp-os/ui/components/badge";

export function ReportStatus({ ready }: { ready: boolean }) {
  return <Badge variant={ready ? "success" : "default"}>{ready ? "Ready" : "Draft"}</Badge>;
}`;

test("the language's name shows over the code", async ({ page }) => {
  await openExample(page, "code-block", "basic");
  await expect(page.getByText("TSX", { exact: true })).toBeVisible();
  await expect(page.getByText("export function ReportStatus")).toBeVisible();
});

test("the block is a region named by its language, or by its title", async ({
  page,
}) => {
  await openExample(page, "code-block", "basic");
  await expect(page.getByRole("region", { name: "TSX" })).toBeVisible();
  await openExample(page, "code-block", "file");
  await expect(
    page.getByRole("region", { name: "src/reports/share.ts" })
  ).toBeVisible();
});

test("copy puts the code on the clipboard exactly and says so once", async ({
  page,
}) => {
  await openExample(page, "code-block", "basic");
  await page.getByRole("button", { name: COPY }).click();
  // Exactly the code: no line numbers, nothing added.
  await expect.poll(async () => await clipboard(page)).toBe(basicCode);
  await expect(
    page.getByRole("status").filter({ hasText: /^Copied$/u })
  ).toHaveCount(1);
});

test("the keyboard copies too", async ({ page }) => {
  await openExample(page, "code-block", "command");
  await page.getByRole("button", { name: COPY }).focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => await clipboard(page))
    .toContain("shadcn add @damsko/code-block");
});

test("a title heads it beside the language", async ({ page }) => {
  await openExample(page, "code-block", "file");
  await expect(page.getByText("src/reports/share.ts")).toBeVisible();
  await expect(page.getByText("TypeScript", { exact: true })).toBeVisible();
});

test("long code folds and unfolds by keyboard", async ({ page }) => {
  await openExample(page, "code-block", "long");
  const more = page.getByRole("button", { name: "Show more" });
  await expect(more).toHaveAttribute("aria-expanded", "false");
  const controls = await more.getAttribute("aria-controls");
  expect(controls).not.toBeNull();
  await expect(page.locator(`[id="${controls}"]`)).toContainText('"total"');
  await more.focus();
  await page.keyboard.press("Enter");
  const less = page.getByRole("button", { name: "Show less" });
  await expect(less).toHaveAttribute("aria-expanded", "true");
  await expect(less).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Show more" })).toHaveAttribute(
    "aria-expanded",
    "false"
  );
});

test("short code has no Show more", async ({ page }) => {
  await openExample(page, "code-block", "basic");
  await expect(page.getByText("export function ReportStatus")).toBeVisible();
  await expect(page.getByRole("button", { name: "Show more" })).toHaveCount(0);
});

test("while it is written the header says so and copying waits", async ({
  page,
}) => {
  await openExample(page, "code-block", "streaming", { time: fixedTime });
  // The example starts written in full, then writes it again from nothing.
  await page.clock.runFor(1100);
  await expect(
    page.getByRole("status").filter({ hasText: "Writing" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: COPY })).toBeDisabled();
});

test("at a phone's width a wide block scrolls inside itself, by keys too", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "code-block", "basic");
  // The code's own scroller: a focusable region, named as the block is.
  const code = page.getByRole("region", { name: "TSX" }).last();
  await expect(code).toHaveAttribute("tabindex", "0");
  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  );
  expect(pageWidth).toBeLessThanOrEqual(390);
  await code.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => await code.evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(0);
});

test("a block that fits takes no focus", async ({ page }) => {
  await openExample(page, "code-block", "command");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: COPY })).toBeFocused();
});

test("a change copies as the new code, its line numbers never copied", async ({
  page,
}) => {
  await openExample(page, "code-block", "diff");
  await expect(
    page.getByRole("region", { name: "src/reports/share.ts" }).first()
  ).toBeVisible();
  await expect(page.getByText("notify: true")).toBeVisible();
  await expect(
    page.getByText("await report.share({ with: team });")
  ).toBeVisible();
  await page.getByRole("button", { name: COPY }).click();
  await expect
    .poll(async () => await clipboard(page))
    .toContain('if (!report) throw new Error("No such report");');
});

test("with no header, the block is named by its label and its copy button is reached by the keyboard", async ({
  page,
}) => {
  await openExample(page, "code-block", "floating");
  await expect(
    page.getByRole("region", { name: "Install command" })
  ).toBeVisible();
  await page.keyboard.press("Tab");
  const copy = page.getByRole("button", { name: COPY });
  await expect(copy).toBeFocused();
  await expect(copy).toBeVisible();
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => await clipboard(page))
    .toBe("pnpm add @damsko/ui");
});

test("a very long output draws only the lines that show; opened, the first 2,000 and how many more", async ({
  page,
}) => {
  await openExample(page, "code-block", "output");
  await expect(page.getByText("fetched page 18 of 5000")).toBeVisible();
  await expect(page.getByText("fetched page 19 of 5000")).toHaveCount(0);
  await page.getByRole("button", { name: "Show more" }).click();
  await expect(page.getByText("fetched page 2000 of 5000")).toBeAttached();
  await expect(page.getByText("fetched page 2001 of 5000")).toHaveCount(0);
  await expect(page.getByText("3000 more lines")).toBeVisible();
});

test("when writing starts again, the code shown is the new code, never the code from before", async ({
  page,
}) => {
  await openExample(page, "code-block", "streaming");
  // The example writes its code, rests, and starts again from nothing: the first frame that says
  // it is writing again holds a few characters at most. Each frame drawn is watched as it lands.
  await page.evaluate(() => {
    const block = document.querySelector<HTMLElement>("[data-slot=code-block]");
    if (block === null) {
      return;
    }
    let writing = block.dataset.streaming !== undefined;
    let rested = false;
    const watch = new MutationObserver(() => {
      const now = block.dataset.streaming !== undefined;
      if (!now) {
        rested = true;
      } else if (!writing && rested) {
        watch.disconnect();
        document.documentElement.dataset.firstWritten = String(
          block.querySelector("code")?.textContent?.length ?? -1
        );
      }
      writing = now;
    });
    watch.observe(block, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-first-written", /\d+/u, {
    timeout: 15_000,
  });
  expect(Number(await root.getAttribute("data-first-written"))).toBeLessThan(
    10
  );
});

test("in a right-to-left page code still reads left to right from the left edge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "code-block", "basic");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  // The block, then its code that scrolls at this width.
  const code = page.getByRole("region", { name: "TSX" }).last();
  const line = page.getByText("export function ReportStatus", { exact: false });
  await expect(code).toHaveCSS("direction", "ltr");
  const [box, words] = await Promise.all([
    code.boundingBox(),
    line.boundingBox(),
  ]);
  expect(box).not.toBeNull();
  expect(words).not.toBeNull();
  if (box !== null && words !== null) {
    expect(words.x).toBeGreaterThanOrEqual(box.x);
    expect(words.x).toBeLessThan(box.x + box.width / 3);
  }
});

declare global {
  interface Window {
    longTasks?: number[];
    frameGaps?: number[];
  }
}

/**
 * The page's long tasks, where the browser reports them (Chromium), and the time between its
 * frames, from `fromNow` on.
 */
const watchLongTasks = async (page: Page) => {
  await page.addInitScript(() => {
    window.longTasks = [];
    window.frameGaps = [];
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.longTasks?.push(entry.duration);
        }
      }).observe({ type: "longtask" });
    } catch {
      // Not reported here.
    }
    let last = performance.now();
    const frame = (now: number) => {
      window.frameGaps?.push(now - last);
      last = now;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
};

const fromNow = async (page: Page) => {
  await page.evaluate(() => {
    window.longTasks = [];
    window.frameGaps = [];
  });
};

const longestTask = async (page: Page) =>
  Math.max(0, ...(await page.evaluate(() => window.longTasks ?? [])));

/** How many frames there were since `fromNow`, and how many took longer than 50 ms. */
const framesSince = async (page: Page) => {
  const gaps = await page.evaluate(() => window.frameGaps ?? []);
  return { all: gaps.length, slow: gaps.filter((gap) => gap > 50).length };
};

/** Whether a run of the code has a colour of its own: drawn in another colour than its line. */
const isColoured = async (run: Locator) =>
  (await run.count()) > 0 &&
  (await run
    .first()
    .evaluate(
      (node) =>
        node.parentElement !== null &&
        getComputedStyle(node).color !==
          getComputedStyle(node.parentElement).color
    ));

/** How many runs of a block's code are drawn in a colour of their own. */
const colouredRuns = async (block: Locator) =>
  await block
    .locator("[data-slot=code-block-line] > span:nth-child(2) > span")
    .count();

/** How many of the page's workers have been started and stopped, as it goes. */
const countWorkers = (page: Page) => {
  const workers = { started: 0, stopped: 0 };
  page.on("worker", (worker) => {
    workers.started += 1;
    worker.on("close", () => {
      workers.stopped += 1;
    });
  });
  return workers;
};

// One TypeScript line Prism takes seconds over (one match of a grammar's over the whole string),
// then an ordinary one.
const longLine = `const report = "${"x".repeat(50_000)}";`;
const slowCode = `${longLine}\nconst total = 1;`;

/** A file of this repository's, ordinary code. */
const fileOf = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf-8");

test("Prism reads the code in a worker, never on the page", async ({
  page,
}) => {
  await openExample(page, "code-block", "basic");
  const block = page.getByRole("region", { name: "TSX" });
  await expect
    .poll(
      async () => await isColoured(block.getByText("export", { exact: true }))
    )
    .toBe(true);
  expect(await page.evaluate(() => "Prism" in globalThis)).toBe(false);
});

test("code Prism cannot read in time stays plain and whole, and never holds the page", async ({
  page,
}) => {
  await watchLongTasks(page);
  const workers = countWorkers(page);
  await openExample(page, "code-block", "any");
  await page.getByLabel("Code").fill(slowCode);
  await page.getByRole("button", { name: "Show", exact: true }).click();
  const block = page.getByRole("region", { name: "TSX" });
  await expect(block.getByText(longLine, { exact: true })).toBeVisible();
  // From the code drawn as text, while Prism reads it.
  await fromNow(page);
  // The worker is stopped when its time is up.
  await expect.poll(() => workers.stopped, { timeout: 15_000 }).toBe(1);
  await expect(
    block.getByText("const total = 1;", { exact: true })
  ).toBeVisible();
  // Plain: no word is a run of its own.
  await expect(block.getByText("const", { exact: true })).toHaveCount(0);
  // Read on the page, Prism would hold it for seconds.
  expect(await longestTask(page)).toBeLessThan(50);
  // The next code is read by a new worker, and coloured.
  await page.getByLabel("Code").fill("export const total = 1;");
  await page.getByRole("button", { name: "Show", exact: true }).click();
  await expect
    .poll(
      async () => await isColoured(block.getByText("export", { exact: true }))
    )
    .toBe(true);
});

test("while slow code is written the page is never held, and done, it is plain and whole", async ({
  page,
}) => {
  await watchLongTasks(page);
  const workers = countWorkers(page);
  await openExample(page, "code-block", "any");
  await page.getByLabel("Code").fill(slowCode);
  await fromNow(page);
  await page.getByRole("button", { name: "Write it out" }).click();
  // Stopped once while it is written, when a reading first takes too long, and not read again
  // until it is done; then read once more, whole, and stopped again.
  await expect.poll(() => workers.stopped, { timeout: 30_000 }).toBe(2);
  const block = page.getByRole("region", { name: "TSX" });
  await expect(block.getByText(longLine, { exact: true })).toBeVisible();
  await expect(
    block.getByText("const total = 1;", { exact: true })
  ).toBeVisible();
  await expect(block.getByText("const", { exact: true })).toHaveCount(0);
  expect(await longestTask(page)).toBeLessThan(50);
});

/**
 * `code` in `language` in the Any code example, written out (or shown, and opened whole), from
 * the press to a second after it is all there: the longest task and how many frames were slow.
 */
const drawOut = async (
  page: Page,
  code: string,
  language: string,
  how: "written" | "shown"
) => {
  await page.getByLabel("Language").fill(language);
  await page.getByLabel("Code").fill(code);
  const block = page.getByRole("region", { name: /./u }).last();
  await fromNow(page);
  if (how === "written") {
    await page.getByRole("button", { name: "Write it out" }).click();
    await expect(page.locator("[data-streaming]")).toHaveCount(0, {
      timeout: 60_000,
    });
  } else {
    await page.getByRole("button", { name: "Show", exact: true }).click();
    await page.getByRole("button", { name: "Show more" }).click();
  }
  await expect(page.getByText("Show less")).toBeVisible();
  // Long enough for a read to be answered and drawn.
  await page.waitForTimeout(1500);
  return {
    longest: await longestTask(page),
    frames: await framesSince(page),
    coloured: await colouredRuns(block),
  };
};

/**
 * `code` drawn in `language`: in Chromium with no long task, elsewhere with no more slow frames
 * than as text (Firefox and WebKit report no long tasks). Gives the runs it drew in colour.
 */
const neverHeld = async (
  page: Page,
  browserName: string,
  code: string,
  language: string,
  how: "written" | "shown"
) => {
  if (browserName === "chromium") {
    const coloured = await drawOut(page, code, language, how);
    expect(coloured.longest).toBeLessThan(50);
    return coloured.coloured;
  }
  const plain = await drawOut(page, code, "text", how);
  // A block that is new, so it opens again.
  await openExample(page, "code-block", "any");
  const coloured = await drawOut(page, code, language, how);
  // A frame in ten either way is the machine, not the page: on a loaded machine the same text
  // drawn twice differs by that much. Drawing every coloured line again each frame, as before,
  // made half the frames slow.
  expect(coloured.frames.slow).toBeLessThanOrEqual(
    plain.frames.slow + Math.ceil(coloured.frames.all / 10)
  );
  return coloured.coloured;
};

test("lines of thousands of runs written out never hold the page, and stay plain", async ({
  page,
  browserName,
}) => {
  test.setTimeout(120_000);
  await watchLongTasks(page);
  await openExample(page, "code-block", "any");
  // 199 KB, about 2,000 runs a line: past the most runs a block is coloured with.
  const code = Array.from({ length: 100 }, () => "a,".repeat(995)).join("\n");
  expect(await neverHeld(page, browserName, code, "tsx", "written")).toBe(0);
});

test("minified code shown whole never holds the page, and stays plain", async ({
  page,
  browserName,
}) => {
  test.setTimeout(120_000);
  await watchLongTasks(page);
  await openExample(page, "code-block", "any");
  // 200 KB of React's minified build, wrapped at 200 columns.
  const minified = fileOf(
    "node_modules/react-dom/cjs/react-dom-client.production.js"
  )
    .replaceAll("\n", " ")
    .slice(0, 200_000);
  const code = minified.match(/.{1,200}/gu)?.join("\n") ?? "";
  expect(await neverHeld(page, browserName, code, "js", "shown")).toBe(0);
});

test("a long file written out never holds the page, and done, it is coloured", async ({
  page,
  browserName,
}) => {
  test.setTimeout(120_000);
  await watchLongTasks(page);
  await openExample(page, "code-block", "any");
  // 500 lines and more of ordinary code: each line coloured once, never again while more comes.
  const code = fileOf("src/components/dialog.tsx");
  expect(
    await neverHeld(page, browserName, code, "tsx", "written")
  ).toBeGreaterThan(1000);
});

/** Adds a block of `code` to the Many blocks example, `times` times. */
const addBlocks = async (page: Page, code: string, times = 1) => {
  await page.getByLabel("Code").fill(code);
  for (let added = 0; added < times; added += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one block after the other
    await page.getByRole("button", { name: "Add a block" }).click();
  }
};

test("on a page of slow blocks, an ordinary one on the screen is coloured within a second and a half", async ({
  page,
}) => {
  await openExample(page, "code-block", "many");
  await addBlocks(page, slowCode, 10);
  await addBlocks(page, "export const total = 1;");
  const block = page.getByRole("region", { name: "Block 11" });
  await block.scrollIntoViewIfNeeded();
  const appeared = Date.now();
  await expect
    .poll(
      async () => await isColoured(block.getByText("export", { exact: true })),
      { timeout: 5000 }
    )
    .toBe(true);
  expect(Date.now() - appeared).toBeLessThan(1500);
});

test("blocks that are gone are no longer read", async ({ page }) => {
  await openExample(page, "code-block", "many");
  await addBlocks(page, slowCode, 10);
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Remove all" }).click();
  await addBlocks(page, "export const total = 1;");
  const added = Date.now();
  const block = page.getByRole("region", { name: "Block 1" });
  await expect
    .poll(
      async () => await isColoured(block.getByText("export", { exact: true })),
      { timeout: 5000 }
    )
    .toBe(true);
  expect(Date.now() - added).toBeLessThan(1500);
});

test("the worker stops once no block is left on the page", async ({ page }) => {
  const workers = countWorkers(page);
  await openExample(page, "code-block", "many");
  await addBlocks(page, "export const total = 1;");
  const block = page.getByRole("region", { name: "Block 1" });
  await expect
    .poll(
      async () => await isColoured(block.getByText("export", { exact: true }))
    )
    .toBe(true);
  expect(workers).toStrictEqual({ started: 1, stopped: 0 });
  await page.getByRole("button", { name: "Remove all" }).click();
  await expect.poll(() => workers.stopped, { timeout: 5000 }).toBe(1);
  // A new block starts it again.
  await addBlocks(page, "export const total = 1;");
  await expect
    .poll(
      async () => await isColoured(block.getByText("export", { exact: true }))
    )
    .toBe(true);
  expect(workers.started).toBe(2);
});
