import { Button } from "@grasp-os/ui/components/button";
import {
  ChartBar,
  ChartContainer,
  ChartGrid,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from "@grasp-os/ui/components/chart";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["4"],
    justifyItems: "start",
    width: "100%",
    maxWidth: 560,
  },
  wide: { width: "100%" },
});

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
// Eight working days from the given one: a day's name stands twice.
const days = (first: number) =>
  Array.from({ length: 8 }, (_, index) => ({
    day: weekdays[(first + index) % weekdays.length] ?? "",
    orders: 10 + first * 5 + index * 3,
  }));

// Eight working days, so a day's name stands twice: each bar is its own row in the chart's table,
// in order, and stays so as the days shift.
export default function ChartSameNames() {
  const [first, setFirst] = useState(0);
  return (
    <div {...stylex.props(layout.column)}>
      <ChartContainer
        aria-label="Orders by day"
        summary="Orders on each of eight working days."
        data={days(first)}
        xKey="day"
        config={{ orders: { label: "Orders" } }}
        style={layout.wide}
      >
        <ChartGrid />
        <ChartXAxis />
        <ChartYAxis />
        <ChartBar dataKey="orders" pattern="none" />
        <ChartTooltip />
      </ChartContainer>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setFirst((was) => (was === 0 ? 2 : 0));
        }}
      >
        Start on another day
      </Button>
    </div>
  );
}
