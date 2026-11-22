import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { ChevronDownIcon, Icon } from "@grasp-os/ui/lib/icons";

// A chevron after the trigger's words says a menu opens there.
export default function DropdownMenuChevron() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Options
          <Icon icon={ChevronDownIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Pin to the top</DropdownMenuItem>
        <DropdownMenuItem>Mark as read</DropdownMenuItem>
        <DropdownMenuItem>Mute the thread</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
