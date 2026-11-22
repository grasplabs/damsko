import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import { FileIcon, FolderIcon } from "@grasp-os/ui/lib/icons";
import { media } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const files: TreeNode[] = [
  {
    value: "reports",
    label: "Reports",
    icon: FolderIcon,
    children: [
      { value: "reports/summary", label: "Quarterly summary", icon: FileIcon },
      { value: "reports/survey", label: "Team survey results", icon: FileIcon },
      {
        value: "reports/archive",
        label: "Archive",
        icon: FolderIcon,
        children: [
          {
            value: "reports/archive/2025",
            label: "Summary 2025",
            icon: FileIcon,
          },
        ],
      },
    ],
  },
  { value: "suppliers", label: "Supplier list", icon: FileIcon },
  { value: "office", label: "Office move plan", icon: FileIcon },
];

const layout = stylex.create({
  // Room kept for every branch open (taller rows on a touch screen), so opening one never moves
  // the rows above it: the stage centres what it holds.
  room: {
    display: "grid",
    alignContent: "start",
    minHeight: { default: 230, [media.pointerCoarse]: 314 },
  },
});

export default function TreeFiles() {
  return (
    <div {...stylex.props(layout.room)}>
      <TreeView
        aria-label="Files"
        items={files}
        defaultExpandedValue={["reports"]}
        defaultValue="reports/summary"
      />
    </div>
  );
}
