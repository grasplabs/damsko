import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("resting the pointer on its trigger shows it", async ({ page }) => {
  await openExample(page, "tooltip", "basic");
  await page.getByRole("button", { name: "Publish" }).hover();
  await expect(page.getByRole("tooltip")).toHaveText(
    "Everyone in the workspace can read it"
  );
});

test("keyboard focus shows it at once", async ({ page }) => {
  await openExample(page, "tooltip", "basic");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Publish" })).toBeFocused();
  await expect(page.getByRole("tooltip")).toBeVisible();
});

test("Escape hides it and focus stays on the trigger", async ({ page }) => {
  await openExample(page, "tooltip", "basic");
  const trigger = page.getByRole("button", { name: "Publish" });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("focus moving on hides it", async ({ page }) => {
  await openExample(page, "tooltip", "delay");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tooltip")).toHaveText(
    "Opened after the default delay"
  );
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tooltip")).toHaveText("Opened at once");
});

test("it describes its trigger, which keeps its own name", async ({ page }) => {
  await openExample(page, "tooltip", "icon");
  await expect(
    page.getByRole("button", { name: "Download" })
  ).toHaveAccessibleDescription("Saves a PDF of this report");
  await expect(
    page.getByRole("button", { name: "Copy link" })
  ).toHaveAccessibleDescription(/^Copy a link to this report/u);
});

test("a shortcut is named on the trigger", async ({ page }) => {
  await openExample(page, "tooltip", "shortcut");
  await expect(page.getByRole("button", { name: "Save" })).toHaveAttribute(
    "aria-keyshortcuts",
    /S$/u
  );
});

test("the caller's ref reaches the trigger", async ({ page }) => {
  await openExample(page, "tooltip", "shortcut");
  // The example's keys press the trigger through the ref it gave TooltipTrigger.
  await page.keyboard.press("ControlOrMeta+s");
  await expect(page.getByRole("status")).toHaveText("Saved a version");
});

test("on a link, the link keeps its role and name", async ({ page }) => {
  await openExample(page, "tooltip", "link");
  const reports = page.getByRole("link", { name: "Reports" });
  await page.keyboard.press("Tab");
  await expect(reports).toBeFocused();
  await expect(reports).toHaveAccessibleDescription(
    "Every report the team has shared"
  );
  await expect(page.getByRole("tooltip")).toBeVisible();
});

test("on a link, the trigger gives it no button type", async ({ page }) => {
  await openExample(page, "tooltip", "link");
  // A link's type names the kind of file it points to; "button" there is wrong.
  await expect(page.getByRole("link", { name: "Reports" })).not.toHaveAttribute(
    "type"
  );
});

test("it holds nothing to focus", async ({ page }) => {
  await openExample(page, "tooltip", "basic");
  await page.keyboard.press("Tab");
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  await expect(tooltip.getByRole("button")).toHaveCount(0);
  await expect(tooltip.getByRole("link")).toHaveCount(0);
});
