/**
 * Keeps the tree to what the library and its site need. Fails on:
 * - a file under public/ that is not one of the site's root files or in one
 *   of the folders named below, and one that nothing refers to;
 * - an image, video or audio file outside public/ (screenshots that prove a
 *   change go in the pull request);
 * - any file over 1 MB;
 * - a Markdown file that isn't on the allowlist (no plans, notes or
 *   handover files: the why goes in code comments and pull requests).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const MEDIA =
  /\.(?:png|jpe?g|gif|webp|avif|ico|bmp|tiff?|svg|mp4|webm|mov|m4v|mp3|wav|ogg|m4a|flac|aac)$/iu;

/** The files at the root of public/: the favicon, the app icons and their manifest. */
const PUBLIC_ROOT = new Set([
  "public/apple-touch-icon.png",
  "public/favicon.ico",
  "public/icon-192.png",
  "public/icon-512.png",
  "public/icon.svg",
  "public/site.webmanifest",
]);

/** The folders under public/: the brand book's assets, the fonts, example media and people. */
const PUBLIC_FOLDERS = /^public\/(?:brand|fonts|media|people)\//u;

const MARKDOWN = /\.mdx?$/iu;

const MARKDOWN_ALLOWED = [
  /^(?:README|CONTRIBUTING|CHANGELOG|AGENTS|THIRD_PARTY_NOTICES)\.md$/u,
  /^\.github\/[^/]+\.md$/u,
  // The docs site's pages.
  /^docs\/.+\.mdx$/u,
];

/** Files read as text, to find what refers to an asset under public/. */
const TEXT =
  /\.(?:astro|css|html|json|jsonc|md|mdx|svg|ts|tsx|txt|webmanifest|ya?ml)$/iu;

const MAX_BYTES = 1024 * 1024;

const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf-8" }
)
  .split("\n")
  .filter((file) => file !== "");

// A file deleted in the working tree but still in the index has no size.
const present = (file: string) =>
  statSync(file, { throwIfNoEntry: false }) !== undefined;

const texts = files
  .filter(
    (file) => TEXT.test(file) && file !== "pnpm-lock.yaml" && present(file)
  )
  .map((file) => ({ file, text: readFileSync(file, "utf-8") }));

/**
 * Whether anything else in the tree names the asset, by its path under public/. A `.small.jpg` is
 * used with its full-size picture: the brand book's light draws it in that one's place
 * (site/brand/exhibits-light.tsx).
 */
const used = (file: string) => {
  const served = file.slice("public/".length);
  const names = [served, served.replace(/\.small\.jpg$/u, ".jpg")];
  return texts.some(
    (each) =>
      each.file !== file && names.some((name) => each.text.includes(name))
  );
};

const problems = files.flatMap((file) => {
  const found: string[] = [];
  const inPublic = file.startsWith("public/");
  if (inPublic && !PUBLIC_ROOT.has(file) && !PUBLIC_FOLDERS.test(file)) {
    found.push(
      `${file}: not one of public/'s root files or folders (scripts/guard.ts)`
    );
  }
  if (inPublic && present(file) && !used(file)) {
    found.push(`${file}: nothing refers to it; delete it`);
  }
  if (MEDIA.test(file) && !inPublic) {
    found.push(`${file}: pictures, video and audio live only in public/`);
  }
  if (
    MARKDOWN.test(file) &&
    !MARKDOWN_ALLOWED.some((allowed) => allowed.test(file))
  ) {
    found.push(`${file}: Markdown that is not on the allowlist`);
  }
  const size = statSync(file, { throwIfNoEntry: false })?.size ?? 0;
  if (size > MAX_BYTES) {
    found.push(`${file}: ${Math.round(size / 1024)} KB, over the 1 MB limit`);
  }
  return found;
});

if (problems.length > 0) {
  console.error(
    `guard: ${problems.length} problem(s)\n${problems.map((problem) => `  ${problem}`).join("\n")}`
  );
  process.exit(1);
}
console.log(`guard: ${files.length} files checked`);
