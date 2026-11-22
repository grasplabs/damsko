import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  cell: { width: "100%" },
});

// One kind of line in one state, as a diff without its head. The docs draw it once per state;
// hover and keyboard focus are forced from the diff's own CSS.
const texts = {
  added: { before: "", after: "days" },
  removed: { before: "total", after: "" },
  words: { before: "30 days", after: "14 days" },
  fold: {
    before: "x\nid\nname\ntotal\nstock\n",
    after: "id\nname\ntotal\nstock\n",
  },
} as const;

export default function DiffViewerState({
  part = "added",
}: {
  part?: keyof typeof texts;
}) {
  const { before, after } = texts[part];
  // In a cell this narrow the fold's words wrap, as a diff's long lines do: nothing is cut off.
  return (
    <div data-may-wrap {...stylex.props(layout.cell)}>
      <DiffViewer
        showHeader={false}
        aria-label="A change"
        oldValue={before}
        newValue={after}
        contextLines={0}
        style={layout.cell}
      />
    </div>
  );
}
