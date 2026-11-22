import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import { FileIcon, FolderIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

// A tree's measure, as a sidebar's: rows no wider than they read, never stretched across a wide
// stage.
const layout = stylex.create({ measure: { width: "100%", maxWidth: "20rem" } });

// Folders whose files load the first time they open. A stand-in for the real request.
const folders: TreeNode[] = [
  { value: "2026", label: "2026", icon: FolderIcon, children: [] },
  { value: "2025", label: "2025", icon: FolderIcon, children: [] },
];

const load = (value: string) =>
  new Promise<TreeNode[]>((resolve) =>
    setTimeout(() => {
      resolve(
        ["January", "February", "March"].map((month) => ({
          value: `${value}/${month}`,
          label: `${month} ${value}`,
          icon: FileIcon,
        }))
      );
    }, 900)
  );

export default function TreeLazy() {
  return (
    <div {...stylex.props(layout.measure)}>
      <TreeView aria-label="Archive" items={folders} loadChildren={load} />
    </div>
  );
}
