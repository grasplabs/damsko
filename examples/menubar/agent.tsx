import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@grasp-os/ui/components/menubar";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, used by tests/menubar.spec.ts. An agent bridge over
// one menubar, so the spec can prove an agent runs an action in a menu by the menu's name and the
// action's words.
pageAgent();

const ran = (value: string) => () => {
  document.body.dataset.ran = value;
};

export default function MenubarAgent() {
  return (
    <Menubar aria-label="Editor">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={ran("new")}>New document</MenubarItem>
          <MenubarItem onSelect={ran("export")}>Export as PDF</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={ran("redo")}>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
