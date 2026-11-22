import { Separator } from "@grasp-os/ui/components/separator";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  // Alone or between words, every specimen is one size.
  alone: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: space["6"],
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    width: 140,
    height: space["6"],
    fontSize: font.textSm,
    color: colors.mutedForeground,
  },
  // A horizontal line stretches by default, so in a row it sits at the top: centre it on the words.
  grow: { flexGrow: 1, flexBasis: 0, alignSelf: "center" },
});

// One separator in one state. The docs draw it in each orientation, alone and between words. It has
// no hover, focus or press: it is a line, not a control.
export default function SeparatorState({
  orientation = "horizontal",
  words = false,
}: {
  orientation?: "horizontal" | "vertical";
  words?: boolean;
}) {
  if (!words) {
    return (
      <div {...stylex.props(layout.alone)}>
        <Separator
          orientation={orientation}
          style={orientation === "horizontal" ? layout.grow : undefined}
        />
      </div>
    );
  }
  return orientation === "horizontal" ? (
    <div {...stylex.props(layout.row)}>
      <Separator decorative style={layout.grow} />
      <span>or</span>
      <Separator decorative style={layout.grow} />
    </div>
  ) : (
    <div {...stylex.props(layout.row)}>
      <span>Reports</span>
      <Separator orientation="vertical" />
      <span>Exports</span>
    </div>
  );
}
