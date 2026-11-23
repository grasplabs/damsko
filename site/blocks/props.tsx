import { colors, font, radius, space } from "@grasp-os/ui/lib/tokens.stylex";
// The props of a component, read from its real props type (site/props-data.ts), as a clean table:
// Prop, Type and Description in one hairline box, the headers small caps tags, rows on hairlines.
// The name is one mono chip; each member of a union is its own chip, quoted as it is typed; any
// other type is one chip. The description is plain muted text, with "Required" and the default
// folded into it. The chip is the site's one code chip (partStyles.code): the same fill, corner and
// mono as code in a sentence. Under 600px each row stacks: the name, the type chips, the words.
import * as stylex from "@stylexjs/stylex";

import type { PropRow } from "../props-data";
import { Tag, partStyles, rich } from "./parts";

const styles = stylex.create({
  wrap: {
    marginTop: space["6"],
  },
  caption: {
    paddingBottom: space["2"],
  },
  box: {
    overflow: "clip",
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: `inset 0 0 0 1px ${colors.border}`,
  },
  table: {
    display: { default: "table", "@media (width < 37.5rem)": "block" },
    width: "100%",
    tableLayout: "fixed",
    borderCollapse: "collapse",
    borderSpacing: 0,
  },
  head: {
    display: {
      default: "table-header-group",
      "@media (width < 37.5rem)": "none",
    },
  },
  body: {
    display: {
      default: "table-row-group",
      "@media (width < 37.5rem)": "block",
    },
  },
  row: {
    display: { default: "table-row", "@media (width < 37.5rem)": "grid" },
    rowGap: space["2"],
    paddingBlock: { default: 0, "@media (width < 37.5rem)": space["4"] },
    paddingInline: { default: 0, "@media (width < 37.5rem)": space["5"] },
    // Rows on hairlines; the first sits under the header, which has none of its own.
    boxShadow: {
      default: `inset 0 1px 0 ${colors.border}`,
      "@media (width < 37.5rem)": {
        default: `inset 0 1px 0 ${colors.border}`,
        ":first-child": "none",
      },
    },
  },
  th: {
    fontWeight: font.weightNormal,
    paddingBlock: space["3"],
    paddingInline: space["6"],
    textAlign: "start",
    verticalAlign: "bottom",
  },
  cell: {
    fontWeight: font.weightNormal,
    display: { default: "table-cell", "@media (width < 37.5rem)": "block" },
    paddingBlock: { default: space["4"], "@media (width < 37.5rem)": 0 },
    paddingInline: { default: space["6"], "@media (width < 37.5rem)": 0 },
    verticalAlign: "top",
    textAlign: "start",
  },
  colName: { width: "24%" },
  colType: { width: "30%" },
  name: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: space["1"],
  },
  types: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["1"],
  },
  // The one chip, a little taller in a table so its rows of chips breathe.
  chip: {
    display: "inline-block",
    maxWidth: "100%",
    paddingBlock: 2,
    lineHeight: font.textXsLine,
    whiteSpace: "normal",
    overflowWrap: "break-word",
  },
  problem: {
    margin: 0,
    paddingBlock: space["4"],
    paddingInline: space["6"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.destructive,
    boxShadow: `inset 0 1px 0 ${colors.border}`,
  },
  description: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    textWrap: "pretty",
  },
});

function Chip({ children }: { children: string }) {
  return (
    <code data-code="" {...stylex.props(partStyles.code, styles.chip)}>
      {children}
    </code>
  );
}

export function PropsView({
  rows,
  problems = [],
  label,
  head = "Prop",
  caption,
  required = true,
}: {
  rows: PropRow[];
  /** What could not be read (site/props-data.ts): shown under the rows, so the page still loads. */
  problems?: string[];
  label: string;
  /** The first column's header: "Prop", "Option". */
  head?: string;
  /** A tag over the table, when the section holds more than one ("Options", "Returns"). */
  caption?: string;
  /** Whether to say which are required (not for what a hook returns: all of it is there). */
  required?: boolean;
}) {
  const root = stylex.props(partStyles.block, styles.wrap);
  return (
    <div {...root} className={`not-prose site-props ${root.className ?? ""}`}>
      {caption && (
        <div {...stylex.props(styles.caption)}>
          <Tag>{caption}</Tag>
        </div>
      )}
      <div {...stylex.props(styles.box)}>
        <table aria-label={label} {...stylex.props(styles.table)}>
          <colgroup>
            <col {...stylex.props(styles.colName)} />
            <col {...stylex.props(styles.colType)} />
            <col />
          </colgroup>
          <thead {...stylex.props(styles.head)}>
            <tr>
              {[head, "Type", "Description"].map((title) => (
                <th key={title} scope="col" {...stylex.props(styles.th)}>
                  <Tag as="span">{title}</Tag>
                </th>
              ))}
            </tr>
          </thead>
          <tbody {...stylex.props(styles.body)}>
            {rows.map((row) => {
              const notes = [
                row.deprecated === undefined
                  ? ""
                  : `Deprecated: ${row.deprecated || "it goes in the next major release."}`,
                required && row.required ? `${row.required}.` : "",
                row.default ? `Default: \`${row.default}\`.` : "",
              ].filter(Boolean);
              return (
                <tr key={row.name} {...stylex.props(styles.row)}>
                  <th scope="row" {...stylex.props(styles.cell)}>
                    <span {...stylex.props(styles.name)}>
                      <Chip>{row.name}</Chip>
                    </span>
                  </th>
                  <td {...stylex.props(styles.cell)}>
                    <span {...stylex.props(styles.types)}>
                      {row.members.length > 0
                        ? row.members.map((member) => (
                            <Chip key={member}>{`"${member}"`}</Chip>
                          ))
                        : row.type && <Chip>{row.type}</Chip>}
                    </span>
                  </td>
                  <td {...stylex.props(styles.cell)}>
                    <p {...stylex.props(styles.description)}>
                      {rich([row.description, ...notes].join(" "), true)}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {problems.length > 0 && (
          <p role="note" {...stylex.props(styles.problem)}>
            Props could not be read: {problems.join(" ")}
          </p>
        )}
      </div>
    </div>
  );
}
