import { BAYER_MATRIX, DITHER_GEOMETRY } from "@grasp-os/ui/lib/utils";
// A hall's picture: the system's own ordered dither (lib/utils' 4×4 Bayer matrix, the one the
// chart's fills and Empty's skeletons are drawn with) in a deep, quiet pine and under a mask,
// drawn on the server. So a hall is there from the first paint, before its exhibit.
import * as stylex from "@stylexjs/stylex";

import { siteColors } from "../system/site-tokens.stylex";

/** How much of the dither is lit at rest, of its 16 levels. */
const LEVEL = 5;

const { pitch, square } = DITHER_GEOMETRY.pixels;
const tile = pitch * 4;

const s = stylex.create({
  still: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    maskImage: siteColors.hallDitherMask,
    pointerEvents: "none",
  },
  lit: { fill: siteColors.hallDitherLit },
  // Cells on whole pixels, never smoothed into each other.
  crisp: { shapeRendering: "crispEdges" },
});

export const HallStill = ({ id }: { id: string }) => (
  <svg aria-hidden="true" focusable="false" {...stylex.props(s.still)}>
    <defs>
      <pattern
        id={`${id}-dither`}
        width={tile}
        height={tile}
        patternUnits="userSpaceOnUse"
        {...stylex.props(s.crisp)}
      >
        {BAYER_MATRIX.flatMap((row, y) =>
          row.map((threshold, x) =>
            threshold < LEVEL ? (
              <rect
                key={`${x}-${y}`}
                x={x * pitch}
                y={y * pitch}
                width={square}
                height={square}
                {...stylex.props(s.lit)}
              />
            ) : null
          )
        )}
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id}-dither)`} />
  </svg>
);
