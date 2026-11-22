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
