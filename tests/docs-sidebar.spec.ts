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
// state, so it is in the first frame, before the shell wakes (site/chrome/DocsShell.tsx). On a
// slow machine Chromium shows a reloaded page while it is still reading it: a frame of the ground
// alone, then the page drawn down to where the reading stands. The trigger is judged in every frame
// that draws the page bar past it, its end; a frame not yet drawn that far draws no page bar to
// judge.
import { writeFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import type { Page, TestInfo } from "@playwright/test";

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

// Anti-aliasing: the edge of a word drawn into a snapshot of the crossfade can land a few pixels
// apart from the same word drawn live.
const NOISE = 30;

/**
 * For each frame, how many pixels in `box` differ from both the first frame and the last, where
 * those two agree: a pixel of a blend of the two states lies between them, one of neither does not.
 * Given `drawn`, a frame that does not yet draw it as the last frame does is passed over (null).
 * Read in a page of its own, from the frames' PNG data. With them, the worst frame's `box` and a
 * picture of where it strays (red), as PNG data.
 */
const strayPixels = async (
  page: Page,
  frames: string[],
  box: Box,
  drawn?: Box
) => {
  const lab = await page.context().newPage();
  const found = await lab.evaluate(
    async ({ all, at, end, noise, view }) => {
      const canvas = new OffscreenCanvas(view.width, view.height);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const cropped = new OffscreenCanvas(at.width, at.height);
      const croppedContext = cropped.getContext("2d");
      if (context === null || croppedContext === null) {
        throw new Error("No 2D canvas.");
      }
      const pictures = await Promise.all(
        all.map(async (data) => {
          const response = await fetch(`data:image/png;base64,${data}`);
          return await createImageBitmap(await response.blob());
        })
      );
      const read = (picture: ImageBitmap, part: typeof at) => {
        context.clearRect(0, 0, part.width, part.height);
        context.drawImage(picture, -part.x, -part.y);
        return context.getImageData(0, 0, part.width, part.height);
      };
      const pixels = pictures.map((picture) => read(picture, at));
      const first = pixels[0]?.data;
      const last = pixels.at(-1)?.data;
      const lastPicture = pictures.at(-1);
      if (
        first === undefined ||
        last === undefined ||
        lastPicture === undefined
      ) {
        throw new Error("No frames.");
      }
      const witness =
        end === undefined ? undefined : read(lastPicture, end).data;
      // Whether the frame draws `end` as the last frame does: its pixels within a blend's reach.
      const drawsEnd = (picture: ImageBitmap) => {
        if (end === undefined || witness === undefined) {
          return true;
        }
        const now = read(picture, end).data;
        let off = 0;
        for (let index = 0; index < now.length; index += 4) {
          for (let channel = index; channel < index + 3; channel += 1) {
            if (Math.abs((now[channel] ?? 0) - (witness[channel] ?? 0)) > 40) {
              off += 1;
              break;
            }
          }
        }
        return off <= noise;
      };
      const judged = pictures.map(drawsEnd);
      const strays = pixels.map(({ data: frame }, frameIndex) => {
        if (judged[frameIndex] !== true) {
          return null;
        }
        const strayAt: number[] = [];
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
            strayAt.push(index);
          }
        }
        return strayAt;
      });
      const counts = strays.map((strayAt) => strayAt?.length ?? null);
      const worst = counts.indexOf(
        Math.max(...counts.map((count) => count ?? 0))
      );
      const png = async (image: ImageData) => {
        croppedContext.putImageData(image, 0, 0);
        const blob = await cropped.convertToBlob({ type: "image/png" });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        return btoa(
          Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("")
        );
      };
      const shown = pixels[worst];
      if (shown === undefined) {
        throw new Error("No worst frame.");
      }
      const marked = new ImageData(
        new Uint8ClampedArray(shown.data),
        at.width,
        at.height
      );
      for (let index = 0; index < marked.data.length; index += 4) {
        const grey = (marked.data[index] ?? 0) / 4 + 160;
        marked.data.set([grey, grey, grey], index);
      }
      for (const index of strays[worst] ?? []) {
        marked.data.set([255, 0, 0], index);
      }
      return {
        counts,
        worst,
        frame: await png(shown),
        diff: await png(marked),
      };
    },
    {
      all: frames,
      at: box,
      end: drawn,
      noise: NOISE,
      view: VIEW,
    }
  );
  await lab.close();
  return found;
};

/**
 * No frame judged draws more than NOISE pixels of neither state in `box` (strayPixels). On a
 * failure the worst frame, whole and as `box`, and where it strays, in red, go with the test's
 * results, which CI keeps.
 */
const expectNoStrayFrame = async (
  page: Page,
  testInfo: TestInfo,
  frames: string[],
  box: Box,
  drawn?: Box
) => {
  const found = await strayPixels(page, frames, box, drawn);
  const { counts, worst } = found;
  const most = counts[worst] ?? 0;
  if (most > NOISE) {
    const keep = async (name: string, data: string) => {
      const path = testInfo.outputPath(`${name}.png`);
      await writeFile(path, Buffer.from(data, "base64"));
      await testInfo.attach(name, { path, contentType: "image/png" });
    };
    await keep(`frame ${worst}`, frames[worst] ?? "");
    await keep(`frame ${worst}, the part judged`, found.frame);
    await keep(`frame ${worst}, stray pixels in red`, found.diff);
  }
  expect(
    most,
    `stray pixels per frame (- not judged): ${counts.map((count) => count ?? "-").join(" ")}`
  ).toBeLessThanOrEqual(NOISE);
  return counts;
};

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
    // A scroll-driven animation (the content's fade at its ends) follows the scroll, not time: it
    // never ends, and is no motion.
    const moving = document.getAnimations().some(({ effect, timeline }) => {
      if (
        !(effect instanceof KeyframeEffect) ||
        (typeof ScrollTimeline !== "undefined" &&
          timeline instanceof ScrollTimeline)
      ) {
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
  }, testInfo) => {
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
    await expectNoStrayFrame(page, testInfo, frames, sidebar);
  });
}

for (const rate of [1, 6, 20]) {
  test(`loaded with the sidebar folded, the page bar's trigger is in every frame, before the shell wakes too, at ${rate}x CPU`, async ({
    page,
  }, testInfo) => {
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
    // The page bar's end, after the trigger in the page and drawn without the shell.
    const end = await boxOf(
      page,
      '[data-slot="sidebar-inset"] header > :last-child'
    );
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate });
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
      // The last frame is the state after: the trigger drawn, however late the shell drew it.
      await expect(bar).toBeVisible();
      await settled(page);
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    const counts = await expectNoStrayFrame(
      page,
      testInfo,
      frames,
      trigger,
      end
    );
    // The reloaded page's bar was judged before the frames stopped: not every frame was passed over.
    expect(counts.slice(1, -1).some((count) => count !== null)).toBe(true);
  });
}
