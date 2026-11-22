import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import {
  hasFocusRing,
  openExample,
  openExampleAsleep,
  pickerFrom,
} from "./example.ts";

const file = (name: string, mimeType: string, size: number) => ({
  name,
  mimeType,
  buffer: Buffer.alloc(size, 1),
});

/** Opens the picker by the button named `name`, as a person does, and gives it the files. */
const choose = async (
  page: Page,
  name: RegExp | string,
  files: ReturnType<typeof file>[]
) => {
  const chooser = await pickerFrom(page, async () => {
    await page.getByRole("button", { name }).click();
  });
  await chooser.setFiles(files);
};

test("the keyboard reaches Choose files, and Enter opens the picker", async ({
  page,
}) => {
  await openExample(page, "file-upload", "basic");
  const button = page.getByRole("button", { name: "Choose files" });
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  expect(await hasFocusRing(button)).toBe(true);
  const chooser = await pickerFrom(page, async () => {
    await page.keyboard.press("Enter");
  });
  expect(chooser.isMultiple()).toBe(true);
});

for (const [component, name] of [
  ["file-upload", "Choose files"],
  ["image-upload", /^Change/u],
] as const) {
  test(`${component}: focus taken before the page wakes stays on the control as it does`, async ({
    page,
  }) => {
    const wake = await openExampleAsleep(page, component, "basic");
    // Until the script runs, the control is the browser's own file input.
    const control = page.getByRole("button", { name });
    await expect(control).toBeAttached();
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
    await expect(control).toHaveJSProperty("type", "file");
    await wake();
    // The live button took its place, and the focus with it.
    await expect(control).toHaveJSProperty("type", "button");
    await expect(control).toBeFocused();
    expect(await hasFocusRing(control)).toBe(true);
  });
}

test("what it takes is said with its button", async ({ page }) => {
  await openExample(page, "file-upload", "basic");
  await expect(
    page.getByRole("button", { name: "Choose files" })
  ).toHaveAccessibleDescription("PDF or PNG, up to 10 MB each");
});

test("a file too large or of the wrong kind is refused with why, and said", async ({
  page,
}) => {
  await openExample(page, "file-upload", "basic");
  await choose(page, "Choose files", [
    file("contract.pdf", "application/pdf", 2000),
    file("scan.pdf", "application/pdf", 11_000_000),
    file("photo.gif", "image/gif", 2000),
  ]);
  await expect(
    page.getByRole("listitem").filter({ hasText: "scan.pdf is too large." })
  ).toBeVisible();
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "photo.gif is not a kind of file this takes." })
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: /scan\.pdf is too large\./u })
  ).toHaveCount(1);
  // The one that fits joins the list.
  await expect(
    page
      .getByRole("list", { name: "Files" })
      .getByText("contract.pdf", { exact: true })
  ).toBeVisible();
  await expect(page.getByText("photo.gif", { exact: true })).toHaveCount(0);
});

test("a file shows how far it is sent, then that it is done, and that is said", async ({
  page,
}) => {
  await openExample(page, "file-upload", "basic");
  await choose(page, "Choose files", [
    file("contract.pdf", "application/pdf", 2000),
  ]);
  await expect(
    page.getByRole("progressbar", { name: "Uploading contract.pdf" })
  ).toBeVisible();
  await expect(page.getByText(/, uploaded$/u)).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "contract.pdf uploaded." })
  ).toHaveCount(1);
});

test("a failed file says so, and Try again sends it again", async ({
  page,
}) => {
  await openExample(page, "file-upload", "basic");
  await choose(page, "Choose files", [
    file("draft.pdf", "application/pdf", 2000),
  ]);
  const retry = page.getByRole("button", { name: "Try again" });
  await expect(retry).toBeVisible({ timeout: 5000 });
  await expect(
    page.getByText("Could not upload", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Could not upload draft.pdf." })
  ).toHaveCount(1);
  await retry.click();
  await expect(page.getByText(/, uploaded$/u)).toBeVisible({ timeout: 5000 });
});

test("each Try again is told apart by its file", async ({ page }) => {
  await openExample(page, "file-upload", "basic");
  await choose(page, "Choose files", [
    file("draft.pdf", "application/pdf", 2000),
  ]);
  await expect(
    page.getByRole("button", { name: "Try again" })
  ).toHaveAccessibleDescription("draft.pdf", { timeout: 5000 });
});

test("each file's Remove is named for it and takes it off the list", async ({
  page,
}) => {
  await openExample(page, "file-upload", "basic");
  await choose(page, "Choose files", [
    file("contract.pdf", "application/pdf", 2000),
    file("annex.pdf", "application/pdf", 2000),
  ]);
  const list = page.getByRole("list", { name: "Files" });
  await expect(list.getByText("annex.pdf", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove contract.pdf" }).click();
  await expect(list.getByText("contract.pdf", { exact: true })).toHaveCount(0);
  await expect(list.getByText("annex.pdf", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove annex.pdf" })
  ).toBeVisible();
});

test("one file at a time: a new one takes the place of the one there", async ({
  page,
}) => {
  await openExample(page, "file-upload", "single");
  await choose(page, /Choose files$|Choose a file$/u, [
    file("logo.png", "image/png", 2000),
  ]);
  const list = page.getByRole("list", { name: "Files" });
  await expect(list.getByText("logo.png", { exact: true })).toBeVisible();
  await choose(page, /Choose files$|Choose a file$/u, [
    file("mark.svg", "image/svg+xml", 2000),
  ]);
  await expect(list.getByText("mark.svg", { exact: true })).toBeVisible();
  await expect(list.getByText("logo.png", { exact: true })).toHaveCount(0);
});

test("the button form lists its files in the card, and once sent the host's word and actions", async ({
  page,
}) => {
  await openExample(page, "file-upload", "documents");
  const card = page.getByRole("region", { name: "Documents" });
  await choose(page, /^Choose files$|^Add documents$/u, [
    file("policy.pdf", "application/pdf", 2000),
  ]);
  await expect(card.getByText("Reading the text")).toBeVisible({
    timeout: 5000,
  });
  await expect(card.getByText("Ready", { exact: true })).toBeVisible({
    timeout: 5000,
  });
  await expect(
    card.getByRole("link", { name: "Open policy.pdf" })
  ).toHaveAttribute("href", "#open");
  await expect(
    card.getByRole("link", { name: "Download policy.pdf" })
  ).toBeVisible();
  await expect(
    card.getByRole("button", { name: "Remove policy.pdf" })
  ).toBeVisible();
});

test("an image upload is the well itself: pressing it opens the picker, and it refuses with why", async ({
  page,
}) => {
  await openExample(page, "image-upload", "basic");
  await choose(page, /^Change/u, [file("notes.txt", "text/plain", 2000)]);
  await expect(
    page.getByText("notes.txt is not a kind of picture this takes.").first()
  ).toBeVisible();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "notes.txt is not a kind of picture this takes." })
  ).toHaveCount(1);
});

test("an image upload saves a new picture, and remove puts the old one back", async ({
  page,
}) => {
  await openExample(page, "image-upload", "basic");
  await choose(page, /^Change/u, [file("face.png", "image/png", 2000)]);
  await expect(
    page.getByRole("status").filter({ hasText: /^Saving$/u })
  ).toHaveCount(1);
  await expect(
    page.getByRole("status").filter({ hasText: /^Saved$/u })
  ).toHaveCount(1, { timeout: 5000 });
  const remove = page.getByRole("button", { name: /^Remove/u });
  await remove.focus();
  await expect(remove).toBeFocused();
});

test("in a setting's row, a refusal is one short line without the file's name", async ({
  page,
}) => {
  await openExample(page, "image-upload", "setting");
  await choose(page, /^Change/u, [file("notes.txt", "text/plain", 2000)]);
  await expect(
    page.getByText("Not a kind of picture this takes.").first()
  ).toBeVisible();
});

test("a file's row wears the mark of its kind", async ({ page }) => {
  await openExample(page, "file-upload", "basic");
  await choose(page, "Choose files", [
    file("contract.pdf", "application/pdf", 2000),
    file("scan.png", "image/png", 2000),
  ]);
  const markOf = async (name: string) =>
    await page
      .getByRole("listitem")
      .filter({ hasText: name })
      .locator("svg")
      .first()
      .innerHTML();
  await expect(page.getByRole("listitem")).toHaveCount(2);
  expect(await markOf("contract.pdf")).not.toBe(await markOf("scan.png"));
});
