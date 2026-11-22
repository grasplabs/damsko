import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import * as stylex from "@stylexjs/stylex";

// A tree's measure, as a sidebar's: rows no wider than they read, never stretched across a wide
// stage.
const layout = stylex.create({ measure: { width: "100%", maxWidth: "20rem" } });

const teams: TreeNode[] = [
  {
    value: "support",
    label: "Support",
    children: [
      { value: "support/amara", label: "Amara Okafor" },
      { value: "support/jonas", label: "Jonas Weber" },
    ],
  },
  {
    value: "operations",
    label: "Operations",
    children: [
      { value: "operations/lena", label: "Lena Ruiz" },
      { value: "operations/sam", label: "Sam Patel" },
    ],
  },
];

// Several people chosen: Shift with the arrows, or a press with Ctrl or Command.
export default function TreeMultiple() {
  return (
    <div {...stylex.props(layout.measure)}>
      <TreeView
        aria-label="People"
        selectionMode="multiple"
        items={teams}
        defaultExpandedValue={["support", "operations"]}
        defaultValue={["support/amara", "operations/sam"]}
      />
    </div>
  );
}
