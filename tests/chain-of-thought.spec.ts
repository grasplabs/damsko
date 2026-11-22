import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("its line opens and closes the steps, and says so with aria-expanded", async ({
  page,
}) => {
  await openExample(page, "chain-of-thought", "basic");
  const line = page.getByRole("button", {
    name: /read 2 files and changed 1 file/u,
  });
  const step = page.getByText("Searched the web", { exact: true });
  await expect(line).toHaveAttribute("aria-expanded", "false");
  await expect(step).toBeHidden();

  await line.click();
  await expect(line).toHaveAttribute("aria-expanded", "true");
  await expect(step).toBeVisible();

  await line.click();
  await expect(line).toHaveAttribute("aria-expanded", "false");
  await expect(step).toBeHidden();
});

test("the keyboard reaches its line with a ring; Enter opens and Space closes", async ({
  page,
}) => {
  await openExample(page, "chain-of-thought", "basic");
  const line = page.getByRole("button", {
    name: /read 2 files and changed 1 file/u,
  });
  await page.keyboard.press("Tab");
  await expect(line).toBeFocused();
  expect(await hasFocusRing(line)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(line).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(line).toHaveAttribute("aria-expanded", "false");
  await expect(line).toBeFocused();
});

test("while a step works the line says it, and each step says its status in words", async ({
  page,
}) => {
  await openExample(page, "chain-of-thought", "live");
  const line = page.getByRole("button", { name: "Searching the web" });
  await expect(line).toHaveAttribute("aria-expanded", "true");
  // A step's line: its words, the list item, and its status in words after them.
  const step = (label: string) =>
    page.getByRole("listitem").filter({ hasText: label }).locator("..");
  await expect(page.getByRole("listitem")).toHaveCount(5);
  await expect(step("Searching the web")).toContainText("Working");
  await expect(step("Read churn-q3.csv")).toContainText("Waiting");
});

test("a run that finishes while nobody opened or closed it settles into its line", async ({
  page,
}) => {
  await openExample(page, "chain-of-thought", "live");
  const line = page.getByRole("button", { name: "Searching the web" });
  await expect(line).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Play" }).click();
  const done = page.getByRole("button", { name: /read 2 files/u });
  await expect(done).toHaveAttribute("aria-expanded", "false", {
    timeout: 15_000,
  });
});

test("a failed step says it failed, in words as well as by its mark", async ({
  page,
}) => {
  await openExample(page, "chain-of-thought", "states");
  const step = (label: string) =>
    page.getByRole("listitem").filter({ hasText: label }).locator("..");
  await expect(step("Read pricing.xlsx")).toContainText("Failed");
  await expect(step("Check the numbers")).toContainText("Waiting");
});

test("it is a section named for its steps", async ({ page }) => {
  await openExample(page, "chain-of-thought", "basic");
  await expect(page.getByRole("region", { name: "Steps" })).toBeVisible();
});

test("steps that finish together are said together", async ({ page }) => {
  await openExample(page, "chain-of-thought", "script");
  await page.evaluate(() => {
    window.chainOfThoughtScript?.set([
      { id: "plan", label: "Planned the answer", status: "complete" },
      { id: "search", label: "Searched the web", status: "complete" },
      { id: "read", label: "Read brief.md", status: "error" },
    ]);
  });
  await expect(page.getByRole("status")).toHaveText(
    "Searched the web. Read brief.md, Failed"
  );
});

test("a step that first appears finished is silent; one that finishes after it is said", async ({
  page,
}) => {
  await openExample(page, "chain-of-thought", "script");
  await page.evaluate(() => {
    window.chainOfThoughtScript?.set([
      { id: "plan", label: "Planned the answer", status: "complete" },
      { id: "search", label: "Searching the web", status: "active" },
      { id: "read", label: "Reading brief.md", status: "active" },
      { id: "chart", label: "Made a chart", status: "complete" },
    ]);
  });
  await expect(page.getByText("Made a chart")).toBeVisible();
  await page.evaluate(() => {
    window.chainOfThoughtScript?.set([
      { id: "plan", label: "Planned the answer", status: "complete" },
      { id: "search", label: "Searched the web", status: "complete" },
      { id: "read", label: "Reading brief.md", status: "active" },
      { id: "chart", label: "Made a chart", status: "complete" },
    ]);
  });
  await expect(page.getByRole("status")).toHaveText("Searched the web");
});

test("a search step shows what it found under its line", async ({ page }) => {
  await openExample(page, "chain-of-thought", "results");
  const step = page
    .getByRole("listitem")
    .filter({ hasText: "Searched the web" });
  await expect(step).toContainText("northwind.example");
  await expect(step).toContainText("contoso.example");
});

test("a step's picture stands under its line, named by its caption", async ({
  page,
}) => {
  await openExample(page, "chain-of-thought", "image");
  const figure = page.getByRole("figure", {
    name: "Churn by quarter, the last four quarters",
  });
  await expect(figure).toBeVisible();
  await expect(
    figure.getByRole("img", { name: "A bar chart of churn by quarter" })
  ).toBeVisible();
});
