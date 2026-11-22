// The one-file brand book: after the build, /brand/book (a still page, drawn on the server from the
// same rooms and words as /brand) becomes dist/brand/grasp-brand-book.html, a single file that reads
// from disk with no network and no script:
//
//   - every stylesheet the page links is inlined, keeping only the rules whose classes the page uses
//     (StyleX's sheet holds every component's rules; the book needs few of them);
//   - the fonts (Geist, Geist Serif, Geist Mono: SIL Open Font License 1.1) are embedded as base64,
//     and their licence (public/fonts/OFL.txt) travels with them, in full, at the end of the file;
//   - every local file a style or the markup names becomes data; a link to another page of the site
//     becomes its full address on damsko.joingrasp.com;
//   - every script, preload and icon link is dropped.
//
// It fails the build when anything is left that would reach the network.
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";
import postcss from "postcss";

const site = "https://damsko.joingrasp.com";

const types: Record<string, string> = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".css": "text/css",
};

const notice = `<!--
  Grasp brand book, one file. Made from damsko.joingrasp.com/brand at build.
  Fonts embedded: Geist, Geist Serif and Geist Mono, by Vercel, under the SIL Open Font License 1.1
  (https://openfontlicense.org). Their copyright notices and the licence in full are in the
  <pre id="font-licence"> at the end of this file.
-->`;

/** Text as HTML: the licence's own words, never markup. */
const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/** A file of the build as a data address, or null when the build has no such file. */
const dataOf = (out: string, path: string): string | null => {
  const clean = path.split(/[?#]/u)[0] ?? path;
  const file = join(out, clean);
  if (!clean.startsWith("/") || !existsSync(file) || !statSync(file).isFile()) {
    return null;
  }
  const type = types[extname(file)] ?? "application/octet-stream";
  return `data:${type};base64,${readFileSync(file).toString("base64")}`;
};

/** Only the rules the page can match: a rule stays when, for one of its selectors, every class it
 * names is on the page. Empty at-rules go after. */
const prune = (css: string, classes: Set<string>) => {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    const { parent } = rule;
    if (
      parent?.type === "atrule" &&
      (parent as postcss.AtRule).name.endsWith("keyframes")
    ) {
      return;
    }
    const keep = rule.selectors.some((selector) =>
      [...selector.matchAll(/\.([\w-]+)/gu)].every((match) =>
        classes.has(match[1] ?? "")
      )
    );
    if (!keep) {
      rule.remove();
    }
  });
  let removed = true;
  while (removed) {
    removed = false;
    root.walkAtRules((at) => {
      if (
        ["media", "supports", "layer", "container"].includes(at.name) &&
        at.nodes !== undefined &&
        at.nodes.length === 0
      ) {
        at.remove();
        removed = true;
      }
    });
  }
  return root.toString();
};

/** Builds the one file from the built still page; returns its size in bytes. */
export const assemble = (out: string): number => {
  const source = join(out, "brand", "book", "index.html");
  let html = readFileSync(source, "utf-8");

  // The stylesheets, read and taken out of the head.
  const sheets: string[] = [];
  html = html.replaceAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gu, (tag) => {
    const href = /href="([^"]+)"/u.exec(tag)?.[1];
    if (href !== undefined && existsSync(join(out, href))) {
      sheets.push(readFileSync(join(out, href), "utf-8"));
    }
    return "";
  });
  // No script, no preload, no icon: nothing that would ask the network.
  html = html
    .replaceAll(/<script\b[\s\S]*?<\/script>/gu, "")
    .replaceAll(
      /<link\b[^>]*rel="(?:modulepreload|preload|prefetch|icon|apple-touch-icon|manifest)"[^>]*>/gu,
      ""
    );

  const classes = new Set(
    [...html.matchAll(/class="([^"]+)"/gu)].flatMap((match) =>
      (match[1] ?? "").split(/\s+/u)
    )
  );
  let css = prune(sheets.join("\n"), classes);
  css = css.replaceAll(
    /url\((["']?)(\/[^)"']+)\1\)/gu,
    (_, _quote: string, path: string) =>
      `url("${dataOf(out, path) ?? "data:,"}")`
  );

  // Local pictures become data; links to the site's pages become full addresses.
  html = html
    .replaceAll(
      /\s(src|href)="(\/[^"]*)"/gu,
      (whole, name: string, path: string) => {
        if (name === "src") {
          return ` src="${dataOf(out, path) ?? ""}"`;
        }
        return ` href="${site}${path}"`;
      }
    )
    .replace("</head>", `<style>${css}</style></head>`)
    .replace(
      "</body>",
      `<pre id="font-licence" hidden>${escapeHtml(readFileSync(join(out, "fonts", "OFL.txt"), "utf-8"))}</pre></body>`
    )
    .replace("<!doctype html>", `<!doctype html>\n${notice}`)
    .replace("<!DOCTYPE html>", `<!DOCTYPE html>\n${notice}`);

  const left = [
    ...html.matchAll(
      /\s(?:src|href)="(?!data:|#|https:\/\/damsko\.joingrasp\.com|mailto:)([^"]+)"/gu
    ),
  ].map((match) => match[1]);
  const leftInCss = [
    ...css.matchAll(/url\((["']?)(?!data:|#)([^)"']+)\1\)/gu),
  ].map((match) => match[2]);
  if (left.length > 0 || leftInCss.length > 0) {
    throw new Error(
      `The one-file brand book would reach the network: ${[...left, ...leftInCss].slice(0, 5).join(", ")}`
    );
  }
  const file = join(out, "brand", "grasp-brand-book.html");
  writeFileSync(file, html);
  return Buffer.byteLength(html);
};

export const brandBookFile: AstroIntegration = {
  name: "damsko:brand-book-file",
  hooks: {
    "astro:build:done": ({ dir, logger }) => {
      const out = fileURLToPath(dir);
      if (!existsSync(join(out, "brand", "book", "index.html"))) {
        return;
      }
      const size = assemble(out);
      logger.info(
        `brand/grasp-brand-book.html written: ${(size / 1024).toFixed(0)} KB`
      );
    },
  },
};
