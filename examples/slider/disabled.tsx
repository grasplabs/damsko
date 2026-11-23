import { Slider, SliderLabel } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  slider: { width: 320, maxWidth: "100%" },
});

export default function SliderDisabled() {
  return (
    <Slider
      description="Set by an owner for the whole workspace."
      defaultValue={90}
      max={365}
      disabled
      style={layout.slider}
    >
      <SliderLabel>Retention in days</SliderLabel>
    </Slider>
  );
}
