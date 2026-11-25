"use client";

import { Button } from "@grasp-os/ui/components/button";
import { DownloadIcon, Icon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  duration,
  font,
  media,
  radius,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Take B on arriving at the brand book, kept as a page (/brand/entrance-b) and not linked: the
// meadow grows at the foot of a building whose windows are the rooms; the name resolves above it,
// then its lights come on through the dither, floor by floor from the ground, and the door is the
// way in. Take A became the entrance at /brand (entrance.tsx), whose parts it shares.
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { siteColors, siteSize } from "../system/site-tokens.stylex";
import {
  entranceWords,
  frameWords,
  logoWords,
  openRooms,
  roomHref,
  rooms,
} from "./content";
import type { RoomId } from "./content";
import { all, useArrival } from "./entrance";
import { LogoImg } from "./exhibits";
import { Controls } from "./frame";
import { Glimpse } from "./glimpses";
import { Meadow } from "./meadow";
import { coarse, fine } from "./resolve";

const s = stylex.create({
  focusRing: {
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.brandMint}`,
    },
    outlineOffset: 3,
  },
  page: {
    position: "relative",
    minHeight: "100svh",
    backgroundColor: colors.brandNight,
    fontFamily: font.sans,
  },
  hall: {
    position: "relative",
    isolation: "isolate",
    overflow: "hidden",
    colorScheme: "dark",
    backgroundColor: colors.brandNight,
    color: colors.bodyForeground,
  },
  logo: { width: { default: "9.5rem", [media.maxSm]: "7.5rem" } },
  title: {
    margin: 0,
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    letterSpacing: font.trackingTitle,
    color: colors.primaryForegroundOnColor,
  },
  line: {
    margin: 0,
    maxWidth: "30rem",
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
    color: colors.bodyForeground,
  },
  rooms: { width: "100%", display: "grid", justifyItems: "center" },
  focusRingWindow: {
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.brandMint}`,
    },
    outlineOffset: 3,
  },
  // A room's window: a glimpse of it behind reeded glass.
  window: {
    position: "relative",
    display: "block",
    aspectRatio: "1",
    overflow: "hidden",
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: colors.brandInk,
    boxShadow: {
      default: `inset 0 0 0 1px color-mix(in oklch, ${colors.brandMint} 22%, transparent)`,
      ":hover": `inset 0 0 0 1px ${colors.brandMint}, 0 0 24px color-mix(in oklch, ${colors.brandMint} 30%, transparent)`,
    },
    transitionProperty: "box-shadow",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  // The glimpse stands below the window's number.
  view: {
    position: "absolute",
    insetBlock: "16px 0",
    insetInline: 0,
    display: "grid",
  },
  reeds: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: siteColors.flutes,
    backgroundSize: siteSize.flutesSize,
    mixBlendMode: "soft-light",
    opacity: 0.7,
  },
  number: {
    position: "absolute",
    insetBlockStart: 4,
    insetInlineStart: 6,
    fontFamily: font.mono,
    fontSize: 10,
    lineHeight: "12px",
    color: `color-mix(in oklch, ${colors.primaryForegroundOnColor} 70%, transparent)`,
  },
  hidden: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
  // ---- B, the building
  bHall: {
    position: "relative",
    display: "grid",
    gridTemplateRows: "1fr auto 22%",
    justifyItems: "center",
    minHeight: "100svh",
    paddingInline: { default: space["8"], [media.maxSm]: space["4"] },
  },
  bGround: { position: "absolute", inset: 0, zIndex: -1 },
  bSign: {
    display: "grid",
    alignContent: "end",
    justifyItems: "center",
    gap: space["3"],
    paddingBlock: { default: space["8"], [media.maxSm]: space["5"] },
    textAlign: "center",
  },
  bBuilding: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(5, minmax(0, 1fr))",
      [media.maxSm]: "repeat(4, minmax(0, 1fr))",
    },
    gap: { default: space["3"], [media.maxSm]: space["2"] },
    width: { default: "min(34rem, 100%)", [media.maxSm]: "100%" },
    margin: 0,
    marginBlockEnd: -6,
    paddingBlock: { default: space["5"], [media.maxSm]: space["3"] },
    paddingInline: { default: space["5"], [media.maxSm]: space["3"] },
    listStyle: "none",
    borderStartStartRadius: radius.sm,
    borderStartEndRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: `color-mix(in oklch, ${colors.brandInk} 92%, ${colors.brandNight})`,
    boxShadow: `inset 0 1px 0 color-mix(in oklch, ${colors.brandMint} 30%, transparent), 0 -24px 60px color-mix(in oklch, ${colors.brandNight} 70%, transparent)`,
  },
  doorCell: {
    gridColumn: { default: "span 2", [media.maxSm]: "span 3" },
    display: "grid",
  },
  door: {
    display: "grid",
    placeItems: "center",
    alignSelf: "stretch",
    borderStartStartRadius: radius.full,
    borderStartEndRadius: radius.full,
    backgroundImage: `linear-gradient(180deg, ${colors.brandMint}, ${colors.brandSea})`,
    color: colors.brandInk,
    fontWeight: font.weightMedium,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    textDecoration: "none",
    boxShadow: {
      default: `0 0 0 0 transparent`,
      ":hover": `0 0 32px color-mix(in oklch, ${colors.brandMint} 50%, transparent)`,
    },
    transitionProperty: "box-shadow",
    transitionDuration: duration.hover,
  },
  doorWords: {
    display: "flex",
    alignItems: "center",
    gap: space["1"],
    paddingBlockStart: "18%",
  },
  bDownload: {
    position: "absolute",
    insetBlockEnd: space["4"],
    insetInlineEnd: space["4"],
  },
});

/** A room's window: its glimpse behind reeds; the name for who can't see it. */
const RoomWindow = ({
  id,
  number,
  title,
  onShow,
}: {
  id: RoomId;
  number: string;
  title: string;
  onShow: (words: string) => void;
}) => (
  <a
    href={roomHref(id)}
    title={`${number} ${title}`}
    onPointerEnter={() => {
      onShow(`${number}  ${title}`);
    }}
    onPointerLeave={() => {
      onShow("");
    }}
    onFocus={() => {
      onShow(`${number}  ${title}`);
    }}
    onBlur={() => {
      onShow("");
    }}
    {...stylex.props(s.window, s.focusRingWindow)}
  >
    <span {...stylex.props(s.view)}>
      <Glimpse room={id} />
    </span>
    <span aria-hidden="true" {...stylex.props(s.reeds)} />
    <span aria-hidden="true" {...stylex.props(s.number)}>
      {number}
    </span>
    <span {...stylex.props(s.hidden)}>
      {number} {title}
    </span>
  </a>
);

/** Take B: the building in the meadow. */
export const TakeB = () => {
  const first = openRooms[0];
  const [shown, setShown] = useState("");
  const columns = () => (matchMedia("(width < 40rem)").matches ? 4 : 5);
  const { root } = useArrival((element) => {
    const windows = all(element, "room");
    const per = columns();
    const floors = Math.ceil((windows.length + (per === 4 ? 3 : 2)) / per);
    return [
      ...all(element, "building").map((part) => ({
        element: part,
        delay: 0,
        duration: 700,
        cells: coarse,
      })),
      // The lights come on from the ground floor up, left to right on each floor.
      ...windows.map((part, index) => {
        const floor = Math.floor(index / per);
        const fromGround = floors - 1 - floor;
        return {
          element: part,
          delay: 600 + fromGround * 340 + (index % per) * 60,
          duration: 460,
          cells: fine,
        };
      }),
      ...all(element, "door").map((part) => ({
        element: part,
        delay: 520,
        duration: 520,
        cells: fine,
      })),
      ...all(element, "logo").map((part) => ({
        element: part,
        delay: 1500,
        duration: 640,
        cells: coarse,
      })),
      ...all(element, "title").map((part) => ({
        element: part,
        delay: 1640,
        duration: 720,
        cells: coarse,
      })),
      ...all(element, "line").map((part) => ({
        element: part,
        delay: 1980,
        duration: 520,
        cells: fine,
      })),
      ...all(element, "ways").map((part) => ({
        element: part,
        delay: 2200,
        duration: 480,
        cells: fine,
      })),
    ];
  });
  return (
    <div data-brand-entrance="" {...stylex.props(s.page)}>
      <Controls here="entrance" />
      <div ref={root} data-arriving="" {...stylex.props(s.hall)}>
        <div {...stylex.props(s.bGround)}>
          <Meadow words={false} />
        </div>
        <div {...stylex.props(s.bHall)}>
          <div {...stylex.props(s.bSign)}>
            <span data-resolve="logo">
              <LogoImg
                id="logo-white"
                width={152}
                alt={logoWords.alt}
                style={s.logo}
              />
            </span>
            <h1 data-resolve="title" {...stylex.props(s.title)}>
              {entranceWords.title}
            </h1>
            <p data-resolve="line" {...stylex.props(s.line)}>
              {shown === "" ? entranceWords.line : shown}
            </p>
          </div>
          <nav aria-label={frameWords.rooms} {...stylex.props(s.rooms)}>
            <ol data-resolve="building" {...stylex.props(s.bBuilding)}>
              {rooms.map((room) => (
                <li key={room.id} data-resolve="room">
                  <RoomWindow
                    id={room.id}
                    number={room.number}
                    title={room.title}
                    onShow={setShown}
                  />
                </li>
              ))}
              {first && (
                <li data-resolve="door" {...stylex.props(s.doorCell)}>
                  <a
                    href={roomHref(first.id)}
                    {...stylex.props(s.door, s.focusRing)}
                  >
                    <span {...stylex.props(s.doorWords)}>
                      {entranceWords.enter}
                    </span>
                  </a>
                </li>
              )}
            </ol>
          </nav>
          <span />
        </div>
        <div data-resolve="ways" {...stylex.props(s.bDownload)}>
          <Button variant="ghost" size="sm" asChild>
            <a href={entranceWords.bookHref} download={entranceWords.bookFile}>
              <Icon icon={DownloadIcon} />
              {entranceWords.download}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
