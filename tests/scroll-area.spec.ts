import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { openExample } from "./example.ts";

const scrollTop = async (element: Locator): Promise<number> =>
  await element.evaluate((node) => node.scrollTop);

test("with words alone it is a named region the keyboard reaches and scrolls", async ({
  page,
}) => {
  await openExample(page, "scroll-area", "words");
  const area = page.getByRole("region", { name: "Terms of use" });
  await page.keyboard.press("Tab");
  await expect(area).toBeFocused();
  expect(await scrollTop(area)).toBe(0);

  await page.keyboard.press("ArrowDown");
  await expect.poll(async () => await scrollTop(area)).toBeGreaterThan(0);
  await page.keyboard.press("End");
  await expect
    .poll(
      async () =>
        await area.evaluate(
          (node) => node.scrollTop + node.clientHeight >= node.scrollHeight - 1
        )
    )
    .toBe(true);
  await page.keyboard.press("Home");
  await expect.poll(async () => await scrollTop(area)).toBe(0);
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
