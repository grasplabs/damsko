import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

const questions = [
  "How is our data kept safe?",
  "Can it connect to other tools?",
  "Is there a phone app?",
  "Where can we get help?",
];

// Its fill once any transition under way has ended.
const fill = async (element: Locator): Promise<string> =>
  await element.evaluate(async (node) => {
    await Promise.all(
      node.getAnimations().map(async (each) => await each.finished)
    );
    return getComputedStyle(node).backgroundColor;
  });

test("each section's heading is a real heading holding the button that opens it", async ({
  page,
}) => {
  await openExample(page, "accordion", "basic");
  await Promise.all(
    questions.map(async (name) => {
      const heading = page.getByRole("heading", { level: 3, name });
      await expect(heading).toBeVisible();
      const trigger = heading.getByRole("button", { name });
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    })
  );
});

test("a click opens a section as a region named by its heading, and closes the one open", async ({
  page,
}) => {
  await openExample(page, "accordion", "basic");
  const first = page.getByRole("button", { name: questions[0] });
  const second = page.getByRole("button", { name: questions[1] });

  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
  const region = page.getByRole("region", { name: questions[0] });
  await expect(region).toBeVisible();
  await expect(region).toContainText("encrypted in transit and at rest");

  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(region).toBeHidden();
  await expect(page.getByRole("region", { name: questions[1] })).toBeVisible();

  // Pressing the open heading again closes it: no section has to stay open.
  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "false");
});

test("Tab moves from heading to heading, Enter opens one and Space closes it, focus staying", async ({
  page,
}) => {
  await openExample(page, "accordion", "basic");
  await page.keyboard.press("Tab");
  for (const name of questions) {
    const trigger = page.getByRole("button", { name });
    // oxlint-disable-next-line no-await-in-loop -- one heading after the other
    await expect(trigger).toBeFocused();
    // oxlint-disable-next-line no-await-in-loop -- see above
    expect(await hasFocusRing(trigger)).toBe(true);
    // oxlint-disable-next-line no-await-in-loop -- see above
    await page.keyboard.press("Tab");
  }

  const third = page.getByRole("button", { name: questions[2] });
  await third.focus();
  await page.keyboard.press("Enter");
  await expect(third).toHaveAttribute("aria-expanded", "true");
  await expect(third).toBeFocused();
  await page.keyboard.press("Space");
  await expect(third).toHaveAttribute("aria-expanded", "false");
  await expect(third).toBeFocused();
});

test("a closed section's words stay in the page, hidden, for find in page", async ({
  page,
}) => {
  await openExample(page, "accordion", "basic");
  const words = page.getByText("backed up every night");
  await expect(words).toBeAttached();
  await expect(words).toBeHidden();
});

test("with multiple, several sections stay open side by side", async ({
  page,
}) => {
  await openExample(page, "accordion", "multiple");
  const reports = page.getByRole("button", { name: "Reports" });
  const sharing = page.getByRole("button", { name: "Sharing" });
  const reminders = page.getByRole("button", { name: "Reminders" });
  await expect(reports).toHaveAttribute("aria-expanded", "true");
  await expect(sharing).toHaveAttribute("aria-expanded", "true");
  await expect(reminders).toHaveAttribute("aria-expanded", "false");

  await reminders.click();
  await expect(reminders).toHaveAttribute("aria-expanded", "true");
  await expect(reports).toHaveAttribute("aria-expanded", "true");
  await expect(sharing).toHaveAttribute("aria-expanded", "true");
});

test("a disabled section stays shut, focusable, and keeps its rest fill under the pointer", async ({
  page,
}) => {
  await openExample(page, "accordion", "multiple");
  const exported = page.getByRole("button", { name: "Export" });
  await expect(exported).toHaveAttribute("aria-disabled", "true");
  const rest = await fill(exported);
  await exported.hover({ force: true });
  expect(await fill(exported)).toBe(rest);
  await exported.click({ force: true });
  await expect(exported).toHaveAttribute("aria-expanded", "false");
  await exported.focus();
  await expect(exported).toBeFocused();
});
