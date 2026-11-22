import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
// The column a conversation stands in, shared by Marker's examples.
import * as stylex from "@stylexjs/stylex";

export const layout = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space["8"],
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
  rows: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
});
