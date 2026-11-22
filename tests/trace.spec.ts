import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { hasFocusRing, listenToLiveRegions, openExample } from "./example.ts";

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

test("a row's words stand on the steps' edge, its title a step after its mark, in the steps' weight, and a long one wraps beside it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "trace", "script");
  const step = page.getByText("Read the brief", { exact: true });
  const row = page.getByText(/^Read 2 files on pricing/u);
  const button = page.getByRole("button", { name: /Read 2 files/u });
  const [stepBox, rowBox, buttonBox] = await Promise.all([
    step.boundingBox(),
    row.boundingBox(),
    button.boundingBox(),
  ]);
  // The row's mark on the column's edge, where the steps' marks stand: its fill reaches 8px past
  // it; its title 24px in (the 16px mark and 8px), the steps' 28px in (their seat).
  const edge = (stepBox?.x ?? 0) - 28;
  expect(buttonBox?.x).toBe(edge - 8);
  expect(rowBox?.x).toBe(edge + 24);
  expect(await weight(row)).toBe(await weight(step));
  // Wrapped over two lines, beside its mark.
  expect(rowBox?.height ?? 0).toBeGreaterThan(30);
  expect((rowBox?.y ?? 0) - (buttonBox?.y ?? 0)).toBeLessThan(8);
});
