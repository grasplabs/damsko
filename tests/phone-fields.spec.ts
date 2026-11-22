// Typed text on a phone, across the library: under 16px, Safari zooms the page in when a field
// takes focus. In every component example at 390 wide, with a fine pointer (the width alone
// decides), every part that takes typed text (an input that takes words, a textarea, an editable
// region) draws it at 16px or more; and so does one that a press opens (a command's or a picker's
// search), looked at once the first control that opens a popup is opened by the keyboard.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { componentExamples, openExample } from "./example.ts";

test.use({ viewport: { width: 390, height: 844 } });

/** Every shown field that takes words, with its typed text's size when under 16px. */
const small = async (page: Page) =>
  await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        'input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="password"], input[type="url"], input[type="tel"], input[type="number"], textarea, [contenteditable="true"], [contenteditable=""]'
      ),
    ].flatMap((field) => {
      const box = field.getBoundingClientRect();
      const style = getComputedStyle(field);
      if (
        box.width < 2 ||
        box.height < 2 ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        return [];
      }
      const size = Number(style.fontSize.replace(/px$/u, ""));
      return size < 16
        ? [
            `${field.getAttribute("aria-label") ?? field.getAttribute("placeholder") ?? field.tagName} at ${size}px`,
          ]
        : [];
    })
  );

const byComponent = Map.groupBy(
  componentExamples(),
  (path) => path.split("/")[0] ?? path
);

for (const [component, paths] of byComponent) {
  test(`${component}: typed text is 16px on a phone`, async ({ page }) => {
    test.setTimeout(120_000);
    const found: string[] = [];
    for (const path of paths) {
      const [, name = ""] = path.split("/");
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      await openExample(page, component, name);
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      const fields = await small(page);
      const opener = page
        .locator("button[aria-haspopup], [role=combobox]")
        .first();
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      if ((await opener.count()) > 0 && (await opener.isVisible())) {
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        await opener.focus();
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        await page.keyboard.press("Enter");
        // oxlint-disable-next-line no-await-in-loop -- one example after the other
        fields.push(...(await small(page)));
      }
      found.push(...new Set(fields.map((field) => `${path}: ${field}`)));
    }
    expect(found).toStrictEqual([]);
  });
}
