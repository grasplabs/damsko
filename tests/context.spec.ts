import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the trigger is a button named by the share of the window used", async ({
  page,
}) => {
  await openExample(page, "context", "basic");
  await expect(
    page.getByRole("button", { name: "8% context", exact: true })
  ).toBeVisible();
});

test("resting on the trigger opens the card: tokens used of the most, the bar, a row per kind", async ({
  page,
}) => {
  await openExample(page, "context", "basic");
  await page.getByRole("button", { name: "8% context" }).hover();
  await expect(page.getByText("Context", { exact: true })).toBeVisible();
  await expect(page.getByText("11K / 128K")).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Context used" })
  ).toHaveAttribute("aria-valuenow", /^8\.3/u);
  await expect(page.getByText("Input")).toBeVisible();
  await expect(page.getByText("8.4K")).toBeVisible();
  await expect(page.getByText("Reasoning")).toBeVisible();
  // No cost given: no footer.
  await expect(page.getByText("Total cost")).toHaveCount(0);
});

test("the keyboard opens the card from the trigger, and Escape closes it", async ({
  page,
}) => {
  await openExample(page, "context", "basic");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "8% context" })).toBeFocused();
  await expect(page.getByText("11K / 128K")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("11K / 128K")).toBeHidden();
});

test("costs the caller gives are shown by kind and in all, in their currency", async ({
  page,
}) => {
  await openExample(page, "context", "cost");
  await expect(page.getByText("Cache")).toBeVisible();
  await expect(page.getByText("$0.03")).toBeVisible();
  await expect(page.getByText("Total cost")).toBeVisible();
  await expect(page.getByText("$0.48")).toBeVisible();
});

test("numbers follow the provider's locale", async ({ page }) => {
  await openExample(page, "context", "locale");
  const trigger = page.getByRole("button", { name: /context$/u });
  await expect(trigger).toHaveText(/45\s%\scontext/u);
  await trigger.hover();
  await expect(page.getByText(/57\sk\s\/\s128\sk/u)).toBeVisible();
  await expect(page.getByText(/0,19\s€/u)).toBeVisible();
});
