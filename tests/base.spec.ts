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

const byComponent = Map.groupBy(
  componentExamples(),
  (path) => path.split("/")[0] ?? path
);

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

for (const [component, paths] of byComponent) {
  test(`${component}: stands without the base's own rules`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const moved: string[] = [];
    for (const path of paths) {
      const [, name = ""] = path.split("/");
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
        if (first !== -1) {
          moved.push(
            `${path} at ${width}: ${was[first]?.name} was ${was[first]?.box} ${was[first]?.cursor}, is ${now[first]?.box} ${now[first]?.cursor}`
          );
        }
      }
    }
    expect(moved).toStrictEqual([]);
  });
}
