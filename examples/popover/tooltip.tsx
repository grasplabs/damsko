import { Button } from "@grasp-os/ui/components/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import { Icon, ShareIcon } from "@grasp-os/ui/lib/icons";

// An icon-only trigger in a toolbar: a Tooltip round the popover's trigger says what the popover is
// for, and stays away while the popover is open.
export default function PopoverTooltip() {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Share">
              <Icon icon={ShareIcon} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Share this report</TooltipContent>
      </Tooltip>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Share this report</PopoverTitle>
          <PopoverDescription>
            Everyone with the link can read it. You can stop sharing at any
            time.
          </PopoverDescription>
        </PopoverHeader>
        <PopoverFooter>
          <PopoverClose asChild>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button size="sm" variant="default">
              Copy link
            </Button>
          </PopoverClose>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
