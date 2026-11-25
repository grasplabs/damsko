// The docs' idle screen (site/behaviour/idle.ts and idle-screen.ts): after the wait with nothing
// done it covers the window, hidden from assistive tech; once it can be seen, a key or a press ends
// it and does nothing else, up to its release, focus and scroll as they were; before that, input
// goes on. It never begins with reduced motion, while the tab is hidden, or in an automated browser
// that does not ask with `?idle=`; where it cannot draw it leaves nothing and is not tried again.
// On the page's own clock.
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

/** The screen drawn far enough in to be seen: from then on it catches the input that ends it. */
const untilSeen = async (page: Page) => {
  await expect(page.locator("[data-idle-phase]")).toBeAttached();
  await page.clock.runFor(3000);
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
    await untilSeen(page);
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
    await untilSeen(page);
    const reached = await record(page);
    await page.mouse.down();
    await page.mouse.up();
    await page.clock.runFor(durations.swap);
    await expect(line).not.toBeAttached();
    expect(await reached()).toEqual([]);
    expect(page.url()).toBe(at);
    // A second press a moment later is the reader's own, and goes on.
    await page.clock.runFor(300);
    await page.mouse.down();
    await page.mouse.up();
    expect(await reached()).toContain("click");
  });

  test("before it can be seen, a press goes on to the page and ends it", async ({
    page,
  }) => {
    await open(page);
    const box = await page
      .getByRole("main")
      .getByRole("link")
      .first()
      .boundingBox();
    await page.mouse.move((box?.x ?? 0) + 4, (box?.y ?? 0) + 4);
    await page.clock.runFor(wait);
    const line = page.getByText("Move to return");
    await expect(line).toBeAttached();
    const reached = await record(page);
    await page.mouse.down();
    await page.mouse.up();
    expect(await reached()).toContain("click");
    await page.clock.runFor(durations.swap);
    await expect(line).not.toBeAttached();
  });

  test("a held key's repeats go nowhere until it is let go; the next key goes on", async ({
    page,
  }) => {
    await open(page);
    const scrolled = await page.evaluate(() => scrollY);
    await page.clock.runFor(wait);
    await untilSeen(page);
    const reached = await record(page);
    await page.keyboard.down("ArrowDown");
    await page.keyboard.down("ArrowDown");
    await page.keyboard.down("ArrowDown");
    await page.keyboard.up("ArrowDown");
    await page.clock.runFor(durations.swap);
    await expect(page.getByText("Move to return")).not.toBeAttached();
    expect(await reached()).toEqual([]);
    expect(await page.evaluate(() => scrollY)).toBe(scrolled);
    await page.keyboard.press("ArrowDown");
    expect(await reached()).toEqual(["keydown", "keyup"]);
  });

  test("without WebGL it never shows, catches nothing and is not tried again", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const { prototype } = HTMLCanvasElement;
      const ask: unknown = Reflect.get(prototype, "getContext");
      if (typeof ask !== "function") {
        return;
      }
      Reflect.set(
        prototype,
        "getContext",
        new Proxy(ask, {
          apply: (target, canvas, args: unknown[]) => {
            if (args[0] !== "webgl") {
              const context: unknown = Reflect.apply(target, canvas, args);
              return context;
            }
            const { dataset } = document.documentElement;
            dataset.webglAsked = `${Number(dataset.webglAsked ?? 0) + 1}`;
            return null;
          },
        })
      );
    });
    await open(page);
    await page.clock.runFor(wait);
    await expect(page.locator("html[data-webgl-asked='1']")).toBeAttached();
    await expect(page.getByText("Move to return")).not.toBeAttached();
    const reached = await record(page);
    await page.keyboard.press("PageDown");
    expect(await reached()).toEqual(["keydown", "keyup"]);
    await page.clock.runFor(wait * 3);
    await expect(page.locator("html[data-webgl-asked='1']")).toBeAttached();
  });

  test("a picture that will not come leaves nothing behind and is not tried again", async ({
    page,
  }) => {
    const asked: string[] = [];
    await page.route("**/scenes/**", async (route) => {
      asked.push(route.request().url());
      await route.abort();
    });
    await open(page);
    await page.clock.runFor(wait);
    await expect.poll(() => asked.length).toBe(1);
    await expect(page.getByText("Move to return")).not.toBeAttached();
    const reached = await record(page);
    await page.keyboard.press("PageDown");
    expect(await reached()).toEqual(["keydown", "keyup"]);
    await page.clock.runFor(wait * 3);
    expect(asked).toHaveLength(1);
  });

  test("the address cannot make it come sooner than a second, nor twice at once", async ({
    page,
  }) => {
    await open(page, "?idle=0.001");
    const line = page.getByText("Move to return");
    await page.clock.runFor(900);
    await expect(line).not.toBeAttached();
    await page.clock.runFor(100);
    await expect(line).toHaveCount(1);
    for (const x of [100, 200, 300]) {
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      await page.mouse.move(x, x);
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      await page.clock.runFor(1000);
      // oxlint-disable-next-line no-await-in-loop -- one after the other
      await expect(line).toHaveCount(1);
    }
  });

  test("outside an automated browser the address cannot shorten the wait", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
    await open(page, "?idle=1");
    const line = page.getByText("Move to return");
    await page.clock.runFor(wait - 1000);
    await expect(line).not.toBeAttached();
    await page.clock.runFor(1000);
    await expect(line).toBeAttached();
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
      await untilSeen(page);
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
