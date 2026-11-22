import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the chosen day holds the tab stop; arrows, Home, End and Enter move and choose", async ({
  page,
}) => {
  await openExample(page, "calendar", "basic");
  const chosen = page.getByRole("gridcell", {
    name: "Monday, November 16, 2026",
  });
  await expect(chosen).toHaveAttribute("aria-selected", "true");
  await expect(chosen).toHaveAttribute("tabindex", "0");

  await chosen.focus();
  await page.keyboard.press("ArrowRight");
  const next = page.getByRole("gridcell", {
    name: "Tuesday, November 17, 2026",
  });
  await expect(next).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("gridcell", { name: "Tuesday, November 24, 2026" })
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("gridcell", { name: "Sunday, November 22, 2026" })
  ).toBeFocused();
  await page.keyboard.press("End");
  const saturday = page.getByRole("gridcell", {
    name: "Saturday, November 28, 2026",
  });
  await expect(saturday).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(saturday).toHaveAttribute("aria-selected", "true");
  await expect(chosen).toHaveAttribute("aria-selected", "false");
});

test("Page Up and Page Down turn the month, and the heading says it", async ({
  page,
}) => {
  await openExample(page, "calendar", "basic");
  const heading = page.getByRole("heading", { name: "November 2026" });
  await expect(heading).toHaveAttribute("aria-live", "polite");
  await page
    .getByRole("gridcell", { name: "Monday, November 16, 2026" })
    .focus();
  await page.keyboard.press("PageDown");
  await expect(
    page.getByRole("heading", { name: "December 2026" })
  ).toBeVisible();
  await expect(
    page.getByRole("gridcell", { name: "Wednesday, December 16, 2026" })
  ).toBeFocused();
  await page.keyboard.press("PageUp");
  await expect(
    page.getByRole("heading", { name: "November 2026" })
  ).toBeVisible();
});

test("Previous and Next are named, and turn the month", async ({ page }) => {
  await openExample(page, "calendar", "basic");
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.getByRole("grid", { name: "December 2026" })).toBeVisible();
  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(page.getByRole("grid", { name: "November 2026" })).toBeVisible();
});

test("two presses choose a range, its ends and the days between", async ({
  page,
}) => {
  await openExample(page, "calendar", "range");
  const day = (name: string) => page.getByRole("gridcell", { name });
  await day("Tuesday, November 3, 2026").click();
  await day("Friday, November 6, 2026").click();
  await expect(day("Tuesday, November 3, 2026")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(day("Wednesday, November 4, 2026")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(day("Friday, November 6, 2026")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(day("Saturday, November 7, 2026")).toHaveAttribute(
    "aria-selected",
    "false"
  );
});

test("an unavailable day cannot be chosen, and the keys still reach it", async ({
  page,
}) => {
  await openExample(page, "calendar", "unavailable");
  const saturday = page.getByRole("gridcell", {
    name: "Saturday, November 14, 2026",
  });
  await saturday.click({ force: true });
  await expect(saturday).toHaveAttribute("aria-selected", "false");
  const free = page.getByRole("gridcell", {
    name: "Wednesday, November 11, 2026",
  });
  await free.click();
  await expect(free).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  const booked = page.getByRole("gridcell", {
    name: "Thursday, November 12, 2026",
  });
  await expect(booked).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(booked).toHaveAttribute("aria-selected", "false");
});

test("on a touch screen a day is 44px square", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await openExample(page, "calendar", "basic");
  const box = await page
    .getByRole("gridcell", { name: "Monday, November 16, 2026" })
    .boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(43.5);
  expect(box?.height).toBeGreaterThanOrEqual(43.5);
  await context.close();
});

test("two months each say their own name when they stack on a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openExample(page, "calendar", "range");
  const november = page.getByRole("grid", { name: "November 2026" });
  const december = page.getByRole("grid", { name: "December 2026" });
  // Shown while stacked; side by side the heading names both, and each grid's own name is only said.
  await expect(november.getByText("November 2026")).toHaveCSS(
    "clip-path",
    "none"
  );
  await expect(december.getByText("December 2026")).toHaveCSS(
    "clip-path",
    "none"
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(december.getByText("December 2026")).not.toHaveCSS(
    "clip-path",
    "none"
  );
});

test("the names and the week's first day follow the locale", async ({
  page,
}) => {
  await openExample(page, "calendar", "locale");
  await expect(
    page.getByRole("grid", { name: /november 2026/iu })
  ).toBeVisible();
  await expect(page.getByRole("columnheader").first()).toHaveAccessibleName(
    "maandag"
  );
  await expect(page.getByRole("button", { name: "Next month" })).toBeVisible();
});
