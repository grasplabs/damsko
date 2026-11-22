import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("its words name the control it is tied to", async ({ page }) => {
  await openExample(page, "label", "basic");
  await expect(page.getByLabel("Team name")).toHaveValue("Finance");
});

test("a click on the label puts the caret in its control", async ({ page }) => {
  await openExample(page, "label", "basic");
  const field = page.getByLabel("Team name");
  await expect(field).not.toBeFocused();
  await page.getByText("Team name", { exact: true }).click();
  await expect(field).toBeFocused();
});

test("the required mark is not part of the control's name", async ({
  page,
}) => {
  await openExample(page, "label", "required");
  const field = page.getByRole("textbox", {
    name: "Project code",
    exact: true,
  });
  await expect(field).toHaveAttribute("required", "");
  await expect(page.getByText("Project code", { exact: true })).toHaveText(
    "Project code"
  );
  await page.getByText("Project code", { exact: true }).click();
  await expect(field).toBeFocused();
});
