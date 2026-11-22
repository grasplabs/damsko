import { Skeleton } from "@grasp-os/ui/components/skeleton";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  region: {
    display: "grid",
    gap: space["4"],
    width: 360,
    maxWidth: "100%",
    justifyItems: "start",
  },
  // Said to a screen reader, never seen: the region says what loads; the placeholders are hidden.
  said: {
    position: "absolute",
    width: 1,
    height: 1,
    margin: -1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});

export default function SkeletonShapes() {
  return (
    <div aria-busy="true" {...stylex.props(layout.region)}>
      <span role="status" {...stylex.props(layout.said)}>
        Loading
      </span>
      <Skeleton />
      <Skeleton variant="rectangular" />
      <Skeleton variant="circular" />
    </div>
  );
}
