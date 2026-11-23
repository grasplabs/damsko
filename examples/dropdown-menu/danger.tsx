import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  CopyIcon,
  EllipsisIcon,
  Icon,
  PencilIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";

// A stand-in for the real request: it takes a moment, so the item shows that it is working.
const remove = () => new Promise((resolve) => setTimeout(resolve, 1200));

export default function DropdownMenuDanger() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Actions for Q3 report">
          <Icon icon={EllipsisIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem icon={PencilIcon}>Rename</DropdownMenuItem>
        <DropdownMenuItem icon={CopyIcon}>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={TrashIcon}
          variant="destructive"
          onSelect={remove}
          errorText="Could not move it"
        >
          Move to trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
