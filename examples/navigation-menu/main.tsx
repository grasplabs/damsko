import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@grasp-os/ui/components/navigation-menu";
import { InboxIcon, InfoIcon, MessageCircleIcon } from "@grasp-os/ui/lib/icons";

// A product site's main row: two groups, a link straight in the row, and the page you are on.
export default function NavigationMenuMain() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="Product">
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink
              href="#reports"
              description="Every number your team tracks, on one page."
            >
              Reports
            </NavigationMenuLink>
            <NavigationMenuLink
              href="#forecasts"
              description="What next quarter looks like, from this one."
            >
              Forecasts
            </NavigationMenuLink>
            <NavigationMenuLink
              href="#alerts"
              description="A message when a number moves past a line."
            >
              Alerts
            </NavigationMenuLink>
            <NavigationMenuLink
              href="#sharing"
              description="Send a view to anyone, with or without an account."
              active
            >
              Sharing
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="Resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#guides" icon={InfoIcon}>
              Guides
            </NavigationMenuLink>
            <NavigationMenuLink href="#community" icon={MessageCircleIcon}>
              Community
            </NavigationMenuLink>
            <NavigationMenuLink href="#changelog" icon={InboxIcon}>
              Changelog
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#status">Status</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
