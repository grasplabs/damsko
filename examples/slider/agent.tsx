import { Slider, SliderLabel } from "@grasp-os/ui/components/slider";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, used by tests/slider.spec.ts.
pageAgent();

export default function SliderAgent() {
  return (
    <Slider defaultValue={40}>
      <SliderLabel>Volume</SliderLabel>
    </Slider>
  );
}
