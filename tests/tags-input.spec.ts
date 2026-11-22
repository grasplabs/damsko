import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** The tags: each a group named by its words, round its remove button. */
const chips = (page: Page): Locator =>
  page.getByRole("group").filter({ has: page.getByRole("button") });

/** The tags' words, in order. */
const tags = async (page: Page): Promise<string[]> =>
  await chips(page).evaluateAll((groups) =>
    groups.map((group) => group.getAttribute("aria-label") ?? "")
  );

/** Types words into the field and presses Enter. */
const add = async (page: Page, field: Locator, word: string): Promise<void> => {
  await field.fill(word);
  await page.keyboard.press("Enter");
};

/** The refusal under the field, said in its status region. */
const refusal = (page: Page, words: string): Locator =>
  page.getByRole("status").filter({ hasText: words });

test("Enter and a comma add what was typed, and the field empties", async ({
  page,
}) => {
  await openExample(page, "tags-input", "basic");
  const field = page.getByRole("combobox", { name: "Labels" });
  await expect
    .poll(async () => await tags(page))
    .toEqual(["Quarterly", "Finance"]);
  await field.fill("Research");
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => await tags(page))
    .toEqual(["Quarterly", "Finance", "Research"]);
  await expect(field).toHaveValue("");
  await field.pressSequentially("Hiring,");
  await expect.poll(async () => await tags(page)).toContain("Hiring");
  await expect(field).toHaveValue("");
});

test("pasted words split on commas and lines, each added once", async ({
  page,
}) => {
  await openExample(page, "tags-input", "basic");
  const field = page.getByRole("combobox", { name: "Labels" });
  await field.focus();
  await field.evaluate((input) => {
    const data = new DataTransfer();
    data.setData("text/plain", "Budget, Roadmap\nHiring");
    input.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      })
    );
  });
  await expect
    .poll(async () => await tags(page))
    .toEqual(["Quarterly", "Finance", "Budget", "Roadmap", "Hiring"]);
});

test("a value already there, capitals and all, is refused, and the field says why until it no longer holds", async ({
  page,
}) => {
  await openExample(page, "tags-input", "basic");
  const field = page.getByRole("combobox", { name: "Labels" });
  await add(page, field, "Finance");
  await expect(refusal(page, '"Finance" is already added.')).toBeVisible();
  await expect(field).toHaveAccessibleDescription(
    /"Finance" is already added/u
  );
  await add(page, field, "finance");
  await expect(refusal(page, '"finance" is already added.')).toBeVisible();
  await expect
    .poll(async () => await tags(page))
    .toEqual(["Quarterly", "Finance"]);
  await add(page, field, "Research");
  await expect(page.getByText(/is already added/u)).toHaveCount(0);
});

test("one past max is refused with the reason", async ({ page }) => {
  await openExample(page, "tags-input", "many");
  const field = page.getByRole("combobox", { name: "Keywords" });
  await add(page, field, "design");
  await add(page, field, "sales");
  await add(page, field, "legal");
  await expect(refusal(page, "Up to 8.")).toBeVisible();
  await expect(chips(page)).toHaveCount(8);
  await expect.poll(async () => await tags(page)).not.toContain("legal");
});

test("Backspace in the empty field first goes to the last tag, and a second takes it away", async ({
  page,
}) => {
  await openExample(page, "tags-input", "basic");
  const field = page.getByRole("combobox", { name: "Labels" });
  await field.click();
  await page.keyboard.press("Backspace");
  await expect(page.getByRole("group", { name: "Finance" })).toBeFocused();
  await expect
    .poll(async () => await tags(page))
    .toEqual(["Quarterly", "Finance"]);
  await page.keyboard.press("Backspace");
  await expect.poll(async () => await tags(page)).toEqual(["Quarterly"]);
  await expect(page.getByRole("group", { name: "Quarterly" })).toBeFocused();
});

test("the arrow keys move from the field to the tags and back", async ({
  page,
}) => {
  await openExample(page, "tags-input", "basic");
  const field = page.getByRole("combobox", { name: "Labels" });
  await field.click();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("group", { name: "Finance" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("group", { name: "Quarterly" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(field).toBeFocused();
});

test("removing a tag moves focus to the next tag's remove button, then the one before, then the field", async ({
  page,
}) => {
  await openExample(page, "tags-input", "basic");
  const field = page.getByRole("combobox", { name: "Labels" });
  await page
    .getByRole("group", { name: "Quarterly" })
    .getByRole("button")
    .focus();
  await page.keyboard.press("Enter");
  await expect.poll(async () => await tags(page)).toEqual(["Finance"]);
  await expect(
    page.getByRole("group", { name: "Finance" }).getByRole("button")
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(async () => await tags(page)).toEqual([]);
  await expect(field).toBeFocused();
});

test("each remove button is named for its tag", async ({ page }) => {
  await openExample(page, "tags-input", "basic");
  await expect(
    page.getByRole("group", { name: "Quarterly" }).getByRole("button")
  ).toHaveAccessibleName("Remove Quarterly");
  await expect(
    page.getByRole("group", { name: "Finance" }).getByRole("button")
  ).toHaveAccessibleName("Remove Finance");
});

test("suggestions open as you type, at least as wide as the field, and a choice is added", async ({
  page,
}) => {
  await openExample(page, "tags-input", "suggestions");
  const field = page.getByRole("combobox", { name: "Teams" });
  await field.click();
  await field.pressSequentially("Res");
  const list = page.getByRole("listbox").filter({ visible: true });
  await expect(list.getByRole("option", { name: "Research" })).toBeVisible();
  const fieldBox = await field.evaluate(
    (input) => input.parentElement?.getBoundingClientRect().width ?? 0
  );
  // The popup round the list: the top-layer element that holds it.
  const listBox = await list.evaluate(
    (element) =>
      (element.closest("[popover]") ?? element).getBoundingClientRect().width
  );
  expect(listBox + 1).toBeGreaterThanOrEqual(fieldBox);
  await list.getByRole("option", { name: "Research" }).click();
  await expect
    .poll(async () => await tags(page))
    .toEqual(["Design", "Research"]);
});

test("a wrong value is kept, marked, and described by why", async ({
  page,
}) => {
  await openExample(page, "tags-input", "invalid");
  const wrong = page.getByRole("group", { name: "mira@contoso" });
  await expect(wrong).toContainText("not an email address");
  await expect(
    page.getByRole("group", { name: "jonas@contoso.example" })
  ).not.toContainText("not an email address");
  await expect(
    page.getByRole("combobox", { name: "Email addresses" })
  ).toHaveAttribute("aria-invalid", "true");
});

test("a wrong tag is described by its reason, and its remove button is named for it", async ({
  page,
}) => {
  await openExample(page, "tags-input", "invalid");
  await expect(
    page.getByRole("group", { name: "mira@contoso" })
  ).toHaveAccessibleDescription(/not an email address/u);
  await expect(
    page.getByRole("button", { name: "Remove mira@contoso" })
  ).toBeVisible();
});

test("in a form each tag is sent under the Field's name, a reset brings the first tags back, and a disabled Field takes the field", async ({
  page,
}) => {
  await openExample(page, "tags-input", "form");
  const field = page.getByRole("combobox", { name: "Labels", exact: true });
  await field.fill("Sales");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status", { name: "Sent" })).toHaveText(
    "Design, Research, Sales"
  );
  await page.getByRole("button", { name: "Reset" }).click();
  await expect
    .poll(async () => await tags(page))
    .toEqual(["Design", "Research"]);
  await expect(
    page.getByRole("combobox", { name: "Archived labels" })
  ).toBeDisabled();
  await expect(page.getByRole("group", { name: "Legacy" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove Legacy" })).toHaveCount(
    0
  );
});
