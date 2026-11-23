import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("it is a complementary landmark named by its label, headed by the record's title", async ({
  page,
}) => {
  await openExample(page, "inspector-01", "basic");
  const panel = page.getByRole("complementary", { name: "Agent details" });
  await expect(panel).toBeVisible();
  await expect(
    panel.getByRole("heading", { level: 2, name: "Monday briefing" })
  ).toBeVisible();
});

test("a section's rows are a list named by its title; a locked row says why", async ({
  page,
}) => {
  await openExample(page, "inspector-01", "basic");
  const inputs = page.getByRole("list", { name: "Inputs" });
  await expect(inputs.getByRole("listitem")).toHaveCount(3);
  await expect(
    inputs.getByRole("img", { name: "Cannot be changed" })
  ).toBeVisible();
});

test("a locked row has no bin, though it was given one", async ({ page }) => {
  await openExample(page, "inspector-01", "basic");
  const tools = page.getByRole("region", { name: "Tools" });
  await expect(
    tools.getByRole("img", { name: "Cannot be removed" })
  ).toBeVisible();
  await expect(
    tools.getByRole("button", { name: "Remove Team records" })
  ).toHaveCount(0);
});

test("Add brings a row, and its bin, named for the row, takes it away", async ({
  page,
}) => {
  await openExample(page, "inspector-01", "basic");
  const tools = page.getByRole("region", { name: "Tools" });
  const rows = tools.getByRole("list", { name: "Tools" }).getByRole("listitem");
  await expect(rows).toHaveCount(1);
  await tools.getByRole("button", { name: "Add" }).click();
  await expect(rows).toHaveCount(2);
  await expect(rows.last()).toContainText("Send email");
  await tools.getByRole("button", { name: "Remove Send email" }).click();
  await expect(rows).toHaveCount(1);
});

test("an empty section is one button, its words what it adds", async ({
  page,
}) => {
  await openExample(page, "inspector-01", "basic");
  await expect(
    page
      .getByRole("region", { name: "Context" })
      .getByRole("button", { name: "Add context" })
  ).toBeVisible();
});

test("the views are tabs: the arrow keys move between them, each showing its own sections", async ({
  page,
}) => {
  await openExample(page, "inspector-01", "views");
  const panel = page.getByRole("complementary", { name: "Report details" });
  const details = panel.getByRole("tab", { name: "Details" });
  const activity = panel.getByRole("tab", { name: "Activity" });
  await expect(details).toHaveAttribute("aria-selected", "true");
  await expect(panel.getByRole("list", { name: "People" })).toBeVisible();
  await details.focus();
  await page.keyboard.press("ArrowRight");
  await expect(activity).toBeFocused();
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await expect(panel.getByRole("list", { name: "Recent" })).toBeVisible();
  await expect(panel.getByRole("list", { name: "People" })).toBeHidden();
});

test("facts are a list of terms and their values; a missing value is said Not set", async ({
  page,
}) => {
  await openExample(page, "inspector-01", "facts");
  const panel = page.getByRole("complementary", { name: "Company details" });
  await expect(panel.getByRole("term")).toHaveCount(6);
  await expect(panel.getByRole("definition")).toHaveCount(6);
  await expect(panel.getByRole("term").first()).toHaveText("Owner");
  await expect(panel.getByRole("definition").last()).toHaveText(/Not set/u);
});

test("with no sections it says what will stand there", async ({ page }) => {
  await openExample(page, "inspector-01", "empty");
  const panel = page.getByRole("complementary", { name: "Document details" });
  await expect(
    panel.getByRole("heading", { name: "Fee schedule 2027" })
  ).toBeVisible();
  await expect(
    panel.getByText("Nothing has been read from it yet.", { exact: false })
  ).toBeVisible();
});

test("at a phone's width a date stays whole on one line, and a long name gives way to it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "inspector-01", "basic");
  const triggers = page.getByRole("list", { name: "Triggers" });
  const whole = async (date: string): Promise<boolean> => {
    const detail = triggers.getByText(date, { exact: true });
    await expect(detail).toBeVisible();
    return await detail.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const lines = new Set(
        [...range.getClientRects()].map((rect) => Math.round(rect.top))
      );
      return lines.size === 1 && element.scrollWidth <= element.clientWidth;
    });
  };
  expect(
    await Promise.all(
      ["Nov 23, 2026, 10:13 AM", "Nov 16, 2026, 9:02 AM"].map(whole)
    )
  ).toEqual([true, true]);
  const name = triggers.getByText(
    "First run, started by hand from the shared reports mailbox",
    { exact: true }
  );
  await expect(name).toBeVisible();
  const givesWay = await name.evaluate(
    (element) => element.scrollWidth > element.clientWidth
  );
  expect(givesWay).toBe(true);
});
