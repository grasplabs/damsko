// The registry installs as a product installs it, from the registry built here and served on
// 127.0.0.1. Two parts.
//
// Every item: added by name with the stock shadcn CLI into a fresh workspace's packages/ui with
// the product's catalog and strict TypeScript flags, as a product pins a version: from the
// release's archive (scripts/registry-dist.ts, as .github/workflows/release.yml packs it), which
// the script Get started gives downloads, checks and serves. It holds when
// - the fonts arrive packed, their check says so, and their script unpacks them;
// - the installed src/ is then Damsko's src/ byte for byte (nothing missing, nothing extra,
//   nothing written anywhere else), and every item says its version, commit and licence;
// - the CLI added exactly the packages the items name, each left at the catalog's version;
// - the tree type-checks twice: as the package it is installed in, and as an app that imports
//   every file sees it (a declaration only a reference brings must still arrive).
//
// Get started, as written: every block of the page that says what it does
// (site/start/get-started.ts, `does`) is carried out in the page's order in an empty folder: its
// commands run, its files written, and nothing else: no file, package or setting the page does
// not show. So the page cannot say one thing and this prove another. Four apps come of it: the
// app with the components in its own src/, the app that imports them from a workspace package,
// that app beside Tailwind, and that app with a Geist of its own. Each must build (`pnpm build`,
// the page's last block) and draw its button with its fill, from fonts its own origin serves,
// with light-dark() kept. No block runs the fonts' script but the one that installs them, and no
// app has a script that does: the fonts are files by then, whatever builds the app.
//
// Then, in each of the first two, one file takes the place of the page's src/App.tsx
// (scripts/check-install-app.tsx) to show the rest in a browser: the three font families from
// their six files, the reset applied, the mode following a person's choice and kept, and the
// components' words following a catalogue built while rendering, as one object per language.
// Beside Tailwind, where the reset is left out, a part of the app that is not Damsko's
// (scripts/check-install-own.tsx) is drawn before anything of Damsko's is there and again after,
// and must be the same pixels with the same computed styles. With a Geist of its own (Fontsource's,
// as an older kit loads it), the app is built by the bundler called directly, with no package
// script, and must load that Geist and no file of Damsko's Geist, with Geist Serif and Geist Mono
// from Damsko's files.
//
//   node scripts/check-install.ts           fresh folders in the system's temp folder, removed after
//   node scripts/check-install.ts --keep    keeps them, and says where
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
  renameSync,
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
  packageExports,
  releasesAddress,
  sections,
  siteAddress,
} from "../site/start/get-started.ts";
import type { Block } from "../site/start/get-started.ts";
import { namespace, root, version as damskoVersion } from "./build-registry.ts";
import { isRecord, readJson, stringsAt } from "./json.ts";
import { registryItems } from "./registry-deps.ts";
import { archiveName, packRegistry, writeRegistry } from "./registry-dist.ts";
import { serve } from "./serve.ts";

const { values } = parseArgs({
  options: { keep: { type: "boolean", default: false } },
});

const started = performance.now();
const scratch = mkdtempSync(nodePath.join(tmpdir(), "damsko-install-"));
/** The workspace every item is installed in, and its package. */
const workspace = nodePath.join(scratch, "project");
const project = nodePath.join(workspace, "packages/ui");
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
      `${command} ${args.join(" ")} (in ${cwd}) exited ${String(code)}:\n${stdout}${stderr}`
    );
    return false;
  }
  return true;
};

/** Whether a command exits 0, with nothing said either way. */
const passes = async (command: string, args: string[], cwd: string) => {
  const child = spawn(command, args, { cwd, stdio: "ignore" });
  await once(child, "close");
  return child.exitCode === 0;
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

/** Writes a file under `dir`, with the folders above it. */
const write = (dir: string, path: string, value: unknown) => {
  const file = nodePath.join(dir, path);
  mkdirSync(nodePath.dirname(file), { recursive: true });
  writeFileSync(
    file,
    typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`
  );
};

// The registry as the site serves it, and its archive where a tag's release has it
// (scripts/registry-dist.ts).
const registryDir = nodePath.join(scratch, "registry");
const commit = await writeRegistry(registryDir);
const tag = packRegistry(registryDir);
for (const name of [archiveName(tag), `${archiveName(tag)}.sha256`]) {
  mkdirSync(nodePath.join(registryDir, "releases", tag), { recursive: true });
  renameSync(
    nodePath.join(registryDir, name),
    nodePath.join(registryDir, "releases", tag, name)
  );
}
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

/** A JSON file as Vite's template writes them: with comments and trailing commas. */
const lenientJson = (source: string): unknown =>
  JSON.parse(
    source
      .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
      .replaceAll(/^\s*\/\/.*$/gmu, "")
      .replaceAll(/,(?=\s*[}\]])/gu, "")
  );

/** Carries one block of the page out, as the block says, from the folder its section starts in. */
const carryOut = async (block: Block, dir: string): Promise<boolean> => {
  const { does } = block;
  if (does === undefined) {
    return true;
  }
  // The page writes the registry's address as a placeholder for its own origin, and the releases'
  // as GitHub's: here, this server.
  const code = block.code
    .replaceAll(siteAddress, served.url)
    .replaceAll(releasesAddress, `${served.url}/releases`);
  if (does.kind === "run") {
    return await run("sh", ["-ec", code], nodePath.join(dir, does.in));
  }
  if (does.kind === "write") {
    write(dir, does.file, `${code}\n`);
    return true;
  }
  const file = nodePath.join(dir, does.file);
  if (does.kind === "head") {
    writeFileSync(
      file,
      readFileSync(file, "utf-8").replace("<head>", `<head>\n${code}`)
    );
    return true;
  }
  const whole = lenientJson(readFileSync(file, "utf-8"));
  let at = whole;
  for (const key of does.at) {
    if (!isRecord(at)) {
      break;
    }
    at[key] ??= {};
    at = at[key];
  }
  const members = lenientJson(`{\n${code}\n}`);
  if (!(isRecord(at) && isRecord(members))) {
    failures.push(`${does.file}: has no object at ${does.at.join(".")}`);
    return false;
  }
  Object.assign(at, members);
  write(dir, does.file, whole);
  return true;
};

/** The blocks of one step of the page. */
const stepOf = (section: string, step: string): Block[] =>
  sections
    .find((candidate) => candidate.slug === section)
    ?.steps.find((candidate) => candidate.slug === step)?.blocks ?? [];

/**
 * A font arrives as its file in base64. While it is packed the fonts' own check fails, so a
 * skipped unpack cannot pass; the script unpacks, and may be run again.
 */
const fontsUnpacked = async (ours: Set<string>) => {
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
  const unpack = "src/styles/fonts/unpack.mjs";
  if (await passes("node", [unpack, "--check"], project)) {
    failures.push(`${unpack} --check passes while the fonts are packed`);
  }
  await run("node", [unpack], project);
  await run("node", [unpack], project);
  await run("node", [unpack, "--check"], project);
};

/** The packages the CLI added are the ones the items name, at the catalog's versions. */
const namedPackages = (
  items: ReturnType<typeof registryItems>,
  start: Record<string, string>
) => {
  const declared = {
    ...stringsAt(
      readJson(nodePath.join(project, "package.json")),
      "dependencies"
    ),
    ...stringsAt(
      readJson(nodePath.join(project, "package.json")),
      "devDependencies"
    ),
  };
  const named = new Set(
    items.flatMap((item) => [
      ...(item.dependencies ?? []),
      ...(item.devDependencies ?? []),
    ])
  );
  for (const [name, pinned] of Object.entries(declared)) {
    if (pinned !== "catalog:") {
      failures.push(`package.json: ${name} is "${pinned}", not the catalog's`);
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
};

/** Every item, into a workspace package with the product's catalog and flags. */
const everyItem = async () => {
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
    workspace,
    "pnpm-workspace.yaml",
    stringify({
      packages: ["packages/*"],
      ...Object.fromEntries(
        Object.entries(isRecord(here) ? here : {}).filter(([key]) =>
          settings.has(key)
        )
      ),
    })
  );
  const manifest = readJson(nodePath.join(root, "package.json"));
  write(workspace, "package.json", {
    name: "install-check",
    private: true,
    type: "module",
    // The same pnpm as here.
    packageManager: isRecord(manifest) ? manifest.packageManager : undefined,
  });
  const start = Object.fromEntries(
    [
      "@types/react",
      "@types/react-dom",
      "react",
      "react-dom",
      "shadcn",
      "typescript",
    ].map((name) => [name, "catalog:"])
  );
  write(project, "package.json", {
    name: "@grasp-os/ui",
    private: true,
    type: "module",
    exports: packageExports,
    devDependencies: start,
  });
  write(project, "tsconfig.json", { compilerOptions: flags, include: ["src"] });
  // baseColor "" keeps the CLI off shadcn's own site. The registry's address is the page's, for a
  // pinned version: its script and its line of components.json, carried out below.
  write(project, "components.json", {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: false,
    tsx: true,
    tailwind: { config: "", css: "", baseColor: "", cssVariables: true },
    aliases: {
      components: "@grasp-os/ui/components",
      ui: "@grasp-os/ui/components",
      lib: "@grasp-os/ui/lib",
      hooks: "@grasp-os/ui/hooks",
      utils: "@grasp-os/ui/lib/utils",
    },
  });
  const pin = stepOf("pin-and-update", "pin-a-version");
  if (pin.length === 0) {
    failures.push("Get started no longer says how to pin a version");
    return;
  }
  for (const block of pin) {
    // oxlint-disable-next-line no-await-in-loop -- a page is followed one block after the other
    await carryOut(block, project);
  }
  const before = new Set(readdirSync(project));
  if (!(await run("pnpm", ["install"], workspace))) {
    return;
  }
  // Every item by name, in one command, as a product syncs: never `--all`, which means shadcn's
  // own registry. Through the page's script, with the tag: from the archive, not from a site.
  const items = registryItems();
  await run(
    "node",
    [
      "damsko-registry.mjs",
      tag,
      "pnpm",
      "exec",
      "shadcn",
      "add",
      ...items.map((item) => `${namespace}/${item.name}`),
      "--overwrite",
      "--yes",
    ],
    project
  );

  const ours = new Set(filesUnder(nodePath.join(root, "src")));
  await fontsUnpacked(ours);

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

  // Every item, as the archive the script unpacked has it, says where it came from and its licence.
  for (const item of items) {
    const said = stringsAt(
      readJson(
        nodePath.join(
          project,
          "node_modules/.cache/damsko",
          tag,
          "r",
          `${item.name}.json`
        )
      ),
      "meta"
    );
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

  namedPackages(items, start);

  // As the package the tree lands in, then as an app that imports every file sees it.
  write(project, "tsconfig.app.json", {
    extends: "./tsconfig.json",
    include: [],
    files: [...installed]
      .filter((file) => /\.tsx?$/u.test(file) && !file.endsWith(".d.ts"))
      .map((file) => `src/${file}`),
  });
  await run(
    "pnpm",
    ["exec", "tsc", "--noEmit", "-p", "tsconfig.json"],
    project
  );
  await run(
    "pnpm",
    ["exec", "tsc", "--noEmit", "-p", "tsconfig.app.json"],
    project
  );
  console.log(
    `install: ${items.length} items, ${installed.size} files installed into ${project}`
  );
};

/** Carries a section of the page out, block after block; stops at the first that fails. */
const follow = async (slug: string, dir: string): Promise<boolean> => {
  const blocks =
    sections
      .find((section) => section.slug === slug)
      ?.steps.flatMap((step) => step.blocks) ?? [];
  if (!blocks.some((block) => block.does !== undefined)) {
    failures.push(`Get started has no section "${slug}" to carry out`);
    return false;
  }
  for (const block of blocks) {
    // oxlint-disable-next-line no-await-in-loop -- a page is followed one block after the other
    if (!(await carryOut(block, dir))) {
      return false;
    }
  }
  return true;
};

/** The block of a section that writes a file, to write it again after the check's own took its place. */
const pagesOwn = (slug: string, file: string): Block | undefined =>
  sections
    .find((section) => section.slug === slug)
    ?.steps.flatMap((step) => step.blocks)
    .findLast(
      (block) => block.does?.kind === "write" && block.does.file === file
    );

/** Opens the app and waits until it has drawn with its fonts. */
const open = async (page: Page, url: string, waitFor: string) => {
  await page.goto(url);
  await page.locator(waitFor).first().waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
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

/** A built app in a browser, with what it asked the network for. */
const inBrowser = async (
  label: string,
  dist: string,
  look: (
    page: Page,
    url: string,
    expect: (ok: boolean, message: string) => void,
    fonts: Map<string, number>
  ) => Promise<void>
) => {
  const expect = (ok: boolean, message: string) => {
    if (!ok) {
      failures.push(`${label}: ${message}`);
    }
  };
  const site = await serve(dist);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      colorScheme: "light",
      viewport: { width: 800, height: 600 },
    });
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
    await look(page, site.url, expect, fonts);
    expect(
      [...fonts].every(
        ([url, status]) => status === 200 && url.startsWith(site.url)
      ),
      `a font was not served by the app's own origin (${JSON.stringify([...fonts])})`
    );
    expect(errors.length === 0, `the page threw: ${errors.join("; ")}`);
  } catch (error) {
    expect(false, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
    await site.close();
  }
};

/** The app the page's blocks built, as the page left it: one button, drawn by its own styles. */
const checkPage = async (label: string, app: string) => {
  const dist = nodePath.join(app, "dist");
  const built = filesUnder(dist);
  const css = built
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(nodePath.join(dist, file), "utf-8"))
    .join("\n");
  const expectBuilt = (ok: boolean, message: string) => {
    if (!ok) {
      failures.push(`${label}: ${message}`);
    }
  };
  expectBuilt(
    css.includes("light-dark(") && !css.includes("--lightningcss-"),
    "the build rewrote the tokens' light-dark()"
  );
  expectBuilt(
    !/url\(\s*["']?data:font/u.test(css),
    "a font is inlined as data, which a product's content security policy refuses"
  );
  expectBuilt(
    built.filter((file) => file.endsWith(".woff2")).length === 6,
    "the build did not find the six font files"
  );
  await inBrowser(label, dist, async (page, url, expect, fonts) => {
    await open(page, url, "button");
    const seen = await drawn(page);
    expect(
      !["rgba(0, 0, 0, 0)", "transparent"].includes(seen.button.fill),
      `the default button has no fill (${seen.button.fill})`
    );
    expect(
      seen.button.cursor === "pointer",
      `the button has no pointer (${seen.button.cursor})`
    );
    expect(
      seen.loaded.includes("Geist") &&
        seen.button.family.startsWith("Geist") &&
        fonts.size > 0,
      `the button is not drawn in Geist (${seen.button.family}; loaded: ${seen.loaded.join(", ")})`
    );
  });
};

/** The check's own app in the page's place: fonts, the reset, the mode and the words. */
const checkApp = async (label: string, app: string) => {
  write(
    app,
    "src/App.tsx",
    readFileSync(nodePath.join(root, "scripts/check-install-app.tsx"), "utf-8")
  );
  if (!(await run("pnpm", ["build"], app))) {
    return;
  }
  await inBrowser(
    label,
    nodePath.join(app, "dist"),
    async (page, url, expect, fonts) => {
      await open(page, url, "button");
      const seen = await drawn(page);

      // The fonts: each family loaded, from the six files.
      for (const family of ["Geist", "Geist Mono", "Geist Serif"]) {
        expect(
          seen.loaded.includes(family),
          `the family "${family}" did not load (loaded: ${seen.loaded.join(", ")})`
        );
      }
      expect(
        fonts.size === 6,
        `the six font files were not all asked for (${JSON.stringify([...fonts.keys()])})`
      );

      // The reset a new app imports: one box model, nothing of the browser's own on an element
      // with no style, the page's text in the sans token.
      expect(
        seen.body.margin === "0px" &&
          seen.body.family.startsWith("Geist") &&
          seen.paragraph.margin === "0px" &&
          seen.paragraph.boxSizing === "border-box" &&
          seen.paragraph.minWidth === "0px" &&
          seen.heading.size === seen.paragraph.size &&
          seen.heading.weight === "400",
        `the reset is not applied (${JSON.stringify({ body: seen.body, heading: seen.heading, paragraph: seen.paragraph })})`
      );

      // The components' words follow a catalogue built while rendering, one object per language.
      const catalogues = page.getByRole("status", { name: "Catalogues" });
      const word = page.getByRole("status", { name: "Word" });
      const again = page.getByRole("button", { name: "Draw again" });
      const drawnTimes = async (times: number) => {
        await page
          .getByRole("status", { name: "Drawn" })
          .filter({ hasText: new RegExp(`^${String(times)}$`, "u") })
          .waitFor();
      };
      await word.filter({ hasText: /^Working$/u }).waitFor();
      await again.click();
      await again.click();
      await drawnTimes(3);
      const afterDraws = await catalogues.textContent();
      expect(
        afterDraws === "1",
        `a catalogue built again with the same words reached its readers as a new object (${String(afterDraws)} objects after 3 draws)`
      );
      await page.getByRole("button", { name: "Nederlands" }).click();
      await word.filter({ hasText: /^Bezig$/u }).waitFor();
      await again.click();
      await drawnTimes(4);
      const afterLanguage = await catalogues.textContent();
      expect(
        afterLanguage === "2",
        `the words of a second language are not one new object (${String(afterLanguage)})`
      );

      // The mode follows a person's choice, is kept, and without one follows the system.
      const light = await ground(page);
      await page.getByRole("button", { name: "Dark" }).click();
      const dark = await ground(page);
      expect(
        dark.scheme === "dark" && dark.color !== light.color,
        `choosing dark did not change the page (${JSON.stringify({ light, dark })})`
      );
      await open(page, url, "button");
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
      await open(page, url, "button");
      const system = await ground(page);
      expect(
        system.color === dark.color,
        "with no choice kept, the page does not follow the system's dark setting"
      );
    }
  );
};

/** The part of the app that is not Damsko's, as drawn: its pixels and every computed style. */
const ownPart = async (label: string, app: string) => {
  let seen: { pixels: string; styles: [string, string][][] } | undefined;
  if (!(await run("pnpm", ["build"], app))) {
    return seen;
  }
  await inBrowser(label, nodePath.join(app, "dist"), async (page, url) => {
    await open(page, url, "#own");
    const pixels = await page.locator("#own").screenshot();
    const styles = await page.evaluate(() =>
      [...document.querySelectorAll("#own, #own *")].map((element) => {
        const style = getComputedStyle(element);
        return [...style].map((name): [string, string] => [
          name,
          style.getPropertyValue(name),
        ]);
      })
    );
    seen = { pixels: pixels.toString("base64"), styles };
  });
  return seen;
};

/** Beside Tailwind: the page's own build, then a part that is not Damsko's, before and after. */
const besideTailwind = async (product: string) => {
  const app = nodePath.join(product, "apps/web");
  const label = "the app beside Tailwind";
  const pageApp = pagesOwn("in-a-workspace-package", "apps/web/src/App.tsx");
  const pageStyles = pagesOwn("beside-tailwind", "apps/web/src/index.css");
  if (pageApp === undefined || pageStyles === undefined) {
    failures.push(
      `${label}: Get started no longer writes the app's page or styles`
    );
    return;
  }
  // The page's own app again, in the place the check's took.
  if (
    !(
      (await carryOut(pageApp, product)) &&
      (await follow("beside-tailwind", product))
    )
  ) {
    return;
  }
  await checkPage(label, app);

  write(
    app,
    "src/Own.tsx",
    readFileSync(nodePath.join(root, "scripts/check-install-own.tsx"), "utf-8")
  );
  // Before: Tailwind alone, and the product's own part alone.
  write(app, "src/index.css", '@import "tailwindcss";\n');
  write(app, "src/App.tsx", 'export { default } from "./Own.tsx";\n');
  const before = await ownPart(`${label}, before Damsko`, app);
  // After: the page's styles, and a component beside the product's own part.
  await carryOut(pageStyles, product);
  write(
    app,
    "src/App.tsx",
    [
      'import { Button } from "@grasp-os/ui/components/button";',
      "",
      'import Own from "./Own.tsx";',
      "",
      "export default function App() {",
      "  return (",
      "    <>",
      "      <Own />",
      '      <Button variant="default">Save changes</Button>',
      "    </>",
      "  );",
      "}",
      "",
    ].join("\n")
  );
  const after = await ownPart(`${label}, after Damsko`, app);
  if (before === undefined || after === undefined) {
    return;
  }
  if (before.pixels !== after.pixels) {
    failures.push(
      `${label}: a part of the product that is not Damsko's is drawn differently once Damsko is installed`
    );
  }
  // Every property the part had before has the value it had. Left out: color-scheme, the one
  // property themes.css sets on the root, for the tokens' light-dark() (in a light system it
  // changes nothing drawn, which the pixels show). Variables that are new on the root, Damsko's
  // own names, are inherited and read by nothing of the product's.
  const changed = before.styles.flatMap((element, index) => {
    const now = new Map(after.styles[index]);
    return element
      .filter(
        ([name, value]) => name !== "color-scheme" && now.get(name) !== value
      )
      .map(
        ([name, value]) => `${name}: ${value} became ${String(now.get(name))}`
      );
  });
  if (changed.length > 0 || before.styles.length !== after.styles.length) {
    failures.push(
      `${label}: a part of the product that is not Damsko's has other computed styles once Damsko is installed (${changed.slice(0, 5).join("; ")})`
    );
  }
  // The component beside it stands with no reset of Damsko's: its fill, its pointer, its font.
  await checkPage(`${label}, a component with no reset of Damsko's`, app);
};

/**
 * With a Geist of its own: the page's styles, the check's app (text in each family), built by the
 * page's block and then by the bundler alone. One Geist loads, the app's; the two families it
 * lacks come from Damsko's files.
 */
const ownGeist = async (product: string) => {
  const app = nodePath.join(product, "apps/web");
  const label = "the app with a Geist of its own";
  write(
    app,
    "src/App.tsx",
    readFileSync(nodePath.join(root, "scripts/check-install-app.tsx"), "utf-8")
  );
  if (!(await follow("with-a-geist-of-its-own", product))) {
    return;
  }
  // As a runner that calls the bundler itself does: no package script runs, before or after.
  const dist = nodePath.join(app, "dist");
  rmSync(dist, { recursive: true });
  if (!(await run("pnpm", ["exec", "vite", "build"], app))) {
    return;
  }
  // Damsko's fonts in the build, by their bytes: the two of each family the app lacks, and none
  // of the family it brings.
  const built = filesUnder(dist)
    .filter((file) => file.endsWith(".woff2"))
    .map((file) => readFileSync(nodePath.join(dist, file)));
  const ours = filesUnder(nodePath.join(root, "src/styles/fonts"))
    .filter((file) => file.endsWith(".woff2"))
    .filter((file) =>
      built.some((font) =>
        font.equals(readFileSync(nodePath.join(root, "src/styles/fonts", file)))
      )
    )
    .toSorted();
  const lacked = [
    "geist-mono-common.woff2",
    "geist-mono-latin.woff2",
    "geist-serif-common.woff2",
    "geist-serif.woff2",
  ];
  if (ours.join(",") !== lacked.join(",")) {
    failures.push(
      `${label}: the build holds ${ours.join(", ")} of Damsko's fonts, not ${lacked.join(", ")}`
    );
  }
  await inBrowser(label, dist, async (page, url, expect) => {
    await open(page, url, "button");
    const seen = await drawn(page);
    expect(
      seen.loaded.includes("Geist Variable") &&
        seen.button.family.startsWith('"Geist Variable"'),
      `the button is not drawn in the app's own Geist (${seen.button.family}; loaded: ${seen.loaded.join(", ")})`
    );
    expect(
      !seen.loaded.includes("Geist"),
      `two Geists loaded side by side (${seen.loaded.join(", ")})`
    );
    for (const family of ["Geist Mono", "Geist Serif"]) {
      expect(
        seen.loaded.includes(family),
        `the family "${family}" did not load (loaded: ${seen.loaded.join(", ")})`
      );
    }
  });
};

/** Get started, carried out as written, in empty folders. */
const thePage = async () => {
  const plain = nodePath.join(scratch, "plain");
  mkdirSync(plain);
  if (await follow("install", plain)) {
    const app = nodePath.join(plain, "app");
    const label = "the app with the components in its own src/";
    await checkPage(label, app);
    if (await follow("light-and-dark", app)) {
      await checkApp(label, app);
    }
  }
  const product = nodePath.join(scratch, "product");
  mkdirSync(product);
  if (await follow("in-a-workspace-package", product)) {
    const app = nodePath.join(product, "apps/web");
    const label = "the app that imports the workspace package";
    await checkPage(label, app);
    if (await follow("light-and-dark", app)) {
      await checkApp(label, app);
    }
    await besideTailwind(product);
    await ownGeist(product);
  }
  console.log(
    "install: Get started carried out as written; four apps built and opened in Chromium"
  );
};

try {
  await everyItem();
  await thePage();
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
  `install: byte for byte, only the named packages, type-checks, and Get started works as written; ${seconds}s`
);
