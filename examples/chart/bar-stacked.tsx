import {
  ChartBar,
  ChartContainer,
  ChartGrid,
  ChartLegend,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

const data = [
  { month: "Jan", email: 22, chat: 12, phone: 6 },
  { month: "Feb", email: 24, chat: 15, phone: 7 },
  { month: "Mar", email: 21, chat: 17, phone: 6 },
  { month: "Apr", email: 26, chat: 23, phone: 9 },
  { month: "May", email: 25, chat: 29, phone: 9 },
  { month: "Jun", email: 27, chat: 34, phone: 11 },
];

// Each month's tickets split by where they came in: the ChartBars share a `stackId`, and each
// series takes a chart tone by its place in the config, the first at the foot.
export default function ChartBarStacked() {
  return (
    <ChartContainer
      aria-label="Tickets solved by month, by channel"
      summary="Chat grew from 12 in January to 34 in June, and now brings in the most."
      data={data}
      xKey="month"
      config={{
        email: { label: "Email" },
        chat: { label: "Chat" },
        phone: { label: "Phone" },
      }}
      style={layout.wide}
    >
      <ChartGrid />
      <ChartXAxis />
      <ChartYAxis />
      <ChartBar dataKey="email" stackId="channel" />
      <ChartBar dataKey="chat" stackId="channel" />
      <ChartBar dataKey="phone" stackId="channel" />
      <ChartTooltip />
      <ChartLegend />
    </ChartContainer>
  );
}
