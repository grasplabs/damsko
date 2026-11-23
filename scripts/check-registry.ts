// The registry holds: registry.json is what scripts/build-registry.ts writes now and matches
// shadcn's schema; every file is `registry:file` with the target `~/<its path>` (a font's with
// `.base64` after it, as it is carried); every item says its version and its licence; npm packages are
// named without a version; every import in an item's files resolves, installed, to a file of the
// item or of an item it names, and every package it imports is one of its dependencies; and every
// version in package.json comes from an exact pin in the catalog; and the docs' install commands
// name items that exist, at the catalog's versions, as are the versions Get started gives an app.
// Reads files only; no server.
//
//   node scripts/check-registry.ts
//
// Fails with the item, the file and what is wrong. After changing a component, run
// `pnpm run generate` and commit registry.json with it.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import nodePath from "node:path";

import { registrySchema } from "shadcn/schema";
import ts from "typescript6";

import { packageExports, versions } from "../site/start/get-started.ts";
import {
  buildRegistry,
  catalog,
  exactVersion,
  packageOf,
  registryText,
  root,
  targetOf,
  version as damskoVersion,
} from "./build-registry.ts";
import { readJson, stringsAt } from "./json.ts";

/**
 * Every module a file reaches, and every declaration it references, read from a full parse: its
 * own reader, not the generator's quick scan, so a file the scan misreads still fails here. CSS
 * gives its @import and url() targets.
 */
const modulesOf = (path: string, text: string): string[] => {
  if (path.endsWith(".css")) {
    return [
      ...text.matchAll(
        /@import\s+(?:url\()?\s*["'](?<imported>[^"']+)["']|url\(\s*["']?(?<url>[^"')]+)["']?\s*\)/gu
      ),
    ]
      .map((match) => match.groups?.imported ?? match.groups?.url ?? "")
      .filter(
        (target) => target !== "" && !/^(?:data:|https?:|#)/u.test(target)
      );
  }
  if (!/\.tsx?$/u.test(path)) {
    return [];
  }
  const found: string[] = [];
  const kind = path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      found.push(node.moduleSpecifier.text);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      found.push(node.argument.literal.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [argument] = node.arguments;
      if (
        argument &&
        (ts.isStringLiteral(argument) ||
          ts.isNoSubstitutionTemplateLiteral(argument))
      ) {
        found.push(argument.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  const file = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    kind
  );
  visit(file);
  // A declaration a file references (`/// <reference path>`) must be installed with it too.
  return [
    ...found,
    ...file.referencedFiles.map((reference) => reference.fileName),
  ];
};

/** Every docs page (MDX) under a folder, as paths relative to the repository. */
const docPages = (dir: string): string[] =>
  readdirSync(nodePath.join(root, dir), { withFileTypes: true }).flatMap(
    (entry) => {
      const path = nodePath.posix.join(dir, entry.name);
      if (entry.isDirectory()) {
        return docPages(path);
      }
      return path.endsWith(".mdx") ? [path] : [];
    }
  );

/** Where the docs' exports map leads an import of the package: a file, null (refused) or nowhere. */
const resolved = (address: string): string | null | undefined => {
  for (const [pattern, target] of Object.entries(packageExports)) {
    const [before, after] = pattern.split("*");
    if (after === undefined) {
      if (address === pattern) {
        return target;
      }
    } else if (
      before !== undefined &&
      address.startsWith(before) &&
      address.endsWith(after) &&
      address.length >= before.length + after.length
    ) {
      return (
        target?.replace(
          "*",
          address.slice(before.length, address.length - after.length)
        ) ?? null
      );
    }
  }
  return undefined;
};

const failures: string[] = [];
let checks = 0;
const check = (ok: boolean, message: string) => {
  checks += 1;
  if (!ok) {
    failures.push(message);
  }
};

// Exact pins: every package.json entry comes from the catalog, and every catalog entry is one
// version (or an npm alias of one), never a range.
const manifest = readJson(nodePath.join(root, "package.json"));
for (const field of [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
]) {
  for (const [name, version] of Object.entries(stringsAt(manifest, field))) {
    check(
      version === "catalog:",
      `package.json ${field}: ${name} is "${version}", use "catalog:" and pin it in pnpm-workspace.yaml`
    );
  }
}
for (const [name, version] of Object.entries(catalog)) {
  check(
    exactVersion.test(version.replace(/^npm:.+@/u, "")),
    `pnpm-workspace.yaml catalog: ${name} is "${version}", pin an exact version`
  );
}

const { registry, problems } = buildRegistry();
for (const problem of problems) {
  check(
    false,
    `${problem.item}${problem.file === undefined ? "" : ` (${problem.file})`}: ${problem.message}`
  );
}

// dependencies is what a component needs: every entry is imported by a file under src/, or is a
// required peer of one that is. Site-only packages belong in devDependencies.
{
  const imported = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = nodePath.join(dir, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
      } else {
        for (const target of modulesOf(path, readFileSync(path, "utf-8"))) {
          if (!target.startsWith(".")) {
            imported.add(packageOf(target));
          }
        }
      }
    }
  };
  walk(nodePath.join(root, "src"));
  const needed = new Set(imported);
  for (const name of imported) {
    const path = nodePath.join(root, "node_modules", name, "package.json");
    if (existsSync(path)) {
      for (const peer of Object.keys(
        stringsAt(readJson(path), "peerDependencies")
      )) {
        needed.add(peer);
      }
    }
  }
  for (const name of Object.keys(stringsAt(manifest, "dependencies"))) {
    check(
      needed.has(name),
      `package.json dependencies: ${name} is imported by no file under src/, move it to devDependencies`
    );
  }
}

// registry.json is current and matches shadcn's own schema (the CLI a project runs).
const written = nodePath.join(root, "registry.json");
check(
  existsSync(written) &&
    readFileSync(written, "utf-8") === registryText(registry),
  "registry.json is out of date: run pnpm run generate"
);
const parsed = registrySchema.safeParse(registry);
check(
  parsed.success,
  `registry.json does not match the schema: ${JSON.stringify(parsed.error?.issues.slice(0, 3))}`
);

const items = new Map(registry.items.map((item) => [item.name, item]));
check(items.size === registry.items.length, "two items share a name");
const paths = (name: string) =>
  new Set((items.get(name)?.files ?? []).map((file) => file.path));

// Installed, every import resolves: a relative one to a file of the item or of an item it names,
// a package one to one of its dependencies.
for (const item of registry.items) {
  const needs = (item.registryDependencies ?? []).map((name) =>
    name.replace(/^@damsko\//u, "")
  );
  for (const name of needs) {
    check(
      items.has(name),
      `${item.name}: needs @damsko/${name}, which is not an item`
    );
  }
  const reachable = new Set([
    ...paths(item.name),
    ...needs.flatMap((name) => [...paths(name)]),
  ]);
  const packages = new Set(item.dependencies);
  for (const spec of [
    ...(item.dependencies ?? []),
    ...(item.devDependencies ?? []),
  ]) {
    check(
      !/.@/u.test(spec),
      `${item.name}: ${spec} names a version; list packages by name, so a project's catalog: stands`
    );
  }
  check(
    exactVersion.test(damskoVersion) && item.meta.version === damskoVersion,
    `${item.name}: meta.version must be package.json's version, an exact one`
  );
  check(
    item.meta.license.length > 0,
    `${item.name}: meta.license must say what licence its files are under`
  );
  for (const file of item.files) {
    check(
      file.type === "registry:file" && file.target === targetOf(file.path),
      `${item.name}: ${file.path} must be registry:file with the target ${targetOf(file.path)}`
    );
    const text = readFileSync(nodePath.join(root, file.path), "utf-8");
    check(text.length > 0, `${item.name}: ${file.path} is empty`);
    for (const specifier of modulesOf(file.path, text)) {
      if (specifier.startsWith(".")) {
        const base = nodePath.posix.join(
          nodePath.posix.dirname(file.path),
          specifier
        );
        const found = [
          base,
          `${base}.ts`,
          `${base}.tsx`,
          `${base}.d.ts`,
          `${base}/index.ts`,
        ].some((path) => reachable.has(path));
        check(
          found,
          `${item.name}: ${file.path} imports "${specifier}", which no file it installs provides`
        );
      } else if (!["react", "react-dom"].includes(packageOf(specifier))) {
        check(
          packages.has(packageOf(specifier)),
          `${item.name}: ${file.path} imports ${specifier}, and ${packageOf(specifier)} is not in its dependencies`
        );
      }
    }
  }
}

// The docs' commands work against this registry as written: every `shadcn@<version> add` runs the
// catalog's shadcn and names items that exist, and every package a command pins is at the
// catalog's version, so a project set up from the docs builds with what Damsko is tested with.
for (const page of [...docPages("docs"), "site/start/get-started.ts"]) {
  // A command in a TypeScript string has its line breaks written `\n`.
  const text = readFileSync(nodePath.join(root, page), "utf-8").replaceAll(
    String.raw`\n`,
    "\n"
  );
  for (const command of text.matchAll(
    /\bshadcn@(?<version>[^\s"`]+) add (?<names>[^"`\\\n]+)/gu
  )) {
    check(
      command.groups?.version === catalog.shadcn,
      `${page}: runs shadcn@${command.groups?.version}, the catalog has ${catalog.shadcn}`
    );
    for (const name of (command.groups?.names ?? "")
      .trim()
      .split(/\s+/u)
      // A flag (--overwrite, --yes) is not an item.
      .filter((word) => !word.startsWith("--"))) {
      const item = /^@damsko\/(?<item>[\w-]+)$/u.exec(name)?.groups?.item;
      check(
        item !== undefined && items.has(item),
        `${page}: adds ${name}, which is not an item`
      );
    }
  }
  for (const command of text.matchAll(
    /\bpnpm add (?<packages>[^"'`\\\n]+)/gu
  )) {
    for (const spec of (command.groups?.packages ?? "").split(/\s+/u)) {
      const pinned = /^(?<name>@?[^@\s]+)@(?<version>[^\s]+)$/u.exec(
        spec
      )?.groups;
      // A workspace's own package has no version to pin; one taken from the app's catalog is
      // pinned there, in the versions Get started gives (checked below).
      if (pinned?.name !== undefined && pinned.version === "catalog:") {
        check(
          pinned.name in versions,
          `${page}: adds ${spec}, and Get started's versions (site/start/get-started.ts) have no ${pinned.name}`
        );
      } else if (
        pinned?.name !== undefined &&
        pinned.version?.startsWith("workspace:") !== true
      ) {
        check(
          pinned.version === catalog[pinned.name],
          `${page}: pins ${spec}, the catalog has ${pinned.name} ${catalog[pinned.name] ?? "not at all"}`
        );
      }
    }
  }
}

// The versions Get started gives an app (its catalog) are the ones Damsko is tested with, and name
// every package an item brings: an app set up from the page, and the install check that follows
// the page, build with these whatever is released upstream. Vite alone is the page's own: here
// the name is Vite+'s.
for (const [name, version] of Object.entries(versions)) {
  check(
    name === "vite"
      ? /^\d+\.\d+\.\d+$/u.test(version)
      : version === catalog[name],
    `Get started's versions (site/start/get-started.ts): ${name} is ${version}, the catalog has ${catalog[name] ?? "it not at all"}`
  );
}
for (const item of registry.items) {
  for (const name of [
    ...(item.dependencies ?? []),
    ...(item.devDependencies ?? []),
  ]) {
    check(
      name in versions,
      `${item.name} names ${name}, which Get started's versions (site/start/get-started.ts) do not pin`
    );
  }
}

// The exports map the docs give a product's packages/ui (site/start/get-started.ts) reaches every
// file an app imports, each at one address: a new .tsx in lib/ or a fourth folder component fails
// here until the map names it. README.md carries the same map.
for (const item of registry.items) {
  for (const { path } of item.files) {
    // What an app imports: a component and its .stylex.ts, a block, lib/, hooks/ and the
    // stylesheets. A component's helper, a declaration and a font are reached only by the
    // files beside them.
    const imported =
      /^src\/components\/[^/]+\//u.test(path) ||
      /^src\/components\/[^/]+(?:\.stylex\.ts|\.tsx)$/u.test(path) ||
      /^src\/blocks\/.+\.tsx$/u.test(path) ||
      /^src\/(?:lib|hooks)\/[^/]+(?<!\.d)\.tsx?$/u.test(path) ||
      /^src\/styles\/[^/]+\.css$/u.test(path);
    if (!imported) {
      continue;
    }
    const inFolder = /^src\/components\/(?<folder>[^/]+)\//u.exec(path)?.groups
      ?.folder;
    // A folder component is imported by its index alone; a font, by fonts.css.
    const address =
      inFolder === undefined
        ? `./${path.slice("src/".length).replace(/\.tsx?$/u, "")}`
        : `./components/${inFolder}`;
    const expected =
      inFolder === undefined
        ? `./${path}`
        : `./src/components/${inFolder}/index.ts`;
    check(
      resolved(address) === expected,
      `the docs' exports map (site/start/get-started.ts, packageExports) gives ${address} as ${String(resolved(address))}, not ${expected}`
    );
  }
}
check(
  readFileSync(nodePath.join(root, "README.md"), "utf-8").includes(
    JSON.stringify({ exports: packageExports }, null, 2).slice(2, -2)
  ),
  "README.md's exports map is not the docs' (site/start/get-started.ts, packageExports): copy it there"
);

if (failures.length > 0) {
  for (const message of failures) {
    console.error(`FAIL  ${message}`);
  }
  console.error(
    `\nregistry: ${failures.length} problem(s) in ${registry.items.length} items`
  );
  process.exit(1);
}
console.log(
  `registry: ${registry.items.length} items, ${checks} checks passed`
);
