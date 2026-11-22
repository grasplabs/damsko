import { ChartSparkline } from "@grasp-os/ui/components/chart";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// Under 30rem of its own width (a phone) each shape stacks: its name, the line, the tile. Three
// columns there overlapped the two sparks and ran off the stage at 320.
const NARROW = "@container spark-shapes (width < 30rem)";

const layout = stylex.create({
  frame: {
    containerType: "inline-size",
    containerName: "spark-shapes",
    width: "100%",
    maxWidth: 560,
  },
  sheet: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(7rem, auto) auto minmax(8rem, 1fr)",
      [NARROW]: "minmax(0, 1fr)",
    },
    alignItems: "center",
    columnGap: space["6"],
    rowGap: { default: space["5"], [NARROW]: space["2"] },
    margin: 0,
  },
  row: { display: "contents" },
  name: {
    margin: 0,
    color: colors.bodyForeground,
    fontFamily: font.sans,
    fontSize: font.textSm,
  },
  // Stacked, each shape's name opens its group with a little room above it.
  term: { marginBlockStart: { default: 0, [NARROW]: space["3"] } },
});

// Every shape a spark meets, at the line size and the tile size: each draws without an error,
// a flat or one-point series as a straight line, and a zero line only where the series crosses it.
const shapes = [
  { name: "Rising", values: [3, 4, 4, 6, 7, 7, 9, 11, 12, 14], mark: "last" },
  {
    name: "Falling",
    values: [14, 13, 13, 11, 10, 9, 9, 7, 6, 5],
    mark: "last",
  },
  { name: "Flat", values: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8], mark: "last" },
  { name: "Noisy", values: [6, 11, 4, 9, 13, 5, 10, 3, 12, 7], mark: "max" },
  {
    name: "Crossing zero",
    values: [4, 3, 1, -1, -3, -2, 0, 2, 3, 5],
    mark: "min",
  },
  { name: "One point", values: [7], mark: "last" },
] as const;

export default function ChartSparkShapes() {
  return (
    <div {...stylex.props(layout.frame)}>
      <dl {...stylex.props(layout.sheet)}>
        {shapes.map((shape) => (
          <div key={shape.name} {...stylex.props(layout.row)}>
            <dt {...stylex.props(layout.name, layout.term)}>{shape.name}</dt>
            <dd {...stylex.props(layout.name)}>
              <ChartSparkline
                aria-label={shape.name}
                summary={`${shape.values.length} values.`}
                values={shape.values}
                showHighlight={shape.mark}
              />
            </dd>
            <dd {...stylex.props(layout.name)}>
              <ChartSparkline
                aria-label={shape.name}
                summary={`${shape.values.length} values.`}
                values={shape.values}
                showHighlight={shape.mark}
                size="lg"
                area
              />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
