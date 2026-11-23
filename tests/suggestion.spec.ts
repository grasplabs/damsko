import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("the row is a group named Suggestions, each suggestion a button named by its words", async ({
  page,
}) => {
  await openExample(page, "suggestion", "basic");
  const row = page.getByRole("group", { name: "Suggestions" });
  await expect(row).toBeVisible();
  await expect(row.getByRole("button")).toHaveCount(4);
  await expect(
    row.getByRole("button", { name: "Draft a reply", exact: true })
  ).toBeVisible();
});

test("a press hands the suggestion's words to onClick", async ({ page }) => {
  await openExample(page, "suggestion", "basic");
  await expect(page.getByText("Nothing sent yet")).toBeVisible();
  await page.getByRole("button", { name: "List the open questions" }).click();
  await expect(page.getByText("Sent: List the open questions")).toBeVisible();
});

test("the keyboard reaches each suggestion with a ring, and Enter presses it", async ({
  page,
}) => {
  await openExample(page, "suggestion", "basic");
  const first = page.getByRole("button", { name: "Summarise this thread" });
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  expect(await hasFocusRing(first)).toBe(true);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Draft a reply" })
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Sent: Draft a reply")).toBeVisible();
});

test("a row longer than its column scrolls sideways with no bar, and Tab brings each into view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "suggestion", "overflow");
  const row = page.getByRole("group", { name: "Ask about this project" });
  const last = row.getByRole("button", { name: "Suggest next steps" });
  expect(
    await row.evaluate((element) => ({
      runsPast: element.scrollWidth > element.clientWidth,
      bar: getComputedStyle(element).scrollbarWidth,
    }))
  ).toStrictEqual({ runsPast: true, bar: "none" });
  // More beyond the end only: that side fades.
  await expect(row).toHaveCSS("mask-image", /^linear-gradient/u);
  await expect(last).not.toBeInViewport({ ratio: 1 });
  for (let tab = 0; tab < 6; tab += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other
    await page.keyboard.press("Tab");
  }
  await expect(last).toBeFocused();
  await expect(last).toBeInViewport({ ratio: 1 });
  expect(await row.evaluate((element) => element.scrollLeft)).toBeGreaterThan(
    0
  );
});

test("above the prompt input, a suggestion is sent as it is, as typed words are", async ({
  page,
}) => {
  await openExample(page, "suggestion", "prompt");
  await page
    .getByRole("group", { name: "Suggestions" })
    .getByRole("button", { name: "Draft the weekly update" })
    .click();
  await expect(page.getByText("Sent: Draft the weekly update")).toBeVisible();
  await page.getByRole("textbox", { name: "Message" }).fill("Book a room");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Sent: Book a room")).toBeVisible();
});

test("a suggestion longer than its row stays in the row on one line, cut with an ellipsis, and keeps its whole name", async ({
  page,
}) => {
  await openExample(page, "suggestion", "long");
  const row = page.getByRole("group", { name: "Suggestions" });
  const button = row.getByRole("button", {
    name: "Compare this quarter's supplier costs with the last three",
  });
  expect(
    await row.evaluate((element) => element.scrollWidth > element.clientWidth)
  ).toBe(false);
  const box = await button.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(240);
  expect(box?.height).toBe(32);
  expect(
    await button
      .getByText("Compare this quarter")
      .evaluate((words) => getComputedStyle(words).textOverflow)
  ).toBe("ellipsis");
});
