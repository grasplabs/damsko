"use client";

import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import { Button } from "@grasp-os/ui/components/button";
import { Shimmer } from "@grasp-os/ui/components/shimmer";
import { Stepper } from "@grasp-os/ui/components/stepper";
import { ArrowRightIcon, Icon, RefreshCwIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  duration,
  font,
  media,
  radius,
  shadow,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Room 08's exhibits: the room that moves. One thing moves on each wall, as the visitor arrives
// (when half the wall is seen), once, and again on Replay. Every time and the curve are read from the
// tokens as the page has them. With reduced motion each is drawn as it ends, complete and still, and
// there is nothing to replay; in the one-file book the same.
//
//   The ease        the curve drawn as it runs, a dot on a track in step with it, and a trail of
//                   where the dot was at equal steps of time, which stays: the ease made visible
//   A panel         a side panel arriving on the ease and leaving, faster
//   The times       each a dot crossing in its own token's time, all together
//   A page opening  a title, its line and its call, 90ms apart with an 8px rise
//   Working         the working light, which moves while an agent works
import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { token } from "../blocks/token-data";
import { motionWords, times } from "./content";
import { useStill } from "./still";

/** The trail's steps: where the dot is at each twelfth of the time. */
const STEPS = 12;

const s = stylex.create({
  stage: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    width: "100%",
    height: "100%",
    minHeight: { default: 0, [media.maxLg]: "68svh" },
  },
  replay: {
    position: "absolute",
    insetBlockEnd: { default: space["6"], [media.maxSm]: space["4"] },
    insetInlineStart: {
      default: space["6"],
      [media.maxSm]: space["4"],
    },
    zIndex: 2,
    display: { default: "block", [media.reducedMotion]: "none" },
  },
  // ---- The ease
  ease: {
    display: "grid",
    gap: { default: space["10"], [media.maxSm]: space["8"] },
    width: "100%",
    maxWidth: "44rem",
    padding: { default: space["10"], [media.maxSm]: space["5"] },
  },
  plot: {
    width: { default: "16rem", [media.maxSm]: "11rem" },
    height: "auto",
    overflow: "visible",
    justifySelf: "center",
  },
  axis: {
    stroke: colors.border,
    strokeWidth: 1,
    fill: "none",
    vectorEffect: "non-scaling-stroke",
  },
  curve: {
    stroke: colors.mint,
    strokeWidth: 2,
    fill: "none",
    vectorEffect: "non-scaling-stroke",
  },
  head: { fill: colors.mint },
  value: {
    fontFamily: font.mono,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    textAlign: "center",
  },
  track: {
    position: "relative",
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dot: {
    position: "absolute",
    insetBlockStart: 0,
    insetInlineStart: 0,
    width: 16,
    height: 16,
    borderRadius: radius.circle,
    backgroundColor: colors.mint,
  },
  ghost: {
    position: "absolute",
    insetBlockStart: 4,
    width: 8,
    height: 8,
    marginInlineStart: 4,
    borderRadius: radius.circle,
    backgroundColor: `color-mix(in oklch, ${colors.mint} 55%, transparent)`,
  },
  // Rounded, so the server's figure and the browser's are the same text.
  at: (share: number) => ({
    insetInlineStart: `calc((100% - 16px) * ${share.toFixed(4)})`,
  }),
  // Before its first play an exhibit waits at its start; with no script, or no motion wanted, it is
  // drawn as it ends. In the one-file book `done` draws the end.
  waiting: {
    opacity: { default: 0, [media.noScript]: 1, [media.reducedMotion]: 1 },
  },
  startLeft: {
    insetInlineStart: {
      default: "0px",
      [media.noScript]: "calc(100% - 16px)",
      [media.reducedMotion]: "calc(100% - 16px)",
    },
  },
  reveal: {
    width: {
      default: "0px",
      [media.noScript]: "100px",
      [media.reducedMotion]: "100px",
    },
  },
  away: {
    transform: {
      default: "translateX(104%)",
      [media.noScript]: "none",
      [media.reducedMotion]: "none",
    },
  },
  doneShown: { opacity: 1 },
  doneRight: { insetInlineStart: "calc(100% - 16px)" },
  doneReveal: { width: "100px" },
  doneHome: { transform: "none" },
  // ---- A panel
  window: {
    position: "relative",
    width: "100%",
    maxWidth: "34rem",
    aspectRatio: "16 / 10",
    overflow: "hidden",
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.lg,
    colorScheme: "light",
  },
  page: { display: "grid", alignContent: "start", gap: 8, padding: "7%" },
  bar: (width: string, height: number) => ({
    width,
    height: `${height}px`,
    borderRadius: radius.full,
  }),
  barTitle: { backgroundColor: colors.foreground },
  barText: { backgroundColor: colors.border },
  panel: {
    position: "absolute",
    insetBlock: 0,
    insetInlineEnd: 0,
    display: "grid",
    alignContent: "start",
    gap: 8,
    width: "40%",
    padding: "5%",
    backgroundColor: colors.card,
    boxShadow: shadow.lg,
  },
  panelAction: {
    width: "50%",
    height: 14,
    marginBlockStart: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  windowFrame: {
    width: "100%",
    padding: { default: space["10"], [media.maxSm]: space["5"] },
    display: "grid",
    placeItems: "center",
  },
  // ---- The times
  times: {
    display: "grid",
    gap: space["5"],
    width: "100%",
    maxWidth: "46rem",
    margin: 0,
    padding: { default: space["10"], [media.maxSm]: space["5"] },
    listStyle: "none",
  },
  time: {
    display: "grid",
    gridTemplateColumns: {
      default: "10rem 4rem minmax(0, 1fr)",
      [media.maxSm]: "1fr auto",
    },
    alignItems: "center",
    columnGap: space["4"],
    rowGap: space["2"],
  },
  timeName: {
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.foreground,
  },
  timeValue: {
    fontFamily: font.mono,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    textAlign: "end",
  },
  timeTrack: { gridColumn: { default: "auto", [media.maxSm]: "1 / -1" } },
  // ---- A page opening
  arrival: {
    display: "grid",
    gap: space["4"],
    justifyItems: "center",
    textAlign: "center",
    padding: space["8"],
  },
  arriveTitle: {
    margin: 0,
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    letterSpacing: font.trackingTitle,
    color: colors.foreground,
  },
  arriveLine: {
    margin: 0,
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
    color: colors.bodyForeground,
  },
  // ---- The scene
  // ---- Working
  working: {
    display: "grid",
    gap: space["8"],
    justifyItems: "center",
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
  },
  // The Stepper on its own card, centred on the wall; its three steps spread to the card's width.
  stepperCard: {
    width: "min(36rem, calc(100% - 2rem))",
    overflow: "hidden",
    paddingBlock: { default: space["10"], [media.maxSm]: space["6"] },
    paddingInline: { default: space["10"], [media.maxSm]: space["5"] },
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.sm,
  },
  // The light look starts each step on its column's start edge, so the last column runs on past
  // its name: the stepper is a column wider than the card (less a name's width), and its last name
  // ends at the card's inner edge, the row centred between the padding.
  stepperFull: { width: "calc(150% - 3.5rem)" },
});

const msOf = (element: Element, name: string) => {
  const value = getComputedStyle(element)
    .getPropertyValue(`--damsko-${name}`)
    .trim();
  return value.endsWith("ms")
    ? Number.parseFloat(value)
    : Number.parseFloat(value) * 1000;
};
const easeOf = (element: Element) =>
  getComputedStyle(element).getPropertyValue("--damsko-ease").trim();
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The brand's ease as a function of time (0 to 1), read from its cubic-bezier, for the trail and
 * the plot. Solves x(s) = t by Newton's method, then returns (x, y) at s. */
const curveOf = (ease: string) => {
  const numbers = [...ease.matchAll(/-?[\d.]+/gu)].map((match) =>
    Number(match[0])
  );
  const [x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1] = numbers;
  const at = (a: number, b: number, s: number) =>
    3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  const slope = (a: number, b: number, s: number) =>
    3 * a * (1 - s) ** 2 + 6 * (b - a) * s * (1 - s) + 3 * (1 - b) * s * s;
  return (t: number) => {
    let s = t;
    for (let i = 0; i < 8; i += 1) {
      const d = slope(x1, x2, s);
      if (Math.abs(d) < 1e-6) {
        break;
      }
      s -= (at(x1, x2, s) - t) / d;
      s = Math.min(1, Math.max(0, s));
    }
    return { s, x: at(x1, x2, s), y: at(y1, y2, s) };
  };
};
/** The brand's ease as the tokens write it, for the first drawing and the one-file book. */
const tokenEase = token("ease").value;

/**
 * Runs `play` the first time the wall is half seen, and again on Replay; nothing with reduced
 * motion or in the book, where the exhibit is drawn as it ends.
 */
const useRun = (
  ref: RefObject<HTMLElement | null>,
  play: (root: HTMLElement) => void
) => {
  const still = useStill();
  const replay = useCallback(() => {
    if (ref.current && !reduced()) {
      play(ref.current);
    }
  }, [ref, play]);
  useEffect(() => {
    if (still) {
      return;
    }
    if (reduced()) {
      return;
    }
    const root = ref.current;
    if (!root) {
      return;
    }
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting !== true) {
          return;
        }
        seen.disconnect();
        play(root);
      },
      { threshold: 0.5 }
    );
    seen.observe(root);
    return () => {
      seen.disconnect();
    };
  }, [ref, play, still]);
  return { replay };
};

const Replay = ({ onReplay }: { onReplay: () => void }) => (
  <span {...stylex.props(s.replay)}>
    <Button variant="ghost" size="sm" onClick={onReplay}>
      <Icon icon={RefreshCwIcon} />
      {motionWords.replay}
    </Button>
  </span>
);

/** The ease, drawn as it runs: the curve revealed in time, a dot in step on its track, and the
 * trail of where the dot was at each twelfth of the time, which stays. */
export const Ease = () => {
  const still = useStill();
  const ref = useRef<HTMLDivElement>(null);
  const play = useCallback((root: HTMLElement) => {
    const ease = curveOf(easeOf(root));
    const easing = easeOf(root);
    const ms = msOf(root, "duration-arrive") * 2;
    const reveal = root.querySelector<SVGRectElement>("[data-reveal]");
    const head = root.querySelector<SVGCircleElement>("[data-head]");
    const dot = root.querySelector<HTMLElement>("[data-dot]");
    const ghosts = [...root.querySelectorAll<HTMLElement>("[data-ghost]")];
    if (!reveal || !head || !dot) {
      return;
    }
    for (const ghost of ghosts) {
      ghost.animate([{ opacity: 0 }], { duration: 0, fill: "forwards" });
    }
    reveal.animate([{ width: "0px" }, { width: "100px" }], {
      duration: ms,
      easing: "linear",
      fill: "forwards",
    });
    dot.animate(
      [{ insetInlineStart: "0px" }, { insetInlineStart: "calc(100% - 16px)" }],
      { duration: ms, easing, fill: "forwards" }
    );
    head.animate([{ opacity: 1 }], { duration: 0, fill: "forwards" });
    const begun = performance.now();
    const shown = new Set<number>();
    const frame = (now: number) => {
      const t = Math.min(1, (now - begun) / ms);
      const point = ease(t);
      head.setAttribute("cx", (point.x * 100).toFixed(2));
      head.setAttribute("cy", (100 - point.y * 100).toFixed(2));
      ghosts.forEach((ghost, index) => {
        if (index / STEPS <= t && !shown.has(index)) {
          shown.add(index);
          ghost.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 160,
            fill: "forwards",
          });
        }
      });
      if (t < 1) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  }, []);
  const { replay } = useRun(ref, play);
  const ease = curveOf(tokenEase);
  const trail = Array.from(
    { length: STEPS + 1 },
    (_, index) => ease(index / STEPS).y
  );
  const path = `M0 100 ${Array.from({ length: 41 }, (_, index) => {
    const point = ease(index / 40);
    return `L${(point.x * 100).toFixed(2)} ${(100 - point.y * 100).toFixed(2)}`;
  }).join(" ")}`;
  return (
    <div ref={ref} {...stylex.props(s.stage)}>
      <div {...stylex.props(s.ease)}>
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label={motionWords.easeLabel}
          {...stylex.props(s.plot)}
        >
          <defs>
            <clipPath id="brand-ease-reveal">
              <rect
                data-reveal=""
                x="-2"
                y="-4"
                height="108"
                {...stylex.props(s.reveal, still && s.doneReveal)}
              />
            </clipPath>
          </defs>
          <path d="M0 0 V100 H100" {...stylex.props(s.axis)} />
          <path
            d={path}
            clipPath="url(#brand-ease-reveal)"
            {...stylex.props(s.curve)}
          />
          <circle
            data-head=""
            cx="100"
            cy="0"
            r="3"
            {...stylex.props(s.head, s.waiting, still && s.doneShown)}
          />
        </svg>
        <span {...stylex.props(s.value)}>{motionWords.easeValue}</span>
        <div {...stylex.props(s.track)}>
          {trail.map((share, index) => (
            <span
              key={index}
              data-ghost=""
              {...stylex.props(
                s.ghost,
                s.at(share),
                s.waiting,
                still && s.doneShown
              )}
            />
          ))}
          <span
            data-dot=""
            {...stylex.props(s.dot, s.startLeft, still && s.doneRight)}
          />
        </div>
      </div>
      <Replay onReplay={replay} />
    </div>
  );
};

/** A panel arriving on the ease, resting, and leaving faster; then arriving to stay. */
export const Panel = () => {
  const still = useStill();
  const ref = useRef<HTMLDivElement>(null);
  const play = useCallback((root: HTMLElement) => {
    const panel = root.querySelector<HTMLElement>("[data-panel]");
    if (!panel) {
      return;
    }
    const ease = easeOf(root);
    const enter = msOf(root, "duration-ui");
    const leave = msOf(root, "duration-leave");
    const out = { transform: "translateX(104%)" };
    const home = { transform: "none" };
    panel.animate([out], { duration: 0, fill: "forwards" });
    const steps = [
      { at: 400, frames: [out, home], ms: enter },
      { at: 400 + enter + 1600, frames: [home, out], ms: leave },
      { at: 400 + enter + 1600 + leave + 900, frames: [out, home], ms: enter },
    ];
    for (const step of steps) {
      window.setTimeout(
        () =>
          panel.animate(step.frames, {
            duration: step.ms,
            easing: ease,
            fill: "forwards",
          }),
        step.at
      );
    }
  }, []);
  const { replay } = useRun(ref, play);
  return (
    <div ref={ref} {...stylex.props(s.stage)}>
      <div {...stylex.props(s.windowFrame)}>
        <div
          role="img"
          aria-label={motionWords.panelLabel}
          {...stylex.props(s.window)}
        >
          <div {...stylex.props(s.page)}>
            <span {...stylex.props(s.bar("40%", 10), s.barTitle)} />
            <span {...stylex.props(s.bar("88%", 6), s.barText)} />
            <span {...stylex.props(s.bar("76%", 6), s.barText)} />
            <span {...stylex.props(s.bar("82%", 6), s.barText)} />
          </div>
          <div
            data-panel=""
            {...stylex.props(s.panel, s.away, still && s.doneHome)}
          >
            <span {...stylex.props(s.bar("70%", 8), s.barTitle)} />
            <span {...stylex.props(s.bar("100%", 6), s.barText)} />
            <span {...stylex.props(s.bar("90%", 6), s.barText)} />
            <span {...stylex.props(s.panelAction)} />
          </div>
        </div>
      </div>
      <Replay onReplay={replay} />
    </div>
  );
};

/** A time as the tokens give it ("150ms"). */
const timeText = (name: string) => token(name).value;

/** The times: each a dot crossing in its own token's time, all starting together. */
export const Times = () => {
  const still = useStill();
  const ref = useRef<HTMLDivElement>(null);
  const play = useCallback((root: HTMLElement) => {
    const ease = easeOf(root);
    for (const dot of root.querySelectorAll<HTMLElement>("[data-dot]")) {
      const ms = msOf(root, dot.dataset.token ?? "duration-ui");
      dot.animate(
        [
          { insetInlineStart: "0px" },
          { insetInlineStart: "calc(100% - 16px)" },
        ],
        { duration: ms, delay: 300, easing: ease, fill: "both" }
      );
    }
  }, []);
  const { replay } = useRun(ref, play);
  return (
    <div ref={ref} {...stylex.props(s.stage)}>
      <ul {...stylex.props(s.times)}>
        {times.map((time) => (
          <li key={time.token} {...stylex.props(s.time)}>
            <span {...stylex.props(s.timeName)}>{time.name}</span>
            <span {...stylex.props(s.timeValue)}>{timeText(time.token)}</span>
            <span {...stylex.props(s.track, s.timeTrack)}>
              <span
                data-dot=""
                data-token={time.token}
                {...stylex.props(s.dot, s.startLeft, still && s.doneRight)}
              />
            </span>
          </li>
        ))}
      </ul>
      <Replay onReplay={replay} />
    </div>
  );
};

/** A page's opening arriving: its parts 90ms apart from 50ms, each with an 8px rise. */
export const Arrival = () => {
  const still = useStill();
  const ref = useRef<HTMLDivElement>(null);
  const play = useCallback((root: HTMLElement) => {
    const ms = msOf(root, "duration-arrive");
    const stagger = msOf(root, "duration-stagger");
    const ease = easeOf(root);
    const parts = [...root.querySelectorAll<HTMLElement>("[data-part]")];
    parts.forEach((part, index) => {
      part.animate(
        [
          { opacity: 0.01, transform: "translateY(8px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: ms,
          delay: 50 + index * stagger,
          easing: ease,
          fill: "both",
        }
      );
    });
  }, []);
  const { replay } = useRun(ref, play);
  return (
    <div ref={ref} {...stylex.props(s.stage)}>
      <div {...stylex.props(s.arrival)}>
        <p
          data-part=""
          {...stylex.props(s.arriveTitle, s.waiting, still && s.doneShown)}
        >
          {motionWords.arriveTitle}
        </p>
        <p
          data-part=""
          {...stylex.props(s.arriveLine, s.waiting, still && s.doneShown)}
        >
          {motionWords.arriveLine}
        </p>
        <span data-part="" {...stylex.props(s.waiting, still && s.doneShown)}>
          <Button variant="default" size="lg">
            {motionWords.arriveAction}
            <Icon icon={ArrowRightIcon} />
          </Button>
        </span>
      </div>
      <Replay onReplay={replay} />
    </div>
  );
};

/** The working light: it moves while an agent works, and only then. */
/** The Stepper at work: its light travels the line only while the step is under way. */
export const StepperWorking = () => (
  <div {...stylex.props(s.stepperCard)}>
    <Stepper
      aria-label={motionWords.stepperLabel}
      value={1}
      loading
      steps={motionWords.steps.map((label) => ({ label }))}
      style={s.stepperFull}
    />
  </div>
);

export const Working = () => (
  <div {...stylex.props(s.working)}>
    <AgentIndicator aria-label={motionWords.workingLabel} />
    <Shimmer>{motionWords.thinking}</Shimmer>
  </div>
);
