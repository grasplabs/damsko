import { Button } from "@grasp-os/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import { Icon, InfoIcon } from "@grasp-os/ui/lib/icons";

// A popover that only explains: it holds no control, so `initialFocus="none"` keeps focus on its
// trigger as it opens (no ring frames the panel), and Escape or a press outside closes it.
export default function PopoverExplains() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Icon icon={InfoIcon} />
          Roles
        </Button>
      </PopoverTrigger>
      <PopoverContent initialFocus="none">
        <PopoverHeader>
          <PopoverTitle>Roles</PopoverTitle>
          <PopoverDescription>
            Admins manage people and permissions. Builders build apps and
            workflows. Users use what is shared with them.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
