import {
  ChartBar,
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
  { month: "Jun", spend: 3120 },
  { month: "Jul", spend: 3480 },
  { month: "Aug", spend: 2960 },
  { month: "Sep", spend: 4210 },
  { month: "Oct", spend: 4630 },
  { month: "Nov", spend: 3890 },
];

const euros = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const money = (value: string | number) => euros.format(Number(value));

// A level across the bars: ChartReferenceLine at a value up the side, dashed, its name at its end.
// The axis grows to hold it, and a screen reader hears it after the summary.
export default function ChartReferenceLineExample() {
  return (
    <ChartContainer
      aria-label="Spend by month"
      summary="Over budget in September and October, under it again in November."
      data={data}
      xKey="month"
      config={{ spend: { label: "Spend" } }}
      style={layout.wide}
    >
      <ChartGrid />
      <ChartXAxis />
      <ChartYAxis valueFormatter={money} width={56} />
      <ChartBar dataKey="spend" />
      <ChartReferenceLine y={4000}>Budget</ChartReferenceLine>
      <ChartTooltip valueFormatter={money} />
    </ChartContainer>
  );
}
