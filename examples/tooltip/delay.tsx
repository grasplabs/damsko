import { Button } from "@grasp-os/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// The pointer rests for tooltip-delay before the first one opens; `delay` changes it. Keyboard
// focus never waits, and once one is open the next opens at once.
const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space["3"],
  },
});

export default function TooltipDelay() {
  return (
    <div {...stylex.props(styles.row)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Default delay</Button>
        </TooltipTrigger>
        <TooltipContent>Opened after the default delay</TooltipContent>
      </Tooltip>
      <Tooltip delay={0}>
        <TooltipTrigger asChild>
          <Button variant="outline">No delay</Button>
        </TooltipTrigger>
        <TooltipContent>Opened at once</TooltipContent>
      </Tooltip>
    </div>
  );
}
