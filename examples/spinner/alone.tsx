import { Spinner } from "@grasp-os/ui/components/spinner";
import { colors, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  panel: {
    display: "grid",
    placeItems: "center",
    width: 360,
    maxWidth: "100%",
    height: size.emptySection,
    color: colors.mutedForeground,
  },
});

// Alone in a panel that is still loading, large and in the panel's quiet colour.
export default function SpinnerAlone() {
  return (
    <div {...stylex.props(layout.panel)}>
      <Spinner size="lg" aria-label="Loading the update" />
    </div>
  );
}
