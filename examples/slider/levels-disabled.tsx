import { Slider } from "@grasp-os/ui/components/slider";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { effort } from "./effort-levels";

const layout = stylex.create({
  box: { display: "grid", gap: space[1], width: "100%", maxWidth: "26rem" },
  why: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
});

// Out of use, with the reason beside it.
export default function SliderLevelsDisabled() {
  return (
    <div {...stylex.props(layout.box)}>
      <Slider
        variant="levels"
        label="Effort"
        levels={effort}
        defaultValue="medium"
        disabled
      />
      <p {...stylex.props(layout.why)}>
        Your plan sets effort for this workspace.
      </p>
    </div>
  );
}
