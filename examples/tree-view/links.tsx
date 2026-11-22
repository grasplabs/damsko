"use client";

import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import {
  FileIcon,
  FolderIcon,
  Icon,
  PencilOffIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { AnchorHTMLAttributes } from "react";

const layout = stylex.create({
  frame: { width: "100%", maxWidth: 320, minHeight: 300 },
});

// A nav of notes: each row a router's link (here a stand-in that moves without loading the page),
// the open one `current`; a folder's count and a note's read-only mark at the row's end. The keys and
// type-ahead stay the tree's; Enter, a press, a middle click and "open in a new tab" follow the link.
export default function TreeLinks() {
  const [open, setOpen] = useState("notes/pricing");
  const RouterLink = ({
    to,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a
      {...rest}
      href={`#${to}`}
      onClick={(event) => {
        event.preventDefault();
        setOpen(to);
      }}
    />
  );
  const note = (value: string, label: string, readOnly = false): TreeNode => ({
    value,
    label,
    icon: FileIcon,
    render: <RouterLink to={value} />,
    badge: readOnly ? (
      <Icon icon={PencilOffIcon} label="Read only" />
    ) : undefined,
  });
  const items: TreeNode[] = [
    {
      value: "notes",
      label: "Notes",
      icon: FolderIcon,
      badge: "3",
      children: [
        note("notes/pricing", "Pricing for next year"),
        note("notes/suppliers", "Supplier terms", true),
        note("notes/launch", "Spring launch"),
      ],
    },
    {
      value: "sources",
      label: "Sources",
      icon: FolderIcon,
      badge: "12",
      children: [note("sources/survey", "Team survey results")],
    },
  ];
  return (
    <div {...stylex.props(layout.frame)}>
      <TreeView
        aria-label="Knowledge"
        items={items}
        selectionMode="none"
        current={open}
        defaultExpandedValue={["notes"]}
      />
    </div>
  );
}
