import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// A citation's number in an answer's sentence, as the original design drew it, shared by every
// example that cites by number (Sources' open list, the Citations and Chat page patterns): a small
// box on the soft fill with the system's edge, its number in the quiet ink. Inline citation's chip
// names a source's host instead, so it is not this.
import * as stylex from "@stylexjs/stylex";

export const citeStyles = stylex.create({
  number: {
    paddingBlock: 1,
    paddingInline: space["1"],
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    color: colors.mutedForeground,
    backgroundColor: colors.muted,
    boxShadow: size.borderStrong,
    // Its edge is a shadow, which forced colours drop: a real one there.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
  },
  // Set straight after its claim's last word, a step from it.
  after: { marginInlineStart: space["1"] },
  // A number that goes to its source's row: it answers the pointer, and holds a finger's target.
  link: {
    position: "relative",
    textDecorationLine: "none",
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [media.hover]: colors.foreground },
    },
    backgroundColor: {
      default: colors.muted,
      ":hover": { default: null, [media.hover]: colors.accentHighlight },
    },
    transitionProperty: "background-color, color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  // Lit with its row: the highlight fill and the ink, while the pointer or focus is on either end.
  lit: {
    color: {
      default: colors.foreground,
      [media.forcedColors]: "HighlightText",
    },
    backgroundColor: {
      default: colors.accentHighlight,
      [media.forcedColors]: "Highlight",
    },
  },
});
