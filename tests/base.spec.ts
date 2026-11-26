// No component leans on the app's reset for its own layout, across the library. A product draws
// the components beside Tailwind's preflight, without Damsko's own base (src/styles/base.css,
// which is for a new app with no reset). The base has two rules preflight has not: nothing refuses
// to shrink below its content (`* { min-width: 0 }`) and a pointer on what can be pressed. Here
// both are taken out of the page, at a desk's width and at a phone's, and every example must stand
// as it stood: each box where it was, each control with the cursor it had. A component that needs
// either sets it in its own styles.
import { expect, test } from "@playwright/test";

import { componentExamples, openExample, settled } from "./example.ts";

const widths = [1280, 390];

/** Every box of the example and every control's cursor, in the order of the page. */
const measured = () =>
  [...document.querySelectorAll<HTMLElement>("[data-site-example] *")]
    .filter((element) => element instanceof HTMLElement)
    .map((element) => {
      const named =
        element.dataset.slot ??
        element.getAttribute("role") ??
        element.getAttribute("aria-label") ??
        "";
      return {
        box: [
          element.offsetLeft,
          element.offsetTop,
          element.offsetWidth,
          element.offsetHeight,
        ].join(" "),
        cursor: element.matches("button, [role=button]")
          ? getComputedStyle(element).cursor
          : "",
        name: `${element.tagName.toLowerCase()}${named === "" ? "" : `[${named}]`} "${(element.textContent ?? "").trim().slice(0, 30)}"`,
      };
    });

/** A quarter of a second in the page: longer than an example's own timer waits. */
const aWhile = async () => {
  // oxlint-disable-next-line promise/avoid-new -- a timer, which has no promise of its own
  await new Promise((resolve) => {
    setTimeout(resolve, 250);
  });
};

/** Takes the base's two own rules out of every stylesheet of the page; says how many it took. */
const withoutOwnRules = () => {
  let taken = 0;
  const visit = (list: CSSRuleList, remove: (index: number) => void) => {
    for (let index = list.length - 1; index >= 0; index -= 1) {
      const rule = list[index];
      if (rule instanceof CSSStyleRule) {
        const shrink =
          rule.selectorText === "*" &&
          rule.style.length === 1 &&
          rule.style.minWidth === "0px";
        const pointer =
          rule.style.length === 1 &&
          rule.style.cursor === "pointer" &&
          rule.selectorText.startsWith("button:not(:disabled)");
        if (shrink || pointer) {
          remove(index);
          taken += 1;
        }
      } else if (rule instanceof CSSGroupingRule) {
        visit(rule.cssRules, (at) => {
          rule.deleteRule(at);
        });
      }
    }
  };
  for (const sheet of document.styleSheets) {
    visit(sheet.cssRules, (at) => {
      sheet.deleteRule(at);
    });
  }
  return taken;
};

// One test per example, run in parallel: a shard is cut by the number of tests, and as one test
// per component, each over all its examples on one worker, these took 9 to 11 minutes of the
// first shard's 11 to 14, and it ended every run minutes after the other three (November 2026).
test.describe.configure({ mode: "parallel" });

for (const path of componentExamples()) {
  test(`${path}: stands without the base's own rules`, async ({ page }) => {
    const [component = "", name = ""] = path.split("/");
    const moved: string[] = [];
    // Opened anew at each width: a part drawn again as the window crosses a breakpoint (a
    // skeleton of another length) would read as moved.
    for (const width of widths) {
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      await page.setViewportSize({ width, height: 900 });
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      await openExample(page, component, name);
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      await settled(page);
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      const was = await page.evaluate(measured);
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      await settled(page);
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      const again = await page.evaluate(measured);
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      const taken = await page.evaluate(withoutOwnRules);
      expect(taken, "the base's two own rules are in the page").toBe(2);
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      await settled(page);
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      const now = await page.evaluate(measured);
      // An example that moves by itself (a stream being written) cannot be compared.
      if (
        JSON.stringify(was) !== JSON.stringify(again) ||
        was.length !== now.length
      ) {
        continue;
      }
      const first = was.findIndex(
        (each, at) =>
          each.box !== now[at]?.box || each.cursor !== now[at]?.cursor
      );
      // One that moved all the same may still be moving by itself: a stream whose timer did
      // not fire between the two measures, on a slow machine. Measured again a while later, it
      // has moved again, and it cannot be compared either.
      if (first !== -1) {
        // oxlint-disable-next-line no-await-in-loop -- one after the other
        await page.evaluate(aWhile);
      }
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      const later = first === -1 ? now : await page.evaluate(measured);
      if (first !== -1 && JSON.stringify(later) === JSON.stringify(now)) {
        moved.push(
          `${path} at ${width}: ${was[first]?.name} was ${was[first]?.box} ${was[first]?.cursor}, is ${now[first]?.box} ${now[first]?.cursor}`
        );
      }
    }
    expect(moved).toStrictEqual([]);
  });
}
