import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

for (const theme of ["light", "dark"] as const) {
  test(`every variant says its status in words, ${theme}`, async ({ page }) => {
    await openExample(page, "badge", "tones", { theme });
    await Promise.all(
      ["Draft", "Ready", "Needs review", "Blocked", "Shared"].map(
        async (words) => {
          await expect(page.getByText(words, { exact: true })).toBeVisible();
        }
      )
    );
  });
}

test("a badge is read with the words around it: no role, nothing to press", async ({
  page,
}) => {
  await openExample(page, "badge", "in-a-row");
  await expect(page.getByText("Ready", { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("link")).toHaveCount(0);
});

test("a loading badge is a polite status that says its new words when it settles", async ({
  page,
}) => {
  await openExample(page, "badge", "pending");
  await expect(page.getByRole("status")).toHaveText([
    "Sending",
    "Being removed",
  ]);
  await page.getByRole("button", { name: "Send again" }).click();
  await expect(page.getByRole("status").first()).toHaveText("Invited");
});

test("a badge with a tooltip is a stop for the keyboard, described by its tooltip", async ({
  page,
}) => {
  await openExample(page, "badge", "explained");
  await page.keyboard.press("Tab");
  // The badge itself takes focus: the element that holds its words.
  const badge = page.locator(":focus");
  await expect(badge).toHaveText("Staff access");
  expect(await hasFocusRing(badge)).toBe(true);
  await expect(page.getByRole("tooltip")).toContainText(
    "can open this workspace"
  );
  await expect(badge).toHaveAccessibleDescription(/can open this workspace/u);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("a dot beside words is hidden; a dot alone is named by its variant", async ({
  page,
}) => {
  await openExample(page, "badge", "dot");
  await expect(page.getByText("3 errors")).toBeVisible();
  await expect(page.getByRole("img")).toHaveCount(1);
  await expect(page.getByRole("img", { name: "Error" })).toBeVisible();
});

test("a badge drawn as a link stays a link, named by its words, with the keyboard's ring", async ({
  page,
}) => {
  await openExample(page, "badge", "link");
  await page.keyboard.press("Tab");
  const link = page.getByRole("link", { name: "What is new" });
  await expect(link).toBeFocused();
  await expect(link).toHaveAttribute("href", "#changes");
  expect(await hasFocusRing(link)).toBe(true);
});

test("a label's remove button is named by the label's words", async ({
  page,
}) => {
  await openExample(page, "badge", "removable");
  await Promise.all(
    ["Design", "Research", "Hiring"].map(async (words) => {
      await expect(
        page.getByRole("button", { name: `Remove ${words}` })
      ).toBeVisible();
    })
  );
});

test("a label with no remove button has nothing to press", async ({ page }) => {
  await openExample(page, "badge", "labels");
  await expect(page.getByText("Design")).toBeVisible();
  await expect(page.getByRole("button")).toHaveCount(0);
});

test("removing a badge takes it away and moves focus to the next remove button", async ({
  page,
}) => {
  await openExample(page, "badge", "removable");
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

test("removing the last badge moves focus to the one before", async ({
  page,
}) => {
  await openExample(page, "badge", "removable");
  await page.getByRole("button", { name: "Remove Hiring" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByText("Hiring")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Remove Research" })
  ).toBeFocused();
});

test("a label's words carry their whole text as a title, for when they are cut", async ({
  page,
}) => {
  await openExample(page, "badge", "labels");
  await expect(page.getByTitle("Design")).toHaveText("Design");
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("every remove button takes a 44px press", async ({ page }) => {
    await openExample(page, "badge", "removable");
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

test("a label drawn as a link is cut like any label, its whole text in its title", async ({
  page,
}) => {
  await openExample(page, "badge", "link");
  const link = page.getByRole("link", { name: "Design systems and research" });
  await expect(link).toHaveAttribute("title", "Design systems and research");
  await expect(link).toHaveCSS("text-overflow", "ellipsis");
  // Cut: its words are wider than the room it has.
  expect(
    await link.evaluate((element) => element.scrollWidth > element.clientWidth)
  ).toBe(true);
});

test("a status has no remove button: only a label is taken away", async ({
  page,
}) => {
  await openExample(page, "badge", "tones");
  await expect(page.getByRole("button")).toHaveCount(0);
});
