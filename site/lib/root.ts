// The repository root: the folder with astro.config.ts, found from where the build runs. (Site
// code is bundled into the build's own folder, so its import.meta.url does not lead there.)
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

export const findRoot = (): string => {
  let folder = process.cwd();
  while (!existsSync(join(folder, "astro.config.ts"))) {
    const parent = dirname(folder);
    if (parent === folder) {
      throw new Error("No astro.config.ts above the working folder.");
    }
    folder = parent;
  }
  return folder;
};
