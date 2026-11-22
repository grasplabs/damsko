import { Skeleton } from "@grasp-os/ui/components/skeleton";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  region: { display: "grid", gap: space["4"], width: 360, maxWidth: "100%" },
  person: { display: "flex", alignItems: "center", gap: space["3"] },
  name: { display: "grid", flexGrow: 1, minWidth: 0 },
  short: { width: "40%" },
  chart: { height: "auto", aspectRatio: "16 / 9" },
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

// A person's update while it loads: their avatar, name and role, then the chart they shared.
export default function SkeletonLayout() {
  return (
    <div aria-busy="true" {...stylex.props(layout.region)}>
      <span role="status" {...stylex.props(layout.said)}>
        Loading the update
      </span>
      <div {...stylex.props(layout.person)}>
        <Skeleton variant="circular" />
        <div {...stylex.props(layout.name)}>
          <Skeleton />
          <Skeleton style={layout.short} />
        </div>
      </div>
      <Skeleton variant="rectangular" style={layout.chart} />
    </div>
  );
}
