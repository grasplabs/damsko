import { Stat, StatGroup } from "@grasp-os/ui/components/stat";
import { CoinsIcon, TrendingDownIcon } from "@grasp-os/ui/lib/icons";

/** The figures that come as data: drawn as Stats with map, beside the one written out. */
const others = [
  {
    label: "Refunds",
    value: "€184",
    change: "+3 since Monday",
    variant: "destructive",
    icon: TrendingDownIcon,
  },
  { label: "Orders", value: "96", change: "+12 on last week" },
] as const;

// The same row, written as Stats: each is a cell of the group, read in order, whether written out
// or made from a list with map.
export default function StatChildren() {
  return (
    <StatGroup aria-label="This week">
      <Stat
        label="Spend"
        value="€2,310"
        change="−4% on last week"
        icon={CoinsIcon}
      />
      {others.map((figure) => (
        <Stat key={figure.label} {...figure} />
      ))}
    </StatGroup>
  );
}
