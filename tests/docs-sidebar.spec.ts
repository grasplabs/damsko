// The docs site's sidebar as a person sees it: every frame Chromium draws through a page change and
// a reload, filmed through its own protocol (Page.startScreencast), so Chromium only
// (playwright.config.ts). A frame may be the state before, the state after, or a blend of the two
// (the router's crossfade); a frame that differs from both where they agree draws something that is
// in neither, such as a run the reader opened shown folded for a moment.
//
// The page change: Astro's router swaps in the next page's sidebar as the server drew it, and only
// the head script draws the kept runs anew (site/system/head-scripts.ts, sidebarInit); before it did
// so right after the swap, the crossfade showed an opened run folded for 11 to 13 frames. The
// reload: the server draws the sidebar open, and the head script folds it as kept before the first
// paint; the page bar's trigger, which shows only while the sidebar is away, is drawn from that
// state, so it is in the first frame, before the shell wakes (site/chrome/DocsShell.tsx).
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { settled } from "./example.ts";

const VIEW = { width: 1440, height: 900 };
// How long no new frame means the page has drawn its last.
const QUIET = 1000;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Every frame Chromium draws from now until `act` has resolved and the frames have stopped coming,
 * as PNG data: a frame reaches the film a while after it is drawn, the last one too.
 */
const film = async (page: Page, act: () => Promise<void>) => {
  const cdp = await page.context().newCDPSession(page);
  const frames: string[] = [];
  let last = 0;
  cdp.on("Page.screencastFrame", (frame) => {
    frames.push(frame.data);
    last = Date.now();
    cdp
      .send("Page.screencastFrameAck", { sessionId: frame.sessionId })
      .catch(() => {
        // The film is over: the session went with it.
      });
  });
  await cdp.send("Page.startScreencast", {
    format: "png",
    everyNthFrame: 1,
    maxWidth: VIEW.width,
    maxHeight: VIEW.height,
  });
  // The state before: the first frame, drawn as the film starts.
  await expect.poll(() => frames.length).toBeGreaterThan(0);
  await act();
  await expect
    .poll(() => Date.now() - last, { intervals: [100] })
    .toBeGreaterThan(QUIET);
  await cdp.send("Page.stopScreencast");
  await cdp.detach();
  return frames;
};

/**
 * For each frame, how many pixels in `box` differ from both the first frame and the last, where
 * those two agree: a pixel of a blend of the two states lies between them, one of neither does not.
 * Read in a page of its own, from the frames' PNG data.
 */
const strayPixels = async (page: Page, frames: string[], box: Box) => {
  const lab = await page.context().newPage();
  const counts = await lab.evaluate(
    async ({ all, at }) => {
      const read = async (data: string) => {
        const response = await fetch(`data:image/png;base64,${data}`);
        const picture = await createImageBitmap(await response.blob());
        const canvas = new OffscreenCanvas(at.width, at.height);
        const context = canvas.getContext("2d");
        if (context === null) {
          throw new Error("No 2D canvas.");
        }
        context.drawImage(picture, -at.x, -at.y);
        return context.getImageData(0, 0, at.width, at.height).data;
      };
      const pixels = await Promise.all(all.map(read));
      const [first] = pixels;
      const last = pixels.at(-1);
      if (first === undefined || last === undefined) {
        throw new Error("No frames.");
      }
      return pixels.map((frame) => {
        let stray = 0;
        for (let index = 0; index < frame.length; index += 4) {
          let agree = true;
          let fromFirst = 0;
          let fromLast = 0;
          for (let channel = index; channel < index + 3; channel += 1) {
            const before = first[channel] ?? 0;
            const after = last[channel] ?? 0;
            const now = frame[channel] ?? 0;
            agree &&= Math.abs(before - after) <= 12;
            fromFirst = Math.max(fromFirst, Math.abs(now - before));
            fromLast = Math.max(fromLast, Math.abs(now - after));
          }
          if (agree && fromFirst > 40 && fromLast > 40) {
            stray += 1;
          }
        }
        return stray;
      });
    },
    { all: frames, at: box }
  );
  await lab.close();
  return counts;
};

// Anti-aliasing: the edge of a word drawn into a snapshot of the crossfade can land a few pixels
// apart from the same word drawn live.
const NOISE = 30;

const boxOf = async (page: Page, selector: string): Promise<Box> => {
  const box = await page.locator(selector).first().boundingBox();
  if (box === null) {
    throw new Error(`${selector} has no box.`);
  }
  return {
    x: Math.floor(box.x),
    y: Math.floor(box.y),
    width: Math.ceil(box.width),
    height: Math.ceil(box.height),
  };
};

/**
 * The shell has woken on the page shown, and the router's crossfade and everything in the sidebar
 * stand still (a page's own examples may move on for ever).
 */
const shellAwake = async (page: Page) => {
  await page.waitForFunction(() => {
    const shell = document
      .querySelector('[data-slot="sidebar-wrapper"]')
      ?.closest("astro-island");
    const moving = document.getAnimations().some(({ effect }) => {
      if (!(effect instanceof KeyframeEffect)) {
        return false;
      }
      return (
        effect.pseudoElement?.startsWith("::view-transition") === true ||
        (effect.target?.closest('[data-slot="sidebar"]') ?? null) !== null
      );
    });
    return (
      shell !== null &&
      shell !== undefined &&
      !shell.hasAttribute("ssr") &&
      !moving
    );
  });
  await settled(page);
};

for (const rate of [1, 6]) {
  test(`a run the reader opened stays open in every frame of a page change, at ${rate}x CPU`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize(VIEW);
    await page.goto(new URL("/components/button", process.env.BASE_URL).href);
    await shellAwake(page);
    const run = page.getByRole("button", { name: /^Text input/u });
    await run.click();
    await expect(run).toHaveAttribute("aria-expanded", "true");
    const sidebar = await boxOf(page, '[data-slot="sidebar"]');
    // Off the sidebar, so no row is under the pointer as the film starts.
    await page.mouse.move(VIEW.width - 100, VIEW.height - 40);
    await shellAwake(page);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate });
    const frames = await film(page, async () => {
      await page
        .getByRole("navigation", { name: "Pages" })
        .getByRole("link", { name: "Copy button" })
        .click();
      await expect(page).toHaveURL(/\/components\/copy-button$/u);
      await shellAwake(page);
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    // The page changed in sight: the swap, the fade and the shell waking drew frames of their own.
    expect(frames.length).toBeGreaterThan(4);
    const stray = await strayPixels(page, frames, sidebar);
    expect(
      Math.max(...stray),
      `stray pixels per frame: ${stray.join(" ")}`
    ).toBeLessThanOrEqual(NOISE);
  });
}

test("loaded with the sidebar folded, the page bar's trigger is in every frame, before the shell wakes too", async ({
  page,
}) => {
  await page.setViewportSize(VIEW);
  await page.goto(new URL("/components/button", process.env.BASE_URL).href);
  await shellAwake(page);
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar
    .getByRole("button", { name: "Show or hide the sidebar" })
    .click();
  const bar = page
    .getByRole("main")
    .getByRole("button", { name: "Show or hide the sidebar" });
  await expect(bar).toBeVisible();
  await shellAwake(page);
  const trigger = await boxOf(
    page,
    '[data-slot="sidebar-inset"] [data-slot="sidebar-trigger"]'
  );
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const frames = await film(page, async () => {
    // The page as the server drew it and the head script set it, its scripts held back a while.
    const held = Promise.withResolvers<null>();
    await page.route("**/*.{js,mjs}", async (route) => {
      await held.promise;
      await route.continue();
    });
    await page.reload({ waitUntil: "commit" });
    await expect(page.locator('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "collapsed"
    );
    await settled(page);
    held.resolve(null);
    await shellAwake(page);
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await expect(bar).toBeVisible();
  const stray = await strayPixels(page, frames, trigger);
  expect(
    Math.max(...stray),
    `stray pixels per frame: ${stray.join(" ")}`
  ).toBeLessThanOrEqual(NOISE);
});
