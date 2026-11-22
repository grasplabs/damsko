import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("a press turns it on and off, and says so", async ({ page }) => {
  await openExample(page, "toggle", "alone");
  const bold = page.getByRole("button", { name: "Bold" });
  const italic = page.getByRole("button", { name: "Italic" });
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  await expect(italic).toHaveAttribute("aria-pressed", "false");
  await italic.click();
  await expect(italic).toHaveAttribute("aria-pressed", "true");
  await bold.click();
  await expect(bold).toHaveAttribute("aria-pressed", "false");
});

test("Space and Enter turn it on and off from the keyboard", async ({
  page,
}) => {
  await openExample(page, "toggle", "words");
  const toggle = page.getByRole("button", { name: "Show archived" });
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});

test("in a group, one is pressed at a time, and the pressed one stays", async ({
  page,
}) => {
  await openExample(page, "toggle", "group");
  const group = page.getByRole("group", { name: "View" });
  const list = group.getByRole("button", { name: "List" });
  const board = group.getByRole("button", { name: "Board" });
  await expect(list).toHaveAttribute("aria-pressed", "true");
  await board.click();
  await expect(board).toHaveAttribute("aria-pressed", "true");
  await expect(list).toHaveAttribute("aria-pressed", "false");
  // `deselectable={false}`: a press on the pressed one keeps it on.
  await board.click();
  await expect(board).toHaveAttribute("aria-pressed", "true");
});

test("with `multiple`, each is pressed on its own", async ({ page }) => {
  await openExample(page, "toggle", "multiple");
  const group = page.getByRole("group", { name: "Text style" });
  const bold = group.getByRole("button", { name: "Bold" });
  const italic = group.getByRole("button", { name: "Italic" });
  await italic.click();
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  await expect(italic).toHaveAttribute("aria-pressed", "true");
  await bold.click();
  await expect(bold).toHaveAttribute("aria-pressed", "false");
  await expect(italic).toHaveAttribute("aria-pressed", "true");
});

test("a group is one tab stop, and the arrows move between its toggles", async ({
  page,
}) => {
  await openExample(page, "toggle", "group");
  const group = page.getByRole("group", { name: "View" });
  const list = group.getByRole("button", { name: "List" });
  const board = group.getByRole("button", { name: "Board" });
  const calendar = group.getByRole("button", { name: "Calendar" });
  await page.keyboard.press("Tab");
  await expect(list).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(board).toBeFocused();
  await page.keyboard.press("End");
  await expect(calendar).toBeFocused();
  // The arrows wrap.
  await page.keyboard.press("ArrowRight");
  await expect(list).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(calendar).toBeFocused();
  await page.keyboard.press("Space");
  await expect(calendar).toHaveAttribute("aria-pressed", "true");
  await expect(list).toHaveAttribute("aria-pressed", "false");
  // Out of the group in one step, and back in on the one it left.
  await page.keyboard.press("Shift+Tab");
  await expect(calendar).not.toBeFocused();
  await page.keyboard.press("Tab");
  await expect(calendar).toBeFocused();
});

test("out of use, alone or in a group, a press changes nothing", async ({
  page,
}) => {
  await openExample(page, "toggle", "disabled");
  const alone = page.getByRole("button", { name: "Show archived" });
  await expect(alone).toBeDisabled();
  await expect(alone).toHaveAttribute("aria-pressed", "true");
  const group = page.getByRole("group", { name: "View" });
  const board = group.getByRole("button", { name: "Board" });
  await board.click({ force: true });
  await expect(board).toHaveAttribute("aria-pressed", "false");
  await expect(group.getByRole("button", { name: "List" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

test("the outline variant is a toggle like any other", async ({ page }) => {
  await openExample(page, "toggle", "outline");
  const toggle = page.getByRole("button", { name: "Show archived" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});
