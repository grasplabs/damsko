import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("a screen reader reads its words once", async ({ page }) => {
  await openExample(page, "shimmer", "basic");
  expect(await page.locator("body").ariaSnapshot()).toBe("- text: Thinking");
});

test("with reduced motion there is no sweep", async ({ page }) => {
  await openExample(page, "shimmer", "strengths");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test.describe("without reduced motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the light crosses the words", async ({ page }) => {
    await openExample(page, "shimmer", "basic");
    expect(
      await page.evaluate(() => document.getAnimations().length)
    ).toBeGreaterThan(0);
  });
});

test("the words change and settle, and nothing under them moves", async ({
  page,
}) => {
  await openExample(page, "shimmer", "settled");
  const next = page.getByRole("button", { name: "Next step" });
  const start = await next.boundingBox();
  await next.click();
  await expect(page.getByText("Searching 3 sources").first()).toBeVisible();
  const second = await next.boundingBox();
  await next.click();
  await expect(page.getByText("Reading the contract").first()).toBeVisible();
  const third = await next.boundingBox();
  await next.click();
  await expect(page.getByText("Thought for 7 seconds")).toBeVisible();
  const settled = await page
    .getByRole("button", { name: "Start again" })
    .boundingBox();
  expect([second?.x, third?.x, settled?.x]).toEqual([
    start?.x,
    start?.x,
    start?.x,
  ]);
});
