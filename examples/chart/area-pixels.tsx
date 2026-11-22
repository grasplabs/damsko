import {
  ChartArea,
  ChartContainer,
  ChartGrid,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

const data = [
  { month: "Jan", solved: 40 },
  { month: "Feb", solved: 46 },
  { month: "Mar", solved: 44 },
  { month: "Apr", solved: 58 },
  { month: "May", solved: 63 },
  { month: "Jun", solved: 72 },
];

export default function ChartAreaPixels() {
  return (
    <ChartContainer
      aria-label="Tickets solved by month"
      summary="Up from 40 in January to 72 in June."
      data={data}
      xKey="month"
      config={{ solved: { label: "Solved" } }}
      style={layout.wide}
    >
      <ChartGrid />
      <ChartXAxis />
      <ChartYAxis />
      <ChartArea dataKey="solved" pattern="dither-pixels" />
      <ChartTooltip />
    </ChartContainer>
  );
}
