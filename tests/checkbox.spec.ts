import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

/** A press on the row's empty space: above the end of its label, in the room round the words. */
const pressRowBeside = async (page: Page, label: Locator) => {
  const words = await label.boundingBox();
  if (words === null) {
    throw new Error("the label has no box");
  }
  await page.mouse.click(words.x + words.width - 2, words.y - 6);
};

test("its label names it, and a click on the label toggles it", async ({
  page,
}) => {
  await openExample(page, "checkbox", "label");
  const box = page.getByRole("checkbox", { name: "Send me a weekly summary" });
  await expect(box).toBeChecked();
  await page.getByText("Send me a weekly summary", { exact: true }).click();
  await expect(box).not.toBeChecked();
  await box.click();
  await expect(box).toBeChecked();
});

test("a press on its row's empty space toggles it", async ({ page }) => {
  await openExample(page, "checkbox", "label");
  const box = page.getByRole("checkbox", { name: "Send me a weekly summary" });
  await pressRowBeside(
    page,
    page.getByText("Send me a weekly summary", { exact: true })
  );
  await expect(box).not.toBeChecked();
});

test("its description describes it", async ({ page }) => {
  await openExample(page, "checkbox", "description");
  await expect(
    page.getByRole("checkbox", { name: "Send me a weekly summary" })
  ).toHaveAccessibleDescription(
    "Every Monday morning, the week's changes in one email."
  );
});

test("Space toggles it from the keyboard, with the ring; Enter does not", async ({
  page,
}) => {
  await openExample(page, "checkbox", "label");
  const box = page.getByRole("checkbox", { name: "Send me a weekly summary" });
  await page.keyboard.press("Tab");
  await expect(box).toBeFocused();
  expect(await hasFocusRing(box)).toBe(true);
  await page.keyboard.press("Space");
  await expect(box).not.toBeChecked();
  await page.keyboard.press("Space");
  await expect(box).toBeChecked();
  await page.keyboard.press("Enter");
  await expect(box).toBeChecked();
});

test("a disabled checkbox keeps its value", async ({ page }) => {
  await openExample(page, "checkbox", "disabled");
  const box = page.getByRole("checkbox", {
    name: "Keep a copy of every export",
  });
  await expect(box).toBeDisabled();
  await page
    .getByText("Keep a copy of every export", { exact: true })
    .click({ force: true });
  await expect(box).toBeChecked();
});

test("while it is wrong it says so and says why; checking it puts it right", async ({
  page,
}) => {
  await openExample(page, "checkbox", "invalid");
  const box = page.getByRole("checkbox", {
    name: "I accept the data processing terms",
  });
  await expect(box).toHaveAttribute("aria-invalid", "true");
  await expect(box).toHaveAccessibleDescription(
    "Accept the terms to start the export."
  );
  await expect(box).toHaveAttribute("aria-required", "true");
  await box.click();
  await expect(box).toBeChecked();
  await expect(box).not.toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Accept the terms to start the export.")
  ).toBeHidden();
});

test("a parent shows its children's mix and sets them all", async ({
  page,
}) => {
  await openExample(page, "checkbox", "group");
  const group = page.getByRole("group", { name: "Notifications" });
  const all = group.getByRole("checkbox", { name: "Select all" });
  const children = ["Email", "Text message", "In the app"].map((name) =>
    group.getByRole("checkbox", { name })
  );
  await expect(all).toBeChecked({ indeterminate: true });
  await expect(group.getByRole("checkbox", { name: "Email" })).toBeChecked();
  await expect(
    group.getByRole("checkbox", { name: "Text message" })
  ).not.toBeChecked();

  await all.click();
  await expect(all).toBeChecked();
  await Promise.all(
    children.map(async (child) => {
      await expect(child).toBeChecked();
    })
  );

  await all.click();
  await Promise.all(
    children.map(async (child) => {
      await expect(child).not.toBeChecked();
    })
  );

  await group.getByRole("checkbox", { name: "Email" }).click();
  await expect(all).toBeChecked({ indeterminate: true });
});

test("in a group, a press on a row's label or its empty space checks that box", async ({
  page,
}) => {
  await openExample(page, "checkbox", "group");
  const group = page.getByRole("group", { name: "Notifications" });
  await group.getByText("Text message", { exact: true }).click();
  await expect(
    group.getByRole("checkbox", { name: "Text message" })
  ).toBeChecked();
  await pressRowBeside(page, group.getByText("In the app", { exact: true }));
  await expect(
    group.getByRole("checkbox", { name: "In the app" })
  ).toBeChecked();
});

// The agent fixture: the page's one bridge (window.damskoAgent, site/behaviour/agent.ts) lists every
// checkbox and the group by its label, with its state, and checks and empties them by name.
const setChecked = async (page: Page, ref: string, value: boolean) =>
  await page.evaluate(
    async ({ name, checked }) => {
      const result = await window.damskoAgent?.act({
        steps: [{ ref: name, action: "setChecked", args: [checked] }],
      });
      return result?.ok === true;
    },
    { name: ref, checked: value }
  );

const entryOf = async (page: Page, label: string) =>
  await page.evaluate((name) => {
    const entry = window.damskoAgent
      ?.snapshot()
      .find((each) => each.label === name);
    return entry === undefined
      ? undefined
      : { checked: entry.checked, value: entry.value };
  }, label);

test("an agent finds every checkbox by its label and checks it by name; a parent follows", async ({
  page,
}) => {
  await openExample(page, "checkbox", "agent");
  const all = await entryOf(page, "Select all");
  const email = await entryOf(page, "Email");
  const before = await entryOf(page, "Notifications");
  expect(all?.checked).toBe("indeterminate");
  expect(email?.checked).toBe(true);
  expect(before?.value).toStrictEqual(["email"]);

  expect(await setChecked(page, "Send me a weekly summary", true)).toBe(true);
  await expect(
    page.getByRole("checkbox", { name: "Send me a weekly summary" })
  ).toBeChecked();

  expect(await setChecked(page, "Text message", true)).toBe(true);
  await expect(
    page.getByRole("checkbox", { name: "Select all" })
  ).toBeChecked();

  expect(await setChecked(page, "Select all", false)).toBe(true);
  await expect(page.getByRole("checkbox", { name: "Email" })).not.toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Text message" })
  ).not.toBeChecked();
  const after = await entryOf(page, "Notifications");
  expect(after?.value).toStrictEqual([]);
});

test("a form sends a checked box's value, and a group's checked values under its name", async ({
  page,
}) => {
  await openExample(page, "checkbox", "agent");
  const sent = async () =>
    // The fixture's one form.
    await page.locator("form").evaluate((form) => {
      if (!(form instanceof HTMLFormElement)) {
        return {};
      }
      const data = new FormData(form);
      return {
        summary: data.getAll("summary"),
        notifications: data.getAll("notifications"),
      };
    });
  expect(await sent()).toStrictEqual({
    summary: [],
    notifications: ["email"],
  });
  await page.getByText("Send me a weekly summary", { exact: true }).click();
  await page.getByText("Text message", { exact: true }).click();
  expect(await sent()).toStrictEqual({
    summary: ["weekly"],
    notifications: ["email", "sms"],
  });
});

test("a required group: a submit with none checked shows the group's error; a check clears it and is sent", async ({
  page,
}) => {
  await openExample(page, "checkbox", "group-validity");
  const form = page.locator("form");
  await form.evaluate((element) => {
    if (element instanceof HTMLFormElement) {
      element.requestSubmit();
    }
  });
  const error = page.getByText("Choose at least one way to send it.");
  await expect(error).toBeVisible();
  await page.getByText("Email", { exact: true }).click();
  await expect(error).toBeHidden();
  await expect(page.getByRole("checkbox", { name: "Email" })).toBeChecked();
  expect(
    await form.evaluate((element) =>
      element instanceof HTMLFormElement
        ? new FormData(element).getAll("channels")
        : []
    )
  ).toStrictEqual(["email"]);
});

test("a group whose Field is wrong says why, each box named by its own row; a check puts it right", async ({
  page,
}) => {
  await openExample(page, "checkbox", "group-validity");
  const error = page.getByText("Choose a region to store it in.");
  await expect(error).toBeVisible();
  const europe = page.getByRole("checkbox", { name: "Europe" });
  await expect(europe).toBeVisible();
  await page.getByText("Europe", { exact: true }).click();
  await expect(europe).toBeChecked();
  await expect(error).toBeHidden();
});
