import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("a status is a status, its icon hidden and its words read", async ({
  page,
}) => {
  await openExample(page, "marker", "status");
  await expect(
    page.getByRole("status").filter({ hasText: "Reconnecting" })
  ).toHaveCount(1);
  const status = page.getByRole("status").filter({ hasText: "Reconnecting" });
  expect(await status.ariaSnapshot()).toBe("- status: Reconnecting");
});

test("a separator's words are read, its rules drawn either side of them", async ({
  page,
}) => {
  await openExample(page, "marker", "separator");
  const today = page.getByText("Today", { exact: true });
  await expect(today).toBeVisible();
  await expect(page.getByRole("separator")).toHaveCount(0);
  // The rules stand on each side: the words in the middle of the line.
  const line = await today.evaluate((element) => {
    const marker = element.parentElement?.getBoundingClientRect();
    const words = element.getBoundingClientRect();
    return {
      before: words.left - (marker?.left ?? 0),
      after: (marker?.right ?? 0) - words.right,
    };
  });
  expect(line.before).toBeGreaterThan(40);
  expect(Math.abs(line.before - line.after)).toBeLessThanOrEqual(1);
});

test("drawn as a link or a button it is named by its words and reached by Tab", async ({
  page,
}) => {
  await openExample(page, "marker", "link");
  const link = page.getByRole("link", { name: "Opened the meeting notes" });
  const button = page.getByRole("button", { name: "Undo this change" });
  await expect(link).toHaveAttribute("href", "https://example.com/notes");
  await link.focus();
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  expect(await hasFocusRing(button)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Change undone" })
  ).toBeVisible();
});
