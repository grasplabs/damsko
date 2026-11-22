import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// The column a question stands in, as wide as a prompt input, and the quiet line that stands in
// its place once it is skipped.
export const layout = stylex.create({
  column: { width: "100%", maxWidth: size.promptInputWidth },
  skipped: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
  words: {
    margin: 0,
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});
