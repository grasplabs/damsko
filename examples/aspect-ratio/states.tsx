import { AspectRatio } from "@grasp-os/ui/components/aspect-ratio";
import { colors, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  // The cell is one control tall: the box takes that height, so its width shows the ratio.
  holder: { height: size.tapTarget },
  shape: (ratio: number) => ({ aspectRatio: ratio }),
  // Stands in for an image: it fills the box.
  fill: { width: "100%", height: "100%", backgroundColor: colors.border },
});

// One box at one ratio. The docs draw it once per ratio; it has no states of its own.
export default function AspectRatioState({
  ratio = 16 / 9,
  rounded = true,
}: {
  ratio?: number;
  rounded?: boolean;
}) {
  return (
    <div {...stylex.props(look.holder, look.shape(ratio))}>
      <AspectRatio ratio={ratio} rounded={rounded}>
        <div {...stylex.props(look.fill)} />
      </AspectRatio>
    </div>
  );
}
