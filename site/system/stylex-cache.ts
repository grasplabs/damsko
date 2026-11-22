// A disk cache for StyleX's Babel pass in a build: about a third of a quiet build's main thread
//. The pass is a pure function of the file's text, its path and the
// build's StyleX setup, plus the values in the `*.stylex.ts` files it may read through imports, so a
// file that did not change gives the same code and the same rules. On a hit the cached code is
// returned and its rules are put where the plugin collects them (its shared store), as its own
// transform does. A build only: dev is untouched. GRASP_STYLEX_CACHE=0 turns it off.
//
// The key holds: the file's text and id, the plugin's version and options, pnpm-lock.yaml, and every
// `*.stylex.ts` and token file in the repository (one global part: a change to any of them misses
// every file).
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import type { Plugin } from "vite";

type Transform = (
  this: unknown,
  code: string,
  id: string
) => Promise<{ code: string; map?: unknown } | null | undefined>;

interface StylexLike {
  transform?: Transform;
  apply?: unknown;
  __stylexGetSharedStore?: () => {
    rulesById: Map<string, unknown>;
    version: number;
  };
}

interface Entry {
  code: string;
  map: unknown;
  rules: unknown;
}

const sha = (text: string | Buffer) =>
  createHash("sha1").update(text).digest("hex");

/** Every file under `folder` whose name passes `keep`, sorted, skipping node_modules and dot folders. */
const filesUnder = (
  folder: string,
  keep: (name: string) => boolean
): string[] =>
  existsSync(folder)
    ? readdirSync(folder, { withFileTypes: true })
        .flatMap((entry) => {
          if (entry.name === "node_modules" || entry.name.startsWith(".")) {
            return [];
          }
          const path = join(folder, entry.name);
          if (entry.isDirectory()) {
            return filesUnder(path, keep);
          }
          return keep(entry.name) ? [path] : [];
        })
        .toSorted()
    : [];

/** The part of every key that is the build's own setup. */
const globalKey = (root: string, options: unknown): string => {
  const version = JSON.parse(
    readFileSync(
      join(root, "node_modules/@stylexjs/unplugin/package.json"),
      "utf-8"
    )
  ).version as string;
  const parts = [
    version,
    JSON.stringify(options),
    sha(readFileSync(join(root, "pnpm-lock.yaml"))),
  ];
  for (const file of [
    ...filesUnder(join(root, "src"), (name) => name.endsWith(".stylex.ts")),
    ...filesUnder(join(root, "site"), (name) => name.endsWith(".stylex.ts")),
    ...filesUnder(join(root, "tokens"), () => true),
  ]) {
    parts.push(file, sha(readFileSync(file)));
  }
  return sha(parts.join("\n"));
};

/** Wraps the StyleX plugin's transform with the disk cache, in a build. */
export const cacheStylex = (
  plugin: Plugin,
  root: string,
  options: unknown
): Plugin => {
  const own = plugin as unknown as StylexLike;
  const original = own.transform;
  if (original === undefined || process.env.GRASP_STYLEX_CACHE === "0") {
    return plugin;
  }
  const folder = join(root, "node_modules", ".cache", "grasp", "stylex");
  let building = false;
  let base = "";
  const wrapped: Plugin = {
    ...plugin,
    configResolved(config) {
      building = config.command === "build";
      if (building) {
        base = globalKey(root, options);
        mkdirSync(folder, { recursive: true });
      }
      const hook = plugin.configResolved;
      return typeof hook === "function"
        ? ((hook as (c: typeof config) => unknown).call(this, config) as void)
        : undefined;
    },
  };
  (wrapped as unknown as StylexLike).transform = async function transform(
    this: unknown,
    code: string,
    id: string
  ) {
    if (!building) {
      return await original.call(this, code, id);
    }
    const file = join(folder, `${sha(`${base}\n${id}\n${code}`)}.json`);
    const store = own.__stylexGetSharedStore?.();
    if (existsSync(file)) {
      try {
        const entry = JSON.parse(readFileSync(file, "utf-8")) as Entry;
        if (entry.rules !== null && store !== undefined) {
          store.rulesById.set(id, entry.rules);
          store.version += 1;
        }
        return { code: entry.code, map: entry.map as never };
      } catch {
        // A broken entry is only a miss.
      }
    }
    const result = await original.call(this, code, id);
    // Only what StyleX changed is kept: a file it leaves alone (null) is cheap to ask again.
    if (result !== null && result !== undefined) {
      const entry: Entry = {
        code: result.code,
        map: result.map ?? null,
        rules: store?.rulesById.get(id) ?? null,
      };
      try {
        writeFileSync(file, JSON.stringify(entry));
      } catch {
        // A cache that cannot be written is only a slower next build.
      }
    }
    return result;
  };
  return wrapped;
};
