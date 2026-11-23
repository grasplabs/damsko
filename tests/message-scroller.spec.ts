import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { listenToLiveRegions, liveRegion, openExample } from "./example.ts";

// How far the log is scrolled from its top, how far it stands from its end, and how tall its
// rows are, in pixels.
const topOf = async (log: Locator): Promise<number> =>
  await log.evaluate((node) => node.scrollTop);
const gapOf = async (log: Locator): Promise<number> =>
  await log.evaluate(
    (node) => node.scrollHeight - node.clientHeight - node.scrollTop
  );
const heightOf = async (log: Locator): Promise<number> =>
  await log.evaluate((node) => node.scrollHeight);

const theLog = (page: Page) =>
  page.getByRole("log", { name: /^Conversation with the/u });

const wheelUp = async (page: Page, log: Locator, by: number) => {
  const box = await log.boundingBox();
  if (box === null) {
    throw new Error("the log is not on the page");
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -by);
};

test("it starts at the end and follows the answer as it grows", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "live");
  const log = theLog(page);
  await expect(log).toBeVisible();
  // The answer streams in: the log grows, and stays at its end while it does.
  await expect
    .poll(async () => await topOf(log), { timeout: 10_000 })
    .toBeGreaterThan(0);
  const first = await heightOf(log);
  await expect
    .poll(async () => await heightOf(log), { timeout: 10_000 })
    .toBeGreaterThan(first + 40);
  expect(await gapOf(log)).toBeLessThanOrEqual(2);
  await expect(
    page.getByRole("button", { name: /Jump to latest/u })
  ).toHaveCount(0);
});

test("scrolled up it stays put while the answer grows; Jump to latest brings it back to the end", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "live");
  const log = theLog(page);
  // Wait until there is room to scroll, then scroll up while the answer streams.
  await expect
    .poll(async () => await topOf(log), { timeout: 10_000 })
    .toBeGreaterThan(80);
  await wheelUp(page, log, 60);
  const jump = page.getByRole("button", { name: /Jump to latest/u });
  await expect(jump).toBeVisible();
  const left = await topOf(log);
  const leftHeight = await heightOf(log);
  // The answer goes on growing; the reader's place does not move.
  await expect
    .poll(async () => await heightOf(log), { timeout: 10_000 })
    .toBeGreaterThan(leftHeight + 20);
  expect(Math.abs((await topOf(log)) - left)).toBeLessThanOrEqual(1);

  await jump.click();
  await expect.poll(async () => await gapOf(log)).toBeLessThanOrEqual(2);
  await expect(jump).toBeHidden();
  // Focus goes to the log, not the page, as the button goes.
  await expect(log).toBeFocused();
  // And it follows again.
  const back = await heightOf(log);
  await expect
    .poll(async () => await heightOf(log), { timeout: 10_000 })
    .not.toBe(back);
  expect(await gapOf(log)).toBeLessThanOrEqual(2);
});

test("the keyboard reaches the log and scrolls it; a key up releases it", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "live");
  const log = theLog(page);
  await expect
    .poll(async () => await topOf(log), { timeout: 10_000 })
    .toBeGreaterThan(80);
  await log.focus();
  await expect(log).toBeFocused();
  await page.keyboard.press("PageUp");
  await expect(
    page.getByRole("button", { name: /Jump to latest/u })
  ).toBeVisible();
  await expect.poll(async () => await gapOf(log)).toBeGreaterThan(20);
});

test("what the reader is reading stays in place while the answer under it streams", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "live");
  const log = theLog(page);
  await expect
    .poll(async () => await topOf(log), { timeout: 10_000 })
    .toBeGreaterThan(120);
  await wheelUp(page, log, 100);
  const read = page.getByText("Why did the north improve?", { exact: true });
  await expect(read).toBeInViewport();
  const before = await read.boundingBox();
  const left = await heightOf(log);
  await expect
    .poll(async () => await heightOf(log), { timeout: 10_000 })
    .toBeGreaterThan(left + 20);
  const after = await read.boundingBox();
  expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThanOrEqual(1);
});

test("the browser's own scrollbar never shows", async ({ page }) => {
  await openExample(page, "message-scroller", "live");
  expect(
    await theLog(page).evaluate((node) => getComputedStyle(node).scrollbarWidth)
  ).toBe("none");
});

test("an edge with rows past it fades: the top at the end, both in the middle, the foot at the top", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "live");
  const log = theLog(page);
  // Which edges the log's mask clears: its first stop is the top, its last the foot.
  const faded = async () =>
    await log.evaluate((node) => {
      const mask = getComputedStyle(node).maskImage;
      if (!mask.includes("gradient")) {
        return "none";
      }
      const stops = mask
        .slice(mask.indexOf("(") + 1, -1)
        .split(/,(?![^(]*\))/u)
        .filter((stop) => !stop.trim().startsWith("to "));
      const clear = /transparent|rgba\(0, 0, 0, 0\)/u;
      const top = clear.test(stops.at(0) ?? "");
      const foot = clear.test(stops.at(-1) ?? "");
      if (top && foot) {
        return "both";
      }
      if (top) {
        return "top";
      }
      return foot ? "foot" : "none";
    });
  await expect
    .poll(async () => await topOf(log), { timeout: 10_000 })
    .toBeGreaterThan(80);
  await expect.poll(faded).toBe("top");
  await wheelUp(page, log, 40);
  await expect.poll(faded).toBe("both");
  await log.evaluate((node) => {
    node.scrollTop = 0;
  });
  await expect.poll(faded).toBe("foot");
});

test("the sent turn goes to the top, and the answer grows into the room under it", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "answer");
  const log = theLog(page);
  const sent = page.getByText("Why did the north improve?", { exact: true });
  await expect(sent).toBeVisible({ timeout: 5000 });
  const sentTop = async () => {
    const view = await log.boundingBox();
    const turn = await sent.boundingBox();
    return (turn?.y ?? 0) - (view?.y ?? 0);
  };
  // Below the top's fade, near the top of the view.
  await expect.poll(sentTop, { timeout: 5000 }).toBeLessThan(110);
  const settled = await sentTop();
  expect(settled).toBeGreaterThan(0);
  // The answer begins under it, and the sent turn stays where it is.
  await expect(page.getByText(/^Mostly the guided/u)).toBeVisible({
    timeout: 5000,
  });
  expect(Math.abs((await sentTop()) - settled)).toBeLessThanOrEqual(2);
});

test("named by the chat's heading, and nothing in the console says it has no name", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  await openExample(page, "message-scroller", "named");
  const heading = await page.getByRole("heading").first().textContent();
  await expect(page.getByRole("log")).toHaveAccessibleName(heading ?? "");
  expect(errors.filter((text) => /name/u.test(text))).toEqual([]);
});

test("while an old chat loads the log is busy, and then stands at its latest turn", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "loading");
  const log = theLog(page);
  await expect(log).toHaveAttribute("aria-busy", "true");
  await expect(log).not.toHaveAttribute("aria-busy", "true", {
    timeout: 5000,
  });
  await expect.poll(async () => await gapOf(log)).toBeLessThanOrEqual(2);
});

test("a long conversation opens at its latest turn and scrolls back to its first", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "long");
  const log = page.getByRole("log", { name: "A long conversation" });
  await expect(log.getByText("(500)")).toBeInViewport();
  await log.evaluate((node) => {
    node.scrollTop = 0;
  });
  await expect(log.getByText("(1)", { exact: false }).first()).toBeInViewport();
});

test("sending and its answer say 1 new message: the person's own turn is not news", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "message-scroller", "script");
  await page.evaluate(() => {
    window.messageScrollerScript?.send();
  });
  await page.evaluate(() => {
    window.messageScrollerScript?.answer("The north changed its first week.");
  });
  await expect(liveRegion(page)).toHaveText("1 new message");
  await page.evaluate(() => {
    window.messageScrollerScript?.answer(
      "The north changed its first week, and its renewals rose."
    );
  });
  await expect(
    page.getByText("The north changed its first week, and its renewals rose.")
  ).toBeVisible();
  // Streaming words are never news: the next turn sent and answered is one more.
  await page.evaluate(() => {
    window.messageScrollerScript?.send();
  });
  await page.evaluate(() => {
    window.messageScrollerScript?.answer("And the south did not.");
  });
  await expect.poll(said).toStrictEqual(["1 new message", "1 new message"]);
});

test("older turns drawn above, as the reader reads back, are not news", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "message-scroller", "script");
  await page.evaluate(() => {
    window.messageScrollerScript?.send();
  });
  await page.evaluate(() => {
    window.messageScrollerScript?.answer("The north changed its first week.");
  });
  await expect(liveRegion(page)).toHaveText("1 new message");
  await page.evaluate(() => {
    window.messageScrollerScript?.older();
  });
  await expect(page.getByText(/^An older turn/u).first()).toBeAttached();
  await page.evaluate(() => {
    window.messageScrollerScript?.send();
  });
  await page.evaluate(() => {
    window.messageScrollerScript?.answer("And the south did not.");
  });
  await expect.poll(said).toStrictEqual(["1 new message", "1 new message"]);
});

test("the sent turn keeps its place at the top when the turns above it change height", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "script");
  const log = theLog(page);
  await page.evaluate(() => {
    window.messageScrollerScript?.send();
  });
  const sent = page.getByText("And what changed in the north?");
  const sentTop = async () => {
    const view = await log.boundingBox();
    const turn = await sent.boundingBox();
    return (turn?.y ?? 0) - (view?.y ?? 0);
  };
  await expect.poll(sentTop).toBeLessThan(110);
  const settled = await sentTop();
  // A narrower window wraps the turns above onto more lines.
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => Math.abs((await sentTop()) - settled))
    .toBeLessThanOrEqual(2);
});

test("a saved chat opens at its last question, with the answer under it", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "opening");
  const log = theLog(page);
  const question = log.getByText("Why did the north improve?", {
    exact: true,
  });
  await expect(question).toBeInViewport();
  // Not the very bottom: the answer runs on below the view.
  await expect.poll(async () => await gapOf(log)).toBeGreaterThan(20);
  await expect(
    page.getByRole("button", { name: /Jump to latest/u })
  ).toBeVisible();
});

test("a control outside the log jumps to a turn, and says which turn is being read", async ({
  page,
}) => {
  await openExample(page, "message-scroller", "jump");
  const log = theLog(page);
  const first = page.getByRole("button", {
    name: "Where do new teams stop during setup?",
  });
  await first.click();
  await expect(
    log.getByText("Where do new teams stop during setup?")
  ).toBeInViewport();
  await expect(first).toHaveAttribute("aria-pressed", "true");
  // At the first turn there is nothing above: no way to the start; the way down shows.
  await expect(page.getByRole("button", { name: "Jump to start" })).toHaveCount(
    0
  );
  await page.getByRole("button", { name: /Jump to latest/u }).click();
  await expect.poll(async () => await gapOf(log)).toBeLessThanOrEqual(2);
  await page.getByRole("button", { name: "Jump to start" }).click();
  await expect.poll(async () => await topOf(log)).toBeLessThanOrEqual(2);
});

test("earlier messages load above without moving what is being read, and are not news", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "message-scroller", "history");
  const log = theLog(page);
  await wheelUp(page, log, 120);
  const read = log.getByText(/^Question 13:/u);
  await expect(read).toBeInViewport();
  const before = await read.boundingBox();
  await page.getByRole("button", { name: "Load earlier messages" }).click();
  await expect(log.getByText(/^Question 10:/u)).toBeAttached();
  const after = await read.boundingBox();
  expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThanOrEqual(1);
  expect(await said()).toStrictEqual([]);
});

for (const [where, by] of [
  ["away from the end", 120],
  ["at the very top", 2000],
] as const) {
  test(`a log that follows its end holds what is being read ${where} when earlier messages load, and stays there`, async ({
    page,
  }) => {
    await openExample(page, "message-scroller", "history-following");
    const log = theLog(page);
    await wheelUp(page, log, by);
    const read = log.getByText(/^Question 13:/u);
    await expect(read).toBeInViewport();
    const before = await read.boundingBox();
    await page.getByRole("button", { name: "Load earlier messages" }).click();
    await expect(log.getByText(/^Question 10:/u)).toBeAttached();
    await expect
      .poll(async () => {
        const after = await read.boundingBox();
        return Math.abs((after?.y ?? 0) - (before?.y ?? 0));
      })
      .toBeLessThanOrEqual(1);
    // It has not gone back to following the end.
    await expect(
      page.getByRole("button", { name: /Jump to latest/u })
    ).toBeVisible();
  });
}

test("another conversation swapped into the same log is opened afresh: none of its turns is news", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "message-scroller", "script");
  await page.evaluate(() => {
    window.messageScrollerScript?.other();
  });
  const log = theLog(page);
  await expect(log.getByText("Another chat, turn 39.")).toBeInViewport();
  await page.evaluate(() => {
    window.messageScrollerScript?.send();
  });
  await page.evaluate(() => {
    window.messageScrollerScript?.answer("The north changed its first week.");
  });
  await expect.poll(said).toStrictEqual(["1 new message"]);
});
