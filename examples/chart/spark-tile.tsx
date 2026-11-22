"use client";

import { ChartSparkline } from "@grasp-os/ui/components/chart";
import { Stat } from "@grasp-os/ui/components/stat";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
    gap: space["4"],
    width: "100%",
  },
});

const euros = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const weeks = Array.from({ length: 12 }, (_, index) => `Week ${index + 33}`);

const cash = [412, 398, 436, 451, 447, 489, 472, 503, 528, 541, 534, 556].map(
  (value) => value * 1000
);
const overdue = [96, 102, 99, 91, 88, 84, 86, 79, 74, 70, 66, 61].map(
  (value) => value * 1000
);

// A highlight with its trend under the figure. Point at the spark, or Tab to it and use the arrow
// keys: the figure itself says that week, and comes back when you leave.
const Tile = ({
  title,
  values,
  change,
  tone,
  area,
}: {
  title: string;
  values: number[];
  change: string;
  tone: "success" | "destructive";
  area: boolean;
}) => {
  const [week, setWeek] = useState<number | null>(null);
  const shown = week === null ? (values.at(-1) ?? 0) : (values[week] ?? 0);
  return (
    <Stat
      label={week === null ? title : `${title}, ${weeks[week] ?? ""}`}
      value={euros.format(shown)}
      change={week === null ? change : ""}
      variant={tone}
      chart={
        <ChartSparkline
          aria-label={`${title}, the last twelve weeks`}
          summary={`${change} over twelve weeks.`}
          values={values}
          size="lg"
          area={area}
          showHighlight="last"
          onHighlightChange={setWeek}
          pointLabels={weeks}
          valueFormatter={(value) => euros.format(value)}
        />
      }
    />
  );
};

export default function ChartSparkTile() {
  return (
    <div {...stylex.props(layout.row)}>
      <Tile
        title="Cash at week end"
        values={cash}
        change="+35%"
        tone="success"
        area
      />
      <Tile
        title="Overdue invoices"
        values={overdue}
        change="−36%"
        tone="success"
        area={false}
      />
    </div>
  );
}
