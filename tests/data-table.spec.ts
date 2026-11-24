import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { fixedTime, hasFocusRing, openExample } from "./example.ts";

/** The rows' names: each row's header, in order. */
const names = (table: Locator) => table.getByRole("rowheader");

/** The rows' names, sorted, as one line. */
const namesSorted = async (table: Locator) => {
  const all = await names(table).allInnerTexts();
  return all
    .map((name) => name.trim())
    .toSorted()
    .join(", ");
};

const head = (table: Locator, name: string) =>
  table.getByRole("columnheader", { name: new RegExp(`^${name}`, "u") });

const sortBy = (table: Locator, name: string) =>
  table.getByRole("button", { name: new RegExp(`^${name}`, "u") });

/** The ids of the columns shown, in order, as the heads give them. */
const columnIds = async (page: Page) =>
  await page
    .locator("thead th[data-column]")
    .evaluateAll((all) =>
      all.map((th) => (th instanceof HTMLElement ? th.dataset.column : ""))
    );

test("a column's name sorts it low to high, then high to low, said with aria-sort", async ({
  page,
}) => {
  await openExample(page, "data-table", "basic");
  const table = page.getByRole("table", { name: "Reports" });
  await expect(names(table).first()).toHaveText("Quarterly summary");
  await expect(head(table, "Last edited")).toHaveAttribute(
    "aria-sort",
    "descending"
  );
  await sortBy(table, "Pages").click();
  await expect(head(table, "Pages")).toHaveAttribute("aria-sort", "ascending");
  await expect(head(table, "Last edited")).not.toHaveAttribute("aria-sort");
  await expect(names(table).first()).toHaveText("Travel policy");
  await sortBy(table, "Pages").press("Enter");
  await expect(head(table, "Pages")).toHaveAttribute("aria-sort", "descending");
  await expect(names(table).first()).toHaveText("Budget for next year");
});

test("Shift and a second name sorts by both: each head says its place, and ties follow the second", async ({
  page,
}) => {
  await openExample(page, "data-table", "basic");
  const table = page.getByRole("table", { name: "Reports" });
  await sortBy(table, "Owner").click();
  await sortBy(table, "Pages").click({ modifiers: ["Shift"] });
  await expect(head(table, "Owner")).toContainText("sorted first");
  await expect(head(table, "Pages")).toContainText("sorted second");
  // Amara Okafor holds two reports on the first page: the fewer pages first.
  const amara = table.getByRole("row").filter({ hasText: "Amara Okafor" });
  await expect(amara).toHaveCount(2);
  await expect(amara.first()).toContainText("Hiring plan for the summer");
  await expect(amara.last()).toContainText("Quarterly summary");
});

test("the search keeps the rows that hold its words, goes back to page 1, and says when none do", async ({
  page,
}) => {
  await openExample(page, "data-table", "basic");
  const table = page.getByRole("table", { name: "Reports" });
  await page.getByRole("button", { name: /next/iu }).click();
  const search = page.getByRole("searchbox", { name: "Search reports" });
  await search.fill("plan");
  await expect
    .poll(async () => await namesSorted(table))
    .toBe("Hiring plan for the summer, Office move plan");
  await search.fill("zebra");
  await expect(page.getByText("No reports match “zebra”.")).toBeVisible();
  await expect(names(table)).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(names(table)).toHaveCount(5);
});

test("five rows a page; Next shows the rest", async ({ page }) => {
  await openExample(page, "data-table", "basic");
  const table = page.getByRole("table", { name: "Reports" });
  await expect(names(table)).toHaveCount(5);
  await page.getByRole("button", { name: /next/iu }).click();
  await expect(names(table)).toHaveCount(4);
  await expect(page.getByText("Showing 6 – 9 of 9 reports")).toBeVisible();
});

test("a row's checkbox selects it and the count follows; the head's selects every row shown, mixed in between", async ({
  page,
}) => {
  await openExample(page, "data-table", "selectable");
  const count = page.getByText(/ of 5 chosen/u);
  await expect(count).toHaveText("1 of 5 chosen");
  const row = page.getByRole("checkbox", { name: "Choose Quarterly summary" });
  await row.click();
  await expect(row).toBeChecked();
  await expect(count).toHaveText("2 of 5 chosen");
  await expect(
    page.getByRole("row").filter({ hasText: "Quarterly summary" })
  ).toHaveAttribute("data-state", "selected");
  const all = page.getByRole("checkbox", { name: "Choose every report shown" });
  await expect(all).toHaveAttribute("aria-checked", "mixed");
  await all.click();
  await expect(count).toHaveText("5 of 5 chosen");
  await expect(all).toBeChecked();
  await all.click();
  await expect(count).toHaveText("0 of 5 chosen");
  await expect(all).not.toBeChecked();
});

test("a checkbox, then Shift and another, selects every row between", async ({
  page,
}) => {
  await openExample(page, "data-table", "selectable");
  await page
    .getByRole("checkbox", { name: "Choose Quarterly summary" })
    .click();
  await page
    .getByRole("checkbox", { name: "Choose Hiring plan for the summer" })
    .click({ modifiers: ["Shift"] });
  await expect(page.getByText(/ of 5 chosen/u)).toHaveText("5 of 5 chosen");
});

test("Archive is done at once and undone from its toast; Delete asks first and Cancel keeps the row", async ({
  page,
}) => {
  await openExample(page, "data-table", "rows");
  const table = page.getByRole("table", { name: "Reports" });
  await page.getByRole("checkbox", { name: "Choose Travel policy" }).click();
  await page
    .getByRole("checkbox", { name: "Choose Quarterly summary" })
    .click();
  const bar = page.getByRole("group", { name: "With the chosen reports" });
  await bar.getByRole("button", { name: "Archive" }).click();
  await expect(
    names(table).filter({ hasText: "Quarterly summary" })
  ).toHaveCount(0);
  // Focus never falls back to the page: the head's checkbox takes it once the bar is gone.
  await expect(
    page.getByRole("checkbox", { name: "Choose every report shown" })
  ).toBeFocused();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(
    names(table).filter({ hasText: "Quarterly summary" })
  ).toHaveCount(1);

  await page
    .getByRole("checkbox", { name: "Choose Supplier list for the spring" })
    .click();
  const remove = bar.getByRole("button", { name: "Delete" });
  await remove.click();
  const dialog = page.getByRole("alertdialog", {
    name: "Delete this report?",
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(remove).toBeFocused();
  await expect(
    names(table).filter({ hasText: "Supplier list for the spring" })
  ).toHaveCount(1);

  await remove.click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(
    names(table).filter({ hasText: "Supplier list for the spring" })
  ).toHaveCount(0);
});

test("a row's toggle opens its summary under it and says so", async ({
  page,
}) => {
  await openExample(page, "data-table", "rows");
  await page.getByRole("button", { name: "Open Quarterly summary" }).click();
  const close = page.getByRole("button", { name: "Close Quarterly summary" });
  await expect(close).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Revenue, costs")).toBeVisible();
  await close.click();
  await expect(page.getByText("Revenue, costs")).toBeHidden();
});

test("the filter keeps the rows that meet it: Owner is Sam Patel", async ({
  page,
}) => {
  await openExample(page, "data-table", "rows");
  const table = page.getByRole("table", { name: "Reports" });
  const filter = page.getByRole("group", { name: "Filter reports" });
  await filter.getByRole("combobox", { name: "Filter field" }).click();
  await page.getByRole("option", { name: "Owner" }).click();
  await filter.getByRole("combobox", { name: "Filter value" }).click();
  await page.getByRole("option", { name: "Sam Patel" }).click();
  await expect
    .poll(async () => await namesSorted(table))
    .toBe("Budget for next year, Office move plan");
});

test("a typed value in the filter is kept on Enter, a wrong number is marked, and Escape puts it back", async ({
  page,
}) => {
  await openExample(page, "data-table", "filters");
  const filter = page.getByRole("group", { name: "Filter condition" });
  await filter.getByRole("combobox", { name: "Filter field" }).click();
  await page.getByRole("option", { name: "Views" }).click();
  const value = filter.getByRole("spinbutton", { name: "Filter value" });
  await value.fill("12");
  await value.press("Enter");
  await expect(page.getByText(/"value": 12/u)).toBeVisible();
  await value.fill("-3");
  await value.press("Enter");
  await expect(value).toHaveAttribute("aria-invalid", "true");
  await value.press("Escape");
  await expect(value).toHaveValue("12");
  await expect(value).not.toHaveAttribute("aria-invalid");
});

test("the View menu shows a hidden column; a column's menu moves and pins it, by keyboard", async ({
  page,
}) => {
  await openExample(page, "data-table", "columns");
  expect(await columnIds(page)).not.toContain("words");
  await page.getByRole("button", { name: "View" }).click();
  await page.getByRole("menuitemcheckbox", { name: "Words" }).click();
  await page.keyboard.press("Escape");
  await expect.poll(async () => await columnIds(page)).toContain("words");

  const menu = page.getByRole("button", { name: "Column: Owner" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.getByRole("menuitem", { name: "Move later" }).focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => {
      const ids = await columnIds(page);
      return ids.join(" ");
    })
    .toContain("team owner");
  await expect(menu).toBeFocused();
  expect(await hasFocusRing(menu)).toBe(true);

  await page.getByRole("button", { name: "Column: Status" }).click();
  await page.getByRole("menuitem", { name: "Pin to the end" }).click();
  await expect
    .poll(async () => {
      const ids = await columnIds(page);
      return ids.at(-1);
    })
    .toBe("status");
});

test("a column's handle resizes it a step at a time by the arrow keys and says its width", async ({
  page,
}) => {
  await openExample(page, "data-table", "columns");
  const handle = page.getByRole("slider", { name: "Width of Owner" });
  const before = Number(await handle.inputValue());
  await handle.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(handle).toHaveValue(String(before + 32));
  const drawn = await page
    .locator('thead th[data-column="owner"]')
    .evaluate((th) => Math.round(th.getBoundingClientRect().width));
  expect(Math.abs(drawn - (before + 32))).toBeLessThanOrEqual(1);
});

test("a group's heading counts its rows; closing it hides them", async ({
  page,
}) => {
  await openExample(page, "data-table", "grouped");
  const table = page.getByRole("table", { name: "Reports by owner" });
  const close = page.getByRole("button", {
    name: "Close Owner: Amara Okafor",
  });
  await expect(table.getByRole("row").filter({ has: close })).toContainText(
    /Amara Okafor\s*2/u
  );
  await expect(
    names(table).filter({ hasText: "Quarterly summary" })
  ).toBeVisible();
  await close.click();
  await expect(
    table.getByRole("button", { name: "Open Owner: Amara Okafor" })
  ).toHaveAttribute("aria-expanded", "false");
  await expect(
    names(table).filter({ hasText: "Quarterly summary" })
  ).toHaveCount(0);
});

test("a group that asks for attention says so in words", async ({ page }) => {
  await openExample(page, "data-table", "workflows");
  await expect(
    page
      .getByRole("table", { name: "Workflows" })
      .getByRole("row")
      .filter({ hasText: "needs attention" })
  ).toContainText("Needs you");
});

test("while a server answers the table is busy with placeholders, and a sort comes back in its order", async ({
  page,
}) => {
  await openExample(page, "data-table", "server");
  const table = page.getByRole("table", { name: "Reports" });
  await expect(names(table).first()).toHaveText("Budget for next year");
  await sortBy(table, "Pages").click();
  await expect(page.getByLabel("Reports").first()).toHaveAttribute(
    "aria-busy",
    "true"
  );
  await expect(page.getByRole("status").first()).toHaveText("Loading reports");
  await expect(names(table).first()).toHaveText("Travel policy");
});

test("scrolling to the last row brings more", async ({ page }) => {
  await openExample(page, "data-table", "endless");
  const table = page.getByRole("table", { name: "Weekly notes" });
  await expect(names(table)).toHaveCount(15);
  await names(table).last().scrollIntoViewIfNeeded();
  await expect(names(table)).toHaveCount(30);
});

test("no rows yet, loading and an error each say so in the rows' place", async ({
  page,
}) => {
  await openExample(page, "data-table", "outcomes");
  await expect(
    page.getByRole("table", { name: "Reports, none yet" })
  ).toContainText("No reports yet");
  const loading = page.getByRole("table", { name: "Reports, loading" });
  await expect(page.locator("[aria-busy=true]").getByRole("status")).toHaveText(
    "Loading reports"
  );
  await expect(loading.getByRole("rowheader")).toHaveCount(0);
  const failed = page.getByRole("table", { name: "Reports, failed" });
  await expect(failed).toContainText("The reports did not load");
  await expect(failed.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("nothing found is handed what was asked: its words name the search and its button clears it", async ({
  page,
}) => {
  await openExample(page, "data-table", "no-match");
  const table = page.getByRole("table", { name: /Type a word no report/u });
  await page
    .getByRole("searchbox", { name: "Search reports" })
    .fill("invoices");
  await expect(table).toContainText("No reports match “invoices”");
  await table.getByRole("button", { name: "Clear the search" }).click();
  await expect(names(table)).toHaveCount(5);
});

test("a sort and a hidden column go into the address and come back on reload; Export CSV saves what shows", async ({
  page,
}) => {
  await openExample(page, "data-table", "views");
  const table = page.getByRole("table", { name: "Reports" });
  await sortBy(table, "Pages").click();
  await page.getByRole("button", { name: "Column: Last edited" }).click();
  await page.getByRole("menuitem", { name: "Hide column" }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("reports-sort"))
    .toBe("pages");
  expect(new URL(page.url()).searchParams.get("reports-hide")).toBe("edited");
  await page.reload();
  await expect(names(table).first()).toHaveText("Travel policy");
  await expect.poll(async () => await columnIds(page)).not.toContain("edited");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export CSV" }).click(),
  ]);
  const csv = await readFile(await download.path(), "utf-8");
  const lines = csv.split("\r\n");
  // UTF-8's byte-order mark first, so a spreadsheet reads letters past ASCII.
  expect(lines[0]).toBe("\uFEFFReport,Owner,Pages");
  expect(lines).toHaveLength(10);
  expect(lines[1]).toMatch(/^Travel policy,/u);
});

test("a row that opens a page: its name is a link, one Tab stop, and the row takes the ring", async ({
  page,
}) => {
  await openExample(page, "data-table", "opens-page");
  const link = page.getByRole("link", { name: "Amara Okafor" });
  await expect(link).toHaveAttribute("href", "#member-m1");
  await page.getByRole("checkbox", { name: "Choose Amara Okafor" }).focus();
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#member-m1$/u);
});

test("a row that opens a panel: its name is a button, and the open row is current", async ({
  page,
}) => {
  await openExample(page, "data-table", "opens-panel");
  const current = page.getByRole("row", { name: /Expense reports/u });
  await expect(current).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Month-end close checklist" }).click();
  await expect(page.getByText("Open: Month-end close checklist")).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Month-end close checklist/u })
  ).toHaveAttribute("aria-current", "true");
});

test("a row's state is said after its name, and its actions stay usable", async ({
  page,
}) => {
  await openExample(page, "data-table", "members-status");
  await expect(
    page.getByRole("rowheader", { name: /Lena Ruiz/u })
  ).toContainText("pending");
  await expect(
    page.getByRole("rowheader", { name: /Sam Patel/u })
  ).toContainText("removed");
  await page.getByRole("button", { name: "Actions for Sam Patel" }).click();
  await expect(
    page.getByRole("menuitem", { name: "Restore Sam Patel" })
  ).toBeVisible();
});

test("a column's info mark says more about it, and its name still sorts", async ({
  page,
}) => {
  await openExample(page, "data-table", "members-narrow");
  const info = page.getByRole("button", { name: "More about Role" });
  await info.hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "Owners and admins manage members"
  );
  await sortBy(page.getByRole("table", { name: "Members" }), "Role").click();
  await expect(head(page.getByRole("table"), "Role")).toHaveAttribute(
    "aria-sort",
    "ascending"
  );
});

test("a date says when as people do, and focus shows the full date", async ({
  page,
}) => {
  await openExample(page, "data-table", "dates", { time: fixedTime });
  const table = page.getByRole("table", { name: "Runs" });
  await expect(table.getByRole("row").nth(1)).toContainText("3 minutes ago");
  await expect(table.getByRole("row").nth(3)).toContainText("Yesterday");
  await expect(table.getByRole("row").last()).toContainText("No date");
  // The keys reach a date and show its full date and time, as a pointer does.
  await sortBy(table, "Last run").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByText("3 minutes ago")).toBeFocused();
  await expect(page.getByRole("tooltip")).toContainText("17 November 2026");
  // It sorts by the date, not the words: oldest first, the missing one before every date.
  await sortBy(table, "Last run").press("Enter");
  await expect(names(table).first()).toHaveText("Draft onboarding");
});

test("compact, default and comfortable rows are 32, 42 and 50px", async ({
  page,
}) => {
  await openExample(page, "data-table", "density");
  // Every body row of each table: the density's height, and its hairline (none under the last).
  const fits = await Promise.all(
    (
      [
        ["compact", 32],
        ["default", 42],
        ["(comfortable|roomy)", 50],
      ] as const
    ).map(
      async ([density, tall]) =>
        await page
          .getByRole("table", {
            name: new RegExp(`^Reports, ${density}$`, "u"),
          })
          .getByRole("row")
          .evaluateAll(
            (rows, height) =>
              rows.slice(1).every((row) => {
                const drawn = Math.round(row.getBoundingClientRect().height);
                return drawn === height || drawn === height + 1;
              }),
            tall
          )
    )
  );
  expect(fits).toEqual([true, true, true]);
});

/** Asks the table named Reports, through the page's agent bridge, to do an action; its answer as JSON. */
const askAgent = async (page: Page, action: string, args: unknown[] = []) =>
  JSON.stringify(
    await page.evaluate(
      async ([name, input]) => {
        const bridge: unknown = Reflect.get(window, "damskoAgent");
        const run: unknown =
          typeof bridge === "object" && bridge !== null
            ? Reflect.get(bridge, "act")
            : undefined;
        if (typeof run !== "function") {
          return null;
        }
        const done: unknown = await Reflect.apply(run, bridge, [
          { steps: [{ ref: "Reports", action: name, args: input }] },
        ]);
        return done;
      },
      [action, args] as const
    )
  );

test("an agent finds the table by its name, reads it, changes its view and is refused what it cannot do", async ({
  page,
}) => {
  await openExample(page, "data-table", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const act = async (action: string, args: unknown[] = []) =>
    await askAgent(page, action, args);
  const table = page.getByRole("table", { name: "Reports" });
  const read = await act("read");
  expect(read).toContain('"header":"Report"');
  expect(read).toContain('"found":9');
  await act("sortBy", [{ key: "pages", order: "descending" }]);
  await expect(names(table).first()).toHaveText("Budget for next year");
  await act("search", [{ query: "plan" }]);
  await expect
    .poll(async () => await namesSorted(table))
    .toBe("Hiring plan for the summer, Office move plan");
  await act("search", [{ query: "" }]);
  await act("filter", [{ field: "pages", operator: "at-least", value: 20 }]);
  await expect
    .poll(async () => await namesSorted(table))
    .toBe("Budget for next year, Team survey results");
  await act("filter", [null]);
  await act("choose", [{ keys: ["r1", "r3"] }]);
  await expect(page.getByText(/ of 9 chosen/u)).toHaveText("2 of 9 chosen");
  expect(await act("sortBy", [{ key: "missing" }])).toContain(
    "No sortable column"
  );
  expect(await act("page", [{ page: 9 }])).toContain("There are pages 1 to 2");
  await act("page", [{ page: 2 }]);
  await expect(names(table)).toHaveCount(4);
});

test("an agent pages a server's table by the server's count, and the view in the address asks the server only on a change", async ({
  page,
}) => {
  await openExample(page, "data-table", "agent-server");
  await page.waitForFunction(() => "damskoAgent" in window);
  const table = page.getByRole("table", { name: "Reports" });
  await expect(page.getByText("Asked the server: 0")).toBeVisible();
  const read = await askAgent(page, "read");
  expect(read).toContain('"found":9');
  expect(read).toContain('"more":true');
  expect(read).toContain('"pages":2');
  expect(await askAgent(page, "page", [{ page: 2 }])).toContain('"page":2');
  await expect(names(table)).toHaveCount(4);
  await expect(page.getByText("Asked the server: 1")).toBeVisible();
});

test("a row's action that takes its row away takes it out of the selection, and focus goes to the next row", async ({
  page,
}) => {
  await openExample(page, "data-table", "rows");
  await page.getByRole("checkbox", { name: "Choose Office move plan" }).click();
  await expect(page.getByText(/ chosen$/u)).toHaveText("1 of 9 chosen");
  await page
    .getByRole("button", { name: "Actions for Office move plan" })
    .click();
  await page.getByRole("menuitem", { name: "Archive" }).click();
  await expect(page.getByText(/ chosen$/u)).toHaveText("0 of 8 chosen");
  await expect(
    page.getByRole("button", { name: "Actions for Hiring plan for the summer" })
  ).toBeFocused();
});

test("a date column is searched and exported as its date, not its time in milliseconds", async ({
  page,
}) => {
  await openExample(page, "data-table", "dates-found", { time: fixedTime });
  const table = page.getByRole("table", { name: "Reports" });
  await page
    .getByRole("searchbox", { name: "Search reports" })
    .fill("2026-11-12");
  await expect(names(table)).toHaveText(["Quarterly summary"]);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export CSV" }).click(),
  ]);
  const csv = await readFile(await download.path(), "utf-8");
  expect(csv.split("\r\n")).toStrictEqual([
    "\uFEFFReport,Last edited",
    "Quarterly summary,2026-11-12T00:00:00.000Z",
  ]);
});

test("right to left, dragging a column's handle toward the line's start widens it", async ({
  page,
}) => {
  await openExample(page, "data-table", "columns");
  await page.evaluate(() => {
    document.documentElement.setAttribute("dir", "rtl");
  });
  const handle = page.getByRole("slider", { name: "Width of Owner" });
  const before = Number(await handle.inputValue());
  const box = await handle.boundingBox();
  if (box === null) {
    throw new Error("the handle has no box");
  }
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 40, y, { steps: 4 });
  await page.mouse.up();
  await expect
    .poll(async () => Number(await handle.inputValue()))
    .toBeGreaterThan(before + 30);
});

test("columns that come after the table opens join at the end, hidden if they start hidden", async ({
  page,
}) => {
  await openExample(page, "data-table", "columns-later");
  await page.getByRole("button", { name: "Add columns" }).click();
  await expect
    .poll(async () => await columnIds(page))
    .toStrictEqual(["name", "owner", "pages"]);
  await page.getByRole("button", { name: "View" }).click();
  await expect(
    page.getByRole("menuitemcheckbox", { name: "Last edited" })
  ).not.toBeChecked();
  await expect(
    page.getByRole("menuitemcheckbox", { name: "Pages" })
  ).toBeChecked();
});

test("a narrow table keeps the person whole: their initials, their name and their email", async ({
  page,
}) => {
  await openExample(page, "data-table", "members-narrow");
  const table = page.getByRole("table", { name: "Members" });
  await expect(table.getByText("amara@contoso.example")).toBeVisible();
  await expect(table.getByText("AO", { exact: true })).toBeVisible();
});
