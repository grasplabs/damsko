import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** The commands on show. */
const options = (page: Page) =>
  page.getByRole("listbox").filter({ visible: true }).getByRole("option");

/** The command the keys are on: the field names it as its active option. */
const highlighted = (page: Page) =>
  page.locator("[role=option][data-highlighted]").filter({ visible: true });

test("an agent finds the list by its name, reads every command, and highlights one by its words", async ({
  page,
}) => {
  await openExample(page, "command", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const run = await page.evaluate(async () => {
    interface Entry {
      component: string;
      label?: string;
      items?: { label: string }[];
      value?: unknown;
    }
    // SAFETY: the example calls pageAgent(), which puts the agent bridge on window.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see SAFETY
    const bridge = Reflect.get(window, "damskoAgent") as {
      snapshot: () => Entry[];
      act: (plan: { steps: unknown[] }) => Promise<{ ok: boolean }>;
    };
    const list = () =>
      bridge.snapshot().find((entry) => entry.component === "command");
    const found = list();
    const moved = await bridge.act({
      steps: [
        {
          ref: "Search actions",
          action: "setValue",
          args: ["Send the summary"],
        },
      ],
    });
    return { found, moved: moved.ok, after: list()?.value };
  });
  expect(run.found?.label).toBe("Search actions");
  expect(run.found?.items?.map((item) => item.label)).toEqual([
    "Publish the report",
    "Send the summary",
  ]);
  expect(run.moved).toBe(true);
  expect(run.after).toBe("send");
});

test("typing filters and marks the words, the arrows skip a disabled command, and nothing matching says so; no key scrolls the page", async ({
  page,
}) => {
  await openExample(page, "command", "basic");
  const field = page.getByRole("combobox", { name: "Search actions" });
  const before = await page.evaluate(() => window.scrollY);
  await field.focus();
  await expect(highlighted(page)).toHaveText(/New project/u);
  await expect(
    page.getByRole("group", { name: "Project", exact: true })
  ).toBeVisible();
  await page.keyboard.type("inv");
  await expect(options(page)).toHaveText([/Invite people/u]);
  await expect(options(page).first().locator("mark").first()).toBeVisible();
  await expect(page.getByRole("group", { name: "This page" })).toBeHidden();
  await field.fill("");
  await expect(options(page)).toHaveCount(6);
  // New project is highlighted; three down is Copy link, and the next skips Export as CSV (disabled).
  for (const _ of [0, 1, 2]) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other
    await page.keyboard.press("ArrowDown");
  }
  await expect(highlighted(page)).toHaveText(/Copy link/u);
  await page.keyboard.press("ArrowDown");
  await expect(highlighted(page)).toHaveText(/Open settings/u);
  await field.fill("zzzz");
  await expect(options(page)).toHaveCount(0);
  await expect(page.getByText("No results")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(field).toHaveValue("");
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

test("Enter runs the highlighted command: it shows it is working, and a failed one shows its words", async ({
  page,
}) => {
  await openExample(page, "command", "working");
  const field = page.getByRole("combobox", { name: "Search actions" });
  await field.focus();
  await page.keyboard.type("send");
  await page.keyboard.press("Enter");
  await expect(options(page).first()).toHaveAttribute("aria-busy", "true");
  await expect(options(page).first()).toContainText("Could not send", {
    timeout: 5000,
  });
});

test("the list written as parts: a group's heading, a CommandItem's shortcut, and its own failure words", async ({
  page,
}) => {
  await openExample(page, "command", "parts");
  const field = page.getByRole("combobox", { name: "Search actions" });
  await field.focus();
  await expect(
    page.getByRole("group", { name: "Project", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: /New project/u })
  ).toHaveAttribute("aria-keyshortcuts", /N/u);
  await page.keyboard.type("dupl");
  await page.keyboard.press("Enter");
  await expect(options(page).first()).toContainText("Could not duplicate");
  await field.fill("nothing like it");
  await expect(page.getByText("Nothing by that name")).toBeVisible();
});

test("the right arrow opens a result's actions, Left comes back with the words kept, and Enter still runs the result", async ({
  page,
}) => {
  await openExample(page, "command", "actions");
  const field = page.getByRole("combobox", { name: "Search the workspace" });
  await field.focus();
  await page.keyboard.type("spring");
  await page.keyboard.press("ArrowRight");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "Copy link" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(menu).toBeHidden();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("spring");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Would share Spring launch")).toBeVisible();
  await expect(field).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Would open Spring launch")).toBeVisible();
});

test("CommandDialog opens from its button, a command run closes it, and focus goes back to the button", async ({
  page,
}) => {
  await openExample(page, "command", "dialog");
  const button = page.getByRole("button", { name: "Search" });
  await button.click();
  const dialog = page.getByRole("dialog", { name: "Search actions" });
  await expect(dialog).toBeVisible();
  const field = dialog.getByRole("combobox", { name: "Search actions" });
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute(
    "placeholder",
    "Type a command or search"
  );
  await expect(dialog.getByRole("group", { name: "Go to" })).toBeVisible();
  await page.keyboard.type("invite");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Ran invite")).toBeVisible();
  await expect(button).toBeFocused();
});

test("CommandDialog opens on its shortcut from anywhere on the page, and Escape gives focus back", async ({
  page,
}) => {
  await openExample(page, "command", "dialog");
  const button = page.getByRole("button", { name: "Search" });
  // The platform says which key `mod` is, Meta on a Mac and Control elsewhere; the button says it.
  const keys = await button.getAttribute("aria-keyshortcuts");
  expect(keys).toMatch(/^(?:Meta|Control)\+Shift\+P$/u);
  await button.focus();
  await page.keyboard.press(keys ?? "");
  const dialog = page.getByRole("dialog", { name: "Search actions" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("combobox", { name: "Search actions" })
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
});

test("a command that fails again says so again", async ({ page }) => {
  // Every change of words in a live region, in order: the same failure twice is two.
  await page.addInitScript(() => {
    const said: string[] = [];
    const last = new WeakMap<Element, string>();
    Reflect.set(window, "said", said);
    new MutationObserver((records) => {
      for (const record of records) {
        const node =
          record.target instanceof Element
            ? record.target
            : record.target.parentElement;
        const region = node?.closest(
          "[aria-live], [role=status], [role=alert], output"
        );
        const text = region?.textContent ?? "";
        if (
          region !== null &&
          region !== undefined &&
          text !== last.get(region)
        ) {
          last.set(region, text);
          if (text !== "") {
            said.push(text);
          }
        }
      }
    }).observe(document, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  });
  await openExample(page, "command", "parts");
  const field = page.getByRole("combobox", { name: "Search actions" });
  await field.focus();
  await page.keyboard.type("dupl");
  const failures = async () =>
    await page.evaluate(() => {
      const said: unknown = Reflect.get(window, "said");
      return Array.isArray(said)
        ? said.filter((words) => words === "Could not duplicate").length
        : 0;
    });
  await page.keyboard.press("Enter");
  await expect(options(page).first()).toContainText("Could not duplicate");
  await expect.poll(failures).toBe(1);
  await page.keyboard.press("Enter");
  await expect.poll(failures).toBe(2);
});

test("right to left, the left arrow opens a result's actions and the right arrow comes back", async ({
  page,
}) => {
  await openExample(page, "command", "actions");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const field = page.getByRole("combobox", { name: "Search the workspace" });
  await field.focus();
  await page.keyboard.type("spring");
  const menu = page.getByRole("menu");
  await page.keyboard.press("ArrowRight");
  await expect(menu).toBeHidden();
  // Right moved the caret off the end of the words: back to it.
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "Copy link" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(menu).toBeHidden();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("spring");
});

test("a palette's plain-key shortcut waits while someone types: the key goes into the field", async ({
  page,
}) => {
  await openExample(page, "command", "palettes");
  const note = page.getByRole("textbox", { name: "Note" });
  await note.click();
  await page.keyboard.type("a/b");
  await expect(note).toHaveValue("a/b");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await note.blur();
  await page.keyboard.press("/");
  const goTo = page.getByRole("dialog", { name: "Go to" });
  await expect(goTo).toBeVisible();
  await expect(goTo.getByRole("combobox", { name: "Go to" })).toBeFocused();
});

test("no shortcut opens a palette over one already open", async ({ page }) => {
  await openExample(page, "command", "palettes");
  const keys = await page
    .getByRole("button", { name: "Actions" })
    .getAttribute("aria-keyshortcuts");
  await page.keyboard.press("/");
  const goTo = page.getByRole("dialog", { name: "Go to" });
  await expect(goTo).toBeVisible();
  await page.keyboard.press(keys ?? "");
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(goTo).toBeVisible();
});

test("two palettes on a page: each shortcut opens its own, and Escape gives focus back", async ({
  page,
}) => {
  await openExample(page, "command", "palettes");
  const button = page.getByRole("button", { name: "Actions" });
  const keys = await button.getAttribute("aria-keyshortcuts");
  expect(keys).toMatch(/^(?:Meta|Control)\+Shift\+P$/u);
  await button.focus();
  await page.keyboard.press(keys ?? "");
  const actions = page.getByRole("dialog", { name: "Actions" });
  await expect(actions).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(actions).toBeHidden();
  await expect(button).toBeFocused();
  await page.keyboard.press("/");
  await expect(page.getByRole("dialog", { name: "Go to" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(1);
});

test("a command that returns false keeps the palette open", async ({
  page,
}) => {
  await openExample(page, "command", "palettes");
  await page.getByRole("button", { name: "Actions" }).click();
  const dialog = page.getByRole("dialog", { name: "Actions" });
  await expect(dialog).toBeVisible();
  await page.keyboard.type("archived");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Showing archived")).toBeVisible();
  await expect(dialog).toBeVisible();
});

test("while a command runs, Escape does not close the palette; it closes once the command is done", async ({
  page,
}) => {
  await openExample(page, "command", "palettes");
  const button = page.getByRole("button", { name: "Actions" });
  await button.click();
  const dialog = page.getByRole("dialog", { name: "Actions" });
  await page.keyboard.type("sync");
  await page.keyboard.press("Enter");
  await expect(
    dialog.getByRole("option", { name: /Sync now/u })
  ).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(page.getByText("Ran sync")).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
});
