import { Stat, StatGroup } from "@grasp-os/ui/components/stat";
import { CoinsIcon, TrendingDownIcon } from "@grasp-os/ui/lib/icons";

// The same row, written as Stats: each is a cell of the group, read in order.
export default function StatChildren() {
  return (
    <StatGroup aria-label="This week">
      <Stat
        label="Spend"
        value="€2,310"
        change="−4% on last week"
        icon={CoinsIcon}
      />
      <Stat
        label="Refunds"
        value="€184"
        change="+3 since Monday"
        variant="destructive"
        icon={TrendingDownIcon}
      />
    </StatGroup>
  );
}
