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

/** How many colours a picture holds: its PNG, read back in the page. */
const colours = async (page: Page, png: Buffer) =>
  await page.evaluate(async (base64) => {
    const bytes = Uint8Array.from(
      atob(base64),
      (char) => char.codePointAt(0) ?? 0
    );
    const bitmap = await createImageBitmap(
      new Blob([bytes], { type: "image/png" })
    );
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d");
    context?.drawImage(bitmap, 0, 0);
    const pixels = new Uint32Array(
      context?.getImageData(0, 0, bitmap.width, bitmap.height).data.buffer ?? []
    );
    return new Set(pixels).size;
  }, png.toString("base64"));

for (const theme of ["light", "dark"] as const) {
  test(`the field's texture is square pixels, each sharp on the ground (${theme})`, async ({
    page,
  }) => {
    await openExample(page, "skeleton", "text", { theme });
    // At rest, lines of text are the ground and their pixels only: a square on whole pixels has
    // no soft edge, so the picture holds exactly two colours. A round dot shades into the ground.
    const lines = page.getByRole("status").locator("xpath=..");
    expect(await colours(page, await lines.screenshot())).toBe(2);
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
