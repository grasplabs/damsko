import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { listenToLiveRegions, openExample, settled } from "./example.ts";

// WebKit on a Mac moves Tab only between fields unless Option is held.
const tab = (browserName: string) =>
  browserName === "webkit" ? "Alt+Tab" : "Tab";

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

test("a drag near the window's edge scrolls it, so an item goes past what one screen shows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 140 });
  await openExample(page, "sortable-list", "basic");
  const list = page.getByRole("list", { name: "Onboarding steps, in order" });
  const handle = page.getByRole("button", { name: "Move Welcome" });
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  const x = (box?.x ?? 0) + (box?.width ?? 0) / 2;
  const y = (box?.y ?? 0) + (box?.height ?? 0) / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 1; step <= 10; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one move after the other, as a hand moves
    await page.mouse.move(x, y + ((136 - y) * step) / 10);
  }
  // Held at the bottom edge, the page scrolls on to its end and the item goes with it.
  await expect
    .poll(async () => await page.evaluate(() => scrollY))
    .toBeGreaterThan(0);
  await expect
    .poll(
      async () =>
        await page.evaluate(
          () =>
            scrollY + innerHeight >= document.documentElement.scrollHeight - 1
        )
    )
    .toBe(true);
  await page.mouse.move(x, 138);
  await page.mouse.up();
  await expect(list.getByRole("listitem").last()).toHaveText("Welcome");
});

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
