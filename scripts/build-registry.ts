// Builds registry.json, the shadcn registry's source, from src/. Nothing in it is typed by hand: the
// items, their files, the other items each needs and its npm packages are all read from the source.
// `shadcn build` turns it into the files a project fetches (`pnpm build` writes dist/r/<name>.json).
//
//   node scripts/build-registry.ts     writes registry.json
//   node scripts/check-registry.ts     checks it is current and that every item installs whole
//
// Items:
// - one per component: src/components/<name>.tsx, with its <name>.stylex.ts and its
//   <name>-<what>.ts helpers (registry:ui);
// - one per folder component: src/components/<name>/ (registry:ui);
// - one per block: src/blocks/<name>/ (registry:block);
// - lib (src/lib, registry:lib), hooks (src/hooks, registry:hook) and tokens (src/styles: the CSS
//   variables and the themes, registry:lib).
//
// The shape the stock shadcn CLI installs byte for byte: every file is `registry:file` with the
// target `~/<its path>`, so it lands at the same path under a project's root (src/… in src/…),
// comments and imports untouched. That is why every import in src/ is relative. npm packages are
// listed by name only, so a project's own `catalog:` versions stand.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import nodePath from "node:path";

import ts from "typescript6";
import { parse } from "yaml";

import { stringsAt } from "./json.ts";

export const root = nodePath.resolve(import.meta.dirname, "..");
/** The namespace a project names this registry by, in its components.json. */
export const namespace = "@damsko";
/** Where the site and the registry are served. */
export const homepage = "https://damsko.joingrasp.com";

/** The items that are not a component or a block, by the folder they ship. */
const sharedItems = [
  {
    name: "lib",
    type: "registry:lib",
    folder: "src/lib",
    title: "Lib",
    description:
      "What every component builds on: the tokens' StyleX names, the shared styles and variables, icons, layers, words and small utilities.",
  },
  {
    name: "hooks",
    type: "registry:hook",
    folder: "src/hooks",
    title: "Hooks",
    description:
      "The hooks the components share: an action's states, copying, a long run, focus going back, and which edges of a scroller have more beyond them.",
  },
  {
    name: "tokens",
    type: "registry:lib",
    folder: "src/styles",
    title: "Tokens",
    description:
      "Every colour, space, corner, edge, shadow, time and curve as CSS variables (tokens.css), and the modes and themes (themes.css). Import both once, at the root.",
  },
] as const;

/** Items a part relies on without importing them: lib's StyleX names read tokens.css's variables. */
const declaredNeeds: Record<string, string[]> = { lib: ["tokens"] };

/** Every file in a folder, deepest last, as paths relative to the repository. */
const filesIn = (folder: string): string[] =>
  readdirSync(nodePath.join(root, folder))
    .toSorted()
    .flatMap((name) => {
      const path = nodePath.posix.join(folder, name);
      return statSync(nodePath.join(root, path)).isDirectory()
        ? filesIn(path)
        : [path];
    });

const isDirectory = (path: string) =>
  statSync(nodePath.join(root, path)).isDirectory();

/** The one-file components, by name. */
const flatComponents = () =>
  readdirSync(nodePath.join(root, "src/components"))
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => name.slice(0, -".tsx".length))
    .toSorted();

/**
 * The item a source file belongs to, or undefined. A file beside a one-file component is that
 * component's when its name is the component's followed by `.` or `-` (button.stylex.ts,
 * chart-math.ts), by the longest such name.
 */
export const itemOf = (path: string): string | undefined => {
  const folder = /^src\/(?:components|blocks)\/(?<name>[^/]+)\/./u.exec(path)
    ?.groups?.name;
  if (folder !== undefined) {
    return folder;
  }
  const loose = /^src\/components\/(?<file>[^/]+)$/u.exec(path)?.groups?.file;
  if (loose !== undefined) {
    return flatComponents()
      .filter(
        (name) =>
          loose === `${name}.tsx` ||
          loose.startsWith(`${name}.`) ||
          loose.startsWith(`${name}-`)
      )
      .toSorted((one, other) => other.length - one.length)[0];
  }
  return sharedItems.find((item) => path.startsWith(`${item.folder}/`))?.name;
};

/** The file an import resolves to, the way TypeScript and Vite resolve it, or undefined. */
export const resolveImport = (
  from: string,
  specifier: string
): string | undefined => {
  const base = nodePath.posix.join(nodePath.posix.dirname(from), specifier);
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.d.ts`,
    `${base}/index.ts`,
  ].find(
    (path) =>
      existsSync(nodePath.join(root, path)) &&
      statSync(nodePath.join(root, path)).isFile()
  );
};

/**
 * The modules a file imports or re-exports, and the declarations it references
 * (`/// <reference path>`), read by TypeScript (comments and strings ignored).
 */
const importsOf = (source: string, text: string): string[] => {
  if (!/\.tsx?$/u.test(source)) {
    return [];
  }
  const { importedFiles, referencedFiles } = ts.preProcessFile(
    text,
    true,
    true
  );
  return [...importedFiles, ...referencedFiles].map((file) => file.fileName);
};

/** An npm package's name from an import: `@ui-sdk/react/menu` is `@ui-sdk/react`. */
export const packageOf = (specifier: string) => {
  const parts = specifier.split("/");
  return specifier.startsWith("@")
    ? parts.slice(0, 2).join("/")
    : (parts[0] ?? specifier);
};

/** Packages a project already has as a React project; never added as dependencies. */
const provided = new Set(["react", "react-dom"]);

/** The pnpm catalog (pnpm-workspace.yaml): every version, pinned once. */
export const catalog = stringsAt(
  parse(readFileSync(nodePath.join(root, "pnpm-workspace.yaml"), "utf-8")),
  "catalog"
);

/** An exact semver version: no ^, ~, range, tag or wildcard. */
export const exactVersion = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u;

const manifest: unknown = JSON.parse(
  readFileSync(nodePath.join(root, "package.json"), "utf-8")
);
const dependencies = stringsAt(manifest, "dependencies");
const devDependencies = stringsAt(manifest, "devDependencies");

/** The peers an npm package needs beside it (`@ui-sdk/react` needs `@ui-sdk/core`), React aside. */
const peersOf = (name: string): string[] => {
  const path = nodePath.join(root, "node_modules", name, "package.json");
  if (!existsSync(path)) {
    return [];
  }
  const own: unknown = JSON.parse(readFileSync(path, "utf-8"));
  return Object.keys(stringsAt(own, "peerDependencies")).filter(
    (peer) => !provided.has(peer) && !peer.startsWith("@types/")
  );
};

/** The page's title and sentence, from docs/components/<name>.mdx, when it has one. */
const pageOf = (name: string) => {
  const page = existsSync(nodePath.join(root, "docs/components", `${name}.mdx`))
    ? name
    : undefined;
  if (page === undefined) {
    return null;
  }
  const front =
    /^---\r?\n(?<front>[\s\S]*?)\r?\n---/u.exec(
      readFileSync(
        nodePath.join(root, "docs/components", `${page}.mdx`),
        "utf-8"
      )
    )?.groups?.front ?? "";
  const field = (key: string) =>
    new RegExp(`^${key}:\\s*(?<value>.+?)\\r?$`, "mu")
      .exec(front)
      ?.groups?.value?.trim()
      .replace(/^(?<quote>["'])(?<text>.*)\k<quote>$/u, "$<text>");
  return {
    title: field("title"),
    description: field("description"),
    docs: `${homepage}/components/${page}`,
  };
};

const titleCase = (name: string) => {
  const words = name.replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export type ItemType =
  | "registry:ui"
  | "registry:block"
  | "registry:lib"
  | "registry:hook";

export interface RegistryItem {
  name: string;
  type: ItemType;
  title: string;
  description: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  docs?: string;
  files: { path: string; type: "registry:file"; target: string }[];
}

export interface Problem {
  item: string;
  file?: string;
  message: string;
}

/** Reads the source and returns the registry and every problem found. */
export const buildRegistry = () => {
  const problems: Problem[] = [];
  const folders = (parent: string) =>
    readdirSync(nodePath.join(root, parent))
      .filter((name) => isDirectory(`${parent}/${name}`))
      .toSorted();
  const allFiles = filesIn("src");
  const component = (name: string, files: string[]) => {
    const page = pageOf(name);
    return {
      name,
      type: "registry:ui" as const,
      files,
      title: page?.title ?? titleCase(name),
      description: page?.description ?? titleCase(name),
      docs: page?.docs,
    };
  };
  const units: {
    name: string;
    type: ItemType;
    files: string[];
    title: string;
    description: string;
    docs?: string;
  }[] = [
    ...flatComponents().map((name) =>
      component(
        name,
        allFiles.filter(
          (file) =>
            !file.slice("src/components/".length).includes("/") &&
            itemOf(file) === name
        )
      )
    ),
    ...folders("src/components").map((name) =>
      component(name, filesIn(`src/components/${name}`))
    ),
    ...folders("src/blocks").map((name) => {
      const page = pageOf(name);
      return {
        name,
        type: "registry:block" as const,
        files: filesIn(`src/blocks/${name}`),
        title: page?.title ?? titleCase(name),
        description: page?.description ?? titleCase(name),
        docs: page?.docs,
      };
    }),
    ...sharedItems.map((item) => ({ ...item, files: filesIn(item.folder) })),
  ].toSorted((one, other) => one.name.localeCompare(other.name));

  const owned = new Set(units.flatMap((unit) => unit.files));
  for (const file of allFiles.filter((each) => !owned.has(each))) {
    problems.push({ item: "src", file, message: "belongs to no item" });
  }

  const items: RegistryItem[] = units.map((unit) => {
    const packages = new Set<string>();
    const types = new Set<string>();
    const needs = new Set<string>(declaredNeeds[unit.name]);
    for (const file of unit.files) {
      const text = readFileSync(nodePath.join(root, file), "utf-8");
      for (const specifier of importsOf(file, text)) {
        if (specifier.startsWith(".")) {
          const resolved = resolveImport(file, specifier);
          const owner = resolved === undefined ? undefined : itemOf(resolved);
          if (owner === undefined) {
            problems.push({
              item: unit.name,
              file,
              message: `"${specifier}" reaches no file of an item`,
            });
          } else if (owner !== unit.name) {
            needs.add(owner);
          }
          continue;
        }
        const name = packageOf(specifier);
        if (provided.has(name)) {
          continue;
        }
        if (dependencies[name] === undefined) {
          problems.push({
            item: unit.name,
            file,
            message: `imports ${specifier}, and ${name} is not a dependency in package.json`,
          });
          continue;
        }
        packages.add(name);
        for (const peer of peersOf(name)) {
          packages.add(peer);
        }
        // A package with no types of its own brings the ones this repository type-checks with.
        if (devDependencies[`@types/${name}`] !== undefined) {
          types.add(`@types/${name}`);
        }
      }
    }
    return {
      name: unit.name,
      type: unit.type,
      title: unit.title,
      description: unit.description,
      ...(packages.size > 0 ? { dependencies: [...packages].toSorted() } : {}),
      ...(types.size > 0 ? { devDependencies: [...types].toSorted() } : {}),
      ...(needs.size > 0
        ? {
            registryDependencies: [...needs]
              .toSorted()
              .map((name) => `${namespace}/${name}`),
          }
        : {}),
      ...(unit.docs === undefined ? {} : { docs: unit.docs }),
      files: unit.files.map((path) => ({
        path,
        type: "registry:file" as const,
        target: `~/${path}`,
      })),
    };
  });

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "damsko",
    homepage,
    items,
  };
  return { registry, problems };
};

/** registry.json's text, as the formatter writes JSON. */
export const registryText = (registry: unknown) =>
  `${JSON.stringify(registry, null, 2)}\n`;

if (import.meta.main) {
  const { writeFileSync } = await import("node:fs");
  const { registry, problems } = buildRegistry();
  for (const problem of problems) {
    console.error(
      `${problem.item}${problem.file === undefined ? "" : ` (${problem.file})`}: ${problem.message}`
    );
  }
  if (problems.length > 0) {
    process.exit(1);
  }
  writeFileSync(nodePath.join(root, "registry.json"), registryText(registry));
  console.log(
    `registry: ${registry.items.length} items written to registry.json`
  );
}
