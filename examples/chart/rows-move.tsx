import { Button } from "@grasp-os/ui/components/button";
import {
  ChartBar,
  ChartBarList,
  ChartContainer,
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
  actions: { display: "flex", gap: space["2"] },
});

const first = [
  { team: "Alpha", tickets: 30 },
  { team: "Beta", tickets: 20 },
  { team: "Gamma", tickets: 10 },
];

// For the spec only (tests/chart.spec.ts), at /examples/chart/rows-move; not on the page. A row
// added at the top, and the rows turned round: each row keeps its own element in the bar list and
// in the chart's table, so only the new one grows.
export default function ChartRowsMove() {
  const [rows, setRows] = useState(first);
  return (
    <div {...stylex.props(layout.column)}>
      <ChartBarList
        aria-label="Tickets by team"
        summary="Tickets open for each team."
        data={rows}
        nameKey="team"
        sortOrder="none"
        config={{ tickets: { label: "Tickets" } }}
        style={layout.wide}
      />
      <ChartContainer
        aria-label="Tickets by team, as bars"
        summary="Tickets open for each team."
        data={rows}
        xKey="team"
        config={{ tickets: { label: "Tickets" } }}
        style={layout.wide}
      >
        <ChartBar dataKey="tickets" pattern="none" />
      </ChartContainer>
      <div {...stylex.props(layout.actions)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRows((was) => [{ team: "Delta", tickets: 40 }, ...was]);
          }}
        >
          Add Delta at the top
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRows((was) => was.toReversed());
          }}
        >
          Turn the rows round
        </Button>
      </div>
    </div>
  );
}
