import { Button } from "@grasp-os/ui/components/button";
import { SectionHeader } from "@grasp-os/ui/components/section-header";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

// The section's action stays on the title's row while it fits beside the words, the title wrapping
// beside it; it goes under the title only when it does not.
export default function SectionHeaderActions() {
  return (
    <SectionHeader
      title="Usage across every workspace this month"
      description="Seats and storage, counted each night."
      actions={
        <Button size="sm" variant="outline">
          Export
        </Button>
      }
      style={layout.wide}
    />
  );
}
