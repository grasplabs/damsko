"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@grasp-os/ui/components/command";
import type { CommandItems } from "@grasp-os/ui/components/command";
import { Input } from "@grasp-os/ui/components/input";
import {
  ArchiveIcon,
  FolderIcon,
  RefreshCwIcon,
  SettingsIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const places: CommandItems = [
  { value: "projects", label: "Projects", icon: FolderIcon },
  { value: "settings", label: "Settings", icon: SettingsIcon },
];

const actions: CommandItems = [
  { value: "sync", label: "Sync now", icon: RefreshCwIcon },
  { value: "archived", label: "Show archived", icon: ArchiveIcon },
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

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

// The palettes fixture: not shown on the page, driven by tests/command.spec.ts. Two palettes on one
// page. Go to has no button: `/` opens it, and waits while someone types in the note, so the slash
// goes in there. Actions has its button and mod+shift+p; Sync now takes a moment, and Show archived
// returns false, so the palette stays open.
export default function CommandPalettes() {
  const [said, setSaid] = useState("Nothing yet.");
  const sync = async (value: string) => {
    await wait(1000);
    setSaid(`Ran ${value}`);
  };
  return (
    <div {...stylex.props(layout.stack)}>
      <Input aria-label="Note" />
      <CommandDialog
        aria-label="Go to"
        trigger={null}
        shortcut="/"
        items={places}
        onAction={(value) => {
          setSaid(`Went to ${value}`);
        }}
      >
        <CommandInput />
        <CommandEmpty />
        <CommandList />
      </CommandDialog>
      <CommandDialog
        aria-label="Actions"
        trigger="Actions"
        shortcut="mod+shift+p"
        items={actions}
        onAction={(value) => {
          if (value === "archived") {
            setSaid("Showing archived");
            return false;
          }
          return sync(value);
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
