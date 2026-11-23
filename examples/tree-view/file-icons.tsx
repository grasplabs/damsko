import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import {
  CodeIcon,
  FileDocIcon,
  FileIcon,
  FilePdfIcon,
  FolderIcon,
  ImageIcon,
  SheetIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { ownValue } from "@grasp-os/ui/lib/utils";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: { width: "100%", maxWidth: 320 },
});

// The icon per kind of file is the product's: a table from the extension, read as an own key only,
// since a file's name is data (`a.constructor` finds nothing), and the plain file for the rest.
const byExtension: Record<string, IconData> = {
  md: FileDocIcon,
  pdf: FilePdfIcon,
  png: ImageIcon,
  ts: CodeIcon,
  xlsx: SheetIcon,
};

const iconOf = (name: string): IconData =>
  ownValue(byExtension, name.slice(name.lastIndexOf(".") + 1).toLowerCase()) ??
  FileIcon;

const file = (name: string): TreeNode => ({
  value: `report/${name}`,
  label: name,
  icon: iconOf(name),
});

const items: TreeNode[] = [
  {
    value: "report",
    label: "report",
    icon: FolderIcon,
    selectable: false,
    children: [
      file("summary.pdf"),
      file("notes.md"),
      file("budget.xlsx"),
      file("cover.png"),
      file("chart.ts"),
      file("archive.bin"),
    ],
  },
];

export default function TreeFileIcons() {
  return (
    <div {...stylex.props(layout.frame)}>
      <TreeView
        aria-label="Report"
        items={items}
        defaultExpandedValue={["report"]}
      />
    </div>
  );
}
