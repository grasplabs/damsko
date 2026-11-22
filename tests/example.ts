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
