import { Slider, SliderLabel } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

import { effort } from "./effort-levels";

const layout = stylex.create({ box: { width: "100%", maxWidth: "26rem" } });

// Five levels of effort: the track of dots, lit up to the thumb, Max a state of its own.
export default function SliderLevelsBasic() {
  return (
    <div {...stylex.props(layout.box)}>
      <Slider variant="levels" levels={effort} defaultValue="high">
        <SliderLabel>Effort</SliderLabel>
      </Slider>
    </div>
  );
}
