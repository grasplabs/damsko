"use client";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";
import { DownloadIcon, Icon } from "@grasp-os/ui/lib/icons";
import { focusRing } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  shadow,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// The exhibits of rooms 12 (Applications) and 13 (Downloads). Applications are real objects hung on
// the wall, drawn to their own proportions: the share card (1200 by 630, after the website's own),
// two deck slides, the first page of a proposal. Downloads are the files themselves, each a thing to
// take, and the colours' CSS as it is. Every colour a token, every word from content.ts.
import * as stylex from "@stylexjs/stylex";

import logoInk from "../../public/brand/grasp-logo-ink.svg?raw";
import logoWhite from "../../public/brand/grasp-logo-white.svg?raw";
import markInk from "../../public/brand/grasp-mark-ink.svg?raw";
import markWhite from "../../public/brand/grasp-mark-white.svg?raw";
import { siteSize } from "../system/site-tokens.stylex";
import {
  applicationWords,
  downloadWords,
  downloads,
  method,
  stops,
} from "./content";
import type { DownloadFile } from "./content";
import { LogoImg, stopColour } from "./exhibits";
import { Glass } from "./glass";
import { useStill } from "./still";

import colours from "../../public/brand/grasp-colours.css?raw";

/** Each file's own bytes, so the one-file book can hand it over with no network. */
const fileData: Record<string, string> = {
  "logo-ink": `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoInk)}`,
  "logo-white": `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoWhite)}`,
  "mark-ink": `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markInk)}`,
  "mark-white": `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markWhite)}`,
  colours: `data:text/css;charset=utf-8,${encodeURIComponent(colours)}`,
};

const s = stylex.create({
  // ---- The share card
  hung: {
    width: "100%",
    maxWidth: "42rem",
    padding: { default: space["10"], [media.maxSm]: space["4"] },
  },
  share: {
    position: "relative",
    isolation: "isolate",
    display: "grid",
    alignContent: "space-between",
    aspectRatio: "1200 / 630",
    overflow: "hidden",
    padding: { default: "5.5%", [media.maxSm]: "5%" },
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: colors.brandNight,
    boxShadow: shadow.lg,
    colorScheme: "dark",
    containerType: "inline-size",
  },
  shareWords: { display: "grid", gap: "2.4cqi", maxWidth: "60%" },
  shareTitle: {
    margin: 0,
    display: "grid",
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: "6.4cqi",
    lineHeight: 1.05,
    letterSpacing: font.trackingTitle,
    color: colors.primaryForegroundOnColor,
  },
  lime: { color: colors.brandLime },
  // On a phone the card is small: its line and its host would fall under 13px, so the card keeps its title.
  shareLine: {
    display: { default: "block", [media.maxSm]: "none" },
    margin: 0,
    fontSize: "max(12px, 2.2cqi)",
    lineHeight: 1.45,
    color: `color-mix(in oklch, ${colors.primaryForegroundOnColor} 80%, transparent)`,
  },
  shareHost: {
    display: { default: "block", [media.maxSm]: "none" },
    justifySelf: "start",
    fontSize: "max(12px, 1.9cqi)",
    color: `color-mix(in oklch, ${colors.primaryForegroundOnColor} 70%, transparent)`,
  },
  shareLogo: { width: "13cqi", justifySelf: "start" },
  // ---- The slides
  slides: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [media.maxMd]: "1fr",
    },
    gap: { default: space["8"], [media.maxSm]: space["5"] },
    width: "100%",
    maxWidth: "52rem",
    padding: { default: space["10"], [media.maxSm]: space["4"] },
  },
  slide: {
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    aspectRatio: "16 / 9",
    padding: "7%",
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    boxShadow: shadow.lg,
    containerType: "inline-size",
  },
  slidePaper: {
    backgroundColor: colors.brandPaper,
    color: colors.brandInk,
    colorScheme: "light",
  },
  slideNight: {
    backgroundColor: colors.brandNight,
    color: colors.primaryForegroundOnColor,
    colorScheme: "dark",
  },
  slideMark: { width: "5.5cqi" },
  slideTitle: {
    margin: 0,
    alignSelf: "center",
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: "7cqi",
    lineHeight: 1.1,
    letterSpacing: font.trackingTitle,
    textWrap: "balance",
  },
  slideNumber: {
    justifySelf: "end",
    fontSize: "max(12px, 2.6cqi)",
    fontVariantNumeric: "tabular-nums",
    opacity: 0.7,
  },
  // ---- The proposal
  sheet: {
    display: "grid",
    alignContent: "start",
    // The sheet is its own container: what is on it is sized by the sheet (cqi); its own gap and
    // padding are fixed, as a percentage would be read from the wall.
    gap: { default: space["3"], [media.maxSm]: space["2"] },
    // On a phone the page takes the width it has (to its own 21rem), and no line on it is under 12px.
    width: { default: "21rem", [media.maxSm]: "min(100%, 21rem)" },
    aspectRatio: "210 / 297",
    padding: { default: space["8"], [media.maxSm]: space["6"] },
    backgroundColor: colors.brandPaper,
    color: colors.brandInk,
    boxShadow: shadow.lg,
    colorScheme: "light",
    containerType: "inline-size",
  },
  sheetLogo: { width: "26cqi", marginBlockEnd: "8cqi" },
  sheetKind: {
    fontSize: "max(12px, 3.4cqi)",
    letterSpacing: siteSize.trackingTag,
    textTransform: "uppercase",
    color: colors.brandPine,
  },
  sheetTitle: {
    margin: 0,
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: "8.4cqi",
    lineHeight: 1.1,
    letterSpacing: font.trackingTitle,
  },
  sheetLine: {
    margin: 0,
    fontSize: "max(12px, 3.6cqi)",
    lineHeight: 1.5,
    color: colors.brandPine,
  },
  sheetSteps: {
    display: "grid",
    gap: "2.6cqi",
    margin: 0,
    marginBlockStart: "4cqi",
    padding: 0,
    listStyle: "none",
  },
  sheetStep: {
    display: "grid",
    gridTemplateColumns: "24cqi 1fr",
    gap: "3cqi",
    paddingBlockStart: "2.6cqi",
    boxShadow: `inset 0 1px 0 color-mix(in oklch, ${colors.brandInk} 16%, transparent)`,
    fontSize: "max(12px, 3.4cqi)",
    lineHeight: 1.45,
  },
  sheetVerb: {
    fontFamily: font.serif,
    fontSize: "max(13px, 4.6cqi)",
    lineHeight: 1.1,
  },
  // ---- The files
  files: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, minmax(0, 12rem))",
      [media.maxSm]: "repeat(2, minmax(0, 1fr))",
    },
    justifyContent: "center",
    gap: { default: space["6"], [media.maxSm]: space["4"] },
    width: "100%",
    margin: 0,
    padding: { default: space["10"], [media.maxSm]: space["4"] },
    listStyle: "none",
  },
  file: {
    display: "grid",
    gap: space["3"],
    color: colors.foreground,
    textDecorationLine: "none",
    borderRadius: radius.sm,
    cornerShape: radius.shape,
  },
  face: {
    display: "grid",
    placeItems: "center",
    aspectRatio: "4 / 3",
    overflow: "hidden",
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    boxShadow: {
      default: shadow.sm,
      [media.hover]: { default: shadow.sm, ":hover": shadow.md },
    },
    transitionProperty: "box-shadow",
    transitionDuration: duration.hover,
  },
  facePaper: { backgroundColor: colors.brandPaper },
  faceNight: { backgroundColor: colors.brandNight },
  faceLogo: { width: "62%" },
  faceMark: { width: "26%" },
  bookFace: { position: "relative", isolation: "isolate" },
  strip: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    width: "100%",
    height: "100%",
  },
  fill: (colour: string) => ({ backgroundColor: colour }),
  fileFoot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["2"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  fileName: { color: colors.foreground },
  fileKind: {
    display: "flex",
    alignItems: "center",
    gap: space["1"],
    color: colors.mutedForeground,
  },
  code: {
    width: "100%",
    maxWidth: "40rem",
    padding: { default: space["10"], [media.maxSm]: space["4"] },
  },
});

/** The share card, as a link to the site shows: night, the glass from the right, the title. */
export const ShareCard = () => (
  <div {...stylex.props(s.hung)}>
    <div
      role="img"
      aria-label={applicationWords.shareLabel}
      {...stylex.props(s.share)}
    >
      <Glass side="right" />
      <LogoImg id="logo-white" width={156} style={s.shareLogo} />
      <div {...stylex.props(s.shareWords)}>
        <p {...stylex.props(s.shareTitle)}>
          <span>{applicationWords.shareTitle[0]}</span>
          <span {...stylex.props(s.lime)}>
            {applicationWords.shareTitle[1]}
          </span>
        </p>
        <p {...stylex.props(s.shareLine)}>{applicationWords.shareLine}</p>
      </div>
      <span {...stylex.props(s.shareHost)}>{applicationWords.shareHost}</span>
    </div>
  </div>
);

/** Two slides, one on paper and one on night, each saying one thing. */
export const Slides = () => (
  <div
    role="img"
    aria-label={applicationWords.slidesLabel}
    {...stylex.props(s.slides)}
  >
    <div {...stylex.props(s.slide, s.slidePaper)}>
      <LogoImg id="mark-ink" width={36} style={s.slideMark} />
      <p {...stylex.props(s.slideTitle)}>{applicationWords.slidePaperTitle}</p>
      <span {...stylex.props(s.slideNumber)}>
        {applicationWords.slidePaperNumber}
      </span>
    </div>
    <div {...stylex.props(s.slide, s.slideNight)}>
      <LogoImg id="mark-white" width={36} style={s.slideMark} />
      <p {...stylex.props(s.slideTitle)}>{applicationWords.slideNightTitle}</p>
      <span {...stylex.props(s.slideNumber)}>
        {applicationWords.slideNightNumber}
      </span>
    </div>
  </div>
);

/** The first page of a proposal, on paper. */
export const Proposal = () => (
  <div
    role="img"
    aria-label={applicationWords.proposalLabel}
    {...stylex.props(s.sheet)}
  >
    <LogoImg id="logo-ink" width={88} style={s.sheetLogo} />
    <span {...stylex.props(s.sheetKind)}>{applicationWords.proposalKind}</span>
    <p {...stylex.props(s.sheetTitle)}>{applicationWords.proposalTitle}</p>
    <p {...stylex.props(s.sheetLine)}>{applicationWords.proposalLine}</p>
    <ul {...stylex.props(s.sheetSteps)}>
      {method.map((step) => (
        <li key={step.verb} {...stylex.props(s.sheetStep)}>
          <span {...stylex.props(s.sheetVerb)}>{step.verb}</span>
          <span>{step.line}</span>
        </li>
      ))}
    </ul>
  </div>
);

const FileFace = ({ file }: { file: DownloadFile }) => {
  if (file.shows === "book") {
    return (
      <span {...stylex.props(s.face, s.faceNight, s.bookFace)}>
        <Glass />
        <LogoImg id="mark-white" width={40} alt="" style={s.faceMark} />
      </span>
    );
  }
  if (file.shows === "colours") {
    return (
      <span {...stylex.props(s.face)}>
        <span {...stylex.props(s.strip)}>
          {stops.map((stop) => (
            <span
              key={stop.id}
              {...stylex.props(s.fill(stopColour[stop.id]))}
            />
          ))}
        </span>
      </span>
    );
  }
  const night = file.shows.endsWith("white");
  const logo = file.shows.startsWith("logo");
  return (
    <span {...stylex.props(s.face, night ? s.faceNight : s.facePaper)}>
      <LogoImg
        id={file.shows}
        width={logo ? 120 : 40}
        alt=""
        style={logo ? s.faceLogo : s.faceMark}
      />
    </span>
  );
};

/** The files, each a thing to take: its face, its name, its kind. */
export const Files = () => {
  const still = useStill();
  return (
    <ul {...stylex.props(s.files)}>
      {downloads
        .filter((file) => !(still && file.id === "book"))
        .map((file) => (
          <li key={file.id}>
            <a
              href={still ? (fileData[file.id] ?? file.href) : file.href}
              download={file.file}
              aria-label={`${downloadWords.download} ${file.name}, ${file.kind}`}
              {...stylex.props(s.file, focusRing)}
            >
              <FileFace file={file} />
              <span {...stylex.props(s.fileFoot)}>
                <span {...stylex.props(s.fileName)}>{file.name}</span>
                <span {...stylex.props(s.fileKind)}>
                  <Icon icon={DownloadIcon} />
                  {file.kind}
                </span>
              </span>
            </a>
          </li>
        ))}
    </ul>
  );
};

/** The colours' CSS, as the file holds it, to copy. */
export const ColoursCss = () => (
  <div {...stylex.props(s.code)}>
    <CodeBlock language="css">
      <CodeBlockHeader>
        <CodeBlockTitle>{downloadWords.cssFile}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={colours.trim()} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{colours.trim()}</CodeBlockContent>
    </CodeBlock>
  </div>
);
