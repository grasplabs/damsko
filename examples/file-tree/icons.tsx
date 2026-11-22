import { FileTree } from "@grasp-os/ui/components/file-tree";
import type { FileTreeNode } from "@grasp-os/ui/components/file-tree";
import { LockIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

// Each file wears an icon for its extension; one we do not know wears the plain file, and a file
// may bring its own (the locked one here).
const files: FileTreeNode[] = [
  {
    type: "folder",
    name: "report",
    path: "report",
    children: [
      { type: "file", name: "summary.pdf", path: "report/summary.pdf" },
      { type: "file", name: "notes.md", path: "report/notes.md" },
      { type: "file", name: "budget.xlsx", path: "report/budget.xlsx" },
      { type: "file", name: "cover.png", path: "report/cover.png" },
      { type: "file", name: "chart.ts", path: "report/chart.ts" },
      { type: "file", name: "archive.bin", path: "report/archive.bin" },
      {
        type: "file",
        name: "contract.pdf",
        path: "report/contract.pdf",
        icon: LockIcon,
      },
    ],
  },
];

const layout = stylex.create({
  width: { width: "100%", maxWidth: 320 },
});

export default function FileTreeIcons() {
  return (
    <FileTree items={files} defaultExpanded={["report"]} style={layout.width} />
  );
}
