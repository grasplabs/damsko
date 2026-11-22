import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("alone, it is a status that says its label", async ({ page }) => {
  await openExample(page, "spinner", "alone");
  await expect(page.getByRole("status")).toHaveText("Loading the update");
});

test("beside words, the words are the status, said once", async ({ page }) => {
  await openExample(page, "spinner", "with-words");
  const status = page.getByRole("status");
  await expect(status).toHaveCount(1);
  expect(await status.ariaSnapshot()).toBe("- status: Loading the report");
});

test("with no label it says nothing to a screen reader", async ({ page }) => {
  await openExample(page, "spinner", "sizes");
  await expect(page.getByRole("status")).toHaveCount(0);
  expect(await page.locator("body").ariaSnapshot()).toBe("");
});

test("with reduced motion it stands still and breathes", async ({ page }) => {
  await openExample(page, "spinner", "sizes");
  // A sign of life stays: the opacity fades, nothing turns.
  const frames = await page.evaluate(() =>
    document
      .getAnimations()
      .flatMap((animation) =>
        animation.effect instanceof KeyframeEffect
          ? animation.effect.getKeyframes()
          : []
      )
  );
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.some((frame) => "opacity" in frame)).toBe(true);
  expect(frames.some((frame) => "transform" in frame)).toBe(false);
});

test.describe("without reduced motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("it turns", async ({ page }) => {
    await openExample(page, "spinner", "sizes");
    const frames = await page.evaluate(() =>
      document
        .getAnimations()
        .flatMap((animation) =>
          animation.effect instanceof KeyframeEffect
            ? animation.effect.getKeyframes()
            : []
        )
    );
    expect(frames.some((frame) => "transform" in frame)).toBe(true);
  });
});
