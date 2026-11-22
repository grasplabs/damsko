"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@grasp-os/ui/components/command";
import type { CommandItems } from "@grasp-os/ui/components/command";
import {
  FolderIcon,
  PlusIcon,
  SettingsIcon,
  UserPlusIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const commands: CommandItems = [
  {
    type: "group",
    label: "Go to",
    items: [
      { value: "projects", label: "Projects", icon: FolderIcon },
      { value: "settings", label: "Settings", icon: SettingsIcon },
    ],
  },
  {
    type: "group",
    label: "Create",
    items: [
      { value: "new", label: "New project", icon: PlusIcon },
      { value: "invite", label: "Invite people", icon: UserPlusIcon },
    ],
  },
];

const layout = stylex.create({
  stack: { display: "grid", gap: space[3], justifyItems: "start" },
  said: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

// A palette over the page: its button, or its shortcut from anywhere. Its own is mod+k; this page's
// search already takes that, so here it is mod+shift+p (⌘⇧P on a Mac, Ctrl+Shift+P elsewhere). A
// command run closes it, and focus goes back to the button.
export default function CommandDialogExample() {
  const [said, setSaid] = useState("Press the button, or its shortcut.");
  return (
    <div {...stylex.props(layout.stack)}>
      <CommandDialog
        aria-label="Search actions"
        shortcut="mod+shift+p"
        items={commands}
        onAction={(value) => {
          setSaid(`Ran ${value}`);
        }}
      >
        <CommandInput />
        <CommandEmpty />
        <CommandList />
      </CommandDialog>
      <p aria-live="polite" {...stylex.props(layout.said)}>
        {said}
      </p>
    </div>
  );
}
