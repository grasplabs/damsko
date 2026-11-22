import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

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
    page.getByRole("status").filter({ hasText: "Change 1 accepted" })
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
