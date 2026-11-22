// Escape, across the library: one press closes the layer that is open and gives focus back to the
// control that opened it; a part with nothing to close lets Escape through to the page.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** Counts the Escapes a listener on the page's document hears. */
const listen = async (page: Page) => {
  await page.evaluate(() => {
    window.escapesHeard = 0;
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        window.escapesHeard = (window.escapesHeard ?? 0) + 1;
      }
    });
  });
};

const heard = async (page: Page) =>
  await page.evaluate(() => window.escapesHeard ?? 0);

declare global {
  interface Window {
    escapesHeard?: number;
  }
}

const layers = [
  ["dialog", "dialog"],
  ["sheet", "dialog"],
  ["drawer", "dialog"],
  ["alert-dialog", "alertdialog"],
  ["popover", "dialog"],
  ["dropdown-menu", "menu"],
] as const;

for (const [component, role] of layers) {
  test(`${component}: Escape closes it and gives focus back to its trigger`, async ({
    page,
  }) => {
    await openExample(page, component, "basic");
    const trigger = page.getByRole("button").first();
    await trigger.click();
    const layer = page.getByRole(role);
    await expect(layer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(layer).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test("a question alone, with nothing to close, lets Escape through", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "single");
  await listen(page);
  await page.getByRole("radio").first().focus();
  await page.keyboard.press("Escape");
  expect(await heard(page)).toBe(1);
});
