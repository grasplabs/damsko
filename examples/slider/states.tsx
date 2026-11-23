import { Slider, SliderLabel } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  slider: { width: 140, maxWidth: "100%" },
});

// One slider in one state. The docs draw it once per state; keyboard focus and pressed are forced
// from the slider's own CSS.
export default function SliderState({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  return (
    <Slider
      showValue={false}
      defaultValue={40}
      disabled={disabled}
      style={layout.slider}
    >
      <SliderLabel>Volume</SliderLabel>
    </Slider>
  );
}
