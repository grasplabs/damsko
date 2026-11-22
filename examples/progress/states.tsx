import { Progress, ProgressCircle } from "@grasp-os/ui/components/progress";
import type { ProgressVariant } from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  bar: { width: 136 },
});

// One progress in one state. The docs draw it once per state, without its words so each fits its
// cell; a ring keeps its own size. In a product the value comes from the task.
export default function ProgressState({
  value = 40,
  variant = "default",
  part = "bar",
}: {
  value?: number | null;
  variant?: ProgressVariant;
  part?: "bar" | "circle";
}) {
  return part === "circle" ? (
    <ProgressCircle
      label="Exporting the report"
      value={value}
      variant={variant}
    />
  ) : (
    <Progress
      label="Exporting the report"
      value={value}
      variant={variant}
      showLabel={false}
      style={layout.bar}
    />
  );
}
