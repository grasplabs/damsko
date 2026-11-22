import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@grasp-os/ui/components/navigation-menu";
import { LinkIcon } from "@grasp-os/ui/lib/icons";

// A row that opens only on a press, for a bar people move over often, like an app's header.
export default function NavigationMenuPress() {
  return (
    <NavigationMenu aria-label="Workspace" openOnHover={false}>
      <NavigationMenuList>
        <NavigationMenuItem value="Projects">
          <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#launch" description="Due in 3 weeks">
              Spring launch
            </NavigationMenuLink>
            <NavigationMenuLink href="#research" description="Ongoing">
              Customer research
            </NavigationMenuLink>
            <NavigationMenuLink href="#all" icon={LinkIcon}>
              All projects
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#calendar">Calendar</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="Archive">
          <NavigationMenuTrigger disabled>Archive</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#archive-2025">
              Projects from 2025
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
