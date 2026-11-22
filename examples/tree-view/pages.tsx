import * as stylex from "@stylexjs/stylex";

("use client");

import { TreeView } from "@grasp-os/ui/components/tree-view";
import type { TreeNode } from "@grasp-os/ui/components/tree-view";
import { useState } from "react";

// A tree's measure, as a sidebar's: rows no wider than they read, never stretched across a wide
// stage.
const layout = stylex.create({ measure: { width: "100%", maxWidth: "20rem" } });

const pages: TreeNode[] = [
  { value: "/start", label: "Getting started" },
  {
    value: "/guides",
    label: "Guides",
    children: [
      { value: "/guides/sharing", label: "Sharing a report" },
      { value: "/guides/reminders", label: "Setting reminders" },
    ],
  },
  { value: "/help", label: "Help" },
];

// A tree of pages: the open page is marked and its branch opens. Choosing is off; Enter goes.
// Pressing a page makes it the current one, as following its link would.
export default function TreePages() {
  const [current, setCurrent] = useState("/guides/reminders");
  return (
    <div {...stylex.props(layout.measure)}>
      <TreeView
        aria-label="Pages"
        selectionMode="none"
        items={pages}
        current={current}
        onAction={(value: string) => {
          setCurrent(value);
        }}
      />
    </div>
  );
}
