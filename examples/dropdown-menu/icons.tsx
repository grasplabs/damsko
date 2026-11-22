import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  ArchiveIcon,
  CopyIcon,
  DownloadIcon,
  LinkIcon,
  PencilIcon,
} from "@grasp-os/ui/lib/icons";

export default function DropdownMenuIcons() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={PencilIcon}>
          Rename <DropdownMenuShortcut>mod+r</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem icon={CopyIcon}>
          Duplicate <DropdownMenuShortcut>mod+d</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem icon={LinkIcon}>
          Copy link <DropdownMenuShortcut>mod+shift+c</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem icon={DownloadIcon}>
          Download <DropdownMenuShortcut>mod+s</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={ArchiveIcon}>Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
