import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { fixedTime, listenToLiveRegions, openExample } from "./example.ts";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const clipboard = async (page: Page) =>
  await page.evaluate(async () => await navigator.clipboard.readText());

test("a press copies the value and says so once", async ({ page }) => {
  await openExample(page, "copy-button", "basic");
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect
    .poll(async () => await clipboard(page))
    .toContain('import { Badge } from "@grasp-os/ui/components/badge";');
  // The page's one live region says it.
  await expect(
    page.getByRole("status").filter({ hasText: /^Copied$/u })
  ).toHaveCount(1);
});

test("a copy is over at once, so only its result is said, never that it is working", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "copy-button", "basic");
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect.poll(said).toContain("Copied");
  expect(await said()).toStrictEqual(["Copied"]);
});

test("the keyboard copies too", async ({ page }) => {
  await openExample(page, "copy-button", "basic");
  await page.getByRole("button", { name: "Copy code" }).focus();
  await page.keyboard.press("Enter");
  await expect.poll(async () => await clipboard(page)).toContain("Badge");
});

test("only an icon, its tooltip says its name", async ({ page }) => {
  await openExample(page, "copy-button", "basic", {
    time: fixedTime,
  });
  await page.getByRole("button", { name: "Copy code" }).hover();
  await page.clock.runFor(600);
  await expect(page.getByRole("tooltip")).toHaveText("Copy code");
});

test("with words, it shows them and copies what it is given", async ({
  page,
}) => {
  await openExample(page, "copy-button", "basic");
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect
    .poll(async () => await clipboard(page))
    .toBe("https://example.com/reports/q3");
});

test("a function is read at the press, and onCopy hears each copy once", async ({
  page,
}) => {
  await openExample(page, "copy-button", "on-copy");
  await page
    .getByRole("textbox", { name: "Invite note" })
    .fill("Bring the Q3 numbers");
  const copy = page.getByRole("button", { name: "Copy the note" });
  await copy.click();
  await expect
    .poll(async () => await clipboard(page))
    .toBe("Bring the Q3 numbers");
  await expect(
    page.getByText("Copies: 1, last: Bring the Q3 numbers")
  ).toBeVisible();
  // Pressed again while the check still shows: nothing is copied, and onCopy hears nothing.
  await copy.click();
  // Once it is back at rest, whatever the second press did has been drawn.
  await expect(copy).not.toHaveAttribute("data-status");
  await expect(page.getByText(/^Copies: 1,/u)).toBeVisible();
});

test("a copy that fails says so and is not reported as copied", async ({
  page,
}) => {
  await openExample(page, "copy-button", "on-copy");
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      await Promise.reject(new Error("denied"));
    };
  });
  await page.getByRole("button", { name: "Copy the note" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: /^Not copied$/u })
  ).toHaveCount(1);
  await expect(page.getByText("Nothing copied yet")).toBeVisible();
});
