import { Slider } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  slider: { width: 320, maxWidth: "100%" },
});

export default function SliderBasic() {
  return <Slider label="Volume" defaultValue={40} style={layout.slider} />;
}
