import {
  ChartContainer,
  ChartGrid,
  ChartLabels,
  ChartLine,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

// Contoso's cash at each month's end, this year against last, in thousands of euros. Last year
// is the quieter line; each is named at its end.
const data = [
  { month: "Jan", now: 412, before: 388 },
  { month: "Feb", now: 398, before: 371 },
  { month: "Mar", now: 436, before: 360 },
  { month: "Apr", now: 451, before: 384 },
  { month: "May", now: 447, before: 402 },
  { month: "Jun", now: 489, before: 396 },
  { month: "Jul", now: 472, before: 415 },
  { month: "Aug", now: 503, before: 421 },
  { month: "Sep", now: 528, before: 433 },
  { month: "Oct", now: 541, before: 440 },
];

export default function ChartLinesCompare() {
  return (
    <ChartContainer
      aria-label="Cash at month end, 2026 against 2025"
      summary="€541k at the end of October, €101k more than a year before."
      data={data}
      xKey="month"
      config={{ now: { label: "2026" }, before: { label: "2025" } }}
      style={layout.wide}
    >
      <ChartGrid />
      <ChartXAxis />
      <ChartYAxis />
      <ChartLine dataKey="before" variant="muted" />
      <ChartLine dataKey="now" />
      <ChartLabels />
      <ChartTooltip
        sortOrder="descending"
        valueFormatter={(value) => `€${value}k`}
      />
    </ChartContainer>
  );
}
