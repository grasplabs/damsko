import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
// What the Writing guideline's examples share (examples/guidelines/writing-*.tsx): a row of
// specimens, a column of them, and the quiet line under a control that says what a screen reader
// hears. Not an example itself: a .ts file, so the docs draw nothing from it.
import * as stylex from "@stylexjs/stylex";

export const writing = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
    minWidth: 0,
  },
  // One track as wide as the side, never as its content: a player's own width would otherwise make
  // the track wider than its half of the pair.
  column: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: space["4"],
    width: "100%",
    minWidth: 0,
  },
  // What a screen reader hears, written beside the control it names.
  heard: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  named: {
    display: "grid",
    justifyItems: "start",
    gap: space["1"],
    minWidth: 0,
  },
  // A control that fills its column (a player), with what is heard under it.
  namedWide: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: space["1"],
    width: "100%",
    minWidth: 0,
  },
});
