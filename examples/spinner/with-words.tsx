import { Spinner } from "@grasp-os/ui/components/spinner";
import { colors, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    margin: 0,
    color: colors.mutedForeground,
  },
});

// Beside words that say what is working, in their colour. The words are the status; the spinner
// has no label of its own, so a screen reader says them once.
export default function SpinnerWithWords() {
  return (
    <p role="status" {...stylex.props(layout.row)}>
      <Spinner />
      Loading the report
    </p>
  );
}
