// How App building is drawn: the stage, the pieces in its two looks, the cursors, and the moves.
// Only transform and opacity ever move; every move is a token's length, 300ms at most. The dither
// is a still background (a dot pattern), never redrawn. Every value is a token: the library's, or
// the site's own (site/system/styles/tokens.css, --build-*).
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import {
  iconVars,
  motionVars,
  pixel,
  pixelVars,
} from "@grasp-os/ui/lib/vars.stylex";
import * as stylex from "@stylexjs/stylex";

import { siteBuild, siteColors } from "../../system/site-tokens.stylex";
import { buildVars as v } from "./app-building.stylex";

const REDUCED = media.reducedMotion;
const FORCED = media.forcedColors;
const SIGN = "var(--build-sign, 1)";

// When a piece comes in within its step: once its cursor has arrived and pressed.
const PRESS = `calc(${siteBuild.beat} * 0.42)`;
const after = (beats: number) =>
  `calc(${PRESS} + ${duration.stagger} * ${beats})`;

// The clock: nothing moves; each of its rounds is one step of the build (app-building.tsx).
const tick = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 0 },
});
// A piece, or a line in it, coming in where the cursor pressed.
const appear = stylex.keyframes({
  from: { opacity: 0, transform: "scale(0.94)" },
  to: { opacity: 1, transform: "none" },
});
// What is in a piece settles with its surface, and never fades as a whole: each line fades for
// itself, so nothing moves inside something that cannot be seen.
const settle = stylex.keyframes({
  from: { transform: "scale(0.94)" },
  to: { transform: "none" },
});
const draw = stylex.keyframes({
  from: { opacity: 0, transform: "scaleX(0.3)" },
  to: { opacity: 1, transform: "none" },
});
const grow = stylex.keyframes({
  from: { transform: "scaleY(0)" },
  to: { transform: "none" },
});
// The ring a press leaves under a cursor's tip.
const ripple = stylex.keyframes({
  from: { opacity: 0.6, transform: "scale(0.3)" },
  to: { opacity: 0, transform: "scale(1.6)" },
});
// Half of the UI's duration: what each half of the hand-over takes.
const HALF = `calc(${motionVars.ui} / 2)`;

// The app coming in, once the stage has left.
const appIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

// The stage crossing out to the app.
const cross = stylex.keyframes({
  from: { opacity: 1, transform: "none" },
  to: { opacity: 0, transform: "scale(0.98)" },
});

export const styles = stylex.create({
  // The whole: the stage and, once built, the app in the same place.
  root: {
    position: "relative",
    display: "grid",
    gridTemplateAreas: '"all"',
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: "minmax(0, 1fr)",
    width: "100%",
    height: "100%",
    minHeight: siteBuild.minHeight,
  },
  stage: {
    "--build-sign": { default: "1", ":dir(rtl)": "-1" },
    gridArea: "all",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },
  paused: { [v.play]: "paused" },
  // The hand-over is one move in two halves, each half of the UI's duration: the stage leaves, and
  // only then the app arrives. The two are never on screen together.
  crossing: {
    pointerEvents: "none",
    animationName: cross,
    animationDuration: HALF,
    animationTimingFunction: duration.ease,
    animationFillMode: "forwards",
  },
  app: { gridArea: "all", minWidth: 0, minHeight: 0 },
  arriving: {
    animationName: appIn,
    animationDuration: HALF,
    animationTimingFunction: duration.ease,
    animationFillMode: "backwards",
  },
  // The drawing: decorative, so hidden from a screen reader.
  canvas: {
    position: "relative",
    flexGrow: 1,
    minHeight: 0,
    overflow: "hidden",
    // Its colours are set for forced colours below, so they are kept as set.
    forcedColorAdjust: "none",
  },
  // The line under it that says the step, quietly.
  step: {
    margin: 0,
    paddingBlock: space["2"],
    paddingInline: space["4"],
    minHeight: font.textSmLine,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    textAlign: "center",
    overflowWrap: "anywhere",
  },
  // No step given: the live region stays, ready to speak, but takes no room.
  stepEmpty: { paddingBlock: 0, minHeight: 0 },
  clock: {
    position: "absolute",
    width: 0,
    height: 0,
    opacity: 0,
    animationName: { default: tick, [REDUCED]: "none" },
    animationDuration: siteBuild.beat,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationPlayState: v.play,
  },

  // A piece: its place, its move when it changes places, and its fade as the round clears.
  slot: {
    position: "absolute",
    boxSizing: "border-box",
    transitionProperty: "transform, opacity",
    transitionDuration: `${motionVars.ui}, ${motionVars.leave}`,
    transitionTimingFunction: duration.easeInOut,
  },
  at: (x: number, y: number, w: number, h: number) => ({
    insetInlineStart: `${x}%`,
    top: `${y}%`,
    width: `${w}%`,
    height: `${h}%`,
  }),
  moved: (x: number, y: number) => ({
    transform: `translate(calc(${x}% * ${SIGN}), ${y}%)`,
  }),
  cleared: { opacity: 0 },
  // A piece's surface: the one thing of it that fades in.
  surface: {
    animationName: { default: appear, [REDUCED]: "none" },
    animationDuration: motionVars.ui,
    animationTimingFunction: duration.ease,
    animationFillMode: "both",
    animationPlayState: v.play,
    animationDelay: PRESS,
    position: "absolute",
    inset: 0,
    boxSizing: "border-box",
    borderRadius: radius.mark,
    transformOrigin: "32% 42%",
  },
  // What is on it: laid out by kind, settling with the surface.
  piece: {
    animationName: { default: settle, [REDUCED]: "none" },
    animationDuration: motionVars.ui,
    animationTimingFunction: duration.ease,
    animationFillMode: "both",
    animationPlayState: v.play,
    position: "absolute",
    inset: 0,
    display: "flex",
    boxSizing: "border-box",
    overflow: "hidden",
    borderRadius: radius.mark,
    transformOrigin: "32% 42%",
    animationDelay: PRESS,
  },
  // Still: no move at all, the finished interface.
  still: { animationName: "none" },

  // The parts inside a piece, laid out by kind.
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space["2"],
    paddingInline: "3%",
  },
  side: { flexDirection: "column", gap: space["2"], padding: space["3"] },
  card: {
    flexDirection: "column",
    justifyContent: "center",
    gap: space["2"],
    padding: space["3"],
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: "3%",
    padding: space["3"],
  },
  table: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    paddingInline: space["3"],
    paddingBlock: space["1"],
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    minHeight: 0,
  },

  // A line, a dot or a bar inside a piece.
  part: {
    animationName: { default: draw, [REDUCED]: "none" },
    animationDuration: motionVars.ui,
    animationTimingFunction: duration.ease,
    animationFillMode: "both",
    animationPlayState: v.play,
    animationDelay: after(0),
    flexShrink: 0,
    height: space["2"],
    borderRadius: radius.full,
    transformOrigin: "0 50%",
  },
  thick: { height: space["4"], borderRadius: radius.mark },
  thin: { height: space["1"] },
  dot: { width: space["2"], borderRadius: radius.circle },
  square: { width: space["4"], height: space["4"], borderRadius: radius.mark },
  push: { marginInlineStart: "auto" },
  column: {
    animationName: { default: grow, [REDUCED]: "none" },
    animationDuration: motionVars.ui,
    animationTimingFunction: duration.ease,
    animationFillMode: "both",
    animationPlayState: v.play,
    animationDelay: after(0),
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
    borderRadius: radius.mark,
    transformOrigin: "50% 100%",
  },
  w20: { width: "20%" },
  w30: { width: "30%" },
  w45: { width: "45%" },
  w60: { width: "60%" },
  w70: { width: "70%" },
  w85: { width: "85%" },
  h30: { height: "30%" },
  h45: { height: "45%" },
  h55: { height: "55%" },
  h70: { height: "70%" },
  h85: { height: "85%" },
  h100: { height: "100%" },
  at1: { animationDelay: after(1) },
  at2: { animationDelay: after(2) },
  at3: { animationDelay: after(3) },
  at4: { animationDelay: after(4) },
  at5: { animationDelay: after(5) },

  // The cursors: each moves over the whole stage, so its translate is a share of the stage.
  track: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    transitionProperty: "transform, opacity",
    transitionDuration: `${motionVars.ui}, ${motionVars.leave}`,
    transitionTimingFunction: duration.easeInOut,
  },
  to: (x: number, y: number) => ({
    transform: `translate(calc(${x}% * ${SIGN}), ${y}%)`,
  }),
  gone: { opacity: 0 },
  cursor: {
    [iconVars.size]: size.iconDefault,
    [iconVars.stroke]: size.iconStroke,
    position: "absolute",
    top: 0,
    insetInlineStart: 0,
    // The pointer's tip, not its box, stands on the point.
    marginBlockStart: `calc(${size.iconDefault} * -0.14)`,
    marginInlineStart: `calc(${size.iconDefault} * -0.14)`,
  },
  ring: {
    position: "absolute",
    top: 0,
    insetInlineStart: 0,
    width: space["4"],
    height: space["4"],
    marginBlockStart: `calc(${space["2"]} * -0.5)`,
    marginInlineStart: `calc(${space["2"]} * -0.5)`,
    borderRadius: radius.circle,
    borderWidth: size.hairline,
    borderStyle: "solid",
    borderColor: "currentColor",
    opacity: 0,
    animationName: { default: ripple, [REDUCED]: "none" },
    animationDuration: motionVars.ui,
    animationDelay: `calc(${PRESS} - ${duration.stagger})`,
    animationTimingFunction: duration.ease,
    animationFillMode: "both",
    animationPlayState: v.play,
  },
  tag: {
    position: "absolute",
    top: `calc(${size.iconDefault} * 0.8)`,
    insetInlineStart: `calc(${size.iconDefault} * 0.6)`,
    paddingInline: space["2"],
    borderRadius: radius.full,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    whiteSpace: "nowrap",
    color: { default: siteColors.buildOnCursor, [FORCED]: "Canvas" },
  },
  tone0: { color: { default: colors.pine, [FORCED]: "CanvasText" } },
  tone1: { color: { default: colors.mintDeep, [FORCED]: "CanvasText" } },
  tone2: { color: { default: colors.lavender, [FORCED]: "CanvasText" } },
  fill0: { backgroundColor: { default: colors.pine, [FORCED]: "CanvasText" } },
  fill1: {
    backgroundColor: { default: colors.mintDeep, [FORCED]: "CanvasText" },
  },
  fill2: {
    backgroundColor: { default: colors.lavender, [FORCED]: "CanvasText" },
  },
});

// The two looks: the ground, a piece's surface, and the parts inside it.
export const looks = {
  // Soft blocks with a dither on them.
  blocks: stylex.create({
    ground: {
      backgroundColor: { default: colors.background, [FORCED]: "Canvas" },
    },
    piece: {
      backgroundColor: { default: siteColors.buildBlock, [FORCED]: "Canvas" },
      // The dither: the system's pixel in every square of the grid, a still background.
      [pixelVars.color]: siteColors.buildDot,
      backgroundImage: { default: pixel.full, [FORCED]: "none" },
      backgroundSize: `${siteBuild.dither} ${siteBuild.dither}`,
      outline: {
        default: "none",
        [FORCED]: `${size.hairline} solid CanvasText`,
      },
    },
    part: {
      backgroundColor: {
        default: siteColors.buildDetail,
        [FORCED]: "GrayText",
      },
    },
    strong: {
      backgroundColor: {
        default: siteColors.buildDetail,
        [FORCED]: "CanvasText",
      },
    },
  }),
  // Outlines on a blueprint's grid.
  blueprint: stylex.create({
    ground: {
      backgroundColor: { default: colors.background, [FORCED]: "Canvas" },
      backgroundImage: {
        default: `linear-gradient(${siteColors.buildGrid} ${size.hairline}, transparent ${size.hairline}), linear-gradient(90deg, ${siteColors.buildGrid} ${size.hairline}, transparent ${size.hairline})`,
        [FORCED]: "none",
      },
      backgroundSize: `${space["4"]} ${space["4"]}`,
    },
    piece: {
      borderWidth: size.hairline,
      borderStyle: "dashed",
      borderColor: {
        default: siteColors.buildOutline,
        [FORCED]: "CanvasText",
      },
      // The dither: the system's pixel in every square of the grid, a still background.
      [pixelVars.color]: siteColors.buildGrid,
      backgroundImage: { default: pixel.full, [FORCED]: "none" },
      backgroundSize: `${siteBuild.dither} ${siteBuild.dither}`,
    },
    part: {
      boxSizing: "border-box",
      borderWidth: size.hairline,
      borderStyle: "solid",
      borderColor: {
        default: siteColors.buildOutline,
        [FORCED]: "CanvasText",
      },
    },
    strong: {
      boxSizing: "border-box",
      borderWidth: size.hairline,
      borderStyle: "solid",
      borderColor: {
        default: siteColors.buildOutline,
        [FORCED]: "CanvasText",
      },
      // The dither: the system's pixel in every square of the grid, a still background.
      [pixelVars.color]: siteColors.buildOutline,
      backgroundImage: { default: pixel.full, [FORCED]: "none" },
      backgroundSize: `${siteBuild.dither} ${siteBuild.dither}`,
    },
  }),
};

export const tones = [styles.tone0, styles.tone1, styles.tone2] as const;
export const fills = [styles.fill0, styles.fill1, styles.fill2] as const;
export const delays = [
  null,
  styles.at1,
  styles.at2,
  styles.at3,
  styles.at4,
  styles.at5,
] as const;
