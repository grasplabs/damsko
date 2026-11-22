import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

for (const theme of ["light", "dark"] as const) {
  test(`a named tile is an image with its name, ${theme}`, async ({ page }) => {
    await openExample(page, "icon-tile", "looks", { theme });
    await Promise.all(
      ["Person", "Report", "Agent"].map(async (name) => {
        await expect(page.getByRole("img", { name })).toBeVisible();
      })
    );
  });
}

test("a tile beside words is hidden from screen readers", async ({ page }) => {
  await openExample(page, "icon-tile", "running");
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("Idle");
});

test("loading leans the light once and says it in words", async ({ page }) => {
  await openExample(page, "icon-tile", "running");
  const tile = page.locator("[aria-hidden=true]").filter({
    has: page.locator("svg"),
  });
  const position = async () =>
    await tile.evaluate((node) => getComputedStyle(node).backgroundPosition);
  const rest = await position();
  await page.getByRole("button", { name: "Run agent" }).click();
  await expect(page.getByRole("status")).toHaveText("Running");
  await expect.poll(position).not.toBe(rest);
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(page.getByRole("status")).toHaveText("Idle");
  await expect.poll(position).toBe(rest);
});

test("a small tile keeps a table's rows as tall as rows of words alone", async ({
  page,
}) => {
  // The tallest body row of each density's table, in tenths of a pixel.
  const tallest = async () =>
    await Promise.all(
      ["compact", "default"].map(async (density) => {
        const rows = page
          .getByRole("table", { name: new RegExp(`, ${density}$`, "u") })
          .getByRole("row");
        const heights = await rows.evaluateAll((all) =>
          all
            .slice(1)
            .map((row) => Math.round(row.getBoundingClientRect().height * 10))
        );
        return Math.max(...heights);
      })
    );
  await openExample(page, "data-table", "density");
  const words = await tallest();
  await openExample(page, "icon-tile", "row");
  expect(await tallest()).toEqual(words);
});

test("a small tile is 24px square with a 14px icon", async ({ page }) => {
  await openExample(page, "icon-tile", "row");
  const table = page.getByRole("table", { name: "Workflows, compact" });
  const cell = table.getByRole("rowheader", { name: "Weekly spend report" });
  const sizes = await cell.evaluate((node) => {
    const icon = node.querySelector("svg");
    const tile = icon?.parentElement;
    return {
      tile: tile?.getBoundingClientRect().width ?? 0,
      tall: tile?.getBoundingClientRect().height ?? 0,
      icon: icon?.getBoundingClientRect().width ?? 0,
    };
  });
  expect(sizes).toEqual({ tile: 24, tall: 24, icon: 14 });
});
