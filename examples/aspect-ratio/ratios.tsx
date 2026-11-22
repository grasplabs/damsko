import { AspectRatio } from "@grasp-os/ui/components/aspect-ratio";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: space["4"],
    width: "100%",
    maxWidth: 560,
    alignItems: "start",
  },
  // Stands in for an image: it fills the box.
  fill: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: colors.muted,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
  },
});

const ratios = [
  { ratio: 16 / 9, name: "16:9" },
  { ratio: 4 / 3, name: "4:3" },
  { ratio: 1, name: "1:1" },
];

export default function AspectRatioRatios() {
  return (
    <div {...stylex.props(look.row)}>
      {ratios.map(({ ratio, name }) => (
        <AspectRatio key={name} ratio={ratio}>
          <div {...stylex.props(look.fill)}>{name}</div>
        </AspectRatio>
      ))}
    </div>
  );
}
