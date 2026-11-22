// Every docs page holds at a phone's width: at 320 left to right, and at 390 right to left, the
// page never scrolls sideways; whatever is wider than its column scrolls inside its own box.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { docsPages } from "./example.ts";

/** How far the page's own scroller can scroll sideways. */
const sideways = async (page: Page) =>
  await page.evaluate(() =>
    Math.max(
      0,
      ...[document.scrollingElement, document.querySelector("main")].map(
        (box) => (box === null ? 0 : box.scrollWidth - box.clientWidth)
      )
    )
  );

for (const [width, dir] of [
  [320, "ltr"],
  [390, "rtl"],
] as const) {
  test.describe(`at ${width}, ${dir}`, () => {
    test.use({ viewport: { width, height: 800 } });
    for (const path of docsPages()) {
      test(`${path}: no sideways scroll`, async ({ page }) => {
        await page.goto(new URL(path, process.env.BASE_URL).href);
        if (dir === "rtl") {
          await page.evaluate(() => {
            document.documentElement.dir = "rtl";
          });
        }
        expect(await sideways(page)).toBeLessThanOrEqual(1);
      });
    }
  });
}
