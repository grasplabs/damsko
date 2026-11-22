"use client";

import { CopyButton } from "@grasp-os/ui/components/copy-button";
import {
  colors,
  font,
  media,
  radius,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// The exhibits of rooms 01 (Grasp) and 02 (Names): the promise as the website sets it, the method as
// three verbs, the paragraph about Grasp to take away (the meadow that grows from one seed is its own
// part, meadow.tsx); the names as a specimen, Stephen as the platform
// draws him, and the same words in English and Dutch. Every colour a token, every word from
// content.ts.
import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";

import { graspWords, method, names, namesWords, translations } from "./content";
import { Glass } from "./glass";

const s = stylex.create({
  center: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    padding: { default: space["10"], [media.maxSm]: space["5"] },
  },
  promise: {
    margin: 0,
    display: "grid",
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    letterSpacing: font.trackingTitle,
    textAlign: "center",
    color: colors.foreground,
    // On a phone the glass reaches further across: the promise keeps to the night between its panes.
    maxWidth: { default: "none", [media.maxSm]: "14rem" },
  },
  accent: { color: colors.brandLime },
  // ---- The method
  steps: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, minmax(0, 1fr))",
      [media.maxMd]: "1fr",
    },
    gap: { default: space["10"], [media.maxMd]: space["8"] },
    width: "100%",
    maxWidth: "54rem",
    margin: 0,
    padding: { default: space["10"], [media.maxSm]: space["5"] },
    listStyle: "none",
  },
  step: {
    display: "grid",
    gap: space["3"],
    alignContent: "start",
    paddingBlockStart: space["4"],
    boxShadow: `inset 0 1px 0 ${colors.brandPine}`,
  },
  verb: {
    fontFamily: font.serif,
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    letterSpacing: font.trackingTitle,
    color: colors.brandInk,
  },
  stepLine: {
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
    color: colors.brandInk,
  },
  // ---- About
  about: {
    margin: 0,
    maxWidth: "34rem",
    fontFamily: font.serif,
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
    letterSpacing: font.trackingTitle,
    color: colors.brandInk,
    textWrap: "pretty",
  },
  // ---- Names
  names: {
    display: "grid",
    gap: { default: space["8"], [media.maxSm]: space["6"] },
    width: "100%",
    maxWidth: "40rem",
    margin: 0,
    padding: { default: space["10"], [media.maxSm]: space["5"] },
    listStyle: "none",
  },
  nameRow: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) 15rem",
      [media.maxSm]: "1fr",
    },
    alignItems: "baseline",
    gap: { default: space["6"], [media.maxSm]: space["1"] },
    paddingBlockEnd: {
      default: space["6"],
      [media.maxSm]: space["4"],
    },
    boxShadow: `inset 0 -1px 0 color-mix(in oklch, ${colors.brandInk} 14%, transparent)`,
  },
  name: {
    fontFamily: font.serif,
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    letterSpacing: font.trackingTitle,
    color: colors.brandInk,
  },
  nameLine: {
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.brandPine,
  },
  // ---- Stephen
  stephen: {
    width: { default: "15rem", [media.maxSm]: "10rem" },
    aspectRatio: "1",
    borderRadius: radius.circle,
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
  },
  cell: { display: "block" },
  tone: (colour: string) => ({ backgroundColor: colour }),
  // ---- English and Dutch
  languages: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [media.maxSm]: "1fr",
    },
    columnGap: space["10"],
    rowGap: { default: space["6"], [media.maxSm]: space["2"] },
    width: "100%",
    maxWidth: "52rem",
    alignContent: "center",
    padding: { default: space["10"], [media.maxSm]: space["5"] },
  },
  language: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.brandPine,
    display: { default: "block", [media.maxSm]: "none" },
  },
  saying: {
    margin: 0,
    fontFamily: font.serif,
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
    letterSpacing: font.trackingTitle,
    color: colors.foreground,
  },
  nl: {
    color: colors.bodyForeground,
    marginBlockEnd: { default: 0, [media.maxSm]: space["5"] },
  },
});

/** The promise, as the website's hero sets it: under the fluted glass, the second line in lime. */
export const ThePromise = () => (
  <>
    <Glass />
    <div {...stylex.props(s.center)}>
      <p {...stylex.props(s.promise)}>
        <span>{graspWords.promise[0]}</span>
        <span {...stylex.props(s.accent)}>{graspWords.promise[1]}</span>
      </p>
    </div>
  </>
);

/** The method: three verbs, each with its one line. */
export const Method = () => (
  <ol {...stylex.props(s.steps)}>
    {method.map((step) => (
      <li key={step.verb} {...stylex.props(s.step)}>
        <span {...stylex.props(s.verb)}>{step.verb}</span>
        <span {...stylex.props(s.stepLine)}>{step.line}</span>
      </li>
    ))}
  </ol>
);

/** The paragraph about Grasp, set to read, and copied as it is. */
export const About = () => (
  <div {...stylex.props(s.center)}>
    <p {...stylex.props(s.about)}>{graspWords.aboutText}</p>
  </div>
);

export const AboutPickup = () => (
  <CopyButton value={graspWords.aboutText} variant="outline" size="sm">
    {graspWords.copy}
  </CopyButton>
);

/** The names as a specimen: each as it is written, and what it is. */
export const Names = () => (
  <ul {...stylex.props(s.names)}>
    {names.map((entry) => (
      <li key={entry.name} {...stylex.props(s.nameRow)}>
        <span {...stylex.props(s.name)}>{entry.name}</span>
        <span {...stylex.props(s.nameLine)}>{entry.line}</span>
      </li>
    ))}
  </ul>
);

/** Stephen as the platform draws him (scene-kit.ts): a 6 × 6 field of four greens in a circle, the
 * same seed every time; the greens are the light's. */
export const Stephen = () => {
  const greens = [
    colors.mintDeep,
    colors.brandMint,
    colors.brandSea,
    colors.brandLime,
  ];
  return (
    <span
      role="img"
      aria-label={namesWords.stephenAlt}
      {...stylex.props(s.stephen)}
    >
      {Array.from({ length: 36 }, (_, cell) => {
        const row = Math.floor(cell / 6);
        return (
          <span
            key={cell}
            {...stylex.props(
              s.cell,
              s.tone(greens[(cell * 7 + row * 3) % 4] ?? colors.brandMint)
            )}
          />
        );
      })}
    </span>
  );
};

/** The same words in English and Dutch, side by side. */
export const Languages = () => (
  <div {...stylex.props(s.languages)}>
    <span {...stylex.props(s.language)}>{namesWords.english}</span>
    <span {...stylex.props(s.language)}>{namesWords.dutchName}</span>
    {translations.map((line) => (
      <Fragment key={line.en}>
        <p lang="en-GB" {...stylex.props(s.saying)}>
          {line.en}
        </p>
        <p lang="nl-NL" {...stylex.props(s.saying, s.nl)}>
          {line.nl}
        </p>
      </Fragment>
    ))}
  </div>
);
