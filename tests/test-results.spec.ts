import { expect, test } from "@playwright/test";

import {
  drawnEdges,
  hasFocusRing,
  markStart,
  openExample,
  panelOf,
} from "./example.ts";

test("a failed run says its counts and Failed in words, and is open on its tests", async ({
  page,
}) => {
  await openExample(page, "test-results", "basic");
  const run = page.getByRole("button", {
    name: /^Ran 5 tests, 1 failed\s*, Failed$/u,
  });
  await expect(run).toHaveAttribute("aria-expanded", "true");
  const failed = page.getByRole("button", {
    name: /^rounds to two decimals\s*, Failed$/u,
  });
  await expect(failed).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText('Expected "$10.13", received "$10.125"')
  ).toBeVisible();
  await failed.click();
  await expect(failed).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByText('Expected "$10.13", received "$10.125"')
  ).toBeHidden();
});

test("a passed test is a line, not a button", async ({ page }) => {
  await openExample(page, "test-results", "basic");
  await expect(page.getByText("formats a price in USD")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /formats a price in USD/u })
  ).toHaveCount(0);
});

test("suites open when they failed, say their counts, and a skipped test says so", async ({
  page,
}) => {
  await openExample(page, "test-results", "suites");
  await expect(
    page.getByRole("button", {
      name: /^Ran 8 tests, 2 failed, 1 skipped\s*, 5\.49s\s*, Failed$/u,
    })
  ).toBeVisible();
  const passing = page.getByRole("button", {
    name: /^auth\.test\.ts\s*, 3 passed$/u,
  });
  await expect(passing).toHaveAttribute("aria-expanded", "false");
  const failing = page.getByRole("button", {
    name: /^user-api\.test\.ts\s*, 1 passed, 1 failed, 1 skipped\s*, Failed$/u,
  });
  await expect(failing).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Skipped deletes a user")).toBeVisible();
  await expect(page.getByText("112ms")).toBeVisible();
  await passing.click();
  await expect(page.getByText("logs in with valid credentials")).toBeVisible();
});

test("the keyboard reaches the run with a ring; Enter opens it on a bar named by how many passed", async ({
  page,
}) => {
  await openExample(page, "test-results", "passed");
  const run = page.getByRole("button", { name: /^Ran 4 tests\s*, 1\.84s$/u });
  await expect(run).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Tab");
  await expect(run).toBeFocused();
  expect(await hasFocusRing(run)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(run).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("progressbar", { name: "4 of 4 tests passed" })
  ).toBeVisible();
  await expect(page.getByText("1.52s")).toBeVisible();
});

test("what opens under the line starts on the line's own start edge, its mark's", async ({
  page,
}) => {
  await openExample(page, "test-results", "basic");
  const line = page.getByRole("button", { name: /^Ran 5 tests, 1 failed/u });
  if ((await line.getAttribute("aria-expanded")) === "false") {
    await line.press("Enter");
  }
  const panel = await panelOf(line);
  await expect(panel).toBeVisible();
  const header = await drawnEdges(line);
  const body = await drawnEdges(panel);
  expect(Math.abs(body.start - header.start)).toBeLessThanOrEqual(1);
});

for (const dir of ["ltr", "rtl"]) {
  test(`every level of rows stands on one edge: a suite and its failed test on the run's mark, ${dir}`, async ({
    page,
  }) => {
    await openExample(page, "test-results", "suites");
    await page.evaluate((direction) => {
      document.documentElement.dir = direction;
    }, dir);
    const run = await markStart(
      page.getByRole("button", { name: /^Ran 8 tests/u })
    );
    const suite = await markStart(
      page.getByRole("button", { name: /^user-api\.test\.ts/u })
    );
    const failed = await markStart(
      page.getByRole("button", { name: /^updates a user profile/u })
    );
    expect(suite).toBeCloseTo(run, 0);
    expect(failed).toBeCloseTo(run, 0);
  });
}
