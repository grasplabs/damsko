import { ChartPie } from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

// One share: how much of the year's collections target Contoso has reached, on a faint track.
export default function ChartRingShare() {
  return (
    <ChartPie
      aria-label="Collections against the year's target"
      summary="62% of the €4.2m target collected by the end of October."
      values={{ collected: 62 }}
      total={100}
      config={{ collected: { label: "Collected" } }}
      caption="of the year's target collected"
      valueFormatter={(value) => `${value}%`}
      style={layout.wide}
    />
  );
}
