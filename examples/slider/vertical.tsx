import { Slider } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  slider: { height: 200 },
});

// Upright: Arrow Up raises it, Arrow Down lowers it. Its height comes from `style`.
export default function SliderVertical() {
  return (
    <Slider
      label="Level"
      orientation="vertical"
      defaultValue={60}
      style={layout.slider}
    />
  );
}
