import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

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
