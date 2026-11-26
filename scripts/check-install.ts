// The registry installs as a product installs it, from the registry built here and served on
// 127.0.0.1. Three parts.
//
// Every item: added by one name, @damsko/all (every item by name, no file of its own), with the
// stock shadcn CLI into a fresh workspace's packages/ui with the product's catalog and strict
// TypeScript flags, as a product pins a version: from /r/<tag>/, written as the site's build writes it (scripts/registry-dist.ts) from the archive a
// release carries (as .github/workflows/release.yml packs it), at a stand-in for the release's
// address, and served alone, with no latest beside it, so an item's own dependencies can only
// have come from the version. A release with no archive is passed over; one whose archive is not
// the file its checksum names stops the build. It holds when
// - the fonts arrive packed, their check says so, and their script unpacks them;
// - the installed src/ is then Damsko's src/ byte for byte (nothing missing, nothing extra,
//   nothing written anywhere else), and every item says its version, commit and licence;
// - Get started's update and drift check (@damsko/all again) pass on the committed tree, and the
//   fonts' check fails on a font that was altered;
// - the CLI added exactly the packages the items name, each left at the catalog's version;
// - the tree type-checks twice: as the package it is installed in, and as an app that imports
//   every file sees it (a declaration only a reference brings must still arrive).
//
// Then each item alone, into an empty workspace package of its own, a few at once: it brings
// exactly its files and those of every item it builds on, the CLI adds exactly the packages those
// items name, every package a file imports is declared, every package the item names is used by
// its own files (imported, a required peer of one, or the types of one with none), and it
// type-checks. So an item's npm dependencies are exact and minimal, each on its own.
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
// Beside Tailwind, the page's button stands in a row of the page's own, placed by its Tailwind
// classes, since a component takes no class; and with the reset left out, a part of the app that
// is not Damsko's (scripts/check-install-own.tsx) is drawn before anything of Damsko's is there and again after,
// and must be the same pixels with the same computed styles. With a Geist of its own (Fontsource's,
// as an older kit loads it), the app is built by the bundler called directly, with no package
// script, and must load that Geist and no file of Damsko's Geist, with Geist Serif and Geist Mono
// from Damsko's files. Every app provides the family its sans token names (the page's own
// assertion, evaluated in it); this one, built again with the token left unset, does not.
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
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { availableParallelism, tmpdir } from "node:os";
import nodePath from "node:path";
import { text } from "node:stream/consumers";
import { parseArgs } from "node:util";

import { chromium } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { RegistryItem } from "shadcn/schema";
import { parse, stringify } from "yaml";

import {
  packageExports,
  pinned,
  sansProvided,
  sections,
  siteAddress,
} from "../site/start/get-started.ts";
import type { Block } from "../site/start/get-started.ts";
import {
  allItem,
  namespace,
  packageOf,
  peersOf,
  root,
  targetOf,
  version as damskoVersion,
} from "./build-registry.ts";
import { isRecord, readJson, stringsAt } from "./json.ts";
import { modulesOf, registryItems, withDependencies } from "./registry-deps.ts";
import {
  archiveName,
  packRegistry,
  writeRegistry,
  writeVersions,
} from "./registry-dist.ts";
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

// The registry as the site serves it (scripts/registry-dist.ts), and beside it what stands in for
// GitHub: this version's archive at the address a release gives it, and once more with another
// file's checksum.
const registryDir = nodePath.join(scratch, "registry");
const commit = await writeRegistry(registryDir);
const tag = packRegistry(registryDir);
const served = await serve(registryDir);
const archive = readFileSync(nodePath.join(registryDir, archiveName(tag)));
const sum = readFileSync(
  nodePath.join(registryDir, `${archiveName(tag)}.sha256`),
  "utf-8"
);
const release = (repo: string, checksum: string) => {
  const dir = nodePath.join(registryDir, repo, "releases/download", tag);
  mkdirSync(dir, { recursive: true });
  writeFileSync(nodePath.join(dir, archiveName(tag)), archive);
  writeFileSync(nodePath.join(dir, `${archiveName(tag)}.sha256`), checksum);
};
release("github", sum);
release("altered", `${"0".repeat(64)}  ${archiveName(tag)}\n`);

// The released versions as the site's build writes them, served alone: what a pin installs from.
// A tag from before the archives has none: passed over.
const versionsDir = nodePath.join(scratch, "versions");
const tags = await writeVersions(versionsDir, `${served.url}/github`, [
  "v0.0.1",
  tag,
]);
if (tags.join(",") !== tag || pinned !== tag) {
  failures.push(
    `the released versions written are ${tags.join(", ")}, not ${tag}, which Get started pins as ${pinned}`
  );
}
try {
  await writeVersions(
    nodePath.join(scratch, "altered"),
    `${served.url}/altered`,
    [tag]
  );
  failures.push(
    "an archive that is not the file its checksum names was unpacked"
  );
} catch {
  // As it must: the site's build stops there.
}
const versions = await serve(versionsDir);

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
const carryOut = async (
  block: Block,
  dir: string,
  site = served.url
): Promise<boolean> => {
  const { does } = block;
  if (does === undefined) {
    return true;
  }
  // The page writes the registry's address as a placeholder for its own origin: here, this server.
  const code = block.code.replaceAll(siteAddress, site);
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
  for (const [name, range] of Object.entries(declared)) {
    if (range !== "catalog:") {
      failures.push(`package.json: ${name} is "${range}", not the catalog's`);
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

/**
 * The page's drift check, on the tree as a product has it: committed. It passes as installed, and
 * the fonts' check fails on a font that is not the one installed.
 */
const drift = async () => {
  write(workspace, ".gitignore", "node_modules\n");
  const git = async (...args: string[]) =>
    await run(
      "git",
      ["-c", "user.name=check", "-c", "user.email=check@localhost", ...args],
      workspace
    );
  if (
    !(
      (await git("init", "--quiet")) &&
      (await git("add", "--all")) &&
      (await git("commit", "--quiet", "--message", "install"))
    )
  ) {
    return;
  }
  // The page's update, then its drift check: both run @damsko/all again, and leave the tree as
  // every item installed it.
  for (const block of [
    ...stepOf("pin-and-update", "install-and-update"),
    ...stepOf("pin-and-update", "check-for-drift"),
  ]) {
    // oxlint-disable-next-line no-await-in-loop -- a page is followed one block after the other
    await carryOut(block, project, versions.url);
  }
  const font = nodePath.join(project, "src/styles/fonts/geist-common.woff2");
  const bytes = readFileSync(font);
  writeFileSync(font, bytes.subarray(0, -1));
  if (
    await passes("node", ["src/styles/fonts/unpack.mjs", "--check"], project)
  ) {
    failures.push("the fonts' check passes on a font that was altered");
  }
  writeFileSync(font, bytes);
};

/** The packages a workspace package starts with: React, its types and TypeScript. */
const startsWith = ["@types/react", "@types/react-dom", "react", "react-dom"];

/**
 * A workspace with the product's catalog and pnpm settings, and in it packages/ui with the
 * product's flags and components.json, at the version Get started pins: its line of
 * components.json, carried out at the versions' own server. Returns the package's folder, or
 * undefined when the page no longer says how to pin.
 */
const workspaceAt = async (
  dir: string,
  start: Record<string, string>,
  own: Record<string, unknown> = {}
): Promise<string | undefined> => {
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
    dir,
    "pnpm-workspace.yaml",
    stringify({
      packages: ["packages/*"],
      ...Object.fromEntries(
        Object.entries(isRecord(here) ? here : {}).filter(([key]) =>
          settings.has(key)
        )
      ),
      ...own,
    })
  );
  const manifest = readJson(nodePath.join(root, "package.json"));
  write(dir, "package.json", {
    name: "install-check",
    private: true,
    type: "module",
    // The same pnpm as here.
    packageManager: isRecord(manifest) ? manifest.packageManager : undefined,
  });
  const ui = nodePath.join(dir, "packages/ui");
  write(ui, "package.json", {
    name: "@grasp-os/ui",
    private: true,
    type: "module",
    exports: packageExports,
    devDependencies: start,
  });
  write(ui, "tsconfig.json", { compilerOptions: flags, include: ["src"] });
  // baseColor "" keeps the CLI off shadcn's own site.
  write(ui, "components.json", {
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
    return undefined;
  }
  for (const block of pin) {
    // oxlint-disable-next-line no-await-in-loop -- a page is followed one block after the other
    await carryOut(block, ui, versions.url);
  }
  return ui;
};

/** Every item, into a workspace package with the product's catalog and flags. */
const everyItem = async () => {
  const start = Object.fromEntries(
    [...startsWith, "shadcn", "typescript"].map((name) => [name, "catalog:"])
  );
  if ((await workspaceAt(workspace, start)) === undefined) {
    return;
  }
  const before = new Set(readdirSync(project));
  if (!(await run("pnpm", ["install"], workspace))) {
    return;
  }
  // Every item by one name, @damsko/all, as a product that has them all syncs: never `--all`,
  // which means shadcn's own registry. From the version's address, where no latest is served:
  // what an item builds on came from the version too, or the install fails. The tree is then held
  // to every item's files below, so `all` is shown to bring every one.
  const items = registryItems();
  await run(
    "pnpm",
    [
      "exec",
      "shadcn",
      "add",
      `${namespace}/${allItem}`,
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

  // Every item, as its version's address serves it, says where it came from and its licence.
  for (const item of items) {
    const said = stringsAt(
      readJson(nodePath.join(versionsDir, "r", tag, `${item.name}.json`)),
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
  await drift();
  console.log(
    `install: ${items.length} items, ${installed.size} files installed into ${project}`
  );
};

/** Whether an npm package, installed under `from`, gives its own types: no, when it is not there. */
const bringsTypes = (name: string, from: string) => {
  const folder = nodePath.join(from, "node_modules", name);
  if (!existsSync(nodePath.join(folder, "package.json"))) {
    return false;
  }
  const manifest = readJson(nodePath.join(folder, "package.json"));
  return (
    (isRecord(manifest) &&
      (manifest.types !== undefined ||
        manifest.typings !== undefined ||
        JSON.stringify(manifest.exports ?? null).includes('"types"'))) ||
    existsSync(nodePath.join(folder, "index.d.ts"))
  );
};

/** Said of one item installed alone. */
type Say = (message: string) => void;

/**
 * The files and packages of an item installed alone are exactly those of the items it brings.
 * Returns the files installed and the packages the package declares.
 */
const heldToWhatItBrings = (
  ui: string,
  brought: RegistryItem[],
  start: Record<string, string>,
  said: Say
) => {
  const expected = new Set(
    brought.flatMap((each) =>
      (each.files ?? []).map((file) => targetOf(file.path).slice("~/".length))
    )
  );
  const installed = filesUnder(nodePath.join(ui, "src")).map(
    (file) => `src/${file}`
  );
  for (const file of expected) {
    if (!installed.includes(file)) {
      said(`${file} was not installed`);
    }
  }
  for (const file of installed) {
    if (!expected.has(file)) {
      said(`${file} was installed, and no item it brings has it`);
    }
  }

  const manifest = readJson(nodePath.join(ui, "package.json"));
  const declared = new Set([
    ...Object.keys(stringsAt(manifest, "dependencies")),
    ...Object.keys(stringsAt(manifest, "devDependencies")),
  ]);
  const named = new Set(
    brought.flatMap((each) => [
      ...(each.dependencies ?? []),
      ...(each.devDependencies ?? []),
    ])
  );
  for (const name of declared) {
    if (!(name in start || named.has(name))) {
      said(`the CLI added ${name}, which no item it brings names`);
    }
  }
  for (const name of named) {
    if (!declared.has(name)) {
      said(`${name} is named, and the CLI did not add it`);
    }
  }

  return { installed, declared };
};

/**
 * Every package a file imports is declared, and every package an item names is one its own files
 * use.
 */
const usesWhatItNames = (
  item: RegistryItem,
  ui: string,
  { installed, declared }: { installed: string[]; declared: Set<string> },
  said: Say
) => {
  /** The packages files import, by name. */
  const importedBy = (files: string[]) =>
    new Set(
      files.flatMap((file) =>
        modulesOf(file, readFileSync(nodePath.join(ui, file), "utf-8"))
          .filter(
            (specifier) =>
              !(specifier.startsWith(".") || specifier.startsWith("node:"))
          )
          .map((specifier) => packageOf(specifier))
      )
    );
  for (const name of importedBy(installed)) {
    if (!declared.has(name)) {
      said(`a file imports ${name}, which the package does not declare`);
    }
  }
  const own = importedBy(
    (item.files ?? []).map((file) => targetOf(file.path).slice("~/".length))
  );
  for (const name of item.dependencies ?? []) {
    if (
      !(
        own.has(name) ||
        [...own].some((used) => peersOf(used, ui).includes(name))
      )
    ) {
      said(
        `names ${name}, which none of its files imports and none of their packages needs beside it`
      );
    }
  }
  for (const name of item.devDependencies ?? []) {
    const typed = name.replace(/^@types\//u, "");
    if (
      !(name.startsWith("@types/") && own.has(typed) && !bringsTypes(typed, ui))
    ) {
      said(
        `names ${name}, which gives no types to a package its files import that has none of its own`
      );
    }
  }
};

/**
 * One item alone, into an empty workspace package of its own, as a product that wants only it
 * installs it. It holds when the files are exactly the item's and those of every item it builds
 * on, however deep; the packages the CLI added are exactly the ones those items name; every
 * package a file imports is one the package declares (React is the app's); every package the item
 * names is one its own files use (imported, a required peer of one imported, or the types of one
 * that brings none); and the tree type-checks with the product's flags.
 */
const alone = async (item: RegistryItem, start: Record<string, string>) => {
  const dir = nodePath.join(scratch, "alone", item.name);
  // Every item brings lib, and lib Hugeicons' 24,000 files: linked once into pnpm's global
  // virtual store, not again into each of the hundred folders. Resolution is pnpm's as ever: a
  // package reaches only what it declares.
  const ui = await workspaceAt(dir, start, { enableGlobalVirtualStore: true });
  if (
    ui === undefined ||
    !(await run("pnpm", ["install"], dir)) ||
    !(await run(
      nodePath.join(root, "node_modules/.bin/shadcn"),
      ["add", `${namespace}/${item.name}`, "--yes"],
      ui
    ))
  ) {
    return;
  }
  const said = (message: string) => {
    failures.push(`${item.name}, installed alone: ${message}`);
  };
  const byName = new Map(registryItems().map((each) => [each.name, each]));
  const brought = withDependencies([item.name]).flatMap((name) => {
    const found = byName.get(name);
    return found === undefined ? [] : [found];
  });

  const { installed, declared } = heldToWhatItBrings(ui, brought, start, said);
  usesWhatItNames(item, ui, { installed, declared }, said);

  if (installed.some((file) => /\.tsx?$/u.test(file))) {
    await run(
      nodePath.join(root, "node_modules/.bin/tsc"),
      ["--noEmit", "-p", "tsconfig.json"],
      ui
    );
  }
};

/** Every item alone, a few at once: each in its own folder, sharing pnpm's store. */
const eachAlone = async () => {
  const start = Object.fromEntries(
    startsWith.map((name) => [name, "catalog:"])
  );
  const queue = registryItems().filter((item) => item.name !== allItem);
  const count = queue.length;
  const worker = async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
      // oxlint-disable-next-line no-await-in-loop -- each worker takes one item after the other
      await alone(item, start);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(8, availableParallelism()) }, worker)
  );
  console.log(`install: ${count} items, each installed alone and type-checked`);
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

/**
 * Whether the app's CodeBlock took its lexers' colours: so the app's build wrote the lexers' script,
 * the page loaded it when it drew the block, and compiled their WebAssembly. A run of the code then
 * has a colour its line has not.
 */
const coloured = async (page: Page) => {
  try {
    await page.waitForFunction(
      () =>
        [
          ...document.querySelectorAll(
            "[data-slot=code-block-line] > span:nth-child(2) > span"
          ),
        ].some(
          (part) =>
            part.parentElement !== null &&
            getComputedStyle(part).color !==
              getComputedStyle(part.parentElement).color
        ),
      null,
      { timeout: 15_000 }
    );
    return true;
  } catch {
    return false;
  }
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

/**
 * The app the page's blocks built, as the page left it: one button, drawn by its own styles, and
 * with `code`, a line of code coloured by its lexers; `placed`, in a row of the page's own whose
 * Tailwind classes put it at the row's end; `icon`, with the Hugeicons drawing the page's first app
 * imports drawn in it.
 */
const checkPage = async (
  label: string,
  app: string,
  { placed = false, code = false, icon = false } = {}
) => {
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
  // The page's own icon is a Hugeicons drawing the house set does not hold, imported by the app:
  // the bundle keeps that drawing, never the package's thousands (tens of megabytes).
  const scripts = built
    .filter((file) => file.endsWith(".js"))
    .reduce(
      (bytes, file) => bytes + statSync(nodePath.join(dist, file)).size,
      0
    );
  expectBuilt(
    scripts < 1_000_000,
    `the app's scripts are ${String(scripts)} bytes: the bundle kept more of Hugeicons than the drawings it imports`
  );
  await inBrowser(label, dist, async (page, url, expect, fonts) => {
    await open(page, url, "button");
    const seen = await drawn(page);
    if (icon) {
      // The icon the app imported from Hugeicons, drawn by Damsko's Icon at the button's size.
      const drawing = await page
        .getByRole("button", { name: "Save changes" })
        .locator("svg")
        .evaluate((svg) => ({
          parts: svg.querySelectorAll("path").length,
          width: svg.getBoundingClientRect().width,
          hidden: svg.getAttribute("aria-hidden"),
        }));
      expect(
        drawing.parts > 0 && drawing.width >= 12 && drawing.hidden === "true",
        `the Hugeicons drawing the app imported is not drawn through Icon in its button (${JSON.stringify(drawing)})`
      );
    }
    expect(
      !["rgba(0, 0, 0, 0)", "transparent"].includes(seen.button.fill),
      `the default button has no fill (${seen.button.fill})`
    );
    expect(
      seen.button.cursor === "pointer",
      `the button has no pointer (${seen.button.cursor})`
    );
    expect(
      await page.evaluate<boolean>(`(${sansProvided})()`),
      "the page does not provide the family its sans token names"
    );
    if (code) {
      expect(
        await coloured(page),
        "the code block's code was not coloured: its lexers were not built or did not load"
      );
    }
    expect(
      seen.loaded.includes("Geist") &&
        seen.button.family.startsWith("Geist") &&
        fonts.size > 0,
      `the button is not drawn in Geist (${seen.button.family}; loaded: ${seen.loaded.join(", ")})`
    );
    if (placed) {
      // Where the row's classes put it: at the row's end, inside its padding.
      const row = await page
        .getByRole("button", { name: "Save changes" })
        .evaluate((element) => {
          const holder = element.parentElement ?? element;
          const style = getComputedStyle(holder);
          const gap =
            holder.getBoundingClientRect().right -
            element.getBoundingClientRect().right;
          return { display: style.display, gap, padding: style.paddingRight };
        });
      expect(
        row.display === "flex" &&
          row.padding === "16px" &&
          Math.abs(row.gap - 16) < 0.5,
        `the element round the button is not placed by its Tailwind classes (${JSON.stringify(row)})`
      );
    }
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
      expect(
        await coloured(page),
        "the code block's code was not coloured: its lexers were not built or did not load"
      );

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
  const pageStyles = pagesOwn("beside-tailwind", "apps/web/src/index.css");
  if (
    pageStyles === undefined ||
    pagesOwn("beside-tailwind", "apps/web/src/App.tsx") === undefined
  ) {
    failures.push(
      `${label}: Get started no longer writes the app's page or styles`
    );
    return;
  }
  // The page's own app again, in the place the check's took: the button placed with a class.
  if (!(await follow("beside-tailwind", product))) {
    return;
  }
  await checkPage(label, app, { placed: true });

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
      await coloured(page),
      "the code block's code was not coloured: its lexers were not built or did not load"
    );
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
    expect(
      await page.evaluate<boolean>(`(${sansProvided})()`),
      "the page does not provide the family its sans token names"
    );
  });

  // The mistake the page's assertion is for: the sheet left out and the token not set.
  const styles = nodePath.join(app, "src/index.css");
  writeFileSync(
    styles,
    readFileSync(styles, "utf-8").replace(/:root \{[^}]*\}/u, "")
  );
  if (!(await run("pnpm", ["exec", "vite", "build"], app))) {
    return;
  }
  await inBrowser(
    `${label}, its token unset`,
    dist,
    async (page, url, expect) => {
      await open(page, url, "button");
      expect(
        !(await page.evaluate<boolean>(`(${sansProvided})()`)),
        "the page's assertion passes with no sans family provided"
      );
    }
  );
};

/** Get started, carried out as written, in empty folders. */
const thePage = async () => {
  const plain = nodePath.join(scratch, "plain");
  mkdirSync(plain);
  if (await follow("install", plain)) {
    const app = nodePath.join(plain, "app");
    const label = "the app with the components in its own src/";
    await checkPage(label, app, { code: true, icon: true });
    if (await follow("light-and-dark", app)) {
      await checkApp(label, app);
    }
  }
  const product = nodePath.join(scratch, "product");
  mkdirSync(product);
  if (await follow("in-a-workspace-package", product)) {
    const app = nodePath.join(product, "apps/web");
    const label = "the app that imports the workspace package";
    await checkPage(label, app, { code: true, icon: true });
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
  await eachAlone();
  await thePage();
} finally {
  await served.close();
  await versions.close();
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
