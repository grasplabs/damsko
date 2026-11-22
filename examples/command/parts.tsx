"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@grasp-os/ui/components/command";
import type { CommandItemAction } from "@grasp-os/ui/components/command";
import {
  ArchiveIcon,
  CopyIcon,
  FolderIcon,
  LinkIcon,
  PlusIcon,
  ShareIcon,
  UserPlusIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const more: CommandItemAction[] = [
  { value: "copy", label: "Copy link", icon: LinkIcon },
  { value: "share", label: "Share", icon: ShareIcon },
  {
    value: "archive",
    label: "Archive",
    icon: ArchiveIcon,
    variant: "destructive",
  },
];

const layout = stylex.create({
  stack: { display: "grid", gap: space[3], width: "100%", maxWidth: 400 },
  said: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

// The list written out by hand: groups, commands and a separator as parts, with what `items` can
// say (an icon, a failure's words, more actions, the open one) on each CommandItem, and its keys
// as a CommandShortcut. Duplicate project runs an onAction of its own, which fails at once.
export default function CommandParts() {
  const [said, setSaid] = useState(
    "Type to narrow the list; Enter runs a command."
  );
  return (
    <div {...stylex.props(layout.stack)}>
      <Command
        onAction={(value) => {
          // Duplicate runs its own onAction, which fails.
          if (value !== "duplicate") {
            setSaid(`Ran ${value}`);
          }
        }}
        onItemAction={(value, action) => {
          setSaid(`${action} on ${value}`);
        }}
      >
        <CommandInput
          aria-label="Search actions"
          placeholder="Search actions"
        />
        <CommandEmpty>Nothing by that name</CommandEmpty>
        <CommandList>
          <CommandGroup heading="Project">
            <CommandItem value="new" icon={PlusIcon}>
              New project
              <CommandShortcut>mod+alt+n</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="invite"
              icon={UserPlusIcon}
              keywords={["member"]}
            >
              Invite people
            </CommandItem>
            <CommandItem
              value="duplicate"
              icon={CopyIcon}
              errorLabel="Could not duplicate"
              onAction={() => {
                throw new Error("offline");
              }}
            >
              Duplicate project
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Projects">
            <CommandItem
              value="spring"
              icon={FolderIcon}
              description="Edited Tuesday"
              actions={more}
              current
            >
              Spring launch
            </CommandItem>
            <CommandItem
              value="autumn"
              icon={FolderIcon}
              description="Edited in March"
              actions={more}
            >
              Autumn review
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <p aria-live="polite" {...stylex.props(layout.said)}>
        {said}
      </p>
    </div>
  );
}
