// The registry as it is served: `shadcn build` on registry.json, then what the stock build cannot
// do; the same files as one archive, the form a release carries; and every released version
// beside the latest, from those archives.
//
//   node scripts/registry-dist.ts <folder>             writes <folder>/r/
//   node scripts/registry-dist.ts <folder> --release   and <folder>/registry-v<version>.tgz with
//                                                      its checksum (<name>.sha256)
//   node scripts/registry-dist.ts <folder> --versions  and <folder>/r/<tag>/ for every release
//
// `pnpm build` runs it on dist/ with --versions, after the site; scripts/check-install.ts installs
// from what it writes, as a product does; .github/workflows/release.yml attaches the archive to a
// tag's release. After `shadcn build`:
// - a font's content is the file in base64 (the stock build read its bytes as text, which loses
//   them), under the `<name>.woff2.base64` target registry.json gives it;
// - every item's `meta` gains `commit`, beside the version and the licence registry.json holds, so
//   an item can be traced to the commit it came from without comparing bytes.
//
// A version's address is /r/<tag>/{name}.json. An item names what it builds on as `@damsko/<name>`,
// which the CLI resolves through the same address in the product's components.json: an install
// from a version takes every item from that version.
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import nodePath from "node:path";
import { text } from "node:stream/consumers";
import { gunzipSync, gzipSync } from "node:zlib";

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

const BLOCK = 512;

/** A field of a tar header: an octal number, padded with zeros, then NUL. */
const octal = (value: number, width: number) =>
  `${value.toString(8).padStart(width - 1, "0")}\0`;

/**
 * A file as a tar entry (ustar): its header, its bytes, padded to the block. Nothing of the
 * machine it is packed on: no time, owner and group 0, mode 644, no extended attributes.
 */
const tarEntry = (name: string, content: Buffer): Buffer => {
  const header = Buffer.alloc(BLOCK);
  header.write(name, 0, 100);
  header.write(octal(0o644, 8), 100);
  header.write(octal(0, 8), 108);
  header.write(octal(0, 8), 116);
  header.write(octal(content.length, 12), 124);
  header.write(octal(0, 12), 136);
  // The checksum is taken with its own field as spaces.
  header.write("        ", 148);
  header.write("0", 156);
  header.write("ustar\u000000", 257);
  let sum = 0;
  for (const byte of header) {
    sum += byte;
  }
  header.write(`${octal(sum, 7)} `, 148);
  const padding = Buffer.alloc((BLOCK - (content.length % BLOCK)) % BLOCK);
  return Buffer.concat([header, content, padding]);
};

/** The files of a tar archive, by name. Only what tarEntry writes: plain files, short names. */
const tarFiles = (archive: Buffer): Map<string, Buffer> => {
  const files = new Map<string, Buffer>();
  let at = 0;
  while (at + BLOCK <= archive.length && archive[at] !== 0) {
    const field = (from: number, length: number) =>
      archive
        .subarray(from, from + length)
        .toString("utf-8")
        .replace(/\0.*$/su, "");
    const size = Number.parseInt(field(at + 124, 12), 8);
    files.set(field(at, 100), archive.subarray(at + BLOCK, at + BLOCK + size));
    at += BLOCK + Math.ceil(size / BLOCK) * BLOCK;
  }
  return files;
};

const sha256 = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");

/**
 * Packs `<out>/r` as `<out>/registry-v<version>.tgz`, with `<name>.sha256` beside it in the form
 * `shasum -c` reads, and returns the tag. A tag is a pin, so the archive is the same bytes
 * wherever and whenever the same commit is packed: the entries in name order, written here and
 * not by the system's tar, and nothing in the gzip header.
 */
export const packRegistry = (out: string): string => {
  const tag = `v${version}`;
  const names = readdirSync(nodePath.join(out, "r"), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => `r/${entry.name}`)
    .toSorted();
  const archive = gzipSync(
    Buffer.concat([
      ...names.map((name) =>
        tarEntry(name, readFileSync(nodePath.join(out, name)))
      ),
      Buffer.alloc(BLOCK * 2),
    ]),
    { level: 9 }
  );
  // The one byte of a gzip header that names the system it was made on.
  archive[9] = 255;
  const name = archiveName(tag);
  writeFileSync(nodePath.join(out, name), archive);
  writeFileSync(
    nodePath.join(out, `${name}.sha256`),
    `${sha256(archive)}  ${name}\n`
  );
  return tag;
};

/** Where GitHub lists Damsko's releases. The repository is public: no token. */
export const releasesApi =
  "https://api.github.com/repos/grasplabs/damsko/releases?per_page=100";

const TAG = /^v\d+\.\d+\.\d+$/u;
const ITEM = /^r\/[\w-]+\.json$/u;

/**
 * A file from GitHub. Nothing needs a token: the repository is public. Where the environment has
 * one (GITHUB_TOKEN, in CI), the list of releases is asked for with it, since GitHub answers few
 * unsigned questions from an address many runners share; it goes to GitHub's API and nowhere else.
 */
const fetched = async (url: string): Promise<Buffer> => {
  const token = process.env.GITHUB_TOKEN ?? "";
  const response = await fetch(url, {
    headers: {
      "User-Agent": "damsko-site-build",
      ...(token !== "" && url.startsWith("https://api.github.com/")
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${url} answered ${String(response.status)}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

/**
 * Writes every released version into `<out>/r/<tag>/`, from the archive its release carries, and
 * returns the tags written. Asked for at every build, nothing kept between builds. A release with
 * no archive is passed over and said; an archive that is not the file its checksum names stops
 * the build, as does a list of releases that cannot be read: a site that dropped the versions
 * unseen would break every product's pin.
 */
export const writeVersions = async (
  out: string,
  api = releasesApi
): Promise<string[]> => {
  const listed = await fetched(api);
  const releases: unknown = JSON.parse(listed.toString("utf-8"));
  if (!Array.isArray(releases)) {
    throw new TypeError(`${api} did not answer with a list of releases`);
  }
  const written: string[] = [];
  for (const release of releases) {
    const tag = isRecord(release) ? release.tag_name : undefined;
    if (typeof tag !== "string" || !TAG.test(tag)) {
      continue;
    }
    const assets = new Map<string, string>();
    for (const asset of isRecord(release) && Array.isArray(release.assets)
      ? release.assets
      : []) {
      if (
        isRecord(asset) &&
        typeof asset.name === "string" &&
        typeof asset.browser_download_url === "string"
      ) {
        assets.set(asset.name, asset.browser_download_url);
      }
    }
    const name = archiveName(tag);
    const from = assets.get(name);
    const sumFrom = assets.get(`${name}.sha256`);
    if (from === undefined || sumFrom === undefined) {
      console.log(
        `registry: ${tag} has no archive in its release, passed over`
      );
      continue;
    }
    // oxlint-disable-next-line no-await-in-loop -- one release after the other, a few small files
    const [archive, sum] = await Promise.all([fetched(from), fetched(sumFrom)]);
    if (sum.toString("utf-8").split(/\s/u)[0] !== sha256(archive)) {
      throw new Error(`${name} is not the file its checksum names`);
    }
    const dir = nodePath.join(out, "r", tag);
    mkdirSync(dir, { recursive: true });
    for (const [file, content] of tarFiles(gunzipSync(archive))) {
      // Only an item's file, by its plain name: nothing an archive says is written anywhere else.
      if (ITEM.test(file)) {
        writeFileSync(nodePath.join(dir, nodePath.basename(file)), content);
      }
    }
    written.push(tag);
  }
  return written;
};

if (import.meta.main) {
  const [out, flag] = process.argv.slice(2);
  if (
    out === undefined ||
    (flag !== undefined && flag !== "--release" && flag !== "--versions")
  ) {
    console.error(
      "usage: node scripts/registry-dist.ts <folder> [--release | --versions]"
    );
    process.exit(1);
  }
  const commit = await writeRegistry(nodePath.resolve(out));
  console.log(`registry: ${commit} written to ${out}/r`);
  if (flag === "--release") {
    const tag = packRegistry(nodePath.resolve(out));
    console.log(`registry: packed as ${out}/${archiveName(tag)}`);
  }
  if (flag === "--versions") {
    const tags = await writeVersions(nodePath.resolve(out));
    console.log(
      `registry: ${tags.length} released version(s) written to ${out}/r/<tag>${tags.length > 0 ? `: ${tags.join(", ")}` : ""}`
    );
  }
}
