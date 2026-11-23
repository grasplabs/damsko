import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("Tab lands on the chosen item; Up and Down move, Right opens and enters, Left closes and goes up", async ({
  page,
}) => {
  await openExample(page, "tree-view", "files");
  const tree = page.getByRole("tree", { name: "Files" });
  const reports = tree.getByRole("treeitem", { name: "Reports", exact: true });
  const summary = tree.getByRole("treeitem", { name: "Quarterly summary" });
  const archive = tree.getByRole("treeitem", { name: "Archive" });
  await page.keyboard.press("Tab");
  await expect(summary).toBeFocused();
  await expect(summary).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(archive).toBeFocused();
  await expect(archive).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("ArrowRight");
  await expect(archive).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowRight");
  await expect(
    tree.getByRole("treeitem", { name: "Summary 2025" })
  ).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(archive).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(archive).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("ArrowLeft");
  await expect(reports).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(reports).toHaveAttribute("aria-expanded", "false");
  await expect(summary).toBeHidden();
});

test("each item says its level, and a branch whether it is open", async ({
  page,
}) => {
  await openExample(page, "tree-view", "files");
  const tree = page.getByRole("tree", { name: "Files" });
  const reports = tree.getByRole("treeitem", { name: "Reports", exact: true });
  await expect(reports).toHaveAttribute("aria-level", "1");
  await expect(reports).toHaveAttribute("aria-expanded", "true");
  await expect(
    tree.getByRole("treeitem", { name: "Quarterly summary" })
  ).toHaveAttribute("aria-level", "2");
  await expect(
    tree.getByRole("treeitem", { name: "Supplier list" })
  ).not.toHaveAttribute("aria-expanded");
});

test("Home and End jump, a letter finds the next item, Space chooses, and * opens every branch beside", async ({
  page,
}) => {
  await openExample(page, "tree-view", "files");
  const tree = page.getByRole("tree", { name: "Files" });
  const summary = tree.getByRole("treeitem", { name: "Quarterly summary" });
  await summary.focus();
  await page.keyboard.press("End");
  const office = tree.getByRole("treeitem", { name: "Office move plan" });
  await expect(office).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    tree.getByRole("treeitem", { name: "Reports", exact: true })
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const survey = tree.getByRole("treeitem", { name: "Team survey results" });
  await expect(survey).toBeFocused();
  await page.keyboard.press("Space");
  await expect(survey).toHaveAttribute("aria-selected", "true");
  await expect(summary).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("*");
  await expect(tree.getByRole("treeitem", { name: "Archive" })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  await page.keyboard.press("q");
  await expect(summary).toBeFocused();
});

test("several can be chosen: Shift with Down adds the next", async ({
  page,
}) => {
  await openExample(page, "tree-view", "multiple");
  const tree = page.getByRole("tree", { name: "People" });
  await expect(tree).toHaveAttribute("aria-multiselectable", "true");
  const amara = tree.getByRole("treeitem", { name: "Amara Okafor" });
  const jonas = tree.getByRole("treeitem", { name: "Jonas Weber" });
  await expect(amara).toHaveAttribute("aria-selected", "true");
  await expect(
    tree.getByRole("treeitem", { name: "Sam Patel" })
  ).toHaveAttribute("aria-selected", "true");
  await amara.focus();
  await page.keyboard.press("Shift+ArrowDown");
  await expect(jonas).toBeFocused();
  await expect(jonas).toHaveAttribute("aria-selected", "true");
  await expect(amara).toHaveAttribute("aria-selected", "true");
});

test("a branch's children load the first time it opens, and say so while they do", async ({
  page,
}) => {
  await openExample(page, "tree-view", "lazy");
  const tree = page.getByRole("tree", { name: "Archive" });
  const year = tree.getByRole("treeitem", { name: "2026", exact: true });
  await year.focus();
  await page.keyboard.press("ArrowRight");
  await expect(year).toHaveAttribute("aria-busy", "true");
  await expect(
    tree.getByRole("treeitem", { name: "January 2026" })
  ).toBeVisible();
  await expect(year).not.toHaveAttribute("aria-busy", "true");
});

test("in a tree of pages the open page is the current page and its branch is open; Enter goes", async ({
  page,
}) => {
  await openExample(page, "tree-view", "pages");
  const tree = page.getByRole("tree", { name: "Pages" });
  const reminders = tree.getByRole("treeitem", { name: "Setting reminders" });
  await expect(reminders).toHaveAttribute("aria-current", "page");
  await expect(tree.getByRole("treeitem", { name: "Guides" })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  await page.keyboard.press("Tab");
  await expect(reminders).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  const sharing = tree.getByRole("treeitem", { name: "Sharing a report" });
  await expect(sharing).toHaveAttribute("aria-current", "page");
  await expect(reminders).not.toHaveAttribute("aria-current", "page");
});

test("a row that is a link takes no Tab stop of its own, and Enter follows it", async ({
  page,
}) => {
  await openExample(page, "tree-view", "links");
  const tree = page.getByRole("tree", { name: "Knowledge" });
  const pricing = tree.getByRole("link", { name: "Pricing for next year" });
  await expect(pricing).toHaveAttribute("aria-current", "page");
  await expect(pricing).toHaveAttribute("tabindex", "-1");
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(
    tree.getByRole("link", { name: /Supplier terms/u })
  ).toHaveAttribute("aria-current", "page");
  await expect(pricing).not.toHaveAttribute("aria-current", "page");
});

test("the filter keeps the items that hold its words with their folders open; Escape brings the folds back", async ({
  page,
}) => {
  await openExample(page, "tree-view", "filter");
  const field = page.getByRole("searchbox", { name: "Filter" });
  const tree = page.getByRole("tree", { name: "Files" });
  await field.fill("invoice");
  await expect(tree.getByRole("treeitem")).toHaveCount(6);
  await expect(
    tree.getByRole("treeitem", { name: "invoice-row.tsx" })
  ).toBeVisible();
  await expect(
    tree.getByRole("treeitem", { name: "components" })
  ).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await expect(tree.getByRole("treeitem").first()).toBeFocused();
  await field.fill("nothing like it");
  await expect(page.getByText("No matches")).toBeVisible();
  await field.press("Escape");
  await expect(field).toHaveValue("");
  await expect(
    tree.getByRole("treeitem", { name: "components" })
  ).toHaveAttribute("aria-expanded", "false");
  await expect(tree.getByRole("treeitem", { name: "app.tsx" })).toBeVisible();
});

test("a row's buttons are not part of its name: the row reads its own words, and its badge", async ({
  page,
}) => {
  await openExample(page, "tree-view", "actions");
  const tree = page.getByRole("tree", { name: "Files" });
  const notes = tree.getByRole("treeitem", { name: "notes.md", exact: true });
  await expect(notes).toBeVisible();
  await expect(
    tree.getByRole("treeitem", { name: "reports 3", exact: true })
  ).toBeVisible();
  await notes.focus();
  await expect(
    tree.getByRole("button", { name: "Rename notes.md" })
  ).toBeVisible();
  await expect(notes).toHaveAccessibleName("notes.md");
});

test("a press on a row's button is the button's: the row is not chosen, and a folder stays open", async ({
  page,
}) => {
  await openExample(page, "tree-view", "actions");
  const tree = page.getByRole("tree", { name: "Files" });
  const notes = tree.getByRole("treeitem", { name: "notes.md", exact: true });
  const reports = tree.getByRole("treeitem", { name: "reports 3" });
  await expect(notes).toHaveAttribute("aria-selected", "true");
  await tree.getByText("budget.xlsx").hover();
  await tree.getByRole("button", { name: "Rename budget.xlsx" }).click();
  await expect(page.getByText("Renaming budget.xlsx")).toBeVisible();
  await expect(notes).toHaveAttribute("aria-selected", "true");
  await tree.getByText("reports", { exact: true }).hover();
  await tree.getByRole("button", { name: "Rename reports" }).click();
  await expect(page.getByText("Renaming reports")).toBeVisible();
  await expect(reports).toHaveAttribute("aria-expanded", "true");
});

test("only the focused row's buttons are in the Tab order, whichever row the pointer is on", async ({
  page,
}) => {
  await openExample(page, "tree-view", "actions");
  const tree = page.getByRole("tree", { name: "Files" });
  const notes = tree.getByRole("treeitem", { name: "notes.md", exact: true });
  const rename = tree.getByRole("button", { name: "Rename notes.md" });
  const remove = tree.getByRole("button", { name: "Delete notes.md" });
  await notes.focus();
  // The pointer rests on another row, whose buttons show: Tab still goes to the focused row's.
  await tree.getByText("budget.xlsx").hover();
  await expect(
    tree.getByRole("button", { name: "Rename budget.xlsx" })
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(rename).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Renaming notes.md")).toBeVisible();
  await expect(rename).toBeFocused();
  await expect(notes).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Tab");
  await expect(remove).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Put back" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(notes).toBeFocused();
});

test("a row's buttons are drawn only for the row that is pointed at or holds focus", async ({
  page,
}) => {
  await openExample(page, "tree-view", "actions");
  const tree = page.getByRole("tree", { name: "Files" });
  await expect(tree.getByRole("button")).toHaveCount(0);
  await tree.getByText("budget.xlsx").hover();
  await expect(tree.getByRole("button")).toHaveCount(2);
  await tree.getByRole("treeitem", { name: "notes.md", exact: true }).focus();
  await expect(tree.getByRole("button")).toHaveCount(4);
});

test("after a row's button deletes the row, focus goes to the row after it, else the one before", async ({
  page,
}) => {
  await openExample(page, "tree-view", "actions");
  const tree = page.getByRole("tree", { name: "Files" });
  await tree
    .getByRole("treeitem", { name: "budget.xlsx", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(
    tree.getByRole("button", { name: "Delete budget.xlsx" })
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Deleted budget.xlsx")).toBeVisible();
  const plan = tree.getByRole("treeitem", { name: "plan.md", exact: true });
  await expect(plan).toBeFocused();
  // The last of its folder: the row after it is the next one down the tree.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(
    tree.getByRole("treeitem", { name: "readme.md", exact: true })
  ).toBeFocused();
});

test("a folder that cannot be chosen opens and closes, and the chosen file stays", async ({
  page,
}) => {
  await openExample(page, "tree-view", "actions");
  const tree = page.getByRole("tree", { name: "Files" });
  const notes = tree.getByRole("treeitem", { name: "notes.md", exact: true });
  const reports = tree.getByRole("treeitem", { name: "reports 3" });
  await expect(notes).toHaveAttribute("aria-selected", "true");
  await expect(reports).not.toHaveAttribute("aria-selected");
  await tree.getByText("reports", { exact: true }).click();
  await expect(reports).toHaveAttribute("aria-expanded", "false");
  await reports.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Enter");
  await expect(reports).not.toHaveAttribute("aria-selected");
  await page.keyboard.press("End");
  const readme = tree.getByRole("treeitem", { name: "readme.md", exact: true });
  await expect(readme).toBeFocused();
  await page.keyboard.press("Space");
  await expect(readme).toHaveAttribute("aria-selected", "true");
  await expect(tree.getByRole("treeitem", { selected: true })).toHaveCount(1);
});

test("files wear an icon for their kind, hidden from a screen reader: the tree reads names only", async ({
  page,
}) => {
  await openExample(page, "tree-view", "file-icons");
  const tree = page.getByRole("tree", { name: "Report" });
  await expect(tree.getByRole("treeitem")).toHaveCount(7);
  await expect(tree.getByRole("img")).toHaveCount(0);
  await expect(
    tree.getByRole("treeitem", { name: "summary.pdf", exact: true })
  ).toBeVisible();
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("the buttons of the rows in view are there to tap, and Tab still goes only through the focused row's", async ({
    page,
  }) => {
    await openExample(page, "tree-view", "actions");
    const tree = page.getByRole("tree", { name: "Files" });
    await expect(
      tree.getByRole("button", { name: "Delete budget.xlsx" })
    ).toBeVisible();
    await tree.getByRole("button", { name: "Rename plan.md" }).tap();
    await expect(page.getByText("Renaming plan.md")).toBeVisible();
    await tree.getByRole("treeitem", { name: "notes.md", exact: true }).focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(
      tree.getByRole("button", { name: "Delete notes.md" })
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Put back" })).toBeFocused();
  });

  test("a row is 44px tall", async ({ page }) => {
    await openExample(page, "tree-view", "files");
    const row = page
      .getByRole("treeitem", { name: "Supplier list" })
      .getByText("Supplier list");
    const height = await row.evaluate(
      (element) =>
        element.closest("[role=treeitem] > *")?.getBoundingClientRect()
          .height ?? 0
    );
    expect(height).toBeGreaterThanOrEqual(44);
  });
});
