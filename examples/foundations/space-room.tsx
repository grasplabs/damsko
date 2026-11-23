"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";
import {
  colors,
  duration,
  font,
  media,
  radius,
  shadow,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Space, scene: room to breathe. A real approval card, and a switch that washes its padding and
// the room between its parts in soft mint, each band named by its step. The space is drawn as real
// elements, so what you see tinted is exactly the room the card keeps.
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const WASH = `color-mix(in oklab, ${colors.mint} 34%, ${colors.card})`;

const styles = stylex.create({
  stage: {
    display: "grid",
    justifyItems: "center",
    rowGap: space["8"],
    paddingBlock: space["10"],
    paddingInline: { default: space["8"], [media.maxSm]: space["4"] },
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "26rem",
    padding: space["6"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.sm,
    fontFamily: font.sans,
    transitionProperty: "background-color",
    transitionDuration: { default: duration.ui, [media.reducedMotion]: "0s" },
    transitionTimingFunction: duration.ease,
  },
  washed: { backgroundColor: WASH },
  // Each part stands on the card's own ground, so only the room around it shows the wash.
  part: { backgroundColor: colors.card },
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
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    columnGap: space["2"],
    position: "relative",
  },
  // A band of room, drawn as an element so it can carry its name.
  gap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  gap4: { height: space["4"] },
  gap6: { height: space["6"] },
  gap1: { height: space["1"] },
  // The title and the name of the band under it share a row: the title wraps before the name, so
  // the name stands on the wash beside the title's ground, never on it (it overprinted the title's
  // band at 1440 and the word "Finance" at 390). It stands on the row's foot, at the gap's top:
  // pulled down into the 4px gap, its "p" dipped onto the description's band under it.
  titleRow: {
    display: "flex",
    alignItems: "flex-end",
    columnGap: space["3"],
  },
  titleText: { flexGrow: 0, flexShrink: 1, minWidth: 0 },
  titleName: { display: "flex", flexShrink: 0, marginInlineStart: "auto" },
  name: {
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: 1,
    color: colors.foreground,
    whiteSpace: "nowrap",
    opacity: 0,
    transitionProperty: "opacity",
    transitionDuration: { default: duration.ui, [media.reducedMotion]: "0s" },
    transitionTimingFunction: duration.ease,
  },
  shown: { opacity: 1 },
  // The card's own padding, named where it is widest: above the badge.
  padTop: {
    position: "absolute",
    insetBlockStart: 0,
    insetInlineStart: space["6"],
    height: space["6"],
    display: "flex",
    alignItems: "center",
  },
  // The room between the two buttons, named over it: its name stands in the space-6 band above
  // the buttons, centred in it as space-6's own name is, so the two share one baseline.
  between: {
    position: "absolute",
    insetBlockEnd: "100%",
    insetInlineStart: "50%",
    height: space["6"],
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
  },
});

export default function SpaceRoom() {
  const [show, setShow] = useState(false);
  const name = (words: string) => (
    <span {...stylex.props(styles.name, show && styles.shown)}>{words}</span>
  );

  return (
    <div {...stylex.props(styles.stage)}>
      <Field orientation="horizontal">
        <FieldLabel>Show the space</FieldLabel>
        <Switch
          checked={show}
          onCheckedChange={(next) => {
            setShow(next);
          }}
        />
      </Field>
      <div {...stylex.props(styles.card, show && styles.washed)}>
        <span aria-hidden="true" {...stylex.props(styles.padTop)}>
          {name("space-6 all round")}
        </span>
        <div {...stylex.props(styles.part, styles.top)}>
          <Badge variant="warning">Waiting for you</Badge>
          <span {...stylex.props(styles.when)}>2 min ago</span>
        </div>
        <div aria-hidden="true" {...stylex.props(styles.gap, styles.gap4)}>
          {name("space-4")}
        </div>
        <div {...stylex.props(styles.titleRow)}>
          <p {...stylex.props(styles.part, styles.title, styles.titleText)}>
            Send the Q3 pipeline report to Finance
          </p>
          <span aria-hidden="true" {...stylex.props(styles.titleName)}>
            {name("space-1")}
          </span>
        </div>
        <div aria-hidden="true" {...stylex.props(styles.gap, styles.gap1)} />
        <p {...stylex.props(styles.part, styles.line)}>
          The reporting agent has drafted it from 214 deals. It goes to 6 people
          once you approve.
        </p>
        <div aria-hidden="true" {...stylex.props(styles.gap, styles.gap6)}>
          {name("space-6")}
        </div>
        <div {...stylex.props(styles.actions)}>
          <Button variant="outline">Not yet</Button>
          <Button variant="default">Approve</Button>
          <span aria-hidden="true" {...stylex.props(styles.between)}>
            {name("space-2")}
          </span>
        </div>
      </div>
    </div>
  );
}
