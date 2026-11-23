import { Button } from "@grasp-os/ui/components-tw/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import { Text } from "@grasp-os/ui/components/text";
import { Icon, ShareIcon } from "@grasp-os/ui/lib-tw/icons";
import { useId } from "react";

// Out of use, and saying why: the button keeps its place and its focus, and the sentence beside it
// is its description, so a screen reader hears the reason when it reaches the button. It opens a
// popover once it can be pressed; until then a press opens nothing.
export default function ButtonDisabledWhy() {
  const why = useId();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled
            focusableWhenDisabled
            aria-describedby={why}
          >
            <Icon icon={ShareIcon} />
            Share
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Share the report</PopoverTitle>
        </PopoverContent>
      </Popover>
      <Text id={why} size="sm" color="muted">
        Only the report's owner can share it. Ask Amara for access.
      </Text>
    </div>
  );
}
