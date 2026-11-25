// The docs' idle screen (site/behaviour/idle.ts and idle-screen.ts): after the wait with nothing
// done it covers the window, hidden from assistive tech; a key or a press ends it and does nothing
// else, focus and scroll as they were; it never begins with reduced motion, while the tab is hidden,
// or in an automated browser that does not ask for it with `?idle=`. On the page's own clock.
import { durations } from "@grasp-os/ui/lib/tokens.values";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { idleSeconds } from "../site/behaviour/idle-time.ts";

const wait = idleSeconds * 1000;

/** The docs page, asking for the screen after the whole wait (an automated browser must ask). */
const open = async (page: Page, query = `?idle=${idleSeconds}`) => {
  await page.clock.install();
  await page.goto(new URL(`/docs${query}`, process.env.BASE_URL).href);
};

/** From now on, the presses and keys that reach the page's own listeners, read by the call returned. */
const record = async (page: Page): Promise<() => Promise<string[]>> => {
  await page.evaluate(() => {
    document.body.dataset.reached = "";
    for (const type of [
      "keydown",
      "keyup",
      "pointerdown",
      "pointerup",
      "mousedown",
      "mouseup",
      "click",
      "touchstart",
      "touchend",
    ]) {
      document.addEventListener(type, (event) => {
        document.body.dataset.reached += `${event.type} `;
      });
    }
  });
  return async () => {
    const reached = await page.evaluate(
      () => document.body.dataset.reached ?? ""
    );
    return reached.split(" ").filter((type) => type !== "");
  };
};

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("it begins after the wait, over the whole window, hidden from assistive tech", async ({
    page,
  }) => {
    await open(page);
    const line = page.getByText("Move to return");
    await page.clock.runFor(wait - 1000);
    await expect(line).not.toBeAttached();
    await page.clock.runFor(1000);
    await expect(line).toBeAttached();
    const screen = page.locator("[aria-hidden=true]").filter({ has: line });
    await expect(screen).toHaveCount(1);
    expect(await screen.boundingBox()).toEqual({
      x: 0,
      y: 0,
      ...page.viewportSize(),
    });
    // It dithers in from the edges, then the whole window is one scene with the line beneath.
    await expect(page.locator("[data-idle-phase]")).toBeAttached();
    await page.clock.runFor(6500);
    await expect(page.locator("[data-idle-phase=rest]")).toBeAttached();
    await expect(line).toHaveCSS("opacity", "0.85");
  });

  test("a key ends it and does nothing else; focus and scroll stay where they were", async ({
    page,
  }) => {
    await open(page);
    const link = page.getByRole("main").getByRole("link").first();
    await link.focus();
    const at = page.url();
    const scrolled = await page.evaluate(() => scrollY);
    await page.clock.runFor(wait);
    const line = page.getByText("Move to return");
    await expect(line).toBeAttached();
    const reached = await record(page);
    await page.keyboard.press("Enter");
    await page.clock.runFor(durations.swap);
    await expect(line).not.toBeAttached();
    expect(await reached()).toEqual([]);
    await expect(link).toBeFocused();
    expect(page.url()).toBe(at);
    expect(await page.evaluate(() => scrollY)).toBe(scrolled);
    // The wait starts again.
    await page.clock.runFor(wait);
    await expect(line).toBeAttached();
  });

  test("a press ends it and clicks nothing under it", async ({ page }) => {
    await open(page);
    const box = await page
      .getByRole("main")
      .getByRole("link")
      .first()
      .boundingBox();
    expect(box).not.toBeNull();
    const at = page.url();
    // The pointer is already over the link; the screen comes, and the press is the first input.
    await page.mouse.move((box?.x ?? 0) + 4, (box?.y ?? 0) + 4);
    await page.clock.runFor(wait);
    const line = page.getByText("Move to return");
    await expect(line).toBeAttached();
    const reached = await record(page);
    await page.mouse.down();
    await page.mouse.up();
    await page.clock.runFor(durations.swap);
    await expect(line).not.toBeAttached();
    expect(await reached()).toEqual([]);
    expect(page.url()).toBe(at);
  });

  test("a move ends it", async ({ page }) => {
    await open(page);
    await page.clock.runFor(wait);
    const line = page.getByText("Move to return");
    await expect(line).toBeAttached();
    await page.mouse.move(200, 200);
    await page.clock.runFor(durations.swap);
    await expect(line).not.toBeAttached();
  });

  test.describe("on a phone", () => {
    test.use({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });

    test("a tap ends it and clicks nothing under it", async ({ page }) => {
      await open(page);
      const at = page.url();
      await page.clock.runFor(wait);
      const line = page.getByText("Touch to return");
      await expect(line).toBeAttached();
      const reached = await record(page);
      await page.touchscreen.tap(195, 300);
      await page.clock.runFor(durations.swap);
      await expect(line).not.toBeAttached();
      expect(await reached()).toEqual([]);
      expect(page.url()).toBe(at);
    });
  });

  test("it never begins while the tab is hidden, and waits again once it is seen", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(document, "hidden", {
        get: () => document.documentElement.dataset.testHidden === "",
      });
    });
    await open(page);
    const seen = async (hidden: boolean) => {
      await page.evaluate((now) => {
        if (now) {
          document.documentElement.dataset.testHidden = "";
        } else {
          delete document.documentElement.dataset.testHidden;
        }
        document.dispatchEvent(new Event("visibilitychange"));
      }, hidden);
    };
    await seen(false);
    await page.clock.runFor(wait - 1000);
    await seen(true);
    await page.clock.runFor(wait * 2);
    const line = page.getByText("Move to return");
    await expect(line).not.toBeAttached();
    await seen(false);
    await page.clock.runFor(wait);
    await expect(line).toBeAttached();
  });

  test("an automated browser that does not ask never meets it", async ({
    page,
  }) => {
    await open(page, "");
    await page.clock.runFor(wait * 2);
    await expect(page.getByText("Move to return")).not.toBeAttached();
  });
});

test("with reduced motion it never begins, and nothing of it is fetched", async ({
  page,
}) => {
  const fetched: string[] = [];
  page.on("request", (request) => fetched.push(request.url()));
  await open(page);
  await page.clock.runFor(wait * 2);
  await expect(page.getByText("Move to return")).not.toBeAttached();
  expect(fetched.filter((url) => /idle-screen|\/scenes\//u.test(url))).toEqual(
    []
  );
});
