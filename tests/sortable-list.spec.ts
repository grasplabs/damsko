import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { listenToLiveRegions, openExample, settled, tab } from "./example.ts";

/** The last thing said in the page's live regions. */
const lastSaid = async (said: () => Promise<string[]>) => {
  const all = await said();
  return all.at(-1);
};

/** The items' words, in the order the list shows them. */
const orderOf = async (list: Locator) =>
  await list.getByRole("listitem").allInnerTexts();

/** Presses and moves a pointer of a kind on a handle, as a person drags it: down by `by` pixels. */
const drag = async (
  page: Page,
  handle: Locator,
  by: number,
  pointerType: "mouse" | "touch"
) => {
  const box = await handle.boundingBox();
  if (box === null) {
    throw new Error("the handle is not drawn");
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  if (pointerType === "mouse") {
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= 10; step += 1) {
      // oxlint-disable-next-line no-await-in-loop -- one move after the other, as a hand moves
      await page.mouse.move(x, y + (by * step) / 10);
    }
    await page.mouse.up();
    return;
  }
  // A finger: the pointer events a touch screen sends, from the handle.
  await handle.dispatchEvent("pointerdown", {
    pointerId: 7,
    pointerType: "touch",
    isPrimary: true,
    button: 0,
    buttons: 1,
    clientX: x,
    clientY: y,
  });
  for (let step = 1; step <= 10; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one move after the other, as a finger moves
    await page.evaluate(
      ([px, py]) => {
        document.dispatchEvent(
          new PointerEvent("pointermove", {
            pointerId: 7,
            pointerType: "touch",
            isPrimary: true,
            buttons: 1,
            clientX: px,
            clientY: py,
            bubbles: true,
          })
        );
      },
      [x, y + (by * step) / 10]
    );
    // oxlint-disable-next-line no-await-in-loop -- each move lands in a frame of its own
    await settled(page);
  }
  await page.evaluate(
    ([px, py]) => {
      document.dispatchEvent(
        new PointerEvent("pointerup", {
          pointerId: 7,
          pointerType: "touch",
          isPrimary: true,
          clientX: px,
          clientY: py,
          bubbles: true,
        })
      );
    },
    [x, y + by]
  );
};

test("from the keyboard: Space picks an item up, the arrows move it, Space puts it down, each said, and focus stays on its handle", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "sortable-list", "basic");
  const list = page.getByRole("list", { name: "Onboarding steps, in order" });
  const handle = page.getByRole("button", { name: "Move Its AI" });
  await expect(handle).toHaveAccessibleDescription(
    /Press Space or Enter to pick it up/u
  );
  await handle.focus();
  await page.keyboard.press("Space");
  await expect(handle).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(handle).not.toHaveAttribute("aria-pressed", "true");
  await expect(handle).toBeFocused();
  await expect
    .poll(async () => await orderOf(list))
    .toEqual(["Welcome", "Its people", "Its tools", "Its AI", "Review"]);
  await expect
    .poll(async () => await lastSaid(said))
    .toBe("Put Its AI down at position 4 of 5.");
  const steps = await said();
  expect(steps[0]).toBe("Picked up Its AI, position 2 of 5.");
  // The last place it was moved to is said before it is put down.
  expect(steps.at(-2)).toBe("Its AI, position 4 of 5.");

  // Home and End take it to either end.
  await page.keyboard.press("Enter");
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(list.getByRole("listitem").first()).toHaveText("Its AI");
});

test("a quick run of moves is said as where the item is now, never as every step after the fact", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "sortable-list", "basic");
  await page.getByRole("button", { name: "Move Welcome" }).focus();
  await page.keyboard.press("Space");
  for (let step = 0; step < 4; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other, as fast as a person
    await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.press("Space");
  await expect
    .poll(async () => await lastSaid(said))
    .toBe("Put Welcome down at position 5 of 5.");
  const steps = await said();
  expect(steps[0]).toBe("Picked up Welcome, position 1 of 5.");
  expect(steps.at(-2)).toBe("Welcome, position 5 of 5.");
  // Four moves waited behind the pick up: each took the place of the one before it.
  expect(steps.length).toBeLessThan(6);
});

// UI SDK's auto-scroll moves at most 18px a frame, slower the shallower the pointer is in an
// edge's band.
const mostAFrame = 18;

/** Where a list is scrolled: the page, at a window too short for it, or a box of its own. */
const scrollers = [
  {
    name: "the page",
    example: "basic",
    list: "Onboarding steps, in order",
    viewport: { width: 390, height: 140 },
  },
  {
    name: "its box",
    example: "scrolling",
    list: "Columns, in order",
    viewport: { width: 390, height: 600 },
  },
] as const;

/** A hand on a handle: pressed, moved to a height in steps, then lifted. */
interface Hand {
  moveTo: (y: number) => Promise<void>;
  lift: () => Promise<void>;
}

/** Presses a handle with a mouse, or with a real finger (Chromium's touch input). */
const pressWith = async (
  page: Page,
  handle: Locator,
  pointer: "mouse" | "finger"
): Promise<Hand> => {
  const box = await handle.boundingBox();
  if (box === null) {
    throw new Error("the handle is not drawn");
  }
  const x = box.x + box.width / 2;
  let y = box.y + box.height / 2;
  const steps = async (to: number, step: (at: number) => Promise<void>) => {
    const from = y;
    for (let index = 1; index <= 10; index += 1) {
      // oxlint-disable-next-line no-await-in-loop -- one move after the other, as a hand moves
      await step(from + ((to - from) * index) / 10);
    }
    y = to;
  };
  if (pointer === "mouse") {
    await page.mouse.move(x, y);
    await page.mouse.down();
    return {
      moveTo: async (to) => {
        await steps(to, async (at) => {
          await page.mouse.move(x, at);
        });
      },
      lift: async () => {
        await page.mouse.up();
      },
    };
  }
  const session = await page.context().newCDPSession(page);
  const touch = async (
    type: "touchStart" | "touchMove" | "touchEnd",
    at: number
  ) => {
    await session.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y: at }],
    });
  };
  await touch("touchStart", y);
  return {
    moveTo: async (to) => {
      await steps(to, async (at) => {
        await touch("touchMove", at);
      });
    },
    lift: async () => {
      await touch("touchEnd", y);
    },
  };
};

/**
 * Opens a scroller's example at its end or its start and starts keeping, every frame, how far
 * what scrolls the list is scrolled and how tall it is. Returns the list, its edges on screen,
 * its greatest scroll and what reads the frames.
 */
const watchScroll = async (
  page: Page,
  where: (typeof scrollers)[number],
  at: "start" | "end"
) => {
  await page.setViewportSize(where.viewport);
  await openExample(page, "sortable-list", where.example);
  const list = page.getByRole("list", { name: where.list });
  const found = await list.evaluate((element, end) => {
    let node = element.parentElement;
    while (
      node !== null &&
      !/auto|scroll/u.test(getComputedStyle(node).overflowY)
    ) {
      node = node.parentElement;
    }
    const scroller =
      node ?? document.scrollingElement ?? document.documentElement;
    const greatest = scroller.scrollHeight - scroller.clientHeight;
    scroller.scrollTop = end === "end" ? greatest : 0;
    const frames: [number, number][] = [];
    window.scrollFrames = frames;
    const keep = () => {
      frames.push([scroller.scrollTop, scroller.scrollHeight]);
      requestAnimationFrame(keep);
    };
    keep();
    window.addEventListener(
      "keydown",
      () => {
        window.scrollAtKey = scroller.scrollTop;
      },
      { capture: true }
    );
    const rect =
      node === null
        ? { top: 0, bottom: innerHeight }
        : node.getBoundingClientRect();
    return {
      greatest,
      top: Math.max(0, rect.top),
      bottom: Math.min(innerHeight, rect.bottom),
    };
  }, at);
  const frames = async () =>
    await page.evaluate(() => window.scrollFrames ?? []);
  // How far it is scrolled now.
  const scrolled = async () => {
    const all = await frames();
    return all.at(-1)?.[0] ?? 0;
  };
  return { list, ...found, frames, scrolled };
};

declare global {
  interface Window {
    /** Each frame's scroll and height of what scrolls a list (`watchScroll`). */
    scrollFrames?: [number, number][];
    /** Where it was scrolled when a key went down. */
    scrollAtKey?: number;
  }
}

/** The most a scroll moved from one frame to the next. */
const fastest = (frames: [number, number][]) =>
  Math.max(
    0,
    ...frames
      .slice(1)
      .map(([top], index) => Math.abs(top - (frames[index]?.[0] ?? top)))
  );

for (const where of scrollers) {
  for (const pointer of ["mouse", "finger"] as const) {
    for (const edge of ["bottom", "top"] as const) {
      test(`a drag held at the ${edge} edge of ${where.name} scrolls it at most ${mostAFrame}px a frame, to its end and no further, and makes nothing taller, by a ${pointer}`, async ({
        page,
      }) => {
        const down = edge === "bottom";
        const watched = await watchScroll(page, where, down ? "start" : "end");
        const items = watched.list.getByRole("listitem");
        const item = down ? items.first() : items.last();
        const name = await item.textContent();
        const hand = await pressWith(page, item.getByRole("button"), pointer);
        await hand.moveTo(down ? watched.bottom - 3 : watched.top + 3);
        // Held there for two seconds, as a person waits for the list to come.
        await page.waitForTimeout(2000);
        const frames = await watched.frames();
        const [, height] = frames[0] ?? [0, 0];
        expect(fastest(frames)).toBeLessThanOrEqual(mostAFrame);
        expect(Math.max(...frames.map(([top]) => top))).toBeLessThanOrEqual(
          watched.greatest
        );
        expect(Math.min(...frames.map(([top]) => top))).toBeGreaterThanOrEqual(
          0
        );
        expect(frames.every(([, tall]) => tall === height)).toBe(true);
        expect(frames.at(-1)?.[0]).toBeCloseTo(down ? watched.greatest : 0, 0);
        await hand.lift();
        await expect(down ? items.last() : items.first()).toHaveText(
          name ?? ""
        );
      });
    }

    test(`Escape during a drag at an edge of ${where.name} stops its scroll within a frame, by a ${pointer}`, async ({
      page,
    }) => {
      const watched = await watchScroll(page, where, "start");
      const items = watched.list.getByRole("listitem");
      const hand = await pressWith(
        page,
        items.first().getByRole("button"),
        pointer
      );
      // Just inside the edge's band, so it scrolls slowly and is far from its end at Escape.
      const band = Math.min(48, (watched.bottom - watched.top) / 3);
      await hand.moveTo(watched.bottom - band + 4);
      await expect.poll(watched.scrolled).toBeGreaterThan(0);
      await page.keyboard.press("Escape");
      const atKey = await page.evaluate(() => window.scrollAtKey ?? 0);
      expect(atKey).toBeLessThan(watched.greatest);
      await page.waitForTimeout(500);
      const now = await watched.scrolled();
      expect(Math.abs(now - atKey)).toBeLessThanOrEqual(mostAFrame);
      await hand.lift();
      await expect(items.first().getByRole("button")).not.toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });
  }
}

test("Escape puts a moved item back where it was, and Tab does too and moves on", async ({
  browserName,
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "sortable-list", "basic");
  const list = page.getByRole("list", { name: "Onboarding steps, in order" });
  const before = await orderOf(list);
  await page.getByRole("button", { name: "Move Welcome" }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect.poll(async () => await orderOf(list)).toEqual(before);
  await expect
    .poll(async () => {
      const all = await said();
      return all.at(-1);
    })
    .toBe("Put Welcome back at position 1 of 5.");

  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press(tab(browserName));
  await expect.poll(async () => await orderOf(list)).toEqual(before);
  await expect(page.getByRole("button", { name: "Move Its AI" })).toBeFocused();
});

test("a pointer drags an item by its handle to a new place", async ({
  page,
}) => {
  await openExample(page, "sortable-list", "basic");
  const list = page.getByRole("list", { name: "Onboarding steps, in order" });
  const handle = page.getByRole("button", { name: "Move Welcome" });
  const first = await list.getByRole("listitem").nth(0).boundingBox();
  const second = await list.getByRole("listitem").nth(1).boundingBox();
  // From one item's top to the next one's: an item and the gap after it.
  const row = (second?.y ?? 36) - (first?.y ?? 0);
  await drag(page, handle, row * 2.5, "mouse");
  await expect
    .poll(async () => await orderOf(list))
    .toEqual(["Its AI", "Its people", "Welcome", "Its tools", "Review"]);
});

test("a press with no drag picks an item up and a second puts it down, as a screen reader's activation does", async ({
  page,
}) => {
  await openExample(page, "sortable-list", "basic");
  const list = page.getByRole("list", { name: "Onboarding steps, in order" });
  const handle = page.getByRole("button", { name: "Move Its people" });
  await handle.click();
  await expect(handle).toHaveAttribute("aria-pressed", "true");
  // Focus is on the handle after a click in every engine (WebKit gives a clicked button none), so
  // the arrows move the item.
  await expect(handle).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await handle.click();
  await expect(handle).not.toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => await orderOf(list))
    .toEqual(["Welcome", "Its people", "Its AI", "Its tools", "Review"]);

  // A press on another handle while one item is up puts that one back and picks this one up.
  const review = page.getByRole("button", { name: "Move Review" });
  await handle.click();
  await page.keyboard.press("ArrowDown");
  await review.click();
  await expect(handle).not.toHaveAttribute("aria-pressed", "true");
  await expect(review).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => await orderOf(list))
    .toEqual(["Welcome", "Its people", "Its AI", "Its tools", "Review"]);
});

test("a finger on a handle drags its item", async ({ page }) => {
  await openExample(page, "sortable-list", "basic");
  const list = page.getByRole("list", { name: "Onboarding steps, in order" });
  const first = await list.getByRole("listitem").nth(0).boundingBox();
  const second = await list.getByRole("listitem").nth(1).boundingBox();
  // From one item's top to the next one's: an item and the gap after it.
  const row = (second?.y ?? 36) - (first?.y ?? 0);
  await drag(
    page,
    page.getByRole("button", { name: "Move Review" }),
    -row * 1.5,
    "touch"
  );
  await expect
    .poll(async () => await orderOf(list))
    .toEqual(["Welcome", "Its AI", "Its people", "Review", "Its tools"]);
});

test("an item's own controls keep their keys: Space turns a switch, a space typed in a field is a space", async ({
  page,
}) => {
  await openExample(page, "sortable-list", "controls");
  const list = page.getByRole("list", { name: "Steps, in order" });
  const before = await orderOf(list);
  const people = page.getByRole("switch", { name: "Its people" });
  await people.focus();
  await page.keyboard.press("Space");
  await expect(people).toBeChecked();
  await expect.poll(async () => await orderOf(list)).toEqual(before);

  // The item's name for a screen reader is its textValue, not every word in it.
  const said = await listenToLiveRegions(page);
  await openExample(page, "sortable-list", "fields");
  const field = page.getByRole("textbox", { name: "Option 1" });
  await field.fill("");
  await page.keyboard.type("To do now");
  await expect(field).toHaveValue("To do now");
  await page.getByRole("button", { name: "Move To do now" }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(page.getByRole("textbox", { name: "Option 2" })).toHaveValue(
    "To do now"
  );
  await expect
    .poll(async () => {
      const all = await said();
      return all.at(0);
    })
    .toBe("Picked up To do now, position 1 of 3.");
});

test("an item that cannot be picked up stays down and the others move past it; a list out of use moves nothing", async ({
  page,
}) => {
  await openExample(page, "sortable-list", "disabled");
  const playlist = page.getByRole("list", { name: "Playlist", exact: true });
  await expect(
    playlist.getByRole("button", { name: "Move Intro" })
  ).toBeDisabled();
  await playlist.getByRole("button", { name: "Move Morning" }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Space");
  await expect
    .poll(async () => await orderOf(playlist))
    .toEqual(["Morning", "Intro", "Noon", "Evening"]);
  const published = page.getByRole("list", { name: "Published playlist" });
  for (const handle of await published.getByRole("button").all()) {
    // oxlint-disable-next-line no-await-in-loop -- one handle after the other
    await expect(handle).toBeDisabled();
  }
});

test("right to left, the handle stands at the line's start and Down still moves an item down", async ({
  page,
}) => {
  await openExample(page, "sortable-list", "rtl");
  const list = page.getByRole("list", { name: "الخطوات" });
  const first = list.getByRole("listitem").first();
  const handle = first.getByRole("button");
  const handleBox = await handle.boundingBox();
  const itemBox = await first.boundingBox();
  expect((handleBox?.x ?? 0) + (handleBox?.width ?? 0)).toBeGreaterThan(
    (itemBox?.x ?? 0) + (itemBox?.width ?? 0) - 40
  );
  const before = await orderOf(list);
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect
    .poll(async () => await orderOf(list))
    .toEqual([before[1], before[0], before[2]]);
});
