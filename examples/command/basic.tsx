import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "@grasp-os/ui/components/command";
import type { CommandItems } from "@grasp-os/ui/components/command";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import {
  CopyIcon,
  DownloadIcon,
  LinkIcon,
  PlusIcon,
  SettingsIcon,
  UserPlusIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const commands: CommandItems = [
  {
    type: "group",
    label: "Project",
    items: [
      {
        value: "new",
        label: "New project",
        icon: PlusIcon,
        shortcut: "mod+alt+n",
      },
      {
        value: "invite",
        label: "Invite people",
        icon: UserPlusIcon,
        keywords: ["member", "share"],
      },
      { value: "duplicate", label: "Duplicate project", icon: CopyIcon },
    ],
  },
  { type: "separator" },
  {
    type: "group",
    label: "This page",
    items: [
      {
        value: "link",
        label: "Copy link",
        icon: LinkIcon,
        shortcut: "mod+alt+l",
        errorLabel: "Could not copy",
      },
      {
        value: "export",
        label: "Export as CSV",
        icon: DownloadIcon,
        disabled: true,
      },
      { value: "settings", label: "Open settings", icon: SettingsIcon },
    ],
  },
];

// What each command says once it has run. Copy link copies this page's address for real; the
// others stand in for work this page has not.
const said: Record<string, string> = {
  new: "Project created",
  invite: "The invite form would open here",
  duplicate: "Project duplicated",
  link: "Link copied",
  settings: "Settings would open here",
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const layout = stylex.create({
  command: { maxWidth: 400 },
});

// A command works for a moment (the spinner at its end), then a toast says what it did.
export default function CommandBasic() {
  const [toast] = useState(() => createToaster());
  const run = async (value: string) => {
    if (value === "link") {
      await navigator.clipboard.writeText(window.location.href);
    } else {
      await wait(600);
    }
    toast(
      said[value] ?? "Done",
      value === "link" ? { description: window.location.href } : undefined
    );
  };
  return (
    <>
      <Command items={commands} style={layout.command} onAction={run}>
        <CommandInput
          aria-label="Search actions"
          placeholder="Search actions"
        />
        <CommandEmpty />
        <CommandList />
      </Command>
      <Toaster toaster={toast} />
    </>
  );
}
