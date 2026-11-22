import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("a horizontal separator is a separator", async ({ page }) => {
  await openExample(page, "separator", "horizontal");
  const line = page.getByRole("separator");
  await expect(line).toHaveCount(1);
  await expect(line).not.toHaveAttribute("aria-orientation", "vertical");
});

test("a vertical separator says its orientation", async ({ page }) => {
  await openExample(page, "separator", "vertical");
  const lines = page.getByRole("separator");
  await expect(lines).toHaveCount(2);
  await expect(lines.first()).toHaveAttribute("aria-orientation", "vertical");
  await expect(lines.last()).toHaveAttribute("aria-orientation", "vertical");
});

test("a separator between rows of a list comes only between them", async ({
  page,
}) => {
  await openExample(page, "separator", "in-a-list");
  await expect(page.getByRole("separator")).toHaveCount(2);
});

test("a decorative separator is hidden from screen readers", async ({
  page,
}) => {
  await openExample(page, "separator", "decorative");
  await expect(page.getByText("or", { exact: true })).toBeVisible();
  await expect(page.getByRole("separator")).toHaveCount(0);
});

for (const width of [768, 1440]) {
  for (const theme of ["light", "dark"] as const) {
    test(`a line beside words runs through their middle, ${width}, ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await openExample(page, "separator", "decorative", { theme });
      // The lines are the words' neighbours in their row: no role, as they are only lines.
      const offsets = await page
        .getByText("or", { exact: true })
        .evaluate((words) => {
          const box = words.getBoundingClientRect();
          const at = box.top + box.height / 2;
          return [words.previousElementSibling, words.nextElementSibling].map(
            (line) => {
              const edge = line?.getBoundingClientRect();
              return edge === undefined
                ? Number.NaN
                : Math.abs(edge.top + edge.height / 2 - at);
            }
          );
        });
      expect(offsets.every((offset) => offset <= 1)).toBe(true);
    });
  }
}
