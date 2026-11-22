import { Separator } from "@grasp-os/ui/components/separator";
import { colors, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    width: "100%",
    maxWidth: 360,
    color: colors.mutedForeground,
  },
  // A horizontal line stretches by default, so in a row it sits at the top: centre it on the words.
  line: { flexGrow: 1, flexShrink: 1, flexBasis: 0, alignSelf: "center" },
});

// The word "or" already says the two sides are apart, so a screen reader skips the lines.
export default function SeparatorDecorative() {
  return (
    <div {...stylex.props(layout.row)}>
      <Separator decorative style={layout.line} />
      <span>or</span>
      <Separator decorative style={layout.line} />
    </div>
  );
}
