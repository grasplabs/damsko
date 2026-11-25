import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { listenToLiveRegions, openExample } from "./example.ts";

test("its trigger opens it, named by its title and described by its text", async ({
  page,
}) => {
  await openExample(page, "popover", "basic");
  const trigger = page.getByRole("button", { name: "Publish report" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  const popover = page.getByRole("dialog", { name: "Publish this report" });
  await expect(popover).toBeVisible();
  await expect(popover).toHaveAccessibleDescription(
    /^Everyone in the workspace can read it once it is published/u
  );
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("the keyboard opens it and focus moves to its first control", async ({
  page,
}) => {
  await openExample(page, "popover", "basic");
  await page.getByRole("button", { name: "Publish report" }).focus();
  await page.keyboard.press("Enter");
  const popover = page.getByRole("dialog", { name: "Publish this report" });
  await expect(popover.getByRole("button", { name: "Cancel" })).toBeFocused();
});

test("Escape closes it and gives focus back to its trigger", async ({
  page,
}) => {
  await openExample(page, "popover", "basic");
  const trigger = page.getByRole("button", { name: "Publish report" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const popover = page.getByRole("dialog", { name: "Publish this report" });
  await expect(popover).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("a press outside closes it", async ({ page }) => {
  await openExample(page, "popover", "basic");
  await page.getByRole("button", { name: "Publish report" }).click();
  const popover = page.getByRole("dialog", { name: "Publish this report" });
  await expect(popover).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(popover).toBeHidden();
});

test("Cancel closes it and gives focus back to its trigger", async ({
  page,
}) => {
  await openExample(page, "popover", "basic");
  const trigger = page.getByRole("button", { name: "Publish report" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const popover = page.getByRole("dialog", { name: "Publish this report" });
  await popover.getByRole("button", { name: "Cancel" }).press("Enter");
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("its action works with it open, then closes it", async ({ page }) => {
  await openExample(page, "popover", "basic");
  await page.getByRole("button", { name: "Publish report" }).click();
  const popover = page.getByRole("dialog", { name: "Publish this report" });
  const publish = popover.getByRole("button", { name: "Publish", exact: true });
  await publish.click();
  // Working, inside the open popover: the work runs with it open.
  await expect(publish).toHaveAttribute("aria-busy", "true");
  await expect(popover).toBeVisible();
  // Done, it closes.
  await expect(popover).toBeHidden();
});

test("a failed action says so and keeps it open", async ({ page }) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "popover", "check-failed");
  await page.getByRole("button", { name: "Test the connection" }).click();
  const popover = page.getByRole("dialog", { name: "Test the connection" });
  const check = popover.getByRole("button", { name: "Test", exact: true });
  await check.click();
  // With no errorText, the alert stands on the button and the catalogue's words are said.
  await expect(check).toHaveAttribute("data-status", "error");
  await expect.poll(said).toContain("Could not finish");
  await expect(popover).toBeVisible();
});

test("one that only explains keeps focus on its trigger with initialFocus none", async ({
  page,
}) => {
  await openExample(page, "popover", "explains");
  const trigger = page.getByRole("button", { name: "Roles" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Roles" })).toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Roles" })).toBeHidden();
});

test("a long body is a region the keys can scroll", async ({ page }) => {
  await openExample(page, "popover", "long");
  await page.getByRole("button", { name: "What is new" }).click();
  const region = page.getByRole("region", { name: "What is new in reports" });
  await expect(region).toBeVisible();
  await expect(region).toHaveAttribute("tabindex", "0");
});

test("a tooltip on its trigger describes it, and stays away while it is open", async ({
  page,
}) => {
  await openExample(page, "popover", "tooltip");
  const trigger = page.getByRole("button", { name: "Share" });
  await expect(trigger).toHaveCount(1);
  await expect(trigger).toHaveAccessibleDescription("Share this report");
  await trigger.hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Share this report" })
  ).toBeVisible();
  await expect(page.getByRole("tooltip")).toBeHidden();
});

// The agent fixture: the page's one bridge (window.damskoAgent, site/behaviour/agent.ts).
const act = async (page: Page, ref: string, args?: string[]) =>
  await page.evaluate(
    async ([name, list]) => {
      const result = await window.damskoAgent?.act({
        steps: [{ ref: name, action: "press", args: list }],
      });
      return { ok: result?.ok === true, message: result?.error?.message ?? "" };
    },
    [ref, args] as const
  );

test("an agent opens it by its trigger and presses its action by name", async ({
  page,
}) => {
  await openExample(page, "popover", "agent");
  const opened = await act(page, "Share");
  expect(opened.ok).toBe(true);
  const popover = page.getByRole("dialog", { name: "Share this report" });
  await expect(popover).toBeVisible();
  const sent = await act(page, "Share this report", ["Send invite"]);
  expect(sent.ok).toBe(true);
  await expect(popover).toBeHidden();
  expect(await page.evaluate(() => window.popoverLog ?? [])).toContain("sent");
  const failed = await act(page, "Publish", ["Publish now"]);
  expect(failed.ok).toBe(false);
  expect(failed.message).toContain("Could not publish");
});
