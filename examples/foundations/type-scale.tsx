"use client";

import { Input } from "@grasp-os/ui/components/input";
import {
  colors,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Type, scene: your own words down the whole scale. One line you can rewrite, set at every size the
// system has, largest first: the serif for the four title sizes, Geist for the rest. Each step says
// its token, and its size over its line height as the browser measures them.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";

const styles = stylex.create({
  panel: {
    display: "grid",
    rowGap: space["6"],
    paddingBlock: space["8"],
    paddingInline: { default: space["8"], [media.maxSm]: space["5"] },
  },
  field: { width: "100%", maxWidth: "24rem" },
  list: { display: "grid", margin: 0, padding: 0, listStyle: "none" },
  row: {
    display: "grid",
    gridTemplateColumns: {
      default: "9rem minmax(0, 1fr)",
      [media.maxSm]: "minmax(0, 1fr)",
    },
    alignItems: "baseline",
    columnGap: space["6"],
    rowGap: space["1"],
    paddingBlock: space["3"],
    boxShadow: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
  },
  facts: {
    display: "flex",
    alignItems: "baseline",
    gap: space["2"],
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },
  token: { color: colors.bodyForeground },
  figures: {
    fontVariantNumeric: "tabular-nums",
    color: colors.subtleForeground,
  },
  // The sample wraps where the column is narrow: cut with an ellipsis, a large step showed a few
  // letters of its words and hid the rest.
  words: {
    margin: 0,
    minWidth: 0,
    overflowWrap: "anywhere",
    textWrap: "balance",
    color: colors.foreground,
    fontWeight: font.weightNormal,
  },
  serif: { fontFamily: font.serif, letterSpacing: font.trackingTitle },
  sans: { fontFamily: font.sans },
  titleXl: { fontSize: font.headingXl, lineHeight: font.headingXlLine },
  titleLg: { fontSize: font.headingLg, lineHeight: font.headingLgLine },
  titleMd: { fontSize: font.headingMd, lineHeight: font.headingMdLine },
  titleSm: { fontSize: font.headingSm, lineHeight: font.headingSmLine },
  titleUi: {
    fontSize: font.headingXs,
    lineHeight: font.headingXsLine,
    fontWeight: font.weightMedium,
    letterSpacing: font.trackingUiTitle,
  },
  textLg: { fontSize: font.textLg, lineHeight: font.textLgLine },
  textMd: { fontSize: font.textBase, lineHeight: font.textBaseLine },
  textSm: { fontSize: font.textSm, lineHeight: font.textSmLine },
  textXs: { fontSize: font.textXs, lineHeight: font.textXsLine },
});

const steps = [
  { id: "titleXl", token: "title-xl", face: "serif" },
  { id: "titleLg", token: "title-lg", face: "serif" },
  { id: "titleMd", token: "title-md", face: "serif" },
  { id: "titleSm", token: "title-sm", face: "serif" },
  { id: "titleUi", token: "title-ui", face: "sans" },
  { id: "textLg", token: "text-lg", face: "sans" },
  { id: "textMd", token: "text-md", face: "sans" },
  { id: "textSm", token: "text-sm", face: "sans" },
  { id: "textXs", token: "text-xs", face: "sans" },
] as const;

const FIRST = "Approve the March report";

export default function TypeScale() {
  const [words, setWords] = useState(FIRST);
  const [figures, setFigures] = useState<Record<string, string>>({});
  const list = useRef<HTMLUListElement>(null);

  // Read from the drawn page, so the figures are the ones the tokens give, not a copy of them.
  useEffect(() => {
    const element = list.current;
    if (!element) {
      return;
    }
    const next: Record<string, string> = {};
    for (const line of element.querySelectorAll<HTMLElement>("[data-step]")) {
      const style = getComputedStyle(line);
      next[line.dataset.step ?? ""] =
        `${Number.parseFloat(style.fontSize)}/${Number.parseFloat(style.lineHeight)}`;
    }
    setFigures(next);
  }, []);

  const shown = words.trim() === "" ? FIRST : words;

  return (
    <div {...stylex.props(styles.panel)}>
      <Input
        aria-label="Your words"
        defaultValue={FIRST}
        maxLength={80}
        onChange={(event) => {
          setWords((event.target as HTMLInputElement).value);
        }}
        style={styles.field}
      />
      <ul ref={list} {...stylex.props(styles.list)}>
        {steps.map((step) => (
          <li key={step.id} {...stylex.props(styles.row)}>
            <span {...stylex.props(styles.facts)}>
              <span {...stylex.props(styles.token)}>{step.token}</span>
              <span {...stylex.props(styles.figures)}>
                {figures[step.id] ?? ""}
              </span>
            </span>
            <p
              data-step={step.id}
              {...stylex.props(
                styles.words,
                styles[step.face],
                styles[step.id]
              )}
            >
              {shown}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
