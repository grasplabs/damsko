import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

for (const theme of ["light", "dark"] as const) {
  test(`a warning or a destructive alert is said at once, the others when the reader is free, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "alert", "variants", { theme });
    await expect(page.getByRole("status")).toHaveText([
      /How the score is worked out/u,
      /The export is ready/u,
    ]);
    await expect(page.getByRole("alert")).toHaveText([
      /Almost at this month's limit/u,
      /The answers did not load/u,
    ]);
  });
}

test("an alert reads its title, then its sentence, and never its icon", async ({
  page,
}) => {
  await openExample(page, "alert", "variants");
  await expect(
    page.getByRole("status").filter({ hasText: "The export is ready" })
  ).toHaveAccessibleName("");
  await expect(
    page.getByRole("status").filter({ hasText: "The export is ready" })
  ).toHaveText(
    "The export is readyThe CSV has finished and is ready to download."
  );
  await expect(page.getByRole("img")).toHaveCount(0);
});

test("live sets how it is heard, whatever the variant", async ({ page }) => {
  await openExample(page, "alert", "live");
  await expect(page.getByRole("status")).toHaveText(/Export ready/u);
  await expect(page.getByRole("alert")).toHaveText(/The sync stopped/u);
  // `live="off"`: read where it stands, with no live role.
  await expect(
    page.getByText("This page shows last week's numbers until Monday.")
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(1);
  await expect(page.getByRole("alert")).toHaveCount(1);
});

test("every part is optional: a sentence alone, a title alone", async ({
  page,
}) => {
  await openExample(page, "alert", "compositions");
  await expect(page.getByRole("alert")).toHaveText(
    "The mapping for this domain is not finished."
  );
  await expect(page.getByRole("status")).toHaveText([
    "Choose a team to compare its projects",
    "New projects are shared with the whole workspace.",
  ]);
});

test("a banner's action comes before its close button, and closing takes it away", async ({
  page,
}) => {
  await openExample(page, "alert", "banner");
  const banner = page.getByRole("alert").filter({
    hasText: "Scheduled maintenance",
  });
  await expect(banner).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Read more" })).toBeFocused();
  await page.keyboard.press("Tab");
  const close = banner.getByRole("button", { name: "Dismiss" });
  await expect(close).toBeFocused();
  expect(await hasFocusRing(close)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(banner).toHaveCount(0);
  // Focus goes on to the next control, never to the page.
  await expect(
    page.getByRole("button", { name: "Show the banner again" })
  ).toBeFocused();
});

test("a subtle alert keeps its variant's role", async ({ page }) => {
  await openExample(page, "alert", "banner");
  await expect(
    page.getByRole("alert").filter({ hasText: "The time zone did not save." })
  ).toBeVisible();
});
