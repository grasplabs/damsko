import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

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

test("two rows that share a name are each a row of the table, in order, as the data changes too", async ({
  page,
}) => {
  await openExample(page, "chart", "same-names");
  const table = page.getByRole("table", { name: "Orders by day" });
  await expect(table.getByRole("rowheader")).toHaveText([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Mon",
    "Tue",
    "Wed",
  ]);
  await page.getByRole("button", { name: "Start on another day" }).click();
  await expect(table.getByRole("rowheader")).toHaveText([
    "Wed",
    "Thu",
    "Fri",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
});

// Each element is marked with the label it showed; an element that keeps its row keeps its mark.
const markRows = async (each: Locator) => {
  await each.evaluateAll((elements) => {
    for (const element of elements) {
      if (element instanceof HTMLElement) {
        element.dataset.was = element.firstElementChild?.textContent ?? "";
      }
    }
  });
};

const read = async (each: Locator) =>
  await each.evaluateAll((elements) =>
    elements.map((element) => ({
      label: element.firstElementChild?.textContent ?? "",
      was: element instanceof HTMLElement ? element.dataset.was : undefined,
    }))
  );

test("a row added at the top or the rows turned round keep each row's element: the new row is the one that grows, and focus stays on its label", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "chart", "rows-move");
  const items = page
    .getByRole("figure", { name: "Tickets by team", exact: true })
    .getByRole("listitem");
  const rows = page
    .getByRole("table", { name: "Tickets by team, as bars" })
    .getByRole("row")
    .filter({ has: page.getByRole("rowheader") });
  await expect(items).toHaveCount(3);
  const mark = async () => {
    await Promise.all([markRows(items), markRows(rows)]);
  };
  // The label of the row whose grow began last (once each has begun).
  const lastGrown = async () =>
    await items.evaluateAll(async (elements) => {
      const started = await Promise.all(
        elements.map(async (element) => {
          const grows = element.getAnimations({ subtree: true });
          await Promise.all(grows.map(async (grow) => await grow.ready));
          return Math.max(...grows.map((grow) => Number(grow.startTime)));
        })
      );
      const latest = started.indexOf(Math.max(...started));
      return elements[latest]?.firstElementChild?.textContent ?? "";
    });
  const focusOn = async (label: string) => {
    await items.filter({ hasText: label }).evaluate((element) => {
      if (element instanceof HTMLElement) {
        element.tabIndex = -1;
        element.focus();
      }
    });
  };
  const focused = async () =>
    await page.evaluate(
      () => document.activeElement?.firstElementChild?.textContent ?? ""
    );

  await mark();
  await focusOn("Alpha");
  // Pressed without taking focus, so focus stays where it was put.
  await page
    .getByRole("button", { name: "Add Delta at the top" })
    .dispatchEvent("click");
  await expect(items).toHaveCount(4);
  const added = [
    { label: "Delta", was: undefined },
    { label: "Alpha", was: "Alpha" },
    { label: "Beta", was: "Beta" },
    { label: "Gamma", was: "Gamma" },
  ];
  expect(await read(items)).toEqual(added);
  expect(await read(rows)).toEqual(added);
  expect(await lastGrown()).toBe("Delta");
  expect(await focused()).toBe("Alpha");

  await mark();
  await focusOn("Gamma");
  await page
    .getByRole("button", { name: "Turn the rows round" })
    .dispatchEvent("click");
  await expect(items.first()).toHaveText(/Gamma/u);
  const turned = ["Gamma", "Beta", "Alpha", "Delta"].map((label) => ({
    label,
    was: label,
  }));
  expect(await read(items)).toEqual(turned);
  expect(await read(rows)).toEqual(turned);
  expect(await focused()).toBe("Gamma");
});

/** A token's colour as the page computes it, read through a probe. */
const tokenColour = async (page: Page, token: string): Promise<string> =>
  await page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(--damsko-${name})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, token);

/** The colour of the square drawn before a series' name, in a legend row or a tooltip row. */
const swatchOf = async (row: Locator): Promise<string> =>
  await row.evaluate((node) => {
    const swatch = node.querySelector("[aria-hidden='true']");
    return swatch === null ? "" : getComputedStyle(swatch).backgroundColor;
  });

/** Every colour the bars of a figure are filled with. */
const barFills = async (figure: Locator): Promise<string[]> =>
  await figure.evaluate((node) => [
    ...new Set(
      [...node.querySelectorAll("svg rect")].map(
        (rect) => getComputedStyle(rect).fill
      )
    ),
  ]);

for (const theme of ["light", "dark"] as const) {
  test(`stacked bars draw each series in its chart tone, in the config's order, named in the legend (${theme})`, async ({
    page,
  }) => {
    await openExample(page, "chart", "bar-stacked", { theme });
    const figure = page.getByRole("figure", {
      name: "Tickets solved by month, by channel",
    });
    const items = figure.getByRole("listitem");
    await expect(items).toHaveText(["Email", "Chat", "Phone"]);
    const tones = await Promise.all(
      ["chart-plain", "chart-2", "chart-3"].map(
        async (token) => await tokenColour(page, token)
      )
    );
    expect(new Set(tones).size).toBe(3);
    const swatches = await Promise.all(
      [0, 1, 2].map(async (index) => await swatchOf(items.nth(index)))
    );
    expect(swatches).toStrictEqual(tones);
    const fills = await barFills(figure);
    for (const tone of tones) {
      expect(fills).toContain(tone);
    }
  });
}

test("a stacked bar's tooltip names each series with its value, beside the square of its tone", async ({
  page,
}) => {
  await openExample(page, "chart", "bar-stacked");
  const figure = page.getByRole("figure", {
    name: "Tickets solved by month, by channel",
  });
  const drawing = figure.getByRole("application", {
    name: "Tickets solved by month, by channel",
  });
  const box = await drawing.boundingBox();
  if (box === null) {
    throw new Error("the drawing has no box");
  }
  await page.mouse.move(box.x + box.width * 0.93, box.y + box.height * 0.4);
  await expect(figure.getByText("Jun", { exact: true }).last()).toBeVisible();
  const rows = [
    ["Email", "27", "chart-plain"],
    ["Chat", "34", "chart-2"],
    ["Phone", "11", "chart-3"],
  ] as const;
  for (const [name, value, token] of rows) {
    const row = figure
      .locator("span")
      .filter({ has: page.getByText(name, { exact: true }) })
      .filter({ has: page.getByText(value, { exact: true }) })
      .last();
    // oxlint-disable-next-line no-await-in-loop -- one row after the other
    await expect(row).toBeVisible();
    // oxlint-disable-next-line no-await-in-loop -- one row after the other
    expect(await swatchOf(row)).toBe(await tokenColour(page, token));
  }
});

/** The middle of a y axis label's box, up the page. */
const middleOf = async (label: Locator): Promise<number> => {
  const box = await label.boundingBox();
  if (box === null) {
    throw new Error("the label has no box");
  }
  return box.y + box.height / 2;
};

for (const theme of ["light", "dark"] as const) {
  test(`a reference line stands at its value, its name in ink at its end, and is said after the summary (${theme})`, async ({
    page,
  }) => {
    await openExample(page, "chart", "reference-line", { theme });
    const figure = page.getByRole("figure", { name: "Spend by month" });
    await expect(figure.getByText("Budget: €4,000")).toBeAttached();
    const name = figure.getByText("Budget", { exact: true });
    await expect(name).toBeVisible();
    // €4,000 is two thirds of the way from €3,000 up to €4,500.
    const low = await middleOf(figure.getByText("€3,000", { exact: true }));
    const high = await middleOf(figure.getByText("€4,500", { exact: true }));
    const level = low + ((4000 - 3000) / (4500 - 3000)) * (high - low);
    const box = await name.boundingBox();
    if (box === null) {
      throw new Error("the name has no box");
    }
    // Its name stands just above the line, at the drawing's end.
    const above = level - (box.y + box.height / 2);
    expect(above).toBeGreaterThan(4);
    expect(above).toBeLessThan(16);
    const drawing = await figure.getByRole("application").boundingBox();
    if (drawing === null) {
      throw new Error("the drawing has no box");
    }
    expect(drawing.x + drawing.width - (box.x + box.width)).toBeLessThan(16);
    const ink = await name.evaluate((node) => getComputedStyle(node).fill);
    expect(ink).toBe(await tokenColour(page, "foreground"));
  });
}

test("a reference line at a point along the bottom runs up the drawing, its name beside it", async ({
  page,
}) => {
  await openExample(page, "chart", "reference-line-x");
  const figure = page.getByRole("figure", { name: "Sign-ups by month" });
  await expect(figure.getByText("Launch: Apr")).toBeAttached();
  const tick = await figure
    .getByRole("application")
    .getByText("Apr", { exact: true })
    .boundingBox();
  const name = await figure.getByText("Launch", { exact: true }).boundingBox();
  if (tick === null || name === null) {
    throw new Error("no box");
  }
  // Beside the line at April, on the side with room (before it, in the drawing's right half),
  // never across it.
  const at = tick.x + tick.width / 2;
  const end = name.x + name.width;
  expect(end).toBeLessThanOrEqual(at);
  expect(at - end).toBeLessThan(8);
});

test("bars to press: one Tab stop, the arrow keys move with a ring and the tooltip, Enter and Space press", async ({
  page,
}) => {
  await openExample(page, "chart", "bar-press");
  const figure = page.getByRole("figure", {
    name: "Tickets per day, by channel",
  });
  // The drawing is no stop of its own: the bars are.
  await expect(figure.getByRole("application")).toHaveCount(0);
  await page.keyboard.press("Tab");
  const first = figure.getByRole("button", {
    name: "1 November, Email: 18, Chat: 9",
  });
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("ArrowRight");
  const second = figure.getByRole("button", {
    name: "2 November, Email: 22, Chat: 12",
  });
  await expect(second).toBeFocused();
  expect(await hasFocusRing(second)).toBe(true);
  // The tooltip shows the day the keys are on, beside the table's row for it, and Escape puts it away.
  const said = figure.getByText("2 November", { exact: true });
  await expect(said).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(said).toHaveCount(1);
  await expect(second).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    figure.getByRole("button", { name: /^14 November, /u })
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect(second).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Only 1 November: 27 tickets.")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press(" ");
  await expect(second).toHaveAttribute("aria-pressed", "true");
  await expect(first).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press(" ");
  await expect(second).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByText("Every day. Press a day to show only that one.")
  ).toBeVisible();
  // Tab leaves the bars at once, and comes back to the last one.
  await page.keyboard.press("Tab");
  await expect(second).not.toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(second).toBeFocused();
});

test("a pressed bar stays, the others step back, and the pointer presses a day where it stands", async ({
  page,
}) => {
  await openExample(page, "chart", "bar-press");
  const figure = page.getByRole("figure", {
    name: "Tickets per day, by channel",
  });
  const day = figure.getByRole("button", { name: /^9 November, /u });
  await day.click();
  await expect(day).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Only 9 November: 34 tickets.")).toBeVisible();
  // A click shows no ring.
  expect(await hasFocusRing(day)).toBe(false);
  const steps = await figure.evaluate((node) =>
    [...node.querySelectorAll("svg g")].map((group) =>
      Number(getComputedStyle(group).opacity)
    )
  );
  expect(steps.filter((opacity) => opacity < 1)).toHaveLength(13 * 2);
  await day.click();
  await expect(day).toHaveAttribute("aria-pressed", "false");
});

test("on a right-to-left page the bars still run left to right, and each arrow goes the way it points", async ({
  page,
}) => {
  await openExample(page, "chart", "bar-press");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const figure = page.getByRole("figure", {
    name: "Tickets per day, by channel",
  });
  const first = figure.getByRole("button", { name: /^1 November, /u });
  const second = figure.getByRole("button", { name: /^2 November, /u });
  const [one, two] = await Promise.all([
    first.boundingBox(),
    second.boundingBox(),
  ]);
  if (one === null || two === null) {
    throw new Error("no box");
  }
  expect(two.x).toBeGreaterThan(one.x);
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(first).toBeFocused();
});
