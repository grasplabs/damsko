// The registry installs as a product installs it: every item, added by name with the stock shadcn
// CLI from the registry built here and served on 127.0.0.1, into a fresh project with the product's
// strict TypeScript flags. It holds when the installed src/ is Damsko's src/ byte for byte (nothing
// missing, nothing extra, nothing written anywhere else), the CLI added exactly the packages the
// items name, each left at the catalog's version, and the tree type-checks twice: as the package
// it is installed in, and as an app that imports every file sees it (a declaration only a
// reference brings must still arrive).
//
//   node scripts/check-install.ts           a fresh project in the system's temp folder, removed after
//   node scripts/check-install.ts --keep    keeps it, and says where
//
// Installs packages from npm, so it runs in CI as its own job, not among the gates. Needs `pnpm`.
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

import { parse, stringify } from "yaml";

import { namespace, root } from "./build-registry.ts";
import { isRecord, readJson, stringsAt } from "./json.ts";
import { registryItems } from "./registry-deps.ts";
import { serve } from "./serve.ts";

const { values } = parseArgs({
  options: { keep: { type: "boolean", default: false } },
});

const started = performance.now();
const scratch = mkdtempSync(nodePath.join(tmpdir(), "damsko-install-"));
const project = nodePath.join(scratch, "project");
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

const write = (path: string, value: unknown) => {
  writeFileSync(
    nodePath.join(project, path),
    typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`
  );
};

// The registry's JSON, built by the CLI the product runs, and served as the site serves it.
const registryDir = nodePath.join(scratch, "registry");
await run(
  nodePath.join(root, "node_modules/.bin/shadcn"),
  ["build", "registry.json", "--output", nodePath.join(registryDir, "r")],
  root
);
const served = await serve(registryDir);

try {
  // The project: the product's supply-chain settings and catalog, React, TypeScript and the CLI.
  mkdirSync(project);
  const workspace: unknown = parse(
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
    stringify(
      Object.fromEntries(
        Object.entries(isRecord(workspace) ? workspace : {}).filter(([key]) =>
          settings.has(key)
        )
      )
    )
  );
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
  const manifest = readJson(nodePath.join(root, "package.json"));
  write("package.json", {
    name: "install-check",
    private: true,
    type: "module",
    // The same pnpm as here.
    packageManager: isRecord(manifest) ? manifest.packageManager : undefined,
    devDependencies: start,
  });
  // The product's flags (its tsconfig.base.json), with no ambient types: what a file needs, it brings.
  write("tsconfig.json", {
    compilerOptions: {
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
    },
    include: ["src"],
  });
  // baseColor "" keeps the CLI off shadcn's own site; with every file a `~/src/…` target, the
  // aliases place nothing, but they must be there.
  write("components.json", {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: false,
    tsx: true,
    tailwind: { config: "", css: "", baseColor: "", cssVariables: true },
    aliases: {
      components: "@/components",
      ui: "@/components",
      lib: "@/lib",
      hooks: "@/hooks",
      utils: "@/lib/utils",
    },
    registries: { [namespace]: `${served.url}/r/{name}.json` },
  });
  const before = new Set(readdirSync(project));

  if (await run("pnpm", ["install"], project)) {
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

    // Byte for byte, both ways.
    const ours = new Set(filesUnder(nodePath.join(root, "src")));
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
      if (
        !before.has(entry) &&
        !["node_modules", "pnpm-lock.yaml", "src"].includes(entry)
      ) {
        failures.push(`${entry} was written beside src/`);
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
  `install: byte for byte, only the named packages, type-checks; ${seconds}s`
);
