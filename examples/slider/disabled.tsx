import { Slider } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  slider: { width: 320, maxWidth: "100%" },
});

export default function SliderDisabled() {
  return (
    <Slider
      label="Retention in days"
      description="Set by an owner for the whole workspace."
      defaultValue={90}
      max={365}
      disabled
      style={layout.slider}
    />
  );
}
