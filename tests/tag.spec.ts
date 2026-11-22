import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("a tag's remove button is named by the tag's words", async ({ page }) => {
  await openExample(page, "tag", "removable");
  await Promise.all(
    ["Design", "Research", "Hiring"].map(async (words) => {
      await expect(
        page.getByRole("button", { name: `Remove ${words}` })
      ).toBeVisible();
    })
  );
});

test("a tag with no remove button has nothing to press", async ({ page }) => {
  await openExample(page, "tag", "variants");
  await expect(page.getByText("Design")).toBeVisible();
  await expect(page.getByRole("button")).toHaveCount(0);
});

test("removing a tag takes it away and moves focus to the next remove button", async ({
  page,
}) => {
  await openExample(page, "tag", "removable");
  await page.keyboard.press("Tab");
  const first = page.getByRole("button", { name: "Remove Design" });
  await expect(first).toBeFocused();
  expect(await hasFocusRing(first)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.getByText("Design")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Remove Research" })
  ).toBeFocused();
});

test("removing the last tag moves focus to the one before", async ({
  page,
}) => {
  await openExample(page, "tag", "removable");
  await page.getByRole("button", { name: "Remove Hiring" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByText("Hiring")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Remove Research" })
  ).toBeFocused();
});

test("a tag's words carry their whole text as a title, for when they are cut", async ({
  page,
}) => {
  await openExample(page, "tag", "variants");
  await expect(page.getByTitle("Design")).toHaveText("Design");
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("every remove button takes a 44px press", async ({ page }) => {
    await openExample(page, "tag", "removable");
    const buttons = page.getByRole("button");
    await expect(buttons).toHaveCount(3);
    // A press 18px from a button's centre, in each of the eight directions, lands on the button.
    const missed = await buttons.evaluateAll((elements) =>
      elements.flatMap((element) => {
        const box = element.getBoundingClientRect();
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        return [
          [0, -18],
          [18, -18],
          [18, 0],
          [18, 18],
          [0, 18],
          [-18, 18],
          [-18, 0],
          [-18, -18],
        ]
          .filter(([dx = 0, dy = 0]) => {
            const scale = dx !== 0 && dy !== 0 ? Math.SQRT1_2 : 1;
            const hit = document.elementFromPoint(
              x + dx * scale,
              y + dy * scale
            );
            return hit === null || !element.contains(hit);
          })
          .map(([dx, dy]) => `${element.ariaLabel ?? ""} ${dx},${dy}`);
      })
    );
    expect(missed).toEqual([]);
  });
});
