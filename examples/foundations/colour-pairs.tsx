"use client";

import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
// Colour, scene: every pair, measured. Each colour that may carry words (the four inks, the three
// accents that hold as text, the four status colours) on each ground, with its contrast measured
// from what the browser draws. Text needs 4.5:1; a pair below it is said so in words. The grid is
// the place to look a pair up: find the colour's row, read across.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";

import { asRatio, measurer } from "./contrast";

// By the scene's own room, not the window's: inside the shell a sidebar takes room beside it.
const narrow = "@container pairs (width < 34rem)";

const styles = stylex.create({
  box: {
    // A container has no width of its own to give: it takes the room it is handed.
    width: "100%",
    containerType: "inline-size",
    containerName: "pairs",
    backgroundColor: colors.card,
  },
  table: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(8.5rem, 1.1fr) repeat(4, minmax(0, 1fr))",
      [narrow]: "repeat(4, minmax(0, 1fr))",
    },
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
  // A row's cells sit straight in the grid.
  row: { display: "contents" },
  corner: { display: { default: "block", [narrow]: "none" } },
  head: {
    paddingBlock: space["3"],
    paddingInline: { default: space["4"], [narrow]: space["2"] },
    fontWeight: font.weightMedium,
    color: colors.mutedForeground,
    textAlign: "start",
  },
  group: {
    gridColumn: "1 / -1",
    paddingBlockStart: space["5"],
    paddingBlockEnd: space["2"],
    paddingInline: { default: space["4"], [narrow]: space["2"] },
    fontWeight: font.weightMedium,
    color: colors.foreground,
    boxShadow: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
  },
  // The colour's name: beside its cells when there is room, on its own line above them when not.
  name: {
    gridColumn: { default: "auto", [narrow]: "1 / -1" },
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    paddingBlockStart: { default: 0, [narrow]: space["3"] },
    paddingBlockEnd: { default: 0, [narrow]: space["1"] },
    paddingInline: { default: space["4"], [narrow]: space["2"] },
    fontFamily: font.mono,
    color: colors.bodyForeground,
    whiteSpace: "nowrap",
  },
  cell: {
    display: "flex",
    // Side by side with room; the figure under its sample when four grounds share a phone.
    flexDirection: { default: "row", [narrow]: "column" },
    alignItems: { default: "baseline", [narrow]: "flex-start" },
    justifyContent: "space-between",
    columnGap: space["2"],
    minWidth: 0,
    paddingBlock: space["3"],
    paddingInline: { default: space["4"], [narrow]: space["2"] },
  },
  paper: { backgroundColor: colors.background },
  soft: { backgroundColor: colors.muted },
  raised: { backgroundColor: colors.card },
  night: { colorScheme: "dark", backgroundColor: colors.brandNight },
  sample: {
    fontFamily: font.serif,
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
  },
  figure: {
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },
  low: { color: colors.destructive },
  ink: { color: colors.foreground },
  text: { color: colors.bodyForeground },
  muted: { color: colors.mutedForeground },
  quiet: { color: colors.subtleForeground },
  mintDeep: { color: colors.mintDeep },
  pine: { color: colors.pine },
  lavender: { color: colors.lavender },
  success: { color: colors.success },
  attention: { color: colors.warning },
  danger: { color: colors.destructive },
  info: { color: colors.info },
});

const grounds = [
  { id: "paper", name: "Paper" },
  { id: "soft", name: "Soft" },
  { id: "raised", name: "Raised" },
  { id: "night", name: "Night" },
] as const;

const groups = [
  { name: "Inks", colours: ["ink", "text", "muted", "quiet"] },
  {
    name: "Accents that hold as words",
    colours: ["mintDeep", "pine", "lavender"],
  },
  { name: "Status", colours: ["success", "attention", "danger", "info"] },
] as const;

type Colour = (typeof groups)[number]["colours"][number];
const tokenName = (colour: Colour) =>
  colour === "mintDeep" ? "mint-deep" : colour;

/** What text needs (WCAG 1.4.3). */
const TEXT = 4.5;

export default function ColourPairs() {
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const table = useRef<HTMLDivElement>(null);

  // Measured from the drawn page, so the figures are what you see, in light and in dark.
  useEffect(() => {
    const element = table.current;
    if (!element) {
      return;
    }
    const measure = () => {
      const ratio = measurer();
      const next: Record<string, number> = {};
      for (const cell of element.querySelectorAll<HTMLElement>("[data-pair]")) {
        const sample = cell.querySelector<HTMLElement>("[data-pair-sample]");
        if (!sample) {
          continue;
        }
        const found = ratio(
          getComputedStyle(sample).color,
          getComputedStyle(cell).backgroundColor
        );
        if (found !== null) {
          next[cell.dataset.pair ?? ""] = found;
        }
      }
      setRatios(next);
    };
    measure();
    // The theme may change under the page: measure again when it does.
    const watcher = new MutationObserver(measure);
    watcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", measure);
    return () => {
      watcher.disconnect();
      scheme.removeEventListener("change", measure);
    };
  }, []);

  return (
    <div {...stylex.props(styles.box)}>
      <div
        ref={table}
        role="table"
        aria-label="Contrast of every colour that carries words, on each ground"
        {...stylex.props(styles.table)}
      >
        <div role="row" {...stylex.props(styles.row)}>
          <span
            role="columnheader"
            {...stylex.props(styles.head, styles.corner)}
          >
            Colour
          </span>
          {grounds.map((ground) => (
            <span
              key={ground.id}
              role="columnheader"
              {...stylex.props(styles.head)}
            >
              {ground.name}
            </span>
          ))}
        </div>
        {groups.map((group) => (
          <div key={group.name} role="rowgroup" {...stylex.props(styles.row)}>
            <div role="row" {...stylex.props(styles.row)}>
              <span
                role="cell"
                aria-colspan={5}
                {...stylex.props(styles.group)}
              >
                {group.name}
              </span>
            </div>
            {group.colours.map((colour) => (
              <div key={colour} role="row" {...stylex.props(styles.row)}>
                <span role="rowheader" {...stylex.props(styles.name)}>
                  {tokenName(colour)}
                </span>
                {grounds.map((ground) => {
                  const pair = `${colour} ${ground.id}`;
                  const found = ratios[pair];
                  const low = found !== undefined && found < TEXT;
                  return (
                    <span
                      key={ground.id}
                      role="cell"
                      data-pair={pair}
                      data-pair-low={low ? "" : undefined}
                      {...stylex.props(styles.cell, styles[ground.id])}
                    >
                      <span
                        aria-hidden="true"
                        data-pair-sample=""
                        {...stylex.props(styles.sample, styles[colour])}
                      >
                        Aa
                      </span>
                      <span
                        data-pair-ratio=""
                        {...stylex.props(styles.figure, low && styles.low)}
                      >
                        {found === undefined ? " " : asRatio(found)}
                        {low && ", marks only"}
                      </span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
