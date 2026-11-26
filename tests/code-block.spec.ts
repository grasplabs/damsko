import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { fixedTime, listenToLiveRegions, openExample } from "./example.ts";

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
  const said = await listenToLiveRegions(page);
  await openExample(page, "code-block", "basic");
  await page.getByRole("button", { name: COPY }).click();
  // Exactly the code: no line numbers, nothing added.
  await expect.poll(async () => await clipboard(page)).toBe(basicCode);
  await expect.poll(said).toContain("Copied");
  // A second time would come a message's hold (400ms) after the first.
  await page.waitForTimeout(600);
  expect(await said()).toStrictEqual(["Copied"]);
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

test("a block that never folds draws every line, past the 2,000 an opened one draws", async ({
  page,
}) => {
  await openExample(page, "code-block", "whole");
  const content = page.locator("[data-slot=code-block-content]");
  await expect(content.getByText('"id": 600,')).toBeAttached();
  await expect(content.locator("[data-slot=code-block-line]")).toHaveCount(
    3004
  );
  await expect(page.getByText(/more lines/u)).toHaveCount(0);
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
    streamed?: {
      faults: string[];
      frames: number;
      seen: number;
      done: boolean;
    };
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

/** How long the long tasks since `fromNow` blocked the page: each one's time past 50 ms. */
const blockedTime = async (page: Page) => {
  const tasks = await page.evaluate(() => window.longTasks ?? []);
  return tasks.reduce((sum, task) => sum + task - 50, 0);
};

/** How many frames there were since `fromNow`, and how many took longer than 50 ms. */
const framesSince = async (page: Page) => {
  const gaps = await page.evaluate(() => window.frameGaps ?? []);
  return { all: gaps.length, slow: gaps.filter((gap) => gap > 50).length };
};

/** The block's runs drawn in a colour of their own whose text matches `text`. */
const runOf = (block: Locator, text: RegExp) =>
  block.locator("[data-slot=code-block-line] > span:nth-child(2) > span", {
    hasText: text,
  });

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

/** A file of this repository's, ordinary code. */
const fileOf = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf-8");

/** The colour a token of Damsko's resolves to on the page: the colour a run in it must have. */
const tokenColour = async (page: Page, token: string) =>
  await page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const { color } = getComputedStyle(probe);
    probe.remove();
    return color;
  }, token);

/** The colour a run of the block's code is drawn in. */
const colourOf = async (run: Locator) =>
  await run.first().evaluate((node) => getComputedStyle(node).color);

for (const theme of ["light", "dark"] as const) {
  test(`the code takes Damsko's syntax colours, ${theme}`, async ({ page }) => {
    await openExample(page, "code-block", "file", { theme });
    const block = page.getByRole("region", { name: "src/reports/share.ts" });
    const keyword = runOf(block, /^export\b/u);
    await expect.poll(async () => await isColoured(keyword)).toBe(true);
    expect(await colourOf(keyword)).toBe(
      await tokenColour(page, "--damsko-syntax-keyword")
    );
    expect(await colourOf(runOf(block, /No such report/u))).toBe(
      await tokenColour(page, "--damsko-syntax-string")
    );
    // Every colour is a class of Damsko's: no style of the lexers' own reaches the page.
    expect(
      await block.evaluate(
        (node) =>
          node.querySelectorAll("[style*='--hls'], [class*='hls']").length
      )
    ).toBe(0);
  });
}

test("in forced colours the code is drawn in the system's colour, every run", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await openExample(page, "code-block", "basic");
  const block = page.getByRole("region", { name: "TSX" });
  // Coloured: the keyword is a run of its own.
  await expect(runOf(block, /^export\b/u)).toHaveCount(1);
  const colours = await block.evaluate(
    (node) =>
      new Set(
        [
          ...node.querySelectorAll(
            "[data-slot=code-block-line] > span:nth-child(2), [data-slot=code-block-line] > span:nth-child(2) > span"
          ),
        ].map((each) => getComputedStyle(each).color)
      ).size
  );
  expect(colours).toBe(1);
});

test("the lexers load the first time a block is drawn, never with a page that has none", async ({
  page,
}) => {
  /** How many of the scripts the page has loaded hold the lexers' WebAssembly. */
  const lexers = async () => {
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
    return texts.filter((text) => text.includes("WebAssembly.Module")).length;
  };
  await openExample(page, "button", "sizes");
  await page.waitForLoadState("networkidle");
  expect(await lexers()).toBe(0);
  await openExample(page, "code-block", "basic");
  const block = page.getByRole("region", { name: "TSX" });
  await expect
    .poll(async () => await isColoured(runOf(block, /^export\b/u)))
    .toBe(true);
  expect(await lexers()).toBe(1);
});

test("while it is written, the finished lines are coloured once and the line being written is plain, and nothing moves", async ({
  page,
}) => {
  await openExample(page, "code-block", "streaming");
  // Each frame as it lands: the last line has no coloured run; a run already drawn in a finished
  // line is the same element in every later frame; and a line, coloured or not, keeps its place
  // and its width in the block (the example centres the block, so the block itself moves).
  await page.evaluate(() => {
    const block = document.querySelector<HTMLElement>("[data-slot=code-block]");
    const seen = new Map<number, Element[]>();
    const faults: string[] = [];
    const placed = new Map<number, string>();
    let frames = 0;
    let most = 0;
    const coloured = ":scope > span:nth-child(2) > span";
    const runs = (line: Element | undefined) => [
      ...(line?.querySelectorAll(coloured) ?? []),
    ];
    const look = () => {
      if (block === null || block.dataset.streaming === undefined) {
        seen.clear();
        placed.clear();
        // A whole writing watched, from its first frame to its end.
        if (frames > 0 && window.streamed !== undefined) {
          window.streamed.done = true;
        }
        return;
      }
      frames += 1;
      const lines = [...block.querySelectorAll("[data-slot=code-block-line]")];
      if (runs(lines.at(-1)).length > 0) {
        faults.push(`last line coloured: ${lines.at(-1)?.textContent}`);
      }
      const { top } = block.getBoundingClientRect();
      for (const [at, line] of lines.entries()) {
        const box = line.children[1]?.getBoundingClientRect();
        // To the pixel: a run's own span shapes its text a hundredth of a pixel apart.
        const place = `${line.textContent} ${Math.round((box?.top ?? 0) - top)} ${Math.round(box?.width ?? 0)}`;
        const was = placed.get(at);
        if (was?.startsWith(`${line.textContent} `) === true && was !== place) {
          faults.push(`line ${at + 1} moved: ${was} → ${place}`);
        }
        placed.set(at, place);
      }
      for (const [at, line] of lines.slice(0, -1).entries()) {
        const now = runs(line);
        const before = seen.get(at);
        if (before !== undefined && before.some((run, n) => now[n] !== run)) {
          faults.push(`line ${at + 1} drawn again`);
        }
        if (now.length > 0) {
          seen.set(at, now);
        }
      }
      most = Math.max(most, seen.size);
      window.streamed = { faults, frames, seen: most, done: false };
    };
    new MutationObserver(look).observe(block ?? document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
  });
  // Written from nothing again, and done.
  await expect
    .poll(async () => await page.evaluate(() => window.streamed?.done), {
      timeout: 15_000,
    })
    .toBe(true);
  const streamed = await page.evaluate(() => window.streamed);
  expect(streamed?.frames).toBeGreaterThan(20);
  // Most of its seven lines were coloured while it was written.
  expect(streamed?.seen).toBeGreaterThan(4);
  expect(streamed?.faults).toStrictEqual([]);
});

// The research pass's hostile lines: each held Prism, Shiki or both for tens of milliseconds to
// seconds, the first Prism for ten.
const hostile: [string, string][] = [
  ["50k 'a' in a string", `"${"a".repeat(50_000)}`],
  ["50k backslashes in a template", `\`${"\\".repeat(50_000)}`],
  ["25k '/a', regex bait", "/a".repeat(25_000)],
  ["10k '<a', generic bait", "<a".repeat(10_000)],
  ["10k '('", "(".repeat(10_000)],
  ["10k '`${' nesting", "`${".repeat(10_000)],
  ["an unended /* and 50k more", `/*${"* ".repeat(25_000)}`],
  ["5k 'a?b:' ternaries", `x=${"a?b:".repeat(5000)}c`],
  ["20k '\"\\' alternating", '"\\'.repeat(20_000)],
  ["10k 'a.b<c>(' calls", `a${".b<c>(".repeat(10_000)}`],
  ["20k '=>' arrows", "a=>".repeat(20_000)],
  ["5k nested '{a:' objects", `x={${"a:{".repeat(5000)}`],
  ["20k tabs then 'x'", `${"\t".repeat(20_000)}x`],
  ["10k '\"\\u{' escapes", `"${"\\u{".repeat(10_000)}`],
];

test("hostile code is shown whole, and never holds the page", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await watchLongTasks(page);
  await openExample(page, "code-block", "any");
  const block = page.getByRole("region", { name: "TypeScript" });
  await page.getByLabel("Language").fill("ts");
  // The lexers loaded first, as on a page that has drawn a block.
  await page.getByRole("button", { name: "Show", exact: true }).click();
  await expect
    .poll(async () => await isColoured(runOf(block, /^export\b/u)))
    .toBe(true);
  for (const [name, code] of hostile) {
    // oxlint-disable-next-line no-await-in-loop -- one after the other
    await page.getByLabel("Code").fill(code);
    // oxlint-disable-next-line no-await-in-loop -- one after the other
    await fromNow(page);
    // oxlint-disable-next-line no-await-in-loop -- one after the other
    await page.getByRole("button", { name: "Show", exact: true }).click();
    // oxlint-disable-next-line no-await-in-loop -- one after the other
    await expect(block.locator("code")).toContainText(code.slice(0, 200));
    // oxlint-disable-next-line no-await-in-loop -- one after the other
    await page.waitForTimeout(200);
    // oxlint-disable-next-line no-await-in-loop -- one after the other
    expect(await longestTask(page), name).toBeLessThan(50);
  }
});

test("a folded block is coloured whatever its lines hold; opened past the most runs, it is plain", async ({
  page,
}) => {
  await openExample(page, "code-block", "any");
  // 40 lines of a coloured run at every character, each just under the longest line coloured.
  await page
    .getByLabel("Code")
    .fill(Array.from({ length: 40 }, () => "1,".repeat(124)).join("\n"));
  await page.getByRole("button", { name: "Show", exact: true }).click();
  const block = page.getByRole("region", { name: "TSX" });
  await expect
    .poll(async () => await colouredRuns(block))
    .toBeGreaterThan(4000);
  await page.getByRole("button", { name: "Show more" }).click();
  await expect(page.getByText("Show less")).toBeVisible();
  await expect.poll(async () => await colouredRuns(block)).toBe(0);
});

/**
 * `code` in `language` in the Any code example, written out (or shown, and opened whole), from
 * the press to a second after it is all there: how long long tasks blocked the page, and its frames.
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
    blocked: await blockedTime(page),
    frames: await framesSince(page),
    coloured: await colouredRuns(block),
  };
};

/**
 * `code` drawn in `language` holds the page no more than the same code as text: in Chromium, by
 * the time its long tasks block it past 50 ms each; in Firefox and WebKit, which report no long
 * tasks, by its frames over 50 ms. Gives the runs it drew in colour.
 */
const neverHeld = async (
  page: Page,
  browserName: string,
  code: string,
  language: string,
  how: "written" | "shown"
) => {
  const plain = await drawOut(page, code, "text", how);
  // A block that is new, so it opens again.
  await openExample(page, "code-block", "any");
  const coloured = await drawOut(page, code, language, how);
  if (browserName === "chromium") {
    // Drawing a thousand lines of text can itself take a task past 50 ms on a slow machine: what
    // the colours add is what counts. 100 ms is the machine's own unevenness on CI's two cores;
    // the colours drawn again each frame blocked it for seconds.
    expect(coloured.blocked).toBeLessThanOrEqual(plain.blocked + 100);
  } else {
    // A frame in ten either way is the machine, not the page: on a loaded machine the same text
    // drawn twice differs by that much. The colours drawn again each frame made half of them slow.
    expect(coloured.frames.slow).toBeLessThanOrEqual(
      plain.frames.slow + Math.ceil(coloured.frames.all / 10)
    );
  }
  return coloured.coloured;
};

test("lines of thousands of runs written out never hold the page, and stay plain", async ({
  page,
  browserName,
}) => {
  test.setTimeout(120_000);
  await watchLongTasks(page);
  await openExample(page, "code-block", "any");
  // 199 KB, about 1,000 runs a line: each line past the longest the lexers colour.
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

test("ordinary code of nearly the most runs shown whole never holds the page, and is coloured", async ({
  page,
  browserName,
}) => {
  test.setTimeout(120_000);
  await watchLongTasks(page);
  await openExample(page, "code-block", "any");
  // 1,400 lines, just under 5,000 coloured runs: as many as a block opened whole is coloured with.
  const code = fileOf("src/components/prompt-input.tsx")
    .split("\n")
    .slice(0, 1400)
    .join("\n");
  expect(
    await neverHeld(page, browserName, code, "tsx", "shown")
  ).toBeGreaterThan(4000);
});
