"use client";

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
// Corners, scene: the squircle. One corner, drawn six times its size so the curve can be seen.
// The dashed line is a plain round corner: an arc that turns at once where it meets the edge. The
// solid line is Grasp's squircle: the curve eases into the edge, so there is no seam. Choose one
// to fill; the outlines of both stay, laid over each other.
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

// Six times the one corner: the shape of a squircle does not change with its size, so this is the
// 20px corner of every card, magnified.
const BIG = `calc(${radius.xl} * 6)`;

const styles = stylex.create({
  stage: {
    display: "grid",
    justifyItems: "center",
    rowGap: space["8"],
    paddingBlock: space["10"],
    paddingInline: { default: space["8"], [media.maxSm]: space["4"] },
  },
  tile: {
    position: "relative",
    width: "100%",
    maxWidth: `calc(${radius.xl} * 20)`,
    aspectRatio: "3 / 2",
  },
  shape: {
    position: "absolute",
    inset: 0,
    borderRadius: BIG,
    cornerShape: radius.shape,
  },
  fill: {
    backgroundColor: `color-mix(in oklab, ${colors.mint} 30%, ${colors.card})`,
    boxShadow: shadow.sm,
    transitionProperty: "corner-shape",
    transitionDuration: { default: duration.ui, [media.reducedMotion]: "0s" },
    transitionTimingFunction: duration.ease,
  },
  round: { cornerShape: "round" },
  squircle: { cornerShape: radius.shape },
  dashed: {
    borderWidth: size.hairline,
    borderStyle: "dashed",
    borderColor: colors.mutedForeground,
    cornerShape: "round",
  },
  solid: {
    borderWidth: `calc(${size.hairline} * 2)`,
    borderStyle: "solid",
    borderColor: colors.mintDeep,
  },
  // Inside the tile, a real card's words, so the magnified corner reads as a part.
  words: {
    position: "absolute",
    insetInline: { default: space["10"], [media.maxSm]: space["6"] },
    insetBlockStart: "50%",
    transform: "translateY(-50%)",
    display: "grid",
    rowGap: space["1"],
    fontFamily: font.sans,
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
  },
  key: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: space["8"],
    rowGap: space["3"],
    margin: 0,
    padding: 0,
    listStyle: "none",
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
  item: { display: "flex", alignItems: "center", gap: space["2"] },
  swatch: {
    width: space["6"],
    height: 0,
    borderTopWidth: `calc(${size.hairline} * 2)`,
  },
  swatchDashed: {
    borderTopStyle: "dashed",
    borderTopColor: colors.mutedForeground,
    borderTopWidth: size.hairline,
  },
  swatchSolid: { borderTopStyle: "solid", borderTopColor: colors.mintDeep },
});

type Shape = "squircle" | "round";

export default function CornersSquircle() {
  const [shape, setShape] = useState<Shape>("squircle");

  return (
    <div {...stylex.props(styles.stage)}>
      <Tabs
        value={shape}
        onValueChange={(value) => value && setShape(value as Shape)}
      >
        <TabsList variant="default" aria-label="Corner to fill">
          <TabsTrigger value="squircle">Squircle</TabsTrigger>
          <TabsTrigger value="round">Round</TabsTrigger>
        </TabsList>
      </Tabs>
      <div {...stylex.props(styles.tile)}>
        <div
          aria-hidden="true"
          {...stylex.props(styles.shape, styles.fill, styles[shape])}
        />
        <div
          aria-hidden="true"
          {...stylex.props(styles.shape, styles.dashed)}
        />
        <div aria-hidden="true" {...stylex.props(styles.shape, styles.solid)} />
        <div {...stylex.props(styles.words)}>
          <p {...stylex.props(styles.title)}>Weekly digest</p>
          <p {...stylex.props(styles.line)}>Ready every Monday at 08:00.</p>
        </div>
      </div>
      <ul {...stylex.props(styles.key)}>
        <li {...stylex.props(styles.item)}>
          <span
            aria-hidden="true"
            {...stylex.props(styles.swatch, styles.swatchDashed)}
          />
          Round, a seam at the edge
        </li>
        <li {...stylex.props(styles.item)}>
          <span
            aria-hidden="true"
            {...stylex.props(styles.swatch, styles.swatchSolid)}
          />
          Squircle, no seam
        </li>
      </ul>
    </div>
  );
}
