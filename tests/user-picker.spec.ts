import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** The people in the list that is open: UI SDK may keep one hidden while closed. */
const options = (page: Page) =>
  page.getByRole("listbox").filter({ visible: true }).getByRole("option");

/** What the form would send. */
const sent = async (page: Page): Promise<string[]> =>
  await page.evaluate(() => {
    const form = document.querySelector("form");
    return form === null ? [] : [...new FormData(form).values()].map(String);
  });

test("an agent chooses a person by name, the form sends their id, and someone not in the list is refused in words", async ({
  page,
}) => {
  await openExample(page, "user-picker", "agent");
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
    const picker = () =>
      bridge.snapshot().find((entry) => entry.component === "combobox");
    const ref = picker()?.label ?? "";
    const chose = await bridge.act({
      steps: [{ ref, action: "setValue", args: ["Lena Ruiz"] }],
    });
    const refused = await bridge.act({
      steps: [{ ref, action: "setValue", args: ["Nobody Here"] }],
    });
    const form = document.querySelector("form");
    return {
      chose: chose.ok,
      refused,
      sent: form === null ? [] : [...new FormData(form).values()].map(String),
      after: picker()?.value,
    };
  });
  expect(run.chose).toBe(true);
  expect(run.sent).toContain("lena");
  await expect(page.getByRole("combobox")).toHaveValue("Lena Ruiz");
  expect(run.refused.ok).toBe(false);
  expect(run.refused.error?.message).toContain("Nobody Here");
  expect(run.after).toBe("lena");
});

test("typing a role finds the person, Enter chooses them and closes the list, and focus stays in the field", async ({
  page,
}) => {
  await openExample(page, "user-picker", "basic");
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
});

test("each person is named by their name alone: the avatar beside it is decorative", async ({
  page,
}) => {
  await openExample(page, "user-picker", "basic");
  const field = page.getByRole("combobox");
  await field.focus();
  await page.keyboard.press("ArrowDown");
  await expect(options(page).first()).toBeVisible();
  await expect(options(page)).toHaveCount(5);
  await expect(options(page).getByRole("img")).toHaveCount(0);
  await expect(options(page).nth(1)).toHaveAccessibleName("Jonas Weber");
});

test("Escape closes the list without a change", async ({ page }) => {
  await openExample(page, "user-picker", "basic");
  const field = page.getByRole("combobox");
  await field.focus();
  await page.keyboard.press("ArrowDown");
  await expect(options(page).first()).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(options(page)).toHaveCount(0);
  await expect(field).toHaveValue("Amara Okafor");
  await expect(field).toBeFocused();
});

test("emptying the words clears the choice", async ({ page }) => {
  await openExample(page, "user-picker", "agent");
  const field = page.getByRole("combobox");
  await field.fill("Mei");
  await page.keyboard.press("Enter");
  await expect(field).toHaveValue("Mei Chen");
  expect(await sent(page)).toContain("mei");
  await field.fill("");
  await field.blur();
  await expect.poll(async () => await sent(page)).not.toContain("mei");
});

test("a person whose id holds a space is still described by their line", async ({
  page,
}) => {
  await openExample(page, "user-picker", "basic");
  await page.getByRole("combobox").focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    options(page).filter({ hasText: "Jonas Weber" })
  ).toHaveAccessibleDescription("Finance");
});
