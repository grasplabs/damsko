// Scrolling, on every docs page: at 1440 and 390 every box that can scroll hides its bar
// (scrollbar-width none; Scroll area draws bars of its own on purpose), so a person who always
// shows scrollbars sees none; and at 1440 a real wheel from the middle of the window reaches the end of
// the page: no box inside it takes the wheel and keeps it. Carousel's page is left out of the
// wheel: UI SDK's vertical carousel keeps the wheel (overscroll-behavior-y contain, set on its
// viewport inline), an ask of UI SDK.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { docsPages } from "./example.ts";

/** Every box that scrolls and would draw a bar. */
const bars = async (page: Page) =>
  await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("body *")].flatMap((element) => {
      const style = getComputedStyle(element);
      const scrolls =
        /auto|scroll/u.test(`${style.overflowX} ${style.overflowY}`) &&
        (element.scrollHeight > element.clientHeight + 1 ||
          element.scrollWidth > element.clientWidth + 1 ||
          /scroll/u.test(`${style.overflowX} ${style.overflowY}`));
      if (
        !scrolls ||
        style.scrollbarWidth === "none" ||
        element.closest('[data-slot^="scroll-area"]') !== null
      ) {
        return [];
      }
      const slot = element.closest<HTMLElement>("[data-slot]")?.dataset.slot;
      return [
        `${element.tagName.toLowerCase()}${slot === undefined ? "" : ` in ${slot}`}`,
      ];
    })
  );

/** How far the page's own scroller stands from its end. */
const left = async (page: Page) =>
  await page.evaluate(() => {
    let box = (document.querySelector("#content") ?? document.body)
      .parentElement;
    while (
      box !== null &&
      !(
        /auto|scroll/u.test(getComputedStyle(box).overflowY) &&
        box.scrollHeight > box.clientHeight + 1
      )
    ) {
      box = box.parentElement;
    }
    const scroller =
      box ?? document.scrollingElement ?? document.documentElement;
    return Math.round(
      scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop
    );
  });

for (const width of [1440, 390]) {
  test.describe(`at ${width}`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const path of docsPages()) {
      test(`${path}: no bar shows`, async ({ page }) => {
        await page.goto(new URL(path, process.env.BASE_URL).href);
        await page.waitForLoadState("load");
        expect(await bars(page)).toStrictEqual([]);
      });
    }
  });
}

// The wheel at 1440 alone. Not in WebKit, whose wheel is not a person's (playwright.config.ts).
test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  for (const path of docsPages().filter(
    (each) => each !== "/components/carousel"
  )) {
    test(`${path}: a wheel reaches the end`, async ({ page }) => {
      await page.goto(new URL(path, process.env.BASE_URL).href);
      await page.waitForLoadState("load");
      await page.mouse.move(720, 450);
      // Turn after turn until the end is reached: where the page stands is asked each turn, never
      // whether the last turn moved it. A turn's scroll lands when the page gets to it, which on a
      // busy machine is after the next question, and three such turns once read as the end.
      for (let turn = 0; turn < 200; turn += 1) {
        // oxlint-disable-next-line no-await-in-loop -- turn after turn
        if ((await left(page)) <= 2) {
          break;
        }
        // oxlint-disable-next-line no-await-in-loop -- turn after turn
        await page.mouse.wheel(0, 1200);
      }
      await expect.poll(async () => await left(page)).toBeLessThanOrEqual(2);
    });
  }
});
