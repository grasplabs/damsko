import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("its label names it, and a press on the label turns it", async ({
  page,
}) => {
  await openExample(page, "switch", "label");
  const summary = page.getByRole("switch", { name: "Weekly summary" });
  await expect(summary).toBeChecked();
  await page.getByText("Weekly summary", { exact: true }).click();
  await expect(summary).not.toBeChecked();
  await summary.click();
  await expect(summary).toBeChecked();
});

test("a press on its row's empty space turns it", async ({ page }) => {
  await openExample(page, "switch", "label");
  const summary = page.getByRole("switch", { name: "Weekly summary" });
  const words = await page
    .getByText("Weekly summary", { exact: true })
    .boundingBox();
  if (words === null) {
    throw new Error("the label has no box");
  }
  // Under the start of the words, in the room round them.
  await page.mouse.click(words.x + 2, words.y + words.height + 6);
  await expect(summary).not.toBeChecked();
});

test("its description describes it", async ({ page }) => {
  await openExample(page, "switch", "description");
  await expect(
    page.getByRole("switch", { name: "Monthly report" })
  ).toHaveAccessibleDescription(
    "The month's changes in one email, on the first Monday."
  );
});

test("Space turns it from the keyboard, with the ring; Enter does not", async ({
  page,
}) => {
  await openExample(page, "switch", "label");
  const summary = page.getByRole("switch", { name: "Weekly summary" });
  await page.keyboard.press("Tab");
  await expect(summary).toBeFocused();
  expect(await hasFocusRing(summary)).toBe(true);
  await page.keyboard.press("Space");
  await expect(summary).not.toBeChecked();
  await page.keyboard.press("Enter");
  await expect(summary).not.toBeChecked();
  await page.keyboard.press("Space");
  await expect(summary).toBeChecked();
});

test("a disabled switch keeps its value", async ({ page }) => {
  await openExample(page, "switch", "disabled");
  const keep = page.getByRole("switch", {
    name: "Keep a copy of every export",
  });
  await expect(keep).toBeDisabled();
  await page
    .getByText("Keep a copy of every export", { exact: true })
    .click({ force: true });
  await expect(keep).toBeChecked();
});

test("a save that fails leaves it off, says so under the words, and marks it wrong; the rows stay put", async ({
  page,
}) => {
  await openExample(page, "switch", "save");
  const reminders = page.getByRole("switch", {
    name: "Reminders before a deadline",
  });
  const before = await reminders.boundingBox();
  await reminders.click();
  await expect(reminders).toHaveAttribute("aria-busy", "true");
  await expect(reminders).not.toBeChecked();
  await expect(page.getByText("Could not save").first()).toBeVisible();
  await expect(reminders).not.toHaveAttribute("aria-busy", "true");
  await expect(reminders).not.toBeChecked();
  await expect(reminders).toHaveAttribute("aria-invalid", "true");
  await expect(reminders).toHaveAccessibleDescription("Could not save");
  const after = await reminders.boundingBox();
  expect(after?.y).toBe(before?.y);
});

test("a save that works turns it once it is done", async ({ page }) => {
  await openExample(page, "switch", "save");
  const summary = page.getByRole("switch", {
    name: "Weekly summary by email",
  });
  await summary.click();
  await expect(summary).toHaveAttribute("aria-busy", "true");
  await expect(summary).not.toBeChecked();
  await expect(summary).toBeChecked();
  await expect(summary).not.toHaveAttribute("aria-busy", "true");
});

// The agent fixture: the page's one bridge (window.damskoAgent, site/behaviour/agent.ts) lists every
// switch by its label, with whether it is on, and turns them by name.
const setChecked = async (page: Page, ref: string, value: boolean) =>
  await page.evaluate(
    async ({ name, checked }) => {
      const result = await window.damskoAgent?.act({
        steps: [{ ref: name, action: "setChecked", args: [checked] }],
      });
      return result?.ok === true;
    },
    { name: ref, checked: value }
  );

test("an agent finds every switch by its label and turns it by name; one that saves turns once saved", async ({
  page,
}) => {
  await openExample(page, "switch", "agent");
  const states = await page.evaluate(() =>
    (window.damskoAgent?.snapshot() ?? [])
      .filter((entry) => entry.component === "switch")
      .map((entry) => [entry.label, entry.checked])
  );
  expect(states).toStrictEqual([
    ["Weekly summary", false],
    ["Reminders", false],
  ]);
  expect(await setChecked(page, "Weekly summary", true)).toBe(true);
  await expect(
    page.getByRole("switch", { name: "Weekly summary" })
  ).toBeChecked();

  const reminders = page.getByRole("switch", { name: "Reminders" });
  await setChecked(page, "Reminders", true);
  await expect(reminders).toHaveAttribute("aria-busy", "true");
  await expect(reminders).not.toBeChecked();
  await expect(reminders).toBeChecked();
});

test("a form sends it under its name while it is on", async ({ page }) => {
  await openExample(page, "switch", "agent");
  const sent = async () =>
    // The fixture's one form.
    await page
      .locator("form")
      .evaluate((form) =>
        form instanceof HTMLFormElement
          ? new FormData(form).getAll("summary")
          : []
      );
  expect(await sent()).toStrictEqual([]);
  await page.getByRole("switch", { name: "Weekly summary" }).click();
  expect(await sent()).toStrictEqual(["on"]);
});
