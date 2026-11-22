// The registry as it is served: `shadcn build` on registry.json, then what the stock build cannot
// do, and the same files once more under the commit they were built from.
//
//   node scripts/registry-dist.ts <folder>     writes <folder>/r/ and <folder>/r/<commit>/
//
// `pnpm build` runs it on dist/, after the site; scripts/check-install.ts installs from what it
// writes. After `shadcn build`:
// - a font's content is the file in base64 (the stock build read its bytes as text, which loses
//   them), under the `<name>.woff2.base64` target registry.json gives it;
// - every item's `meta` gains `commit`, beside the version and the licence registry.json holds, so
//   an installed item can be traced to the commit it came from without comparing bytes;
// - everything is written again under `r/<commit>/`. That address never serves another commit's
//   files: a product names it in its components.json and installs exactly that commit, or gets a
//   404 once the site has moved on (README.md, "Pin a version").
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import nodePath from "node:path";
import { text } from "node:stream/consumers";

import { isFont, root } from "./build-registry.ts";
import { isRecord, readJson } from "./json.ts";

const FULL_SHA = /^[0-9a-f]{40}$/iu;

/** The build's commit: WORKERS_CI_COMMIT_SHA when it is a full SHA (a manual Workers Builds deploy put
 * the branch name there), else git's HEAD, else "unknown". */
export const commitSha = (
  env: Record<string, string | undefined> = process.env
): string => {
  const fromCi = env.WORKERS_CI_COMMIT_SHA ?? "";
  if (FULL_SHA.test(fromCi)) {
    return fromCi.toLowerCase();
  }
  try {
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (FULL_SHA.test(head)) {
      return head;
    }
  } catch {
    // Not a git checkout: the build says so in version.json.
  }
  return "unknown";
};

/** An item as served: its fonts in base64, its `meta` naming the commit. */
const served = (item: unknown, commit: string): unknown => {
  if (!isRecord(item)) {
    return item;
  }
  return {
    ...item,
    meta: { ...(isRecord(item.meta) ? item.meta : {}), commit },
    ...(Array.isArray(item.files)
      ? {
          files: item.files.map((file: unknown) =>
            isRecord(file) && typeof file.path === "string" && isFont(file.path)
              ? {
                  ...file,
                  content: readFileSync(
                    nodePath.join(root, file.path)
                  ).toString("base64"),
                }
              : file
          ),
        }
      : {}),
  };
};

/**
 * Writes the registry into `<out>/r` and `<out>/r/<commit>`, and returns the commit. Never
 * synchronous: scripts/check-install.ts serves from the same process.
 */
export const writeRegistry = async (out: string): Promise<string> => {
  const dir = nodePath.join(out, "r");
  const child = spawn(
    nodePath.join(root, "node_modules/.bin/shadcn"),
    ["build", "registry.json", "--output", dir],
    { cwd: root, stdio: ["ignore", "ignore", "pipe"] }
  );
  // The CLI's progress goes to stderr, a line for each item: shown only when it fails.
  const [said] = await Promise.all([text(child.stderr), once(child, "close")]);
  if (child.exitCode !== 0) {
    throw new Error(`shadcn build exited ${String(child.exitCode)}:\n${said}`);
  }
  const commit = commitSha();
  const files = readdirSync(dir).filter((name) => name.endsWith(".json"));
  for (const name of files) {
    const path = nodePath.join(dir, name);
    const json = readJson(path);
    // registry.json is the list of items; every other file is one item.
    const next =
      isRecord(json) && Array.isArray(json.items)
        ? {
            ...json,
            items: json.items.map((item: unknown) =>
              isRecord(item)
                ? {
                    ...item,
                    meta: { ...(isRecord(item.meta) ? item.meta : {}), commit },
                  }
                : item
            ),
          }
        : served(json, commit);
    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
  }
  if (FULL_SHA.test(commit)) {
    mkdirSync(nodePath.join(dir, commit), { recursive: true });
    for (const name of files) {
      cpSync(nodePath.join(dir, name), nodePath.join(dir, commit, name));
    }
  }
  return commit;
};

if (import.meta.main) {
  const [out] = process.argv.slice(2);
  if (out === undefined) {
    console.error("usage: node scripts/registry-dist.ts <folder>");
    process.exit(1);
  }
  const commit = await writeRegistry(nodePath.resolve(out));
  console.log(`registry: written to ${out}/r and ${out}/r/${commit}`);
}
