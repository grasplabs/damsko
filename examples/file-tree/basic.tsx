import { FileTree } from "@grasp-os/ui/components/file-tree";
import type { FileTreeNode } from "@grasp-os/ui/components/file-tree";
import { media } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const files: FileTreeNode[] = [
  {
    type: "folder",
    name: "app",
    path: "app",
    children: [
      { type: "file", name: "layout.tsx", path: "app/layout.tsx" },
      { type: "file", name: "page.tsx", path: "app/page.tsx" },
    ],
  },
  {
    type: "folder",
    name: "components",
    path: "components",
    children: [
      {
        type: "folder",
        name: "ui",
        path: "components/ui",
        children: [
          {
            type: "file",
            name: "button.tsx",
            path: "components/ui/button.tsx",
          },
        ],
      },
      {
        type: "file",
        name: "login-form.tsx",
        path: "components/login-form.tsx",
      },
    ],
  },
  { type: "file", name: "README.md", path: "README.md" },
];

const layout = stylex.create({
  // As wide as a side panel, and room kept for every folder open (taller rows on a touch screen),
  // so opening one never moves the rows above it.
  room: {
    display: "grid",
    alignContent: "start",
    width: "100%",
    maxWidth: 320,
    minHeight: { default: 260, [media.pointerCoarse]: 350 },
  },
});

// The files an assistant changed, every folder open and one file chosen. A press on a folder opens
// or closes it; a press, Enter or Space on a file chooses it.
export default function FileTreeBasic() {
  return (
    <div {...stylex.props(layout.room)}>
      <FileTree
        items={files}
        defaultExpanded={["app", "components", "components/ui"]}
        defaultSelectedPath="components/ui/button.tsx"
      />
    </div>
  );
}
