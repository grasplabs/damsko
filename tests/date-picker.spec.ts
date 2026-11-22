import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** The calendar's popup, while it is open. */
const popup = (page: Page) =>
  page.getByRole("dialog").filter({ has: page.getByRole("grid") });

/** The button that opens the calendar: its name ends in the chosen date. */
const trigger = (page: Page, date: RegExp) =>
  page.getByRole("button", { name: date });

test("the button names the chosen date; it opens the calendar on that day, and a day chosen closes it and sends its ISO date", async ({
  page,
}) => {
  await openExample(page, "date-picker", "basic");
  const button = trigger(page, /November 20, 2026/u);
  await button.click();
  await expect(popup(page)).toBeVisible();
  await expect(
    page.getByRole("gridcell", { name: /20/u }).first()
  ).toBeVisible();
  await expect(page.locator(":focus")).toHaveText("20");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(popup(page)).toBeHidden();
  await expect(trigger(page, /November 21, 2026/u)).toBeVisible();
  await expect(page.locator('input[name="due"]')).toHaveValue("2026-11-21");
});

test("a day chosen gives focus back to the button", async ({ page }) => {
  await openExample(page, "date-picker", "basic");
  await trigger(page, /November 20, 2026/u).click();
  await expect(page.locator(":focus")).toHaveText("20");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  await expect(popup(page)).toBeHidden();
  await expect(trigger(page, /November 19, 2026/u)).toBeFocused();
});

test("Escape closes the calendar without a change, focus goes back to its button, and the page did not move", async ({
  page,
}) => {
  await openExample(page, "date-picker", "basic");
  const button = trigger(page, /November 20, 2026/u);
  const before = await page.evaluate(() => window.scrollY);
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(popup(page)).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(popup(page)).toBeHidden();
  await expect(button).toBeFocused();
  await expect(trigger(page, /November 20, 2026/u)).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

test("a range takes two presses, a start and an end, then closes and names both", async ({
  page,
}) => {
  await openExample(page, "date-picker", "range");
  await trigger(page, /November 23.*November 27, 2026/u).click();
  await expect(popup(page)).toBeVisible();
  await popup(page)
    .getByRole("gridcell", { name: /December 2, 2026/u })
    .first()
    .click();
  await expect(popup(page)).toBeVisible();
  await popup(page)
    .getByRole("gridcell", { name: /December 5, 2026/u })
    .first()
    .click();
  await expect(popup(page)).toBeHidden();
  await expect(trigger(page, /December 2.*December 5, 2026/u)).toBeVisible();
});

test("presets: the one matching the range is pressed, and another sets its range and closes the calendar", async ({
  page,
}) => {
  await openExample(page, "date-picker", "presets-chosen");
  await trigger(page, /November 7.*November 13, 2026/u).click();
  const presets = page.getByRole("group", { name: "Presets" });
  await expect(
    presets.getByRole("button", { name: "Last 7 days" })
  ).toHaveAttribute("aria-pressed", "true");
  await presets.getByRole("button", { name: "This month" }).click();
  await expect(popup(page)).toBeHidden();
  await expect(trigger(page, /November 1.*November 13, 2026/u)).toBeVisible();
  await expect(page.locator('input[name="period"]').first()).toHaveValue(
    "2026-11-01"
  );
});

test("days that cannot be chosen are marked so", async ({ page }) => {
  await openExample(page, "date-picker", "limits");
  await trigger(page, /November 18, 2026/u).click();
  await expect(popup(page)).toBeVisible();
  const saturday = popup(page)
    .getByRole("gridcell", { name: /November 21, 2026/u })
    .first();
  await expect(saturday).toHaveAttribute("aria-disabled", "true");
});

test("a date typed in the field is read when committed, written out, and sent as an ISO date", async ({
  page,
}) => {
  await openExample(page, "date-picker", "basic");
  const field = page.getByRole("textbox", { name: "Due date" });
  await field.fill("2026-12-03");
  await page.keyboard.press("Enter");
  await expect(field).not.toHaveValue("2026-12-03");
  await expect(field).toHaveValue(/12.*3.*2026|3.*12.*2026/u);
  await expect(field).not.toHaveAttribute("aria-invalid", "true");
  await expect(trigger(page, /December 3, 2026/u)).toBeVisible();
  await expect(page.locator('input[name="due"]')).toHaveValue("2026-12-03");
  await field.fill("December 24, 2026");
  await page.keyboard.press("Tab");
  await expect(page.locator('input[name="due"]')).toHaveValue("2026-12-24");
});

test("text that is no date stays, marked wrong, and the date before it is kept", async ({
  page,
}) => {
  await openExample(page, "date-picker", "basic");
  const field = page.getByRole("textbox", { name: "Due date" });
  await field.fill("not a date");
  await page.keyboard.press("Enter");
  await expect(field).toHaveValue("not a date");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator('input[name="due"]')).toHaveValue("2026-11-20");
  await field.fill("2026-11-25");
  await page.keyboard.press("Enter");
  await expect(field).not.toHaveAttribute("aria-invalid", "true");
});

test("a range is typed into its start and its end, and the calendar button names both", async ({
  page,
}) => {
  await openExample(page, "date-picker", "range");
  const start = page.getByRole("textbox", { name: "Trip, start" });
  const end = page.getByRole("textbox", { name: "Trip, end" });
  await start.fill("2026-12-01");
  await page.keyboard.press("Tab");
  await end.fill("2026-12-04");
  await page.keyboard.press("Enter");
  await expect(trigger(page, /December 1.*December 4, 2026/u)).toBeVisible();
  const sent = page.locator('input[name="trip"]');
  await expect(sent.first()).toHaveValue("2026-12-01");
  await expect(sent.last()).toHaveValue("2026-12-04");
  await end.fill("2026-11-02");
  await page.keyboard.press("Enter");
  await expect(end).toHaveAttribute("aria-invalid", "true");
});

test("in a Field the label names it and the description describes it; required keeps an empty form from being sent, with the error", async ({
  page,
}) => {
  await openExample(page, "date-picker", "form");
  const field = page.getByRole("textbox", { name: "Due date" });
  await expect(field).toHaveAccessibleDescription(/When the invoice is due/u);
  await field.fill("");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Choose a due date.")).toBeVisible();
  await expect(field).toHaveAccessibleDescription(/Choose a due date/u);
  await expect(page.getByRole("status", { name: "Sent" })).toHaveText("");
  await field.fill("2026-12-01");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("status", { name: "Sent" })).toHaveText(
    "2026-12-01"
  );
});

test("a form reset brings back the date it started with", async ({ page }) => {
  await openExample(page, "date-picker", "form");
  const field = page.getByRole("textbox", { name: "Due date" });
  await field.fill("2026-12-24");
  await page.keyboard.press("Enter");
  await expect(trigger(page, /December 24, 2026/u)).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(trigger(page, /November 20, 2026/u)).toBeVisible();
  await expect(field).toHaveValue(/11.*20.*2026|20.*11.*2026/u);
});
