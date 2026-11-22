import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("its words are read and its trigger is a button named for the checkpoint", async ({
  page,
}) => {
  await openExample(page, "checkpoint", "demo");
  await expect(page.getByText("Button renamed")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Restore to Button renamed" })
  ).toBeVisible();
  await expect(page.getByRole("separator")).toHaveCount(0);
});

test("its tooltip opens on hover and describes the trigger", async ({
  page,
}) => {
  await openExample(page, "checkpoint", "demo");
  const trigger = page.getByRole("button", {
    name: "Restore to Button renamed",
  });
  await trigger.hover();
  await expect(page.getByRole("tooltip")).toHaveText(
    "Drops the messages after this point"
  );
  await expect(trigger).toHaveAccessibleDescription(
    "Drops the messages after this point"
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toBeHidden();
});

test("the keyboard reaches the trigger with a ring, and Enter drops the messages after it", async ({
  page,
}) => {
  await openExample(page, "checkpoint", "demo");
  await expect(page.getByText("Update the docs to match.")).toBeVisible();
  const trigger = page.getByRole("button", {
    name: "Restore to Button renamed",
  });
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  expect(await hasFocusRing(trigger)).toBe(true);
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Update the docs to match.")).toBeHidden();
  await expect(
    page.getByText("Renamed Button to Action in components/ui/button.tsx.")
  ).toBeVisible();
});

test("with nothing after it, the trigger is out of use but keeps focus, and its tooltip says why", async ({
  page,
}) => {
  await openExample(page, "checkpoint", "demo");
  const trigger = page.getByRole("button", {
    name: "Restore to Button renamed",
  });
  await trigger.click();
  await expect(trigger).toBeDisabled();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAccessibleDescription(
    "Nothing after this point to drop"
  );
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Update the docs to match.")).toBeVisible();
  await expect(trigger).toBeEnabled();
});

test("a trigger with no tooltip is a plain button, and the mark says nothing", async ({
  page,
}) => {
  await openExample(page, "checkpoint", "icon");
  const trigger = page.getByRole("button", { name: "Restore to Draft saved" });
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(trigger).toHaveAccessibleDescription("");
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Restore to 10:42" })
  ).toBeVisible();
});
