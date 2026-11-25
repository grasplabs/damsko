// Nothing animates that is not seen: on every docs page at rest, with motion and with reduced
// motion, no running animation plays on an element a person cannot see (zero opacity, hidden or
// not displayed, its own or an ancestor's). An element whose own animation sets its opacity is
// judged by its ancestors only. Below the fold is not unseen: a browser pauses that itself.
import { expect, test } from "@playwright/test";

import { docsPages } from "./example.ts";

for (const motion of ["reduce", "no-preference"] as const) {
  test.describe(`motion ${motion}`, () => {
    test.use({ reducedMotion: motion });
    for (const path of docsPages()) {
      test(`${path}: nothing unseen animates`, async ({ page }) => {
        await page.goto(new URL(path, process.env.BASE_URL).href);
        // At rest: loaded, and what arrives with the page has arrived.
        await page.waitForLoadState("networkidle");
        const unseen = await page.evaluate(() =>
          document.getAnimations().flatMap((animation) => {
            const { effect } = animation;
            // A scroll-driven animation (an edge's fade) moves only as its box scrolls: it costs no
            // frame while nothing scrolls, seen or not.
            if (
              animation.playState !== "running" ||
              !(effect instanceof KeyframeEffect) ||
              !(effect.target instanceof Element) ||
              (typeof ScrollTimeline !== "undefined" &&
                animation.timeline instanceof ScrollTimeline)
            ) {
              return [];
            }
            const own = effect
              .getKeyframes()
              .some((frame) => "opacity" in frame);
            for (
              let at: Element | null = own
                ? effect.target.parentElement
                : effect.target;
              at !== null;
              at = at.parentElement
            ) {
              const style = getComputedStyle(at);
              if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                style.opacity === "0"
              ) {
                const slot = effect.target.closest<HTMLElement>("[data-slot]");
                return [
                  `${effect.target.tagName.toLowerCase()}${slot ? ` in ${slot.dataset.slot ?? ""}` : ""}`,
                ];
              }
            }
            return [];
          })
        );
        expect(unseen).toStrictEqual([]);
      });
    }
  });
}
