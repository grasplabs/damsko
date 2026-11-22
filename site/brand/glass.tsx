import { colors, media } from "@grasp-os/ui/lib/tokens.stylex";
// The fluted glass, after the website's hero, as a site part: six rows of the light seen through reeded glass, each pane reaching
// in from the edge by its own share, the reeds rolling inward at each row's own pace. An ambient
// scene: slow, quiet, and still under reduced motion. Every colour is a token (the light's seven
// stops); the reeds are the site's `flutes`.
import * as stylex from "@stylexjs/stylex";

import { siteColors, siteSize } from "../system/site-tokens.stylex";

/** How far each row's light reaches in from the left and the right (% of the width), and how long
 * its reeds take to roll one band (s). The website's own rows: the middle rows least, so what
 * stands in the middle stays on the night. */
const rows = [
  { left: 30, right: 34, time: 4.6 },
  { left: 24, right: 28, time: 5.8 },
  { left: 15, right: 13, time: 5.1 },
  { left: 12, right: 16, time: 6.4 },
  { left: 26, right: 23, time: 4.9 },
  { left: 33, right: 29, time: 5.5 },
];

const rollIn = stylex.keyframes({
  from: { transform: "translateX(0)" },
  to: { transform: "translateX(96px)" },
});
const rollInRight = stylex.keyframes({
  from: { transform: "translateX(0)" },
  to: { transform: "translateX(-96px)" },
});

const light = `${colors.brandPaper} 0%, ${colors.brandLime} 26%, ${colors.brandSea} 40%, ${colors.brandMint} 52%, ${colors.brandPine} 69%, ${colors.brandInk} 85%, ${colors.brandNight} 100%`;

const s = stylex.create({
  glass: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    display: "grid",
    gridTemplateRows: "repeat(6, 1fr)",
    backgroundColor: colors.brandNight,
  },
  row: { position: "relative", overflow: "hidden" },
  pane: {
    position: "absolute",
    insetBlock: 0,
    overflow: "clip",
  },
  reach: (share: number) => ({ width: `calc(${share}% + 3vw)` }),
  left: {
    insetInlineStart: "-3vw",
    backgroundImage: `linear-gradient(90deg in oklch, ${light})`,
  },
  right: {
    insetInlineEnd: "-3vw",
    backgroundImage: `linear-gradient(270deg in oklch, ${light})`,
  },
  reeds: {
    position: "absolute",
    insetBlock: 0,
    insetInline: -96,
    backgroundImage: siteColors.flutes,
    backgroundSize: siteSize.flutesSize,
    mixBlendMode: "soft-light",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  rollLeft: {
    animationName: { default: rollIn, [media.reducedMotion]: "none" },
  },
  rollRight: {
    animationName: { default: rollInRight, [media.reducedMotion]: "none" },
  },
  pace: (seconds: number) => ({ animationDuration: `${seconds}s` }),
  // The light dims into the night at the top and the foot, so the rows never end on an edge.
  // One pane each side (the entrance and the book's cover): the light from the edge to the night,
  // its inner edge one smooth curve, reaching furthest at the top and the foot and least at the
  // middle, where the words stand. The reeds run its full height.
  panes: { position: "absolute", inset: 0, overflow: "hidden" },
  paneLeft: {
    position: "absolute",
    insetBlock: 0,
    insetInlineStart: "-3vw",
    width: "calc(36% + 3vw)",
    overflow: "clip",
    backgroundImage: `linear-gradient(90deg in oklch, ${light})`,
  },
  paneRight: {
    position: "absolute",
    insetBlock: 0,
    insetInlineEnd: "-3vw",
    width: "calc(36% + 3vw)",
    overflow: "clip",
    backgroundImage: `linear-gradient(270deg in oklch, ${light})`,
  },
  // The clearing in the middle: an ellipse of night, its rim soft, so the panes' inner edge curves.
  clearing: {
    maskImage: {
      default:
        "radial-gradient(ellipse 40% 72% at 50% 50%, transparent 62%, black 100%)",
      [media.maxSm]:
        "radial-gradient(ellipse 52% 78% at 50% 50%, transparent 66%, black 100%)",
    },
  },
  fade: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: `linear-gradient(180deg, ${colors.brandNight} 0%, transparent 18%, transparent 82%, ${colors.brandNight} 100%)`,
  },
});

/** The glass, filling its positioned parent behind what stands in it: from both edges, or (as on
 * the website's share card and Talk to us) from the right only, reaching further in. In rows, as
 * the website's hero; or as one pane each side (`shape="pane"`). */
export const Glass = ({
  side = "both",
  shape = "rows",
}: {
  side?: "both" | "right";
  shape?: "rows" | "pane";
}) =>
  shape === "pane" ? (
    <div aria-hidden="true" {...stylex.props(s.glass)}>
      <div {...stylex.props(s.panes, s.clearing)}>
        <span {...stylex.props(s.paneLeft)}>
          <span {...stylex.props(s.reeds, s.rollLeft, s.pace(rows[1]!.time))} />
        </span>
        <span {...stylex.props(s.paneRight)}>
          <span
            {...stylex.props(s.reeds, s.rollRight, s.pace(rows[1]!.time))}
          />
        </span>
      </div>
      <span {...stylex.props(s.fade)} />
    </div>
  ) : (
    <div aria-hidden="true" {...stylex.props(s.glass)}>
      {rows.map((row) => (
        <div key={`${row.left}-${row.right}`} {...stylex.props(s.row)}>
          {side === "both" && (
            <span {...stylex.props(s.pane, s.left, s.reach(row.left))}>
              <span {...stylex.props(s.reeds, s.rollLeft, s.pace(row.time))} />
            </span>
          )}
          <span
            {...stylex.props(
              s.pane,
              s.right,
              s.reach(side === "right" ? row.right + 14 : row.right)
            )}
          >
            <span {...stylex.props(s.reeds, s.rollRight, s.pace(row.time))} />
          </span>
        </div>
      ))}
      <span {...stylex.props(s.fade)} />
    </div>
  );
