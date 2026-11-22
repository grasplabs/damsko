import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("its label names the group, and each row's label names its radio", async ({
  page,
}) => {
  await openExample(page, "radio-group", "basic");
  const group = page.getByRole("radiogroup", { name: "Summary email" });
  await expect(group.getByRole("radio")).toHaveCount(3);
  await expect(group.getByRole("radio", { name: "Weekly" })).toBeChecked();
  await expect(group.getByRole("radio", { name: "Daily" })).not.toBeChecked();
});

test("a press on a label, or on a row's empty space, chooses that radio", async ({
  page,
}) => {
  await openExample(page, "radio-group", "basic");
  const group = page.getByRole("radiogroup", { name: "Summary email" });
  await group.getByText("Daily", { exact: true }).click();
  await expect(group.getByRole("radio", { name: "Daily" })).toBeChecked();
  await expect(group.getByRole("radio", { name: "Weekly" })).not.toBeChecked();

  const never = await group.getByText("Never", { exact: true }).boundingBox();
  if (never === null) {
    throw new Error("the label has no box");
  }
  await page.mouse.click(never.x + never.width - 2, never.y - 6);
  await expect(group.getByRole("radio", { name: "Never" })).toBeChecked();
});

test("a row's description describes its radio", async ({ page }) => {
  await openExample(page, "radio-group", "description");
  const group = page.getByRole("radiogroup", {
    name: "Who can see this report",
  });
  await expect(
    group.getByRole("radio", { name: "Anyone with the link" })
  ).toHaveAccessibleDescription(
    "No sign-in needed; the link can be passed on."
  );
});

test("Tab lands on the chosen radio; arrows move and choose, past a disabled one; Tab leaves", async ({
  page,
}) => {
  await openExample(page, "radio-group", "agent");
  const group = page.getByRole("radiogroup", { name: "Summary email" });
  const weekly = group.getByRole("radio", { name: "Weekly" });
  const daily = group.getByRole("radio", { name: "Daily" });
  await page.keyboard.press("Tab");
  await expect(weekly).toBeFocused();
  expect(await hasFocusRing(weekly)).toBe(true);
  await page.keyboard.press("ArrowUp");
  await expect(daily).toBeFocused();
  await expect(daily).toBeChecked();
  await page.keyboard.press("ArrowDown");
  await expect(weekly).toBeChecked();
  // Never is disabled: the arrow passes it, round to the first.
  await page.keyboard.press("ArrowDown");
  await expect(daily).toBeFocused();
  await expect(daily).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(
    page
      .getByRole("radiogroup", { name: "File type" })
      .getByRole("radio", { name: "CSV" })
  ).toBeFocused();
});

test("right to left, the arrows run the other way", async ({ page }) => {
  await openExample(page, "radio-group", "basic");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const group = page.getByRole("radiogroup", { name: "Summary email" });
  await page.keyboard.press("Tab");
  await expect(group.getByRole("radio", { name: "Weekly" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(group.getByRole("radio", { name: "Never" })).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("radio", { name: "Weekly" })).toBeChecked();
});

test("a disabled group takes none of its radios", async ({ page }) => {
  await openExample(page, "radio-group", "disabled");
  const group = page.getByRole("radiogroup", {
    name: "Where exports are kept",
  });
  for (const radio of await group.getByRole("radio").all()) {
    // oxlint-disable-next-line no-await-in-loop -- one radio after the other
    await expect(radio).toBeDisabled();
  }
  await expect(
    group.getByRole("radio", { name: "In the European Union" })
  ).toBeChecked();
});

test("while the Field is wrong the group says so and why; a choice puts it right", async ({
  page,
}) => {
  await openExample(page, "radio-group", "invalid");
  const group = page.getByRole("radiogroup", { name: "File type" });
  await expect(group).toHaveAttribute("aria-invalid", "true");
  await expect(group).toHaveAccessibleDescription(
    "Choose a file type to start the export."
  );
  await group.getByText("Excel", { exact: true }).click();
  await expect(group).not.toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Choose a file type to start the export.")
  ).toBeHidden();
});

test("required: a submit with nothing chosen shows the group's error; a choice clears it and is sent", async ({
  page,
}) => {
  await openExample(page, "radio-group", "agent");
  const group = page.getByRole("radiogroup", { name: "File type" });
  // The fixture's one form, which holds the File type group.
  const form = page.locator("form");
  await form.evaluate((element) => {
    if (element instanceof HTMLFormElement) {
      element.requestSubmit();
    }
  });
  await expect(page.getByText("Choose a file type.")).toBeVisible();
  await group.getByText("Excel", { exact: true }).click();
  await expect(page.getByText("Choose a file type.")).toBeHidden();
  for (const radio of await group.getByRole("radio").all()) {
    // oxlint-disable-next-line no-await-in-loop -- one radio after the other
    await expect(radio).not.toHaveAttribute("aria-invalid", "true");
  }
  expect(
    await form.evaluate((element) =>
      element instanceof HTMLFormElement
        ? new FormData(element).get("format")
        : null
    )
  ).toBe("xlsx");
});

// The agent fixture: the page's one bridge (window.damskoAgent, site/behaviour/agent.ts) lists the
// group by its name, with its value and its choices, and chooses by name.
const setValue = async (page: Page, ref: string, value: string) =>
  await page.evaluate(
    async ({ name, chosen }) => {
      const result = await window.damskoAgent?.act({
        steps: [{ ref: name, action: "setValue", args: [chosen] }],
      });
      return result?.ok === true;
    },
    { name: ref, chosen: value }
  );

test("an agent finds the group by its name, reads its choices and chooses by name", async ({
  page,
}) => {
  await openExample(page, "radio-group", "agent");
  const entry = await page.evaluate(() => {
    const found = window.damskoAgent
      ?.snapshot()
      .find((each) => each.label === "Summary email");
    return {
      value: found?.value,
      items: (found?.items ?? []).map((item) => item.label),
    };
  });
  expect(entry.value).toBe("weekly");
  expect(entry.items).toStrictEqual(
    expect.arrayContaining(["Daily", "Weekly"])
  );
  expect(await setValue(page, "Summary email", "daily")).toBe(true);
  await expect(page.getByRole("radio", { name: "Daily" })).toBeChecked();
  // A value that is not one of its choices is refused.
  expect(await setValue(page, "Summary email", "monthly")).toBe(false);
  await expect(page.getByRole("radio", { name: "Daily" })).toBeChecked();
});
