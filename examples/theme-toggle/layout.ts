import type { Theme } from "@grasp-os/ui/components/theme-toggle";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// The ground the Theme toggle's examples stand on. Each example holds the mode and the theme, as a
// product does, and writes them on its own subtree (`data-mode`, `data-theme`), so a stage shows the
// change without re-theming the docs around it.
import * as stylex from "@stylexjs/stylex";

/** The themes the picker examples offer: the stylesheet's three, named as a product names them. */
export const themes: Theme[] = [
  { id: "evergreen", name: "Evergreen", line: "Ink on paper" },
  { id: "pine", name: "Pine", line: "Night in the forest" },
  { id: "paper", name: "Paper", line: "Warm and quiet" },
];

export const layout = stylex.create({
  // The subtree that carries the mode and the theme: it draws nothing, its children lay out as if
  // it were not there, and still inherit its color-scheme and its theme's tokens.
  scope: { display: "contents" },
  // A subtree on its own ground: it paints its own theme's paper and words, whatever the page's mode.
  stand: {
    display: "inline-grid",
    placeItems: "center",
    padding: space["3"],
    backgroundColor: colors.background,
    color: colors.bodyForeground,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
  },
  ground: {
    display: "grid",
    gap: space["4"],
    width: "100%",
    maxWidth: 440,
    boxSizing: "border-box",
    padding: space["5"],
    backgroundColor: colors.background,
    color: colors.bodyForeground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
  },
  wide: { maxWidth: 640 },
  // On a narrow ground the toggle goes under the title rather than over it.
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
  },
  title: {
    margin: 0,
    fontFamily: font.serif,
    fontSize: font.headingSm,
    lineHeight: font.headingSmLine,
    fontWeight: font.weightNormal,
    color: colors.foreground,
  },
  pair: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    // On a touch screen each control's target reaches the middle of the gap to the next.
    "--tap-room-inline": `calc(${space["3"]} / 2)`,
  },
});
