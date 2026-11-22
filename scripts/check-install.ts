// The registry installs as a product installs it: every item, added by name with the stock shadcn
// CLI from the registry built here and served on 127.0.0.1 at its commit's address, into a fresh
// workspace's packages/ui with the product's strict TypeScript flags. It holds when:
// - the installed src/ is Damsko's src/ byte for byte once the fonts are unpacked (nothing missing,
//   nothing extra, nothing written anywhere else), and every item says its version, commit and
//   licence;
// - the CLI added exactly the packages the items name, each left at the catalog's version;
// - the tree type-checks twice: as the package it is installed in, and as an app that imports
//   every file sees it (a declaration only a reference brings must still arrive);
// - the two apps Get started describes, built from that page's own code blocks
//   (site/start/get-started.ts), work in a browser: the app that holds the components in its own
//   src/, and the app that imports them from the workspace package through its exports. In each,
//   a button has its fill, the three font families load from the app's own origin, the base is
//   applied, light-dark() is kept, the mode follows a person's choice and is kept, and the
//   components' words follow a catalogue built while rendering, as one object per language
//   (scripts/check-install-app.tsx).
//
//   node scripts/check-install.ts           a fresh project in the system's temp folder, removed after
//   node scripts/check-install.ts --keep    keeps it, and says where
//
// Installs packages from npm, so it runs in CI as its own job, not among the gates. Needs `pnpm`
// and Playwright's Chromium.
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import nodePath from "node:path";
import { text } from "node:stream/consumers";
import { parseArgs } from "node:util";

import { chromium } from "@playwright/test";
import type { Page } from "@playwright/test";
import { parse, stringify } from "yaml";

import {
  appViteConfig,
  componentsJson,
  modeScript,
  packageExports,
  rootStyles,
  unpackFonts,
  workspaceViteConfig,
} from "../site/start/get-started.ts";
import { namespace, root, version as damskoVersion } from "./build-registry.ts";
import { isRecord, readJson, stringsAt } from "./json.ts";
import { registryItems } from "./registry-deps.ts";
import { writeRegistry } from "./registry-dist.ts";
import { serve } from "./serve.ts";

const { values } = parseArgs({
  options: { keep: { type: "boolean", default: false } },
});

const started = performance.now();
const scratch = mkdtempSync(nodePath.join(tmpdir(), "damsko-install-"));
/** The workspace, the package the items are installed in, and the app that imports it. */
const workspace = nodePath.join(scratch, "project");
const project = nodePath.join(workspace, "packages/ui");
const web = nodePath.join(workspace, "web");
const failures: string[] = [];

/**
 * Runs a command, failing the check with its output when it does not exit 0. Never synchronous:
 * the registry is served from this process, so it must keep answering while the CLI asks.
 */
const run = async (
  command: string,
  args: string[],
  cwd: string
): Promise<boolean> => {
  const child = spawn(command, args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const [stdout, stderr] = await Promise.all([
    text(child.stdout),
    text(child.stderr),
    once(child, "close"),
  ]);
  const code = child.exitCode;
  if (code !== 0) {
    failures.push(
      `${command} ${args.join(" ")} exited ${String(code)}:\n${stdout}${stderr}`
    );
    return false;
  }
  return true;
};

/** Every file under a folder, as paths relative to it. */
const filesUnder = (dir: string, prefix = ""): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory()
          ? filesUnder(
              nodePath.join(dir, entry.name),
              `${prefix}${entry.name}/`
            )
          : [`${prefix}${entry.name}`]
      )
    : [];

/** Writes a file of the package (or of `dir`), with the folders above it. */
const write = (path: string, value: unknown, dir = project) => {
  const file = nodePath.join(dir, path);
  mkdirSync(nodePath.dirname(file), { recursive: true });
  writeFileSync(
    file,
    typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`
  );
};

// The registry as the site serves it (scripts/registry-dist.ts), at its commit's address.
const registryDir = nodePath.join(scratch, "registry");
const commit = await writeRegistry(registryDir);
const served = await serve(registryDir);

/** The product's flags (its tsconfig.base.json), with no ambient types: what a file needs, it brings. */
const flags = {
  target: "es2024",
  lib: ["es2024", "dom", "dom.iterable"],
  module: "preserve",
  moduleResolution: "bundler",
  moduleDetection: "force",
  jsx: "react-jsx",
  resolveJsonModule: true,
  allowImportingTsExtensions: true,
  verbatimModuleSyntax: true,
  erasableSyntaxOnly: true,
  isolatedModules: true,
  noEmit: true,
  strict: true,
  noUncheckedIndexedAccess: true,
  noImplicitOverride: true,
  noFallthroughCasesInSwitch: true,
  noImplicitReturns: true,
  noUncheckedSideEffectImports: true,
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  skipLibCheck: true,
  types: [],
};

const fromCatalog = (names: string[]) =>
  Object.fromEntries(names.map((name) => [name, "catalog:"]));

/** An app's page: the mode a person chose before the first paint, as Get started gives it. */
const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Install check</title>
    ${modeScript}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

const mainTsx = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

const root = document.querySelector("#root");
if (root !== null) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
`;

/** Writes an app's own files: its page, its Vite config, its entry, the app and its styles. */
const writeApp = (dir: string, viteConfig: string, styles: string) => {
  write("index.html", indexHtml, dir);
  write("vite.config.ts", `${viteConfig}\n`, dir);
  write("src/main.tsx", mainTsx, dir);
  write(
    "src/App.tsx",
    readFileSync(nodePath.join(root, "scripts/check-install-app.tsx"), "utf-8"),
    dir
  );
  write("src/index.css", `${styles}\n`, dir);
};

/** What a page draws, read once: the faces it loaded, a button, the body and a plain paragraph. */
const drawn = async (page: Page) => {
  const button = await page
    .getByRole("button", { name: "Save changes" })
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        cursor: style.cursor,
        family: style.fontFamily,
        fill: style.backgroundColor,
      };
    });
  const rest = await page.evaluate(() => {
    const paragraph = getComputedStyle(
      document.querySelector("p") ?? document.body
    );
    const heading = getComputedStyle(
      document.querySelector("h1") ?? document.body
    );
    const body = getComputedStyle(document.body);
    return {
      loaded: [...document.fonts]
        .filter((face) => face.status === "loaded")
        .map((face) => face.family.replaceAll('"', "")),
      body: { family: body.fontFamily, margin: body.margin },
      heading: { size: heading.fontSize, weight: heading.fontWeight },
      paragraph: {
        boxSizing: paragraph.boxSizing,
        margin: paragraph.margin,
        minWidth: paragraph.minWidth,
        size: paragraph.fontSize,
      },
    };
  });
  return { button, ...rest };
};

/** The page's ground and the scheme its root is in. */
const ground = async (page: Page) =>
  await page.evaluate(() => ({
    color: getComputedStyle(document.body).backgroundColor,
    scheme: getComputedStyle(document.documentElement).colorScheme,
  }));

/** Opens the app and waits until it has drawn with its fonts. */
const open = async (page: Page, url: string) => {
  await page.goto(url);
  await page.getByRole("button", { name: "Save changes" }).waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
};

/** A built app in a browser: every claim the docs make to a product, on what the install built. */
const checkApp = async (label: string, dist: string) => {
  const fail = (message: string) => {
    failures.push(`${label}: ${message}`);
  };
  const expect = (ok: boolean, message: string) => {
    if (!ok) {
      fail(message);
    }
  };
  const css = filesUnder(dist)
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(nodePath.join(dist, file), "utf-8"))
    .join("\n");
  expect(
    css.includes("light-dark(") && !css.includes("--lightningcss-"),
    "the build rewrote the tokens' light-dark()"
  );
  expect(
    !/url\(\s*["']?data:font/u.test(css),
    "a font is inlined as data, which a product's content security policy refuses"
  );

  const site = await serve(dist);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ colorScheme: "light" });
    const page = await context.newPage();
    const fonts = new Map<string, number>();
    page.on("response", (response) => {
      if (response.url().endsWith(".woff2")) {
        fonts.set(response.url(), response.status());
      }
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });
    await open(page, site.url);

    // A component is drawn by its own styles, over the base's layer.
    const seen = await drawn(page);
    expect(
      !["rgba(0, 0, 0, 0)", "transparent"].includes(seen.button.fill),
      `the default button has no fill (${seen.button.fill})`
    );
    expect(
      seen.button.cursor === "pointer",
      `the base gives a button no pointer (${seen.button.cursor})`
    );

    // The fonts: each family loaded, from the six files, served by the app's own origin.
    for (const family of ["Geist", "Geist Mono", "Geist Serif"]) {
      expect(
        seen.loaded.includes(family),
        `the family "${family}" did not load (loaded: ${seen.loaded.join(", ")})`
      );
    }
    expect(
      seen.button.family.startsWith("Geist") &&
        seen.body.family.startsWith("Geist"),
      `the text is not set in the sans token (${seen.button.family}; ${seen.body.family})`
    );
    expect(
      fonts.size === 6 &&
        [...fonts].every(
          ([url, status]) => status === 200 && url.startsWith(site.url)
        ),
      `the six font files were not all served by the app's own origin (${JSON.stringify([...fonts])})`
    );

    // The base: one box model, nothing of the browser's own on an element with no style.
    expect(
      seen.body.margin === "0px" &&
        seen.paragraph.margin === "0px" &&
        seen.paragraph.boxSizing === "border-box" &&
        seen.paragraph.minWidth === "0px" &&
        seen.heading.size === seen.paragraph.size &&
        seen.heading.weight === "400",
      `the base stylesheet is not applied (${JSON.stringify({ body: seen.body, heading: seen.heading, paragraph: seen.paragraph })})`
    );

    // The components' words follow a catalogue built while rendering, one object per language.
    const catalogues = page.getByRole("status", { name: "Catalogues" });
    const again = page.getByRole("button", { name: "Draw again" });
    await page.getByRole("button", { name: "Copy", exact: true }).waitFor();
    await again.click();
    await again.click();
    await page
      .getByRole("status", { name: "Drawn" })
      .filter({ hasText: /^3$/u })
      .waitFor();
    expect(
      (await catalogues.textContent()) === "1",
      `a catalogue built again with the same words reached its readers as a new object (${String(await catalogues.textContent())} objects after 3 draws)`
    );
    await page.getByRole("button", { name: "Nederlands" }).click();
    await page.getByRole("button", { name: "Kopiëren", exact: true }).waitFor();
    await again.click();
    await page
      .getByRole("status", { name: "Drawn" })
      .filter({ hasText: /^4$/u })
      .waitFor();
    expect(
      (await catalogues.textContent()) === "2",
      `the words of a second language are not one new object (${String(await catalogues.textContent())})`
    );

    // The mode follows a person's choice, is kept, and without one follows the system.
    const light = await ground(page);
    await page.getByRole("button", { name: "Dark" }).click();
    const dark = await ground(page);
    expect(
      dark.scheme === "dark" && dark.color !== light.color,
      `choosing dark did not change the page (${JSON.stringify({ light, dark })})`
    );
    await open(page, site.url);
    const kept = await ground(page);
    expect(
      kept.color === dark.color,
      "the chosen mode was not kept over a reload"
    );
    await page.getByRole("button", { name: "Light" }).click();
    const back = await ground(page);
    expect(
      back.color === light.color,
      "choosing light did not bring the light ground back"
    );
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.emulateMedia({ colorScheme: "dark" });
    await open(page, site.url);
    const system = await ground(page);
    expect(
      system.color === dark.color,
      "with no choice kept, the page does not follow the system's dark setting"
    );
    expect(errors.length === 0, `the page threw: ${errors.join("; ")}`);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
    await site.close();
  }
};

try {
  // The workspace: the product's supply-chain settings and catalog; the package the items land in,
  // with the exports the docs give it; and an app that imports the package.
  const here: unknown = parse(
    readFileSync(nodePath.join(root, "pnpm-workspace.yaml"), "utf-8")
  );
  const settings = new Set([
    "minimumReleaseAge",
    "blockExoticSubdeps",
    "strictDepBuilds",
    "allowBuilds",
    "catalog",
  ]);
  write(
    "pnpm-workspace.yaml",
    stringify({
      packages: ["packages/*", "web"],
      ...Object.fromEntries(
        Object.entries(isRecord(here) ? here : {}).filter(([key]) =>
          settings.has(key)
        )
      ),
    }),
    workspace
  );
  const manifest = readJson(nodePath.join(root, "package.json"));
  write(
    "package.json",
    {
      name: "install-check",
      private: true,
      type: "module",
      // The same pnpm as here.
      packageManager: isRecord(manifest) ? manifest.packageManager : undefined,
    },
    workspace
  );
  /** What an app's build needs: Vite, React's plugin, StyleX's plugin and lightningcss. */
  const building = [
    "@stylexjs/unplugin",
    "@vitejs/plugin-react",
    "lightningcss",
    "vite",
  ];
  const start = fromCatalog([
    "@types/react",
    "@types/react-dom",
    "react",
    "react-dom",
    "shadcn",
    "typescript",
    ...building,
  ]);
  write("package.json", {
    name: "@grasp-os/ui",
    private: true,
    type: "module",
    exports: packageExports,
    devDependencies: start,
  });
  write(
    "package.json",
    {
      name: "web",
      private: true,
      type: "module",
      dependencies: {
        "@grasp-os/ui": "workspace:*",
        ...fromCatalog(["@stylexjs/stylex", "react", "react-dom"]),
      },
      devDependencies: fromCatalog([
        "@types/react",
        "@types/react-dom",
        "typescript",
        ...building,
      ]),
    },
    web
  );
  write("tsconfig.json", { compilerOptions: flags, include: ["src"] });
  // components.json as Get started gives it, with the registry at its commit's address: an
  // address that serves this commit's files and no other's.
  write(
    "components.json",
    `${componentsJson(`${served.url}/r/${commit}/{name}.json`)}\n`
  );
  const before = new Set(readdirSync(project));

  if (await run("pnpm", ["install"], workspace)) {
    // Every item by name, in one command, as a product syncs: never `--all`, which means shadcn's
    // own registry.
    const items = registryItems();
    await run(
      "pnpm",
      [
        "exec",
        "shadcn",
        "add",
        ...items.map((item) => `${namespace}/${item.name}`),
        "--overwrite",
        "--yes",
      ],
      project
    );

    // A font arrives as its file in base64, which the docs' command turns back into the file.
    const ours = new Set(filesUnder(nodePath.join(root, "src")));
    for (const file of ours) {
      const carried = nodePath.join(project, "src", `${file}.base64`);
      if (
        file.endsWith(".woff2") &&
        !(
          existsSync(carried) &&
          readFileSync(carried, "utf-8") ===
            readFileSync(nodePath.join(root, "src", file)).toString("base64")
        )
      ) {
        failures.push(`src/${file} did not arrive as src/${file}.base64`);
      }
    }
    await run("sh", ["-c", unpackFonts], project);

    // Byte for byte, both ways.
    const installed = new Set(filesUnder(nodePath.join(project, "src")));
    for (const file of ours) {
      if (!installed.has(file)) {
        failures.push(`src/${file} was not installed`);
      } else if (
        !readFileSync(nodePath.join(root, "src", file)).equals(
          readFileSync(nodePath.join(project, "src", file))
        )
      ) {
        failures.push(`src/${file} was installed changed`);
      }
    }
    for (const file of installed) {
      if (!ours.has(file)) {
        failures.push(`src/${file} was installed, and Damsko has no such file`);
      }
    }
    for (const entry of readdirSync(project)) {
      if (!before.has(entry) && !["node_modules", "src"].includes(entry)) {
        failures.push(`${entry} was written beside src/`);
      }
    }

    // Every item, as served at the commit's address, says where it came from and its licence.
    for (const item of items) {
      const meta: unknown = readJson(
        nodePath.join(registryDir, "r", commit, `${item.name}.json`)
      );
      const said = stringsAt(meta, "meta");
      if (
        said.version !== damskoVersion ||
        said.commit !== commit ||
        said.license === undefined
      ) {
        failures.push(
          `${item.name}: its meta does not say the version, the commit and the licence (${JSON.stringify(said)})`
        );
      }
    }

    // The packages the CLI added are the ones the items name, at the catalog's versions.
    const after: unknown = readJson(nodePath.join(project, "package.json"));
    const declared = {
      ...stringsAt(after, "dependencies"),
      ...stringsAt(after, "devDependencies"),
    };
    const named = new Set(
      items.flatMap((item) => [
        ...(item.dependencies ?? []),
        ...(item.devDependencies ?? []),
      ])
    );
    for (const [name, version] of Object.entries(declared)) {
      if (version !== "catalog:") {
        failures.push(
          `package.json: ${name} is "${version}", not the catalog's`
        );
      }
      if (!(name in start) && !named.has(name)) {
        failures.push(`package.json: ${name} was added, and no item names it`);
      }
    }
    for (const name of named) {
      if (!(name in declared)) {
        failures.push(
          `package.json: ${name} is named by an item, and was not added`
        );
      }
    }

    // As the package the tree lands in, then as an app that imports every file sees it.
    write("tsconfig.app.json", {
      extends: "./tsconfig.json",
      include: [],
      files: [...installed]
        .filter((file) => /\.tsx?$/u.test(file) && !file.endsWith(".d.ts"))
        .map((file) => `src/${file}`),
    });
    const tsc = async (config: string, cwd: string) =>
      await run("pnpm", ["exec", "tsc", "--noEmit", "-p", config], cwd);
    await tsc("tsconfig.json", project);
    await tsc("tsconfig.app.json", project);
    console.log(
      `install: ${items.length} items, ${installed.size} files installed into ${project}`
    );

    // The two apps Get started describes, from its own code blocks. The first holds the
    // components in its own src/ (the package doubles as that app: an alias, as the page says);
    // the second imports them from the workspace package through its exports, with no alias.
    writeApp(project, appViteConfig, rootStyles("./styles"));
    write("tsconfig.single.json", {
      extends: "./tsconfig.json",
      compilerOptions: {
        types: ["vite/client"],
        paths: { "@grasp-os/ui/*": ["./src/*"] },
      },
      include: [],
      files: ["src/main.tsx"],
    });
    writeApp(web, workspaceViteConfig, rootStyles("@grasp-os/ui/styles"));
    write(
      "tsconfig.json",
      {
        compilerOptions: { ...flags, types: ["vite/client"] },
        include: ["src"],
      },
      web
    );
    const build = async (cwd: string) =>
      await run(
        "node",
        [
          "--input-type=module",
          "-e",
          'import { build } from "vite"; await build({ logLevel: "warn" });',
        ],
        cwd
      );
    const appWorks = async (label: string, dir: string, config: string) => {
      if ((await tsc(config, dir)) && (await build(dir))) {
        await checkApp(label, nodePath.join(dir, "dist"));
      }
    };
    await appWorks(
      "the app with the components in its own src/",
      project,
      "tsconfig.single.json"
    );
    await appWorks(
      "the app that imports the workspace package",
      web,
      "tsconfig.json"
    );
    console.log("install: both apps built and opened in Chromium");
  }
} finally {
  await served.close();
  if (values.keep) {
    console.log(`install: kept ${scratch}`);
  } else {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const seconds = ((performance.now() - started) / 1000).toFixed(0);
if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL  ${failure}`);
  }
  console.error(`\ninstall: ${failures.length} problem(s), ${seconds}s`);
  process.exit(1);
}
console.log(
  `install: byte for byte, only the named packages, type-checks, and both apps work in a browser; ${seconds}s`
);
