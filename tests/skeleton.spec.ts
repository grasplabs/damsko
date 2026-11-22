import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

const motion = async (page: Page) =>
  await page.evaluate(() => document.getAnimations().length);

/** The waves: the light a script starts, not a stylesheet's animation (the pulse). */
const waves = async (page: Page) =>
  await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            !(animation instanceof CSSAnimation) &&
            !(animation instanceof CSSTransition)
        ).length
  );

/**
 * Until the page has said what is in view: the wave starts when a placeholder comes into view, so
 * a count taken before then proves nothing. An observer made now is told after the page's own.
 */
const inView = async (page: Page) => {
  await page.evaluate(() => {
    const watch = new IntersectionObserver(() => {
      watch.disconnect();
      document.body.dataset.told = "";
    });
    watch.observe(document.body);
  });
  await page.waitForFunction(() => document.body.dataset.told !== undefined);
};

for (const [example, status] of [
  ["layout", "Loading the update"],
  ["shapes", "Loading"],
  ["text", "Loading the summary"],
  ["still", "Loading the list"],
] as const) {
  test(`placeholders are hidden from screen readers; the region's status says what loads (${example})`, async ({
    page,
  }) => {
    await openExample(page, "skeleton", example);
    expect(await page.locator("body").ariaSnapshot()).toBe(
      `- status: ${status}`
    );
  });
}

test("with reduced motion nothing moves, and the wave starts once motion is allowed", async ({
  page,
}) => {
  await openExample(page, "skeleton", "looks");
  await inView(page);
  expect(await motion(page)).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(async () => await waves(page)).toBeGreaterThan(0);
});

test.describe("without reduced motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the wave and the pulse move", async ({ page }) => {
    await openExample(page, "skeleton", "looks");
    await expect.poll(async () => await waves(page)).toBeGreaterThan(0);
    expect(await motion(page)).toBeGreaterThan(await waves(page));
  });

  test("a still skeleton stays still once in view", async ({ page }) => {
    await openExample(page, "skeleton", "still");
    await inView(page);
    expect(await motion(page)).toBe(0);
  });
});
