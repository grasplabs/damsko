import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// The column the Tool's examples stand in: as wide as an answer.
export const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.6)`,
  },
});
