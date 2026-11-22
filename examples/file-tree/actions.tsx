"use client";

import { Button } from "@grasp-os/ui/components/button";
import { FileTree, FileTreeActions } from "@grasp-os/ui/components/file-tree";
import type { FileTreeNode } from "@grasp-os/ui/components/file-tree";
import { DownloadIcon, Icon } from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  panel: { display: "grid", gap: space["4"], width: "100%", maxWidth: 320 },
  said: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

// The chosen file is the page's (`selectedPath` with `onSelect`), and each file has a download
// button at its row's end: pressing it downloads and leaves the chosen file as it was.
export default function FileTreeWithActions() {
  const [selected, setSelected] = useState("src/index.ts");
  const [said, setSaid] = useState("Showing src/index.ts");
  const file = (name: string, path: string): FileTreeNode => ({
    type: "file",
    name,
    path,
    actions: (
      <FileTreeActions>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Download ${name}`}
          onClick={() => {
            setSaid(`Downloaded ${path}`);
          }}
        >
          <Icon icon={DownloadIcon} />
        </Button>
      </FileTreeActions>
    ),
  });
  const files: FileTreeNode[] = [
    {
      type: "folder",
      name: "src",
      path: "src",
      children: [
        file("index.ts", "src/index.ts"),
        file("utils.ts", "src/utils.ts"),
      ],
    },
    file("package.json", "package.json"),
  ];
  return (
    <div {...stylex.props(layout.panel)}>
      <FileTree
        items={files}
        defaultExpanded={["src"]}
        selectedPath={selected}
        onSelect={(path) => {
          setSelected(path);
          setSaid(`Showing ${path}`);
        }}
      />
      <output {...stylex.props(layout.said)}>{said}</output>
    </div>
  );
}
