// The examples: every file under examples/ that draws something (`<folder>/<name>.tsx`), found by
// Vite's import.meta.glob, so a new file or folder is there on the next request, with no list and no
// generated wrapper. A page names one by its path without the extension: "button/states".
//
// Found by ./example-files.ts (Vite's globs) in a build, and by ./example-files-dev.ts (the folder,
// each example by its own path) in dev, where the globs would make the first page compile them all.
import { exampleFiles } from "./example-files";
import type { Example } from "./example-types";

/** Whether an example exists at `examples/{path}.tsx`. */
export const hasExample = (path: string) => exampleFiles.has(path);

/** The example's component. Throws, naming the file, when there is none. */
export const loadExample = async (path: string): Promise<Example> => {
  const module = await exampleFiles.component(path);
  if (
    typeof module.default !== "function" &&
    typeof module.default !== "object"
  ) {
    throw new TypeError(`examples/${path}.tsx has no default export to draw.`);
  }
  return module.default;
};

/** The example's source text. Throws, naming the file, when there is none. */
export const loadSource = async (path: string): Promise<string> =>
  await exampleFiles.source(path);

/** Every example's path, sorted: "button/states". */
export const examplePaths = () => exampleFiles.paths().toSorted();
