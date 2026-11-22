import { colors, font, media, space } from "@grasp-os/ui/lib/tokens.stylex";
// The Type page's two blocks:
//
//   TypeFacesView  the first picture: the three families as "Aa" at 44/48, side by side on a hairline
//                  split by thin rules, each with its name, its chip and its use; stacked on a phone
//   TypeRowsView   one row per token, or per size with its line height: the chips (each showing its
//                  short value, so no figure is written twice), then a live specimen set in exactly
//                  those tokens, and the use under it
//
// Specimens are styled with the tokens' own CSS variables, so the page shows what the tokens are.
import * as stylex from "@stylexjs/stylex";
import type { CSSProperties } from "react";

import { TokenChip, partStyles } from "./parts";
import type { TokenEntry } from "./token-data";

const styles = stylex.create({
  faces: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, minmax(0, 1fr))",
      [media.maxSm]: "minmax(0, 1fr)",
    },
  },
  face: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [media.maxSm]: "4.5rem minmax(0, 1fr)",
    },
    gridTemplateRows: {
      default: "auto auto auto 1fr",
      [media.maxSm]: "auto",
    },
    alignContent: "start",
    columnGap: space["4"],
    rowGap: space["2"],
    minWidth: 0,
    padding: { default: space["6"], [media.maxSm]: space["4"] },
    // The thin rule between faces: at the left of every face but the first, at the top on a phone.
    boxShadow: {
      default: `inset 1px 0 0 ${colors.border}`,
      ":first-child": "none",
      [media.maxSm]: {
        default: `inset 0 1px 0 ${colors.border}`,
        ":first-child": "none",
      },
    },
  },
  aa: {
    gridRow: { default: null, [media.maxSm]: "span 3" },
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    fontWeight: font.weightNormal,
    color: colors.foreground,
  },
  faceName: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
    marginTop: { default: space["2"], [media.maxSm]: 0 },
  },
  chipLine: {
    display: "flex",
    minWidth: 0,
  },
  use: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    textWrap: "pretty",
  },
  // A row: the token chips, then the specimen, then what it is for.
  row: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    paddingBlock: { default: space["8"], [media.maxSm]: space["6"] },
    paddingInline: { default: space["6"], [media.maxSm]: space["4"] },
  },
  names: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["1"],
    minWidth: 0,
  },
  specimen: {
    minWidth: 0,
    margin: 0,
    marginTop: space["4"],
    color: colors.foreground,
    overflowWrap: "break-word",
    textWrap: "balance",
  },
  rowUse: {
    marginTop: space["2"],
    color: colors.mutedForeground,
  },
});

/** The family's own name, the first in its stack: "Geist Serif". */
const familyName = (value: string) => /"([^"]+)"/u.exec(value)?.[1] ?? value;

export function TypeFacesView({ families }: { families: TokenEntry[] }) {
  const root = stylex.props(partStyles.block, partStyles.panel, styles.faces);
  return (
    <ul
      aria-label="The three families"
      {...root}
      className={`not-prose ${root.className ?? ""}`}
    >
      {families.map((family) => (
        <li key={family.name} {...stylex.props(styles.face)}>
          <span
            aria-hidden="true"
            style={{ fontFamily: `var(${family.cssVar})` }}
            {...stylex.props(styles.aa)}
          >
            Aa
          </span>
          <span {...stylex.props(styles.faceName)}>
            {familyName(family.value)}
          </span>
          <span {...stylex.props(styles.chipLine)}>
            <TokenChip name={family.name} />
          </span>
          <p {...stylex.props(styles.use)}>{family.use}</p>
        </li>
      ))}
    </ul>
  );
}

export interface TypeRow {
  /** The tokens the row stands for: a size and its line height, or one token. */
  tokens: TokenEntry[];
  /** The specimen's style, written in the tokens' own variables. */
  style: CSSProperties;
  /** What the specimen says. */
  text: string;
  use: string;
}

export function TypeRowsView({ rows }: { rows: TypeRow[] }) {
  const root = stylex.props(partStyles.block, partStyles.panel);
  return (
    <ul {...root} className={`not-prose ${root.className ?? ""}`}>
      {rows.map((row) => (
        <li
          key={row.tokens[0]?.name}
          {...stylex.props(partStyles.panelRow, styles.row)}
        >
          <span {...stylex.props(styles.names)}>
            {row.tokens.map((entry) => (
              <TokenChip key={entry.name} name={entry.name} />
            ))}
          </span>
          <p style={row.style} {...stylex.props(styles.specimen)}>
            {row.text}
          </p>
          <p {...stylex.props(styles.use, styles.rowUse)}>{row.use}</p>
        </li>
      ))}
    </ul>
  );
}
