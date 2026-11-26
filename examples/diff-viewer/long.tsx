import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";

// A long file: 5,000 lines, 300 of them changed in 100 places (a line edited and one added in each).
// Unchanged stretches fold away; past `virtualizeThreshold` rows only the lines in view are drawn,
// each coloured.
const lines = Array.from(
  { length: 5000 },
  (_, index) =>
    `  { id: ${index + 1}, name: "Item ${index + 1}", stock: ${(index * 7) % 50} },`
);
const before = ["export const items = [", ...lines, "];", ""].join("\n");
const changed = lines.flatMap((line, index) =>
  index % 50 === 25
    ? [
        line.replace("stock:", "stock: 0, was:"),
        `  { id: ${index + 1}.5, name: "Item ${index + 1} (refill)", stock: 20 },`,
      ]
    : [line]
);
const after = ["export const items = [", ...changed, "];", ""].join("\n");

export default function DiffViewerLong() {
  return (
    <DiffViewer
      title="items.ts"
      language="ts"
      oldValue={before}
      newValue={after}
    />
  );
}
