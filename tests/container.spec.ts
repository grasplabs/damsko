import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

// The settings example: a page title, two cards and a members table in one column of the default
// size (45rem, 720px), in the page's middle.

test("its content stands in one column of a reading width, in the page's middle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openExample(page, "container", "settings");
  await expect(page.getByRole("heading", { name: "Workspace" })).toBeVisible();
  const table = await page.getByRole("table").boundingBox();
  const title = await page
    .getByRole("heading", { name: "Workspace" })
    .boundingBox();
  const width = page.viewportSize()?.width ?? 0;
  expect(table).not.toBeNull();
  expect(title).not.toBeNull();
  const left = table?.x ?? 0;
  const right = width - left - (table?.width ?? 0);
  expect(table?.width ?? 0).toBeLessThanOrEqual(720.5);
  // Equal room on both sides, and the title starts where the table does.
  expect(Math.abs(left - right)).toBeLessThan(2);
  expect(Math.abs((title?.x ?? 0) - left)).toBeLessThan(1);
});

test("on a narrow page the column narrows with it and never runs past it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openExample(page, "container", "settings");
  const title = await page
    .getByRole("heading", { name: "Workspace" })
    .boundingBox();
  expect(title).not.toBeNull();
  expect((title?.x ?? 0) + (title?.width ?? 0)).toBeLessThanOrEqual(390);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
