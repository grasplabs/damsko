import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("the error's line names it, says it failed, and opens and closes its frames", async ({
  page,
}) => {
  await openExample(page, "stack-trace", "basic");
  const line = page.getByRole("button", {
    name: /^TypeError: Cannot read properties of undefined \(reading 'map'\)\s*, Failed$/u,
  });
  const frames = page.getByRole("list", { name: "Stack frames" });
  await expect(line).toHaveAttribute("aria-expanded", "true");
  await expect(frames.getByRole("listitem")).toHaveCount(6);
  await expect(frames.getByRole("listitem").first()).toHaveText(
    "at UserList (app/components/user-list.tsx:15:23)"
  );
  await line.click();
  await expect(line).toHaveAttribute("aria-expanded", "false");
  await expect(frames).toBeHidden();
});

test("the app's own frame stands in ink, the framework's are muted", async ({
  page,
}) => {
  await openExample(page, "stack-trace", "basic");
  const items = page
    .getByRole("list", { name: "Stack frames" })
    .getByRole("listitem");
  const own = await items
    .first()
    .evaluate((node) => getComputedStyle(node).color);
  const framework = await items
    .nth(1)
    .evaluate((node) => getComputedStyle(node).color);
  expect(own).not.toBe(framework);
});

test("a path is text unless the product opens files", async ({ page }) => {
  await openExample(page, "stack-trace", "basic");
  await expect(page.getByRole("link")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "app/components/user-list.tsx:15:23" })
  ).toHaveCount(0);
});

test("a pressed path hands the file and line to the product; the framework's frames are left out", async ({
  page,
}) => {
  await openExample(page, "stack-trace", "files");
  const frames = page.getByRole("list", { name: "Stack frames" });
  await expect(frames.getByRole("listitem")).toHaveCount(2);
  const path = page.getByRole("button", { name: "app/lib/billing.ts:42:31" });
  await page.getByRole("button", { name: "Copy the stack trace" }).focus();
  await page.keyboard.press("Tab");
  await expect(path).toBeFocused();
  expect(await hasFocusRing(path)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText(
    "Opened app/lib/billing.ts at line 42"
  );
  await expect(page.getByRole("link")).toHaveCount(0);
});

test("Firefox's and Safari's frames show as they wrote them, behind a line that says Error", async ({
  page,
}) => {
  await openExample(page, "stack-trace", "browser");
  const line = page.getByRole("button", { name: /^Error\s*, Failed$/u });
  await line.click();
  const items = page
    .getByRole("list", { name: "Stack frames" })
    .getByRole("listitem");
  await expect(items).toHaveCount(4);
  await expect(items.first()).toHaveText(
    "formatInvoice@https://app.example.com/assets/billing.js:42:31"
  );
  await expect(
    page.getByRole("button", { name: "Copy the stack trace" })
  ).toBeVisible();
});
