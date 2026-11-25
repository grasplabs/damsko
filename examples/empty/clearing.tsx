import { Button } from "@grasp-os/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyDescription,
  EmptyTitle,
  EmptyContent,
} from "@grasp-os/ui/components/empty";
import {
  colors,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { pixel, pixelVars } from "@grasp-os/ui/lib/vars.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

const layout = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))",
    gap: 16,
    width: "100%",
  },
  card: {
    height: 340,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
  // The place: the words in the middle row, in a clearing; what will stand here in a band above
  // them and a band below, each as tall as the room left over. As tall as its box.
  place: {
    display: "grid",
    gridTemplateRows: `minmax(${space["8"]}, 1fr) auto minmax(${space["8"]}, 1fr)`,
    height: "100%",
  },
  // A chart stands on the place's floor, and a list that fills from the top has its words at its
  // head: nothing above the words.
  placeBelow: { gridTemplateRows: "0 auto minmax(0, 1fr)" },
  words: { gridRow: 2 },
});

// The picture of what will stand here: the product's own drawing, in the system's pixels. It is
// not content: hidden from a screen reader, it takes no pointer and never moves.
const ghost = stylex.create({
  // A band holds whole pieces only. It is a column that wraps: a piece that does not fit whole
  // goes to a second column, out of the band, so nothing is ever cut.
  band: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    alignContent: "flex-start",
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    pointerEvents: "none",
    // It takes the room the place gives it and asks for none.
    contain: "size",
  },
  above: { gridRow: 1 },
  below: { gridRow: 3 },
  // Below the words, the pieces keep to the place's foot.
  toFoot: { justifyContent: "flex-end" },
  // First in a band, no height: a column that wraps keeps at least one item, so with it a piece
  // taller than its band wraps away whole.
  spacer: { flexShrink: 0, width: "100%", height: 0 },
  piece: {
    position: "relative",
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    boxSizing: "border-box",
    width: "100%",
  },
  far: { opacity: 0.7 },
  farther: { opacity: 0.4 },
  // A surface: the system's pixel, a fine square in every 3px.
  dots: {
    [pixelVars.color]: {
      default: colors.mutedForeground,
      [media.forcedColors]: "CanvasText",
    },
    backgroundImage: pixel.fineFill,
    backgroundSize: "3px 3px",
  },
  // A part's outline, fainter than the dots.
  line: {
    boxSizing: "border-box",
    borderWidth: size.hairline,
    borderStyle: "solid",
    borderColor: {
      default: colors.controlBorder,
      [media.forcedColors]: "CanvasText",
    },
  },
  // A row of a list: its mark, its name, a status chip and a fact, a line between rows.
  row: {
    gap: space["3"],
    height: 36,
    paddingInline: space["4"],
    borderBlockStartWidth: { default: size.hairline, ":nth-child(2)": 0 },
    borderBlockStartStyle: "solid",
    borderBlockStartColor: colors.border,
  },
  mark: {
    flexShrink: 0,
    width: 11,
    height: 11,
    borderRadius: radius.xs,
    cornerShape: radius.shape,
  },
  name: (width: string) => ({ width, height: 10 }),
  chip: {
    flexShrink: 0,
    width: 54,
    height: 17,
    marginInlineStart: "auto",
    borderRadius: radius.full,
  },
  fact: { flexShrink: 0, width: "8%", height: 10, marginInline: space["5"] },
  // A row of three cards: each its edge, a picture's room, a title and a line.
  cards: { gap: space["3"], height: 112, padding: space["2"] },
  card: {
    display: "grid",
    flexGrow: 1,
    alignContent: "start",
    gap: space["2"],
    height: "100%",
    padding: space["2"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
  },
  picture: { height: 36 },
  title: { width: "60%", height: 10 },
  text: { width: "80%", height: 6 },
  // A bubble of a talk: what was asked at the end, an answer at the start.
  bubble: { height: 48, paddingInline: space["3"] },
  said: (width: string) => ({
    width,
    height: 31,
    padding: space["1"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
  }),
  asked: { marginInlineStart: "auto" },
  fill: { display: "block", width: "100%", height: "100%" },
  // A chart: its bars on the place's floor, a line's room under the words.
  chart: {
    alignItems: "flex-end",
    gap: "2.8%",
    height: `calc(100% - ${space["4"]})`,
    paddingInline: "5%",
    paddingBlockEnd: space["3"],
  },
  bar: (height: string) => ({ flexGrow: 1, height }),
});

/** What will stand in the place: a list's rows, a grid's cards, a chart's bars, a talk's bubbles. */
export type Shape = "rows" | "cards" | "chart" | "thread";

const NAMES = ["34%", "26%", "40%", "22%", "30%", "36%"];
const SAID = ["34%", "52%", "28%", "46%", "38%", "54%"];
const BARS = [
  "40%",
  "59%",
  "46%",
  "74%",
  "55%",
  "86%",
  "67%",
  "51%",
  "78%",
  "61%",
];

const Piece = ({ shape, index }: { shape: Shape; index: number }) => {
  if (shape === "rows") {
    return (
      <>
        <span {...stylex.props(ghost.line, ghost.mark)} />
        <span
          {...stylex.props(ghost.dots, ghost.name(NAMES[index % 6] ?? "30%"))}
        />
        <span {...stylex.props(ghost.line, ghost.chip)} />
        <span {...stylex.props(ghost.dots, ghost.fact)} />
      </>
    );
  }
  if (shape === "cards") {
    return ["a", "b", "c"].map((card) => (
      <span key={card} {...stylex.props(ghost.line, ghost.card)}>
        <span {...stylex.props(ghost.dots, ghost.picture)} />
        <span {...stylex.props(ghost.dots, ghost.title)} />
        <span {...stylex.props(ghost.dots, ghost.text)} />
      </span>
    ));
  }
  const width = SAID[index % 6] ?? "40%";
  return (
    <span
      {...stylex.props(
        ghost.line,
        ghost.said(width),
        index % 2 === 0 && ghost.asked
      )}
    >
      <span {...stylex.props(ghost.dots, ghost.fill)} />
    </span>
  );
};

/**
 * One band of the picture: more pieces than any place shows; it draws those that fit whole. Under
 * the words they keep to the place's foot, or (`fromTop`) stand from the words down.
 */
const Band = ({
  shape,
  below = false,
  fromTop = false,
}: {
  shape: Shape;
  below?: boolean;
  fromTop?: boolean;
}) => (
  <span
    aria-hidden="true"
    {...stylex.props(
      ghost.band,
      below ? ghost.below : ghost.above,
      below && shape !== "chart" && !fromTop && ghost.toFoot
    )}
  >
    <span {...stylex.props(ghost.spacer)} />
    {shape === "chart"
      ? below && (
          <span {...stylex.props(ghost.piece, ghost.chart)}>
            {BARS.map((height, index) => (
              <span
                key={index}
                {...stylex.props(ghost.dots, ghost.bar(height))}
              />
            ))}
          </span>
        )
      : [0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <span
            key={index}
            {...stylex.props(
              ghost.piece,
              shape === "rows" && ghost.row,
              shape === "cards" && ghost.cards,
              shape === "thread" && ghost.bubble,
              // Further from the words, a piece is a little fainter: the place goes on.
              below && index === (fromTop ? 3 : 1) && ghost.far,
              below && index >= (fromTop ? 4 : 2) && ghost.farther
            )}
          >
            <Piece shape={shape} index={below ? index + 3 : index} />
          </span>
        ))}
  </span>
);

/**
 * A place that is empty, as tall as its box: its words in a clearing among the shapes of what will
 * stand there; `start` (a list that fills from the top) has its words at its head, the shapes
 * under them. Other examples here draw their places with it.
 */
export const Place = ({
  shape,
  align = "center",
  children,
}: {
  shape: Shape;
  align?: "center" | "start";
  children: ReactNode;
}) => (
  <div
    {...stylex.props(
      layout.place,
      (shape === "chart" || align === "start") && layout.placeBelow
    )}
  >
    {align === "center" && <Band shape={shape} />}
    <Empty size="sm" align={align} style={layout.words}>
      {children}
    </Empty>
    <Band shape={shape} below fromTop={align === "start"} />
  </div>
);

const SHAPES: Shape[] = ["rows", "cards", "chart", "thread"];

// What will stand in the place is the product's own drawing, round the words: a list keeps its
// rows, a grid its cards, a chart its bars and a thread its bubbles, so the place does not collapse
// to a line of text. With the shortest words and with the longest (a title on two lines, a
// sentence on three, a button), the words keep to the same short measure and no piece is cut.
// The spec reads this page.
export default function EmptyClearing() {
  return (
    <div {...stylex.props(layout.grid)}>
      {SHAPES.map((shape) => (
        <div key={shape} {...stylex.props(layout.card)}>
          <Place shape={shape}>
            <EmptyHeader>
              <EmptyDescription>None yet.</EmptyDescription>
            </EmptyHeader>
          </Place>
        </div>
      ))}
      {SHAPES.map((shape) => (
        <div key={shape} {...stylex.props(layout.card)}>
          <Place shape={shape}>
            <EmptyHeader>
              <EmptyTitle>
                No reports match the words you searched for in this workspace
              </EmptyTitle>
              <EmptyDescription>
                Check the spelling or try a shorter word. Reports from the
                archive are not searched here, and all 214 reports are still in
                their place.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm">
                Clear the search
              </Button>
            </EmptyContent>
          </Place>
        </div>
      ))}
    </div>
  );
}
