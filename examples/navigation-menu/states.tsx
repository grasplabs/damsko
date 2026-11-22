import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@grasp-os/ui/components/navigation-menu";

// One item of the row in one state: a group's trigger, or a link that stands in the row itself.
// The docs draw it once per state; hover and keyboard focus are forced from its own CSS, so a
// panel never opens here. The panel's links are shown open in the examples above.
export default function NavigationMenuState({
  kind = "group",
  active = false,
  disabled = false,
}: {
  kind?: "group" | "link";
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <NavigationMenu aria-label="Example">
      <NavigationMenuList>
        {kind === "link" ? (
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing" active={active}>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem value="Product">
            <NavigationMenuTrigger disabled={disabled}>
              Product
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink
                href="#reports"
                description="Every number your team tracks, on one page."
                active={active}
              >
                Reports
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
