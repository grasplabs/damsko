import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("each handle is a separator named by what it resizes, its value the panel before it", async ({
  page,
}) => {
  await openExample(page, "resizable", "horizontal");
  const handle = page.getByRole("separator", { name: "Resize the file list" });
  // A horizontal group's handle runs down between the panels.
  await expect(handle).toHaveAttribute("aria-orientation", "vertical");
  await expect(handle).toHaveAttribute("aria-valuenow", "35");
  await expect(handle).toHaveAttribute("aria-valuemin", "20");
  await expect(handle).toHaveAttribute("aria-valuemax", "100");
});

test("the keyboard reaches a handle and moves it: arrows a step, Shift ten, Home and End to its ends", async ({
  page,
}) => {
  await openExample(page, "resizable", "horizontal");
  const handle = page.getByRole("separator", { name: "Resize the file list" });
  await page.keyboard.press("Tab");
  await expect(handle).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "36");
  await page.keyboard.press("ArrowLeft");
  await expect(handle).toHaveAttribute("aria-valuenow", "35");
  await page.keyboard.press("Shift+ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "45");
  // Arrows across the group's axis do nothing.
  await page.keyboard.press("ArrowDown");
  await expect(handle).toHaveAttribute("aria-valuenow", "45");
  await page.keyboard.press("Home");
  await expect(handle).toHaveAttribute("aria-valuenow", "20");
  await page.keyboard.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "100");
});

test("a stacked group's handle runs across and moves with the up and down arrows", async ({
  page,
}) => {
  await openExample(page, "resizable", "vertical");
  const handle = page.getByRole("separator", { name: "Resize the results" });
  await expect(handle).toHaveAttribute("aria-orientation", "horizontal");
  await expect(handle).toHaveAttribute("aria-valuenow", "60");
  await handle.focus();
  await page.keyboard.press("ArrowDown");
  await expect(handle).toHaveAttribute("aria-valuenow", "61");
  await page.keyboard.press("ArrowUp");
  await expect(handle).toHaveAttribute("aria-valuenow", "60");
  await page.keyboard.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "60");
  // End stops where the panel after it reaches its smallest.
  await page.keyboard.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "75");
});

test("Enter folds a collapsible panel beside the handle and opens it again", async ({
  page,
}) => {
  await openExample(page, "resizable", "grip");
  const handle = page.getByRole("separator", { name: "Resize the folders" });
  await expect(handle).toHaveAttribute("aria-valuenow", "30");
  await handle.focus();
  await page.keyboard.press("Enter");
  await expect(handle).toHaveAttribute("aria-valuenow", "0");
  // Folded to nothing: its content is cut away to no room.
  await expect(page.getByText("Folders")).not.toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(handle).toHaveAttribute("aria-valuenow", "30");
  await expect(page.getByText("Folders")).toBeInViewport();
});
