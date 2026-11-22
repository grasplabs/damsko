// The examples, found for a build: Vite's import.meta.glob over examples/, so each example is its
// own chunk, loaded only when a stage asks for it, and its source text is there for the Code view
// and the Markdown twin. In dev, astro.config.ts puts ./example-files-dev.ts in this file's place:
// the dev server's style collection walks every module these globs name (720 examples, twice, and
// every component they import) before it answers the first page.
import type { ExampleFiles, ExampleModule } from "./example-types";

const components = import.meta.glob<ExampleModule>("/examples/**/*.tsx");
const sources = import.meta.glob<string>("/examples/**/*.tsx", {
  query: "?raw",
  import: "default",
});

const key = (path: string) => `/examples/${path}.tsx`;

export const exampleFiles: ExampleFiles = {
  has: (path) => key(path) in components,
  component: async (path) => {
    const load = components[key(path)];
    if (!load) {
      throw new Error(`No example at examples/${path}.tsx.`);
    }
    return await load();
  },
  source: async (path) => {
    const load = sources[key(path)];
    if (!load) {
      throw new Error(`No example at examples/${path}.tsx.`);
    }
    return await load();
  },
  paths: () =>
    Object.keys(components).map((file) =>
      file.slice("/examples/".length, -".tsx".length)
    ),
};
