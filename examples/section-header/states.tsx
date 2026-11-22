import { SectionHeader } from "@grasp-os/ui/components/section-header";
import * as stylex from "@stylexjs/stylex";

// A header runs the width of its column, its words at the start: the stage gives it a line to
// itself, its caption above it at the start too.
const layout = stylex.create({
  wide: { width: "100%" },
});

// One header in one state: at rest, or loading with a placeholder where the title will be. A
// header has nothing to hover or press, so each cell passes props; its actions keep their own.
export default function SectionHeaderState({
  loading = false,
}: {
  loading?: boolean;
}) {
  return <SectionHeader title="Usage" loading={loading} style={layout.wide} />;
}
