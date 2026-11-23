import { AspectRatio } from "@grasp-os/ui/components/aspect-ratio";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  card: {
    margin: 0,
    width: "100%",
    maxWidth: 320,
    overflow: "hidden",
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    backgroundColor: colors.card,
  },
  fill: { width: "100%", height: "100%", backgroundColor: colors.muted },
  caption: {
    margin: 0,
    padding: space["4"],
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
});

export default function AspectRatioFlush() {
  return (
    <figure {...stylex.props(look.card)}>
      <AspectRatio ratio={16 / 9} rounded={false}>
        <div {...stylex.props(look.fill)} />
      </AspectRatio>
      <figcaption {...stylex.props(look.caption)}>
        The frame cuts the corner; the box sits flush.
      </figcaption>
    </figure>
  );
}
