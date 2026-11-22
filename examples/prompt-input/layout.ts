import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// The column the examples stand a prompt input in, and the quiet line that says what was sent.
export const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["4"],
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
  item: { display: "grid", gap: space["2"], minWidth: 0 },
  name: {
    margin: 0,
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
  sent: {
    margin: 0,
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    overflowWrap: "anywhere",
  },
});
