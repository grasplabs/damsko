import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** What the page's live region last said. */
const said = (page: Page) =>
  page.getByRole("status").filter({ hasText: /\S/u }).last();

test("a press opens the field with the value chosen; Enter saves, says so, and focus goes back to the text", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "basic");
  const text = page.getByRole("button", { name: "Quarterly review" });
  await expect(text).toHaveAccessibleDescription("Edit");
  await text.click();
  const field = page.getByRole("textbox", { name: "Document name" });
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("Quarterly review");
  expect(
    await field.evaluate(
      (input: HTMLInputElement) =>
        input.selectionEnd !== null &&
        input.selectionEnd - (input.selectionStart ?? 0) === input.value.length
    )
  ).toBe(true);
  await page.keyboard.type("  Yearly review ");
  await page.keyboard.press("Enter");
  const saved = page.getByRole("button", { name: "Yearly review" });
  await expect(saved).toBeFocused();
  await expect(field).toHaveCount(0);
  await expect(said(page)).toHaveText("Changed to Yearly review");
});

test("F2 and Enter open it from the keyboard; Escape keeps the value and focus goes back to the text", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "basic");
  const text = page.getByRole("button", { name: "Quarterly review" });
  await text.focus();
  await page.keyboard.press("F2");
  const field = page.getByRole("textbox", { name: "Document name" });
  await expect(field).toBeFocused();
  await page.keyboard.type("Something else");
  await page.keyboard.press("Escape");
  await expect(field).toHaveCount(0);
  await expect(text).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("Quarterly review");
});

test("leaving the field saves, and focus stays where it went", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "basic");
  await page.getByRole("button", { name: "Quarterly review" }).click();
  await page.keyboard.type("Weekly review");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Weekly review" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Weekly review" })
  ).not.toBeFocused();
  await expect(said(page)).toHaveText("Changed to Weekly review");
});

test("an empty value keeps the value as it was", async ({ page }) => {
  await openExample(page, "inline-edit", "basic");
  await page.getByRole("button", { name: "Quarterly review" }).click();
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Quarterly review" })
  ).toBeFocused();
});

test("a value validate refuses keeps the field open, marked wrong and described by why", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "validation");
  await page.getByRole("button", { name: "Design team" }).click();
  const field = page.getByRole("textbox", { name: "Team name" });
  await page.keyboard.type("A team name far too long to keep");
  await page.keyboard.press("Enter");
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveAccessibleDescription("Up to 24 letters");
  await expect(said(page)).toHaveText("Up to 24 letters");
  await field.fill("Product design");
  await expect(field).not.toHaveAttribute("aria-invalid", "true");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Product design" })
  ).toBeFocused();
});

test("a save that takes time waits read only and says it works, then closes and says the result", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "async");
  await page.getByRole("button", { name: "Planning notes" }).click();
  const field = page.getByRole("textbox", { name: "Document name" });
  await page.keyboard.type("Launch notes");
  await page.keyboard.press("Enter");
  await expect(field).toHaveAttribute("readonly", "");
  await expect(field).toHaveAttribute("aria-busy", "true");
  await expect(field).toHaveAccessibleDescription("Working");
  await expect(
    page.getByRole("button", { name: "Launch notes" })
  ).toBeFocused();
  await expect(said(page)).toHaveText("Changed to Launch notes");
});

test("a save that fails keeps the words typed and says it could not save", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "async");
  await page.getByRole("button", { name: "Planning notes" }).click();
  const field = page.getByRole("textbox", { name: "Document name" });
  await page.keyboard.type("Roadmap");
  await page.keyboard.press("Enter");
  await expect(field).toHaveAccessibleDescription("Could not save");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveValue("Roadmap");
  await expect(field).toBeFocused();
  await expect(field).not.toHaveAttribute("readonly", "");
  await expect(said(page)).toHaveText("Could not save");
});

test("the page can open it, and Escape inside it closes only the field", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "controlled");
  await page.getByRole("button", { name: "Rename" }).click();
  const field = page.getByRole("textbox", { name: "Title" });
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("Launch plan");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Launch plan" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Launch plan" })).toBeFocused();
});

test("a field the page keeps open saves on every Enter", async ({ page }) => {
  await openExample(page, "inline-edit", "kept-open");
  const field = page.getByRole("textbox", { name: "Draft name" });
  await field.fill("Draft two");
  await field.press("Enter");
  await expect(page.getByText("Saved 1 time")).toBeVisible();
  await field.fill("Draft three");
  await field.press("Enter");
  await expect(page.getByText("Saved 2 times")).toBeVisible();
  await expect(field).toBeFocused();
});
