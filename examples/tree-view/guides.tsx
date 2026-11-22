import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import { FileIcon, FolderIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({ measure: { width: "100%", maxWidth: "20rem" } });

const files: TreeNode[] = [
  {
    value: "reports",
    label: "Reports",
    icon: FolderIcon,
    children: [
      { value: "reports/q3", label: "Q3 summary", icon: FileIcon },
      {
        value: "reports/regions",
        label: "Regions",
        icon: FolderIcon,
        children: [
          { value: "reports/regions/north", label: "North", icon: FileIcon },
          { value: "reports/regions/south", label: "South", icon: FileIcon },
        ],
      },
      { value: "reports/notes", label: "Notes", icon: FileIcon },
    ],
  },
  { value: "budget", label: "Budget", icon: FileIcon },
];

// The tree guide (`showIndentGuides`): a stem down from each open branch's chevron and a rounded elbow into
// each of its items, stopping at the last, as Sidebar's nested rows.
export default function TreeGuides() {
  return (
    <div {...stylex.props(layout.measure)}>
      <TreeView
        aria-label="Files"
        items={files}
        showIndentGuides
        defaultExpandedValue={["reports", "reports/regions"]}
      />
    </div>
  );
}
