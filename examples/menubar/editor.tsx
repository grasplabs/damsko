"use client";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@grasp-os/ui/components/menubar";
import {
  CopyIcon,
  DownloadIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import { useState } from "react";

// A document editor's menus: actions with shortcuts, a destructive action, a submenu with one of
// its own, settings and a choice. The page holds the settings and the choice: a menu's items are
// taken out when it closes.
export default function MenubarEditor() {
  const [outline, setOutline] = useState(true);
  const [comments, setComments] = useState(false);
  const [width, setWidth] = useState<string | null>("normal");
  return (
    <Menubar aria-label="Editor">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem icon={PlusIcon}>
            New document
            <MenubarShortcut>mod+alt+n</MenubarShortcut>
          </MenubarItem>
          <MenubarItem icon={CopyIcon}>Duplicate</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger icon={DownloadIcon}>Export</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>As PDF</MenubarItem>
              <MenubarItem>As Markdown</MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger>As an image</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>PNG</MenubarItem>
                  <MenubarItem>SVG</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem icon={TrashIcon} variant="destructive">
            Move to trash
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            Undo
            <MenubarShortcut>mod+z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo
            <MenubarShortcut>mod+shift+z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem icon={LinkIcon}>Copy link to section</MenubarItem>
          <MenubarItem asChild>
            <a href="#shortcuts">Keyboard shortcuts</a>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={outline} onCheckedChange={setOutline}>
            Show outline
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={comments} onCheckedChange={setComments}>
            Show comments
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value={width} onValueChange={setWidth}>
            <MenubarLabel>Page width</MenubarLabel>
            <MenubarRadioItem value="narrow">Narrow</MenubarRadioItem>
            <MenubarRadioItem value="normal">Normal</MenubarRadioItem>
            <MenubarRadioItem value="full">Full width</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger disabled>Share</MenubarTrigger>
        <MenubarContent />
      </MenubarMenu>
    </Menubar>
  );
}
