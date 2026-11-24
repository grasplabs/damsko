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
  }
}

/** The page's long tasks, where the browser reports them (Chromium), from `fromNow` on. */
const watchLongTasks = async (page: Page) => {
  await page.addInitScript(() => {
    window.longTasks = [];
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.longTasks?.push(entry.duration);
        }
      }).observe({ type: "longtask" });
    } catch {
      // Not reported here.
    }
  });
};

const fromNow = async (page: Page) => {
  await page.evaluate(() => {
    window.longTasks = [];
  });
};

const longestTask = async (page: Page) =>
  Math.max(0, ...(await page.evaluate(() => window.longTasks ?? [])));

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

/** How many of the page's workers have been stopped, as it goes. */
const countStopped = (page: Page) => {
  const stopped = { count: 0 };
  page.on("worker", (worker) => {
    worker.on("close", () => {
      stopped.count += 1;
    });
  });
  return stopped;
};

// One TypeScript line Prism takes seconds over (one match of a grammar's over the whole string),
// then an ordinary one.
const longLine = `const report = "${"x".repeat(50_000)}";`;
const slowCode = `${longLine}\nconst total = 1;`;

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
  const stopped = countStopped(page);
  await openExample(page, "code-block", "any");
  await page.getByLabel("Code").fill(slowCode);
  await fromNow(page);
  await page.getByRole("button", { name: "Show", exact: true }).click();
  // The worker is stopped when its time is up.
  await expect.poll(() => stopped.count, { timeout: 15_000 }).toBe(1);
  const block = page.getByRole("region", { name: "TSX" });
  await expect(block.getByText(longLine, { exact: true })).toBeVisible();
  await expect(
    block.getByText("const total = 1;", { exact: true })
  ).toBeVisible();
  // Plain: no word is a run of its own.
  await expect(block.getByText("const", { exact: true })).toHaveCount(0);
  // Read on the page, Prism would hold it for seconds.
  expect(await longestTask(page)).toBeLessThan(500);
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
  const stopped = countStopped(page);
  await openExample(page, "code-block", "any");
  await page.getByLabel("Code").fill(slowCode);
  await fromNow(page);
  await page.getByRole("button", { name: "Write it out" }).click();
  // Stopped once while it is written, when a reading first takes too long, and not read again
  // until it is done; then read once more, whole, and stopped again.
  await expect.poll(() => stopped.count, { timeout: 30_000 }).toBe(2);
  const block = page.getByRole("region", { name: "TSX" });
  await expect(block.getByText(longLine, { exact: true })).toBeVisible();
  await expect(
    block.getByText("const total = 1;", { exact: true })
  ).toBeVisible();
  await expect(block.getByText("const", { exact: true })).toHaveCount(0);
  expect(await longestTask(page)).toBeLessThan(500);
});
test("where the page's policy refuses workers, the code is plain and whole", async ({
  page,
}) => {
  await page.route(
    (url) => url.pathname.startsWith("/examples/"),
    async (route) => {
      if (route.request().resourceType() !== "document") {
        await route.fallback();
        return;
      }
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          "content-security-policy": "worker-src 'none'",
        },
      });
    }
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      document.documentElement.dataset.refused = event.effectiveDirective;
    });
  });
  await openExample(page, "code-block", "basic");
  // The worker was asked for, and refused.
  await expect(page.locator("html")).toHaveAttribute(
    "data-refused",
    "worker-src"
  );
  const block = page.getByRole("region", { name: "TSX" });
  await expect(
    block.getByText(
      "export function ReportStatus({ ready }: { ready: boolean }) {",
      { exact: true }
    )
  ).toBeVisible();
  await expect(block.getByText("export", { exact: true })).toHaveCount(0);
  expect(errors).toStrictEqual([]);
});
