import {
  colors,
  font,
  media,
  radius,
  shadow,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Elevation, scene: an edge, not a border. The same card twice on the soft ground, at its own size
// and under a glass at eight times: on the left as Grasp draws it, a faint ring outside the box and
// a breath of shadow under it; on the right with a hard 1px border line, flat, inside the box.
import * as stylex from "@stylexjs/stylex";

const PHONE = media.maxSm;
// How far the glass magnifies.
const GLASS = 8;

const styles = stylex.create({
  pair: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [PHONE]: "minmax(0, 1fr)",
    },
  },
  side: {
    display: "grid",
    alignContent: "start",
    rowGap: space["5"],
    minWidth: 0,
    margin: 0,
    paddingBlock: space["8"],
    paddingInline: { default: space["8"], [PHONE]: space["5"] },
    fontFamily: font.sans,
  },
  wrong: {
    boxShadow: {
      default: `inset ${size.hairline} 0 0 ${colors.border}`,
      [PHONE]: `inset 0 ${size.hairline} 0 ${colors.border}`,
    },
  },
  name: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },

  // The card at its own size.
  card: {
    display: "grid",
    rowGap: space["1"],
    boxSizing: "border-box",
    width: "100%",
    paddingBlock: space["3"],
    paddingInline: space["4"],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
  },
  edge: { boxShadow: shadow.sm },
  border: {
    borderWidth: size.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
  },
  title: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
    whiteSpace: "nowrap",
  },
  who: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },

  // The glass: a window on the card's lower corner, where its lift falls, at eight times its size.
  glass: {
    position: "relative",
    height: `calc(2 * ${space["24"]})`,
    overflow: "hidden",
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}`,
  },
  magnified: {
    position: "absolute",
    bottom: space["2"],
    left: space["4"],
    width: `calc(2 * ${space["24"]})`,
    zoom: GLASS,
  },

  // Under the glass the words would only be shapes: the surface and its edge are what to see.
  hidden: { visibility: "hidden" },
  notes: {
    display: "grid",
    rowGap: space["2"],
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  note: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    columnGap: space["3"],
    alignItems: "baseline",
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    textWrap: "pretty",
  },
  term: {
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
});

function ReportCard({
  look,
  bare = false,
}: {
  look: "edge" | "border";
  bare?: boolean;
}) {
  return (
    <div {...stylex.props(styles.card, styles[look])}>
      <span {...stylex.props(styles.title, bare && styles.hidden)}>
        Q3 revenue summary
      </span>
      <span {...stylex.props(styles.who, bare && styles.hidden)}>
        Research agent, 2 min ago
      </span>
    </div>
  );
}

const sides = [
  {
    look: "edge",
    name: "An edge and a lift",
    notes: [
      {
        term: "edge",
        words: "A ring of 6% ink, drawn outside the box, so it adds no size.",
      },
      {
        term: "lift",
        words:
          "A breath of shadow under it, so the card stands off the ground.",
      },
    ],
  },
  {
    look: "border",
    name: "A border line",
    notes: [
      {
        term: "border",
        words: "A hard line inside the box, taking a pixel from what it holds.",
      },
      {
        term: "no lift",
        words: "It sits flat on the ground: outlined, not raised.",
      },
    ],
  },
] as const;

export default function ElevationEdge() {
  return (
    <div {...stylex.props(styles.pair)}>
      {sides.map((side) => (
        <figure
          key={side.look}
          {...stylex.props(styles.side, side.look === "border" && styles.wrong)}
        >
          <figcaption {...stylex.props(styles.name)}>{side.name}</figcaption>
          <ReportCard look={side.look} />
          <div aria-hidden="true" {...stylex.props(styles.glass)}>
            <div {...stylex.props(styles.magnified)}>
              <ReportCard look={side.look} bare />
            </div>
          </div>
          <ul {...stylex.props(styles.notes)}>
            {side.notes.map((note) => (
              <li key={note.term} {...stylex.props(styles.note)}>
                <span {...stylex.props(styles.term)}>{note.term}</span>
                <span>{note.words}</span>
              </li>
            ))}
          </ul>
        </figure>
      ))}
    </div>
  );
}
