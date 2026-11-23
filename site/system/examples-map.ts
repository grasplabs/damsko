// Every example the browser can bring to life, by its path, each loaded when it is needed: the
// dev server's map (./island.ts). A build writes one map per example folder instead, each a file of
// its own with a fixed name, `/_astro/examples-map/<folder>.js` (site/system/vite.ts, examplesMap),
// loaded by that name and served no-cache (./indexing.ts): a change to one example then changes
// its folder's map and that example's chunk, not the site's shared chunk, so the rest of the build
// keeps its names, and a page from an older build still finds the new chunks.
import type { ComponentType } from "react";

export const examples = import.meta.glob<{
  default: ComponentType<Record<string, unknown>>;
}>("/examples/**/*.tsx");
