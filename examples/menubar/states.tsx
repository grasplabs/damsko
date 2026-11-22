import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@grasp-os/ui/components/menubar";

// A bar of one menu in one state. The docs draw it once per state; hover and keyboard focus are
// forced from the trigger's own CSS. Its menus' items are drawn as Context menu's.
export default function MenubarState({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  return (
    <Menubar aria-label="Editor">
      <MenubarMenu>
        <MenubarTrigger disabled={disabled}>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New document</MenubarItem>
          <MenubarItem>Duplicate</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
