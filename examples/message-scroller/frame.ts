import { radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// The box the examples stand a conversation in: a height of its own, the edge, the corner.
export const frame = stylex.create({
  box: {
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.8)`,
    height: `calc(${size.popupHeight} * 0.9)`,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
});
