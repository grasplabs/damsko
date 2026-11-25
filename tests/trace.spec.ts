import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import {
  drawnParts,
  hasFocusRing,
  listenToLiveRegions,
  openExample,
  paintedBox,
  startsOf,
  tab,
} from "./example.ts";

test("each step says its status in words, not only by its mark", async ({
  page,
}) => {
  await openExample(page, "trace", "steps");
  const line = (title: string) =>
    page.getByText(title, { exact: true }).locator("..");
  await expect(line("Failed to open win-loss notes.md")).toContainText(
    "Failed"
  );
  await expect(line("Share the brief with the team")).toContainText("Waiting");
  // The running title shimmers: its words are drawn twice, once for the eye only.
  await expect(page.getByText(", Working", { exact: true })).toHaveCount(1);
  await expect(line("Searched the web")).toContainText("12 results");
});

test("a row's line opens and closes it, and says so with aria-expanded", async ({
  page,
}) => {
  await openExample(page, "trace", "commit");
  const row = page.getByRole("button", { name: /Committed a1b2c3/u });
  const file = page.getByRole("button", { name: /redirect\.ts/u });
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(file).toBeVisible();
  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "false");
  await expect(file).toBeHidden();
  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(file).toBeVisible();
});

test("the keyboard reaches a row with a ring; Enter closes and Space opens", async ({
  page,
}) => {
  await openExample(page, "trace", "commit");
  const row = page.getByRole("button", { name: /Committed a1b2c3/u });
  await page.keyboard.press("Tab");
  await expect(row).toBeFocused();
  expect(await hasFocusRing(row)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(row).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Space");
  await expect(row).toHaveAttribute("aria-expanded", "true");
});

test("rows open inside rows: a commit opens on its files, and a file on its diff", async ({
  page,
}) => {
  await openExample(page, "trace", "commit");
  const commit = page.getByRole("button", { name: /Committed a1b2c3/u });
  await expect(commit).toHaveAttribute("aria-expanded", "true");
  const file = page.getByRole("button", {
    name: /^Added lib\/auth\/redirect\.ts\s*, \+2 −0$/u,
  });
  await expect(file).toHaveAttribute("aria-expanded", "false");
  await file.click();
  await expect(file).toHaveAttribute("aria-expanded", "true");
});

for (const dir of ["ltr", "rtl"]) {
  test(`a row inside a row stands in by its padding: its fill from the parent's mark, whole under the pointer and with its ring, ${dir}`, async ({
    page,
    browserName,
  }) => {
    await openExample(page, "trace", "commit");
    await page.evaluate((direction) => {
      document.documentElement.dir = direction;
    }, dir);
    const commit = page.getByRole("button", { name: /^Committed a1b2c3/u });
    const file = page.getByRole("button", { name: /^Edited app\/login/u });
    await file.click();
    const parent = await startsOf(commit);
    const nested = await startsOf(file);
    // The parent's fill reaches past its words by its padding; its panel starts on its words.
    const room = parent.mark - parent.box;
    expect(room).toBeCloseTo(8, 0);
    expect(parent.panel).toBeCloseTo(parent.mark, 0);
    // The nested row's fill starts under the parent's mark; its mark, and its panel, a step in.
    expect(nested.box).toBeCloseTo(parent.mark, 0);
    expect(nested.mark - nested.box).toBeCloseTo(room, 0);
    expect(nested.panel).toBeCloseTo(nested.mark, 0);
    const whole = { left: 0, top: 0, right: 0, bottom: 0, squareCorners: 0 };
    // Under the pointer the fill fades in, and out again when it leaves: each is read once it stands.
    await file.hover();
    await expect.poll(async () => await paintedBox(file)).toMatchObject(whole);
    await page.mouse.move(0, 0);
    await commit.focus();
    await page.keyboard.press(tab(browserName));
    await expect(file).toBeFocused();
    expect(await hasFocusRing(file)).toBe(true);
    await expect.poll(async () => await paintedBox(file)).toMatchObject(whole);
  });
}

test("a step that finishes is said once; one that starts is not", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "trace", "live");
  await expect(page.getByText("Searching the web").first()).toBeVisible();
  const next = page.getByRole("button", { name: "Next" });
  await next.click();
  await expect(
    page.getByText("Reading pricing-2026.pdf").first()
  ).toBeVisible();
  await next.click();
  await expect(
    page.getByText("Writing pricing-brief.md").first()
  ).toBeVisible();
  await expect
    .poll(said)
    .toStrictEqual(["Searched the web", "Read pricing-2026.pdf"]);
});

// The script example's lines, straight in its Trace and in the Trace nested under its row.
interface Line {
  id: string;
  title: string;
  status?: "running" | "error" | "pending";
}

const openScript = async (page: Page) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "trace", "script");
  await page.waitForFunction(() => window.traceScript !== undefined);
  const set = async (outer: Line[], inner: Line[]) => {
    await page.evaluate(
      (lines) => {
        window.traceScript?.set(lines);
      },
      { outer, inner }
    );
  };
  return { said, set };
};

const brief: Line = { id: "brief", title: "Read the brief" };
const searching: Line = {
  id: "search",
  title: "Searching the web",
  status: "running",
};
const pricing: Line = { id: "pricing", title: "Read pricing-2026.pdf" };
const reading: Line = {
  id: "notes",
  title: "Reading win-loss notes.md",
  status: "running",
};

test("nothing is said when the page opens, running or done", async ({
  page,
}) => {
  const { said } = await openScript(page);
  await expect(page.getByText("Read 2 files")).toBeVisible();
  expect(await said()).toStrictEqual([]);
});

test("a line added without a status, or already done, is silent, in a Trace and nested", async ({
  page,
}) => {
  const { said, set } = await openScript(page);
  const todo = { id: "todo", title: "Share the brief with the team" };
  const done = { id: "chart", title: "Made a chart" };
  await set([brief, searching, todo, done], [pricing, reading, todo, done]);
  await expect(
    page.getByText("Share the brief with the team", { exact: true })
  ).toHaveCount(2);
  // A change that is news, after them, is the first thing said.
  await set(
    [brief, searching, todo, done],
    [pricing, { ...reading, status: "error" }, todo, done]
  );
  await expect.poll(said).toStrictEqual(["Reading win-loss notes.md, Failed"]);
});

test("a section that first shows is silent, its lines and its row alike", async ({
  page,
}) => {
  const { said, set } = await openScript(page);
  await set([brief, searching], []);
  await expect(page.getByText("Read 2 files")).toHaveCount(0);
  await set([brief, searching], [pricing, { ...reading, status: undefined }]);
  await expect(page.getByText("Read 2 files")).toBeVisible();
  await set([brief, { id: "search", title: "Searched the web" }], []);
  await expect.poll(said).toStrictEqual(["Searched the web"]);
});

test("a running line that finishes is said once, in a Trace and nested", async ({
  page,
}) => {
  const { said, set } = await openScript(page);
  await set(
    [brief, { id: "search", title: "Searched the web" }],
    [pricing, reading]
  );
  await expect.poll(said).toStrictEqual(["Searched the web"]);
  await set(
    [brief, { id: "search", title: "Searched the web" }],
    [pricing, { id: "notes", title: "Read win-loss notes.md" }]
  );
  await expect
    .poll(said)
    .toStrictEqual(["Searched the web", "Read win-loss notes.md"]);
  // Drawn again unchanged, nothing more is said.
  await set(
    [brief, { id: "search", title: "Searched the web" }],
    [pricing, { id: "notes", title: "Read win-loss notes.md" }]
  );
  await expect(page.getByText("Read win-loss notes.md").first()).toBeVisible();
  expect(await said()).toHaveLength(2);
});

test("a line that fails is said once; lines that change together are said together", async ({
  page,
}) => {
  const { said, set } = await openScript(page);
  await set(
    [
      brief,
      { id: "search", title: "Failed to search the web", status: "error" },
    ],
    [pricing, { id: "notes", title: "Read win-loss notes.md" }]
  );
  await expect
    .poll(said)
    .toStrictEqual([
      "Failed to search the web, Failed. Read win-loss notes.md",
    ]);
});

const weight = async (locator: Locator) =>
  await locator.evaluate((element) => getComputedStyle(element).fontWeight);

test("a row's title and a step's start at one edge, in one weight, a step's room apart, and a long one wraps beside its mark", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "trace", "script");
  const first = page.getByText("Read the brief", { exact: true });
  const step = page.getByText("Searching the web", { exact: true }).first();
  const row = page.getByText(/^Read 2 files on pricing/u);
  const [firstBox, stepBox, rowBox] = await Promise.all([
    first.boundingBox(),
    step.boundingBox(),
    row.boundingBox(),
  ]);
  expect(rowBox?.x).toBe(stepBox?.x);
  expect(await weight(row)).toBe(await weight(step));
  // From one title to the next: as far from the last step to the row as between two steps.
  const between = (stepBox?.y ?? 0) - (firstBox?.y ?? 0);
  expect((rowBox?.y ?? 0) - (stepBox?.y ?? 0)).toBe(between);
  // Wrapped over two lines, its first still level with the mark, room above and below it.
  const button = page.getByRole("button", { name: /Read 2 files/u });
  const buttonBox = await button.boundingBox();
  expect(rowBox?.height ?? 0).toBeGreaterThan(30);
  expect((rowBox?.y ?? 0) - (buttonBox?.y ?? 0)).toBe(6);
});

test("a plan's line names the goal and the progress, says it is working, and opens on steps still waiting", async ({
  page,
}) => {
  await openExample(page, "trace", "plan");
  const row = page.getByRole("button", {
    name: /^Plan: move the dialogs to the new primitives\s*, 2 of 5 done.*Working$/u,
  });
  const step = page.getByText("Run the type checker", { exact: true });
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(step.locator("..")).toContainText("Waiting");
  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "false");
  await expect(step).toBeHidden();
});

for (const scale of [1, 2]) {
  test(`a step's dot stands on the middle of the line that joins the steps, at ${scale}x`, async ({
    browser,
  }) => {
    const page = await browser.newPage({
      deviceScaleFactor: scale,
      reducedMotion: "reduce",
    });
    await openExample(page, "trace", "steps");
    const box = await page
      .getByText("Share the brief with the team", { exact: true })
      .locator("..")
      .boundingBox();
    if (box === null) {
      throw new Error("The step is not drawn.");
    }
    // The step's seat, clear of its words: its dot, and above it the fine dots of the line.
    const parts = await drawnParts(page, {
      x: box.x - 2,
      y: box.y - 8,
      width: 20,
      height: box.height + 8,
    });
    const [dot, ...line] = parts.toSorted(
      (a, b) => b.right - b.left - (a.right - a.left)
    );
    if (dot === undefined) {
      throw new Error("No dot is drawn.");
    }
    expect(line.length).toBeGreaterThan(0);
    for (const fine of line) {
      expect(
        Math.abs((fine.left + fine.right - dot.left - dot.right) / 2)
      ).toBeLessThan(0.5);
    }
    await page.close();
  });
}

test("a queue's rows are named by their count and open on their lists; a waiting item and a done one say so in words", async ({
  page,
}) => {
  await openExample(page, "trace", "queue");
  const left = page.getByRole("button", { name: "3 to do" });
  const completed = page.getByRole("button", { name: "2 completed" });
  const line = (title: string) =>
    page.getByText(title, { exact: true }).locator("..");
  await expect(left).toHaveAttribute("aria-expanded", "true");
  await expect(line("Add tests for the combobox")).toContainText("Waiting");
  await expect(completed).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Add a changeset", { exact: true })).toBeHidden();
  await completed.click();
  await expect(line("Add a changeset")).toContainText("Done, Add a changeset");
  await left.click();
  await expect(left).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByText("Add tests for the combobox", { exact: true })
  ).toBeHidden();
});

test("a subagent's row names the run and its model, and opens on its tool calls, its output and what it found", async ({
  page,
}) => {
  await openExample(page, "trace", "subagent");
  const run = page.getByRole("button", {
    name: /^Ran the research agent\s*, research-model-2$/u,
  });
  const found = page.getByText("The cache is keyed on the commit SHA.", {
    exact: true,
  });
  await expect(run).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("Ran grep -rn cacheKey scripts", { exact: true })
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Output" })).toContainText(
    "scripts/optimize-images.ts"
  );
  await expect(found).toBeVisible();
  await run.click();
  await expect(run).toHaveAttribute("aria-expanded", "false");
  await expect(found).toBeHidden();
});

for (const [component, example] of [
  ["trace", "steps"],
  ["trace", "script"],
  ["chain-of-thought", "script"],
] as const) {
  test(`one working mark in a trace, on its last running step: ${component}/${example}`, async ({
    page,
  }) => {
    await openExample(page, component, example);
    // The working mark is drawn as the Agent indicator's pixels; it is decoration, so count what shows.
    const shown = await page.evaluate(
      () =>
        [...document.querySelectorAll("[data-slot=agent-indicator]")].filter(
          (mark) => mark.getClientRects().length > 0
        ).length
    );
    expect(shown).toBe(1);
  });
}
