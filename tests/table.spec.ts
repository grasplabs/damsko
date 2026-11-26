import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("its caption names it, its heads name the columns and each row's header names the row", async ({
  page,
}) => {
  await openExample(page, "table", "basic");
  const table = page.getByRole("table", {
    name: "Reports shared with the team this quarter.",
  });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveText([
    "Report",
    "Owner",
    "Last edited",
    "Pages",
  ]);
  await expect(table.getByRole("rowheader")).toHaveText([
    "Quarterly summary",
    "Supplier list for the spring",
    "Team survey results",
    "Office move plan",
  ]);
  // The caption a reader sees stands under the table, the same words.
  await expect(
    page.getByText("Reports shared with the team this quarter.").last()
  ).toBeVisible();
});

test("a sortable head is a button that says its sort, and the caller's sort turns over", async ({
  page,
}) => {
  await openExample(page, "table", "sortable");
  const table = page.getByRole("table");
  const report = table.getByRole("columnheader", { name: "Report" });
  const pages = table.getByRole("columnheader", { name: "Pages" });
  await expect(report).toHaveAttribute("aria-sort", "ascending");
  await expect(pages).not.toHaveAttribute("aria-sort");
  const rowNames = table.getByRole("rowheader");
  await expect(rowNames.first()).toHaveText("Office move plan");

  await pages.getByRole("button", { name: "Pages" }).click();
  await expect(pages).toHaveAttribute("aria-sort", "ascending");
  await expect(report).not.toHaveAttribute("aria-sort");
  await expect(rowNames.first()).toHaveText("Supplier list for the spring");

  await pages.getByRole("button", { name: "Pages" }).press("Enter");
  await expect(pages).toHaveAttribute("aria-sort", "descending");
  await expect(rowNames.first()).toHaveText("Team survey results");
});

test("a footer row holds the total under the rows", async ({ page }) => {
  await openExample(page, "table", "footer");
  const table = page.getByRole("table", {
    name: "Costs for the spring workshop.",
  });
  const rows = table.getByRole("row");
  await expect(rows.last()).toContainText("€3,835.50");
});

test("a selected row says so in its words", async ({ page }) => {
  await openExample(page, "table", "chosen");
  const table = page.getByRole("table", {
    name: "Two of four files chosen to send.",
  });
  await expect(
    table.getByRole("row", { name: /Floor plan\.pdf/u })
  ).toContainText("Chosen");
  await expect(
    table.getByRole("row", { name: /Budget draft\.xlsx/u })
  ).toContainText("Not chosen");
});

test("a table wider than its box scrolls in a named region the keys can scroll, never the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "table", "wide");
  const region = page.getByRole("region", {
    name: "Requests closed per month, by team.",
  });
  await region.focus();
  await expect(region).toBeFocused();
  const before = await region.evaluate((box) => box.scrollLeft);
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => await region.evaluate((box) => box.scrollLeft))
    .toBeGreaterThan(before);
  const pageScrolls = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );
  expect(pageScrolls).toBe(false);
});

test("cells and heads that wrap let a table of sentences fit a phone, a column of figures on one line, and a cell in Hebrew reads from the right", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "table", "sentences");
  await expect(page.getByRole("region")).toHaveCount(0);
  const table = page.getByRole("table");
  const lines = await table
    .getByRole("cell", { name: /^The writer drafts/u })
    .evaluate((cell) => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      return new Set(
        [...range.getClientRects()].map((rect) => Math.round(rect.bottom))
      ).size;
    });
  expect(lines).toBeGreaterThan(1);
  await expect(table.getByRole("cell", { name: "3" })).toHaveCSS(
    "white-space",
    "nowrap"
  );
  await expect(table.getByRole("cell", { name: "שליחה" })).toHaveCSS(
    "direction",
    "rtl"
  );
});

test("a table that fits takes no focus of its own", async ({ page }) => {
  await openExample(page, "table", "basic");
  await expect(page.getByRole("region")).toHaveCount(0);
});
