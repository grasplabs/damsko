import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** The options of the list that is open: UI SDK may keep one hidden while closed. */
const options = (page: Page) =>
  page.getByRole("listbox").filter({ visible: true }).getByRole("option");

test("an agent finds each combobox by its label, chooses by an item's words, and a value outside the list fails in words", async ({
  page,
}) => {
  await openExample(page, "combobox", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const run = await page.evaluate(async () => {
    interface Entry {
      component: string;
      label?: string;
      value?: unknown;
    }
    // SAFETY: the example calls pageAgent(), which puts the agent bridge on window.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see SAFETY
    const bridge = Reflect.get(window, "damskoAgent") as {
      snapshot: () => Entry[];
      act: (plan: {
        steps: unknown[];
      }) => Promise<{ ok: boolean; error?: { message: string } }>;
    };
    const boxes = () =>
      bridge.snapshot().filter((entry) => entry.component === "combobox");
    const before = boxes();
    const chose = await bridge.act({
      steps: [{ ref: "Country", action: "setValue", args: ["Germany"] }],
    });
    const refused = await bridge.act({
      steps: [{ ref: "Team", action: "setValue", args: ["Marketing"] }],
    });
    const form = document.querySelector("form");
    return {
      before,
      after: boxes(),
      chose: chose.ok,
      refused,
      sent: form === null ? null : new FormData(form).get("country"),
    };
  });
  expect(run.before.find((entry) => entry.label === "Country")?.value).toBe(
    "fr"
  );
  expect(run.chose).toBe(true);
  expect(run.sent).toBe("de");
  await expect(page.getByRole("combobox", { name: "Country" })).toHaveValue(
    "Germany"
  );
  expect(run.refused.ok).toBe(false);
  // UI SDK refuses a value outside the items before the combobox hears it, naming the choices.
  expect(run.refused.error?.message).toContain('No item "Marketing" in Team');
  expect(run.after.find((entry) => entry.label === "Team")?.value).toBeNull();
});

test("typing filters and marks the letters that matched, a group with no match hides, and Enter chooses and closes", async ({
  page,
}) => {
  await openExample(page, "combobox", "groups");
  const input = page.getByRole("combobox", { name: "Time zone" });
  const before = await page.evaluate(() => window.scrollY);
  await input.focus();
  await page.keyboard.press("ArrowDown");
  await expect(options(page).first()).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await input.fill("");
  await page.keyboard.type("lon");
  await expect(options(page)).toHaveText(["London"]);
  await expect(options(page).first().locator("mark")).toHaveText(/lon/iu);
  await expect(
    page.getByRole("listbox").filter({ visible: true }).getByRole("group")
  ).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("London");
  await expect(input).toBeFocused();
  await expect(options(page)).toHaveCount(0);
});

test("the arrows move through the list, one out of use cannot be chosen, and Escape closes and keeps the value", async ({
  page,
}) => {
  await openExample(page, "combobox", "groups");
  const input = page.getByRole("combobox", { name: "Time zone" });
  await expect(input).toHaveValue("Amsterdam");
  await input.focus();
  await page.keyboard.press("ArrowDown");
  const option = (name: string) => page.getByRole("option", { name });
  await expect(option("Amsterdam")).toHaveAttribute("data-highlighted", "");
  await page.keyboard.press("ArrowDown");
  await expect(option("Berlin")).toHaveAttribute("data-highlighted", "");
  await page.keyboard.press("ArrowUp");
  await expect(option("Amsterdam")).toHaveAttribute("data-highlighted", "");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(options(page)).toHaveCount(0);
  await expect(input).toHaveValue("Amsterdam");
  await expect(input).toBeFocused();

  await input.fill("mum");
  await expect(option("Mumbai")).toHaveAttribute("aria-disabled", "true");
  await expect(option("Mumbai")).not.toHaveAttribute("data-highlighted", "");
  await page.keyboard.press("Enter");
  await option("Mumbai").click({ force: true });
  await page.keyboard.press("Escape");
  await expect(input).not.toHaveValue("Mumbai");
});

test("nothing matching shows the empty line", async ({ page }) => {
  await openExample(page, "combobox", "groups");
  const input = page.getByRole("combobox", { name: "Time zone" });
  await input.focus();
  await input.fill("");
  await page.keyboard.type("zzz");
  await expect(page.getByText("No results", { exact: true })).toBeVisible();
});

test("a ComboboxEmpty gives the empty line its own words", async ({ page }) => {
  await openExample(page, "combobox", "field");
  const input = page.getByRole("combobox", { name: "Country" });
  await input.focus();
  await page.keyboard.type("zzz");
  await expect(
    page.getByText("No country has that name", { exact: true })
  ).toBeVisible();
});

test("other words for an item find it", async ({ page }) => {
  await openExample(page, "combobox", "field");
  await page.getByRole("combobox", { name: "Country" }).focus();
  await page.keyboard.type("Holland");
  await expect(options(page)).toHaveText(["Netherlands"]);
});

test("its sizes are Input's and Button's: 32, 36 and 44px", async ({
  page,
}) => {
  await openExample(page, "combobox", "sizes");
  const heights = await Promise.all(
    ["Reviewer", "Owner", "Assignee"].map(async (name) => {
      const box = await page.getByRole("combobox", { name }).boundingBox();
      return box?.height;
    })
  );
  expect(heights).toEqual([32, 36, 44]);
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("its words are 16px and its items in the open list are 44px tall", async ({
    page,
  }) => {
    await openExample(page, "combobox", "groups");
    const input = page.getByRole("combobox", { name: "Time zone" });
    expect(
      await input.evaluate((element) => getComputedStyle(element).fontSize)
    ).toBe("16px");
    await page.getByRole("button", { name: "Show the time zones" }).tap();
    await expect(options(page).first()).toBeVisible();
    const heights = await options(page).evaluateAll((all) =>
      all.map((option) => Math.round(option.getBoundingClientRect().height))
    );
    expect(heights.every((height) => height >= 44)).toBe(true);
  });
});

test.describe("with JavaScript off", () => {
  test.use({ javaScriptEnabled: false });

  test("a combobox with a value shows its words", async ({ page }) => {
    await page.goto(
      new URL("/examples/combobox/agent", process.env.BASE_URL).href
    );
    await expect(page.getByRole("combobox", { name: "Country" })).toHaveValue(
      "France"
    );
  });
});

/** What the form would send. */
const sent = async (page: Page): Promise<string[]> =>
  await page.evaluate(() => {
    const form = document.querySelector("form");
    return form === null ? [] : [...new FormData(form).values()].map(String);
  });

test("typing a description finds the item, Enter chooses it and closes the list, and focus stays in the field", async ({
  page,
}) => {
  await openExample(page, "combobox", "people");
  const field = page.getByRole("combobox");
  await expect(field).toHaveValue("Amara Okafor");
  await field.fill("");
  await field.pressSequentially("design");
  await expect(options(page)).toHaveCount(1);
  await expect(options(page).first()).toHaveAccessibleName("Lena Ruiz");
  await expect(options(page).first()).toHaveAccessibleDescription("Design");
  await page.keyboard.press("Enter");
  await expect(field).toHaveValue("Lena Ruiz");
  await expect(options(page)).toHaveCount(0);
  await expect(field).toBeFocused();
  expect(await sent(page)).toContain("lena");
});

test("an item with media is named by its words alone: the avatar beside them is decorative", async ({
  page,
}) => {
  await openExample(page, "combobox", "people");
  const field = page.getByRole("combobox");
  await field.focus();
  await page.keyboard.press("ArrowDown");
  await expect(options(page).first()).toBeVisible();
  await expect(options(page)).toHaveCount(5);
  await expect(options(page).getByRole("img")).toHaveCount(0);
  await expect(options(page).nth(1)).toHaveAccessibleName("Jonas Weber");
});

test("emptying the words clears the choice", async ({ page }) => {
  await openExample(page, "combobox", "people");
  const field = page.getByRole("combobox");
  await field.fill("Mei");
  await page.keyboard.press("Enter");
  await expect(field).toHaveValue("Mei Chen");
  expect(await sent(page)).toContain("mei");
  await field.fill("");
  await field.blur();
  await expect.poll(async () => await sent(page)).not.toContain("mei");
});

test("an item whose value holds a space is still described by its line", async ({
  page,
}) => {
  await openExample(page, "combobox", "people");
  await page.getByRole("combobox").focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    options(page).filter({ hasText: "Jonas Weber" })
  ).toHaveAccessibleDescription("Finance");
});

test("the chosen item's media stands in the field, steps aside while the words are a search, and gives way to the quiet icon when empty", async ({
  page,
}) => {
  await openExample(page, "combobox", "people");
  const field = page.getByRole("combobox");
  // The avatar is decorative, so it is found by the initials it draws.
  const avatar = page.getByText("AO", { exact: true });
  await expect(avatar).toBeVisible();
  const start = await field.evaluate(
    (input) => getComputedStyle(input).paddingInlineStart
  );
  await field.fill("des");
  await expect(options(page)).toHaveCount(1);
  await expect(avatar).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(field).toHaveValue("Amara Okafor");
  await expect(avatar).toBeVisible();
  await field.fill("");
  await field.blur();
  await expect(avatar).toHaveCount(0);
  // The quiet icon holds the avatar's place: the words start where they did.
  await expect(field).toHaveCSS("padding-inline-start", start);
});

test("without media of its own, the field shows the chosen item's, and words only while nothing is chosen", async ({
  page,
}) => {
  await openExample(page, "combobox", "media");
  const field = page.getByRole("combobox");
  const avatar = page.getByText("SP", { exact: true });
  const empty = await field.evaluate(
    (input) => getComputedStyle(input).paddingInlineStart
  );
  await field.fill("Sam");
  await page.keyboard.press("Enter");
  await expect(field).toHaveValue("Sam Patel");
  await expect(options(page)).toHaveCount(0);
  await expect(avatar).toBeVisible();
  await expect(field).not.toHaveCSS("padding-inline-start", empty);
  await field.fill("");
  await field.blur();
  await expect(avatar).toHaveCount(0);
  await expect(field).toHaveCSS("padding-inline-start", empty);
});

test("the chevron's button takes its own name when given one, and the catalogue's otherwise", async ({
  page,
}) => {
  await openExample(page, "combobox", "groups");
  await expect(
    page.getByRole("button", { name: "Show the time zones" })
  ).toBeVisible();
  await openExample(page, "combobox", "field");
  await expect(
    page.getByRole("button", { name: "Show the choices" })
  ).toBeVisible();
});

test.describe("with several values", () => {
  test("each is a chip with its face and its words, in a 36px field with the system's corner and no chevron, the typing 28px, as the original's picker", async ({
    page,
  }) => {
    await openExample(page, "combobox", "multiple");
    const field = page.getByRole("combobox", { name: "Invite" });
    const box = page.locator("[data-slot=combobox-chips]");
    await expect(box.getByRole("button")).toHaveCount(2);
    await expect(
      box.getByRole("button", { name: "Show the choices" })
    ).toHaveCount(0);
    const look = await box.evaluate((node) => {
      const chip = node.querySelector("[data-slot=combobox-chip]");
      const face = chip?.querySelector("[data-slot=avatar]");
      const style = getComputedStyle(node);
      return {
        radius: style.borderTopLeftRadius,
        padding: style.paddingInlineStart,
        chip: chip?.getBoundingClientRect().height,
        chipRadius: chip ? getComputedStyle(chip).borderTopLeftRadius : "",
        face: face?.getBoundingClientRect().width,
      };
    });
    expect(look).toStrictEqual({
      radius: "20px",
      padding: "4px",
      chip: 28,
      chipRadius: "999px",
      face: 16,
    });
    const typing = await field.boundingBox();
    expect(typing?.height).toBe(28);
    // With nothing chosen, the field is one line, 36px, and says what to do.
    await box.getByRole("button", { name: "Remove Amara Okafor" }).click();
    await box.getByRole("button", { name: "Remove Design team" }).click();
    await expect(field).toHaveAttribute("placeholder", "Add people or teams");
    const empty = await box.boundingBox();
    expect(empty?.height).toBe(36);
  });

  test("choosing from the list adds a chip and keeps the list open, and Backspace in the empty field takes the last away", async ({
    page,
  }) => {
    await openExample(page, "combobox", "multiple");
    const field = page.getByRole("combobox", { name: "Invite" });
    const box = page.locator("[data-slot=combobox-chips]");
    await field.click();
    await field.fill("Lena");
    await options(page).filter({ hasText: "Lena Ruiz" }).click();
    await expect(box.getByRole("group", { name: "Lena Ruiz" })).toBeVisible();
    await expect(field).toHaveValue("");
    await expect(field).not.toHaveAttribute("placeholder");
    await field.press("Backspace");
    await field.press("Backspace");
    await expect(box.getByRole("group", { name: "Lena Ruiz" })).toHaveCount(0);
    await expect(
      box.getByRole("group", { name: "Amara Okafor" })
    ).toBeVisible();
  });

  test("the list hangs under the whole field, as wide as it", async ({
    page,
  }) => {
    await openExample(page, "combobox", "multiple");
    const field = page.getByRole("combobox", { name: "Invite" });
    await field.click();
    await field.press("ArrowDown");
    const list = page.getByRole("listbox").filter({ visible: true });
    await expect(list).toBeVisible();
    const [boxRect, listRect] = await Promise.all([
      page.locator("[data-slot=combobox-chips]").boundingBox(),
      page.locator("[data-slot=combobox-content]").boundingBox(),
    ]);
    expect(Math.round(listRect?.width ?? 0)).toBeGreaterThanOrEqual(
      Math.round(boxRect?.width ?? 1)
    );
    expect(Math.round(listRect?.x ?? 0)).toBe(Math.round(boxRect?.x ?? 1));
  });

  test("in a form each value is sent under its name", async ({ page }) => {
    await openExample(page, "combobox", "multiple");
    const values = await page.locator("form").evaluate((form) => {
      if (!(form instanceof HTMLFormElement)) {
        return [];
      }
      return new FormData(form).getAll("people");
    });
    expect(values).toStrictEqual(["amara", "design-team"]);
  });
});
