// What every spec shares: opening one example alone, live, in a theme, and
// at a fixed time for an example that shows one; and, for the specs that
// hold a rule across the library, every component example and every page.
import { readdirSync } from "node:fs";
import nodePath from "node:path";

import type { Locator, Page } from "@playwright/test";

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
  const at = (path: string): string => {
    const url = new URL(`/examples/${path}`, process.env.BASE_URL);
    url.searchParams.set("mode", theme);
    return url.href;
  };
  await page.goto(at(`${component}/${name}`));
  // Live: the island has dropped `ssr` (site/system/island.ts) and React
  // has hydrated what it drew, so its handlers are on the elements. A
  // picture's preload link React puts first carries no handlers: skipped.
  await page.waitForFunction(() => {
    const drawn = document.querySelector("damsko-island:not([ssr]) :not(link)");
    return (
      drawn !== null &&
      Object.keys(drawn).some((key) => key.startsWith("__reactProps"))
    );
  });
};

declare global {
  interface Window {
    /** Everything the page's live regions have said, in order (`listenToLiveRegions`). */
    liveSaid?: string[];
  }
}

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
          .filter((node) => node?.matches("[data-slot=live-region]") === true)
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
          parts.push({
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
