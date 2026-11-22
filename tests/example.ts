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
