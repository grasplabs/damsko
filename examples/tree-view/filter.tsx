import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import { FileIcon, FolderIcon } from "@grasp-os/ui/lib/icons";
import { media } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// An app's code, as a Code view lists it.
const files: TreeNode[] = [
  {
    value: "src",
    label: "src",
    icon: FolderIcon,
    children: [
      {
        value: "src/components",
        label: "components",
        icon: FolderIcon,
        children: [
          {
            value: "src/components/invoice-table.tsx",
            label: "invoice-table.tsx",
            icon: FileIcon,
          },
          {
            value: "src/components/invoice-row.tsx",
            label: "invoice-row.tsx",
            icon: FileIcon,
          },
          {
            value: "src/components/totals.tsx",
            label: "totals.tsx",
            icon: FileIcon,
          },
        ],
      },
      {
        value: "src/data",
        label: "data",
        icon: FolderIcon,
        children: [
          {
            value: "src/data/invoices.ts",
            label: "invoices.ts",
            icon: FileIcon,
          },
          {
            value: "src/data/suppliers.ts",
            label: "suppliers.ts",
            icon: FileIcon,
          },
        ],
      },
      { value: "src/app.tsx", label: "app.tsx", icon: FileIcon },
    ],
  },
  { value: "package.json", label: "package.json", icon: FileIcon },
  { value: "README.md", label: "README.md", icon: FileIcon },
];

const layout = stylex.create({
  // Room kept for the whole tree open, so filtering never moves what stands above it.
  room: {
    display: "grid",
    alignContent: "start",
    width: "100%",
    maxWidth: 320,
    minHeight: { default: 360, [media.pointerCoarse]: 520 },
  },
});

// A filter over the tree: typing "invoice" keeps the three files that hold it, with their folders
// opened, and marks the word; emptied, the folds come back as they were.
export default function TreeFilter() {
  return (
    <div {...stylex.props(layout.room)}>
      <TreeView
        aria-label="Files"
        items={files}
        filterable
        defaultExpandedValue={["src"]}
        defaultValue="src/app.tsx"
      />
    </div>
  );
}
