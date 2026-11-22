import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** The list that is open: UI SDK keeps a hidden one in the page while closed. */
const openList = (page: Page) =>
  page.getByRole("listbox").filter({ visible: true });

test("an agent finds each select by its label, reads and chooses by an item's words, and is refused a value outside the list", async ({
  page,
}) => {
  await openExample(page, "select", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const run = await page.evaluate(async () => {
    interface Entry {
      component: string;
      label?: string;
      value?: unknown;
      items?: { value: string; label: string }[];
    }
    // SAFETY: the example calls pageAgent(), which puts the agent bridge on window.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see SAFETY
    const bridge = Reflect.get(window, "damskoAgent") as {
      snapshot: () => Entry[];
      act: (plan: { steps: unknown[] }) => Promise<{ ok: boolean }>;
    };
    const selects = () =>
      bridge.snapshot().filter((entry) => entry.component === "select");
    const before = selects();
    const chose = await bridge.act({
      steps: [{ ref: "Role", action: "setValue", args: ["Editor"] }],
    });
    const refused = await bridge.act({
      steps: [{ ref: "Team", action: "setValue", args: ["Marketing"] }],
    });
    const form = document.querySelector("form");
    return {
      before,
      after: selects(),
      chose: chose.ok,
      refused: refused.ok,
      sent: form === null ? null : new FormData(form).get("role"),
    };
  });
  const role = run.before.find((entry) => entry.label === "Role");
  expect(role?.value).toBe("viewer");
  expect(role?.items?.map((item) => item.label)).toEqual([
    "Viewer",
    "Editor",
    "Admin",
  ]);
  expect(run.before.some((entry) => entry.label === "Team")).toBe(true);
  expect(run.chose).toBe(true);
  expect(run.sent).toBe("editor");
  expect(run.after.find((entry) => entry.label === "Role")?.value).toBe(
    "editor"
  );
  await expect(page.getByRole("combobox", { name: "Role" })).toHaveText(
    "Editor"
  );
  expect(run.refused).toBe(false);
});

test("ArrowDown opens the list on the chosen item; ArrowDown and Enter choose the next and give focus back", async ({
  page,
}) => {
  await openExample(page, "select", "groups");
  const control = page.getByRole("combobox", { name: "Time zone" });
  await control.focus();
  await page.keyboard.press("ArrowDown");
  await expect(openList(page)).toBeVisible();
  await expect(page.getByRole("option", { name: "Amsterdam" })).toHaveAttribute(
    "data-highlighted",
    ""
  );
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(openList(page)).toBeHidden();
  await expect(control).toHaveText("London");
  await expect(control).toBeFocused();
});

test("Escape closes the list and keeps the value; a letter on the closed control chooses the next item with it", async ({
  page,
}) => {
  await openExample(page, "select", "groups");
  const control = page.getByRole("combobox", { name: "Time zone" });
  await control.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(openList(page)).toBeHidden();
  await expect(control).toHaveText("Amsterdam");
  await expect(control).toBeFocused();
  await page.keyboard.type("n");
  await expect(control).toHaveText("New York");
});

test("Home and End jump to the ends of the list, and an item out of use is skipped", async ({
  page,
}) => {
  await openExample(page, "select", "groups");
  const control = page.getByRole("combobox", { name: "Time zone" });
  await control.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  const utc = page.getByRole("option", { name: /Coordinated Universal Time/u });
  await expect(utc).toHaveAttribute("data-highlighted", "");
  await expect(
    page.getByRole("option", { name: "Each person's own time zone" })
  ).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Home");
  await expect(page.getByRole("option", { name: "Amsterdam" })).toHaveAttribute(
    "data-highlighted",
    ""
  );
});

test("hand-written items, groups and a separator open, choose, show their words and skip the one out of use", async ({
  page,
}) => {
  await openExample(page, "select", "parts");
  const control = page.getByRole("combobox", { name: "Data region" });
  await expect(control).toHaveText("Choose a region");
  await control.click();
  const list = openList(page);
  await expect(list.getByRole("group")).toHaveCount(2);
  await expect(list.getByRole("option")).toHaveCount(5);
  await page.getByRole("option", { name: "Frankfurt" }).click();
  await expect(list).toBeHidden();
  await expect(control).toHaveText("Frankfurt");
  await control.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Frankfurt" })).toHaveAttribute(
    "data-highlighted",
    ""
  );
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  // From Virginia, the next one down skips São Paulo, out of use.
  await expect(control).toHaveText("The nearest to each person");
});

test("its sizes are Input's and Button's: 32, 36 and 44px", async ({
  page,
}) => {
  await openExample(page, "select", "sizes");
  const heights = await Promise.all(
    ["Sort rows by", "Sort projects by", "Sort people by"].map(async (name) => {
      const box = await page.getByRole("combobox", { name }).boundingBox();
      return box?.height;
    })
  );
  expect(heights).toEqual([32, 36, 44]);
});

test("a read-only select shows its value and does not open", async ({
  page,
}) => {
  await openExample(page, "select", "invalid");
  const control = page.getByRole("combobox", { name: "Created by team" });
  await expect(control).toHaveText("Operations");
  await control.click();
  await control.focus();
  await page.keyboard.press("ArrowDown");
  await expect(openList(page)).toBeHidden();
});

test("as words, it opens and chooses with the same keys", async ({ page }) => {
  await openExample(page, "select", "text");
  const control = page.getByRole("combobox", {
    name: "Access for Daan de Vries",
  });
  await expect(control).toHaveText("Can edit");
  const box = await control.boundingBox();
  expect(box?.height).toBe(32);
  await control.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(control).toHaveText("Remove");
  await expect(control).toBeFocused();
});

test("without truncate a long value wraps; with it, it stays on one line", async ({
  page,
}) => {
  await openExample(page, "select", "truncate");
  const height = async (name: string) => {
    const box = await page.getByRole("combobox", { name }).boundingBox();
    return box?.height ?? 0;
  };
  expect(await height("Report, on one line")).toBe(32);
  expect(await height("Report, wrapping")).toBeGreaterThan(32);
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("its words are a field's 16px and its items in the open list are 44px tall", async ({
    page,
  }) => {
    await openExample(page, "select", "groups");
    const control = page.getByRole("combobox", { name: "Time zone" });
    expect(
      await control.evaluate((element) => getComputedStyle(element).fontSize)
    ).toBe("16px");
    await control.tap();
    const options = openList(page).getByRole("option");
    await expect(options.first()).toBeVisible();
    const heights = await options.evaluateAll((all) =>
      all.map((option) => Math.round(option.getBoundingClientRect().height))
    );
    expect(heights.every((height) => height >= 44)).toBe(true);
  });
});

test.describe("with JavaScript off", () => {
  test.use({ javaScriptEnabled: false });

  test("a select shows its value's words, or its placeholder", async ({
    page,
  }) => {
    await page.goto(
      new URL("/examples/select/agent", process.env.BASE_URL).href
    );
    await expect(page.getByText("Viewer", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Choose a team", { exact: true })
    ).toBeVisible();
  });
});
