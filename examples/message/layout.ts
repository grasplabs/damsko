import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
// The column a conversation stands in, shared by Message's examples.
import * as stylex from "@stylexjs/stylex";

export const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["6"],
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
});
