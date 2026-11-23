// Makes the examples drawn by ./Island.astro live: when one comes within a screen of view, its
// module is loaded and React takes over the HTML already there (hydration), with the same props
// and the same id prefix the server used, so nothing is drawn twice and no id changes.
//
// Loaded on every docs page and on the bare frame. React itself is fetched only when a page has
// an example, and each example folder is one file (site/system/vite.ts, fewerChunks).
//
//   <damsko-island data-example="button/states" data-props="{...}" data-prefix="i0-" ssr>
//
// `ssr` is removed once the island is live, as Astro does for its own islands, so a check can wait
// for `damsko-island[ssr]` to be gone.
import type { ComponentType } from "react";
import type { Root } from "react-dom/client";

type Loaders = Record<
  string,
  () => Promise<{ default: ComponentType<Record<string, unknown>> }>
>;

/** Where a build puts the map of one folder's examples, by a name that never changes (./vite.ts). */
export const examplesMapOf = (folder: string) =>
  `/_astro/examples-map/${folder}.js`;

// A folder's map is fetched once, when its first example comes near; in dev it is the module that
// lists them all. In a build the address is not written as an import, so no chunk names a map and
// none changes with it. A page open across a deploy holds the old map: when an example then fails
// to load, its map is fetched afresh once (a new address, as the browser keeps a module by its
// address) and the example tried again with the names it gives, before the page is loaded again
// as the last resort.
const mapLoads = new Map<string, Promise<Loaders>>();
const refreshed = new Set<string>();
const loadMap = async (folder: string, fresh: boolean): Promise<Loaders> => {
  const address = new URL(examplesMapOf(folder), location.origin);
  if (fresh) {
    address.searchParams.set("build", String(Date.now()));
  }
  const module: { examples: Loaders } = import.meta.env.DEV
    ? await import("./examples-map")
    : await import(/* @vite-ignore */ address.href);
  return module.examples;
};
const examplesMap = (folder: string, fresh = false) => {
  let load = fresh ? undefined : mapLoads.get(folder);
  if (load === undefined) {
    load = loadMap(folder, fresh);
    mapLoads.set(folder, load);
  }
  return load;
};

/** The example's module, by its folder's map; once more by a fresh map when the first try fails. */
const loadExample = async (path: string) => {
  const key = `/examples/${path}.tsx`;
  const [folder = ""] = path.split("/");
  try {
    const load = (await examplesMap(folder))[key];
    if (load === undefined) {
      throw new Error(`no example at examples/${path}.tsx`);
    }
    return await load();
  } catch (error) {
    if (import.meta.env.DEV || refreshed.has(folder)) {
      throw error;
    }
    refreshed.add(folder);
    const load = (await examplesMap(folder, true))[key];
    if (load === undefined) {
      throw error;
    }
    return await load();
  }
};

const roots = new Map<Element, Root>();
// A task boundary: what follows runs after the browser has had a turn (input, paint).
const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
// An island has no box of its own (display: contents), so its children are watched for it.
const islandOf = new WeakMap<Element, HTMLElement>();

// A page left open across a deploy still names the old build's files, and the new build has
// removed them: every example then fails to load and nothing on the page answers a press. The
// page is loaded again, once per address, so it names the files that exist. Once only: a file
// that is missing for another reason must not reload the page for ever.
const staleBuild = () => {
  const key = `damsko-island-reloaded:${location.pathname}`;
  try {
    if (sessionStorage.getItem(key) !== null) {
      return;
    }
    sessionStorage.setItem(key, "1");
  } catch {
    return;
  }
  location.reload();
};

const hydrate = async (island: HTMLElement) => {
  // Marked on the element, not in this module: in dev a saved file can load this module a second
  // time, and two copies must not both take the same island.
  if (island.hasAttribute("data-island-live")) {
    return;
  }
  island.setAttribute("data-island-live", "");
  const path = island.dataset.example ?? "";
  // One at a time, a task each: React, React DOM, then the example with what it uses. Loaded
  // together they were evaluated as one task of some 200ms at four times slower CPU, on every page
  // with an example. Fetching still starts at once for all three; only their evaluation is spread.
  const reactLoad = import("react");
  const clientLoad = import("react-dom/client");
  const moduleLoad = loadExample(path);
  // All three are awaited below one by one; a failure of a later one must not go unhandled first.
  const settled = Promise.allSettled([reactLoad, clientLoad, moduleLoad]);
  let createElement: typeof import("react").createElement;
  let hydrateRoot: typeof import("react-dom/client").hydrateRoot;
  let module: { default: ComponentType<Record<string, unknown>> };
  try {
    ({ createElement } = await reactLoad);
    await nextTask();
    ({ hydrateRoot } = await clientLoad);
    await nextTask();
    module = await moduleLoad;
    await nextTask();
  } catch {
    await settled;
    staleBuild();
    return;
  }
  // The page may have changed while the module loaded.
  if (!island.isConnected) {
    return;
  }
  const props = JSON.parse(island.dataset.props || "{}") as Record<
    string,
    unknown
  >;
  const root = hydrateRoot(island, createElement(module.default, props), {
    identifierPrefix: island.dataset.prefix ?? "",
  });
  roots.set(island, root);
  island.removeAttribute("ssr");
};

// A screen ahead, so an example is usually live before it is seen. An island in a hidden set (a
// States variant not chosen) is not laid out, so it waits until it is shown.
// The page scrolls in the shell's card ([data-site-scroller], site/chrome/DocsShell.tsx), not the
// window: measured against the window, what lies below the card's edge is clipped and never
// "near", so an example woke only once in view. Measured against the scroller itself, a screen
// ahead again. One observer per scroller: the router swaps the shell with each page.
const observers = new Map<Element | null, IntersectionObserver>();
const observerFor = (island: Element): IntersectionObserver => {
  const root = island.closest("[data-site-scroller]") ?? null;
  let found = observers.get(root);
  if (!found) {
    const made: IntersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          const island = islandOf.get(entry.target);
          if (!island) {
            continue;
          }
          for (const child of watched(island)) {
            made.unobserve(child);
          }
          void hydrate(island);
        }
      },
      { root, rootMargin: "100% 0px" }
    );
    observers.set(root, made);
    found = made;
  }
  return found;
};

/** What can be watched for an island: its children, and in place of a child with no box of its own
 * (display: contents, as a subtree ThemeProvider draws) that child's children, all the way down. */
const watched = (parent: Element): Element[] =>
  [...parent.children].flatMap((child) =>
    getComputedStyle(child).display === "contents" ? watched(child) : [child]
  );

const scan = () => {
  for (const island of document.querySelectorAll<HTMLElement>(
    "damsko-island[ssr]:not([data-island-seen])"
  )) {
    island.setAttribute("data-island-seen", "");
    if (island.children.length === 0 || island.hasAttribute("data-eager")) {
      // Asked to be live at once (the bare frame), or nothing drawn on the server: live now.
      void hydrate(island);
      continue;
    }
    // Every child, as Astro's own islands do: the first may draw no box (a hidden input, a portal's
    // anchor), and then it never reports being in view.
    // A box-less child never reports, so its own children are watched in its place.
    const targets = watched(island);
    if (targets.length === 0) {
      void hydrate(island);
      continue;
    }
    for (const child of targets) {
      islandOf.set(child, island);
      observerFor(island).observe(child);
    }
  }
};

// After the router swaps a page in, the old page's islands are gone from the document: they are
// unmounted then (not before, which would empty them while still on screen).
document.addEventListener("astro:after-swap", () => {
  // The old page's scroller is gone with it, and so is what its observer watched.
  for (const [root, observer] of observers) {
    if (root && !root.isConnected) {
      observer.disconnect();
      observers.delete(root);
    }
  }
  for (const [island, root] of roots) {
    if (island.isConnected) {
      continue;
    }
    root.unmount();
    roots.delete(island);
  }
});
document.addEventListener("astro:page-load", scan);
scan();
