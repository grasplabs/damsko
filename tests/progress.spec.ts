import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("a bar is a progressbar named by its label, at its value", async ({
  page,
}) => {
  await openExample(page, "progress", "basic");
  const bar = page.getByRole("progressbar", { name: "Exporting the report" });
  await expect(bar).toHaveAttribute("aria-valuenow", "60");
  await expect(bar).toHaveAttribute("aria-valuemin", "0");
  await expect(bar).toHaveAttribute("aria-valuemax", "100");
  await expect(bar).toHaveAttribute("aria-valuetext", "60%");
});

test("its visible value is shown and said once", async ({ page }) => {
  await openExample(page, "progress", "basic");
  await expect(page.getByText("60%")).toBeVisible();
  expect(await page.locator("body").ariaSnapshot()).not.toContain("text: 60%");
});

test("each size is a named progressbar", async ({ page }) => {
  await openExample(page, "progress", "sizes");
  await Promise.all(
    [
      ["Small", "25"],
      ["Medium", "65"],
      ["Large", "100"],
    ].map(async ([name = "", value = ""]) => {
      await expect(page.getByRole("progressbar", { name })).toHaveAttribute(
        "aria-valuenow",
        value
      );
    })
  );
});

test("while how far is unknown it has no value", async ({ page }) => {
  await openExample(page, "progress", "unknown");
  const bar = page.getByRole("progressbar", {
    name: "Connecting to the workspace",
  });
  await expect(bar).toBeVisible();
  await expect(bar).not.toHaveAttribute("aria-valuenow");
});

test("with reduced motion an unknown bar does not travel", async ({ page }) => {
  await openExample(page, "progress", "unknown");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("its value can be said in words of its own", async ({ page }) => {
  await openExample(page, "progress", "tones");
  await expect(
    page.getByRole("progressbar", { name: "Stopped at the third file" })
  ).toHaveAttribute("aria-valuetext", "3 of 12 files");
  await expect(
    page.getByRole("progressbar", { name: "Imported" })
  ).toHaveAttribute("aria-valuenow", "100");
});

test("each ring is a named progressbar; a large ring shows its value", async ({
  page,
}) => {
  await openExample(page, "progress", "rings");
  await Promise.all(
    [
      "Saving",
      "Uploading",
      "Uploading the photos",
      "Syncing",
      "Connecting",
    ].map(async (name) => {
      await expect(
        page.getByRole("progressbar", { name, exact: true })
      ).toBeVisible();
    })
  );
  await expect(page.getByText("25%")).toBeVisible();
  await expect(page.getByText("65%")).toBeVisible();
  await expect(page.getByText("50%")).toHaveCount(0);
  await expect(
    page.getByRole("progressbar", { name: "Connecting" })
  ).not.toHaveAttribute("aria-valuenow");
});
