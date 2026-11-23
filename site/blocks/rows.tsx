import { Icon, PlusIcon } from "@grasp-os/ui/lib/icons";
import { focusRingInset } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// A closed row: the website's question row, holding rows of exact values. A hairline, the name in
// 15/24 500 with its count raised, the Plus icon that turns to a cross. It opens by its height (300ms) and
// closes faster (220ms); what is inside fades in and settles 4px. Each opens on its own. It is a
// <details>, so it opens without script, and the browser's find-in-page opens it too. The height
// animation is in site/system/styles/site.css (::details-content, which StyleX cannot address).
//
// Inside, one line per row, in a few quiet groups: the key at the left in muted 14, then the value
// in ink 15, the thing read first, with a few muted words only for a rule the value cannot show;
// then the tokens it comes from at the right, each a small Copy field of its CSS name (the one copy
// control). A colour token has a swatch, which follows the page's theme. Values come
// from the token data (site/rows-data.ts), never typed.
//
// In a list narrower than 47rem the tokens move under the value; under 36rem the key stands above
// it. (The API is a table of its own: site/blocks/props.tsx.)
import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";
import type { ReactNode } from "react";

import { grouped, isColour, resolve, tokenEntry, tokensOf } from "../rows-data";
import type { Row } from "../rows-data";
import { rowMarker } from "./markers.stylex";
import { CopyValue, partStyles, rich } from "./parts";

export type { Row } from "../rows-data";

const styles = stylex.create({
  details: {
    // Rows in a run share their hairlines: each draws one above and one below, overlapping.
    marginTop: 0,
    marginBottom: -1,
    boxShadow: `inset 0 1px 0 ${colors.border}, inset 0 -1px 0 ${colors.border}`,
  },
  summary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["4"],
    minHeight: 56,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
    cursor: "pointer",
    listStyle: "none",
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    "::-webkit-details-marker": { display: "none" },
  },
  name: {
    color: {
      default: colors.foreground,
      [stylex.when.ancestor(":hover", rowMarker)]: {
        default: null,
        [media.hover]: colors.pine,
      },
    },
    transitionProperty: "color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  count: {
    marginInlineStart: 3,
    fontSize: font.textXs,
    lineHeight: 1,
    fontWeight: font.weightNormal,
    color: colors.subtleForeground,
    verticalAlign: "text-top",
    fontVariantNumeric: "tabular-nums",
  },
  // The Plus icon; it turns 45 degrees to read as a cross when the row is open.
  plus: {
    [iconVars.size]: size.iconSm,
    display: "inline-flex",
    flexShrink: 0,
    color: {
      default: colors.mutedForeground,
      [stylex.when.ancestor(":hover", rowMarker)]: {
        default: null,
        [media.hover]: colors.pine,
      },
    },
    transform: {
      default: "rotate(0deg)",
      [stylex.when.ancestor("[open]", rowMarker)]: "rotate(45deg)",
    },
    transitionProperty: "transform, color",
    transitionDuration: {
      default: `${duration.mark}, ${duration.hover}`,
      [media.reducedMotion]: `0s, ${duration.hover}`,
    },
    transitionTimingFunction: duration.ease,
  },
  body: {
    paddingBottom: space["6"],
    opacity: { default: 0, [stylex.when.ancestor("[open]", rowMarker)]: 1 },
    transform: {
      default: "translateY(-4px)",
      [stylex.when.ancestor("[open]", rowMarker)]: "none",
    },
    transitionProperty: "opacity, transform",
    transitionDuration: {
      default: duration.close,
      [stylex.when.ancestor("[open]", rowMarker)]: duration.open,
      [media.reducedMotion]: "0s",
    },
    transitionTimingFunction: duration.ease,
  },
  group: {
    paddingTop: { default: space["6"], ":first-child": 0 },
  },
  groupTag: {
    paddingBottom: space["1"],
  },

  // ---- The one row ------------------------------------------------------------------------------
  // The list is the container its rows answer to, so a row lays itself out by the room it has,
  // not by the window: three columns from 47rem, the tokens under the value below, one column
  // under 36rem.
  list: {
    containerType: "inline-size",
    margin: 0,
    padding: 0,
  },
  row: {
    display: "grid",
    gridTemplateColumns: {
      default: "10rem minmax(0, 1fr) auto",
      "@container (36rem <= width < 47rem)": "10rem minmax(0, 1fr)",
      "@container (width < 36rem)": "minmax(0, 1fr)",
    },
    columnGap: space["6"],
    // Where the aside drops under the value (narrower than 47rem), a step between them, so its
    // fields and their rings do not touch the words above.
    rowGap: { default: 0, "@container (width < 47rem)": space["2"] },
    alignItems: "baseline",
    paddingBlock: space["3"],
    boxShadow: {
      default: `inset 0 1px 0 ${colors.border}`,
      ":first-child": "none",
    },
  },
  key: {
    gridColumn: 1,
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textBaseLine,
    color: colors.mutedForeground,
  },
  value: {
    gridColumn: { default: 2, "@container (width < 36rem)": 1 },
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.foreground,
    fontVariantNumeric: "tabular-nums",
    textWrap: "pretty",
    // The value and its few words: side by side, the words on a line of their own when there is
    // no room, never broken across the two.
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: space["3"],
  },
  note: {
    fontSize: font.textSm,
    color: colors.mutedForeground,
  },
  aside: {
    gridColumn: {
      default: 3,
      "@container (36rem <= width < 47rem)": 2,
      "@container (width < 36rem)": 1,
    },
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: {
      default: "flex-end",
      "@container (width < 47rem)": "flex-start",
    },
    columnGap: space["2"],
    rowGap: space["2"],
    margin: 0,
  },
  // Code in a row's key or value: mono, plain, with no fill, so a row reads as one line of type.
  monoKey: {
    fontFamily: font.mono,
    fontSize: font.textXs,
  },
  monoValue: {
    fontFamily: font.mono,
    fontSize: font.textSm,
  },
  // Tokens standing as the value: their fields side by side, wrapping between fields.
  inline: {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: space["2"],
    rowGap: space["2"],
  },
});

/** Words with `code` in backticks: the code in plain mono, no fill. */
const mono = (text: string, style: stylex.StyleXStyles) =>
  text.split(/(`[^`]+`)/u).map((part, index) =>
    part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
      <code key={index} {...stylex.props(style)}>
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );

/** One fact: its key, the value read first, a few words, and what it comes from. */
function SpecRow({
  label,
  value,
  note,
  aside,
}: {
  label: ReactNode;
  value?: ReactNode;
  note?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div {...stylex.props(styles.row)}>
      <dt {...stylex.props(styles.key)}>{label}</dt>
      {(value || note) && (
        <dd {...stylex.props(styles.value)}>
          {value && <span>{value}</span>}
          {note && <span {...stylex.props(styles.note)}>{note}</span>}
        </dd>
      )}
      {aside && <dd {...stylex.props(styles.aside)}>{aside}</dd>}
    </div>
  );
}

function SpecList({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <dl aria-label={label} {...stylex.props(styles.list)}>
      {children}
    </dl>
  );
}

/**
 * A token by its CSS name, as the library's Copy field (CopyValue), small: the same control as every
 * value you copy on the site. A colour shows its swatch, which follows the page's theme.
 */
export function TokenName({ name }: { name: string }) {
  const entry = tokenEntry(name);
  return (
    <CopyValue
      value={entry.cssVar}
      swatch={isColour(entry) ? `var(${entry.cssVar})` : undefined}
    />
  );
}

export function RowsView({ title, rows }: { title: string; rows: Row[] }) {
  const root = stylex.props(rowMarker, partStyles.block, styles.details);
  return (
    <details {...root} className={`not-prose site-row ${root.className ?? ""}`}>
      <summary {...stylex.props(styles.summary, focusRingInset)}>
        <span {...stylex.props(styles.name)}>
          {title}
          <sup {...stylex.props(styles.count)}>
            <span className="site-visually-hidden">, </span>
            {rows.length}
          </sup>
        </span>
        <span aria-hidden="true" {...stylex.props(styles.plus)}>
          <Icon icon={PlusIcon} />
        </span>
      </summary>
      <div {...stylex.props(styles.body)}>
        {grouped(rows).map((group, index) => (
          <div key={group.title ?? index} {...stylex.props(styles.group)}>
            {group.title && (
              <div {...stylex.props(styles.groupTag)}>
                <h3 {...stylex.props(partStyles.heading)}>{group.title}</h3>
              </div>
            )}
            <SpecList label={group.title ? undefined : title}>
              {group.rows.map((row) => {
                // Colours first, so their swatches stand together where the eye starts.
                const names = tokensOf(row).sort(
                  (a, b) =>
                    Number(isColour(tokenEntry(b))) -
                    Number(isColour(tokenEntry(a)))
                );
                const tokens =
                  names.length > 0
                    ? names.map((name) => <TokenName key={name} name={name} />)
                    : undefined;
                // With no value of its own (a colour), the tokens are the value, read first.
                return (
                  <SpecRow
                    key={`${row.key}-${row.value ?? ""}`}
                    label={mono(row.key, styles.monoKey)}
                    value={
                      row.value
                        ? mono(resolve(row.value), styles.monoValue)
                        : tokens && (
                            <span {...stylex.props(styles.inline)}>
                              {tokens}
                            </span>
                          )
                    }
                    note={row.note ? rich(resolve(row.note)) : undefined}
                    aside={row.value ? tokens : undefined}
                  />
                );
              })}
            </SpecList>
          </div>
        ))}
      </div>
    </details>
  );
}
