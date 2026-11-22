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

// A document editor's menus: actions with shortcuts, a destructive action, a submenu, settings and
// a choice.
export default function MenubarEditor() {
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
          <MenubarCheckboxItem defaultChecked>Show outline</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show comments</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup defaultValue="normal">
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
