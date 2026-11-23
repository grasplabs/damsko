import { Button } from "@grasp-os/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@grasp-os/ui/components/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { ChevronDownIcon, Icon } from "@grasp-os/ui/lib/icons";
import { useState } from "react";

// Stand-in for a real request: a moment's work that succeeds.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const merge = () => wait(900);

// A split button: the usual action, a hairline, and a menu of its other ways. The menu's trigger
// is a ghost Button in the group, so it looks like the group's own.
export default function ButtonGroupSplit() {
  const [toast] = useState(() => createToaster());
  const merging = merge;
  const way = (said: string) => async () => {
    await merge();
    toast(said);
  };
  return (
    <>
      <ButtonGroup aria-label="Merge">
        <Button
          variant="ghost"
          onClick={merging}
          successText="Merged"
          errorText="Not merged"
        >
          Merge changes
        </Button>
        <ButtonGroupSeparator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More ways to merge">
              <Icon icon={ChevronDownIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={way("Squashed and merged")}
              errorText="Not merged"
            >
              Squash and merge
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={way("Rebased and merged")}
              errorText="Not merged"
            >
              Rebase and merge
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <Toaster toaster={toast} />
    </>
  );
}
