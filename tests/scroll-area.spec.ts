import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { openExample } from "./example.ts";

const scrollTop = async (element: Locator): Promise<number> =>
  await element.evaluate((node) => node.scrollTop);

/**
 * Presses a key that scrolls the area and waits until that scroll has ended.
 *
 * A browser may glide to where a key sends it, over many frames, and Chromium drops a scroll key
 * that arrives while the glide before it is still ending: the area then stays where it was. A
 * person's keys come far apart; a spec's follow in milliseconds on a busy machine. So the next
 * key waits for the browser's own word that this one's scroll is over (`scrollend`), listened
 * for before the key goes down.
 */
const pressAndScroll = async (area: Locator, key: string): Promise<void> => {
  const scroll = await area.evaluateHandle((node) => {
    const ended = Promise.withResolvers<null>();
    node.addEventListener(
      "scrollend",
      () => {
        ended.resolve(null);
      },
      { once: true }
    );
    return { ended: ended.promise };
  });
  await area.page().keyboard.press(key);
  await scroll.evaluate(async ({ ended }) => await ended);
};

test("with words alone it is a named region the keyboard reaches and scrolls", async ({
  page,
}) => {
  await openExample(page, "scroll-area", "words");
  const area = page.getByRole("region", { name: "Terms of use" });
  await page.keyboard.press("Tab");
  await expect(area).toBeFocused();
  expect(await scrollTop(area)).toBe(0);

  await pressAndScroll(area, "ArrowDown");
  expect(await scrollTop(area)).toBeGreaterThan(0);
  await pressAndScroll(area, "End");
  expect(
    await area.evaluate(
      (node) => node.scrollTop + node.clientHeight >= node.scrollHeight - 1
    )
  ).toBe(true);
  await pressAndScroll(area, "Home");
  expect(await scrollTop(area)).toBe(0);
});

test("the browser's own scrollbar never shows", async ({ page }) => {
  await openExample(page, "scroll-area", "words");
  const area = page.getByRole("region", { name: "Terms of use" });
  expect(
    await area.evaluate((node) => getComputedStyle(node).scrollbarWidth)
  ).toBe("none");
});

test("the wheel over it scrolls its content", async ({ page }) => {
  await openExample(page, "scroll-area", "vertical");
  const first = page.getByText("Release 1.24", { exact: true });
  const last = page.getByText("Release 1.1", { exact: true });
  await expect(first).toBeInViewport();
  await expect(last).not.toBeInViewport();

  await first.hover();
  await page.mouse.wheel(0, 2000);
  await expect(last).toBeInViewport();
  await expect(first).not.toBeInViewport();
  // The area took the wheel; the page itself stayed where it was.
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("a row wider than the box scrolls sideways under the wheel", async ({
  page,
}) => {
  await openExample(page, "scroll-area", "horizontal");
  const last = page.getByText("August", { exact: true });
  await expect(last).not.toBeInViewport();
  await page.getByText("January", { exact: true }).hover();
  await page.mouse.wheel(2000, 0);
  await expect(last).toBeInViewport();
});
