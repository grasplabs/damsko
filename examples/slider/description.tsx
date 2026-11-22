import { Slider } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  slider: { width: 320, maxWidth: "100%" },
});

export default function SliderDescription() {
  return (
    <Slider
      label="Share of the budget"
      description="The part of this month's budget the campaign may spend."
      defaultValue={0.3}
      max={1}
      step={0.01}
      format={{ style: "percent" }}
      style={layout.slider}
    />
  );
}
