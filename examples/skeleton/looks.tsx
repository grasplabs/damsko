import { Skeleton } from "@grasp-os/ui/components/skeleton";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))",
    gap: space["5"],
    width: `min(48rem, calc(100vw - 2 * ${space["6"]}))`,
    maxWidth: "100%",
  },
  item: { display: "grid", rowGap: space["2"], minWidth: 0 },
  picture: { height: "auto", aspectRatio: "16 / 9" },
  short: { width: "60%" },
  name: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
});

const looks: { look: "wave" | "pulse"; name: string }[] = [
  { look: "wave", name: "Wave (the default)" },
  { look: "pulse", name: "Pulse" },
];

// Two ways a Skeleton waits, each a picture and two lines: the dot field a wave of light crosses,
// and the soft fill breathing.
export default function SkeletonLooks() {
  return (
    <div aria-busy="true" {...stylex.props(layout.grid)}>
      {looks.map(({ look, name }) => (
        <div key={look} {...stylex.props(layout.item)}>
          <Skeleton
            animation={look}
            variant="rectangular"
            style={layout.picture}
          />
          <Skeleton animation={look} size="default" />
          <Skeleton animation={look} style={layout.short} />
          <p {...stylex.props(layout.name)}>{name}</p>
        </div>
      ))}
    </div>
  );
}
