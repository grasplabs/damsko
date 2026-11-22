import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { fixedTime, openExample } from "./example.ts";

// The examples' launch plan: six rows of Task, Stage, Owner, Budget, Due and Done, with row numbers.
const open = async (page: Page, example = "basic", name = "Launch plan") => {
  await openExample(page, "data-grid", example);
  return page.getByRole("grid", { name });
};

/** The cell at a row and column of the data, from 0; the row numbers are row headers, not counted. */
const cellAt = (grid: Locator, row: number, col: number) =>
  grid
    .getByRole("row")
    .nth(row + 1)
    .getByRole("gridcell")
    .nth(col);

/** The words a row's first four cells show, as one line. */
const rowText = async (grid: Locator, row: number) => {
  const texts = await grid
    .getByRole("row")
    .nth(row + 1)
    .getByRole("gridcell")
    .allTextContents();
  return texts
    .slice(0, 4)
    .map((text) => text.trim())
    .join(" | ");
};

const centre = async (cell: Locator) => {
  const box = await cell.boundingBox();
  if (box === null) {
    throw new Error("the cell has no box");
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

const press = async (page: Page, keys: string[]) => {
  for (const key of keys) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other
    await page.keyboard.press(key);
  }
};

// Firefox gives a page's own copy and paste events no clipboard data: there the clipboard is
// written and read for real and the keys pressed, as a person does; the others take the event.
const paste = async (page: Page, browserName: string, text: string) => {
  if (browserName === "firefox") {
    await page.evaluate(async (value) => {
      await navigator.clipboard.writeText(value);
    }, text);
    await page.keyboard.press("ControlOrMeta+V");
    return;
  }
  await page.evaluate((value) => {
    const data = new DataTransfer();
    data.setData("text/plain", value);
    document.activeElement?.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      })
    );
  }, text);
};
const copy = async (page: Page, browserName: string) => {
  if (browserName === "firefox") {
    await page.keyboard.press("ControlOrMeta+C");
    return await page.evaluate(
      async () => await navigator.clipboard.readText()
    );
  }
  return await page.evaluate(() => {
    const data = new DataTransfer();
    document.activeElement?.dispatchEvent(
      new ClipboardEvent("copy", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      })
    );
    return data.getData("text/plain");
  });
};

test("it is a grid named by its label, with its rows and columns counted", async ({
  page,
}) => {
  const grid = await open(page);
  await expect(grid).toHaveAttribute("aria-multiselectable", "true");
  await expect(grid).toHaveAttribute("aria-rowcount", "7");
  await expect(grid).toHaveAttribute("aria-colcount", "7");
  await expect(grid.getByRole("row")).toHaveCount(7);
  await expect(grid.getByRole("columnheader")).toHaveCount(7);
  await expect(grid.getByRole("columnheader", { name: "Row" })).toBeAttached();
  await expect(grid.getByRole("rowheader")).toHaveCount(6);
  await expect(grid.getByRole("gridcell")).toHaveCount(36);
  await expect(cellAt(grid, 2, 3)).toHaveAttribute("aria-colindex", "5");
  await expect(grid.getByRole("row").nth(3)).toHaveAttribute(
    "aria-rowindex",
    "4"
  );
});

test("the active cell is the grid's one tab stop, and a press makes a cell active", async ({
  page,
}) => {
  const grid = await open(page);
  await expect(grid.locator("td[tabindex='0']")).toHaveCount(1);
  await expect(cellAt(grid, 0, 0)).toHaveAttribute("tabindex", "0");
  await cellAt(grid, 3, 2).click();
  await expect(cellAt(grid, 3, 2)).toBeFocused();
  await expect(cellAt(grid, 3, 2)).toHaveAttribute("aria-selected", "true");
  await expect(cellAt(grid, 3, 2)).toHaveAttribute("tabindex", "0");
  await expect(cellAt(grid, 0, 0)).toHaveAttribute("tabindex", "-1");
  await expect(cellAt(grid, 0, 0)).toHaveAttribute("aria-selected", "false");
});

test("the arrows, mod with an arrow, Home, End and the page keys move the active cell, focus with it", async ({
  page,
}) => {
  const grid = await open(page);
  await cellAt(grid, 0, 0).click();
  await press(page, ["ArrowDown", "ArrowDown", "ArrowRight"]);
  await expect(cellAt(grid, 2, 1)).toBeFocused();
  await press(page, ["ControlOrMeta+ArrowDown"]);
  await expect(cellAt(grid, 5, 1)).toBeFocused();
  await press(page, ["Home"]);
  await expect(cellAt(grid, 5, 0)).toBeFocused();
  await press(page, ["End"]);
  await expect(cellAt(grid, 5, 5)).toBeFocused();
  await press(page, ["ControlOrMeta+ArrowUp"]);
  await expect(cellAt(grid, 0, 5)).toBeFocused();
  await press(page, ["ControlOrMeta+ArrowLeft"]);
  await expect(cellAt(grid, 0, 0)).toBeFocused();
  await press(page, ["ControlOrMeta+ArrowRight"]);
  await expect(cellAt(grid, 0, 5)).toBeFocused();
  await press(page, ["PageDown"]);
  await expect(cellAt(grid, 5, 5)).toBeFocused();
  await press(page, ["PageUp"]);
  await expect(cellAt(grid, 0, 5)).toBeFocused();
  await press(page, ["ControlOrMeta+End"]);
  await expect(cellAt(grid, 5, 5)).toBeFocused();
  await press(page, ["ControlOrMeta+Home"]);
  await expect(cellAt(grid, 0, 0)).toBeFocused();
  // At the edge an arrow stays.
  await press(page, ["ArrowLeft", "ArrowUp"]);
  await expect(cellAt(grid, 0, 0)).not.toBeFocused();
  await expect(
    grid.getByRole("button", { name: "Task", exact: true })
  ).toBeFocused();
});

test("right to left, the arrows follow the text's flow", async ({ page }) => {
  const grid = await open(page);
  await grid.evaluate((element) => {
    element.setAttribute("dir", "rtl");
  });
  await cellAt(grid, 0, 1).click();
  await press(page, ["ArrowLeft"]);
  await expect(cellAt(grid, 0, 2)).toBeFocused();
  await press(page, ["ArrowRight", "ArrowRight"]);
  await expect(cellAt(grid, 0, 0)).toBeFocused();
});

test("Tab moves on cell by cell and leaves past the last cell and before the first", async ({
  page,
}) => {
  const grid = await open(page, "tab-move", "Tab A: moves on");
  await cellAt(grid, 1, 1).click();
  await press(page, ["ArrowRight", "Tab"]);
  await expect(cellAt(grid, 1, 3)).toBeFocused();
  await press(page, ["Shift+Tab"]);
  await expect(cellAt(grid, 1, 2)).toBeFocused();
  // Along the row and on to the next.
  await press(page, ["End", "Tab"]);
  await expect(cellAt(grid, 2, 0)).toBeFocused();
  await press(page, ["ControlOrMeta+End", "Tab"]);
  await expect(grid.locator(":focus")).toHaveCount(0);
  await cellAt(grid, 0, 1).click();
  await press(page, ["ArrowLeft", "Shift+Tab"]);
  await expect(cellAt(grid, 0, 0)).not.toBeFocused();
  await expect(
    grid.getByRole("gridcell").and(page.locator(":focus"))
  ).toHaveCount(0);
});

test("with tabNavigation leave, Tab leaves the grid at once and Shift+Tab comes back to its cell", async ({
  page,
}) => {
  const grid = await open(page, "tab-leave", "Tab B: leaves");
  await cellAt(grid, 1, 1).click();
  await press(page, ["ArrowRight", "Tab"]);
  await expect(grid.locator(":focus")).toHaveCount(0);
  await press(page, ["Shift+Tab"]);
  await expect(cellAt(grid, 1, 2)).toBeFocused();
});

test("the heads are one stop: Down goes into a column, Up from the first row comes back, Left and Right go along", async ({
  page,
}) => {
  const grid = await open(page);
  const heads = grid.getByRole("columnheader").getByRole("button");
  await expect(heads.and(page.locator("[tabindex='0']"))).toHaveCount(1);
  await grid.getByRole("button", { name: "Stage" }).focus();
  await press(page, ["ArrowDown"]);
  await expect(cellAt(grid, 0, 1)).toBeFocused();
  await press(page, ["ArrowUp"]);
  await expect(grid.getByRole("button", { name: "Stage" })).toBeFocused();
  // Due has no button: its head takes the focus itself.
  await press(page, ["ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(grid.getByRole("columnheader", { name: "Due" })).toBeFocused();
  await press(page, ["ArrowDown", "ArrowDown"]);
  await expect(cellAt(grid, 1, 4)).toBeFocused();
  await expect(grid.locator("[aria-sort]")).toHaveCount(0);
});

test("Shift and the arrows choose a range and say it; Escape brings it back to one cell", async ({
  page,
}) => {
  const grid = await open(page);
  await cellAt(grid, 2, 0).click();
  await press(page, ["Shift+ArrowDown", "Shift+ArrowDown", "Shift+ArrowRight"]);
  for (const [row, col] of [
    [2, 0],
    [3, 1],
    [4, 0],
    [4, 1],
  ] as const) {
    // oxlint-disable-next-line no-await-in-loop -- one cell after the other
    await expect(cellAt(grid, row, col)).toHaveAttribute(
      "aria-selected",
      "true"
    );
  }
  await expect(cellAt(grid, 5, 0)).toHaveAttribute("aria-selected", "false");
  await expect(cellAt(grid, 2, 2)).toHaveAttribute("aria-selected", "false");
  await expect(cellAt(grid, 4, 1)).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(
    "6 cells chosen: Task to Stage, rows 3 to 5"
  );
  await press(page, ["Escape"]);
  await expect(cellAt(grid, 2, 0)).toHaveAttribute("aria-selected", "false");
  await expect(cellAt(grid, 4, 1)).toHaveAttribute("aria-selected", "true");
  await press(page, ["ControlOrMeta+A"]);
  await expect(grid.locator("td[aria-selected='true']")).toHaveCount(36);
  await expect(page.getByRole("status")).toHaveText(
    "36 cells chosen: Task to Done, rows 1 to 6"
  );
});

test("a drag across cells chooses a range, Shift and a press grows it, and a row's number chooses its row", async ({
  page,
}) => {
  const grid = await open(page);
  const from = await centre(cellAt(grid, 1, 0));
  const to = await centre(cellAt(grid, 3, 2));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
  await expect(grid.locator("td[aria-selected='true']")).toHaveCount(9);
  await expect(cellAt(grid, 1, 0)).toHaveAttribute("aria-selected", "true");
  await expect(cellAt(grid, 3, 2)).toHaveAttribute("aria-selected", "true");
  await expect(cellAt(grid, 4, 2)).toHaveAttribute("aria-selected", "false");
  await cellAt(grid, 4, 3).click({ modifiers: ["Shift"] });
  await expect(grid.locator("td[aria-selected='true']")).toHaveCount(16);
  await grid.getByRole("rowheader", { name: "2" }).click();
  await expect(grid.locator("td[aria-selected='true']")).toHaveCount(6);
  await expect(cellAt(grid, 1, 5)).toBeFocused();
});

test("typing edits a cell, Enter commits and moves down, words that do not fit stay, Escape cancels, mod+Z undoes", async ({
  page,
}) => {
  const grid = await open(page);
  const budget = cellAt(grid, 1, 3);
  await budget.click();
  await page.keyboard.type("4100");
  const editor = grid.getByRole("textbox", { name: "Edit Budget, row 2" });
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue("4100");
  await press(page, ["Enter"]);
  await expect(budget).toHaveText("4,100.00");
  await expect(cellAt(grid, 2, 3)).toBeFocused();
  await page.keyboard.type("ab");
  await press(page, ["Enter"]);
  const wrong = grid.getByRole("textbox", { name: "Edit Budget, row 3" });
  await expect(wrong).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("status")).toHaveText("Budget takes a figure");
  await press(page, ["Escape"]);
  await expect(wrong).toHaveCount(0);
  await expect(cellAt(grid, 2, 3)).toHaveText("8,900.00");
  await expect(cellAt(grid, 2, 3)).toBeFocused();
  await press(page, ["ControlOrMeta+Z"]);
  await expect(budget).toHaveText("3,250.00");
  await expect(page.getByRole("status")).toHaveText("Undone");
  await press(page, ["ControlOrMeta+Shift+Z"]);
  await expect(budget).toHaveText("4,100.00");
  await expect(page.getByRole("status")).toHaveText("Redone");
});

test("Enter and F2 open the editor on the cell's own words; Tab commits and moves on; Escape gives the cell back", async ({
  page,
}) => {
  const grid = await open(page);
  await cellAt(grid, 0, 0).click();
  await press(page, ["Enter"]);
  const editor = grid.getByRole("textbox", { name: "Edit Task, row 1" });
  await expect(editor).toHaveValue("Plan the spring launch");
  // Its words are all chosen: a letter replaces them.
  await page.keyboard.type("X");
  await expect(editor).toHaveValue("X");
  await press(page, ["Escape"]);
  await expect(cellAt(grid, 0, 0)).toHaveText("Plan the spring launch");
  await press(page, ["F2"]);
  await expect(editor).toHaveValue("Plan the spring launch");
  await press(page, ["End"]);
  await page.keyboard.type(" now");
  await press(page, ["Tab"]);
  await expect(cellAt(grid, 0, 0)).toHaveText("Plan the spring launch now");
  await expect(cellAt(grid, 0, 1)).toBeFocused();
  // A select takes one of its options, by the start of its words.
  await page.keyboard.type("rev");
  await press(page, ["Enter"]);
  await expect(cellAt(grid, 0, 1)).toHaveText("Review");
});

test("a box's cell is the control: a press or Space ticks it, and it says so", async ({
  page,
}) => {
  const grid = await open(page);
  const done = grid.getByRole("gridcell", { name: "Done, row 1" });
  await expect(done).toHaveText("Ticked");
  await done.click();
  await expect(done).toBeFocused();
  await expect(done).toHaveText("Not ticked");
  await expect(page.getByRole("status")).toHaveText("Done, row 1: Not ticked");
  await press(page, ["Space"]);
  await expect(done).toHaveText("Ticked");
  await expect(page.getByRole("status")).toHaveText("Done, row 1: Ticked");
  // The box inside takes no focus of its own.
  await expect(done.locator("button, input, [tabindex]")).toHaveCount(0);
  // Enter does not open an editor on a box.
  await press(page, ["Enter"]);
  await expect(grid.getByRole("textbox")).toHaveCount(0);
});

test("a spreadsheet's TSV pastes as a block, each cell read by its column; copy gives TSV; undo takes it back", async ({
  page,
  browserName,
  context,
}) => {
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  }
  const grid = await open(page);
  await cellAt(grid, 3, 0).click();
  await paste(
    page,
    browserName,
    'Sign the "lease"\tReview\tAmara Okafor\t1,250.50\nPrint badges\tdone\tLin Hayashi\t€ 300'
  );
  await expect
    .poll(async () => await rowText(grid, 3))
    .toBe('Sign the "lease" | Review | Amara Okafor | 1,250.50');
  await expect
    .poll(async () => await rowText(grid, 4))
    .toBe("Print badges | Done | Lin Hayashi | 300.00");
  // The pasted block is chosen, and said as a range.
  await expect(page.getByRole("status")).toHaveText(
    "8 cells chosen: Task to Budget, rows 4 to 5"
  );
  expect(await copy(page, browserName)).toBe(
    '"Sign the ""lease"""\tReview\tAmara Okafor\t1250.5\nPrint badges\tDone\tLin Hayashi\t300'
  );
  await expect(page.getByRole("status")).toHaveText("Copied");
  await press(page, ["ControlOrMeta+Z"]);
  await expect(cellAt(grid, 3, 0)).toHaveText("Write the invitations");
});

test("Delete clears the range, and undo puts it back", async ({ page }) => {
  const grid = await open(page);
  await cellAt(grid, 0, 0).click();
  await press(page, ["Shift+ArrowRight", "Delete"]);
  await expect(cellAt(grid, 0, 0)).toHaveText("");
  await expect(cellAt(grid, 0, 1)).toHaveText("");
  await expect(page.getByRole("status")).toHaveText("Cleared");
  await press(page, ["ControlOrMeta+Z"]);
  await expect(cellAt(grid, 0, 0)).toHaveText("Plan the spring launch");
  await expect(cellAt(grid, 0, 1)).toHaveText("Planning");
});

test("a column's name sorts low to high, then high to low, then as given, said with aria-sort", async ({
  page,
}) => {
  const grid = await open(page);
  const head = grid.getByRole("columnheader", { name: "Budget" });
  const figures = async () => {
    const texts = await grid
      .getByRole("row")
      .evaluateAll((rows) =>
        rows
          .slice(1)
          .map((row) => row.querySelectorAll("td")[3]?.textContent ?? "")
      );
    return texts.map((text) => Number(text.replaceAll(",", "")));
  };
  await grid.getByRole("button", { name: "Budget" }).click();
  await expect(head).toHaveAttribute("aria-sort", "ascending");
  expect(await figures()).toEqual([450, 1780, 3250, 5600, 8900, 12_400]);
  await grid.getByRole("button", { name: "Budget" }).click();
  await expect(head).toHaveAttribute("aria-sort", "descending");
  expect(await figures()).toEqual([12_400, 8900, 5600, 3250, 1780, 450]);
  await grid.getByRole("button", { name: "Budget" }).click();
  await expect(head).not.toHaveAttribute("aria-sort");
  expect(await figures()).toEqual([12_400, 3250, 8900, 450, 1780, 5600]);
});

test("a head's handle widens its column by the arrow keys, and a double press fits it again", async ({
  page,
}) => {
  const grid = await open(page);
  const head = grid.getByRole("columnheader", { name: "Task" });
  const width = async () => {
    const box = await head.boundingBox();
    return box?.width ?? 0;
  };
  const fitted = await width();
  const handle = grid.getByRole("slider", { name: "Width of Task" });
  await handle.focus();
  await press(page, ["ArrowRight", "ArrowRight"]);
  await expect.poll(width).toBeGreaterThan(fitted);
  await handle.dblclick();
  await expect.poll(width).toBeCloseTo(fitted, 0);
});

test("Chromium's own accessibility tree holds every row, head and cell", async ({
  page,
  browserName,
}) => {
  await open(page);
  // The grid lays out with display: contents and subgrid; the browser's tree must still hold its
  // parts. Only Chromium's tree can be read from Playwright.
  if (browserName === "chromium") {
    const session = await page.context().newCDPSession(page);
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    const count = (role: string) =>
      nodes.filter((node) => !node.ignored && node.role?.value === role).length;
    expect(count("grid")).toBe(1);
    expect(count("row")).toBe(7);
    expect(count("columnheader")).toBe(7);
    expect(count("rowheader")).toBe(6);
    expect(count("gridcell")).toBe(36);
  }
});

// The live plan: a task ("Answer the press") comes in on top every other 20 seconds, as a refetch
// brings it, and goes again 20 seconds later.
const openLive = async (page: Page) => {
  await openExample(page, "data-grid", "live", { time: fixedTime });
  return page.getByRole("grid", { name: "Live plan" });
};

test("an edit lands on the row it was opened on, though a row comes in above while it is typed", async ({
  page,
}) => {
  const grid = await openLive(page);
  await cellAt(grid, 1, 0).click();
  await press(page, ["Enter"]);
  await page.keyboard.type("Brief everyone");
  await page.clock.runFor(20_000);
  await expect(cellAt(grid, 0, 0)).toHaveText("Answer the press");
  await press(page, ["Enter"]);
  await expect(cellAt(grid, 2, 0)).toHaveText("Brief everyone");
  await expect(cellAt(grid, 1, 0)).toHaveText("Plan the spring launch");
  await expect(cellAt(grid, 3, 0)).toBeFocused();
});

test("a range keeps to its rows as a row comes in above, and copies them", async ({
  page,
  browserName,
  context,
}) => {
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  }
  const grid = await openLive(page);
  await cellAt(grid, 0, 0).click();
  await press(page, ["Shift+ArrowDown"]);
  await page.clock.runFor(20_000);
  await expect(cellAt(grid, 0, 0)).toHaveAttribute("aria-selected", "false");
  expect(await copy(page, browserName)).toBe(
    "Plan the spring launch\nBrief the suppliers"
  );
});

test("when the row that holds focus goes, focus stays in the grid, and its open editor closes unwritten", async ({
  page,
}) => {
  const grid = await openLive(page);
  await page.clock.runFor(20_000);
  await cellAt(grid, 0, 1).click();
  await page.clock.runFor(20_000);
  await expect(cellAt(grid, 0, 0)).toHaveText("Plan the spring launch");
  await expect(cellAt(grid, 0, 1)).toBeFocused();
  await page.clock.runFor(20_000);
  await cellAt(grid, 0, 0).click();
  await press(page, ["Enter"]);
  await page.keyboard.type("Lost words");
  await page.clock.runFor(20_000);
  await expect(grid.getByRole("textbox")).toHaveCount(0);
  await expect(cellAt(grid, 0, 0)).toBeFocused();
  await expect(cellAt(grid, 0, 0)).toHaveText("Plan the spring launch");
});

test("a paste into a read-only grid changes nothing, chooses nothing and says it is read only", async ({
  page,
  browserName,
  context,
}) => {
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  }
  const grid = await open(page, "read-only", "Plan, read only");
  await cellAt(grid, 0, 0).click();
  await paste(page, browserName, "a\tb\nc\td");
  await expect(cellAt(grid, 0, 0)).toHaveText("Plan the spring launch");
  await expect(cellAt(grid, 1, 1)).toHaveAttribute("aria-selected", "false");
  await expect(page.getByRole("status")).toHaveText("Read only");
});
