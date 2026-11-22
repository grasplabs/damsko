import { StatGroup } from "@grasp-os/ui/components/stat";
import { CoinsIcon, TrendingDownIcon, UsersIcon } from "@grasp-os/ui/lib/icons";

// One row read together. A rise in returns is bad news, so its variant is destructive.
export default function StatGroupExample() {
  return (
    <StatGroup
      aria-label="This month"
      items={[
        {
          label: "Revenue",
          value: "€45,678",
          change: "+8.2%",
          variant: "success",
          icon: CoinsIcon,
        },
        { label: "Orders", value: "1,234", change: "+15.3%" },
        {
          label: "Customers",
          value: "5,678",
          change: "+12.1%",
          variant: "success",
          icon: UsersIcon,
        },
        {
          label: "Returns",
          value: "89",
          change: "+2.1%",
          variant: "destructive",
          icon: TrendingDownIcon,
        },
      ]}
    />
  );
}
