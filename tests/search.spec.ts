// The docs search puts the right page first: for each query, opened with the keyboard's shortcut
// and typed, the first result is the page (or the section) a reader means.
import { expect, test } from "@playwright/test";

const cases = [
  ["icon", "Icons"],
  ["focus ring", "Accessibility · Focus"],
  ["theme", "Themes"],
  ["keyboard", "Accessibility"],
  ["button", "Button"],
  ["dialog", "Dialog"],
  ["colour", "Colour"],
  ["tabs", "Tabs"],
  ["dia", "Dialog"],
  ["date", "Date picker"],
  ["tab", "Tabs"],
  ["install", "Get started · Install"],
] as const;

test("each query puts the page it means first", async ({ page }) => {
  await page.goto(new URL("/foundations/colour", process.env.BASE_URL).href);
  await page.keyboard.press("ControlOrMeta+k");
  const search = page.getByRole("dialog").getByRole("combobox");
  await expect(search).toBeFocused();
  for (const [query, first] of cases) {
    // oxlint-disable-next-line no-await-in-loop -- one query after the other
    await search.fill(query);
    // oxlint-disable-next-line no-await-in-loop -- one query after the other
    await expect(page.getByRole("option").first()).toContainText(first);
  }
});
