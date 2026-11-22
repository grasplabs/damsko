import {
  ChartContainer,
  ChartGrid,
  ChartLegend,
  ChartLine,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

const data = [
  { month: "Jan", opened: 52, closed: 40 },
  { month: "Feb", opened: 49, closed: 46 },
  { month: "Mar", opened: 55, closed: 44 },
  { month: "Apr", opened: 61, closed: 58 },
  { month: "May", opened: 60, closed: 63 },
  { month: "Jun", opened: 66, closed: 72 },
];

// Two lines named under the chart: ChartLegend lists each series by its name in the config.
export default function ChartLegendExample() {
  return (
    <ChartContainer
      aria-label="Tickets opened and closed by month"
      summary="Closed overtook opened in May."
      data={data}
      xKey="month"
      xLabel="Month"
      config={{ opened: { label: "Opened" }, closed: { label: "Closed" } }}
      style={layout.wide}
    >
      <ChartGrid />
      <ChartXAxis />
      <ChartYAxis />
      <ChartLine dataKey="opened" variant="dashed" />
      <ChartLine dataKey="closed" />
      <ChartTooltip sortOrder="descending" />
      <ChartLegend />
    </ChartContainer>
  );
}
