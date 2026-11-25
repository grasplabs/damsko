import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the label names the control and the description describes it; the mark is not in the name", async ({
  page,
}) => {
  await openExample(page, "field", "basic");
  const email = page.getByRole("textbox", { name: "Work email", exact: true });
  await expect(email).toHaveAccessibleDescription("We send the invite here.");
  await expect(email).toHaveAttribute("required", "");
  await page.getByText("Work email").click();
  await expect(email).toBeFocused();
});

test("invalid shows the error at once, said with the control", async ({
  page,
}) => {
  await openExample(page, "field", "invalid");
  const handle = page.getByRole("textbox", { name: "Team handle" });
  await expect(handle).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Another team has this handle already.")
  ).toBeVisible();
  await expect(handle).toHaveAccessibleDescription(
    /Another team has this handle already\./u
  );
});

test("disabled takes the control out of use", async ({ page }) => {
  await openExample(page, "field", "disabled");
  await expect(
    page.getByRole("textbox", { name: "Sign-in domain" })
  ).toBeDisabled();
});

test("on one row, the words name and describe the control, and a press on them works it", async ({
  page,
}) => {
  await openExample(page, "field", "horizontal");
  const digest = page.getByRole("checkbox", { name: "Weekly digest" });
  await expect(digest).toHaveAccessibleDescription(
    "A summary of the week, every Monday."
  );
  await expect(digest).toBeChecked();
  await page.getByText("Weekly digest").click();
  await expect(digest).not.toBeChecked();

  const share = page.getByRole("switch", { name: "Share with the team" });
  await expect(share).toHaveAccessibleDescription(
    "Everyone in Finance can open it."
  );
  await page.getByText("Share with the team").click();
  await expect(share).toBeChecked();
});

test("a setting's name labels its control and its help describes it, with no spread", async ({
  page,
}) => {
  await openExample(page, "field", "responsive");
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true })
  ).toHaveAccessibleDescription(/^Your company's name/u);
  await expect(
    page.getByRole("combobox", { name: "Time zone" })
  ).toHaveAccessibleDescription(/^For schedules/u);
  await expect(
    page.getByRole("textbox", { name: "Sign-in domains" })
  ).toHaveAttribute("readonly", "");
});

test("a setting's help wraps as it falls, as the original's setting row did", async ({
  page,
}) => {
  await openExample(page, "field", "responsive");
  await expect(page.getByText(/^For schedules/u)).toHaveCSS(
    "text-wrap-style",
    "auto"
  );
});

test("every setting's control stands on one end edge, one column wide", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openExample(page, "field", "responsive");
  const boxes = await Promise.all(
    [
      page.getByRole("textbox", { name: "Name", exact: true }),
      page.getByRole("combobox", { name: "Time zone" }),
      page.getByRole("textbox", { name: "Sign-in domains" }),
    ].map(async (control) => await control.boundingBox())
  );
  const [first, ...rest] = boxes;
  for (const box of rest) {
    expect(Math.abs((box?.x ?? 0) - (first?.x ?? 0))).toBeLessThanOrEqual(1);
    expect(
      Math.abs((box?.width ?? 0) - (first?.width ?? 0))
    ).toBeLessThanOrEqual(1);
  }
});

test("in a narrow card the control goes under its words, the row's width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openExample(page, "field", "narrow");
  const name = await page.getByText("Name", { exact: true }).boundingBox();
  const input = await page
    .getByRole("textbox", { name: "Name", exact: true })
    .boundingBox();
  expect(input?.y ?? 0).toBeGreaterThan((name?.y ?? 0) + (name?.height ?? 0));
  expect(Math.abs((input?.x ?? 0) - (name?.x ?? 0))).toBeLessThanOrEqual(1);
});

test("a failed save keeps the value and says so; Try again says saving, then saved", async ({
  page,
}) => {
  await openExample(page, "field", "status");
  const keep = page.getByRole("combobox", { name: "Keep conversations" });
  await expect(keep).toHaveText(/90 days/u);
  await expect(
    page.getByRole("status").filter({ hasText: "Could not save." })
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saving" })
  ).toHaveCount(1);
  await expect(
    page.getByRole("status").filter({ hasText: "Saved" })
  ).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Try again" })).toBeHidden();
  await expect(keep).toHaveText(/90 days/u);
});

test("a settings group on a page names its rows", async ({ page }) => {
  await openExample(page, "field", "legend");
  const summary = page.getByRole("switch", { name: "Weekly summary" });
  await expect(summary).toBeChecked();
  await expect(summary).toHaveAccessibleDescription(
    "An email every Monday with what changed."
  );
  await expect(page.getByText("Organization")).toBeVisible();
});

test("a FieldSet is a group named by its legend and described by its sentence", async ({
  page,
}) => {
  await openExample(page, "field", "set");
  const address = page.getByRole("group", { name: "Address" });
  await expect(address).toHaveAccessibleDescription(
    "Where we send the invoices."
  );
  await expect(
    address.getByRole("textbox", { name: "Street address" })
  ).toBeVisible();
});

test("two named sets in one card each name their rows", async ({ page }) => {
  await openExample(page, "field", "sets");
  await expect(
    page
      .getByRole("group", { name: "Organization" })
      .getByRole("textbox", { name: "Name" })
  ).toBeVisible();
  const notifications = page.getByRole("group", { name: "Notifications" });
  await expect(
    notifications.getByRole("switch", { name: "Weekly summary" })
  ).toBeChecked();
  await notifications.getByText("Mentions", { exact: true }).click();
  await expect(
    notifications.getByRole("switch", { name: "Mentions" })
  ).toBeChecked();
});

test("a horizontal Field inside another Field is a row of its own: its label names its switch and its name sends it", async ({
  page,
}) => {
  await openExample(page, "field", "nested");
  const toggle = page.getByRole("switch", { name: "Send on weekends" });
  await expect(toggle).toHaveAccessibleDescription("Saturday and Sunday too.");
  await page.getByText("Send on weekends", { exact: true }).click();
  await expect(toggle).toBeChecked();
  expect(
    await page
      .locator("form")
      .evaluate((form) =>
        form instanceof HTMLFormElement
          ? new FormData(form).get("weekends")
          : null
      )
  ).toBe("on");
});
