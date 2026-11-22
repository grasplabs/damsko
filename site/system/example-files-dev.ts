// The examples in dev (astro.config.ts puts this file in ./example-files.ts's place there): read
// from the folder, an example loaded by its own path when a stage asks for it. No glob names them
// all, so the dev server's first page compiles only what it shows, and a file added while dev runs
// is there on the next request. A path with no file fails loudly, naming it: never an empty stage.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import type { ExampleFiles, ExampleModule } from "./example-types";

const folder = join(process.cwd(), "examples");

const file = (path: string) => join(folder, `${path}.tsx`);

const must = (path: string) => {
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)+$/u.test(path) || !existsSync(file(path))) {
    throw new Error(`No example at examples/${path}.tsx.`);
  }
};

const walk = (dir: string, prefix: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return walk(join(dir, entry.name), `${prefix}${entry.name}/`);
    }
    return entry.name.endsWith(".tsx")
      ? [`${prefix}${entry.name.slice(0, -".tsx".length)}`]
      : [];
  });

export const exampleFiles: ExampleFiles = {
  has: (path) => existsSync(file(path)),
  component: async (path) => {
    must(path);
    const module: ExampleModule = await import(
      /* @vite-ignore */ `/examples/${path}.tsx`
    );
    return module;
  },
  source: async (path) => {
    must(path);
    const module: { default: string } = await import(
      /* @vite-ignore */ `/examples/${path}.tsx?raw`
    );
    return module.default;
  },
  paths: () => walk(folder, ""),
};
