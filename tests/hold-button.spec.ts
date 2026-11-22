import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { fixedTime, openExample } from "./example.ts";

// The fixture (examples/hold-button/agent.tsx) writes what ran to window.holdLog. The page's clock
// is held, so a hold lasts exactly as long as the test runs it: past the longest hold for a full
// one, under it for one let go early.
const NAME = "Hold to delete draft";
const FULL = 2000;
const HALF = 500;
const TAP = 50;

const open = async (page: Page) => {
  await openExample(page, "hold-button", "agent", {
    time: fixedTime,
  });
  await page.clock.pauseAt(new Date(fixedTime.getTime() + 1000));
};

const log = async (page: Page, line: string) =>
  await page.evaluate(
    (wanted) => (window.holdLog ?? []).filter((each) => each === wanted).length,
    line
  );

const centre = async (page: Page, name = NAME) => {
  const box = await page.getByRole("button", { name }).boundingBox();
  if (box === null) {
    throw new Error(`${name} has no box`);
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

/** Presses the button with the mouse for `ms` of the page's clock, then lets go. */
const press = async (page: Page, ms: number, name = NAME) => {
  const { x, y } = await centre(page, name);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.clock.runFor(ms);
  await page.mouse.up();
  await page.clock.runFor(FULL);
};

const confirmation = (page: Page, title = "Delete draft?") =>
  page.getByRole("dialog", { name: title });

test("it is named by how it is pressed", async ({ page }) => {
  await open(page);
  await expect(page.getByRole("button", { name: NAME })).toBeVisible();
});

test("a full hold runs it once and asks nothing", async ({ page }) => {
  await open(page);
  await press(page, FULL);
  expect(await log(page, "deleted")).toBe(1);
  await expect(confirmation(page)).toHaveCount(0);
});

test("the hold lasts a second", async ({ page }) => {
  await open(page);
  await press(page, 900);
  expect(await log(page, "deleted")).toBe(0);
  await press(page, 1100);
  expect(await log(page, "deleted")).toBe(1);
});

test("let go early, nothing runs and nothing asks", async ({ page }) => {
  await open(page);
  await press(page, HALF);
  expect(await log(page, "deleted")).toBe(0);
  await expect(confirmation(page)).toHaveCount(0);
});

test("a tap asks with the button's words and Cancel", async ({ page }) => {
  await open(page);
  await press(page, TAP);
  const ask = confirmation(page);
  await expect(ask).toBeVisible();
  await expect(ask.getByRole("button", { name: "Cancel" })).toBeVisible();
  expect(await log(page, "deleted")).toBe(0);
  await ask.getByRole("button", { name: "Delete draft" }).click();
  await expect(ask).toBeHidden();
  expect(await log(page, "deleted")).toBe(1);
});

test("Cancel runs nothing and gives focus back to the button", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: NAME }).focus();
  await page.keyboard.press("Enter");
  const ask = confirmation(page);
  await expect(ask).toBeVisible();
  await ask.getByRole("button", { name: "Cancel" }).click();
  await expect(ask).toBeHidden();
  await expect(page.getByRole("button", { name: NAME })).toBeFocused();
  expect(await log(page, "deleted")).toBe(0);
});

test("a click with no press behind it asks", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: NAME }).dispatchEvent("click");
  await expect(confirmation(page)).toBeVisible();
  expect(await log(page, "deleted")).toBe(0);
});

for (const key of ["Enter", "Space"]) {
  test(`${key} held runs it once, despite key repeat`, async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: NAME }).focus();
    await page.keyboard.down(key);
    // A key held down repeats.
    await page.keyboard.down(key);
    await page.keyboard.down(key);
    await page.clock.runFor(FULL);
    await page.keyboard.up(key);
    await page.clock.runFor(FULL);
    expect(await log(page, "deleted")).toBe(1);
    await expect(confirmation(page)).toHaveCount(0);
  });
}

test("moving off the button cancels the hold", async ({ page }) => {
  await open(page);
  const { x, y } = await centre(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.clock.runFor(HALF);
  await page.mouse.move(x, y + 200);
  await page.clock.runFor(FULL);
  await page.mouse.up();
  await page.clock.runFor(FULL);
  expect(await log(page, "deleted")).toBe(0);
  await expect(confirmation(page)).toHaveCount(0);
});

test("a hold while it asks closes the question and runs once", async ({
  page,
}) => {
  await open(page);
  await press(page, TAP);
  await expect(confirmation(page)).toBeVisible();
  await press(page, FULL);
  await expect(confirmation(page)).toHaveCount(0);
  expect(await log(page, "deleted")).toBe(1);
});

test("a form's submit button sends it only once held or confirmed", async ({
  page,
}) => {
  await open(page);
  const send = "Hold to send report";
  await press(page, TAP, send);
  const ask = confirmation(page, "Send report?");
  await expect(ask).toBeVisible();
  expect(await log(page, "submitted")).toBe(0);
  await ask.getByRole("button", { name: "Send report" }).click();
  expect(await log(page, "submitted")).toBe(1);
  await press(page, FULL, send);
  expect(await log(page, "submitted")).toBe(2);
});

test("its box keeps its size while held", async ({ page }) => {
  await open(page);
  const button = page.getByRole("button", { name: NAME });
  const rest = await button.boundingBox();
  const { x, y } = await centre(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.clock.runFor(HALF);
  expect(await button.boundingBox()).toEqual(rest);
  await page.mouse.up();
});

test("an agent's press waits for the person's yes", async ({ page }) => {
  await open(page);
  await page.clock.resume();
  const agent = async (yes: boolean) =>
    await page.evaluate(
      async ({ name, allow }) => {
        window.damskoAgentYes = allow;
        const result = await window.damskoAgent?.act({
          steps: [{ ref: name, action: "press", args: ["Delete draft"] }],
        });
        return result?.ok === true;
      },
      { name: NAME, allow: yes }
    );
  expect(await agent(false)).toBe(false);
  expect(await log(page, "deleted")).toBe(0);
  expect(await agent(true)).toBe(true);
  await expect.poll(async () => await log(page, "deleted")).toBe(1);
});
