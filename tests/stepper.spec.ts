import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

/** A step's name and its status, as a screen reader hears them: "Details, done". */
const said = (name: string, status: string) =>
  new RegExp(`^${name}\\s*, ${status}$`, "u");

test("an ordered list, named, the current step marked and each status said", async ({
  page,
}) => {
  await openExample(page, "stepper", "select");
  const list = page.getByRole("list", { name: "Setting up the workspace" });
  const steps = list.getByRole("listitem");
  await expect(steps).toHaveCount(4);
  await expect(steps.nth(0)).toHaveText(said("Details", "done"));
  await expect(steps.nth(1)).toHaveText(said("Members", "done"));
  await expect(steps.nth(2)).toHaveText(said("Billing", "current step"));
  await expect(steps.nth(2)).toHaveAttribute("aria-current", "step");
  await expect(steps.nth(3)).toHaveText(said("Review", "not started"));
  await expect(list.locator('[aria-current="step"]')).toHaveCount(1);
});

test("Tab reaches the done steps only, with a ring, and Enter goes back to one", async ({
  page,
}) => {
  await openExample(page, "stepper", "select");
  const details = page.getByRole("button", { name: said("Details", "done") });
  await page.keyboard.press("Tab");
  await expect(details).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: said("Members", "done") })
  ).toBeFocused();
  await expect(page.getByRole("button")).toHaveCount(2);
  await details.focus();
  await page.keyboard.press("Enter");
  const steps = page.getByRole("listitem");
  await expect(steps.nth(0)).toHaveAttribute("aria-current", "step");
  await expect(steps.nth(0)).toHaveText(said("Details", "current step"));
  await expect(steps.nth(1)).toHaveText(said("Members", "not started"));
  // The move is said once, through the page's live region.
  await expect(page.getByRole("status")).toHaveText("Step 1 of 4: Details");
});

test("a failed step says so, on its own and once every step is done", async ({
  page,
}) => {
  await openExample(page, "stepper", "failed");
  const [failed, finished] = [
    page.getByRole("list", { name: "Importing contacts" }).nth(0),
    page.getByRole("list", { name: "Importing contacts" }).nth(1),
  ];
  await expect(failed.getByRole("listitem").nth(1)).toHaveText(
    said("Match columns", "failed")
  );
  await expect(finished.getByRole("listitem")).toHaveText([
    said("Upload", "done"),
    said("Match columns", "done"),
    said("Import", "done"),
  ]);
});

test("with reached, every step up to the furthest is a way there, forward too", async ({
  page,
}) => {
  await openExample(page, "stepper", "reached");
  const steps = page.getByRole("listitem");
  await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
  // Reached and come back from: said as done.
  await expect(steps.nth(3)).toHaveText(said("Review", "done"));
  await page.getByRole("button", { name: said("Review", "done") }).click();
  await expect(steps.nth(3)).toHaveAttribute("aria-current", "step");
  await page.getByRole("button", { name: said("Members", "done") }).click();
  await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
});

test("past the furthest reached, a step is no button", async ({ page }) => {
  await openExample(page, "stepper", "marks");
  const list = page.getByRole("list", { name: "Setting up Grasp" }).first();
  // Reached step 6, back on step 3: steps 1 to 6 but the current one are buttons.
  await expect(list.getByRole("button")).toHaveCount(5);
  await list.getByRole("button", { name: /^Tools\b/u }).click();
  await expect(list.getByRole("listitem").nth(4)).toHaveAttribute(
    "aria-current",
    "step"
  );
});

test("the marks alone: each name is read, and is its tooltip on hover and focus", async ({
  page,
}) => {
  await openExample(page, "stepper", "marks");
  const list = page.getByRole("list", { name: "Setting up Grasp" }).first();
  await expect(
    list.getByRole("listitem").nth(2).getByText(said("Team", "current step"))
  ).toBeAttached();
  await expect(list.getByText("Team", { exact: true })).toBeHidden();
  await list.getByRole("button", { name: /^Tools\b/u }).hover();
  await expect(page.getByRole("tooltip")).toHaveText("Tools");
  await page.mouse.move(0, 0);
  await expect(page.getByRole("tooltip")).toBeHidden();
  // Keyboard focus on a step shows its name too.
  await list.getByRole("button", { name: /^Tools\b/u }).focus();
  await page.keyboard.press("Tab");
  await expect(list.getByRole("button", { name: /^Data\b/u })).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText("Data");
});

test("running down, the steps keep their order and their descriptions", async ({
  page,
}) => {
  await openExample(page, "stepper", "vertical");
  const steps = page
    .getByRole("list", { name: "Publishing the report" })
    .getByRole("listitem");
  await expect(steps.nth(2)).toHaveAttribute("aria-current", "step");
  await expect(steps.nth(0)).toContainText("Written and saved on 3 March.");
});

test("the footer: Back, how far through, and Next as the step's action", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-footer");
  const progress = page.getByRole("progressbar", { name: "Step 3 of 7" });
  await expect(progress).toHaveAttribute("aria-valuetext", "Step 3 of 7");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(
    page.getByRole("progressbar", { name: "Step 4 of 7" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(progress).toBeVisible();
});

test("the footer's last step says what it does, and the first keeps Back's room", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-footer-states");
  await expect(
    page.getByRole("progressbar", { name: "Step 1 of 7" })
  ).toBeVisible();
  // Hidden on the first step, its room kept: Tab goes straight to Next.
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Next" }).first()
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Create agent" })
  ).toBeVisible();
});

test("Next that waits for an answer keeps its place in the keys and says why", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-bar-states");
  const held = page.getByRole("button", { name: "Next" }).nth(1);
  await expect(held).toHaveAttribute("aria-disabled", "true");
  await expect(held).toHaveAccessibleDescription("Choose one to go on");
  // Next, then the second bar's Back, then its held Next.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(held).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText("Choose one to go on");
});

test("the bar: ghost arrows named Back and Next, and the finish words on the last step", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-bar");
  await expect(
    page.getByRole("progressbar", { name: "Step 3 of 7" })
  ).toBeVisible();
  const next = page.getByRole("button", { name: "Next" });
  await next.click();
  await expect(
    page.getByRole("progressbar", { name: "Step 4 of 7" })
  ).toBeVisible();
  await next.click();
  await expect(
    page.getByRole("progressbar", { name: "Step 5 of 7" })
  ).toBeVisible();
  await next.click();
  await expect(
    page.getByRole("progressbar", { name: "Step 6 of 7" })
  ).toBeVisible();
  await next.click();
  await expect(page.getByRole("button", { name: "Next" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Create agent" })
  ).toBeVisible();
});

test("Alt+Left is Back and Mod+Enter is Next, anywhere in the flow", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-bar");
  await page.keyboard.press("Alt+ArrowLeft");
  await expect(
    page.getByRole("progressbar", { name: "Step 2 of 7" })
  ).toBeVisible();
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(
    page.getByRole("progressbar", { name: "Step 3 of 7" })
  ).toBeVisible();
});

test("in a form, Next submits it: Enter in the field goes on", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-form");
  await page.getByLabel("Your name").fill("Ada");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Your team")).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Step 2 of 3" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByLabel("Your role")).toBeVisible();
  await page.keyboard.press("Alt+ArrowLeft");
  await expect(page.getByLabel("Your team")).toBeVisible();
});
