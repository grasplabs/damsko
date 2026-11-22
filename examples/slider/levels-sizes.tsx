import { Slider } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

import { effort } from "./effort-levels";

const layout = stylex.create({
  column: { display: "grid", gap: "2rem", width: "100%", maxWidth: "26rem" },
});

// The default size on a page or in a form; the small one inside a popup or a menu, beside other rows.
export default function SliderLevelsSizes() {
  return (
    <div {...stylex.props(layout.column)}>
      <Slider
        variant="levels"
        label="Effort, default"
        levels={effort}
        defaultValue="high"
      />
      <Slider
        variant="levels"
        label="Effort, small"
        size="sm"
        levels={effort}
        defaultValue="high"
      />
    </div>
  );
}
