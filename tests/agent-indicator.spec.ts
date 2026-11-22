import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { openExample } from "./example.ts";

/** How many animations run in the element and everything inside it. */
const running = async (element: Locator): Promise<number> =>
  await element.evaluate(
    (node) =>
      node
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === "running").length
  );

test("alone, it is a status that says the caller's name", async ({ page }) => {
  await openExample(page, "agent-indicator", "alone");
  await expect(page.getByRole("status")).toHaveText("Filling the column");
});

test("beside words, the words are the status and the mark says nothing", async ({
  page,
}) => {
  await openExample(page, "agent-indicator", "with-words");
  await expect(page.getByRole("status")).toHaveText("Searching the web");
});

test("once the work succeeds, a tick stands where the mark moved", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "agent-indicator", "done");
  const status = page.getByRole("status");
  await expect(status).toHaveText("Filling the column");
  await expect.poll(async () => await running(status)).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Finish" }).click();
  await expect(status).toHaveText("Filled the column");
  // The tick draws in once, then nothing moves.
  await expect.poll(async () => await running(status)).toBe(0);
});

/**
 * The most animations that ran in the element at once, looked at again and again over 400ms of the
 * page's time: one look could miss a mark that starts late.
 */
const mostRunning = async (element: Locator): Promise<number> => {
  const page = element.page();
  const now = async () =>
    await page.evaluate(() => Number(document.timeline.currentTime ?? 0));
  const start = await now();
  let most = 0;
  await expect
    .poll(async () => {
      most = Math.max(most, await running(element));
      return (await now()) - start;
    })
    .toBeGreaterThan(400);
  return most;
};

test("with reduced motion it stands still, and with motion it moves", async ({
  page,
}) => {
  await openExample(page, "agent-indicator", "alone");
  const status = page.getByRole("status");
  await expect(status).toHaveText("Filling the column");
  expect(await mostRunning(status)).toBe(0);

  // The same look finds it moving once motion is allowed, so it can tell the two apart.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(async () => await mostRunning(status)).toBeGreaterThan(0);
});

test("named while out of sight, it moves again once seen", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "agent-indicator", "named-later");
  const runningOnPage = async () =>
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === "running").length
    );
  await expect.poll(runningOnPage).toBeGreaterThan(0);
  // Scrolled out of sight, the mark stops.
  await page.evaluate(() => {
    const room = document.createElement("div");
    room.style.height = "300vh";
    document.body.prepend(room);
  });
  await expect.poll(runningOnPage).toBe(0);
  // Named there (a press that does not scroll), the mark moves into the status; seen again, it moves.
  await page
    .getByRole("button", { name: "Name the work" })
    .dispatchEvent("click");
  const status = page.getByRole("status");
  await expect(status).toHaveText("Filling the column");
  await status.scrollIntoViewIfNeeded();
  await expect.poll(async () => await running(status)).toBeGreaterThan(0);
});
