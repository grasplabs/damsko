import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import type { DropdownMenuContentProps } from "@grasp-os/ui/components/dropdown-menu";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// Where it opens: below by default, or on the side `side` names; lined up with the trigger's
// centre, start or end by `align`. Start and end follow the reading direction. It still flips and
// shifts to stay inside the window.
const places: {
  label: string;
  side?: DropdownMenuContentProps["side"];
  align?: DropdownMenuContentProps["align"];
}[] = [
  { label: "Below" },
  { label: "Above", side: "top" },
  { label: "Start", align: "start" },
  { label: "End", align: "end" },
];

const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space[3],
  },
});

export default function DropdownMenuPlacement() {
  return (
    <div {...stylex.props(styles.row)}>
      {places.map((place) => (
        <DropdownMenu key={place.label}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{place.label}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={place.side} align={place.align}>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
}
