import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("it is a group named by its label, and Tab reaches every button in turn", async ({
  page,
}) => {
  await openExample(page, "button-group", "basic");
  const group = page.getByRole("group", { name: "Message actions" });
  await expect(group).toBeVisible();
  const buttons = group.getByRole("button");
  await expect(buttons).toHaveCount(3);
  await buttons.first().focus();
  await page.keyboard.press("Tab");
  await expect(group.getByRole("button", { name: "Snooze" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(group.getByRole("button", { name: "Delete" })).toBeFocused();
});

test("a press does what it says, with Undo in a toast", async ({ page }) => {
  await openExample(page, "button-group", "basic");
  await page.getByRole("button", { name: "Archive" }).click();
  await expect(
    page.getByRole("region", { name: "Notifications" }).getByText("Archived")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
});

test("icon-only buttons are named, and a style stays pressed until Undo takes it back", async ({
  page,
}) => {
  await openExample(page, "button-group", "icons");
  const style = page.getByRole("group", { name: "Text style" });
  const bold = style.getByRole("button", { name: "Bold" });
  const italic = style.getByRole("button", { name: "Italic" });
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  await expect(italic).toHaveAttribute("aria-pressed", "false");
  await italic.click();
  await expect(italic).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("group", { name: "History" })
    .getByRole("button", { name: "Undo" })
    .click();
  await expect(italic).toHaveAttribute("aria-pressed", "false");
  await expect(bold).toHaveAttribute("aria-pressed", "true");
});

test("stacked, it says so, its buttons are as wide as each other, and one choice is held", async ({
  page,
}) => {
  await openExample(page, "button-group", "vertical");
  const group = page.getByRole("group", { name: "Sort projects" });
  await expect(group).toHaveAttribute("aria-orientation", "vertical");
  const widths = await group
    .getByRole("button")
    .evaluateAll((all) =>
      all.map((button) => Math.round(button.getBoundingClientRect().width))
    );
  expect(new Set(widths).size).toBe(1);
  await group.getByRole("button", { name: "By name" }).click();
  await expect(group.getByRole("button", { name: "By name" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(
    group.getByRole("button", { name: "Newest first" })
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Sorted by name")).toBeVisible();
});

test("the split button's menu opens from its trigger in the group, and an item works", async ({
  page,
}) => {
  await openExample(page, "button-group", "split");
  const group = page.getByRole("group", { name: "Merge" });
  const more = group.getByRole("button", { name: "More ways to merge" });
  await more.click();
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("menuitem", { name: "Squash and merge" }).click();
  await expect(
    page
      .getByRole("region", { name: "Notifications" })
      .getByText("Squashed and merged")
  ).toBeVisible();
  await group.getByRole("button", { name: "Merge changes" }).click();
  await expect(group.getByRole("button", { name: "Merged" })).toBeVisible();
});

test("the buttons' corners are the group's at the ends and square between", async ({
  page,
}) => {
  await openExample(page, "button-group", "sizes");
  const corners = await page.getByRole("group").evaluateAll((groups) =>
    groups.map((group) => {
      const [first] = [...group.querySelectorAll("button")];
      return first === undefined
        ? { own: "", first: "-", between: "" }
        : {
            own: getComputedStyle(group).borderStartStartRadius,
            first: getComputedStyle(first).borderStartStartRadius,
            between: getComputedStyle(first).borderStartEndRadius,
          };
    })
  );
  expect(corners).toHaveLength(3);
  for (const corner of corners) {
    expect(corner.first).toBe(corner.own);
    expect(corner.between).toBe("0px");
  }
});

test("words drawn as a Label keep the text's look and still name their control", async ({
  page,
}) => {
  await openExample(page, "button-group", "text");
  const words = page.getByText("Zoom", { exact: true });
  const muted = await words.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--damsko-muted-foreground)";
    element.after(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });
  await expect(words).toHaveCSS("color", muted);
  // The text's room at its sides, which a Label has none of.
  await expect(words).toHaveCSS("padding-inline-start", "12px");
  await expect(page.getByRole("button", { name: /^Zoom/u })).toHaveText("100%");
});
