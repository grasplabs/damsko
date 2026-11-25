"use client";

import { Button } from "@grasp-os/ui/components/button";
import { colors, radius, shadow, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  // On a raised card, as a dialog's foot stands.
  card: {
    display: "grid",
    gap: space["4"],
    padding: space["6"],
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    boxShadow: shadow.sm,
  },
  row: { display: "flex", alignItems: "center", gap: space["2"] },
});

const sizes = ["xs", "sm", "default", "lg"] as const;

// Cancel, a main step, Delete and Approve side by side at each size: one size reads as one height,
// whatever its fill.
export default function ButtonHeights() {
  return (
    <div {...stylex.props(layout.card)}>
      {sizes.map((size) => (
        <div key={size} {...stylex.props(layout.row)}>
          <Button size={size} variant="outline">
            Cancel
          </Button>
          <Button size={size} variant="default">
            Connect
          </Button>
          <Button size={size} variant="destructive">
            Delete
          </Button>
          <Button size={size} variant="success">
            Approve
          </Button>
        </div>
      ))}
    </div>
  );
}
