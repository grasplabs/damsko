import { Slider } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

import { detail } from "./effort-levels";

const layout = stylex.create({ box: { width: "100%", maxWidth: "26rem" } });

// Three levels: three stops on the same track. Under four levels the last is not extra.
export default function SliderLevelsThreeLevels() {
  return (
    <div {...stylex.props(layout.box)}>
      <Slider
        variant="levels"
        label="Detail"
        levels={detail}
        defaultValue="standard"
      />
    </div>
  );
}
