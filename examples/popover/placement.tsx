import { Button } from "@grasp-os/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import type { PopoverContentProps } from "@grasp-os/ui/components/popover";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// Where it opens: below by default, or on the side `side` names; lined up with the trigger's
// centre, start or end by `align`. Start and end follow the reading direction. It still flips and
// shifts to stay inside the window.
const places: {
  label: string;
  side?: PopoverContentProps["side"];
  align?: PopoverContentProps["align"];
  words: string;
}[] = [
  { label: "Below", words: "Below its trigger, lined up with its centre." },
  {
    label: "Above",
    side: "top",
    words: "Above its trigger, lined up with its centre.",
  },
  {
    label: "Start",
    align: "start",
    words: "Below its trigger, lined up with its start.",
  },
  {
    label: "End",
    align: "end",
    words: "Below its trigger, lined up with its end.",
  },
];

const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space["3"],
  },
});

export default function PopoverPlacement() {
  return (
    <div {...stylex.props(styles.row)}>
      {places.map((place) => (
        <Popover key={place.label}>
          <PopoverTrigger asChild>
            <Button variant="outline">{place.label}</Button>
          </PopoverTrigger>
          <PopoverContent side={place.side} align={place.align}>
            <PopoverHeader>
              <PopoverTitle>{place.label}</PopoverTitle>
              <PopoverDescription>{place.words}</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
