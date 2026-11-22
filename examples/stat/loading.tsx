import { StatGroup } from "@grasp-os/ui/components/stat";

// While the figures load, skeletons hold their room; the labels are known and show at once.
export default function StatLoading() {
  return (
    <StatGroup
      aria-label="This quarter"
      loading
      items={[
        { label: "Revenue", value: "", change: "" },
        { label: "Orders", value: "", change: "" },
        { label: "Average order", value: "" },
      ]}
    />
  );
}
