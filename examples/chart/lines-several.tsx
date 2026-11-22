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

// Invoices Contoso's four companies booked each week. Told apart by line, never by colour, and
// named at their ends; where two end close together, their names step apart.
const data = [
  { week: "W36", holding: 212, logistics: 148, retail: 96, services: 61 },
  { week: "W37", holding: 224, logistics: 151, retail: 104, services: 66 },
  { week: "W38", holding: 219, logistics: 163, retail: 118, services: 70 },
  { week: "W39", holding: 241, logistics: 170, retail: 121, services: 82 },
  { week: "W40", holding: 236, logistics: 182, retail: 133, services: 91 },
  { week: "W41", holding: 252, logistics: 179, retail: 146, services: 104 },
  { week: "W42", holding: 248, logistics: 191, retail: 160, services: 118 },
  { week: "W43", holding: 263, logistics: 188, retail: 171, services: 127 },
];

export default function ChartLinesSeveral() {
  return (
    <ChartContainer
      aria-label="Invoices booked per week, by company"
      summary="All four rose; retail and logistics now book about the same, near 180 a week."
      data={data}
      xKey="week"
      config={{
        holding: { label: "Holding" },
        logistics: { label: "Logistics" },
        retail: { label: "Retail" },
        services: { label: "Services" },
      }}
      style={layout.wide}
    >
      <ChartGrid />
      <ChartXAxis />
      <ChartYAxis />
      <ChartLine dataKey="holding" />
      <ChartLine dataKey="logistics" variant="dashed" />
      <ChartLine dataKey="retail" variant="dotted" />
      <ChartLine dataKey="services" variant="thin" />
      <ChartLabels />
      <ChartTooltip sortOrder="descending" />
    </ChartContainer>
  );
}
