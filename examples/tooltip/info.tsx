import { Button } from "@grasp-os/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import { Icon, InfoIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["1"],
    color: colors.foreground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
  },
});

// An info mark beside a setting's name: a press opens it too (`toggleable`), so a tap on a phone
// shows what a pointer's rest and keyboard focus show.
export default function TooltipInfo() {
  return (
    <div {...stylex.props(styles.row)}>
      Who can read it
      <Tooltip toggleable>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="More about who can read it"
          >
            <Icon icon={InfoIcon} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Everyone in the workspace who can open the project
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
