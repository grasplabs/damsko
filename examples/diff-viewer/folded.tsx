import { DiffViewerFiles } from "@grasp-os/ui/components/diff-viewer";
import type { DiffViewerFile } from "@grasp-os/ui/components/diff-viewer";

import { files } from "./files";

// A big file opens folded, so it does not bury the rest; its header opens it.
const big = Array.from(
  { length: 480 },
  (_, at) => `  { id: "row-${at + 1}", label: "Row ${at + 1}" },`
).join("\n");
const generated: DiffViewerFile = {
  path: "apps/web/src/data/seed.ts",
  newValue: `export const seed = [\n${big}\n];\n`,
};

export default function DiffViewerFilesFolded() {
  return <DiffViewerFiles files={[...files, generated]} />;
}
