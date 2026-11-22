// Focus, across the library: every stop the keyboard reaches in every component example shows
// where focus is, and a click on a button shows no ring. A stop shows focus when its drawing
// changes as it takes focus: its own outline or shadow, or that of a part inside it or round it
// (a checkbox's box, a field's edge, a slider's thumb), so a part that draws its focus elsewhere
// is held as well as one that wears the ring.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { componentExamples, hasFocusRing, openExample } from "./example.ts";

/**
 * The focused element's name, and whether its drawing changes when it loses focus: the outline,
 * shadow and border of it, the six parts round it, the parts inside and beside it and a part it
 * names with `data-ring-on`, read with focus and again once it is blurred. Null when nothing has
 * focus. A part that marks focus from its state is read once it has drawn again.
 */
const showsFocus = async (page: Page) =>
  await page.evaluate(async () => {
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || focused === document.body) {
      return null;
    }
    const parts: Element[] = [focused];
    for (let up = focused.parentElement; up !== null; up = up.parentElement) {
      if (parts.length > 6) {
        break;
      }
      parts.push(up);
    }
    // Inside it, and beside it: a ring drawn by the next part (a scroller's), a cell beside a
    // hidden input (a code's cells).
    parts.push(
      ...[...(focused.parentElement ?? focused).querySelectorAll("*")].slice(
        0,
        120
      ),
      ...[focused.previousElementSibling, focused.nextElementSibling].filter(
        (part): part is Element => part !== null
      )
    );
    const ringOn =
      focused.closest<HTMLElement>("[data-ring-on]")?.dataset.ringOn;
    if (ringOn !== null && ringOn !== undefined) {
      parts.push(...document.querySelectorAll(ringOn));
    }
    const look = () =>
      parts
        .map((part) => {
          const style = getComputedStyle(part);
          return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor} ${style.boxShadow} ${style.borderColor}`;
        })
        .join("|");
    const name =
      focused.getAttribute("aria-label") ??
      (focused.textContent ?? "").trim().slice(0, 40) ??
      focused.tagName;
    const withFocus = look();
    focused.blur();
    // A part that marks focus from its state draws again a frame or two later.
    // oxlint-disable-next-line promise/avoid-new -- the next frames, which have no promise of their own
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
    return {
      name: name === "" ? focused.tagName : name,
      shown: look() !== withFocus,
    };
  });

// A command surface's search holds focus the whole time it is open, so it shows no mark of its
// own: focus shows on the active row (src/components/command.tsx).
const noMark = new Set([
  "Search actions",
  "Search the workspace",
  "Find a person",
]);

const byComponent = Map.groupBy(
  componentExamples(),
  (path) => path.split("/")[0] ?? path
);

for (const [component, paths] of byComponent) {
  test(`${component}: every keyboard stop shows focus`, async ({ page }) => {
    test.setTimeout(120_000);
    const unseen: string[] = [];
    for (const path of paths) {
      const [, name = ""] = path.split("/");
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      await openExample(page, component, name);
      const seen = new Set<string>();
      for (let stop = 0; stop < 6; stop += 1) {
        // oxlint-disable-next-line no-await-in-loop -- stop after stop
        await page.keyboard.press("Tab");
        // oxlint-disable-next-line no-await-in-loop -- stop after stop
        const focused = await showsFocus(page);
        if (focused === null || seen.has(focused.name)) {
          break;
        }
        seen.add(focused.name);
        if (
          !focused.shown &&
          !(component === "command" && noMark.has(focused.name))
        ) {
          unseen.push(`${path}: ${focused.name}`);
        }
      }
    }
    expect(unseen).toStrictEqual([]);
  });
}

test("a click on a button shows no ring, the keyboard's focus does", async ({
  page,
}) => {
  await openExample(page, "button", "variants");
  const button = page.getByRole("button", { name: "Save changes" });
  await button.click();
  expect(await hasFocusRing(button)).toBe(false);
});
