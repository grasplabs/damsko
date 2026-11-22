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
  const box = await page
    .getByRole("button", { name, exact: true })
    .boundingBox();
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

test("a short click runs nothing and opens nothing", async ({ page }) => {
  await open(page);
  await press(page, TAP);
  expect(await log(page, "deleted")).toBe(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.clock.resume();
  await page.getByRole("button", { name: NAME }).click();
  expect(await log(page, "deleted")).toBe(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a tap of a key asks with the button's words and Cancel", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: NAME }).focus();
  await page.keyboard.press("Space");
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

test("Escape gives up a hold", async ({ page }) => {
  await open(page);
  const { x, y } = await centre(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.clock.runFor(HALF);
  await page.keyboard.press("Escape");
  await page.clock.runFor(FULL);
  await page.mouse.up();
  await page.clock.runFor(FULL);
  expect(await log(page, "deleted")).toBe(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a hold while it asks closes the question and runs once", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: NAME }).dispatchEvent("click");
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
  await page.getByRole("button", { name: send }).dispatchEvent("click");
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

// What is drawn at a point of the page, as one pixel's picture: the same bytes, the same colour.
// Only ever compared with the same point at another moment: a gradient is dithered from point to
// point.
const drawnAt = async (page: Page, point: { x: number; y: number }) => {
  const picture = await page.screenshot({
    clip: { ...point, width: 1, height: 1 },
  });
  return picture.toString("base64");
};

/**
 * Points of the button: just inside its end edge, its top and its foot (where the fill arrives
 * late), at its start, and its four corners, which lie outside its rounded shape.
 */
const pointsOf = async (page: Page, name: string) => {
  const box = await page
    .getByRole("button", { name, exact: true })
    .boundingBox();
  if (box === null) {
    throw new Error(`${name} has no box`);
  }
  const left = Math.floor(box.x);
  const top = Math.floor(box.y);
  const right = Math.ceil(box.x + box.width) - 1;
  const bottom = Math.ceil(box.y + box.height) - 1;
  const middle = Math.round(box.y + box.height / 2);
  const late = Math.round(box.x + box.width * 0.75);
  return {
    start: { x: left + 4, y: middle },
    edges: [
      { x: right - 4, y: middle },
      { x: late, y: top + 3 },
      { x: late, y: bottom - 3 },
    ],
    corners: [
      { x: left, y: top },
      { x: right, y: top },
      { x: left, y: bottom },
      { x: right, y: bottom },
    ],
  };
};

/** Waits until nothing in the button moves: the fill has arrived, or has run back. */
const still = async (page: Page, name: string) => {
  await page
    .getByRole("button", { name, exact: true })
    .evaluate(async (button) => {
      await Promise.all(
        button
          .getAnimations({ subtree: true })
          .map(async (animation) => await animation.finished)
      );
    });
};

const all = async (page: Page, points: { x: number; y: number }[]) =>
  await Promise.all(points.map(async (point) => await drawnAt(page, point)));

for (const words of [
  "delete xs",
  "delete sm",
  "delete default",
  "delete lg",
  "delete icon-xs",
  "delete icon-sm",
  "delete icon",
  "delete icon-lg",
  "archive default",
  "archive outline",
  "archive secondary",
  "archive ghost",
  "archive link",
]) {
  test(`${words}: the fill reaches the button's edges and stays inside its corners`, async ({
    page,
  }) => {
    await openExample(page, "hold-button", "sizes", { time: fixedTime });
    // The page's clock stands still, so the hold never ends: the fill arrives and stays.
    await page.clock.pauseAt(new Date(fixedTime.getTime() + 1000));
    const name = `Hold to ${words}`;
    const { edges, corners } = await pointsOf(page, name);
    const { x, y } = await centre(page, name);
    // What lies outside the button's rounded shape: the page, or at rest its shadow on the page.
    const bare = await drawnAt(page, { x: 1, y: 1 });
    const around = await all(page, corners);
    await page.mouse.move(x, y);
    await page.mouse.down();
    // Held, and the fill not there yet; then it is, at the end edge, the top and the foot.
    const unfilled = await all(page, edges);
    await still(page, name);
    const filled = await all(page, edges);
    for (const [index, drawn] of filled.entries()) {
      expect(drawn).not.toBe(unfilled[index]);
    }
    // Outside the button's rounded shape nothing is drawn: its corners cut the fill.
    const held = await all(page, corners);
    for (const [index, drawn] of held.entries()) {
      expect([bare, around[index]]).toContain(drawn);
    }
    await page.mouse.up();
  });
}

for (const motion of ["reduce", "no-preference"] as const) {
  test(`let go early, the fill is gone again (motion: ${motion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: motion });
    await openExample(page, "hold-button", "sizes", { time: fixedTime });
    await page.clock.pauseAt(new Date(fixedTime.getTime() + 1000));
    const name = "Hold to delete lg";
    const { start } = await pointsOf(page, name);
    const { x, y } = await centre(page, name);
    await page.mouse.move(x, y);
    await still(page, name);
    const rest = await drawnAt(page, start);
    await page.mouse.down();
    // It fills with reduced motion too: the fill is the hold's timer.
    await still(page, name);
    expect(await drawnAt(page, start)).not.toBe(rest);
    await page.mouse.up();
    await expect.poll(async () => await drawnAt(page, start)).toBe(rest);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}

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
