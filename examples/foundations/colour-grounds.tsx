"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Slider } from "@grasp-os/ui/components/slider";
import {
  colors,
  font,
  radius,
  shadow,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Colour, scene: one screen on the three grounds, as something to move through. The same screen,
// in the same code, lies on Paper, Soft and Night at once: a band of Soft between the two, which
// you drag (or move with the slider under it) from all paper to all night. Every colour is a
// token, so the night is a line of CSS (color-scheme: dark), not a second design. Each ground says
// how its text reads on it, measured from what is drawn.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { asRatio, measurer } from "./contrast";

/** How wide the band of Soft is, in hundredths of the screen: a third, so at rest each ground has one. */
const BAND = 34;
const GRIP = 44;

// By the scene's own room: on a phone a third of the screen is too narrow for a name and its figure
// on one line.
const narrow = "@container grounds (width < 34rem)";

const styles = stylex.create({
  scene: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    // A container has no width of its own to give: it takes the room it is handed.
    width: "100%",
    containerType: "inline-size",
    containerName: "grounds",
  },
  screen: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    overflow: "hidden",
    isolation: "isolate",
  },
  ground: {
    display: "grid",
    alignContent: "start",
    gridTemplateColumns: "minmax(0, 1fr)",
    rowGap: space["4"],
    minWidth: 0,
    paddingBlockStart: { default: space["12"], [narrow]: space["16"] },
    paddingBlockEnd: space["8"],
    paddingInline: { default: space["6"], [narrow]: space["4"] },
    color: colors.bodyForeground,
  },
  // The two grounds laid over the first: the same screen again, cut to its part by `cut`.
  over: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  cut: (start: string, end: string) => ({
    clipPath: {
      default: `inset(0 ${end} 0 ${start})`,
      ":is([dir=rtl] *)": `inset(0 ${start} 0 ${end})`,
    },
  }),
  paper: { backgroundColor: colors.background },
  soft: { backgroundColor: colors.muted },
  night: { colorScheme: "dark", backgroundColor: colors.brandNight },
  // A ground's name and its figure, at the start of its part of the screen.
  name: {
    position: "absolute",
    top: space["4"],
    display: "flex",
    flexDirection: { default: "row", [narrow]: "column" },
    alignItems: { default: "baseline", [narrow]: "flex-start" },
    columnGap: space["2"],
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },
  nameAt: (start: string) => ({
    insetInlineStart: {
      default: `calc(${start} + ${space["6"]})`,
      [narrow]: `calc(${start} + ${space["4"]})`,
    },
  }),
  figure: {
    fontFamily: font.mono,
    fontWeight: font.weightNormal,
    fontVariantNumeric: "tabular-nums",
    color: colors.subtleForeground,
  },
  cards: {
    display: "grid",
    // Two cards across when both have room, each wide enough for its two buttons on one line.
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))",
    gap: space["4"],
    alignItems: "start",
  },
  card: {
    display: "grid",
    rowGap: space["3"],
    minWidth: 0,
    padding: space["5"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.sm,
    fontFamily: font.sans,
  },
  top: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["2"],
  },
  when: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  title: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  line: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    textWrap: "pretty",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    marginTop: space["1"],
  },
  rows: { display: "grid", margin: 0, padding: 0, listStyle: "none" },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
    minWidth: 0,
    paddingBlock: space["2"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    boxShadow: {
      default: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
      ":last-child": "none",
    },
  },
  file: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: colors.bodyForeground,
  },
  // Where two grounds meet: a fine line with a grip to drag. The grip is for a pointer; the
  // slider under the screen is the same control for the keyboard and a screen reader.
  edge: {
    position: "absolute",
    insetBlock: 0,
    zIndex: 1,
    display: "grid",
    placeItems: "center",
    width: GRIP,
    marginInlineStart: -GRIP / 2,
    cursor: "ew-resize",
    touchAction: "none",
    WebkitTapHighlightColor: "transparent",
    "::before": {
      content: '""',
      position: "absolute",
      insetBlock: 0,
      insetInlineStart: `calc(50% - ${size.hairline} / 2)`,
      width: size.hairline,
      backgroundColor: colors.mutedForeground,
      opacity: 0.5,
    },
  },
  edgeAt: (start: string) => ({ insetInlineStart: start }),
  gone: { display: "none" },
  grip: {
    position: "relative",
    width: 6,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    boxShadow: `${size.borderStrong}, ${shadow.sm}`,
  },
  foot: {
    paddingBlock: space["4"],
    paddingInline: space["6"],
    backgroundColor: colors.card,
    boxShadow: `inset 0 ${size.hairline} 0 ${colors.border}`,
  },
});

const grounds = ["paper", "soft", "night"] as const;
type Ground = (typeof grounds)[number];
const names: Record<Ground, string> = {
  paper: "Paper",
  soft: "Soft",
  night: "Night",
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const percent = (value: number) => `${clamp(value).toFixed(2)}%`;

/** The one screen. It is drawn three times, once per ground; only the first is there to use. */
function Screen({
  ground,
  start,
  figure,
}: {
  ground: Ground;
  start: number;
  figure: string;
}) {
  return (
    <>
      <p {...stylex.props(styles.name, styles.nameAt(percent(start)))}>
        {names[ground]}
        <span {...stylex.props(styles.figure)}>
          {figure && `text ${figure}`}
        </span>
      </p>
      <div {...stylex.props(styles.cards)}>
        <div {...stylex.props(styles.card)}>
          <div {...stylex.props(styles.top)}>
            <Badge variant="warning">Waiting for you</Badge>
            <span {...stylex.props(styles.when)}>2 min ago</span>
          </div>
          <p {...stylex.props(styles.title)}>Move 3 reports to Archive</p>
          <p {...stylex.props(styles.line)}>
            The research agent wants to tidy last quarter away.
          </p>
          <div {...stylex.props(styles.actions)}>
            <Button size="sm" variant="outline">
              Decline
            </Button>
            <Button size="sm" variant="default">
              Approve
            </Button>
          </div>
        </div>
        <div {...stylex.props(styles.card)}>
          <div {...stylex.props(styles.top)}>
            <p {...stylex.props(styles.title)}>Reports</p>
            <span {...stylex.props(styles.when)}>Last quarter</span>
          </div>
          <ul {...stylex.props(styles.rows)}>
            <li {...stylex.props(styles.row)}>
              <span {...stylex.props(styles.file)}>Revenue by region</span>
              <Badge variant="success" size="sm">
                Ready
              </Badge>
            </li>
            <li {...stylex.props(styles.row)}>
              <span {...stylex.props(styles.file)}>Churn, by plan</span>
              <Badge size="sm">Draft</Badge>
            </li>
            <li {...stylex.props(styles.row)}>
              <span {...stylex.props(styles.file)}>Interview notes</span>
              <Badge variant="destructive" size="sm">
                Failed
              </Badge>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default function ColourGrounds() {
  // 0 is all night, 100 all paper; at 50 each ground has a third.
  const [at, setAt] = useState(50);
  const [figures, setFigures] = useState<Record<Ground, string>>({
    paper: "",
    soft: "",
    night: "",
  });
  const screen = useRef<HTMLDivElement>(null);

  const softFrom = (at / 100) * (100 + BAND) - BAND;
  const nightFrom = softFrom + BAND;

  // Each ground's text colour on the ground itself, measured from the colours the browser has computed.
  useEffect(() => {
    const element = screen.current;
    if (!element) {
      return;
    }
    const ratio = measurer();
    const next: Record<Ground, string> = { paper: "", soft: "", night: "" };
    for (const layer of element.querySelectorAll<HTMLElement>(
      "[data-ground]"
    )) {
      const drawn = getComputedStyle(layer);
      next[layer.dataset.ground as Ground] = asRatio(
        ratio(drawn.color, drawn.backgroundColor)
      );
    }
    setFigures(next);
  }, []);

  // A grip follows the pointer; which edge it is says how far the band has come.
  const drag =
    (edge: "soft" | "night") => (event: ReactPointerEvent<HTMLDivElement>) => {
      const element = screen.current;
      if (!element || !event.currentTarget.hasPointerCapture(event.pointerId)) {
        return;
      }
      const box = element.getBoundingClientRect();
      const fromStart =
        getComputedStyle(element).direction === "rtl"
          ? box.right - event.clientX
          : event.clientX - box.left;
      const x = (fromStart / box.width) * 100;
      setAt(clamp(((edge === "soft" ? x + BAND : x) / (100 + BAND)) * 100));
    };
  const hold = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  return (
    <div {...stylex.props(styles.scene)}>
      <div ref={screen} {...stylex.props(styles.screen)}>
        <div data-ground="paper" {...stylex.props(styles.ground, styles.paper)}>
          <Screen ground="paper" start={0} figure={figures.paper} />
        </div>
        <div
          aria-hidden="true"
          inert
          data-ground="soft"
          {...stylex.props(
            styles.ground,
            styles.over,
            styles.soft,
            styles.cut(percent(softFrom), percent(100 - nightFrom))
          )}
        >
          <Screen ground="soft" start={softFrom} figure={figures.soft} />
        </div>
        <div
          aria-hidden="true"
          inert
          data-ground="night"
          {...stylex.props(
            styles.ground,
            styles.over,
            styles.night,
            styles.cut(percent(nightFrom), "0%")
          )}
        >
          <Screen ground="night" start={nightFrom} figure={figures.night} />
        </div>
        <div
          aria-hidden="true"
          data-ground-edge="soft"
          onPointerDown={hold}
          onPointerMove={drag("soft")}
          {...stylex.props(
            styles.edge,
            styles.edgeAt(percent(softFrom)),
            (softFrom <= 0 || softFrom >= 100) && styles.gone
          )}
        >
          <span {...stylex.props(styles.grip)} />
        </div>
        <div
          aria-hidden="true"
          data-ground-edge="night"
          onPointerDown={hold}
          onPointerMove={drag("night")}
          {...stylex.props(
            styles.edge,
            styles.edgeAt(percent(nightFrom)),
            (nightFrom <= 0 || nightFrom >= 100) && styles.gone
          )}
        >
          <span {...stylex.props(styles.grip)} />
        </div>
      </div>
      <div {...stylex.props(styles.foot)}>
        <Slider
          label="From night to paper"
          value={at}
          onValueChange={(value) => {
            setAt(typeof value === "number" ? value : (value[0] ?? 50));
          }}
          showValue={false}
        />
      </div>
    </div>
  );
}
