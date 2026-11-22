import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { ChevronDownIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  head: { display: "flex", width: "14rem", minWidth: 0 },
  // The trigger may shrink to the head, and its words end in an ellipsis on one line.
  trigger: { minWidth: 0 },
  words: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

export default function DropdownMenuTruncate() {
  const name = "Notes from the quarterly planning meeting with the whole team";
  return (
    <div {...stylex.props(styles.head)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label={name}
            style={styles.trigger}
          >
            <span {...stylex.props(styles.words)}>{name}</span>
            <Icon icon={ChevronDownIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
