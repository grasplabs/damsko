// The registry as it is served: `shadcn build` on registry.json, then what the stock build cannot
// do; and the same files as one archive, the form a release carries.
//
//   node scripts/registry-dist.ts <folder>             writes <folder>/r/
//   node scripts/registry-dist.ts <folder> --release   and <folder>/registry-v<version>.tgz with
//                                                      its checksum (<name>.sha256)
//
// `pnpm build` runs it on dist/, after the site; scripts/check-install.ts installs from what it
// writes, and from the archive as a product does; .github/workflows/release.yml attaches the
// archive to a tag's release. After `shadcn build`:
// - a font's content is the file in base64 (the stock build read its bytes as text, which loses
//   them), under the `<name>.woff2.base64` target registry.json gives it;
// - every item's `meta` gains `commit`, beside the version and the licence registry.json holds, so
//   an item can be traced to the commit it came from without comparing bytes.
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import {
  readFileSync,
  readdirSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import nodePath from "node:path";
import { text } from "node:stream/consumers";
import { gzipSync } from "node:zlib";

import { isFont, root, version } from "./build-registry.ts";
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
 * Writes the registry into `<out>/r`, and returns the commit. Never synchronous:
 * scripts/check-install.ts serves from the same process.
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
  return commit;
};

/** The name of a version's archive, as its release carries it: `registry-v0.1.0.tgz`. */
export const archiveName = (tag: string) => `registry-${tag}.tgz`;

/**
 * Packs `<out>/r` as `<out>/registry-v<version>.tgz`, with `<name>.sha256` beside it in the form
 * `shasum -c` reads, and returns the tag. The same registry packs to the same bytes on the same
 * machine (names in order, one time for every file, no time in the gzip header), so a tag pushed
 * again replaces its asset with one of the same checksum.
 */
export const packRegistry = (out: string): string => {
  const tag = `v${version}`;
  const names = readdirSync(nodePath.join(out, "r"), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => `r/${entry.name}`)
    .toSorted();
  for (const name of names) {
    utimesSync(nodePath.join(out, name), 0, 0);
  }
  const tar = nodePath.join(out, "registry.tar");
  execFileSync("tar", ["-cf", tar, "-C", out, ...names]);
  const archive = gzipSync(readFileSync(tar));
  rmSync(tar);
  const name = archiveName(tag);
  writeFileSync(nodePath.join(out, name), archive);
  writeFileSync(
    nodePath.join(out, `${name}.sha256`),
    `${createHash("sha256").update(archive).digest("hex")}  ${name}\n`
  );
  return tag;
};

if (import.meta.main) {
  const [out, flag] = process.argv.slice(2);
  if (out === undefined || (flag !== undefined && flag !== "--release")) {
    console.error("usage: node scripts/registry-dist.ts <folder> [--release]");
    process.exit(1);
  }
  const commit = await writeRegistry(nodePath.resolve(out));
  console.log(`registry: ${commit} written to ${out}/r`);
  if (flag === "--release") {
    const tag = packRegistry(nodePath.resolve(out));
    console.log(`registry: packed as ${out}/${archiveName(tag)}`);
  }
}
