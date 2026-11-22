import {
  ChartContainer,
  ChartGrid,
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
  { week: "W1", runs: 120 },
  { week: "W2", runs: 132 },
  { week: "W3", runs: 128 },
  { week: "W4", runs: 151 },
  { week: "W5", runs: 163 },
  { week: "W6", runs: 158 },
  { week: "W7", runs: 179 },
  { week: "W8", runs: 194 },
];

// A trend: the line alone, nothing filled under it, so two can share the room with a band of
// numbers beside them.
export default function ChartLineTrend() {
  return (
    <ChartContainer
      aria-label="Agent runs by week"
      summary="Up from 120 in the first week to 194 in the eighth."
      data={data}
      xKey="week"
      config={{ runs: { label: "Runs" } }}
      style={layout.wide}
    >
      <ChartGrid />
      <ChartXAxis />
      <ChartYAxis />
      <ChartLine dataKey="runs" />
      <ChartTooltip />
    </ChartContainer>
  );
}
