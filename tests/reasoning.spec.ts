import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { fixedTime, hasFocusRing, openExample } from "./example.ts";

test("its line opens and closes the thoughts, and says so with aria-expanded", async ({
  page,
}) => {
  await openExample(page, "reasoning", "basic");
  const line = page.getByRole("button", { name: "Thought for 6 seconds" });
  const thoughts = page.getByText("Reading the question", { exact: true });
  await expect(line).toHaveAttribute("aria-expanded", "false");
  await expect(thoughts).toBeHidden();

  await line.click();
  await expect(line).toHaveAttribute("aria-expanded", "true");
  await expect(thoughts).toBeVisible();

  await line.click();
  await expect(line).toHaveAttribute("aria-expanded", "false");
  await expect(thoughts).toBeHidden();
});

test("the keyboard reaches its line with a ring; Enter opens and Space closes", async ({
  page,
}) => {
  await openExample(page, "reasoning", "basic");
  const line = page.getByRole("button", { name: "Thought for 6 seconds" });
  await line.focus();
  await page.keyboard.press("Enter");
  await expect(line).toHaveAttribute("aria-expanded", "true");
  expect(await hasFocusRing(line)).toBe(true);
  await page.keyboard.press("Space");
  await expect(line).toHaveAttribute("aria-expanded", "false");
  await expect(line).toBeFocused();
});

test("the line says how long it thought, a second or more", async ({
  page,
}) => {
  await openExample(page, "reasoning", "states");
  await expect(
    page.getByRole("button", { name: "Thought for 1 second", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Thought for 14 seconds" })
  ).toBeVisible();
  const thinking = page.getByRole("button", { name: "Thinking" });
  await expect(thinking).toHaveAttribute("aria-expanded", "true");
});

test("a thought whose time is not known says Thought, not Thinking", async ({
  page,
}) => {
  await openExample(page, "reasoning", "states");
  await expect(
    page.getByRole("button", { name: "Thought", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Thinking" })).toHaveCount(1);
});

// The live example streams its thoughts for three seconds. The clock is held still and moved on
// by hand, so each moment is looked at exactly.
const openLive = async (page: Page) => {
  await openExample(page, "reasoning", "live", { time: fixedTime });
  await page.clock.pauseAt(new Date(fixedTime.getTime() + 60_000));
};

// Moves the clock on a tick at a time: each tick's render sets the next tick's timer.
const pass = async (page: Page, ms: number) => {
  for (let at = 0; at < ms; at += 50) {
    // oxlint-disable-next-line no-await-in-loop -- one tick after another
    await page.clock.runFor(50);
  }
};

const settled = /^Thought for \d+ seconds$/u;

test("it opens while it thinks, then settles into how long it took and closes", async ({
  page,
}) => {
  await openLive(page);
  await page.getByRole("button", { name: "Think" }).click();
  await pass(page, 100);
  const thinking = page.getByRole("button", { name: "Thinking" });
  await expect(thinking).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("status")).toHaveText("Thinking");

  await pass(page, 3200);
  const done = page.getByRole("button", { name: settled });
  await expect(done).toHaveAttribute("aria-expanded", "true");
  await pass(page, 1000);
  await expect(done).toHaveAttribute("aria-expanded", "false");
  // The thoughts themselves are never read out: only that thinking started.
  await expect(page.getByRole("status")).toHaveText("Thinking");
});

test("the person's own choice wins over opening and closing by itself", async ({
  page,
}) => {
  await openLive(page);
  const think = page.getByRole("button", { name: "Think" });
  const thinking = page.getByRole("button", { name: "Thinking" });
  const done = page.getByRole("button", { name: settled });

  // Closed while it thinks: it stays closed.
  await think.click();
  await thinking.click();
  await expect(thinking).toHaveAttribute("aria-expanded", "false");
  await pass(page, 6000);
  await expect(done).toHaveAttribute("aria-expanded", "false");

  // Closed and opened again while it thinks: it stays open once it ends.
  await think.click();
  await thinking.click();
  await thinking.click();
  await expect(thinking).toHaveAttribute("aria-expanded", "true");
  await pass(page, 6000);
  await expect(done).toHaveAttribute("aria-expanded", "true");
});

test("with reduced motion nothing travels: the thoughts open at once", async ({
  page,
}) => {
  await openExample(page, "reasoning", "basic");
  const line = page.getByRole("button", { name: "Thought for 6 seconds" });
  await line.click();
  await expect(line).toHaveAttribute("aria-expanded", "true");
  // Colour may still change at once on hover; nothing grows, turns or sweeps.
  const moving = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            !(
              animation instanceof CSSTransition &&
              animation.transitionProperty === "background-color"
            )
        ).length
  );
  expect(moving).toBe(0);
});

test("with reduced motion the thinking line does not sweep", async ({
  page,
}) => {
  await openExample(page, "reasoning", "states");
  await expect(page.getByRole("button", { name: "Thinking" })).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("the thoughts open drawn as Markdown: a list stays a list", async ({
  page,
}) => {
  await openExample(page, "reasoning", "basic");
  await page.getByRole("button", { name: "Thought for 6 seconds" }).click();
  const list = page.getByRole("list");
  await expect(list).toBeVisible();
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(page.getByText("refund_window", { exact: true })).toBeVisible();
});
