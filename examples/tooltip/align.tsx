import { Button } from "@grasp-os/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import type { TooltipContentProps } from "@grasp-os/ui/components/tooltip";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// How a tooltip wider than its trigger lines up with it: with its start, its centre or its end.
// Start and end follow the reading direction.
const aligns: {
  label: string;
  align: NonNullable<TooltipContentProps["align"]>;
  words: string;
}[] = [
  {
    label: "Start",
    align: "start",
    words: "Lined up with the trigger's start",
  },
  {
    label: "Centre",
    align: "center",
    words: "Lined up with the trigger's centre",
  },
  { label: "End", align: "end", words: "Lined up with the trigger's end" },
];

const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space["3"],
  },
});

export default function TooltipAlign() {
  return (
    <div {...stylex.props(styles.row)}>
      {aligns.map(({ label, align, words }) => (
        <Tooltip key={align}>
          <TooltipTrigger asChild>
            <Button variant="outline">{label}</Button>
          </TooltipTrigger>
          <TooltipContent align={align}>{words}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
