"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  colors,
  duration,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { durations } from "@grasp-os/ui/lib/tokens.values";
// Motion, scene: one curve. The ease, drawn: time runs to the right and the change runs up, so a
// steep start is a part that answers at once. A dot rides each curve and a second dot crosses a
// track in the same time, beside ease-in-out for the things already on screen that move. Both
// rest at their end; Replay sends them again in duration-arrive. With reduced motion they do not
// travel: the curves stay drawn.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import { groups } from "../../tokens/tokens";

const PHONE = media.maxSm;
const REDUCED = media.reducedMotion;
const STARTING = ":is([data-run=start] *)";

// The curves' four numbers, read from the tokens, so the drawing is the token.
const valueOf = (name: string) =>
  groups
    .flatMap((group) => group.sets.flatMap((set) => set.tokens))
    .find((token) => token.name === name)?.value ?? "";
const pointsOf = (name: string) =>
  (valueOf(name).match(/[\d.]+/gu) ?? []).map(Number);

// The drawing's own units: a square of 100, time to the right, change upwards.
const pathOf = ([x1 = 0, y1 = 0, x2 = 1, y2 = 1]: number[]) =>
  `M 0 100 C ${x1 * 100} ${100 - y1 * 100}, ${x2 * 100} ${100 - y2 * 100}, 100 0`;

const styles = stylex.create({
  scene: { display: "grid", fontFamily: font.sans },
  pair: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [PHONE]: "minmax(0, 1fr)",
    },
  },
  side: {
    display: "grid",
    alignContent: "start",
    rowGap: space["5"],
    minWidth: 0,
    margin: 0,
    // At rest the dots' holders stand translated a whole graph, or a whole track, to the right:
    // without the clip they pushed the page 550px wider than the window. Clip, not hidden, so the
    // figure does not become a scroller; its padding keeps the dots at the end whole.
    overflow: "clip",
    paddingBlock: space["8"],
    paddingInline: { default: space["8"], [PHONE]: space["6"] },
  },
  second: {
    boxShadow: {
      default: `inset ${size.hairline} 0 0 ${colors.border}`,
      [PHONE]: `inset 0 ${size.hairline} 0 ${colors.border}`,
    },
  },
  // The graph: a square, its curve, and the dot riding it.
  graph: {
    position: "relative",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: `calc(2 * ${space["24"]})`,
    aspectRatio: "1",
    justifySelf: "center",
    marginBlock: space["2"],
  },
  svg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "visible",
  },
  frame: {
    fill: "none",
    stroke: colors.border,
    strokeWidth: 1,
    vectorEffect: "non-scaling-stroke",
  },
  curve: {
    fill: "none",
    stroke: colors.foreground,
    strokeWidth: 2,
    strokeLinecap: "round",
    vectorEffect: "non-scaling-stroke",
  },
  // Time: the dot's holder crosses the graph at an even pace.
  across: {
    position: "absolute",
    inset: 0,
    transform: { default: "translateX(100%)", [STARTING]: "translateX(0)" },
    transitionProperty: "transform",
    transitionTimingFunction: "linear",
  },
  // Change: inside it, the dot climbs on the curve under test.
  up: {
    position: "absolute",
    inset: 0,
    transform: { default: "translateY(-100%)", [STARTING]: "translateY(0)" },
    transitionProperty: "transform",
  },
  // The track under the graph: the same change, seen as a part moving across.
  track: {
    position: "relative",
    height: space["3"],
    marginInline: space["2"],
  },
  line: {
    position: "absolute",
    insetInline: 0,
    top: "50%",
    height: size.hairline,
    backgroundColor: colors.border,
  },
  rail: {
    position: "absolute",
    inset: 0,
    transform: { default: "translateX(100%)", [STARTING]: "translateX(0)" },
    transitionProperty: "transform",
  },
  dot: {
    position: "absolute",
    width: space["3"],
    height: space["3"],
    borderRadius: "50%",
    backgroundColor: colors.foreground,
    boxShadow: `0 0 0 ${space["1"]} ${colors.card}`,
  },
  onGraph: {
    left: `calc(-1 * ${space["3"]} / 2)`,
    bottom: `calc(-1 * ${space["3"]} / 2)`,
  },
  onTrack: { top: 0, left: `calc(-1 * ${space["3"]} / 2)` },
  // Playing: every travel takes duration-arrive; at rest, and with reduced motion, none.
  playing: {
    transitionDuration: { default: duration.arrive, [REDUCED]: "0s" },
  },
  still: { transitionDuration: "0s" },
  ease: { transitionTimingFunction: duration.ease },
  easeInOut: { transitionTimingFunction: duration.easeInOut },

  head: { display: "grid", rowGap: space["1"] },
  name: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
  },
  value: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    overflowWrap: "anywhere",
  },
  use: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    textWrap: "pretty",
  },
  foot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: space["3"],
    paddingBlock: space["3"],
    paddingInline: { default: space["8"], [PHONE]: space["6"] },
    boxShadow: `inset 0 ${size.hairline} 0 ${colors.border}`,
  },
  footNote: {
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
});

const curves = [
  {
    name: "ease",
    look: styles.ease,
    use: "Everything that enters, leaves or responds. It starts at speed, so a part answers the moment you act, then settles.",
  },
  {
    name: "ease-in-out",
    look: styles.easeInOut,
    use: "Only something already on screen that moves to a new place: it gathers, travels and lands softly.",
  },
] as const;

type Run = "rest" | "start" | "play";

export default function MotionCurve() {
  const [run, setRun] = useState<Run>("rest");
  // From the start, two frames later, set off: the browser must paint the start before it travels.
  useEffect(() => {
    if (run !== "start") {
      return;
    }
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        setRun("play");
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [run]);
  const timing = run === "play" ? styles.playing : styles.still;
  return (
    <div data-run={run} {...stylex.props(styles.scene)}>
      <div {...stylex.props(styles.pair)}>
        {curves.map((curve, index) => (
          <figure
            key={curve.name}
            {...stylex.props(styles.side, index > 0 && styles.second)}
          >
            <div aria-hidden="true" {...stylex.props(styles.graph)}>
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                {...stylex.props(styles.svg)}
              >
                <path d="M 0 0 V 100 H 100" {...stylex.props(styles.frame)} />
                <path
                  d={pathOf(pointsOf(curve.name))}
                  {...stylex.props(styles.curve)}
                />
              </svg>
              <div {...stylex.props(styles.across, timing)}>
                <div {...stylex.props(styles.up, timing, curve.look)}>
                  <span {...stylex.props(styles.dot, styles.onGraph)} />
                </div>
              </div>
            </div>
            <div aria-hidden="true" {...stylex.props(styles.track)}>
              <span {...stylex.props(styles.line)} />
              <div {...stylex.props(styles.rail, timing, curve.look)}>
                <span {...stylex.props(styles.dot, styles.onTrack)} />
              </div>
            </div>
            <figcaption {...stylex.props(styles.head)}>
              <p {...stylex.props(styles.name)}>{curve.name}</p>
              <p {...stylex.props(styles.value)}>{valueOf(curve.name)}</p>
            </figcaption>
            <p {...stylex.props(styles.use)}>{curve.use}</p>
          </figure>
        ))}
      </div>
      <div {...stylex.props(styles.foot)}>
        <span {...stylex.props(styles.footNote)}>
          Both cross in duration-arrive, {durations.arrive}ms
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRun("start");
          }}
        >
          Replay
        </Button>
      </div>
    </div>
  );
}
