import { TreeView } from "@grasp-os/ui/components/tree-view";
import { FileIcon, FolderIcon } from "@grasp-os/ui/lib/icons";

// One row of a tree in one state. The docs draw it once per state; hover and keyboard focus are
// forced from the tree's own CSS.
export default function TreeState({
  branch = false,
  open = false,
  chosen = false,
  current = false,
  disabled = false,
}: {
  branch?: boolean;
  open?: boolean;
  chosen?: boolean;
  current?: boolean;
  disabled?: boolean;
}) {
  const node = branch
    ? {
        value: "reports",
        label: "Reports",
        icon: FolderIcon,
        disabled,
        children: [],
      }
    : {
        value: "summary",
        label: "Quarterly summary",
        icon: FileIcon,
        disabled,
      };
  return (
    <TreeView
      aria-label="Files"
      items={[node]}
      selectionMode={current ? "none" : "single"}
      defaultValue={chosen ? node.value : null}
      current={current ? node.value : null}
      defaultExpandedValue={open ? [node.value] : []}
    />
  );
}
