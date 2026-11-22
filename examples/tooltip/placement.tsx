import { Button } from "@grasp-os/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import type { TooltipContentProps } from "@grasp-os/ui/components/tooltip";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// Where it opens: above by default, or on the side `side` names. Start and end follow the reading
// direction. It still flips and shifts to stay inside the window.
// In the row, Start stands first and End last, so each side's tooltip opens into free room and
// never over a neighbour.
const sides: {
  label: string;
  side: NonNullable<TooltipContentProps["side"]>;
}[] = [
  { label: "Start", side: "start" },
  { label: "Top", side: "top" },
  { label: "Bottom", side: "bottom" },
  { label: "End", side: "end" },
];

const styles = stylex.create({
  // A row where there is room at its two ends for the side tooltips; on a phone a column, with
  // room between the buttons for the ones that open above and below.
  row: {
    display: "flex",
    flexDirection: { default: "row", "@media (max-width: 40rem)": "column" },
    alignItems: "center",
    justifyContent: "center",
    gap: { default: space["3"], "@media (max-width: 40rem)": space["12"] },
  },
});

export default function TooltipPlacement() {
  return (
    <div {...stylex.props(styles.row)}>
      {sides.map(({ label, side }) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline">{label}</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>
            Opens on the {label.toLowerCase()} side
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
