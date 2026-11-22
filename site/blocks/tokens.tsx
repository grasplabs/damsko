import { Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import { focusRing } from "@grasp-os/ui/lib/styles";
import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// A group of colour tokens under a quiet label, one row per token: its name as a Copy field, what it
// is for, its light and dark value as two Copy fields with the colour in their leading swatch, and,
// for a colour that is read, its lowest measured contrast and the ground it was measured on. Every
// value is the library's own Copy field (site/blocks/parts.tsx, CopyValue), the install line's look. The StyleX name is said to a
// screen reader and kept in the page's Markdown. Rows sit on hairlines; on a phone the use and the
// contrast drop under the name. The filter above (TokenFilter) stays in view and hides rows,
// and whole groups, that do not match.
import * as stylex from "@stylexjs/stylex";

import { siteSize } from "../system/site-tokens.stylex";
import { CopyValue, partStyles } from "./parts";
import type { ContrastEntry, TokenEntry } from "./token-data";

const styles = stylex.create({
  // A group: its heading and note, then its panel. Groups stand space-8 apart.
  group: {
    marginTop: space["8"],
  },
  label: {
    scrollMarginTop: `calc(${siteSize.frameHeader} + 4.5rem)`,
  },
  // A row: the name and what it is for, then light and dark side by side.
  row: {
    display: "grid",
    paddingBlock: { default: space["6"], [media.maxSm]: space["4"] },
    paddingInline: { default: space["6"], [media.maxSm]: space["4"] },
  },
  top: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: space["3"],
    rowGap: space["1"],
    minWidth: 0,
  },
  use: {
    maxWidth: siteSize.frameMeasure,
    margin: 0,
    marginTop: space["2"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    textWrap: "pretty",
  },
  contrast: {
    marginInlineStart: "auto",
    fontSize: font.textXs,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  figure: {
    marginInlineEnd: space["1"],
    fontSize: font.textSm,
    color: colors.foreground,
  },
  values: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [media.maxSm]: "minmax(0, 1fr)",
    },
    columnGap: space["4"],
    rowGap: space["3"],
    marginTop: space["4"],
  },
  // A value: its quiet tag (Light, Dark) over its field, both on the column's start edge.
  value: {
    display: "grid",
    justifyItems: "start",
    gap: space["1"],
    minWidth: 0,
  },
  // The filter: a pill that stays under the header while the rows scroll past.
  filter: {
    position: "sticky",
    top: siteSize.frameHeader,
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    // With its own padding, the field stands space-6 under the heading, as a block does.
    marginTop: space["3"],
    marginBottom: 0,
    paddingBlock: space["3"],
    // The page card's own ground (paper is a step darker than the card in dark, and showed as a band).
    backgroundColor: colors.background,
  },
  field: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    maxWidth: 22 * 16,
    [iconVars.size]: size.iconSm,
  },
  icon: {
    position: "absolute",
    insetInlineStart: 14,
    display: "flex",
    color: colors.mutedForeground,
    pointerEvents: "none",
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    height: { default: 36, [media.pointerCoarse]: 44 },
    margin: 0,
    paddingInlineStart: 38,
    paddingInlineEnd: 14,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
    backgroundColor: {
      default: colors.accent,
      ":focus-visible": colors.card,
    },
    borderWidth: 0,
    borderRadius: radius.full,
    appearance: "none",
    "::placeholder": { color: colors.mutedForeground, opacity: 1 },
    "::-webkit-search-cancel-button": { appearance: "none" },
  },
  count: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  empty: {
    margin: 0,
    paddingBlock: space["6"],
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.mutedForeground,
  },
});

/** The lowest contrast a token reaches as text or a mark, over the grounds it is measured on. */
const lowest = (name: string, pairs: ContrastEntry[]) => {
  let found: { value: number; on: string; floor: number } | null = null;
  for (const pair of pairs) {
    if (pair.text !== name) {
      continue;
    }
    const value = Math.min(pair.light, pair.dark);
    if (!found || value < found.value) {
      found = { value, on: pair.on, floor: pair.floor };
    }
  }
  return found;
};

/** A colour has swatches; a gradient, a size, a filter or a shadow does not. */
const isColour = (value: string) => value.startsWith("oklch(");

/** Rounded down, so a figure never claims more than was measured. */
const down = (value: number) => Math.floor(value * 10) / 10;

/** The value as it is written, for a copy chip: a colour, or anything short enough to read. */
const shown = (value: string) =>
  isColour(value) || value.length <= 40 ? value : null;

function Value({
  label,
  value,
  swatch,
}: {
  label: string;
  value: string;
  swatch: boolean;
}) {
  return (
    <div {...stylex.props(styles.value)}>
      <span {...stylex.props(partStyles.tag)}>{label}</span>
      <CopyValue
        value={value}
        label={`Copy the ${label.toLowerCase()} value, ${value}`}
        swatch={swatch ? value : undefined}
      />
    </div>
  );
}

/**
 * One group of tokens: its heading and note (an h3, so the group can be reached and linked to),
 * then a panel with a row per token: the name that copies, what it is for, its lowest measured
 * contrast, and its light and dark values side by side, each a field that copies, its colour first.
 * Without a label the group joins the one above it.
 */
export function TokenRowsView({
  id,
  label,
  note,
  tokens,
  pairs,
}: {
  id?: string;
  label?: string;
  note?: string;
  tokens: TokenEntry[];
  pairs: ContrastEntry[];
}) {
  const root = stylex.props(partStyles.block, label ? styles.group : null);
  return (
    <section
      {...root}
      className={`not-prose ${root.className ?? ""}`}
      aria-labelledby={label && id ? id : undefined}
      data-token-list=""
    >
      {label && (
        <div {...stylex.props(partStyles.headed)}>
          <h3 id={id} {...stylex.props(partStyles.heading, styles.label)}>
            {label}
          </h3>
          {note && <p {...stylex.props(partStyles.note)}>{note}</p>}
        </div>
      )}
      <ul {...stylex.props(partStyles.panel)}>
        {tokens.map((entry) => {
          const measured = lowest(entry.name, pairs);
          const colour = isColour(entry.value);
          const light = shown(entry.value);
          const dark =
            entry.dark && entry.dark !== entry.value ? shown(entry.dark) : null;
          return (
            <li
              key={entry.name}
              data-token-row=""
              data-token-words={`${entry.name} ${entry.cssVar} ${entry.stylex} ${entry.use}`.toLowerCase()}
              {...stylex.props(partStyles.panelRow, styles.row)}
            >
              <div {...stylex.props(styles.top)}>
                <CopyValue value={entry.cssVar} />
                <span className="site-visually-hidden">
                  , in StyleX {entry.stylex}
                </span>
                {measured && (
                  <span {...stylex.props(styles.contrast)}>
                    <span {...stylex.props(styles.figure)}>
                      {down(measured.value)}:1
                    </span>
                    on {measured.on}
                    <span className="site-visually-hidden">
                      , the lowest in light and dark; it needs {measured.floor}
                      :1
                    </span>
                  </span>
                )}
              </div>
              <p {...stylex.props(styles.use)}>{entry.use}</p>
              {light && (
                <div {...stylex.props(styles.values)}>
                  <Value
                    label={dark ? "Light" : "Value"}
                    value={light}
                    swatch={colour}
                  />
                  {dark && <Value label="Dark" value={dark} swatch={colour} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The filter over every token list on the page. Invisible until its script runs
 * (site/blocks/blocks.ts), but it keeps its place, so nothing moves when it appears.
 */
export function TokenFilterView({
  total,
  noun = "tokens",
  label = "Filter the tokens",
  placeholder = "Filter by name or use",
}: {
  total: number;
  /** What is counted: "tokens", "icons". */
  noun?: string;
  label?: string;
  placeholder?: string;
}) {
  const root = stylex.props(partStyles.block, styles.filter);
  return (
    <div
      {...root}
      className={`not-prose ${root.className ?? ""}`}
      data-token-filter=""
      style={{ visibility: "hidden" }}
    >
      <label {...stylex.props(styles.field)}>
        <span className="site-visually-hidden">{label}</span>
        <span aria-hidden="true" {...stylex.props(styles.icon)}>
          <Icon icon={SearchIcon} />
        </span>
        <input
          type="search"
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          {...stylex.props(styles.input, focusRing)}
        />
      </label>
      <span
        role="status"
        data-token-count=""
        data-total={total}
        data-noun={noun}
        {...stylex.props(styles.count)}
      >
        {total} {noun}
      </span>
    </div>
  );
}

export function TokenEmptyView({
  words = "No token matches. Try a part of a name, such as ink or soft.",
}: {
  words?: string;
}) {
  return (
    <p
      data-token-empty=""
      hidden
      {...stylex.props(partStyles.block, styles.empty)}
    >
      {words}
    </p>
  );
}
