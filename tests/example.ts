// What every spec shares: opening one example alone, live, in a theme, and
// at a fixed time for an example that shows one; and, for the specs that
// hold a rule across the library, every component example and every page.
import { readdirSync } from "node:fs";
import nodePath from "node:path";

import type { FileChooser, Locator, Page } from "@playwright/test";

const root = nodePath.join(import.meta.dirname, "..");

/** Every example of a component (one with a page in docs/components), as `<component>/<name>`. */
export const componentExamples = (): string[] => {
  const pages = new Set(
    readdirSync(nodePath.join(root, "docs/components")).map((file) =>
      file.replace(/\.mdx$/u, "")
    )
  );
  return readdirSync(nodePath.join(root, "examples"))
    .filter((folder) => pages.has(folder))
    .toSorted()
    .flatMap((folder) =>
      readdirSync(nodePath.join(root, "examples", folder))
        .filter((file) => file.endsWith(".tsx"))
        .toSorted()
        .map((file) => `${folder}/${file.slice(0, -".tsx".length)}`)
    );
};

/** Every docs page's address: the home page, Get started, the overview and docs/**\/*.mdx. */
export const docsPages = (): string[] => [
  "/",
  "/get-started",
  "/components",
  ...readdirSync(nodePath.join(root, "docs"))
    .toSorted()
    .flatMap((group) =>
      readdirSync(nodePath.join(root, "docs", group))
        .filter((file) => file.endsWith(".mdx"))
        .toSorted()
        .map((file) => `/${group}/${file.slice(0, -".mdx".length)}`)
    ),
];

/** The time an example that shows one is held at, so every run reads the same. */
export const fixedTime = new Date("2026-11-17T10:00:00Z");

export interface ExampleOptions {
  theme?: "light" | "dark";
  /** Start the page's clock here (`fixedTime`), so "3 minutes ago" reads
   * the same every run; move it on with `page.clock`. */
  time?: Date;
}

/** Where the site serves examples/<component>/<name>.tsx alone, in a theme. */
const addressOf = (
  component: string,
  name: string,
  theme: "light" | "dark"
): string => {
  const url = new URL(`/examples/${component}/${name}`, process.env.BASE_URL);
  url.searchParams.set("mode", theme);
  return url.href;
};

/**
 * Waits until the example is live: the island has dropped `ssr` (site/system/island.ts) and React
 * has hydrated what it drew, so its handlers are on the elements. A picture's preload link React
 * puts first carries no handlers: skipped.
 */
const live = async (page: Page): Promise<void> => {
  await page.waitForFunction(() => {
    const drawn = document.querySelector("damsko-island:not([ssr]) :not(link)");
    return (
      drawn !== null &&
      Object.keys(drawn).some((key) => key.startsWith("__reactProps"))
    );
  });
};

/**
 * Opens examples/<component>/<name>.tsx as the site serves it alone
 * (/examples/<component>/<name>) and waits until it is live, not only drawn
 * on the server.
 */
export const openExample = async (
  page: Page,
  component: string,
  name: string,
  { theme = "light", time }: ExampleOptions = {}
): Promise<void> => {
  if (time !== undefined) {
    await page.clock.install({ time });
  }
  await page.emulateMedia({ colorScheme: theme });
  await page.goto(addressOf(component, name, theme));
  await live(page);
};

/**
 * Opens an example as the server drew it, its scripts held back, and returns what lets them run
 * and waits until the example is live: for what a person does before the page wakes.
 */
export const openExampleAsleep = async (
  page: Page,
  component: string,
  name: string
): Promise<() => Promise<void>> => {
  const held = Promise.withResolvers<null>();
  await page.route("**/*.{js,mjs}", async (route) => {
    await held.promise;
    await route.continue();
  });
  await page.emulateMedia({ colorScheme: "light" });
  // The page's load waits on its scripts: only its arrival is waited for here.
  await page.goto(addressOf(component, name, "light"), { waitUntil: "commit" });
  return async () => {
    held.resolve(null);
    await live(page);
  };
};

/**
 * The file picker that `open` opens (a press, a key), caught so its files can be set.
 *
 * Listening for the picker is what tells the browser to hand it over, and Playwright sends that
 * word without waiting for the answer. A key goes to the page by another road and can overtake
 * it on a busy machine: the picker then opens for nobody, is cancelled at once, and the wait
 * never ends. So the page is asked something first, on the road the word took: its answer comes
 * only after the word has arrived.
 */
export const pickerFrom = async (
  page: Page,
  open: () => Promise<void>
): Promise<FileChooser> => {
  const [picker] = await Promise.all([
    page.waitForEvent("filechooser"),
    (async () => {
      await page.evaluate(() => document.readyState);
      await open();
    })(),
  ]);
  return picker;
};

declare global {
  interface Window {
    /** Everything the page's live regions have said, in order (`listenToLiveRegions`). */
    liveSaid?: string[];
  }
}

/** The page's live region of that politeness, where `announce` and UI SDK's parts speak. */
export const liveRegion = (
  page: Page,
  politeness: "polite" | "assertive" = "polite"
): Locator =>
  page.locator(
    politeness === "polite"
      ? '[data-ui-sdk-announcer=""]'
      : '[data-ui-sdk-announcer="assertive"]'
  );

/**
 * Listens, from before the page opens, to what its live regions (`announce`'s) say, and returns
 * what reads it: every message, in the order it was said.
 */
export const listenToLiveRegions = async (
  page: Page
): Promise<() => Promise<string[]>> => {
  await page.addInitScript(() => {
    const said: string[] = [];
    window.liveSaid = said;
    new MutationObserver((changes) => {
      const regions = new Set(
        changes
          .map((change) =>
            change.target instanceof Element
              ? change.target
              : change.target.parentElement
          )
          .filter((node) => node?.matches("[data-ui-sdk-announcer]") === true)
      );
      for (const region of regions) {
        const text = region?.textContent ?? "";
        if (text !== "") {
          said.push(text);
        }
      }
    }).observe(document, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
  return async () => await page.evaluate(() => window.liveSaid ?? []);
};

/**
 * Whether the element draws the focus ring: an outline or a shadow that
 * only shows while it matches :focus-visible.
 */
export const hasFocusRing = async (element: Locator): Promise<boolean> =>
  await element.evaluate((node) => {
    const style = getComputedStyle(node);
    const outline =
      style.outlineStyle !== "none" && style.outlineWidth !== "0px";
    return (
      node.matches(":focus-visible") && (outline || style.boxShadow !== "none")
    );
  });

/** How far a focused element's ring stands past the nearest box that clips it, on its worst side: 0 or less when it shows whole. */
export const ringCut = async (focused: Locator): Promise<number> =>
  await focused.evaluate((node) => {
    const style = getComputedStyle(node);
    const reach =
      Number(style.outlineWidth.replace(/px$/u, "")) +
      Number(style.outlineOffset.replace(/px$/u, ""));
    const box = node.getBoundingClientRect();
    let clip = node.parentElement;
    while (clip !== null && getComputedStyle(clip).overflowX === "visible") {
      clip = clip.parentElement;
    }
    if (clip === null) {
      return 0;
    }
    const edge = clip.getBoundingClientRect();
    return Math.max(
      edge.left - (box.left - reach),
      box.right + reach - edge.right,
      edge.top - (box.top - reach),
      box.bottom + reach - edge.bottom
    );
  });

/** The key that moves focus on: WebKit on a Mac moves Tab only between fields unless Option is held. */
export const tab = (browserName: string): string =>
  browserName === "webkit" ? "Alt+Tab" : "Tab";

/** Waits until the page's fonts have loaded and it has drawn twice, so what is measured stands still. */
export const settled = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    await document.fonts.ready;
    // oxlint-disable-next-line promise/avoid-new -- the next frames, which have no promise of their own
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
};

/** One thing drawn: pixels that touch, of another colour than the ground, in CSS pixels. */
export interface DrawnPart {
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** It touches the edge of what was looked at: it goes on past it. */
  cut: boolean;
  /** How many of its box's four corner pixels it draws: none for a shape with rounded corners. */
  corners: number;
  /** Its colour a device pixel in from the middle of its left edge, as `r,g,b`. */
  edgeColour: string;
}

/**
 * What is drawn in a part of the page, read from its pixels: each run of touching pixels whose
 * colour is not the ground's (the colour at that part's first corner), with the box round it.
 * Where a shape stands as the screen shows it, which its layout box does not say: a browser sets
 * every box's edges on whole device pixels by itself.
 */
export const drawnParts = async (
  page: Page,
  clip: { x: number; y: number; width: number; height: number }
): Promise<DrawnPart[]> => {
  const shot = await page.screenshot({ clip, fullPage: true, scale: "device" });
  return await page.evaluate(
    async ({ png, across }) => {
      const bytes = Uint8Array.from(
        atob(png),
        (char) => char.codePointAt(0) ?? 0
      );
      const bitmap = await createImageBitmap(
        new Blob([bytes], { type: "image/png" })
      );
      const { width, height } = bitmap;
      const context = new OffscreenCanvas(width, height).getContext("2d");
      if (context === null) {
        throw new Error("No canvas to read the picture with.");
      }
      context.drawImage(bitmap, 0, 0);
      const { data } = context.getImageData(0, 0, width, height);
      const channel = (pixel: number, at: number): number =>
        data[pixel * 4 + at] ?? 0;
      // Far enough from the ground's colour to be drawn, not an edge's faint blend into it.
      const drawn = (pixel: number): boolean =>
        Math.abs(channel(pixel, 0) - channel(0, 0)) +
          Math.abs(channel(pixel, 1) - channel(0, 1)) +
          Math.abs(channel(pixel, 2) - channel(0, 2)) >
        12;
      const seen = new Set<number>();
      const parts: DrawnPart[] = [];
      for (let first = 0; first < width * height; first += 1) {
        if (drawn(first) && !seen.has(first)) {
          const part = { left: width, top: height, right: 0, bottom: 0 };
          const todo = [first];
          seen.add(first);
          for (
            let pixel = todo.pop();
            pixel !== undefined;
            pixel = todo.pop()
          ) {
            const x = pixel % width;
            const y = (pixel - x) / width;
            part.left = Math.min(part.left, x);
            part.top = Math.min(part.top, y);
            part.right = Math.max(part.right, x + 1);
            part.bottom = Math.max(part.bottom, y + 1);
            for (const [dx, dy] of [
              [-1, -1],
              [0, -1],
              [1, -1],
              [-1, 0],
              [1, 0],
              [-1, 1],
              [0, 1],
              [1, 1],
            ] as const) {
              const next = (y + dy) * width + x + dx;
              if (
                x + dx >= 0 &&
                x + dx < width &&
                y + dy >= 0 &&
                y + dy < height &&
                drawn(next) &&
                !seen.has(next)
              ) {
                seen.add(next);
                todo.push(next);
              }
            }
          }
          const scale = width / across;
          const at = (x: number, y: number): number => y * width + x;
          const corners = [
            at(part.left, part.top),
            at(part.right - 1, part.top),
            at(part.left, part.bottom - 1),
            at(part.right - 1, part.bottom - 1),
          ].filter((pixel) => drawn(pixel)).length;
          const middle = at(
            part.left + 1,
            Math.floor((part.top + part.bottom) / 2)
          );
          parts.push({
            corners,
            edgeColour: [0, 1, 2]
              .map((index) => channel(middle, index))
              .join(","),
            left: part.left / scale,
            top: part.top / scale,
            right: part.right / scale,
            bottom: part.bottom / scale,
            cut:
              part.left === 0 ||
              part.top === 0 ||
              part.right === width ||
              part.bottom === height,
          });
        }
      }
      return parts;
    },
    { png: shot.toString("base64"), across: clip.width }
  );
};

// A pixel or less is no shortfall, as the browser sets every edge on a whole device pixel; nor is
// paint past the box (an edge drawn outside it).
const short = (by: number): number => (by <= 1 ? 0 : by);

/**
 * What an element paints round itself (its fill under the pointer, its ring), read from the pixels
 * round it, the largest part drawn there: how far it falls short of the element's own box on each
 * side (0 on every side when it shows whole, more where something cuts it), how many of its four
 * corner pixels it draws (none when its corners are rounded) and its colour just inside its left
 * edge.
 */
export const paintedBox = async (
  element: Locator
): Promise<{
  left: number;
  top: number;
  right: number;
  bottom: number;
  squareCorners: number;
  colour: string;
}> => {
  await settled(element.page());
  const box = await element.boundingBox();
  if (box === null) {
    throw new Error("The element is not drawn.");
  }
  const room = 12;
  const parts = await drawnParts(element.page(), {
    x: box.x - room,
    y: box.y - room,
    width: box.width + room * 2,
    height: box.height + room * 2,
  });
  const [painted] = parts.toSorted(
    (a, b) =>
      (b.right - b.left) * (b.bottom - b.top) -
      (a.right - a.left) * (a.bottom - a.top)
  );
  if (painted === undefined) {
    throw new Error("Nothing is painted round the element.");
  }
  return {
    left: short(painted.left - room),
    top: short(painted.top - room),
    right: short(room + box.width - painted.right),
    bottom: short(room + box.height - painted.bottom),
    squareCorners: painted.corners,
    colour: painted.edgeColour,
  };
};

/**
 * Where what an element draws starts and ends across the page: its words, its marks and any box
 * inside it with a fill, an edge or a shadow, not the element's own box (a trigger's fill under the
 * pointer, a tap target, words hidden for a screen reader).
 */
export const drawnEdges = async (
  element: Locator
): Promise<{ start: number; end: number }> =>
  await element.evaluate((drawing) => {
    let start = Number.POSITIVE_INFINITY;
    let end = Number.NEGATIVE_INFINITY;
    const take = (rect: DOMRect) => {
      if (rect.width > 1 && rect.height > 1) {
        start = Math.min(start, rect.left);
        end = Math.max(end, rect.right);
      }
    };
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if ((node.textContent ?? "").trim() !== "") {
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            take(rect);
          }
        }
        return;
      }
      if (!(node instanceof Element)) {
        return;
      }
      const box = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      // Hidden, or words kept for a screen reader in a box a pixel wide; a box drawn as its
      // children alone (`display: contents`) has none of its own.
      if (
        style.display !== "contents" &&
        (!node.checkVisibility() || box.width <= 1 || box.height <= 1)
      ) {
        return;
      }
      const filled =
        style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
        !/^(?:none|rgba\(0, 0, 0, 0\) 0px 0px 0px 0px)$/u.test(
          style.boxShadow
        ) ||
        Number(style.borderTopWidth.replace("px", "")) > 0;
      if (node !== drawing && (node instanceof SVGSVGElement || filled)) {
        take(box);
      }
      for (const child of node.childNodes) {
        walk(child);
      }
    };
    walk(drawing);
    return { start: Math.round(start), end: Math.round(end) };
  });

/** What a trigger opens, by its `aria-controls`. */
export const panelOf = async (trigger: Locator): Promise<Locator> => {
  const id = await trigger.getAttribute("aria-controls");
  return trigger.page().locator(`[id="${id ?? ""}"]`);
};
