import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { ChevronDownIcon, Icon } from "@grasp-os/ui/lib/icons";

// One menu's trigger in one state. The docs draw it once per state; hover, keyboard focus and
// pressed are forced from the trigger's own CSS, which is a Button's.
export default function DropdownMenuState({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" disabled={disabled}>
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
