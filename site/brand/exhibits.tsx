"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Slider } from "@grasp-os/ui/components/slider";
import { Snippet } from "@grasp-os/ui/components/snippet";
import { Textarea } from "@grasp-os/ui/components/textarea";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  Icon,
  XIcon,
} from "@grasp-os/ui/lib/icons";
import { visuallyHidden } from "@grasp-os/ui/lib/styles";
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
// The brand book's exhibits: each the one thing on its wall. The logo under the glass, its clear
// space drawn to its own bar, its sizes set by hand, the mark as the app wears it; the light as one
// strip of reeded glass; every pair that carries words, measured as drawn; the voice as a statement
// that lands in three beats, its principles, two sheets side by side and a sheet that checks a
// sentence. Every colour a token, every word from content.ts.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";

import { asRatio, measurer } from "../../examples/foundations/contrast";
import logoInk from "../../public/brand/grasp-logo-ink.svg?raw";
import logoWhite from "../../public/brand/grasp-logo-white.svg?raw";
import markInk from "../../public/brand/grasp-mark-ink.svg?raw";
import markWhite from "../../public/brand/grasp-mark-white.svg?raw";
import { token } from "../blocks/token-data";
import { siteColors, siteSize } from "../system/site-tokens.stylex";
import { copyLater } from "./clipboard";
import {
  colourWords,
  fileOf,
  houseRules,
  logoBox,
  logoWords,
  pairs,
  principles,
  rewrite,
  statement,
  stops,
  voiceWords,
} from "./content";
import type { LogoFile, Stop } from "./content";
import { Glass } from "./glass";
import { HallStill } from "./hall-still";
import { useStill } from "./still";

/** A stop's colour, by its token. */
export const stopColour: Record<Stop["id"], string> = {
  paper: colors.brandPaper,
  lime: colors.brandLime,
  sea: colors.brandSea,
  mint: colors.brandMint,
  pine: colors.brandPine,
  ink: colors.brandInk,
  night: colors.brandNight,
};

const nameOf = (id: Stop["id"]) =>
  stops.find((stop) => stop.id === id)?.name ?? id;

const s = stylex.create({
  fill: (colour: string) => ({ backgroundColor: colour }),
  ink: (colour: string) => ({ color: colour }),
  img: {
    display: "block",
    flexShrink: 0,
    maxWidth: "none",
    userSelect: "none",
  },
  size: (width: number, ratio: number) => ({
    width: `${width}px`,
    aspectRatio: ratio,
  }),
  onWide: { display: { default: "contents", [media.maxSm]: "none" } },
  onPhone: { display: { default: "none", [media.maxSm]: "contents" } },
  // ---- Under the glass
  stage: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    height: "100%",
    padding: space["8"],
  },
  glassLogo: {
    width: { default: "min(26rem, 52%)", [media.maxSm]: "62%" },
  },
  // ---- Clear space
  clear: {
    margin: 0,
    display: "grid",
    justifyItems: "center",
    gap: space["4"],
  },
  zone: (pad: number) => ({
    position: "relative",
    padding: `${pad}px`,
    backgroundColor: `color-mix(in oklch, ${colors.mintDeep} 9%, transparent)`,
    boxShadow: `inset 0 0 0 ${size.hairline} color-mix(in oklch, ${colors.mintDeep} 45%, transparent)`,
  }),
  box: {
    outlineWidth: size.hairline,
    outlineStyle: "dashed",
    outlineColor: `color-mix(in oklch, ${colors.mintDeep} 70%, transparent)`,
  },
  bars: (pad: number) => ({
    position: "absolute",
    display: "grid",
    gridTemplateRows: "1fr 1fr",
    gap: 1,
    width: `${pad}px`,
    height: `${pad}px`,
  }),
  barsStart: { insetBlockStart: 0, insetInlineStart: 0 },
  barsEnd: { insetBlockEnd: 0, insetInlineEnd: 0 },
  bar: {
    backgroundColor: `color-mix(in oklch, ${colors.mintDeep} 55%, transparent)`,
  },
  legend: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.brandPine,
  },
  legendBar: (height: number) => ({
    width: `${height * 2}px`,
    height: `${height}px`,
    backgroundColor: `color-mix(in oklch, ${colors.mintDeep} 55%, transparent)`,
  }),
  // ---- Sizes
  sizer: {
    display: "grid",
    alignContent: "center",
    gap: space["8"],
    width: "100%",
    padding: { default: space["10"], [media.maxSm]: space["4"] },
  },
  sizeShow: { display: "grid", placeItems: "center", minHeight: "8rem" },
  sizeControl: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: "26rem",
    justifySelf: "center",
  },
  sizesStill: {
    display: "flex",
    alignItems: "flex-end",
    gap: space["10"],
    padding: space["8"],
  },
  sizeStill: {
    display: "grid",
    justifyItems: "center",
    gap: space["3"],
    margin: 0,
  },
  sizeState: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.brandInk,
  },
  good: { flexShrink: 0, color: colors.success },
  bad: { flexShrink: 0, color: colors.destructive },
  // ---- The mark as the app wears it
  marks: {
    display: "flex",
    alignItems: "flex-end",
    gap: { default: space["10"], [media.maxSm]: space["5"] },
    padding: space["8"],
  },
  tile: (size: number) => ({
    display: "grid",
    placeItems: "center",
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${Math.round(size / 4)}px`,
    cornerShape: radius.shape,
    backgroundColor: colors.brandNight,
  }),
  tileMark: { width: "62%" },
  // ---- The light
  // Each stop holds its own colour for a short stretch around the middle of its seventh, where its
  // words stand, and the light flows between: so every word keeps 4.5:1 on its own stop.
  light: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(7, minmax(0, 1fr))",
      [media.maxMd]: "1fr",
    },
    width: "100%",
    height: "100%",
    // The light starts at the top of its room: its words stand clear of the two controls there.
    paddingBlockStart: { default: "4.5rem", [media.maxMd]: "4.25rem" },
    overflow: "hidden",
    // On a phone the light runs top to bottom: it is drawn over the rows only (not the room left
    // for the controls above them), so each row stands on its own stop; paper above it.
    backgroundOrigin: {
      default: "padding-box",
      [media.maxMd]: "content-box",
    },
    backgroundRepeat: "no-repeat",
    backgroundColor: {
      default: "transparent",
      [media.maxMd]: colors.brandPaper,
    },
    backgroundImage: {
      default: `linear-gradient(90deg in oklch, ${colors.brandPaper} 4.14% 10.14%, ${colors.brandLime} 18.43% 24.43%, ${colors.brandSea} 32.71% 38.71%, ${colors.brandMint} 47% 53%, ${colors.brandPine} 61.29% 67.29%, ${colors.brandInk} 75.57% 81.57%, ${colors.brandNight} 89.86% 95.86%)`,
      [media.maxMd]: `linear-gradient(180deg in oklch, ${colors.brandPaper} 4.14% 10.14%, ${colors.brandLime} 18.43% 24.43%, ${colors.brandSea} 32.71% 38.71%, ${colors.brandMint} 47% 53%, ${colors.brandPine} 61.29% 67.29%, ${colors.brandInk} 75.57% 81.57%, ${colors.brandNight} 89.86% 95.86%)`,
    },
  },
  lightReeds: {
    position: "absolute",
    insetBlock: 0,
    insetInline: -96,
    backgroundImage: siteColors.flutes,
    backgroundSize: siteSize.flutesSize,
    mixBlendMode: "soft-light",
    pointerEvents: "none",
  },
  stop: {
    position: "relative",
    colorScheme: "light",
    display: "grid",
    gridTemplateRows: {
      default: "auto auto 1fr auto",
      [media.maxMd]: "auto auto",
    },
    gridTemplateColumns: { default: "1fr", [media.maxMd]: "1fr auto" },
    gridTemplateAreas: {
      default: '"name" "role" "." "foot"',
      [media.maxMd]: '"name foot" "role foot"',
    },
    alignItems: { default: "start", [media.maxMd]: "center" },
    // The words stand at the middle of their seventh, where the light is the stop's own colour
    // (the website's rule), so they hold their contrast where two stops blend.
    justifyItems: { default: "center", [media.maxMd]: "stretch" },
    textAlign: { default: "center", [media.maxMd]: "start" },
    gap: space["1"],
    paddingBlock: { default: space["8"], [media.maxMd]: space["3"] },
    paddingInline: { default: space["4"], [media.maxMd]: space["4"] },
    color: colors.brandInk,
  },
  stopDark: { color: colors.primaryForegroundOnColor, colorScheme: "dark" },
  stopName: {
    gridArea: "name",
    fontFamily: font.serif,
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
  },
  stopRole: {
    gridArea: "role",
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  stopFoot: {
    gridArea: "foot",
    display: "flex",
    alignItems: "center",
    gap: space["1"],
    alignSelf: { default: "end", [media.maxMd]: "center" },
  },
  // ---- Pairs
  pairs: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(4, minmax(0, 1fr))",
      [media.maxMd]: "repeat(2, minmax(0, 1fr))",
    },
    gap: space["4"],
    width: "100%",
    maxWidth: "56rem",
    padding: { default: space["10"], [media.maxSm]: space["4"] },
  },
  pair: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    aspectRatio: "1",
    padding: space["4"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}`,
  },
  pairSample: {
    alignSelf: "center",
    justifySelf: "center",
    fontFamily: font.serif,
    fontSize: { default: font.headingXl, [media.maxSm]: font.headingLg },
    lineHeight: 1,
  },
  pairFoot: {
    display: "flex",
    flexDirection: { default: "row", [media.maxSm]: "column" },
    justifyContent: "space-between",
    alignItems: { default: "baseline", [media.maxSm]: "flex-start" },
    gap: { default: space["2"], [media.maxSm]: 0 },
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  ratio: { fontFamily: font.mono, fontVariantNumeric: "tabular-nums" },
  // ---- Voice
  stillHall: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    padding: space["8"],
  },
  statement: {
    margin: 0,
    maxWidth: "17em",
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    letterSpacing: font.trackingTitle,
    textAlign: "center",
    textWrap: "balance",
  },
  word: {
    display: "inline-block",
    color: siteColors.subtleForegroundLarge,
    // With no script the statement is simply there; with one it arrives in its three beats.
    opacity: { default: 0.01, [media.noScript]: 1 },
    transform: { default: "translateY(6px)", [media.noScript]: "none" },
    transitionProperty: "opacity, transform, color",
    transitionDuration: duration.ui,
    transitionTimingFunction: duration.ease,
  },
  wordIn: { opacity: 1, transform: "none" },
  wordKey: { color: colors.mint },
  wordLead: { color: colors.foreground },
  delay: (ms: number) => ({ transitionDelay: `${ms}ms` }),
  principles: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [media.maxSm]: "1fr",
    },
    gap: { default: space["12"], [media.maxSm]: space["8"] },
    width: "100%",
    maxWidth: "50rem",
    margin: 0,
    padding: { default: space["10"], [media.maxSm]: space["4"] },
    listStyle: "none",
  },
  principle: { display: "grid", gap: space["3"], alignContent: "start" },
  principleTitle: {
    fontFamily: font.serif,
    fontSize: font.headingLg,
    lineHeight: font.headingLgLine,
    letterSpacing: font.trackingTitle,
    color: colors.foreground,
  },
  principleExample: {
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
    color: colors.bodyForeground,
  },
  sheets: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 20rem))",
      [media.maxSm]: "minmax(0, 1fr)",
    },
    gap: { default: space["8"], [media.maxSm]: space["5"] },
    justifyContent: "center",
    width: "100%",
    padding: { default: space["10"], [media.maxSm]: space["5"] },
  },
  sheet: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gap: space["6"],
    minHeight: { default: "22rem", [media.maxSm]: "12rem" },
    padding: space["6"],
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: colors.brandPaper,
    color: colors.brandInk,
    boxShadow: shadow.lg,
  },
  sheetLeft: {
    transform: { default: "rotate(-1.5deg)", [media.maxSm]: "none" },
  },
  sheetRight: {
    transform: {
      default: "rotate(1deg) translateY(1.5rem)",
      [media.maxSm]: "none",
    },
  },
  sheetLabel: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.brandPine,
  },
  sheetWords: {
    margin: 0,
    fontFamily: font.serif,
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
    letterSpacing: font.trackingTitle,
    textDecorationLine: "none",
  },
  struck: {
    color: `color-mix(in oklch, ${colors.brandInk} 55%, transparent)`,
    textDecorationLine: "line-through",
    textDecorationThickness: "2px",
    textDecorationColor: colors.brandInk,
  },
  checker: {
    display: "grid",
    gap: space["4"],
    width: "100%",
    maxWidth: "36rem",
    padding: { default: space["8"], [media.maxSm]: space["5"] },
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.md,
    colorScheme: "light",
  },
  checkerStill: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.foreground,
  },
  hits: {
    display: "grid",
    gap: space["2"],
    margin: 0,
    padding: 0,
    listStyle: "none",
    minHeight: "7.5rem",
  },
  hit: {
    display: "flex",
    alignItems: "flex-start",
    gap: space["2"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
});

/** The files' own markup, drawn inline so the logo is there from the first paint (and in the
 * one-file book) rather than arriving after its hall as an image. Read from public/brand at build. */
const markup: Record<LogoFile["id"], string> = {
  "logo-ink": logoInk,
  "logo-white": logoWhite,
  "mark-ink": markInk,
  "mark-white": markWhite,
};

/** The file's SVG, filling its box, named for a screen reader when `alt` is given. */
const drawn = (id: LogoFile["id"], alt: string) =>
  (markup[id] ?? "").replace(
    "<svg ",
    `<svg width="100%" height="100%" ${alt === "" ? 'aria-hidden="true"' : `role="img" aria-label="${alt}"`} focusable="false" `
  );

/** The mark in the colour of the words around it (the bar's), drawn inline from its file. */
export const MarkInline = ({ style }: { style?: stylex.StyleXStyles }) => (
  <span
    aria-hidden="true"
    {...stylex.props(s.img, style)}
    dangerouslySetInnerHTML={{
      __html: markInk
        .replaceAll("#04251B", "currentColor")
        .replace("<svg ", '<svg width="100%" height="100%" focusable="false" '),
    }}
  />
);

/** The logo or the mark from its file, at a width in pixels, or filling a box set by `style`. */
export const LogoImg = ({
  id,
  width,
  alt = "",
  style,
}: {
  id: LogoFile["id"];
  width?: number;
  alt?: string;
  style?: stylex.StyleXStyles;
}) => {
  const file = fileOf(id);
  const [w, h] =
    file.kind === "logo"
      ? [logoBox.width, logoBox.height]
      : [logoBox.markWidth, logoBox.markHeight];
  const shown = width ?? w * 4;
  return (
    <span
      {...stylex.props(s.img, s.size(shown, w / h), style)}
      dangerouslySetInnerHTML={{ __html: drawn(id, alt) }}
    />
  );
};

const copyFile = (src: string) =>
  copyLater(
    fetch(src).then((response) => {
      if (!response.ok) {
        throw new Error(`${src}: ${response.status}`);
      }
      return response.text();
    })
  );

/**
 * A file to pick up: one quiet control named for the file, which opens to Download and Copy SVG.
 * Once copied it says so on itself, with a tick, for a moment, and once to a screen reader.
 */
export const FilePickup = ({ id }: { id: LogoFile["id"] }) => {
  const file = fileOf(id);
  const [said, setSaid] = useState<"" | "copied" | "failed">("");
  const download = () => {
    const link = document.createElement("a");
    link.href = file.src;
    link.download = file.src.split("/").pop() ?? "";
    link.click();
  };
  const copy = async () => {
    try {
      await copyFile(file.src);
      setSaid("copied");
    } catch {
      setSaid("failed");
    }
    window.setTimeout(() => {
      setSaid("");
    }, 1600);
  };
  const words =
    said === "copied"
      ? logoWords.copied
      : said === "failed"
        ? logoWords.copyFailed
        : file.name;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Icon
              icon={
                said === "copied"
                  ? CheckIcon
                  : said === "failed"
                    ? XIcon
                    : DownloadIcon
              }
            />
            {words}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem icon={DownloadIcon} onSelect={download}>
            {logoWords.download}
          </DropdownMenuItem>
          <DropdownMenuItem icon={CopyIcon} onSelect={() => void copy()}>
            {logoWords.copySvg}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span aria-live="polite" {...stylex.props(visuallyHidden)}>
        {said === "" ? "" : words}
      </span>
    </>
  );
};

/** The logo under the glass: the white logo on the night, the light coming in from both sides. */
export const LogoUnderGlass = () => (
  <div {...stylex.props(s.stage)}>
    <Glass />
    <LogoImg
      id="logo-white"
      width={416}
      alt={logoWords.alt}
      style={s.glassLogo}
    />
  </div>
);

const ClearSpaceAt = ({ width }: { width: number }) => {
  const pad = (2 * width * logoBox.bar) / logoBox.width;
  return (
    <figure {...stylex.props(s.clear)}>
      <div {...stylex.props(s.zone(pad))}>
        <div {...stylex.props(s.box)}>
          <LogoImg id="logo-ink" width={width} alt={logoWords.alt} />
        </div>
        <span aria-hidden="true" {...stylex.props(s.bars(pad), s.barsStart)}>
          <span {...stylex.props(s.bar)} />
          <span {...stylex.props(s.bar)} />
        </span>
        <span aria-hidden="true" {...stylex.props(s.bars(pad), s.barsEnd)}>
          <span {...stylex.props(s.bar)} />
          <span {...stylex.props(s.bar)} />
        </span>
      </div>
      <figcaption {...stylex.props(s.legend)}>
        <span aria-hidden="true" {...stylex.props(s.legendBar(pad / 2))} />
        <span>{logoWords.clearUnit}</span>
      </figcaption>
    </figure>
  );
};

/** The clear space, drawn to the logo's own bar: two bars of the mark on every side. */
export const ClearSpace = () => (
  <>
    <span {...stylex.props(s.onWide)}>
      <ClearSpaceAt width={448} />
    </span>
    <span {...stylex.props(s.onPhone)}>
      <ClearSpaceAt width={236} />
    </span>
  </>
);

/** The sizes drawn side by side, for the one-file book: the logo at 120 and 72, the mark at 16. */
const SizesStill = () => (
  <div {...stylex.props(s.sizesStill)}>
    {[
      { id: "logo-ink" as const, width: 120 },
      { id: "logo-ink" as const, width: 72 },
      { id: "mark-ink" as const, width: 16 },
    ].map((size) => (
      <figure key={size.width} {...stylex.props(s.sizeStill)}>
        <LogoImg
          id={size.id}
          width={size.width}
          alt={size.id === "mark-ink" ? logoWords.markAlt : logoWords.alt}
        />
        <figcaption
          {...stylex.props(s.sizeState)}
        >{`${size.width}px`}</figcaption>
      </figure>
    ))}
  </div>
);

/** The smallest sizes, set by hand: the logo from 72px, the mark from 16px, nothing under. */
export const Sizes = ({ start = 120 }: { start?: number }) => {
  const still = useStill();
  const [width, setWidth] = useState(start);
  if (still) {
    return <SizesStill />;
  }
  const asLogo = width >= 72;
  const fits = width >= 16;
  const state = asLogo
    ? logoWords.sizeLogo
    : fits
      ? logoWords.sizeMark
      : logoWords.sizeNone;
  return (
    <div {...stylex.props(s.sizer)}>
      <div {...stylex.props(s.sizeShow)}>
        <LogoImg
          id={asLogo ? "logo-ink" : "mark-ink"}
          width={asLogo ? width : Math.max(width, 6)}
          alt={asLogo ? logoWords.alt : logoWords.markAlt}
        />
      </div>
      <div {...stylex.props(s.sizeControl)}>
        <Slider
          label={logoWords.sizeLabel}
          min={8}
          max={240}
          step={1}
          value={width}
          onValueChange={(value) => {
            setWidth(Array.isArray(value) ? (value[0] ?? start) : value);
          }}
        />
        <p {...stylex.props(s.sizeState)} aria-live="polite">
          <span {...stylex.props(fits ? s.good : s.bad)}>
            <Icon icon={fits ? CheckIcon : XIcon} />
          </span>
          {state}
        </p>
      </div>
    </div>
  );
};

/** The mark as the app wears it: the night tile at three sizes, down to the favicon. */
export const MarkTiles = () => (
  <div {...stylex.props(s.marks)}>
    {[160, 64, 32, 16].map((size) => (
      <span key={size} {...stylex.props(s.tile(size))}>
        <LogoImg
          id="mark-white"
          width={Math.round(size * 0.62)}
          alt={size === 160 ? logoWords.markAlt : ""}
          style={s.tileMark}
        />
      </span>
    ))}
  </div>
);

/** A colour's value, copied where it stands: the Snippet, its copy button always in view, the
 * check and "Copied" said once. Its own ground holds on every stop of the light. */
const StopCopy = ({ stop, hex }: { stop: Stop; hex: string }) => (
  <Snippet
    size="sm"
    value={hex}
    aria-label={`${colourWords.copy} ${stop.name}, ${hex}`}
  />
);

/** The light: the seven stops as one strip under reeded glass, each one copied where it stands. */
export const TheLight = () => (
  <div {...stylex.props(s.light)}>
    <span aria-hidden="true" {...stylex.props(s.lightReeds)} />
    {stops.map((stop) => {
      const hex = token(stop.token).hex ?? "";
      return (
        <div key={stop.id} {...stylex.props(s.stop, stop.dark && s.stopDark)}>
          <span {...stylex.props(s.stopName)}>{stop.name}</span>
          <span {...stylex.props(s.stopRole)}>{stop.role}</span>
          <span {...stylex.props(s.stopFoot)}>
            <StopCopy stop={stop} hex={hex} />
          </span>
        </div>
      );
    })}
  </div>
);

/** Contrast from two hex colours, as WCAG gives it: the figure before the page has measured its own. */
const ratioOf = (text: string, on: string) => {
  const lum = (hex: string) =>
    [1, 3, 5]
      .map((at) => Number.parseInt(hex.slice(at, at + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i]!, 0);
  const [a, b] = [lum(text), lum(on)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
const hexOfStop = (id: Stop["id"]) =>
  token(stops.find((stop) => stop.id === id)?.token ?? "brand-ink").hex ??
  "#000000";

/** Every pair that carries words, with its contrast measured from what the browser draws (from the
 * tokens' own hex until it has: the same figure, and the one the one-file book keeps). */
export const Pairs = () => {
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const [ratios, setRatios] = useState<(number | null)[]>(() =>
    pairs.map((pair) => ratioOf(hexOfStop(pair.text), hexOfStop(pair.on)))
  );
  useEffect(() => {
    const ratio = measurer();
    setRatios(
      tiles.current.map((tile) => {
        if (!tile) {
          return null;
        }
        const drawn = getComputedStyle(tile);
        return ratio(drawn.color, drawn.backgroundColor);
      })
    );
  }, []);
  return (
    <div {...stylex.props(s.pairs)}>
      {pairs.map((pair, index) => (
        <div
          key={`${pair.text}-${pair.on}`}
          ref={(node) => {
            tiles.current[index] = node;
          }}
          {...stylex.props(
            s.pair,
            s.fill(stopColour[pair.on]),
            s.ink(stopColour[pair.text])
          )}
        >
          <span aria-hidden="true" {...stylex.props(s.pairSample)}>
            {colourWords.sample}
          </span>
          <span {...stylex.props(s.pairFoot)}>
            <span>
              {nameOf(pair.text)} {colourWords.on} {nameOf(pair.on)}
            </span>
            <span {...stylex.props(s.ratio)}>
              {asRatio(ratios[index] ?? null)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

/** The homepage's problem told in three beats (the website's statement): the words rise in
 * the quiet ink, the key words light, the lead sentence turns to full ink. Once, when it is seen;
 * at its last beat at once when motion is not wanted. */
export const Statement = () => {
  const still = useStill();
  const ref = useRef<HTMLParagraphElement>(null);
  const [beat, setBeat] = useState(still ? 3 : 0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBeat(3);
      return;
    }
    const node = ref.current;
    if (!node) {
      return;
    }
    const timers: number[] = [];
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting !== true) {
          return;
        }
        seen.disconnect();
        setBeat(1);
        timers.push(
          window.setTimeout(() => {
            setBeat(2);
          }, 700),
          window.setTimeout(() => {
            setBeat(3);
          }, 1300)
        );
      },
      { threshold: 0.4 }
    );
    seen.observe(node);
    return () => {
      seen.disconnect();
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, []);
  let index = 0;
  const words = (
    <p ref={ref} {...stylex.props(s.statement)}>
      {statement.map((part) =>
        part.text.split(" ").map((raw) => {
          const key = raw.startsWith("*");
          const word = raw.replace("*", "");
          const at = index;
          index += 1;
          return (
            <span key={`${at}-${word}`}>
              {at > 0 ? " " : ""}
              <span
                {...stylex.props(
                  s.word,
                  beat >= 1 && s.wordIn,
                  beat === 1 && s.delay(at * 35),
                  beat >= 3 && part.lead && s.wordLead,
                  beat >= 2 && key && s.wordKey
                )}
              >
                {word}
              </span>
            </span>
          );
        })
      )}
    </p>
  );
  return (
    <>
      <HallStill id="brand-statement" />
      <span {...stylex.props(s.stillHall)}>{words}</span>
    </>
  );
};

/** The four principles, each with a sentence from the website. */
export const Principles = () => (
  <ol {...stylex.props(s.principles)}>
    {principles.map((principle) => (
      <li key={principle.title} {...stylex.props(s.principle)}>
        <span {...stylex.props(s.principleTitle)}>{principle.title}</span>
        <span {...stylex.props(s.principleExample)}>{principle.example}</span>
      </li>
    ))}
  </ol>
);

/** Two sheets side by side: the sentence as it was, struck through, and as it is now. */
export const Sheets = () => (
  <div {...stylex.props(s.sheets)}>
    <div {...stylex.props(s.sheet, s.sheetLeft)}>
      <span {...stylex.props(s.sheetLabel)}>{voiceWords.before}</span>
      <del {...stylex.props(s.sheetWords, s.struck)}>{rewrite.before}</del>
    </div>
    <div {...stylex.props(s.sheet, s.sheetRight)}>
      <span {...stylex.props(s.sheetLabel)}>{voiceWords.after}</span>
      <ins {...stylex.props(s.sheetWords)}>{rewrite.after}</ins>
    </div>
  </div>
);

/** A sheet that checks a sentence against the website's house rules as it is typed. */
export const Checker = () => {
  const still = useStill();
  const [words, setWords] = useState(voiceWords.checkerStart);
  const found = houseRules.filter((rule) => rule.pattern.test(words));
  return (
    <div {...stylex.props(s.checker)}>
      {still ? (
        <p {...stylex.props(s.checkerStill)}>{words}</p>
      ) : (
        <Field name="brand-voice-check">
          <FieldLabel>{voiceWords.checkerLabel}</FieldLabel>
          <Textarea
            value={words}
            rows={3}
            autoResize
            onValueChange={(value) => {
              setWords(value);
            }}
          />
        </Field>
      )}
      <ul {...stylex.props(s.hits)} aria-live="polite">
        {found.length === 0 ? (
          <li {...stylex.props(s.hit)}>
            <span {...stylex.props(s.good)}>
              <Icon icon={CheckIcon} />
            </span>
            {voiceWords.checkerClean}
          </li>
        ) : (
          found.map((rule) => (
            <li key={rule.says} {...stylex.props(s.hit)}>
              <span {...stylex.props(s.bad)}>
                <Icon icon={XIcon} />
              </span>
              {rule.says}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
