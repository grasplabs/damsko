import { Skeleton } from "@grasp-os/ui/components/skeleton";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  region: { display: "grid", width: 360, maxWidth: "100%" },
  title: { width: "60%", marginBlockEnd: space["2"] },
  last: { width: "75%" },
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

// A title and a paragraph: each line as tall as the line of words it stands for, so the
// paragraph takes the same room before and after; the last line shorter.
export default function SkeletonText() {
  return (
    <div aria-busy="true" {...stylex.props(layout.region)}>
      <span role="status" {...stylex.props(layout.said)}>
        Loading the summary
      </span>
      <Skeleton size="lg" style={layout.title} />
      <Skeleton />
      <Skeleton />
      <Skeleton style={layout.last} />
    </div>
  );
}
