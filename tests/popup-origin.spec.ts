// Anything a trigger opens grows from that trigger, never from its own centre: in an example of
// each part that opens a popup, the popup's transform origin, as a point on the screen, lies on
// its trigger or in the gap the popup keeps from it.
import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test.use({ reducedMotion: "no-preference" });

const popups = [
  ["popover", "basic"],
  ["dropdown-menu", "basic"],
  ["select", "field"],
  ["combobox", "field"],
  ["date-picker", "basic"],
  ["model-selector", "basic"],
  ["menubar", "editor"],
] as const;

for (const [component, name] of popups) {
  test(`${component}: the popup grows from its trigger`, async ({ page }) => {
    await openExample(page, component, name);
    const trigger = page
      .locator("damsko-island")
      .locator("[aria-haspopup], [aria-controls], [aria-expanded]")
      .first();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const off = await trigger.evaluate((element) => {
      const popup = [
        ...document.querySelectorAll(
          '[role="dialog"], [role="menu"], [role="listbox"], [data-slot$="-content"]'
        ),
      ].find(
        (each) =>
          !element.contains(each) && each.getBoundingClientRect().height > 0
      );
      if (popup === undefined) {
        return "no popup";
      }
      const box = popup.getBoundingClientRect();
      const [x = "0", y = "0"] =
        getComputedStyle(popup).transformOrigin.split(" ");
      const point = {
        x: box.left + Number(x.replace(/px$/u, "")),
        y: box.top + Number(y.replace(/px$/u, "")),
      };
      const at = element.getBoundingClientRect();
      // The trigger's box and the gap a popup keeps from it.
      const gap = 16;
      return point.x >= at.left - gap &&
        point.x <= at.right + gap &&
        point.y >= at.top - gap &&
        point.y <= at.bottom + gap
        ? ""
        : `origin at ${Math.round(point.x)},${Math.round(point.y)}, trigger at ${Math.round(at.left)},${Math.round(at.top)} ${Math.round(at.width)}x${Math.round(at.height)}`;
    });
    expect(off).toBe("");
  });
}
