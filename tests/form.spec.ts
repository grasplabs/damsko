import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("sent with a required field empty, it says what is wrong under the field, in its own words", async ({
  page,
}) => {
  await openExample(page, "form", "basic");
  const form = page.getByRole("form", { name: "Profile" });
  const email = form.getByRole("textbox", { name: "Work email" });
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
  await expect(form.getByText("Enter your work email.")).toBeHidden();

  // The browser opens its own bubble only when nothing cancels the invalid event: read once every
  // listener has run, and written on the page's root for the test to read.
  await page.evaluate(() => {
    document.addEventListener(
      "invalid",
      (event) => {
        setTimeout(() => {
          document.documentElement.dataset.bubble = String(
            !event.defaultPrevented
          );
        }, 0);
      },
      { capture: true, once: true }
    );
  });
  await form.getByRole("button", { name: "Save profile" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-bubble", "false");
  await expect(form.getByText("Enter your work email.")).toBeVisible();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toBeFocused();
});

test("errors wait for a submit, and the field says its own", async ({
  page,
}) => {
  await openExample(page, "form", "errors-on-submit");
  const form = page.getByRole("form", { name: "Invite" });
  const email = form.getByRole("textbox", { name: "Work email" });
  await expect(
    form.getByText("Enter the email of the person to invite.")
  ).toBeHidden();
  await form.getByRole("button", { name: "Send invite" }).click();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription(
    "Enter the email of the person to invite."
  );
});

test("a section is a group named by its title and described by its sentence", async ({
  page,
}) => {
  await openExample(page, "form", "groups");
  const form = page.getByRole("form", { name: "Workspace settings" });
  const workspace = form.getByRole("group", { name: "Workspace" });
  await expect(workspace).toHaveAccessibleDescription(
    "Everyone in the workspace sees these."
  );
  await expect(workspace.getByRole("textbox", { name: "Name" })).toHaveValue(
    "Northwind Studio"
  );
  const address = form.getByRole("group", { name: "Address" });
  await expect(address.getByRole("textbox", { name: "City" })).toHaveValue(
    "Bristol"
  );
});

test("a reset button puts every field back", async ({ page }) => {
  await openExample(page, "form", "basic");
  const form = page.getByRole("form", { name: "Profile" });
  const first = form.getByRole("textbox", { name: "First name" });
  await first.fill("Sam");
  await form.getByRole("button", { name: "Cancel" }).click();
  await expect(first).toHaveValue("Alex");
});
