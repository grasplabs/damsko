"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";
import { Icon, WandSparklesIcon } from "@grasp-os/ui/lib/icons";
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
import { durations } from "@grasp-os/ui/lib/tokens.values";
// Motion, scene: leaving is faster. The same row twice: on the left it opens to show what the
// agent sent, in duration-open; on the right it closes again, in duration-close, a third quicker.
// Under each, the time it takes drawn to scale. At rest each shows where it ends; Replay plays both
// at once, and "Slow down" at a tenth of their speed. With reduced motion a row simply opens.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const PHONE = media.maxSm;
const REDUCED = media.reducedMotion;
const SLOW = 10;

// Plays every transition that starts inside `ref` at 1/SLOW of its speed.
function useSlow(ref: RefObject<HTMLElement | null>, slow: boolean) {
  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    const rate = slow ? 1 / SLOW : 1;
    const apply = () => {
      for (const animation of root.getAnimations({ subtree: true })) {
        animation.playbackRate = rate;
      }
    };
    root.addEventListener("transitionrun", apply);
    root.addEventListener("transitionstart", apply);
    return () => {
      root.removeEventListener("transitionrun", apply);
      root.removeEventListener("transitionstart", apply);
    };
  }, [ref, slow]);
}

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
    gridTemplateRows: "auto 1fr auto",
    rowGap: space["5"],
    minWidth: 0,
    margin: 0,
    paddingBlock: space["8"],
    paddingInline: { default: space["8"], [PHONE]: space["5"] },
  },
  second: {
    boxShadow: {
      default: `inset ${size.hairline} 0 0 ${colors.border}`,
      [PHONE]: `inset 0 ${size.hairline} 0 ${colors.border}`,
    },
  },
  name: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  // The stage keeps the open row's height, so nothing below it moves.
  stage: {
    display: "grid",
    alignContent: "start",
    minHeight: `calc(2 * ${space["24"]})`,
  },

  // The row: an agent's step, and what it sent under it.
  row: {
    display: "grid",
    minWidth: 0,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.sm,
    overflow: "hidden",
  },
  head: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    paddingBlock: space["3"],
    paddingInline: space["4"],
  },
  mark: {
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: size.controlSm,
    height: size.controlSm,
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    color: colors.foreground,
  },
  title: { display: "grid", minWidth: 0 },
  what: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
  },
  when: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  // The panel opens by its height: a grid row from nothing to its content.
  fold: {
    display: "grid",
    transitionProperty: "grid-template-rows",
    transitionTimingFunction: duration.ease,
  },
  open: { gridTemplateRows: "1fr" },
  shut: { gridTemplateRows: "0fr" },
  opening: {
    transitionDuration: { default: duration.open, [REDUCED]: "0s" },
  },
  closing: {
    transitionDuration: { default: duration.close, [REDUCED]: "0s" },
  },
  still: { transitionDuration: "0s" },
  inner: { minHeight: 0, overflow: "hidden" },
  list: {
    display: "grid",
    rowGap: space["2"],
    margin: 0,
    paddingBlock: space["3"],
    paddingInline: space["4"],
    listStyle: "none",
    boxShadow: `inset 0 ${size.hairline} 0 ${colors.border}`,
  },
  sent: {
    display: "flex",
    justifyContent: "space-between",
    gap: space["3"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
  subject: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  to: { flexShrink: 0, color: colors.mutedForeground },

  // The time, to scale: the longer of the two fills the width.
  ruler: { display: "grid", rowGap: space["2"] },
  track: {
    height: space["1"],
    borderRadius: space["1"],
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  span: (share: number) => ({ width: `calc(${share} * 100%)` }),
  fill: {
    height: "100%",
    backgroundColor: colors.foreground,
    transformOrigin: "left",
    transform: { default: "scaleX(1)", ":is([data-run=start] *)": "scaleX(0)" },
    transitionProperty: "transform",
    transitionTimingFunction: "linear",
  },
  token: {
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
  },
  foot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: space["3"],
    paddingBlock: space["3"],
    paddingInline: { default: space["8"], [PHONE]: space["5"] },
    boxShadow: `inset 0 ${size.hairline} 0 ${colors.border}`,
  },
});

const emails = [
  { subject: "Board pack, October", to: "Anna" },
  { subject: "Churn by plan", to: "Joost" },
  { subject: "Q3 revenue summary", to: "Mila" },
];

type Run = "rest" | "start" | "play";

const longest = Math.max(durations.open, durations.close);

const sides = [
  {
    id: "open",
    name: "Opening",
    token: "duration-open",
    time: durations.open,
  },
  {
    id: "close",
    name: "Closing",
    token: "duration-close",
    time: durations.close,
  },
] as const;

export default function MotionLeave() {
  const [run, setRun] = useState<Run>("rest");
  const [slow, setSlow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useSlow(ref, slow);
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
  return (
    <div ref={ref} data-run={run} {...stylex.props(styles.scene)}>
      <div {...stylex.props(styles.pair)}>
        {sides.map((side, index) => {
          const opening = side.id === "open";
          // At rest and playing, each row stands where it ends; at the start, where it began.
          const isOpen = run === "start" ? !opening : opening;
          const timing =
            run === "play"
              ? opening
                ? styles.opening
                : styles.closing
              : styles.still;
          return (
            <figure
              key={side.id}
              {...stylex.props(styles.side, index > 0 && styles.second)}
            >
              <figcaption {...stylex.props(styles.name)}>
                {side.name}
              </figcaption>
              <div {...stylex.props(styles.stage)}>
                <div {...stylex.props(styles.row)}>
                  <div {...stylex.props(styles.head)}>
                    <span {...stylex.props(styles.mark)}>
                      <Icon icon={WandSparklesIcon} />
                    </span>
                    <span {...stylex.props(styles.title)}>
                      <span {...stylex.props(styles.what)}>
                        Inbox agent sent 3 reports
                      </span>
                      <span {...stylex.props(styles.when)}>Today at 09:40</span>
                    </span>
                  </div>
                  <div
                    {...stylex.props(
                      styles.fold,
                      isOpen ? styles.open : styles.shut,
                      timing
                    )}
                  >
                    <div {...stylex.props(styles.inner)}>
                      <ul {...stylex.props(styles.list)}>
                        {emails.map((email) => (
                          <li
                            key={email.subject}
                            {...stylex.props(styles.sent)}
                          >
                            <span {...stylex.props(styles.subject)}>
                              {email.subject}
                            </span>
                            <span {...stylex.props(styles.to)}>{email.to}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div {...stylex.props(styles.ruler)}>
                <div
                  {...stylex.props(
                    styles.track,
                    styles.span(side.time / longest)
                  )}
                >
                  <div
                    {...stylex.props(
                      styles.fill,
                      run === "play"
                        ? opening
                          ? styles.opening
                          : styles.closing
                        : styles.still
                    )}
                  />
                </div>
                <span {...stylex.props(styles.token)}>
                  {side.token} {side.time}ms
                </span>
              </div>
            </figure>
          );
        })}
      </div>
      <div {...stylex.props(styles.foot)}>
        <Field orientation="horizontal">
          <FieldLabel>{`Slow down ×${SLOW}`}</FieldLabel>
          <Switch
            checked={slow}
            onCheckedChange={(on) => {
              setSlow(on);
            }}
          />
        </Field>
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
