import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { fixedTime, openExample } from "./example.ts";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const clipboard = async (page: Page) =>
  await page.evaluate(async () => await navigator.clipboard.readText());

const command = "shadcn@4.23.0 add @damsko/button";

test("a press on the button copies the value and says so once", async ({
  page,
}) => {
  await openExample(page, "snippet", "basic");
  await page.getByRole("button", { name: "Copy the install command" }).click();
  await expect.poll(async () => await clipboard(page)).toContain(command);
  await expect(
    page.getByRole("status").filter({ hasText: /^Copied$/u })
  ).toHaveCount(1);
});

test("a press on the value copies it too", async ({ page }) => {
  await openExample(page, "snippet", "basic");
  await page.getByText(command, { exact: false }).click();
  await expect.poll(async () => await clipboard(page)).toContain(command);
});

for (const key of ["Enter", "Space"]) {
  test(`${key} on its one tab stop copies`, async ({ page }) => {
    await openExample(page, "snippet", "basic");
    await page.keyboard.press("Tab");
    const button = page.getByRole("button", {
      name: "Copy the install command",
    });
    await expect(button).toBeFocused();
    await page.keyboard.press(key);
    await expect.poll(async () => await clipboard(page)).toContain(command);
  });
}

test("the button's tooltip says what it copies", async ({ page }) => {
  await openExample(page, "snippet", "basic", {
    time: fixedTime,
  });
  await page.getByRole("button", { name: "Copy the install command" }).hover();
  await page.clock.runFor(600);
  await expect(page.getByRole("tooltip")).toHaveText(
    "Copy the install command"
  );
});

test("each of a list copies its own value", async ({ page }) => {
  await openExample(page, "snippet", "sizes");
  const buttons = page.getByRole("button", { name: "Copy the user ID" });
  await expect(buttons).toHaveCount(2);
  await buttons.first().click();
  await expect.poll(async () => await clipboard(page)).toBe("usr_4f81c2");
});

test("a long value stays on one line inside its field, and copies whole", async ({
  page,
}) => {
  await openExample(page, "snippet", "long");
  const value = "workspace_8f3a2c91-d4e7-4b6a-905f-1c2d3e4b5a69";
  const shown = page.getByText(value);
  const button = page.getByRole("button", { name: "Copy the workspace ID" });
  const [text, press] = await Promise.all([
    shown.boundingBox(),
    button.boundingBox(),
  ]);
  // One line: no taller than the button beside it, and the button on the same line.
  expect(text?.height ?? 0).toBeLessThanOrEqual(press?.height ?? 0);
  expect(Math.abs((text?.y ?? 0) - (press?.y ?? 0))).toBeLessThan(
    press?.height ?? 0
  );
  expect(text?.width ?? 0).toBeLessThanOrEqual(260);
  await button.click();
  await expect.poll(async () => await clipboard(page)).toBe(value);
});

test("a long value that scrolls is still one tab stop", async ({ page }) => {
  await openExample(page, "snippet", "long");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Copy the workspace ID" })
  ).toBeFocused();
});
