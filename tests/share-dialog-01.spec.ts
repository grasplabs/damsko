import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

const open = async (page: Page) => {
  await openExample(page, "share-dialog-01", "basic");
  await page.getByRole("button", { name: "Share" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Share the spring launch plan",
  });
  await expect(dialog).toBeVisible();
  return dialog;
};

test("the dialog lists who has access, the owner saying Owner in place of a level", async ({
  page,
}) => {
  const dialog = await open(page);
  const list = dialog.getByRole("list", { name: "People with access" });
  await expect(list.getByText("Sanne de Wit")).toBeVisible();
  await expect(list.getByText("Owner")).toBeVisible();
  await expect(
    dialog.getByRole("combobox", { name: "Access for Sanne de Wit" })
  ).toHaveCount(0);
});

test("find a person, pick a level, Add: they join the list at that level and are not offered again", async ({
  page,
}) => {
  const dialog = await open(page);
  const find = dialog.getByRole("combobox", { name: "Add people or groups" });
  await find.fill("Mees");
  await page.getByRole("option", { name: "Mees Bakker" }).click();
  await dialog
    .getByRole("combobox", { name: "Access for who you add" })
    .click();
  await page.getByRole("option", { name: "Can edit" }).click();
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    dialog.getByRole("combobox", { name: "Access for Mees Bakker" })
  ).toHaveText(/Can edit/u);
  await find.fill("Mees");
  await expect(page.getByRole("option", { name: "Mees Bakker" })).toHaveCount(
    0
  );
});

test("once someone is added, the focus is back in the field, for the next", async ({
  page,
}) => {
  const dialog = await open(page);
  const find = dialog.getByRole("combobox", { name: "Add people or groups" });
  await find.fill("Mees");
  await page.getByRole("option", { name: "Mees Bakker" }).click();
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    dialog.getByRole("combobox", { name: "Access for Mees Bakker" })
  ).toBeVisible();
  await expect(find).toBeFocused();
});

test("Add waits for someone to be picked", async ({ page }) => {
  const dialog = await open(page);
  await expect(
    dialog.getByRole("button", { name: "Add", exact: true })
  ).toBeDisabled();
});

test("a row's level changes at once", async ({ page }) => {
  const dialog = await open(page);
  const level = dialog.getByRole("combobox", {
    name: "Access for Pieter de Boer",
  });
  await expect(level).toHaveText(/Can use/u);
  await level.click();
  await page.getByRole("option", { name: "Can edit" }).click();
  await expect(level).toHaveText(/Can edit/u);
});

test("Remove takes the row away, and the focus goes to a neighbour's level", async ({
  page,
}) => {
  const dialog = await open(page);
  await dialog
    .getByRole("combobox", { name: "Access for Pieter de Boer" })
    .click();
  await page.getByRole("option", { name: "Remove" }).click();
  await expect(dialog.getByText("Pieter de Boer")).toHaveCount(0);
  await expect(page.locator(":focus")).toHaveAccessibleName(/^Access for /u);
});

test("the link copies", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const dialog = await open(page);
  await dialog.getByRole("button", { name: "Copy link" }).click();
  await expect
    .poll(
      async () =>
        await page.evaluate(async () => await navigator.clipboard.readText())
    )
    .toBe("https://contoso.example/plans/spring-launch");
});

test("Done closes the dialog", async ({ page }) => {
  const dialog = await open(page);
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(dialog).toBeHidden();
});

test("a search that finds no one says so in the dialog's own words", async ({
  page,
}) => {
  const dialog = await open(page);
  await dialog
    .getByRole("combobox", { name: "Add people or groups" })
    .fill("zzz");
  await expect(page.getByText("No one has that name")).toBeVisible();
});
