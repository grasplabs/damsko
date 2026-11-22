import { expect, test } from "@playwright/test";

import { hasFocusRing, listenToLiveRegions, openExample } from "./example.ts";

test("each section is a line named by its count and label that opens and folds its list", async ({
  page,
}) => {
  await openExample(page, "queue", "basic");
  const left = page.getByRole("button", { name: "3 to do" });
  const completed = page.getByRole("button", { name: "2 completed" });
  const todo = page.getByText("Add tests for the combobox", { exact: true });
  const done = page.getByText("Add a changeset", { exact: true });
  await expect(left).toHaveAttribute("aria-expanded", "true");
  await expect(todo).toBeVisible();
  await expect(completed).toHaveAttribute("aria-expanded", "false");
  await expect(done).toBeHidden();
  await completed.click();
  await expect(done).toBeVisible();
  await left.click();
  await expect(left).toHaveAttribute("aria-expanded", "false");
  await expect(todo).toBeHidden();
});

test("a done to-do says so in words, not by its tick alone", async ({
  page,
}) => {
  await openExample(page, "queue", "basic");
  await page.getByRole("button", { name: "2 completed" }).click();
  const line = (title: string) =>
    page.getByText(title, { exact: true }).locator("..");
  await expect(line("Add a changeset")).toContainText("Done, Add a changeset");
  await expect(line("Add tests for the combobox")).not.toContainText("Done");
});

test("the keyboard reaches a section's line with a ring, and Enter folds it", async ({
  page,
}) => {
  await openExample(page, "queue", "basic");
  const left = page.getByRole("button", { name: "3 to do" });
  await page.keyboard.press("Tab");
  await expect(left).toBeFocused();
  expect(await hasFocusRing(left)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(left).toHaveAttribute("aria-expanded", "false");
  await expect(left).toBeFocused();
});

test("a to-do with more to say opens on it", async ({ page }) => {
  await openExample(page, "queue", "descriptions");
  await expect(page.getByText("12 files", { exact: true })).toBeVisible();
  const todo = page.getByRole("button", {
    name: "Fix the focus ring on the select trigger",
  });
  const detail = page.getByText(
    "It is clipped by the field's hidden overflow."
  );
  await expect(detail).toBeHidden();
  await todo.click();
  await expect(todo).toHaveAttribute("aria-expanded", "true");
  await expect(detail).toBeVisible();
});

test("a message's actions are named buttons; the product takes it out of the queue", async ({
  page,
}) => {
  await openExample(page, "queue", "messages");
  await expect(page.getByRole("button", { name: "3 queued" })).toBeVisible();
  await page.getByRole("button", { name: "Send now" }).first().click();
  await expect(
    page.getByText("Also compare it with last year's numbers")
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "2 queued" })).toBeVisible();
  await page.getByRole("button", { name: "Remove" }).first().click();
  await expect(page.getByRole("button", { name: "1 queued" })).toBeVisible();
});

test("an image shows only from an address safe to load; a file shows by its name", async ({
  page,
}) => {
  await openExample(page, "queue", "messages");
  await expect(
    page.getByRole("img", { name: "quarter-chart.png" })
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "picture.svg" })).toHaveCount(0);
  await expect(
    page.getByText("planning-notes-for-the-autumn-review.pdf")
  ).toBeVisible();
});

test("the to-do in progress says it is working, and a finished one is said once", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "queue", "live");
  // The running title shimmers: its words are drawn twice, once for the eye only.
  await expect(page.getByText(", Working", { exact: true })).toHaveCount(1);
  const next = page.getByRole("button", { name: "Next" });
  await next.click();
  await expect(page.getByRole("button", { name: "3 to do" })).toBeVisible();
  await next.click();
  await expect(page.getByRole("button", { name: "2 to do" })).toBeVisible();
  // Each finished on its line: said once, and nothing else is.
  await expect
    .poll(said)
    .toStrictEqual([
      "Done, Add a dark variant to the theme tokens",
      "Done, Read the theme from a cookie",
    ]);
});

test("a remote picture from a chat is never requested and an SVG never drawn; one written into the address shows", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname.endsWith("example.com")) {
      requested.push(request.url());
    }
  });
  await openExample(page, "queue", "untrusted");
  await expect(page.getByRole("img", { name: "swatch.png" })).toBeVisible();
  await expect(page.getByRole("img", { name: "cover.jpg" })).toHaveCount(0);
  await expect(page.getByRole("img", { name: "drawing.svg" })).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  expect(requested).toStrictEqual([]);
});
