import { Slider, SliderLabel } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  slider: { width: 320, maxWidth: "100%" },
});

// Two thumbs, each with its own name; the label names the pair.
export default function SliderRange() {
  return (
    <Slider
      defaultValue={[10, 50]}
      max={200}
      thumbLabels={["Smallest team", "Largest team"]}
      style={layout.slider}
    >
      <SliderLabel>Team size</SliderLabel>
    </Slider>
  );
}
