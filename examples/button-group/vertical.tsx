import { Button } from "@grasp-os/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@grasp-os/ui/components/button-group";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: space[4],
  },
  said: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});

type Order = "newest" | "oldest" | "name";
const said: Record<Order, string> = {
  newest: "Sorted newest first",
  oldest: "Sorted oldest first",
  name: "Sorted by name",
};

// Stacked, every button as wide as the widest: a short column of ways to sort. The chosen one is
// pressed, and the line under them says which.
export default function ButtonGroupVertical() {
  const [order, setOrder] = useState<Order>("newest");
  const choose = (next: Order) => ({
    "aria-pressed": order === next,
    onClick: () => {
      setOrder(next);
    },
  });
  return (
    <div {...stylex.props(layout.column)}>
      <ButtonGroup aria-label="Sort projects" orientation="vertical">
        <Button variant="ghost" {...choose("newest")}>
          Newest first
        </Button>
        <Button variant="ghost" {...choose("oldest")}>
          Oldest first
        </Button>
        <ButtonGroupSeparator />
        <Button variant="ghost" {...choose("name")}>
          By name
        </Button>
      </ButtonGroup>
      <p {...stylex.props(layout.said)}>{said[order]}</p>
    </div>
  );
}
