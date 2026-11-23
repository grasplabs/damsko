import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import {
  FileIcon,
  FolderIcon,
  Icon,
  ShieldAlertIcon,
} from "@grasp-os/ui/lib/icons";
import { colors } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: { width: "100%", maxWidth: 320 },
  // The tone is the host's: `badge` is a node, so a span round the mark gives it the warning colour.
  warning: { display: "inline-flex", color: colors.warning },
});

// A row's badge is any node. A count stands as it is, in the row's muted tone; a mark that asks for
// a look is wrapped in a span that gives it the warning colour. That is the intended way.
export default function TreeEnd() {
  const items: TreeNode[] = [
    {
      value: "contracts",
      label: "Contracts",
      icon: FolderIcon,
      badge: "4",
      children: [
        {
          value: "contracts/suppliers",
          label: "Supplier terms",
          icon: FileIcon,
          badge: (
            <span {...stylex.props(layout.warning)}>
              <Icon icon={ShieldAlertIcon} label="Sensitive" />
            </span>
          ),
        },
        { value: "contracts/office", label: "Office lease", icon: FileIcon },
      ],
    },
  ];
  return (
    <div {...stylex.props(layout.frame)}>
      <TreeView
        aria-label="Contracts"
        items={items}
        selectionMode="none"
        defaultExpandedValue={["contracts"]}
      />
    </div>
  );
}
