import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Space, scene: the scale as a staircase. Every step stands at its true size, in three flights:
// the small steps hold the inside of a control, the middle ones the inside of a card, and the
// wide ones hold sections apart. Read left to right, the room grows with what it holds apart.
import * as stylex from "@stylexjs/stylex";

// By the scene's own room, not the window's: the three flights stand side by side only where all
// three fit whole (the widest is 360px of steps), and one under the other below that.
const stacked = "@container scale (width < 44rem)";

const styles = stylex.create({
  // A container has no width of its own to give: it takes the room it is handed.
  room: { width: "100%", containerType: "inline-size", containerName: "scale" },
  stage: {
    display: "grid",
    // A flight is never narrower than its steps, so no step drops to a second row.
    gridTemplateColumns: {
      default: "minmax(min-content, 1fr) minmax(min-content, 1fr) auto",
      [stacked]: "minmax(0, 1fr)",
    },
    alignItems: "start",
    columnGap: space["6"],
    rowGap: space["10"],
    paddingBlock: space["10"],
    paddingInline: { default: space["6"], [media.maxSm]: space["5"] },
  },
  flight: { display: "grid", rowGap: space["4"], minWidth: 0 },
  steps: {
    display: "flex",
    // Stacked on a phone, the widest flight may take two rows; side by side, none does.
    flexWrap: { default: "nowrap", [stacked]: "wrap" },
    alignItems: "flex-end",
    columnGap: space["2"],
    rowGap: space["4"],
    alignContent: "flex-end",
    // Side by side, the three flights stand on one floor: as tall as the widest step.
    minHeight: {
      default: `calc(${space["24"]} + ${space["2"]} + ${font.textXsLine})`,
      [stacked]: 0,
    },
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  step: { display: "grid", justifyItems: "center", rowGap: space["2"] },
  block: {
    backgroundColor: colors.mint,
    borderRadius: radius.mark,
    cornerShape: radius.shape,
  },
  small: { borderRadius: 0 },
  // The number takes no width of its own: a step's column is its block, so the room between two
  // blocks is space-2 everywhere (the "1" under the 4px block widened its column, and the room
  // after it read 10px). Its figure stands centred over the column, past it where the block is small.
  number: {
    display: "flex",
    justifyContent: "center",
    width: 0,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
  },
  words: {
    display: "grid",
    rowGap: space["1"],
    paddingTop: space["3"],
    boxShadow: `inset 0 ${size.hairline} 0 ${colors.border}`,
  },
  name: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  use: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    textWrap: "pretty",
  },
});

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 16 | 20 | 24;

const flights: { name: string; use: string; steps: Step[] }[] = [
  {
    name: "Inside a control",
    use: "An icon to its label, a button's ends.",
    steps: [1, 2, 3, 4],
  },
  {
    name: "Inside a card",
    use: "Its padding, the room between cards.",
    steps: [5, 6, 7, 8],
  },
  {
    name: "Between sections",
    use: "A title from its page, one band from the next.",
    steps: [10, 12, 16, 20, 24],
  },
];

const sizes = stylex.create({
  s1: { width: space["1"], height: space["1"] },
  s2: { width: space["2"], height: space["2"] },
  s3: { width: space["3"], height: space["3"] },
  s4: { width: space["4"], height: space["4"] },
  s5: { width: space["5"], height: space["5"] },
  s6: { width: space["6"], height: space["6"] },
  s7: { width: space["7"], height: space["7"] },
  s8: { width: space["8"], height: space["8"] },
  s10: { width: space["10"], height: space["10"] },
  s12: { width: space["12"], height: space["12"] },
  s16: { width: space["16"], height: space["16"] },
  s20: { width: space["20"], height: space["20"] },
  s24: { width: space["24"], height: space["24"] },
});

export default function SpaceScale() {
  return (
    <div {...stylex.props(styles.room)}>
      <div {...stylex.props(styles.stage)}>
        {flights.map((flight) => (
          <div key={flight.name} {...stylex.props(styles.flight)}>
            <ul
              {...stylex.props(styles.steps)}
              aria-label={`${flight.name}: space-${flight.steps.join(", space-")}`}
            >
              {flight.steps.map((step) => (
                <li key={step} {...stylex.props(styles.step)}>
                  <span
                    aria-hidden="true"
                    {...stylex.props(
                      styles.block,
                      step < 4 && styles.small,
                      sizes[`s${step}`]
                    )}
                  />
                  <span {...stylex.props(styles.number)}>{step}</span>
                </li>
              ))}
            </ul>
            <div {...stylex.props(styles.words)}>
              <p {...stylex.props(styles.name)}>{flight.name}</p>
              <p {...stylex.props(styles.use)}>{flight.use}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
