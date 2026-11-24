import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { openExample } from "./example.ts";

test("a press turns it on and off, and says so", async ({ page }) => {
  await openExample(page, "toggle", "alone");
  const bold = page.getByRole("button", { name: "Bold" });
  const italic = page.getByRole("button", { name: "Italic" });
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  await expect(italic).toHaveAttribute("aria-pressed", "false");
  await italic.click();
  await expect(italic).toHaveAttribute("aria-pressed", "true");
  await bold.click();
  await expect(bold).toHaveAttribute("aria-pressed", "false");
});

test("Space and Enter turn it on and off from the keyboard", async ({
  page,
}) => {
  await openExample(page, "toggle", "words");
  const toggle = page.getByRole("button", { name: "Show archived" });
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});

test("in a group, one is pressed at a time, and the pressed one stays", async ({
  page,
}) => {
  await openExample(page, "toggle", "group");
  const group = page.getByRole("group", { name: "View" });
  const list = group.getByRole("button", { name: "List" });
  const board = group.getByRole("button", { name: "Board" });
  await expect(list).toHaveAttribute("aria-pressed", "true");
  await board.click();
  await expect(board).toHaveAttribute("aria-pressed", "true");
  await expect(list).toHaveAttribute("aria-pressed", "false");
  // `deselectable={false}`: a press on the pressed one keeps it on.
  await board.click();
  await expect(board).toHaveAttribute("aria-pressed", "true");
});

test("with `multiple`, each is pressed on its own", async ({ page }) => {
  await openExample(page, "toggle", "multiple");
  const group = page.getByRole("group", { name: "Text style" });
  const bold = group.getByRole("button", { name: "Bold" });
  const italic = group.getByRole("button", { name: "Italic" });
  await italic.click();
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  await expect(italic).toHaveAttribute("aria-pressed", "true");
  await bold.click();
  await expect(bold).toHaveAttribute("aria-pressed", "false");
  await expect(italic).toHaveAttribute("aria-pressed", "true");
});

test("a group is one tab stop, and the arrows move between its toggles", async ({
  page,
}) => {
  await openExample(page, "toggle", "group");
  const group = page.getByRole("group", { name: "View" });
  const list = group.getByRole("button", { name: "List" });
  const board = group.getByRole("button", { name: "Board" });
  const calendar = group.getByRole("button", { name: "Calendar" });
  await page.keyboard.press("Tab");
  await expect(list).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(board).toBeFocused();
  await page.keyboard.press("End");
  await expect(calendar).toBeFocused();
  // The arrows wrap.
  await page.keyboard.press("ArrowRight");
  await expect(list).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(calendar).toBeFocused();
  await page.keyboard.press("Space");
  await expect(calendar).toHaveAttribute("aria-pressed", "true");
  await expect(list).toHaveAttribute("aria-pressed", "false");
  // Out of the group in one step, and back in on the one it left.
  await page.keyboard.press("Shift+Tab");
  await expect(calendar).not.toBeFocused();
  await page.keyboard.press("Tab");
  await expect(calendar).toBeFocused();
});

test("out of use, alone or in a group, a press changes nothing", async ({
  page,
}) => {
  await openExample(page, "toggle", "disabled");
  const alone = page.getByRole("button", { name: "Show archived" });
  await expect(alone).toBeDisabled();
  await expect(alone).toHaveAttribute("aria-pressed", "true");
  const group = page.getByRole("group", { name: "View" });
  const board = group.getByRole("button", { name: "Board" });
  await board.click({ force: true });
  await expect(board).toHaveAttribute("aria-pressed", "false");
  await expect(group.getByRole("button", { name: "List" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

test("the outline variant is a toggle like any other", async ({ page }) => {
  await openExample(page, "toggle", "outline");
  const toggle = page.getByRole("button", { name: "Show archived" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});

/** The items' boxes against their track's, in the page's pixels. */
const fits = async (group: Locator) => {
  const track = await group.boundingBox();
  const boxes = [];
  for (const item of await group.getByRole("button").all()) {
    // oxlint-disable-next-line no-await-in-loop -- one item after the other
    boxes.push(await item.boundingBox());
  }
  const start = Math.min(...boxes.map((box) => box?.x ?? 0));
  const end = Math.max(
    ...boxes.map((box) => (box?.x ?? 0) + (box?.width ?? 0))
  );
  return {
    track,
    inside:
      start >= (track?.x ?? 0) - 0.5 &&
      end <= (track?.x ?? 0) + (track?.width ?? 0) + 0.5,
    // The room the items leave at the track's ends: its padding, and no more.
    left: (track?.x ?? 0) + (track?.width ?? 0) - end,
  };
};

test("full width, the track spans its box and the items fill it, each from its words", async ({
  page,
}) => {
  await openExample(page, "toggle", "full-width");
  const effort = page.getByRole("group", { name: "Effort" });
  const { track, inside, left } = await fits(effort);
  const box = await effort.locator("..").boundingBox();
  expect(track?.width).toBeCloseTo(box?.width ?? 0, 0);
  expect(inside).toBe(true);
  expect(left).toBeLessThan(8);
  const low = await effort.getByRole("button", { name: "Low" }).boundingBox();
  const extra = await effort
    .getByRole("button", { name: "Extra high" })
    .boundingBox();
  expect(extra?.width ?? 0).toBeGreaterThan(low?.width ?? 0);
  await expect(effort.getByRole("button", { name: "Extra high" })).toHaveText(
    "Extra high"
  );
});

test.describe("full width on a 320px phone", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("five items and long words stay inside the track, the words cut with an ellipsis", async ({
    page,
  }) => {
    await openExample(page, "toggle", "full-width");
    for (const name of ["Effort", "Answer length"]) {
      // oxlint-disable-next-line no-await-in-loop -- one group after the other
      const { inside } = await fits(page.getByRole("group", { name }));
      expect(inside).toBe(true);
    }
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
    ).toBe(0);
    const long = page
      .getByRole("group", { name: "Answer length" })
      .getByRole("button", { name: "A long, detailed report" });
    await expect(long).toBeVisible();
    await long.click();
    await expect(long).toHaveAttribute("aria-pressed", "true");
  });
});

test("a toggle that is only an icon shows its name under a pointer and on keyboard focus, and one with words shows none", async ({
  page,
}) => {
  await openExample(page, "toggle", "alone");
  const bold = page.getByRole("button", { name: "Bold" });
  await bold.hover();
  await expect(page.getByRole("tooltip")).toHaveText("Bold");
  await expect(bold).not.toHaveAttribute("aria-describedby");
  await page.mouse.move(0, 0);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await bold.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("tooltip")).toHaveText("Bold");
});

test.describe("on a narrow phone", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("a group wider than its box puts what does not fit on another row, inside the track", async ({
    page,
  }) => {
    await openExample(page, "toggle", "wrap");
    const group = page.getByRole("group", { name: "Language" });
    const box = await group.boundingBox();
    const items = await group.getByRole("button").evaluateAll((all) =>
      all.map((item) => {
        const rect = item.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: Math.round(rect.top),
        };
      })
    );
    expect(items).toHaveLength(5);
    for (const item of items) {
      expect(item.left).toBeGreaterThanOrEqual(box?.x ?? 0);
      expect(item.right).toBeLessThanOrEqual((box?.x ?? 0) + (box?.width ?? 0));
      expect(item.right).toBeLessThanOrEqual(320);
    }
    expect(new Set(items.map((item) => item.top)).size).toBeGreaterThan(1);
  });
});
