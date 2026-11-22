import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("before the first turn it shows its empty state", async ({ page }) => {
  await openExample(page, "chat", "empty");
  const log = page.getByRole("log", {
    name: "Conversation with the assistant",
  });
  await expect(log.getByText("No messages yet")).toBeVisible();
  await expect(
    log.getByText("Ask anything to start the conversation.")
  ).toBeVisible();
});

test("a sent question settles near the top, the answer streams in under it, and Start over empties the thread", async ({
  page,
}) => {
  await openExample(page, "chat", "demo");
  const log = page.getByRole("log", { name: "New thread" });
  await expect(log.getByText("What should we plan?")).toBeVisible();
  const field = page.getByRole("textbox", { name: "Message" });
  await field.fill("Plan my week.");
  await field.press("Enter");
  const question = log.getByText("Plan my week.", { exact: true });
  await expect(question).toBeVisible();
  await expect(log.getByText(/fit it to these three days\./u)).toBeVisible({
    timeout: 10_000,
  });
  await field.fill("And the week after?");
  await field.press("Enter");
  const second = log.getByText("And the week after?", { exact: true });
  const top = async () => {
    const view = await log.boundingBox();
    const turn = await second.boundingBox();
    return (turn?.y ?? 0) - (view?.y ?? 0);
  };
  await expect.poll(top, { timeout: 5000 }).toBeLessThan(110);
  expect(await top()).toBeGreaterThan(0);
  await expect(log.getByText(/fit it to these three days\./u)).toHaveCount(2, {
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(log.getByText("What should we plan?")).toBeVisible();
});

test("a checkpoint's words are read and its button is named for the checkpoint", async ({
  page,
}) => {
  await openExample(page, "chat", "checkpoint");
  const log = page.getByRole("log", { name: "Rename the button" });
  await expect(log.getByText("Button renamed")).toBeVisible();
  await expect(
    log.getByRole("button", { name: "Restore to Button renamed" })
  ).toBeVisible();
  await expect(page.getByRole("separator")).toHaveCount(0);
});

test("a checkpoint's tooltip opens on hover and describes its button", async ({
  page,
}) => {
  await openExample(page, "chat", "checkpoint");
  const restore = page.getByRole("button", {
    name: "Restore to Button renamed",
  });
  await restore.hover();
  await expect(page.getByRole("tooltip")).toHaveText(
    "Drops the messages after this point"
  );
  await expect(restore).toHaveAccessibleDescription(
    "Drops the messages after this point"
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toBeHidden();
});

test("the keyboard reaches a checkpoint's button with a ring, and Enter drops the turns after it", async ({
  page,
}) => {
  await openExample(page, "chat", "checkpoint");
  await expect(page.getByText("Update the docs to match.")).toBeVisible();
  const restore = page.getByRole("button", {
    name: "Restore to Button renamed",
  });
  await page.getByRole("log", { name: "Rename the button" }).focus();
  await page.keyboard.press("Tab");
  await expect(restore).toBeFocused();
  expect(await hasFocusRing(restore)).toBe(true);
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Update the docs to match.")).toBeHidden();
  await expect(
    page.getByText("Renamed Button to Action in components/ui/button.tsx.")
  ).toBeVisible();
});

test("with nothing after a checkpoint, its button is out of use but keeps focus, and its tooltip says why", async ({
  page,
}) => {
  await openExample(page, "chat", "checkpoint");
  const restore = page.getByRole("button", {
    name: "Restore to Button renamed",
  });
  await restore.click();
  await expect(restore).toBeDisabled();
  await expect(restore).toBeFocused();
  await expect(restore).toHaveAccessibleDescription(
    "Nothing after this point to drop"
  );
  await page.getByRole("button", { name: "Send again" }).click();
  await expect(page.getByText("Update the docs to match.")).toBeVisible();
  await expect(restore).toBeEnabled();
});
