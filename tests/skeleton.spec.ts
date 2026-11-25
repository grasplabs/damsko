import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

const motion = async (page: Page) =>
  await page.evaluate(() => document.getAnimations().length);

/** The waves: the light a script starts, not a stylesheet's animation (the pulse). */
const waves = async (page: Page) =>
  await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            !(animation instanceof CSSAnimation) &&
            !(animation instanceof CSSTransition)
        ).length
  );

/**
 * Until the page has said what is in view: the wave starts when a placeholder comes into view, so
 * a count taken before then proves nothing. An observer made now is told after the page's own.
 */
const inView = async (page: Page) => {
  await page.evaluate(() => {
    const watch = new IntersectionObserver(() => {
      watch.disconnect();
      document.body.dataset.told = "";
    });
    watch.observe(document.body);
  });
  await page.waitForFunction(() => document.body.dataset.told !== undefined);
};

for (const [example, status] of [
  ["layout", "Loading the update"],
  ["shapes", "Loading"],
  ["text", "Loading the summary"],
  ["still", "Loading the list"],
] as const) {
  test(`placeholders are hidden from screen readers; the region's status says what loads (${example})`, async ({
    page,
  }) => {
    await openExample(page, "skeleton", example);
    expect(await page.locator("body").ariaSnapshot()).toBe(
      `- status: ${status}`
    );
  });
}

/**
 * What a picture of a placeholder at rest holds, its PNG read back in the page: the columns and rows
 * its pixels stand in (any colour a third of the way or more from the commonest one, the ground, to
 * the furthest, so a pixel on part of a pixel still counts), and how far they are from each of the
 * picture's four edges.
 */
const field = async (page: Page, png: Buffer) =>
  await page.evaluate(async (base64) => {
    const bytes = Uint8Array.from(
      atob(base64),
      (char) => char.codePointAt(0) ?? 0
    );
    const bitmap = await createImageBitmap(
      new Blob([bytes], { type: "image/png" })
    );
    const { width, height } = bitmap;
    const context = new OffscreenCanvas(width, height).getContext("2d");
    context?.drawImage(bitmap, 0, 0);
    const data = context?.getImageData(0, 0, width, height).data ?? [];
    const counts = new Map<number, number>();
    const at = (index: number) =>
      (data[index * 4] ?? 0) * 65_536 +
      (data[index * 4 + 1] ?? 0) * 256 +
      (data[index * 4 + 2] ?? 0);
    for (let index = 0; index < width * height; index += 1) {
      counts.set(at(index), (counts.get(at(index)) ?? 0) + 1);
    }
    const [ground = 0] =
      [...counts].toSorted((one, other) => other[1] - one[1])[0] ?? [];
    const far = (colour: number) =>
      Math.abs(Math.floor(colour / 65_536) - Math.floor(ground / 65_536)) +
      Math.abs(
        (Math.floor(colour / 256) % 256) - (Math.floor(ground / 256) % 256)
      ) +
      Math.abs((colour % 256) - (ground % 256));
    const most = Math.max(...[...counts.keys()].map(far));
    const lit = (index: number) => far(at(index)) >= most / 3;
    const columns = Array.from({ length: width }, (_, x) =>
      Array.from({ length: height }, (__, y) => lit(y * width + x)).includes(
        true
      )
    );
    const rows = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (__, x) => lit(y * width + x)).includes(
        true
      )
    );
    return {
      bottom: height - 1 - rows.lastIndexOf(true),
      columns,
      left: columns.indexOf(true),
      right: width - 1 - columns.lastIndexOf(true),
      rows,
      top: rows.indexOf(true),
    };
  }, png.toString("base64"));

/** The runs of lit columns or rows, and the widest gap between two of them. */
const runs = (lit: boolean[]) => {
  const line = lit.map((on) => (on ? "1" : " ")).join("");
  const gaps = line
    .trim()
    .split(/1+/u)
    .filter((gap) => gap !== "")
    .map((gap) => gap.length);
  return {
    count: line.split(" ").filter((run) => run !== "").length,
    widestGap: Math.max(0, ...gaps),
  };
};

for (const theme of ["light", "dark"] as const) {
  for (const [example, shape, at] of [
    ["shapes", "a line", 0],
    ["shapes", "a rectangle", 1],
    ["shapes", "a circle", 2],
    ["text", "a line of a title, 60% wide", 0],
    ["text", "a line 75% wide", 3],
    ["layout", "a chart", 3],
  ] as const) {
    test(`the field holds as many whole pixels as fit, unbroken, in the middle of its box (${shape}, ${theme})`, async ({
      page,
    }) => {
      await openExample(page, "skeleton", example, { theme });
      // The field: the box inside the placeholder that its pixels are laid out in.
      const box = page
        .getByRole("status")
        .locator("xpath=following::span[@aria-hidden='true']")
        .nth(at)
        .locator("xpath=*[1]");
      // The room its pixels stand in: its content box.
      const room = await box.evaluate((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        // Its padding, in pixels.
        const [top, right, bottom, left] = [
          style.paddingTop,
          style.paddingRight,
          style.paddingBottom,
          style.paddingLeft,
        ].map((value) => Number(value.replace("px", "")));
        return {
          width: rect.width - (left ?? 0) - (right ?? 0),
          height: rect.height - (top ?? 0) - (bottom ?? 0),
        };
      });
      const drawn = await field(page, await box.screenshot());
      const columns = runs(drawn.columns);
      const rows = runs(drawn.rows);
      // One pixel in every 4px, as many as fit, with the room left over shared out between them
      // all: no run of pixels broken off from the next (an 18px line holds four rows).
      expect(columns.count).toBe(Math.floor(room.width / 4));
      expect(rows.count).toBe(Math.floor(room.height / 4));
      expect(columns.widestGap).toBeLessThan(4);
      expect(rows.widestGap).toBeLessThan(4);
      // As far from the start as from the end, and from the top as from the foot, give or take
      // the pixel a box on part of a pixel is pictured with.
      expect(Math.abs(drawn.left - drawn.right)).toBeLessThanOrEqual(1);
      expect(Math.abs(drawn.top - drawn.bottom)).toBeLessThanOrEqual(1);
    });
  }
}

test("a line holds one pixel in every 4px at every width, none dropped and no run broken off", async ({
  page,
}) => {
  await openExample(page, "skeleton", "text");
  const region = page.getByRole("status").locator("xpath=..");
  // The paragraph's first line, the region's whole width; its field is its letters' height.
  const line = region
    .locator("xpath=span[@aria-hidden='true']")
    .nth(1)
    .locator("xpath=*[1]");
  for (let width = 220; width <= 260; width += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one width after the other
    await region.evaluate((node, to) => {
      if (node instanceof HTMLElement) {
        node.style.width = `${to}px`;
      }
    }, width);
    // oxlint-disable-next-line no-await-in-loop -- one width after the other
    const drawn = await field(page, await line.screenshot());
    const columns = runs(drawn.columns);
    expect({ width, count: columns.count }).toStrictEqual({
      width,
      count: Math.floor(width / 4),
    });
    expect(columns.widestGap).toBeLessThan(4);
  }
});

test("with reduced motion nothing moves, and the wave starts once motion is allowed", async ({
  page,
}) => {
  await openExample(page, "skeleton", "looks");
  await inView(page);
  expect(await motion(page)).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(async () => await waves(page)).toBeGreaterThan(0);
});

test.describe("without reduced motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the wave and the pulse move", async ({ page }) => {
    await openExample(page, "skeleton", "looks");
    await expect.poll(async () => await waves(page)).toBeGreaterThan(0);
    expect(await motion(page)).toBeGreaterThan(await waves(page));
  });

  test("a still skeleton stays still once in view", async ({ page }) => {
    await openExample(page, "skeleton", "still");
    await inView(page);
    expect(await motion(page)).toBe(0);
  });
});
