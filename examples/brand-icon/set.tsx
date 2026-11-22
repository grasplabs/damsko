import { BrandIcon } from "@grasp-os/ui/components/brand-icon";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { logos } from "./logos";
import type { Brand } from "./logos";

const layout = stylex.create({
  grid: {
    display: "grid",
    // Wide enough for the longest key beside its tile ("google-sheets"), so none is cut.
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 9rem), 1fr))",
    gap: space["4"],
    width: "100%",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  cell: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    minWidth: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  // A key is one word to the eye: "google-docs" never breaks at its hyphen, so every cell is one
  // line and the rows space evenly. Should a cell ever be narrower, it ends in an ellipsis.
  name: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

// Every mark these examples carry, by its key in their logos.
export default function BrandIconsSet() {
  return (
    <ul {...stylex.props(layout.grid)}>
      {(Object.keys(logos) as Brand[]).map((brand) => (
        <li key={brand} {...stylex.props(layout.cell)}>
          <BrandIcon {...logos[brand]} decorative />
          <span {...stylex.props(layout.name)}>{brand}</span>
        </li>
      ))}
    </ul>
  );
}
