import { Slider } from "@grasp-os/ui/components/slider";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { effort } from "./effort-levels";

const layout = stylex.create({
  sheet: {
    display: "grid",
    gap: space[5],
    width: "100%",
    maxWidth: "26rem",
  },
});

// Every level at rest, Low to Max, read top to bottom.
export default function SliderLevelsSheet() {
  return (
    <div {...stylex.props(layout.sheet)}>
      {effort.map((level) => (
        <Slider
          variant="levels"
          key={level.id}
          label={`Effort at ${level.label}`}
          showLabel={false}
          levels={effort}
          defaultValue={level.id}
        />
      ))}
    </div>
  );
}
