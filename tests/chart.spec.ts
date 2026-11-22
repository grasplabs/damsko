import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("a chart is a figure named by its label, with its numbers in a table", async ({
  page,
}) => {
  await openExample(page, "chart", "bar-plain");
  await expect(
    page.getByRole("figure", { name: "Tickets solved by month" })
  ).toBeVisible();
  const table = page.getByRole("table", { name: "Tickets solved by month" });
  await expect(table.getByRole("columnheader")).toHaveText(["Month", "Solved"]);
  await expect(table.getByRole("rowheader")).toHaveText([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
  ]);
  await expect(table.getByRole("row", { name: /Jun/u })).toContainText("72");
});

test("the table writes values as the y axis writes them", async ({ page }) => {
  await openExample(page, "chart", "spend-card");
  const table = page.getByRole("table", { name: "Spend by month" });
  await expect(table.getByRole("row", { name: /Nov/u })).toContainText(
    "€5,180"
  );
});

test("the arrow keys move between the points, and each is said in a live region", async ({
  page,
}) => {
  await openExample(page, "chart", "bar-plain");
  const figure = page.getByRole("figure", { name: "Tickets solved by month" });
  const drawing = figure.getByRole("application", {
    name: "Tickets solved by month",
  });
  await drawing.focus();
  await page.keyboard.press("ArrowRight");
  const live = figure.locator("[aria-live='polite']");
  await expect(live).toHaveText(/^(?:Jan|Feb), Solved: (?:40|46)$/u);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(live).toHaveText(/, Solved: \d+$/u);
  // The tooltip shows the point the keys are on.
  await expect(
    figure.getByText("Solved", { exact: true }).first()
  ).toBeVisible();
});

test("the live region writes each value as the table does", async ({
  page,
}) => {
  await openExample(page, "chart", "spend-card");
  const figure = page.getByRole("figure", { name: "Spend by month" });
  await figure.getByRole("application", { name: "Spend by month" }).focus();
  const live = figure.locator("[aria-live='polite']");
  await expect(async () => {
    await page.keyboard.press("ArrowRight");
    await expect(live).toHaveText(/^Nov, /u, { timeout: 200 });
  }).toPass();
  await expect(live).toHaveText("Nov, Spend: €5,180");
});

test("hovering a point shows its tooltip with each series, highest first when asked", async ({
  page,
}) => {
  await openExample(page, "chart", "lines-several");
  const figure = page.getByRole("figure", {
    name: "Invoices booked per week, by company",
  });
  const drawing = figure.getByRole("application", {
    name: "Invoices booked per week, by company",
  });
  const box = await drawing.boundingBox();
  if (box === null) {
    throw new Error("the drawing has no box");
  }
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2);
  await Promise.all(
    ["Holding", "Logistics", "Retail", "Services"].map(async (name) => {
      await expect(
        figure.getByText(name, { exact: true }).first()
      ).toBeVisible();
    })
  );
});

test("a legend names each series under the chart", async ({ page }) => {
  await openExample(page, "chart", "legend");
  const figure = page.getByRole("figure", {
    name: "Tickets opened and closed by month",
  });
  const items = figure.getByRole("listitem");
  await expect(items).toHaveCount(2);
  await expect(items.filter({ hasText: "Opened" })).toBeVisible();
  await expect(items.filter({ hasText: "Closed" })).toBeVisible();
});

test("bars across are a list of names and values, largest first", async ({
  page,
}) => {
  await openExample(page, "chart", "bar-list");
  const figure = page.getByRole("figure", {
    name: "October spend by supplier",
  });
  const rows = figure.getByRole("listitem");
  await expect(rows).toHaveCount(6);
  await expect(rows.first()).toContainText("Payroll and pension contributions");
  await expect(rows.first()).toContainText("€184,200");
  await expect(rows.last()).toContainText("Travel and accommodation");
});

test("a pie's parts are each reached by Tab, named with their value and share, and said in its centre", async ({
  page,
}) => {
  await openExample(page, "chart", "ring");
  const figure = page.getByRole("figure", {
    name: "October's incoming invoices, by how they arrived",
  });
  // At rest the centre says the total.
  await expect(figure.getByText("1,217", { exact: true })).toBeVisible();
  const part = figure.getByLabel("E-invoice: 612, 50%", { exact: true });
  await part.focus();
  await expect(part).toBeFocused();
  await expect(figure.getByText("612", { exact: true }).first()).toBeVisible();
  await expect(figure.getByText("E-invoice · 50%")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(figure.getByLabel(/^PDF by email: 455, /u)).toBeFocused();
});

test("a Sankey's flows are named, and the one focused is read out under the drawing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openExample(page, "chart", "sankey");
  const figure = page.getByRole("figure", {
    name: "Where October's incoming invoices went",
  });
  const flow = figure.getByLabel(
    "Received to Matched automatically: 812, 67% of Received",
    { exact: true }
  );
  await flow.focus();
  await expect(flow).toBeFocused();
  await expect(
    figure.getByText("Received → Matched automatically")
  ).toBeVisible();
  await expect(figure.getByText("67% of Received")).toBeVisible();
});

test("on a narrow screen a Sankey's flows become a list by stage", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "chart", "sankey");
  const figure = page.getByRole("figure", {
    name: "Where October's incoming invoices went",
  });
  await expect(figure.getByLabel(/^Received to /u)).toHaveCount(0);
  await expect(
    figure
      .getByRole("listitem")
      .filter({ hasText: "Matched automatically" })
      .first()
  ).toBeVisible();
});

test("a sparkline in a table is a picture named by its label and summary", async ({
  page,
}) => {
  await openExample(page, "chart", "spark-table");
  await expect(
    page.getByRole("img", {
      name: "Tailspin Logistics, revenue by week. +18% over twelve weeks.",
    })
  ).toBeVisible();
});

test("a large sparkline is a slider: the arrow keys pick a week and the figure says it", async ({
  page,
}) => {
  await openExample(page, "chart", "spark-tile");
  const slider = page.getByRole("slider", {
    name: "Cash at week end, the last twelve weeks",
  });
  await slider.focus();
  await expect(slider).toHaveAttribute("aria-valuetext", "Week 44 €556,000");
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuetext", "Week 43 €534,000");
  await expect(page.getByText("Cash at week end, Week 43")).toBeVisible();
  await page.keyboard.press("Home");
  await expect(slider).toHaveAttribute("aria-valuetext", "Week 33 €412,000");
});
