"use client";

import { Button } from "@grasp-os/ui/components/button";
import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import {
  FileIcon,
  FolderIcon,
  Icon,
  PencilIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
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
  after: { justifySelf: "start" },
});

// Each row has its buttons at its end (`actions`): there while the row is pointed at or holds focus,
// one Tab from the row, and a press or a key on one leaves the row as it was. Delete takes the file
// out: focus goes to the row after it. The folder only opens (`selectable: false`), so the chosen
// item is always a file.
export default function TreeActions() {
  const [said, setSaid] = useState("Nothing yet");
  const [files, setFiles] = useState(["notes.md", "budget.xlsx", "plan.md"]);
  const rename = (name: string) => (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={`Rename ${name}`}
      onClick={() => {
        setSaid(`Renaming ${name}`);
      }}
    >
      <Icon icon={PencilIcon} />
    </Button>
  );
  const file = (name: string): TreeNode => ({
    value: `reports/${name}`,
    label: name,
    icon: FileIcon,
    actions: (
      <>
        {rename(name)}
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Delete ${name}`}
          onClick={() => {
            setFiles((all) => all.filter((each) => each !== name));
            setSaid(`Deleted ${name}`);
          }}
        >
          <Icon icon={TrashIcon} />
        </Button>
      </>
    ),
  });
  const items: TreeNode[] = [
    {
      value: "reports",
      label: "reports",
      icon: FolderIcon,
      selectable: false,
      badge: String(files.length),
      actions: rename("reports"),
      children: files.map(file),
    },
    { value: "readme.md", label: "readme.md", icon: FileIcon },
  ];
  return (
    <div {...stylex.props(layout.panel)}>
      <TreeView
        aria-label="Files"
        items={items}
        defaultValue="reports/notes.md"
        defaultExpandedValue={["reports"]}
      />
      <output {...stylex.props(layout.said)}>{said}</output>
      <Button
        variant="secondary"
        size="sm"
        style={layout.after}
        onClick={() => {
          setFiles(["notes.md", "budget.xlsx", "plan.md"]);
          setSaid("Every file is back");
        }}
      >
        Put back
      </Button>
    </div>
  );
}
