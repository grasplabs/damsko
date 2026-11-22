import { expect, test } from "@playwright/test";

import { hasFocusRing, listenToLiveRegions, openExample } from "./example.ts";

test("it starts open on its steps, a file named as a chip, and its line folds it", async ({
  page,
}) => {
  await openExample(page, "task", "basic");
  const trigger = page.getByRole("button", { name: "Found the project files" });
  const step = page.getByText("Scanned 52 files", { exact: true });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(step).toBeVisible();
  await expect(page.getByText("app/page.tsx", { exact: true })).toBeVisible();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(step).toBeHidden();
});

test("the keyboard reaches the line with a ring; Space folds and Enter opens", async ({
  page,
}) => {
  await openExample(page, "task", "basic");
  const trigger = page.getByRole("button", { name: "Found the project files" });
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  expect(await hasFocusRing(trigger)).toBe(true);
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("a running task says it is working; once done its title turns, it closes, and it is said once", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "task", "live");
  const next = page.getByRole("button", { name: "Next" });
  const running = page.getByRole("button", {
    name: /^Finding the project files.*Working$/u,
  });
  await expect(running).toHaveAttribute("aria-expanded", "true");
  await next.click();
  await next.click();
  await next.click();
  const done = page.getByRole("button", { name: "Found the project files" });
  await expect(done).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("button", { name: /^Updating the page metadata/u })
  ).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(said)
    .toStrictEqual([
      "Searched for generateMetadata",
      "Read app/layout.tsx",
      "Found the project files. Read app/page.tsx",
    ]);
});
