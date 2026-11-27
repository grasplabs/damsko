import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { drawsWordsOnce, liveRegion, openExample, settled } from "./example.ts";

/** What the page's live region last said. */
const said = (page: Page) => liveRegion(page).filter({ hasText: /\S/u }).last();

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

test("a field that starts open takes no focus: the page stays where the reader is", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "kept-open");
  await settled(page);
  await expect(page.getByRole("textbox", { name: "Draft name" })).toBeVisible();
  // Nothing was pressed: focus is still the page's, so a page that woke the field while the
  // reader was elsewhere has not been scrolled to it.
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe(
    "BODY"
  );
});

/** Whether the field's words are all chosen. */
const allChosen = async (field: ReturnType<Page["getByRole"]>) =>
  await field.evaluate(
    (input: HTMLInputElement) =>
      input.selectionEnd !== null &&
      input.selectionEnd - (input.selectionStart ?? 0) === input.value.length
  );

test("in a popup, from the keyboard: Enter opens a titled popup with the words chosen, Escape keeps the name, and Save saves; focus goes back to the text", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "popup");
  const text = page.getByRole("button", { name: "Planning notes" });
  await expect(text).toHaveAttribute("aria-haspopup", "dialog");
  await text.focus();
  await page.keyboard.press("Enter");
  const popup = page.getByRole("dialog", { name: "Rename" });
  const field = popup.getByRole("textbox", { name: "Rename" });
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("Planning notes");
  expect(await allChosen(field)).toBe(true);
  await page.keyboard.type("Something else");
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
  await expect(text).toBeFocused();
  // F2 opens it again, from the name as it is; Tab reaches Cancel, then Save.
  await page.keyboard.press("F2");
  await expect(field).toHaveValue("Planning notes");
  await page.keyboard.type("Launch notes");
  await page.keyboard.press("Tab");
  await expect(popup.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(popup.getByRole("button", { name: "Save" })).toBeFocused();
  await page.keyboard.press("Enter");
  const saved = page.getByRole("button", { name: "Launch notes" });
  await expect(saved).toBeFocused();
  await expect(popup).toBeHidden();
  await expect(said(page)).toHaveText("Changed to Launch notes");
});

test("in a popup, a save that fails keeps it open with the words typed and the caller's words; the field stops at maxLength", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "popup");
  await page.getByRole("button", { name: "Planning notes" }).click();
  const popup = page.getByRole("dialog", { name: "Rename" });
  const field = popup.getByRole("textbox", { name: "Rename" });
  await expect(field).toHaveAttribute("maxlength", "60");
  await page.keyboard.type("Roadmap");
  await page.keyboard.press("Enter");
  // While it works the field is read only and Save waits.
  await expect(field).toHaveAttribute("readonly", "");
  await expect(popup.getByRole("button", { name: "Save" })).toHaveAttribute(
    "aria-busy",
    "true"
  );
  const why = "Could not rename: that name is already taken";
  await expect(field).toHaveAccessibleDescription(why);
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveValue("Roadmap");
  await expect(popup).toBeVisible();
  await expect(said(page)).toHaveText(why);
  // Cancel keeps the name, and gives the focus back to it.
  await popup.getByRole("button", { name: "Cancel" }).click();
  await expect(popup).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Planning notes" })
  ).toBeFocused();
});

test("in a popup, a rename right after a rename is tracked: Save waits, a second Enter sends nothing more, and the name follows", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "popup");
  await page.getByRole("button", { name: "Planning notes" }).click();
  const popup = page.getByRole("dialog", { name: "Rename" });
  const field = popup.getByRole("textbox", { name: "Rename" });
  await page.keyboard.type("Launch notes");
  await page.keyboard.press("Enter");
  const first = page.getByRole("button", { name: "Launch notes" });
  await expect(first).toBeFocused();
  // At once, while "Changed" may still show: F2, a new name, Enter, and Enter again.
  await page.keyboard.press("F2");
  await page.keyboard.type("Launch plan");
  await page.keyboard.press("Enter");
  await expect(field).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Launch plan" })).toBeFocused();
  await expect(said(page)).toHaveText("Changed to Launch plan");
});

test("in a popup, a press on the text while it is open closes it rather than opening it again", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "popup");
  const text = page.getByRole("button", { name: "Planning notes" });
  await text.click();
  const popup = page.getByRole("dialog", { name: "Rename" });
  await page.keyboard.type("Half typed");
  await text.click();
  await expect(popup).toBeHidden();
  await expect(text).toHaveAttribute("aria-expanded", "false");
});

test("in a popup, Enter and Escape while an input method composes neither save nor close", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "popup");
  await page.getByRole("button", { name: "Planning notes" }).click();
  const popup = page.getByRole("dialog", { name: "Rename" });
  const field = popup.getByRole("textbox", { name: "Rename" });
  await page.keyboard.type("nihon");
  await field.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart"));
    for (const key of ["Enter", "Escape"]) {
      element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key,
          isComposing: true,
          bubbles: true,
          cancelable: true,
        })
      );
    }
  });
  await expect(popup).toBeVisible();
  await expect(field).toHaveValue("nihon");
  await field.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionend"));
  });
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
});

test("inline, a long name scrolled to the caret is drawn once while a save works and after it fails", async ({
  page,
}) => {
  await openExample(page, "inline-edit", "async");
  await page.getByRole("button", { name: "Planning notes" }).click();
  const field = page.getByRole("textbox", { name: "Document name" });
  // Longer than the field, scrolled to the caret at its end, and taken, so the save fails.
  await page.keyboard.type(
    "Roadmap for every team, and the policies that apply to each of them"
  );
  await page.keyboard.press("Enter");
  await expect(field).toHaveAttribute("readonly", "");
  expect(
    await field.evaluate((input: HTMLInputElement) => input.scrollLeft)
  ).toBeGreaterThan(0);
  expect(await drawsWordsOnce(field)).toBe(true);
  await expect(field).toHaveAttribute("aria-invalid", "true");
  expect(await drawsWordsOnce(field)).toBe(true);
});
