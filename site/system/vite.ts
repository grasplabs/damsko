// The Vite plugins the docs site needs beyond Astro's own, used by astro.config.ts. Each says why it
// exists; most carry over something learnt under the previous docs system, the docs system before this one.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { isRunnableDevEnvironment } from "vite";
import type { EnvironmentModuleNode, Plugin } from "vite";

import { buildSearchIndex } from "../search-index.ts";
import { root } from "./content.ts";

// ---- StyleX's CSS as one sheet by a fixed name ---------------------------------------------------

/**
 * In a build, StyleX's plugin appends all the CSS it collected to one CSS file it picks itself. Here
 * the CSS is a sheet of its own, `/_astro/stylex.css`, under a name that never changes (as the
 * examples' map: ./examples-map.ts), so a change to one style changes this file and the pages whose
 * markup changed, not every page that links the sheet (1,157 of 1,519 files for one line of Badge's
 * padding when it was part of the hashed base sheet). It opens with its build stamp, the hash of its
 * own rules, which the router reads to see a newer sheet after a deploy (site/behaviour/stylex-sheet.ts).
 * After the build every page that links the product base (its `--site-stylex-slot` property) links
 * this sheet right after it (astro.config.ts, stylexLink), so its layers come after the base's as
 * before. StyleX's own build hooks are switched off in astro.config.ts.
 *
 * In dev the CSS is not in any file: the StyleX plugin serves it at /virtual:stylex.css, which the
 * layout and the frame link in their head.
 */
export const STYLEX_SHEET = "_astro/stylex.css";

export const stylexSheet = (collect: () => string | undefined): Plugin => ({
  name: "damsko:stylex-sheet",
  apply: "build",
  applyToEnvironment: (environment) => environment.name === "client",
  generateBundle() {
    const rules = collect() ?? "";
    const stamp = createHash("sha256").update(rules).digest("hex").slice(0, 12);
    this.emitFile({
      type: "asset",
      fileName: STYLEX_SHEET,
      source: `:root{--site-stylex-build:"${stamp}"}\n${rules}`,
    });
  },
});

// ---- Fewer requests on a first visit --------------------------------------------------------------

// What every preview needs: the React stack and the packages under the components, and the shared
// core of src/ (icons, tokens, focus). Not the components themselves: all of them together are
// 400KB, and a page shows a few. Astro's React renderer (for an Astro island, `client:idle`) too.
// A part of UI SDK that only one component uses goes with that component (fewerChunks, `owner`).
// The small packages both Recharts and TanStack Table import (use-sync-external-store, react-is,
// clsx) are here too: in the chart chunk, they made a data table's page load all of Recharts.
const islandStack = (id: string) =>
  /[\\/]node_modules[\\/](?:react|react-dom|react-is|scheduler|use-sync-external-store|clsx|@stylexjs|@floating-ui|@ui-sdk|@hugeicons|@astrojs[\\/]react-renderer)[\\/]/u.test(
    id
  ) ||
  (id.startsWith(`${root}src/`) && !id.startsWith(`${root}src/components/`));

// Recharts and what it brings: its own chunk, so only a page with a chart loads it. With it the chart
// itself: its folder, and chart.tsx and chart-math.ts beside it.
const chartStack = (id: string) =>
  /[\\/]node_modules[\\/](?:recharts|@reduxjs|react-redux|redux|redux-thunk|reselect|immer|victory-vendor|d3-[a-z-]+|internmap|es-toolkit|decimal\.js-light|eventemitter3|tiny-invariant)[\\/]/u.test(
    id
  ) || id.startsWith(`${root}src/components/chart`);

// TanStack Table: one chunk, only on a page with a data table. Left to Rolldown it was split into
// five chunks (useTable, the row model, the features) that imported each other in a circle, and on
// /examples/data-table/looks one ran before the one it read: "reading 'getDefaultTableOptions'".
const tableStack = (id: string) =>
  /[\\/]node_modules[\\/]@tanstack[\\/]/u.test(id);

/**
 * The site's own scripts and the router: site/ (its behaviour, the page scripts), Astro's runtime and
 * its virtual modules. Named, not "whatever the first view loads": an Astro island is an entry, so
 * the components and React it imports count as initial too, and site.js took them for every page.
 */
const siteOwn = (id: string) =>
  id.startsWith("\0") ||
  !id.startsWith("/") ||
  (id.startsWith(`${root}site/`) &&
    !/\.(?:tsx|jsx)$/u.test(id.split("?")[0] ?? id)) ||
  /[\\/]node_modules[\\/](?:astro|@astrojs[\\/]runtime)[\\/]/u.test(id);

/** "src/components/data-table/data-table.tsx" → "component-data-table": one chunk per folder component. */
const componentFolder = (id: string) => {
  const match = /^src\/components\/([a-z0-9-]+)\//u.exec(
    id.startsWith(root) ? id.slice(root.length) : ""
  );
  return match ? `component-${match[1]}` : null;
};

// Examples that draw with components nothing else on their page uses, far down it: each a chunk
// of its own, so those components load as the example nears the viewport, not with the page's
// first example. The Model selector's stack (Command, Popover, Toggle group, the makers' marks) and
// the working line's (Agent indicator, Shimmer) were eight requests and 32KB of a first visit to
// the prompt input's page.
const examplesApart = new Set([
  "prompt-input/compact",
  "prompt-input/glass",
  "prompt-input/model",
  "prompt-input/voice",
  "prompt-input/voice-problems",
  "prompt-input/working",
]);

/**
 * "examples/button/states.tsx" → "examples-button": one chunk per example folder, with what lies in
 * its subfolders (the streaming replay's `streams/*.json`). Left out, such a file went into the
 * chunk of the example that imports it, which imports the folder's chunk back: the two chunks
 * loaded in a circle and the data was still undefined when the folder's chunk read it.
 *
 * An example in `examplesApart` is a chunk of its own, "examples-prompt-input-model".
 */
const exampleFolder = (id: string) => {
  const match = /[\\/]examples[\\/]([a-z0-9-]+)[\\/](.+)$/u.exec(
    id.split("?")[0] ?? ""
  );
  if (!(match && id.startsWith(`${root}examples/`))) {
    return null;
  }
  const example = `${match[1]}/${(match[2] ?? "").replace(/\.tsx$/u, "")}`;
  return examplesApart.has(example)
    ? `examples-${example.replace("/", "-")}`
    : `examples-${match[1]}`;
};

/**
 * Rolldown splits the client scripts into many small shared chunks, each its own request. Here they
 * are grouped:
 *
 *   site         the site's own scripts and the router, on every page (siteOwn), only what every
 *                page's scripts reach (everyPage)
 *   brand        the brand book's own modules (site/brand), only on its pages
 *   islands      the React stack, the core of src/, the shared part of UI SDK and the components
 *                most others are built from (Button), loaded only when a preview comes to life
 *   component-*  one component and the part of UI SDK only it uses (only pages that show it load it)
 *   (an Astro island, `client:idle`, stays its own entry chunk)
 *   chart        Recharts and what it brings, only on a page with a chart
 *   table        TanStack Table, only on a page with a data table
 *   examples-*   the examples of one folder together, so a component page's stages are one request
 *
 * A group also takes what its modules import, unless a group of higher priority took it first. So the
 * chart and the examples come last: placed first, the first example folder took React and the router into its
 * own chunk, and every page loaded it.
 */
export const fewerChunks = (): Plugin => {
  // A module a component loads with import() (Button's hold) stays a chunk of its own, fetched
  // when it is needed: grouped with its component it would arrive with it.
  const lazy = new Set<string>();
  // An Astro island (`client:idle` and the rest, on Get started) is an entry of the client build,
  // as its framework's renderer is. Entries are "initial", so without this the site group took
  // each island and, through it, React and Recharts, and every page loaded them in site.js.
  // Left out, an island is a chunk of its own, loaded only by the page that draws it.
  const astroIslands = new Set<string>();
  const islandEntry = (id: string) =>
    /\.(?:tsx|jsx)$/u.test(id.split("?")[0] ?? id) ||
    /[\\/]node_modules[\\/]@astrojs[\\/][a-z-]+[\\/].*client/u.test(id);
  // A module of UI SDK that one component alone reaches, by its component's group name. The rest of
  // UI SDK, shared by several components, stays in islands. Without this a page loaded the parts
  // of every component (the tree's, the calendar's, the combobox's) to draw one.
  const owner = new Map<string, string>();
  const uiSdk = (id: string) => /[\\/]node_modules[\\/]@ui-sdk[\\/]/u.test(id);
  // A component that three or more other components are built from (Button, and what it brings:
  // Spinner, Popover) is part of the shared base, in islands: nearly every page with a preview
  // needs it, and as chunks of their own they were three more requests on each.
  const shared = new Set<string>();
  // UI SDK modules two or three components use (see buildEnd), with those components: kept out of
  // islands and owned by one of them.
  const few = new Map<string, string[]>();
  const sharedComponent = (id: string) => {
    const group = componentFolder(id) ?? owner.get(id);
    return (
      group !== undefined &&
      group !== null &&
      shared.has(group) &&
      !lazy.has(id)
    );
  };
  const inIslands = (id: string) =>
    !astroIslands.has(id) &&
    ((islandStack(id) && !owner.has(id) && !few.has(id)) ||
      sharedComponent(id));
  // What every page runs: the modules the layouts' scripts, Astro's page script and its router
  // reach by plain imports, islands left out. A module under site/ that only some pages reach (the
  // brand book's, a block's data) is not in the site chunk: there, a change to it renamed site.js
  // and with it every page of the build.
  const everyPage = new Set<string>();
  const everyPageEntry = (id: string) =>
    /^site\/layouts\/[A-Za-z]+\.astro\?astro&type=script/u.test(
      id.replace(root, "")
    ) ||
    id === "astro:scripts/page.js" ||
    /[\\/]node_modules[\\/]astro[\\/]components[\\/]ClientRouter\.astro\?astro&type=script/u.test(
      id
    );
  const sitePart = (id: string) =>
    !id.startsWith(`${root}site/`) || everyPage.has(id);
  return {
    name: "damsko:fewer-chunks",
    apply: "build",
    applyToEnvironment: (environment) => environment.name === "client",
    // A group may take only the modules it names (includeDependenciesRecursively: false) only when
    // entries may change their exports. Not `false`: Astro's own islands (`client:idle`, on Get
    // started) are entries whose default export Astro imports, and with `false` their files lost
    // it and they never came alive in a build. "allow-extension" keeps every export (Rolldown
    // refuses "exports-only" beside includeDependenciesRecursively: false).
    options: (options) => ({
      ...options,
      preserveEntrySignatures: "allow-extension",
    }),
    moduleParsed(info) {
      if (info.isEntry && islandEntry(info.id)) {
        astroIslands.add(info.id);
      }
      if (!info.id.startsWith(`${root}src/`)) {
        return;
      }
      for (const target of info.dynamicallyImportedIds) {
        if (target.startsWith(`${root}src/`)) lazy.add(target);
      }
    },
    buildEnd() {
      const reached = [...this.getModuleIds()].filter((id) =>
        everyPageEntry(id)
      );
      while (reached.length > 0) {
        const current = reached.pop() ?? "";
        for (const dependency of this.getModuleInfo(current)?.importedIds ??
          []) {
          if (everyPage.has(dependency) || islandEntry(dependency)) {
            continue;
          }
          everyPage.add(dependency);
          reached.push(dependency);
        }
      }
      // What one lazy module alone brings in, in its own component, is lazy with it. The Artifact
      // viewer's PDF renderer is loaded with import(), but its page (page.tsx) and its one import of
      // PDF.js (pdfjs.ts) are plain imports of that renderer: grouped with the component, they made
      // the viewer's own chunk import PDF.js, and every page with a viewer fetched and ran 440 KB of
      // it at once (one task of 60 to 78ms as the first viewer came to life). A module that two lazy
      // modules share (the viewer's find and its virtual rows, which the shell and every renderer
      // use) stays with the component: lazy too, each became a small request of its own.
      const broughtBy = new Map<string, string>();
      for (const id of lazy) {
        broughtBy.set(id, id);
      }
      for (let grew = true; grew;) {
        grew = false;
        for (const id of this.getModuleIds()) {
          const folder = componentFolder(id);
          if (broughtBy.has(id) || folder === null) {
            continue;
          }
          const importers = this.getModuleInfo(id)?.importers ?? [];
          const [first] = importers;
          const bringer =
            first === undefined ? undefined : broughtBy.get(first);
          if (
            bringer === undefined ||
            !importers.every(
              (from) =>
                broughtBy.get(from) === bringer &&
                componentFolder(from) === folder
            )
          ) {
            continue;
          }
          broughtBy.set(id, bringer);
          lazy.add(id);
          grew = true;
        }
      }
      // Who reaches each UI SDK module: a component's group, or anything else (an example, the
      // site's agent bridge, another package), which counts as a second user.
      const reach = new Map<string, Set<string>>();
      for (const id of this.getModuleIds()) {
        if (uiSdk(id)) {
          continue;
        }
        const user = componentFolder(id) ?? "elsewhere";
        const seen = new Set<string>();
        const stack = [id];
        while (stack.length > 0) {
          const current = stack.pop() ?? "";
          for (const dependency of this.getModuleInfo(current)?.importedIds ??
            []) {
            if (seen.has(dependency) || !uiSdk(dependency)) {
              continue;
            }
            seen.add(dependency);
            const users = reach.get(dependency) ?? new Set<string>();
            users.add(user);
            reach.set(dependency, users);
            stack.push(dependency);
          }
        }
      }
      if (process.env.GRASP_REACH) {
        writeFileSync(
          process.env.GRASP_REACH,
          JSON.stringify(
            [...reach].map(([id, users]) => [id.replace(root, ""), [...users]])
          )
        );
      }
      for (const [id, users] of reach) {
        const [only] = users;
        if (users.size === 1 && only && only !== "elsewhere") {
          owner.set(id, only);
        }
        // Two or three components and nothing else: not the shared base. Kept out of islands, and
        // given to one of them (chosen below, once it is known which are built on which).
        else if (users.size <= 3 && !users.has("elsewhere")) {
          few.set(id, [...users]);
        }
      }
      // Which other components each component is built from, however indirectly.
      const builtOn = new Map<string, Set<string>>();
      for (const id of this.getModuleIds()) {
        const user = componentFolder(id);
        if (!user) {
          continue;
        }
        const seen = new Set<string>();
        const stack = [id];
        while (stack.length > 0) {
          const current = stack.pop() ?? "";
          for (const dependency of this.getModuleInfo(current)?.importedIds ??
            []) {
            if (seen.has(dependency)) {
              continue;
            }
            seen.add(dependency);
            const group = componentFolder(dependency);
            if (group && group !== user) {
              const users = builtOn.get(group) ?? new Set<string>();
              users.add(user);
              builtOn.set(group, users);
            }
            if (!/[\\/]node_modules[\\/]/u.test(dependency)) {
              stack.push(dependency);
            }
          }
        }
      }
      for (const [group, users] of builtOn) {
        if (users.size >= 3) shared.add(group);
      }
      // The Outline is the docs rail, on every docs page beside the shell: with the shared base, not a
      // request of its own on each page (its compact form, loaded with import(), stays apart).
      shared.add("component-outline");
      // A module two or three components share goes with the one the others are built on (Checkbox,
      // for what Data table also uses), whose chunk those pages load anyway; else the first by name.
      // Left to Rolldown it was a small chunk of its own, a request more on each of their pages.
      for (const [id, users] of few) {
        const [first] = [...users].sort(
          (a, b) =>
            (builtOn.get(b)?.size ?? 0) - (builtOn.get(a)?.size ?? 0) ||
            a.localeCompare(b)
        );
        if (first && !shared.has(first)) {
          owner.set(id, first);
        }
      }
    },
    // GRASP_CHUNKS=<file> pnpm run build writes which modules went into which client chunk.
    generateBundle(_options, bundle) {
      const file = process.env.GRASP_CHUNKS;
      if (!file) {
        return;
      }
      const chunks = Object.values(bundle).flatMap((chunk) =>
        chunk.type === "chunk"
          ? [
              {
                file: chunk.fileName,
                entry: chunk.isEntry,
                modules: chunk.moduleIds.map((id) => [
                  id.replace(root, ""),
                  chunk.modules[id]?.renderedLength ?? 0,
                ]),
              },
            ]
          : []
      );
      writeFileSync(file, JSON.stringify(chunks, null, 1));
    },
    outputOptions: (options) => ({
      ...options,
      codeSplitting: {
        groups: [
          {
            name: "site",
            tags: ["$initial"],
            priority: 5,
            test: (id: string) =>
              siteOwn(id) &&
              sitePart(id) &&
              !astroIslands.has(id) &&
              id !== EXAMPLES_MAP_MODULE &&
              id !== "\0virtual:damsko-search",
          },
          // The brand book's own modules: only its pages load them, so an edit to one renames them
          // and those pages, not site.js and every page.
          {
            name: "brand",
            priority: 5,
            includeDependenciesRecursively: false,
            test: (id: string) =>
              id.startsWith(`${root}site/brand/`) &&
              !astroIslands.has(id) &&
              !islandEntry(id),
          },
          // React and React DOM a chunk of their own, so an island can load them one at a time,
          // a task each, before the rest (island.ts): together they were one task of 200ms at four
          // times slower CPU on every example page.
          {
            name: "react",
            priority: 5,
            test: (id: string) =>
              /[\\/]node_modules[\\/](?:react|react-dom|scheduler)[\\/]/u.test(
                id
              ),
          },
          { name: "islands", priority: 4, test: (id: string) => inIslands(id) },
          {
            name: (id: string) => componentFolder(id) ?? owner.get(id) ?? null,
            priority: 3,
            includeDependenciesRecursively: false,
            test: (id: string) =>
              !inIslands(id) &&
              ((componentFolder(id) !== null && !lazy.has(id)) ||
                owner.has(id)),
          },
          { name: "chart", priority: 2, test: chartStack },
          { name: "table", priority: 2, test: tableStack },
          {
            name: (id: string) => exampleFolder(id),
            priority: 1,
            includeDependenciesRecursively: false,
            test: (id: string) => exampleFolder(id) !== null,
          },
        ],
      },
    }),
  };
};

// ---- The examples' map, by a fixed name -----------------------------------------------------------

/** The module that lists every example (./examples-map.ts). */
const EXAMPLES_MAP_MODULE = `${root}site/system/examples-map.ts`;

/**
 * The examples' map is its own entry of the client build, written as `_astro/examples-map.js` with no
 * hash, and loaded by that name (./island.ts, EXAMPLES_MAP). Everything it points at keeps its hashed
 * name. As part of the site's shared chunk it renamed that chunk on any change to any example, and
 * with it every chunk and every page of the build (1,159 of 1,519 files for one word in one example).
 */
export const examplesMap = (): Plugin => ({
  name: "damsko:examples-map",
  apply: "build",
  applyToEnvironment: (environment) => environment.name === "client",
  buildStart() {
    this.emitFile({
      type: "chunk",
      id: EXAMPLES_MAP_MODULE,
      fileName: "_astro/examples-map.js",
      preserveSignature: "strict",
    });
  },
});

// ---- Fresh server renders in dev -------------------------------------------------------------------

/**
 * In dev, a saved file that the browser has also loaded (an example, a component) is left to the
 * browser's own hot update: Astro's `astro:hmr-reload` skips any module the client graph holds, so
 * the server kept the first version it ran and drew it on every later request, which the browser
 * then hydrated over its newer code (a hydration mismatch until a restart). Here, before Astro's
 * hook, every module of the saved file and everything that imports it are marked stale on the
 * server side, in Vite's graph and in the module runner's cache, so the next request draws the file
 * as it is now. The browser's hot update is left as it was.
 */
export const freshServerRenders = (): Plugin => ({
  name: "damsko:fresh-server-renders",
  apply: "serve",
  hotUpdate: {
    order: "pre",
    handler({ modules, timestamp }) {
      if (this.environment.config.consumer !== "server") {
        return;
      }
      const stale = new Set<EnvironmentModuleNode>();
      for (const mod of modules) {
        this.environment.moduleGraph.invalidateModule(
          mod,
          stale,
          timestamp,
          true
        );
      }
      if (!isRunnableDevEnvironment(this.environment)) {
        return;
      }
      const { runner } = this.environment;
      for (const mod of stale) {
        const evaluated = mod.id
          ? runner.evaluatedModules.getModuleById(mod.id)
          : undefined;
        if (evaluated) {
          runner.evaluatedModules.invalidateModule(evaluated);
        }
      }
    },
  },
});

// ---- The search index ----------------------------------------------------------------------------

/**
 * The header's search reads its index from `virtual:damsko-search`, built from the pages' MDX
 * (site/search-index.ts). Imported lazily, so it is a small file of its own, loaded the first time
 * search opens. In dev it is built again whenever a page is saved, added or removed.
 */
/** Where a build writes the search index, by a name that never changes (../behaviour/search.ts). */
const SEARCH_INDEX_FILE = "_astro/search-index.js";

/**
 * The search index is its own entry of the client build, written as `_astro/search-index.js` with no
 * hash and loaded by that name (../behaviour/search.ts). Imported by its
 * hashed name, site.js named it, so one word in any page's MDX renamed site.js and with it every
 * chunk and every page of the build (1,512 of 1,628 files for one word on Separator's page).
 */
export const searchIndexFile = (): Plugin => ({
  name: "damsko:search-index-file",
  apply: "build",
  applyToEnvironment: (environment) => environment.name === "client",
  buildStart() {
    this.emitFile({
      type: "chunk",
      id: "virtual:damsko-search",
      fileName: SEARCH_INDEX_FILE,
      preserveSignature: "strict",
    });
  },
});

export const searchIndex = (): Plugin => {
  const id = "virtual:damsko-search";
  const resolved = `\0${id}`;
  const stale = (server: import("vite").ViteDevServer) => {
    for (const environment of Object.values(server.environments)) {
      const module = environment.moduleGraph.getModuleById(resolved);
      if (module) {
        environment.moduleGraph.invalidateModule(module);
      }
    }
  };
  return {
    name: "damsko:search-index",
    resolveId: (source) => (source === id ? resolved : undefined),
    load: (source) =>
      source === resolved
        ? `export default ${JSON.stringify(buildSearchIndex(root))};`
        : undefined,
    configureServer(server) {
      const changed = (file: string) => {
        if (file.startsWith(join(root, "docs")) && file.endsWith(".mdx")) {
          stale(server);
        }
      };
      server.watcher.on("add", changed);
      server.watcher.on("unlink", changed);
      server.watcher.on("change", changed);
    },
  };
};

// ---- A broken page fails alone ---------------------------------------------------------------------

/** What is known about a page that could not be compiled. */
export interface PageProblem {
  file: string;
  message: string;
  line?: number;
}

/**
 * An MDX page that does not compile (a syntax error) or imports something that is not there would
 * stop the whole build: every page waits on one file. This wraps the MDX plugin's transform: when a
 * page fails, the page's module becomes a small stand-in that exports what went wrong, and
 * site/pages/[...slug].astro shows that on the page, records it, and the build carries on with the
 * rest (see brokenPages in ./broken.ts). Only files under docs/ are guarded: an example or a block
 * that fails still fails loudly where it is used.
 */
export const guardPages = (): Plugin => ({
  name: "damsko:guard-pages",
  enforce: "post",
  configResolved(config) {
    const plugin = config.plugins.find(
      (candidate) => candidate.name === "@mdx-js/rolldown"
    );
    const original = plugin?.transform;
    if (!(plugin && original)) {
      throw new Error(
        "damsko:guard-pages: the MDX plugin (@mdx-js/rolldown) was not found; the page guard cannot work."
      );
    }
    const handler =
      typeof original === "function" ? original : original.handler;
    const docs = join(root, "docs");
    const wrapped: typeof handler = async function wrapped(
      this: ThisParameterType<typeof handler>,
      code,
      id,
      options
    ) {
      const file = id.split("?")[0] ?? id;
      if (!(file.startsWith(docs) && file.endsWith(".mdx"))) {
        return await handler.call(this, code, id, options);
      }
      let problem: PageProblem | null = null;
      let result: Awaited<ReturnType<typeof handler>> = null;
      try {
        result = await handler.call(this, code, id, options);
      } catch (error) {
        problem = describeCompileError(error, file);
      }
      if (!problem) {
        problem = await missingImport(this, code, file);
      }
      if (!problem) {
        return result;
      }
      // The stand-in, compiled by the same plugin so it has the shape every page module has.
      return await handler.call(this, standIn(problem), id, options);
    };
    plugin.transform =
      typeof original === "function"
        ? wrapped
        : { ...original, handler: wrapped };
  },
});

const describeCompileError = (error: unknown, file: string): PageProblem => {
  const value = error as {
    message?: string;
    reason?: string;
    line?: number;
    loc?: { line?: number };
    place?: { line?: number };
    position?: { start?: { line?: number } };
  };
  const line =
    value.line ??
    value.loc?.line ??
    value.place?.line ??
    value.position?.start?.line;
  return {
    file: file.slice(root.length),
    message:
      (value.reason ?? value.message ?? String(error)).split("\n")[0] ?? "",
    line,
  };
};

/**
 * The first import a page makes that resolves to nothing, as a problem; null when all resolve. Read
 * from the page's own source: MDX allows `import` only at the top level of a page, outside code.
 */
const missingImport = async (
  context: {
    resolve: (
      source: string,
      importer: string
    ) => Promise<{ id: string } | null>;
  },
  code: string,
  file: string
): Promise<PageProblem | null> => {
  const lines = code.split("\n");
  let fenced = false;
  for (const [index, line] of lines.entries()) {
    if (/^\s*(?:```|~~~)/u.test(line)) {
      fenced = !fenced;
    }
    const specifier = fenced
      ? null
      : /^import\s(?:[^"']*\sfrom\s)?["']([^"']+)["']/u.exec(line)?.[1];
    if (!specifier) {
      continue;
    }
    const resolved = await context.resolve(specifier, file).catch(() => null);
    if (!resolved) {
      return {
        file: file.slice(root.length),
        message: `Cannot find "${specifier}", imported by this page.`,
        line: index + 1,
      };
    }
  }
  return null;
};

/** A page module that renders nothing and says what went wrong. */
const standIn = (problem: PageProblem) =>
  `export const pageProblem = ${JSON.stringify(problem)};\n`;
