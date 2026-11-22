import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
// The column a conversation stands in, shared by Bubble's examples.
import * as stylex from "@stylexjs/stylex";

export const layout = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space["8"],
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
  // Reactions overlap a Bubble's edge: the rows stand further apart to leave them room.
  spaced: { gap: space["12"] },
});
