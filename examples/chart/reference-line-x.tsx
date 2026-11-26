import {
  ChartArea,
  ChartContainer,
  ChartGrid,
  ChartReferenceLine,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

const data = [
  { month: "Jan", signups: 120 },
  { month: "Feb", signups: 132 },
  { month: "Mar", signups: 128 },
  { month: "Apr", signups: 190 },
  { month: "May", signups: 236 },
  { month: "Jun", signups: 251 },
];

// A moment along the bottom: ChartReferenceLine at an `x` runs up the drawing, its name at the top.
export default function ChartReferenceLineX() {
  return (
    <ChartContainer
      aria-label="Sign-ups by month"
      summary="Up by half within two months of the April launch."
      data={data}
      xKey="month"
      config={{ signups: { label: "Sign-ups" } }}
      style={layout.wide}
    >
      <ChartGrid />
      <ChartXAxis />
      <ChartYAxis />
      <ChartArea dataKey="signups" />
      <ChartReferenceLine x="Apr">Launch</ChartReferenceLine>
      <ChartTooltip />
    </ChartContainer>
  );
}
