// Whether search engines may list the site: the one switch. The public site at
// damsko.joingrasp.com is never listed: Damsko is Grasp's own, and its docs are for the people who
// build with it. Everything that tells a crawler reads this file:
//
//   - every page's head (layouts/Docs.astro, layouts/Frame.astro): `robotsMeta`;
//   - robots.txt and _headers, written into the build at its end (astro.config.ts, `crawlerFiles`):
//     `robotsTxt` and `headersFile`. Cloudflare's static assets read _headers.
//
// No sitemap is made or advertised either way. To let the site be listed, set `indexable` to true:
// pages then carry no robots meta (a study, frame or redirect page keeps its own noindex),
// robots.txt allows every path and _headers sends no X-Robots-Tag.

export const indexable = false;

/** The robots meta for a page, or null for none. `own` is the page's own wish (a study, an example
 * frame, a redirect: "noindex"), which holds while the site is listed. */
export const robotsMeta = (own?: string): string | null =>
  indexable ? (own ?? null) : "noindex, nofollow";

/**
 * A search engine drops a page only when it can read the page's noindex, so the engines that honour
 * it may fetch: barred from fetching, they can still list a bare address that something links to.
 * Every other crawler is told to stay out.
 */
const SEARCH_ENGINES = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "YandexBot",
  "Baiduspider",
];

export const robotsTxt = indexable
  ? "User-agent: *\nAllow: /\n"
  : `${SEARCH_ENGINES.map((agent) => `User-agent: ${agent}\n`).join("")}Allow: /\n\nUser-agent: *\nDisallow: /\n`;

/**
 * The files a build writes under one name that never changes, so a change to them touches no other
 * file: the examples' maps, one per folder (./vite.ts, examplesMap), StyleX's sheet (./vite.ts, stylexSheet) and the search index (./vite.ts, searchIndexFile). Each is asked for afresh every time (a 304 when unchanged);
 * everything they name is hashed and kept for ever.
 */
export const fixedNames = [
  "/_astro/examples-map/*",
  "/_astro/stylex.css",
  "/_astro/search-index.js",
];
const fixedHeaders = fixedNames
  .map((name) => `${name}\n  Cache-Control: no-cache\n`)
  .join("");

/**
 * The registry (dist/r, scripts/registry-dist.ts). /r/<name>.json is main as last deployed and
 * changes with every deploy: kept for five minutes, then asked for again. /r/<tag>/<name>.json is
 * a released version, which never changes: kept for a year. The second rule takes the first
 * one's header off before it sets its own, as Cloudflare's _headers would otherwise join the two.
 */
const registryHeaders = [
  "/r/*",
  "  Cache-Control: public, max-age=300, must-revalidate",
  "/r/:tag/*",
  "  ! Cache-Control",
  "  Cache-Control: public, max-age=31536000, immutable",
  "",
].join("\n");

export const headersFile = indexable
  ? `${fixedHeaders}${registryHeaders}`
  : `/*\n  X-Robots-Tag: noindex, nofollow\n${fixedHeaders}${registryHeaders}`;
