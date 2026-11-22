// The ground's first picture, before the living ground (ground.tsx) has drawn: the system's own
// ordered dither (lib/utils' 4×4 Bayer matrix, the one the chart's fills are drawn with) at one
// middle level, in the ground's tone and under its mask, drawn on the server. The page opens on it
// rather than on bare paper; the living picture fades in over it (showcase.css), and with reduced
// motion it is the ground for good.
import { BAYER_MATRIX, DITHER_GEOMETRY } from "@grasp-os/ui/lib/utils";
import * as stylex from "@stylexjs/stylex";

import { siteColors } from "../../system/site-tokens.stylex";

/** How much of the dither is lit at rest, of its 16 levels. */
const LEVEL = 5;

const { pitch, square } = DITHER_GEOMETRY.pixels;
const tile = pitch * 4;

const s = stylex.create({
  lit: { fill: siteColors.showcaseGroundLit },
  // Cells on whole pixels, never smoothed into each other.
  crisp: { shapeRendering: "crispEdges" },
});

export const GroundStill = () => (
  <svg
    className="sc-ground-still"
    aria-hidden="true"
    focusable="false"
    width="100%"
    height="100%"
  >
    <defs>
      <pattern
        id="sc-ground-dither"
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
    <rect width="100%" height="100%" fill="url(#sc-ground-dither)" />
  </svg>
);
