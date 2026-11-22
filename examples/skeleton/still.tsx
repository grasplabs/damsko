import { Skeleton } from "@grasp-os/ui/components/skeleton";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  region: { display: "grid", width: 360, maxWidth: "100%" },
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

// The soft fill, still. In a long list, many breathing at once is noise: these stand still.
export default function SkeletonStill() {
  return (
    <div aria-busy="true" {...stylex.props(layout.region)}>
      <span role="status" {...stylex.props(layout.said)}>
        Loading the list
      </span>
      <Skeleton animation={false} />
      <Skeleton animation={false} />
      <Skeleton animation={false} />
    </div>
  );
}
