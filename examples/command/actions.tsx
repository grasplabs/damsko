"use client";

import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "@grasp-os/ui/components/command";
import type {
  CommandItems,
  CommandItemAction,
} from "@grasp-os/ui/components/command";
import {
  ArchiveIcon,
  CircleUserIcon,
  FileDocIcon,
  FolderIcon,
  LinkIcon,
  ShareIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const more: CommandItemAction[] = [
  { value: "copy", label: "Copy link", icon: LinkIcon },
  { value: "share", label: "Share", icon: ShareIcon },
  // An action may have no icon: its words still start on the others'.
  { value: "rename", label: "Rename" },
  {
    value: "archive",
    label: "Archive",
    icon: ArchiveIcon,
    variant: "destructive",
  },
];

const results: CommandItems = [
  {
    value: "spring-launch",
    label: "Spring launch",
    description: "Project · edited Tuesday",
    icon: FolderIcon,
    actions: more,
  },
  {
    value: "launch-brief",
    label: "Launch brief.docx",
    description: "Document in Spring launch",
    icon: FileDocIcon,
    actions: more,
  },
  {
    value: "anna",
    label: "Anna de Vries",
    description: "Person · Head of finance",
    icon: CircleUserIcon,
  },
];

const names: Record<string, string> = {
  "spring-launch": "Spring launch",
  "launch-brief": "Launch brief.docx",
  anna: "Anna de Vries",
};
const done: Record<string, string> = {
  copy: "Copied the link to",
  share: "Would share",
  rename: "Would rename",
  archive: "Would archive",
};

const layout = stylex.create({
  stack: { display: "grid", gap: space[3], width: "100%", maxWidth: 440 },
  said: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

// A result does one thing on Enter (opens it), and has more behind a quiet More at its end: shown on
// the highlighted or hovered row, always on a touch screen. The right arrow opens them from the
// keys; Left or Escape comes back to the results.
export default function CommandActions() {
  const [said, setSaid] = useState(
    "Enter opens a result; the right arrow shows its other actions."
  );
  return (
    <div {...stylex.props(layout.stack)}>
      <Command
        items={results}
        onAction={(value) => {
          setSaid(`Would open ${names[value] ?? value}`);
        }}
        onItemAction={(value, action) => {
          setSaid(`${done[action] ?? action} ${names[value] ?? value}`);
        }}
      >
        <CommandInput
          aria-label="Search the workspace"
          placeholder="Search projects, documents and people"
        />
        <CommandEmpty />
        <CommandList />
      </Command>
      <p role="status" {...stylex.props(layout.said)}>
        {said}
      </p>
    </div>
  );
}
