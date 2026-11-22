import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";

// A long file: 2,000 lines with a few changes. Unchanged stretches fold away; open one and only
// the lines in view are drawn.
const lines = Array.from(
  { length: 2000 },
  (_, index) =>
    `  { id: ${index + 1}, name: "Item ${index + 1}", stock: ${(index * 7) % 50} },`
);
const before = ["export const items = [", ...lines, "];", ""].join("\n");
const changed = [...lines];
changed[120] = `  { id: 121, name: "Item 121", stock: 0 },`;
changed[980] = `  { id: 981, name: "Item 981 (discontinued)", stock: 0 },`;
changed.splice(1640, 2);
const after = ["export const items = [", ...changed, "];", ""].join("\n");

export default function DiffViewerLong() {
  return (
    <DiffViewer
      title="items.ts"
      oldValue={before}
      newValue={after}
      contextLines={200}
    />
  );
}
