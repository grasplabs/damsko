import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the tree is named Files; Tab lands on the chosen file, and folders say whether they are open", async ({
  page,
}) => {
  await openExample(page, "file-tree", "basic");
  const tree = page.getByRole("tree", { name: "Files" });
  const button = tree.getByRole("treeitem", { name: "button.tsx" });
  await expect(button).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await expect(
    tree.getByRole("treeitem", { name: "app", exact: true })
  ).toHaveAttribute("aria-expanded", "true");
});

test("a press on a file chooses it; a press on a folder opens or closes it and chooses nothing", async ({
  page,
}) => {
  await openExample(page, "file-tree", "basic");
  const tree = page.getByRole("tree", { name: "Files" });
  const app = tree.getByRole("treeitem", { name: "app", exact: true });
  const page_ = tree.getByRole("treeitem", { name: "page.tsx" });
  await page_.click();
  await expect(page_).toHaveAttribute("aria-selected", "true");
  await expect(
    tree.getByRole("treeitem", { name: "button.tsx" })
  ).toHaveAttribute("aria-selected", "false");

  await app.getByText("app", { exact: true }).click();
  await expect(app).toHaveAttribute("aria-expanded", "false");
  await expect(app).not.toHaveAttribute("aria-selected", "true");
  await expect(page_).toBeHidden();
  await expect(tree.getByRole("treeitem", { selected: true })).toHaveCount(0);
});

test("Enter and Space choose a file, the arrows move and open, a letter finds", async ({
  page,
}) => {
  await openExample(page, "file-tree", "basic");
  const tree = page.getByRole("tree", { name: "Files" });
  const button = tree.getByRole("treeitem", { name: "button.tsx" });
  const login = tree.getByRole("treeitem", { name: "login-form.tsx" });
  await button.focus();
  await page.keyboard.press("ArrowDown");
  await expect(login).toBeFocused();
  await page.keyboard.press("Space");
  await expect(login).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  const readme = tree.getByRole("treeitem", { name: "README.md" });
  await page.keyboard.press("Enter");
  await expect(readme).toHaveAttribute("aria-selected", "true");
  await expect(login).toHaveAttribute("aria-selected", "false");

  await page.keyboard.press("l");
  await expect(
    tree.getByRole("treeitem", { name: "layout.tsx" })
  ).toBeFocused();

  const ui = tree.getByRole("treeitem", { name: "ui", exact: true });
  await ui.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(ui).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await expect(ui).not.toHaveAttribute("aria-selected", "true");
  await expect(readme).toHaveAttribute("aria-selected", "true");
});

test("a row's button runs on a press or a key and leaves the chosen file as it was", async ({
  page,
}) => {
  await openExample(page, "file-tree", "actions");
  const tree = page.getByRole("tree", { name: "Files" });
  const index = tree.getByRole("treeitem", { name: /^index\.ts/u });
  const utils = tree.getByRole("treeitem", { name: /^utils\.ts/u });
  await expect(index).toHaveAttribute("aria-selected", "true");

  await page.getByRole("button", { name: "Download utils.ts" }).click();
  await expect(page.getByText("Downloaded src/utils.ts")).toBeVisible();
  await expect(index).toHaveAttribute("aria-selected", "true");
  await expect(utils).toHaveAttribute("aria-selected", "false");

  const download = page.getByRole("button", { name: "Download package.json" });
  await download.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Downloaded package.json")).toBeVisible();
  await expect(download).toBeFocused();
  await expect(index).toHaveAttribute("aria-selected", "true");

  await utils.click();
  await expect(page.getByText("Showing src/utils.ts")).toBeVisible();
  await expect(utils).toHaveAttribute("aria-selected", "true");
});

test("each file wears its own icon, hidden from a screen reader: the tree reads names only", async ({
  page,
}) => {
  await openExample(page, "file-tree", "icons");
  const tree = page.getByRole("tree", { name: "Files" });
  await expect(tree.getByRole("treeitem")).toHaveCount(8);
  await expect(tree.getByRole("img")).toHaveCount(0);
  await expect(
    tree.getByRole("treeitem", { name: "summary.pdf", exact: true })
  ).toBeVisible();
});
