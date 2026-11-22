import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
// The column a conversation stands in, shared by Checkpoint's examples.
import * as stylex from "@stylexjs/stylex";

export const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["6"],
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
  // A one-line answer, at the size and line an answer's Markdown takes.
  answer: {
    margin: 0,
    fontSize: size.messageText,
    lineHeight: size.messageTextLine,
  },
  continue: {
    justifySelf: "start",
  },
});
