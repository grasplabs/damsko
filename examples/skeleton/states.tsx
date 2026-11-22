import { Skeleton } from "@grasp-os/ui/components/skeleton";
import type {
  SkeletonProps,
  SkeletonSize,
  SkeletonVariant,
} from "@grasp-os/ui/components/skeleton";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  line: { width: 120 },
  block: { width: 64, height: 36 },
});

// One skeleton in one state. The docs draw it once per variant and text size, in the wave and in
// the pulse, small enough for each cell. In a product its size comes from the content it stands for.
export default function SkeletonState({
  variant = "text",
  size = "sm",
  animation = "wave",
}: {
  variant?: SkeletonVariant;
  size?: SkeletonSize;
  animation?: SkeletonProps["animation"];
}) {
  const room =
    variant === "text"
      ? layout.line
      : variant === "rectangular"
        ? layout.block
        : undefined;
  return (
    <Skeleton
      variant={variant}
      size={size}
      animation={animation}
      style={room}
    />
  );
}
