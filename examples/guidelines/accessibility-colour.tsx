"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: {
    display: "grid",
    gap: space["6"],
    width: "100%",
    maxWidth: 640,
    minWidth: 0,
  },
  row: { display: "flex", flexWrap: "wrap", gap: space["2"] },
});

// Colour helps and words carry it: each status says itself.
export default function AccessibilityColour() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.row)}>
        <Badge variant="success">Ready</Badge>
        <Badge variant="warning">Needs review</Badge>
        <Badge variant="destructive">Blocked</Badge>
        <Badge variant="info">Shared</Badge>
      </div>
    </div>
  );
}
