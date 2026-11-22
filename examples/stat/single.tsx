import { Stat } from "@grasp-os/ui/components/stat";
import { InfoIcon, TrendingUpIcon, UsersIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
    gap: space["4"],
    width: "100%",
  },
});

// Three figures standing on their own: a rise that is good, a plain one, and a small fall.
export default function StatSingle() {
  return (
    <div {...stylex.props(layout.row)}>
      <Stat
        label="Total revenue"
        value="€124,567"
        change="+12%"
        variant="success"
        icon={TrendingUpIcon}
      />
      <Stat
        label="Active users"
        value="8,429"
        change="+5%"
        variant="info"
        icon={UsersIcon}
      />
      <Stat
        label="Conversion rate"
        value="3.45%"
        change="−0.2%"
        variant="warning"
        icon={InfoIcon}
      />
    </div>
  );
}
