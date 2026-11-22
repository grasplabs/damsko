import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the keys step, jump a large step and go to the ends; a typed number past an end comes back to it", async ({
  page,
}) => {
  await openExample(page, "number-field", "basic");
  const seats = page.getByRole("textbox", { name: "Seats" });
  await expect(seats).toHaveAccessibleDescription("Between 1 and 50.");
  await expect(seats).toHaveValue("5");
  await seats.focus();
  await page.keyboard.press("ArrowUp");
  await expect(seats).toHaveValue("6");
  await page.keyboard.press("ArrowDown");
  await expect(seats).toHaveValue("5");
  await page.keyboard.press("PageUp");
  await expect(seats).toHaveValue("15");
  await page.keyboard.press("PageDown");
  await expect(seats).toHaveValue("5");
  await page.keyboard.press("End");
  await expect(seats).toHaveValue("50");
  await page.keyboard.press("ArrowUp");
  await expect(seats).toHaveValue("50");
  await page.keyboard.press("Home");
  await expect(seats).toHaveValue("1");
  await page.keyboard.press("ArrowDown");
  await expect(seats).toHaveValue("1");

  await seats.fill("80");
  await page.keyboard.press("Tab");
  await expect(seats).toHaveValue("50");
  await seats.fill("0");
  await seats.press("Enter");
  await expect(seats).toHaveValue("1");
});

test("the steps are named, stay out of the Tab order, and stop at the ends", async ({
  page,
}) => {
  await openExample(page, "number-field", "basic");
  const seats = page.getByRole("textbox", { name: "Seats" });
  const up = page.getByRole("button", { name: "Increase" });
  const down = page.getByRole("button", { name: "Decrease" });
  await up.click();
  await expect(seats).toHaveValue("6");
  await down.click();
  await down.click();
  await expect(seats).toHaveValue("4");

  await seats.focus();
  await page.keyboard.press("Tab");
  await expect(up).not.toBeFocused();
  await expect(down).not.toBeFocused();

  await seats.focus();
  await page.keyboard.press("End");
  await expect(up).toBeDisabled();
  await expect(down).toBeEnabled();
});

test("the wheel never steps it", async ({ page }) => {
  await openExample(page, "number-field", "basic");
  const seats = page.getByRole("textbox", { name: "Seats" });
  await seats.focus();
  await seats.hover();
  await page.mouse.wheel(0, -200);
  await page.mouse.wheel(0, 200);
  await expect(seats).toHaveValue("5");
});

test("the unit and the sign stand inside the field and are said with the number", async ({
  page,
}) => {
  await openExample(page, "number-field", "units");
  const weight = page.getByRole("textbox", { name: "Weight" });
  const budget = page.getByRole("textbox", { name: "Budget" });
  await expect(weight).toHaveAccessibleDescription("kg");
  await expect(budget).toHaveAccessibleDescription("€");
  await expect(budget).toHaveValue("1,250.00");
  const field = await weight.boundingBox();
  const unit = await page.getByText("kg", { exact: true }).boundingBox();
  expect(unit?.x ?? 0).toBeGreaterThan(field?.x ?? 0);

  // Steps of half; Page Up goes the large step it is given.
  await weight.focus();
  await page.keyboard.press("ArrowUp");
  await expect(weight).toHaveValue("3");
  await budget.focus();
  await page.keyboard.press("PageUp");
  await expect(budget).toHaveValue("1,750.00");
});

test("the number shows in the page's language and is sent as a plain number", async ({
  page,
}) => {
  await openExample(page, "number-field", "locale");
  await expect(
    page.getByRole("textbox", { name: "Views (English)" })
  ).toHaveValue("12,345.6");
  await expect(
    page.getByRole("textbox", { name: "Views (Dutch)" })
  ).toHaveValue("12.345,6");
  const sent = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLInputElement>("input[name^=views]")].map(
      (input) => input.value
    )
  );
  expect(sent).toEqual(["12345.6", "12345.6"]);
});

test("the three sizes are Input's heights, and their steps end in one column", async ({
  page,
}) => {
  await openExample(page, "number-field", "sizes");
  const fields = ["Small", /^(?:Default|Medium)$/u, "Large"].map((name) =>
    page.getByRole("textbox", { name })
  );
  const heights = await Promise.all(
    fields.map(
      async (field) =>
        await field.evaluate(
          (input) => input.parentElement?.getBoundingClientRect().height
        )
    )
  );
  expect(heights).toEqual([32, 36, 44]);
  const steps = await page.getByRole("button", { name: "Increase" }).all();
  const ends = await Promise.all(
    steps.map(async (step) => {
      const box = await step.boundingBox();
      return (box?.x ?? 0) + (box?.width ?? 0);
    })
  );
  expect(new Set(ends).size).toBe(1);
});

test("too many is marked wrong with its reason; read only does not step; disabled is out of reach", async ({
  page,
}) => {
  await openExample(page, "number-field", "states");
  const tickets = page.getByRole("textbox", { name: "Tickets" });
  await expect(tickets).toHaveAttribute("aria-invalid", "true");
  await expect(tickets).toHaveAccessibleDescription(
    "Only 12 tickets are left."
  );
  await tickets.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(tickets).toHaveValue("12");
  await expect(tickets).not.toHaveAttribute("aria-invalid", "true");

  const year = page.getByRole("textbox", { name: "Year" });
  await year.focus();
  await page.keyboard.press("ArrowUp");
  await expect(year).toHaveValue("2026");

  await expect(page.getByRole("textbox", { name: "Copies" })).toBeDisabled();
});
