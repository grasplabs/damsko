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
 * What a picture of a placeholder at rest holds, its PNG read back in the page: its pixels, the
 * colour furthest from the commonest one (the ground), the columns and rows they stand in and how
 * far they are from each of the picture's four edges; and how many colours lie between the two.
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
    // A pixel is as far from the ground as any colour in the picture, give or take the grain a
    // browser draws a see-through colour with; a colour part of the way there is a soft edge.
    const most = Math.max(...[...counts.keys()].map(far));
    const grain = 6;
    const lit = (index: number) => far(at(index)) >= most - grain;
    const soft = [...counts.keys()].filter(
      (colour) => far(colour) > grain && far(colour) < most - grain
    ).length;
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
      soft,
      top: rows.indexOf(true),
    };
  }, png.toString("base64"));

/** How long the runs of lit columns or rows are: how wide or tall the pixels are. */
const sides = (lit: boolean[]) => [
  ...new Set(
    lit
      .map((on) => (on ? "1" : " "))
      .join("")
      .split(" ")
      .filter((run) => run !== "")
      .map((run) => run.length)
  ),
];

for (const theme of ["light", "dark"] as const) {
  test(`the field's texture is square pixels, each sharp on the ground (${theme})`, async ({
    page,
  }) => {
    await openExample(page, "skeleton", "text", { theme });
    // At rest, lines of text are the ground and their pixels only: a square on whole pixels has
    // no soft edge, so the picture holds no colour between the two. A round dot shades into the
    // ground.
    const lines = page.getByRole("status").locator("xpath=..");
    const drawn = await field(page, await lines.screenshot());
    expect(drawn.soft).toBe(0);
  });
}

/** How many of a picture's pixels make one CSS pixel. */
const ratio = async (page: Page) =>
  await page.evaluate(() => window.devicePixelRatio);

/** The lengths of the gaps between runs of lit columns or rows. */
const gaps = (lit: boolean[]) => [
  ...new Set(
    lit
      .map((on) => (on ? "1" : " "))
      .join("")
      .trim()
      .split(/1+/u)
      .filter((gap) => gap !== "")
      .map((gap) => gap.length)
  ),
];

/** How many runs of lit columns or rows: how many pixels along a side. */
const count = (lit: boolean[]) =>
  lit
    .map((on) => (on ? "1" : " "))
    .join("")
    .split(" ")
    .filter((run) => run !== "").length;

// Each placeholder, and how far inside its field its pixels' room stands: a line's is its letters'
// height; a picture's a space inside its ground, a circle's two.
for (const [example, shape, at, inset] of [
  ["shapes", "a line", 0, 0],
  ["shapes", "a rectangle", 1, 4],
  ["shapes", "a circle", 2, 8],
  ["text", "a line of a title, 60% wide", 0, 0],
  ["text", "a line 75% wide", 3, 0],
  ["layout", "a chart", 3, 4],
] as const) {
  test(`the field holds as many 2px pixels as fit, one in every 4px, in the middle of its box (${shape})`, async ({
    page,
  }) => {
    await openExample(page, "skeleton", example);
    // The field: the box inside the placeholder that its pixels are laid out in.
    const box = page
      .getByRole("status")
      .locator("xpath=following::span[@aria-hidden='true']")
      .nth(at)
      .locator("xpath=*[1]");
    const place = await box.boundingBox();
    const drawn = await field(page, await box.screenshot());
    const dense = await ratio(page);
    // Every pixel is 2px a side, and every gap between two is 2px: no run broken off.
    expect(sides(drawn.columns)).toEqual([2 * dense]);
    expect(sides(drawn.rows)).toEqual([2 * dense]);
    expect(gaps(drawn.columns)).toEqual([2 * dense]);
    expect(gaps(drawn.rows)).toEqual([2 * dense]);
    // As many as whole 4px tiles fit (a large line's 17px holds four rows).
    expect(count(drawn.columns)).toBe(
      Math.floor(((place?.width ?? 0) - 2 * inset) / 4)
    );
    expect(count(drawn.rows)).toBe(
      Math.floor(((place?.height ?? 0) - 2 * inset) / 4)
    );
    // The room left over stands at the edges, as much at one as at the other, give or take a
    // pixel (and the pixel a box on part of a pixel is pictured with).
    const whole = Number.isInteger(place?.y) && Number.isInteger(place?.height);
    expect(Math.abs(drawn.left - drawn.right)).toBeLessThanOrEqual(dense);
    expect(Math.abs(drawn.top - drawn.bottom)).toBeLessThanOrEqual(
      whole ? dense : dense + 1
    );
  });
}

for (const dense of [1, 2]) {
  test.describe(`at ${dense}x`, () => {
    test.use({ deviceScaleFactor: dense });

    test("a line's pixels are sharp and unbroken at every width from 200px to 300px", async ({
      page,
    }) => {
      await openExample(page, "skeleton", "text");
      const region = page.getByRole("status").locator("xpath=..");
      // The paragraph's first line, the region's whole width; its field is its letters' height.
      const line = region
        .locator("xpath=span[@aria-hidden='true']")
        .nth(1)
        .locator("xpath=*[1]");
      for (let width = 200; width <= 300; width += 1) {
        // oxlint-disable-next-line no-await-in-loop -- one width after the other
        await region.evaluate((node, to) => {
          if (node instanceof HTMLElement) {
            node.style.width = `${to}px`;
          }
        }, width);
        // oxlint-disable-next-line no-await-in-loop -- one width after the other
        const drawn = await field(page, await line.screenshot());
        expect({
          width,
          soft: drawn.soft,
          pixels: count(drawn.columns),
          gaps: gaps(drawn.columns),
        }).toStrictEqual({
          width,
          soft: 0,
          pixels: Math.floor(width / 4),
          gaps: [2 * dense],
        });
      }
    });
  });
}

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
