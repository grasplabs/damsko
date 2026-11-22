import { SectionHeader } from "@grasp-os/ui/components/section-header";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

export default function SectionHeaderLoading() {
  return (
    <SectionHeader
      title="Usage"
      description="Seats and storage used this month, across every workspace."
      loading
      style={layout.wide}
    />
  );
}
