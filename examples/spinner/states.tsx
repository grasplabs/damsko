import { Spinner } from "@grasp-os/ui/components/spinner";
import type { SpinnerSize } from "@grasp-os/ui/components/spinner";
import { colors } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const colours = stylex.create({
  ink: { display: "flex", color: colors.foreground },
  muted: { display: "flex", color: colors.mutedForeground },
});

// One spinner in one state. The docs draw it at each size, and in the colour of the words it
// stands in. It has no hover, focus or press: it says something is working, it is not pressed.
export default function SpinnerState({
  size = "sm",
  colour = "ink",
}: {
  size?: SpinnerSize;
  colour?: "ink" | "muted";
}) {
  return (
    <span {...stylex.props(colours[colour])}>
      <Spinner size={size} aria-label="Loading" />
    </span>
  );
}
