"use client";

import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Button } from "@grasp-os/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@grasp-os/ui/components/tabs";
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
// Corners, scene: corners nest. A panel holds a card in its top corners, a few pixels in, and the card's corner is the
// panel's less that room (space-3), so both curves turn round the same point and the gap between them stays
// even all the way round. The room is washed in mint: switch to the same corner on both and it swells at the turn.
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

// The room between the panel's edge and the card, washed in mint as on the Space page: drawn as the
// card's own spread shadow and clipped by the panel, so it shows exactly where the two corners
// leave room. Even when they nest; swollen at the turn when they do not.
const WASH = `color-mix(in oklab, ${colors.mint} 34%, transparent)`;

const styles = stylex.create({
  stage: {
    display: "grid",
    justifyItems: "center",
    rowGap: space["8"],
    paddingBlock: space["10"],
    paddingInline: { default: space["8"], [media.maxSm]: space["4"] },
  },
  panel: {
    display: "grid",
    rowGap: space["3"],
    width: "100%",
    maxWidth: "26rem",
    padding: space["3"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.md,
    overflow: "clip",
    fontFamily: font.sans,
  },
  head: {
    display: "grid",
    rowGap: space["1"],
    paddingInline: space["2"],
    paddingTop: space["1"],
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
  card: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    minWidth: 0,
    paddingInline: space["4"],
    paddingBlock: space["6"],
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    boxShadow: `${size.borderStrong}, 0 0 0 ${space["3"]} ${WASH}`,
    transitionProperty: "border-radius",
    transitionDuration: { default: duration.ui, [media.reducedMotion]: "0s" },
    transitionTimingFunction: duration.ease,
  },
  // The panel's corner less the room between them: the two curves share a centre.
  nested: { borderRadius: `calc(${radius.xl} - ${space["3"]})` },
  same: { borderRadius: radius.xl },
  file: { display: "grid", minWidth: 0 },
  name: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  by: {
    margin: 0,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: space["2"],
    paddingTop: space["1"],
  },
  sum: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});

type Fit = "nested" | "same";

export default function CornersNest() {
  const [fit, setFit] = useState<Fit>("nested");

  return (
    <div {...stylex.props(styles.stage)}>
      <Tabs
        value={fit}
        onValueChange={(value) => value && setFit(value as Fit)}
      >
        <TabsList variant="default" aria-label="Inner corner">
          <TabsTrigger value="nested">Nested</TabsTrigger>
          <TabsTrigger value="same">Same corner</TabsTrigger>
        </TabsList>
      </Tabs>
      <div {...stylex.props(styles.panel)}>
        <div {...stylex.props(styles.card, styles[fit])}>
          <Avatar size="sm" name="Maya Okafor">
            <AvatarFallback />
          </Avatar>
          <div {...stylex.props(styles.file)}>
            <p {...stylex.props(styles.name)}>Q3 pipeline review</p>
            <p {...stylex.props(styles.by)}>Drafted for Maya Okafor</p>
          </div>
        </div>
        <div {...stylex.props(styles.head)}>
          <p {...stylex.props(styles.title)}>Share this report?</p>
          <p {...stylex.props(styles.line)}>
            The reporting agent will send it to Finance with a short summary.
          </p>
        </div>
        <div {...stylex.props(styles.actions)}>
          <Button variant="outline">Cancel</Button>
          <Button variant="default">Share</Button>
        </div>
      </div>
      <p {...stylex.props(styles.sum)}>
        {fit === "nested" ? "corner − space-3 = 8" : "corner on both = 20"}
      </p>
    </div>
  );
}
