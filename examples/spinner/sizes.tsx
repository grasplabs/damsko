import { Spinner } from "@grasp-os/ui/components/spinner";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: { display: "flex", alignItems: "center", gap: space["6"] },
});

// Three sizes side by side. With no label each is hidden from a screen reader; the page around a
// real spinner says what is loading.
export default function SpinnerSizes() {
  return (
    <div {...stylex.props(layout.row)}>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </div>
  );
}
