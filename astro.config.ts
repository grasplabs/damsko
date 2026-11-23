// The docs site: a plain Astro project, ours from top to bottom. The pages are docs/**/*.mdx, the
// examples examples/**/*.tsx, and the site itself is site/ (srcDir): its pages and layout, the
// blocks a page is made of, the chrome, the behaviour scripts and site/system, which holds the parts
// that make it a docs system (the page list, the example islands, the Markdown twins, the guard
// that lets a broken page fail alone).
//
//   pnpm run dev       astro dev on port 4517
//   pnpm run build     a static build into dist/
//   pnpm run preview   that build on port 4519
//
// No lock file: any number of these can run, from any folders, on different ports.
import { createHash } from "node:crypto";
import {
  lstatSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { createConnection, createServer } from "node:net";
import type { Server } from "node:net";
import { availableParallelism } from "node:os";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import type { UserOptions } from "@stylexjs/unplugin";
import stylex from "@stylexjs/unplugin/vite";
import type { AstroIntegration } from "astro";
import { defineConfig } from "astro/config";
import { Features } from "lightningcss";
import type { Plugin } from "vite";

import { version as damskoVersion } from "./scripts/build-registry.ts";
import { commitSha } from "./scripts/registry-dist.ts";
import { brandBookFile } from "./site/brand/book-file";
import { brokenPages, describe } from "./site/system/broken.ts";
import { root } from "./site/system/content.ts";
import { codeThemes } from "./site/system/highlight.ts";
import { headersFile, robotsTxt } from "./site/system/indexing.ts";
import { cacheStylex } from "./site/system/stylex-cache.ts";
import { subset, subsetNote } from "./site/system/subset.ts";
import {
  examplesMap,
  fewerChunks,
  freshServerRenders,
  guardPages,
  searchIndex,
  searchIndexFile,
  stylexSheet,
} from "./site/system/vite.ts";

// lightningcss version encoding: major * 65536 + minor * 256 + patch. The first versions with
// native light-dark() and oklch(), so StyleX's CSS keeps our oklch tokens as written and does not
// replace light-dark() with a polyfill that only works when color-scheme is set in the same sheet.
const version = (major: number, minor = 0) => major * 65_536 + minor * 256;
const modernTargets = {
  chrome: version(123),
  firefox: version(120),
  safari: version(17, 5),
};

const stylexOptions: Partial<UserOptions> = {
  // StyleX's rules in cascade layers of their own, declared after the base and the site's
  // (site/system/styles/base.css), so a component's style wins with no specificity tricks.
  useCSSLayers: true,
  // Hashes for defineVars come from file paths relative to this root; pinned so the server and
  // the client builds compute the same names.
  unstable_moduleResolution: { type: "commonJS", rootDir: root },
  // Examples import the tokens as a product does from its packages/ui
  // (`@grasp-os/ui/lib/tokens.stylex`): StyleX resolves that path to src/lib itself, so the
  // variables keep the names they are given there.
  aliases: {
    "@grasp-os/ui/lib/*": [`${root}src/lib/*`],
  },
  // The dev-only `data-style-src` attribute carried different line numbers in the server and
  // client transforms, which made every island report a hydration mismatch.
  enableDebugDataProp: false,
  lightningcssOptions: { targets: modernTargets, exclude: Features.LightDark },
  // In dev the CSS is served at /virtual:stylex.css and nothing else: the layout links it, and
  // site/behaviour/stylex-dev.ts refreshes the link when a file changes. The plugin's own runtime
  // keeps the CSS in a <style> that the router drops on navigation.
  devMode: "css-only",
};
// SAFETY: the StyleX plugin is typed `any`; it is a Vite plugin object, with the hook it adds for
// collecting its CSS.
const stylexVite: (
  options: Partial<UserOptions>
) => Plugin & { __stylexCollectCss?: () => string } = stylex;
const stylexPlugin = stylexVite(stylexOptions);
// In a build, StyleX would add its CSS to one sheet of its own choosing; site/system/vite.ts
// (stylexIntoBaseSheets) puts it in every sheet that holds the product's base instead.
const collectStylex = stylexPlugin.__stylexCollectCss;
delete stylexPlugin.generateBundle;
delete stylexPlugin.writeBundle;

// The import paths the docs' examples use, a product's packages/ui exports (`@grasp-os/ui/components/<name>`,
// `@grasp-os/ui/blocks/<name>/<name>`, `@grasp-os/ui/lib/<file>`, `@grasp-os/ui/hooks/<file>`), so the
// code on a page reads as a product's. Here they point at src/: a one-file component by its file, a
// folder component by its index.ts, a block by its file, and lib/ and hooks/ by their files.
const damskoAliases = [
  {
    find: /^@grasp-os\/ui\/lib\/(?<file>[a-z.-]+)$/u,
    replacement: `${root}src/lib/$1`,
  },
  {
    find: /^@grasp-os\/ui\/hooks\/(?<file>[a-z.-]+)$/u,
    replacement: `${root}src/hooks/$1`,
  },
  {
    find: /^@grasp-os\/ui\/blocks\/(?<block>[a-z0-9-]+)\/(?<file>[a-z0-9-]+)$/u,
    replacement: `${root}src/blocks/$1/$2.tsx`,
  },
  ...readdirSync(`${root}src/components`, { withFileTypes: true }).flatMap(
    (entry) => {
      if (entry.isDirectory()) {
        return [
          {
            find: `@grasp-os/ui/components/${entry.name}`,
            replacement: `${root}src/components/${entry.name}/index.ts`,
          },
        ];
      }
      return entry.name.endsWith(".tsx")
        ? [
            {
              find: `@grasp-os/ui/components/${entry.name.slice(0, -".tsx".length)}`,
              replacement: `${root}src/components/${entry.name}`,
            },
          ]
        : [];
    }
  ),
];

/**
 * Dev answers on 127.0.0.1 as well as on localhost. Vite listens on `localhost`, which Node takes as
 * ::1 alone on this machine, so a tool that asks 127.0.0.1 was refused and read the server as down.
 * `server.host` takes one address, and `true` would open the server to the network: instead a
 * loopback listener on 127.0.0.1 at the same port passes each connection through to ::1. Nothing
 * listens beyond this machine. Dev only.
 */
let loopback: Server | undefined;
const loopbackFour: AstroIntegration = {
  name: "damsko:loopback-ipv4",
  hooks: {
    "astro:server:start": ({ address, logger }) => {
      if (address.family !== "IPv6" || address.address !== "::1") {
        return;
      }
      loopback = createServer((client) => {
        const server = createConnection({ host: "::1", port: address.port });
        client.pipe(server).pipe(client);
        client.on("error", () => {
          server.destroy();
        });
        server.on("error", () => {
          client.destroy();
        });
      });
      loopback.on("error", (error) => {
        logger.warn(
          `127.0.0.1:${address.port} is not served too: ${error.message}`
        );
      });
      loopback.listen(address.port, "127.0.0.1", () => {
        logger.info(`also on http://127.0.0.1:${address.port}/`);
      });
    },
    "astro:server:done": () => {
      loopback?.close();
    },
  },
};

/**
 * Two client directives for the home page's showcase: `client:near` (site/start/near-directive.ts),
 * an island that loads a quarter of a window ahead in the box that scrolls it; `client:scroll`
 * (scroll-directive.ts), one that loads once the reader starts to move.
 */
const showcaseDirectives: AstroIntegration = {
  name: "damsko:showcase-directives",
  hooks: {
    "astro:config:setup": ({ addClientDirective }) => {
      addClientDirective({
        name: "near",
        entrypoint: `${root}site/start/near-directive.ts`,
      });
      addClientDirective({
        name: "scroll",
        entrypoint: `${root}site/start/scroll-directive.ts`,
      });
    },
  },
};

/**
 * In dev, the examples are found by the folder, each loaded by its own path
 * (site/system/example-files-dev.ts), not by the globs a build uses (example-files.ts): the dev
 * server's style collection walks every module a glob names, so the first page compiled all 720
 * examples twice and every component they import before it answered. A build is untouched.
 */
const examplesByPathInDev: AstroIntegration = {
  name: "damsko:examples-by-path-in-dev",
  hooks: {
    "astro:config:setup": ({ command, updateConfig }) => {
      if (command !== "dev") {
        return;
      }
      updateConfig({
        vite: {
          resolve: {
            alias: [
              {
                find: /^\.\/example-files$/u,
                replacement: `${root}site/system/example-files-dev.ts`,
              },
            ],
          },
        },
      });
    },
  },
};

/** A build draws every page it can, then names the pages it could not draw and fails. */
const brokenPagesFailTheBuild: AstroIntegration = {
  name: "damsko:broken-pages",
  hooks: {
    "astro:build:done": ({ logger }) => {
      const broken = brokenPages();
      if (broken.length === 0) {
        return;
      }
      for (const problem of broken) {
        logger.error(describe(problem));
      }
      throw new Error(
        `${broken.length} page${broken.length === 1 ? "" : "s"} could not be drawn; every other page was built.`
      );
    },
  },
};

/** robots.txt and _headers from the one switch (site/system/indexing.ts), written into the build at its
 * end so the switch is the only place that says whether the site may be listed. */
const crawlerFiles: AstroIntegration = {
  name: "damsko:crawler-files",
  hooks: {
    "astro:build:done": ({ dir, logger }) => {
      const out = fileURLToPath(dir);
      writeFileSync(nodePath.join(out, "robots.txt"), robotsTxt);
      writeFileSync(nodePath.join(out, "_headers"), headersFile);
      // A page-subset build says so in its own folder (site/system/subset.ts): never the site.
      if (subset) {
        writeFileSync(nodePath.join(out, ".subset"), subsetNote());
      }
      logger.info(
        "robots.txt and _headers written from site/system/indexing.ts"
      );
    },
  },
};

/** Every file under a folder, at any depth. */
const filesIn = (folder: string): string[] =>
  readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => nodePath.join(entry.parentPath, entry.name));

/** Every page of a build. */
const pagesIn = (folder: string): string[] =>
  filesIn(folder).filter((file) => file.endsWith(".html"));

/** version.json: the commit the build is of and Damsko's version, so a release can prove the site
 * serves it and a product can see that its pin is behind (README.md, "Pin a version").
 * Cloudflare's Workers Builds names the commit in WORKERS_CI_COMMIT_SHA. */
const versionFile: AstroIntegration = {
  name: "damsko:version-file",
  hooks: {
    "astro:build:done": ({ dir, logger }) => {
      const sha = commitSha();
      writeFileSync(
        nodePath.join(fileURLToPath(dir), "version.json"),
        `${JSON.stringify({ sha, version: damskoVersion })}\n`
      );
      logger.info(`version.json written: ${sha}`);
    },
  },
};

/**
 * A stylesheet's name says what is in it. StyleX's rules are added to the sheets that hold the
 * product base after the bundler named them (site/system/vite.ts, stylexIntoBaseSheets), so such a
 * sheet kept its name when its rules changed, and a host that keeps /_astro/ files for a year served a
 * returning reader the old rules with new markup. After the build each such sheet is renamed to the
 * hash of its final bytes and every page's link to it rewritten. A script naming it would hold the
 * old name, so the build fails if one does.
 */
const nameByContent: AstroIntegration = {
  name: "damsko:name-by-content",
  hooks: {
    "astro:build:done": ({ dir, logger }) => {
      const out = fileURLToPath(dir);
      const assets = nodePath.join(out, "_astro");
      const renamed = new Map<string, string>();
      for (const name of readdirSync(assets)) {
        const named = /^(?<stem>.+)\.(?<hash>[A-Za-z0-9_-]{8})\.css$/u.exec(
          name
        )?.groups;
        if (named?.stem === undefined) {
          continue;
        }
        const bytes = readFileSync(nodePath.join(assets, name));
        if (!bytes.includes("--site-stylex-slot")) {
          continue;
        }
        const hash = createHash("sha256")
          .update(bytes)
          .digest("base64url")
          .slice(0, 8);
        if (hash === named.hash) {
          continue;
        }
        const next = `${named.stem}.${hash}.css`;
        renameSync(nodePath.join(assets, name), nodePath.join(assets, next));
        renamed.set(`/_astro/${name}`, `/_astro/${next}`);
      }
      if (renamed.size === 0) {
        return;
      }
      for (const file of filesIn(out)) {
        if (!/\.(?:html|js|css|json|txt|md|xml)$/u.test(file)) {
          continue;
        }
        const text = readFileSync(file, "utf-8");
        let next = text;
        for (const [from, to] of renamed) {
          next = next.replaceAll(from, to);
        }
        if (next === text) {
          continue;
        }
        if (file.endsWith(".js")) {
          throw new Error(
            `${file} names a stylesheet renamed for its content; its own name would no longer say what is in it`
          );
        }
        writeFileSync(file, next);
      }
      logger.info(
        `${renamed.size} stylesheet${renamed.size === 1 ? "" : "s"} renamed for the final content`
      );
    },
  },
};

/**
 * StyleX's sheet (site/system/vite.ts, stylexSheet) is linked right after the product base's sheet in
 * every page that links the base, whatever its layout (the docs, the example frame, the brand book):
 * after it, so StyleX's layers are declared after the base's, as when its rules ended that sheet.
 * Runs after the sheets are renamed for their content.
 */
const stylexLink: AstroIntegration = {
  name: "damsko:stylex-link",
  hooks: {
    "astro:build:done": ({ dir, logger }) => {
      const out = fileURLToPath(dir);
      const assets = nodePath.join(out, "_astro");
      const bases = new Set(
        readdirSync(assets).filter(
          (name) =>
            name.endsWith(".css") &&
            readFileSync(nodePath.join(assets, name)).includes(
              "--site-stylex-slot"
            )
        )
      );
      let linked = 0;
      for (const file of pagesIn(out)) {
        const html = readFileSync(file, "utf-8");
        if (html.includes(`href="/_astro/stylex.css"`)) {
          continue;
        }
        let placed = false;
        const next = html.replaceAll(
          /<link\b[^>]*\bhref="\/_astro\/(?<name>[^"]+\.css)"[^>]*>/gu,
          (tag, name: string) => {
            if (placed || !bases.has(name)) {
              return tag;
            }
            placed = true;
            return `${tag}<link rel="stylesheet" href="/_astro/stylex.css">`;
          }
        );
        if (next === html) {
          continue;
        }
        writeFileSync(file, next);
        linked += 1;
      }
      logger.info(`StyleX's sheet linked in ${linked} pages`);
    },
  },
};

/** Drops a page's links to a stylesheet it already linked; says how many. */
const withoutRepeatedLinks = (file: string): number => {
  const html = readFileSync(file, "utf-8");
  const seen = new Set<string>();
  let dropped = 0;
  const next = html.replaceAll(
    /<link\b[^>]*\bhref="\/_astro\/[^"]*\.(?<hash>[A-Za-z0-9_-]{8})\.css"[^>]*>/gu,
    (tag, hash: string) => {
      if (!seen.has(hash)) {
        seen.add(hash);
        return tag;
      }
      dropped += 1;
      return "";
    }
  );
  if (next !== html) {
    writeFileSync(file, next);
  }
  return dropped;
};

/**
 * One stylesheet linked once. Rolldown emits the same CSS under two chunk names when two groups hold
 * it (src/styles/themes.css came out as islands.*.css and themes.*.css, the same hash), and a page
 * linked both: a request and 5KB twice. After the build, a link whose content hash an earlier link
 * on the page already loaded is dropped. The same hash is the same file, so nothing is lost.
 */
const oneLinkPerStylesheet: AstroIntegration = {
  name: "damsko:one-link-per-stylesheet",
  hooks: {
    "astro:build:done": ({ dir, logger }) => {
      const dropped = pagesIn(fileURLToPath(dir))
        .map((file) => withoutRepeatedLinks(file))
        .reduce((sum, count) => sum + count, 0);
      if (dropped > 0) {
        logger.info(`${dropped} repeated stylesheet links dropped`);
      }
    },
  },
};

/**
 * In dev, React's fast refresh needs a small script on the page before any component loads. Astro
 * adds it only to pages with its own islands; the examples here are islands of ours
 * (site/system/island.ts), so it goes on every page.
 */
const reactRefreshPreamble: AstroIntegration = {
  name: "damsko:react-refresh-preamble",
  hooks: {
    "astro:config:setup": ({ command, injectScript }) => {
      if (command !== "dev") {
        return;
      }
      injectScript(
        "page",
        'import { injectIntoGlobalHook } from "/@react-refresh"; injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => (type) => type;'
      );
    },
  },
};

export default defineConfig({
  root,
  srcDir: "./site",
  publicDir: "./public",
  outDir: "./dist",
  output: "static",
  // A page answers with or without a trailing slash, in dev and in a build alike (with "never" dev
  // answered /components/badge/ with a 404 while a build served it): one behaviour. Links inside
  // the site use the form without, and every page names that form as its canonical address
  // (site/layouts/Docs.astro), so there is one address for each page.
  trailingSlash: "ignore",
  // The router swaps pages in place; prefetching on hover and in view hides the fetch.
  prefetch: { prefetchAll: true },
  build: {
    concurrency: Math.min(8, availableParallelism()),
    // Every sheet a file, so StyleX's CSS can be added to it (site/system/vite.ts).
    inlineStylesheets: "never",
  },
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: { themes: codeThemes, defaultColor: false },
  },
  integrations: [
    mdx(),
    react({ compiler: true }),
    reactRefreshPreamble,
    brokenPagesFailTheBuild,
    crawlerFiles,
    versionFile,
    nameByContent,
    stylexLink,
    oneLinkPerStylesheet,
    loopbackFour,
    examplesByPathInDev,
    brandBookFile,
    showcaseDirectives,
  ],
  // The caches in this folder, not in node_modules: two worktrees that share node_modules (by a
  // symlink) would otherwise share the dev optimiser's output, and one server's re-optimising
  // gives the other's pages two copies of React ("Invalid hook call").
  cacheDir: "./.astro/cache",
  vite: {
    cacheDir: "./.astro/vite",
    plugins: [
      cacheStylex(stylexPlugin, root, stylexOptions),
      stylexSheet(() => collectStylex?.()),
      searchIndex(),
      guardPages(),
      fewerChunks(),
      examplesMap(),
      searchIndexFile(),
      freshServerRenders(),
    ],
    resolve: {
      alias: damskoAliases,
      // A second worktree that shares this one's node_modules by a symlink: Astro's compiler keys
      // its cache by path, so the packages must keep the worktree's own path, not the link's target.
      preserveSymlinks: lstatSync(
        nodePath.join(root, "node_modules")
      ).isSymbolicLink(),
    },
    // Everything a preview can reach must be in the dev optimiser's first run: a dependency found
    // later re-optimises, and the page then loads a second copy of React ("Invalid hook call").
    optimizeDeps: {
      entries: [
        "examples/**/*.tsx",
        "site/**/*.{astro,ts,tsx}",
        "src/components/*/index.ts",
      ],
      include: [
        "react/compiler-runtime",
        "react-dom/client",
        "react-dom/server",
        "astro/virtual-modules/transitions-events.js",
        "astro/virtual-modules/transitions-router.js",
        "astro/virtual-modules/transitions-swap-functions.js",
        "astro/virtual-modules/transitions-types.js",
      ],
    },
    server: {
      fs: { allow: [root] },
      // Dev compiles each module on its first request: a page that shows a component asks for 250 to
      // 400 of them, 7 to 10 s quiet and past a minute under load. Warm-up compiles the library, the
      // site's own scripts and the docs' frame while the server waits, so a first visit finds them done.
      warmup: {
        clientFiles: [
          "./src/components/*/index.ts",
          "./src/icons/index.ts",
          "./site/system/client.ts",
          "./site/behaviour/*.ts",
        ],
        ssrFiles: [
          "./site/layouts/Docs.astro",
          "./site/layouts/Frame.astro",
          "./site/system/Island.astro",
        ],
      },
    },
  },
});
