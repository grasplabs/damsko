import { Slider } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

import { detail, effort } from "./effort-levels";

// A state cell centres what it holds, so the slider is given its width.
const layout = stylex.create({
  cell: { width: "14rem", maxWidth: "100%" },
});

// One slider in one state. The docs draw it once per state; hover, keyboard focus and a press are
// forced from the slider's own CSS.
export default function SliderLevelsState({
  value = "medium",
  scale = "five",
  size = "sm",
  disabled = false,
}: {
  value?: string;
  scale?: "five" | "three" | "none";
  size?: "sm" | "default";
  disabled?: boolean;
}) {
  const levels = { five: effort, three: detail, none: [] }[scale];
  return (
    <Slider
      variant="levels"
      style={layout.cell}
      label="Effort"
      levels={levels}
      defaultValue={value}
      size={size}
      disabled={disabled}
      emptyLabel="This model has one level of effort."
    />
  );
}
