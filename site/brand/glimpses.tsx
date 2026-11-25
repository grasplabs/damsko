"use client";

import { BrainIcon, DownloadIcon, Icon } from "@grasp-os/ui/lib/icons";
import { colors, font, radius } from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// A glimpse of each room, small enough for a window: what the room is about, drawn in a few cells,
// with no words. The entrance shows them, so the rooms are seen before one is walked into. Each is
// decoration (aria-hidden): the link around it carries the room's name.
import * as stylex from "@stylexjs/stylex";

import type { RoomId } from "./content";
import { MarkInline } from "./exhibits";

const s = stylex.create({
  box: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    color: colors.primaryForegroundOnColor,
  },
  mark: {
    width: "46%",
    height: "auto",
    color: colors.primaryForegroundOnColor,
  },
  light: {
    position: "absolute",
    inset: "22% 16% 16%",
    borderRadius: radius.xs,
    cornerShape: radius.shape,
    backgroundImage: `linear-gradient(90deg, ${colors.brandPaper} 0 14.3%, ${colors.brandLime} 14.3% 28.6%, ${colors.brandSea} 28.6% 42.9%, ${colors.brandMint} 42.9% 57.1%, ${colors.brandPine} 57.1% 71.4%, ${colors.brandInk} 71.4% 85.7%, ${colors.brandNight} 85.7%)`,
  },
  serif: {
    fontFamily: font.serif,
    fontSize: "clamp(1.25rem, 3.4vw, 2.25rem)",
    lineHeight: 1,
    color: colors.primaryForegroundOnColor,
  },
  quote: {
    fontFamily: font.serif,
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    lineHeight: 0.6,
    color: colors.brandMint,
    transform: "translateY(18%)",
  },
  dither: {
    position: "absolute",
    inset: "18%",
    backgroundColor: colors.brandMint,
    // Half the cells lit: resolve.ts, ditherTile(8), written out (StyleX takes static values).
    maskImage: `url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'4'%20height%3D'4'%20shape-rendering%3D'crispEdges'%3E%3Crect%20x%3D'0'%20y%3D'0'%20width%3D'1'%20height%3D'1'%2F%3E%3Crect%20x%3D'2'%20y%3D'0'%20width%3D'1'%20height%3D'1'%2F%3E%3Crect%20x%3D'1'%20y%3D'1'%20width%3D'1'%20height%3D'1'%2F%3E%3Crect%20x%3D'3'%20y%3D'1'%20width%3D'1'%20height%3D'1'%2F%3E%3Crect%20x%3D'0'%20y%3D'2'%20width%3D'1'%20height%3D'1'%2F%3E%3Crect%20x%3D'2'%20y%3D'2'%20width%3D'1'%20height%3D'1'%2F%3E%3Crect%20x%3D'1'%20y%3D'3'%20width%3D'1'%20height%3D'1'%2F%3E%3Crect%20x%3D'3'%20y%3D'3'%20width%3D'1'%20height%3D'1'%2F%3E%3C%2Fsvg%3E")`,
    maskSize: "8px 8px",
  },
  svg: { width: "70%", height: "70%", overflow: "visible" },
  stroke: {
    fill: "none",
    stroke: colors.brandMint,
    strokeWidth: 2,
    strokeLinecap: "round",
    vectorEffect: "non-scaling-stroke",
  },
  faint: {
    fill: "none",
    stroke: `color-mix(in oklch, ${colors.primaryForegroundOnColor} 30%, transparent)`,
    strokeWidth: 1,
    vectorEffect: "non-scaling-stroke",
  },
  cell: { fill: colors.brandMint },
  stem: { fill: colors.brandSea },
  petal: { fill: colors.brandLime },
  tiles: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 3,
    width: "44%",
    aspectRatio: "1",
  },
  tile: (tone: string) => ({
    backgroundColor: tone,
    borderRadius: radius.xs,
    cornerShape: radius.shape,
  }),
  icon: {
    display: "grid",
    [iconVars.size]: "clamp(1.5rem, 3.4vw, 2.25rem)",
    color: colors.brandMint,
  },
  columns: {
    display: "grid",
    gridTemplateColumns: "1fr 4fr 1fr",
    width: "64%",
    height: "62%",
  },
  gutter: {
    backgroundColor: `color-mix(in oklch, ${colors.brandMint} 22%, transparent)`,
  },
  column: {
    display: "grid",
    alignContent: "start",
    gap: 4,
    paddingBlock: "14%",
    paddingInline: "10%",
  },
  bar: (width: string) => ({
    width,
    height: 3,
    borderRadius: radius.xs,
    cornerShape: radius.shape,
    backgroundColor: `color-mix(in oklch, ${colors.primaryForegroundOnColor} 70%, transparent)`,
  }),
  pill: {
    display: "flex",
    alignItems: "center",
    justifyContent: "end",
    gap: 3,
    width: "70%",
    height: "26%",
    paddingInline: "6%",
    borderRadius: radius.full,
    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${colors.primaryForegroundOnColor} 40%, transparent)`,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.brandMint,
  },
  card: {
    display: "grid",
    alignContent: "end",
    gap: 4,
    width: "56%",
    height: "64%",
    padding: "8%",
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: colors.brandPaper,
  },
  cardBar: (width: string) => ({
    width,
    height: 3,
    borderRadius: radius.xs,
    cornerShape: radius.shape,
    backgroundColor: colors.brandInk,
  }),
});

const stephen = [
  colors.mintDeep,
  colors.brandMint,
  colors.brandSea,
  colors.brandLime,
  colors.brandMint,
  colors.mintDeep,
  colors.brandSea,
  colors.brandLime,
  colors.brandMint,
];

/** A seed grown into a flower: the meadow of room 01, in cells. */
const Flower = () => (
  <svg viewBox="0 0 12 12" {...stylex.props(s.svg)} shapeRendering="crispEdges">
    <rect x="5.5" y="5" width="1" height="6" {...stylex.props(s.stem)} />
    <rect x="4.5" y="7" width="1" height="1" {...stylex.props(s.stem)} />
    <rect x="6.5" y="8" width="1" height="1" {...stylex.props(s.stem)} />
    <rect x="5.5" y="2" width="1" height="1" {...stylex.props(s.petal)} />
    <rect x="4.5" y="3" width="1" height="1" {...stylex.props(s.petal)} />
    <rect x="6.5" y="3" width="1" height="1" {...stylex.props(s.petal)} />
    <rect x="5.5" y="4" width="1" height="1" {...stylex.props(s.petal)} />
    <rect x="5.5" y="3" width="1" height="1" {...stylex.props(s.cell)} />
    <rect x="1" y="11" width="10" height="1" {...stylex.props(s.cell)} />
  </svg>
);

/** The brand's ease, drawn. */
const Ease = () => (
  <svg viewBox="0 0 100 100" {...stylex.props(s.svg)}>
    <path d="M0 100 L100 100 M0 100 L0 0" {...stylex.props(s.faint)} />
    <path d="M0 100 C22 0 36 0 100 0" {...stylex.props(s.stroke)} />
  </svg>
);

export const Glimpse = ({ room }: { room: RoomId }) => (
  <span aria-hidden="true" {...stylex.props(s.box)}>
    {room === "grasp" && <Flower />}
    {room === "names" && (
      <span {...stylex.props(s.tiles)}>
        {stephen.map((tone, index) => (
          <span key={index} {...stylex.props(s.tile(tone))} />
        ))}
      </span>
    )}
    {room === "logo" && <MarkInline style={s.mark} />}
    {room === "colour" && <span {...stylex.props(s.light)} />}
    {room === "type" && <span {...stylex.props(s.serif)}>Aa</span>}
    {room === "voice" && <span {...stylex.props(s.quote)}>“</span>}
    {room === "visual-language" && <span {...stylex.props(s.dither)} />}
    {room === "motion" && <Ease />}
    {room === "icons" && (
      <span {...stylex.props(s.icon)}>
        <Icon icon={BrainIcon} />
      </span>
    )}
    {room === "layout" && (
      <span {...stylex.props(s.columns)}>
        <span {...stylex.props(s.gutter)} />
        <span {...stylex.props(s.column)}>
          <span {...stylex.props(s.bar("70%"))} />
          <span {...stylex.props(s.bar("100%"))} />
          <span {...stylex.props(s.bar("86%"))} />
        </span>
        <span {...stylex.props(s.gutter)} />
      </span>
    )}
    {room === "product" && (
      <span {...stylex.props(s.pill)}>
        <span {...stylex.props(s.dot)} />
        <span {...stylex.props(s.dot)} />
        <span {...stylex.props(s.dot)} />
      </span>
    )}
    {room === "applications" && (
      <span {...stylex.props(s.card)}>
        <span {...stylex.props(s.cardBar("80%"))} />
        <span {...stylex.props(s.cardBar("56%"))} />
      </span>
    )}
    {room === "downloads" && (
      <span {...stylex.props(s.icon)}>
        <Icon icon={DownloadIcon} />
      </span>
    )}
  </span>
);
