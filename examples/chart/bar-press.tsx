"use client";

import {
  ChartBar,
  ChartContainer,
  ChartGrid,
  ChartLegend,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from "@grasp-os/ui/components/chart";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: { display: "grid", gap: space["3"], width: "100%", maxWidth: 560 },
  wide: { width: "100%" },
  words: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

const counts = [
  [18, 9],
  [22, 12],
  [15, 8],
  [6, 2],
  [4, 1],
  [24, 14],
  [27, 11],
  [21, 13],
  [25, 9],
  [19, 10],
  [5, 3],
  [3, 2],
  [23, 11],
  [26, 15],
];
const data = counts.map(([email = 0, chat = 0], index) => ({
  day: `${index + 1} November`,
  email,
  chat,
}));

// The day's number alone along the bottom; the tooltip and each bar's name say the whole date.
const dayOnly = (value: string | number) => String(value).split(" ")[0] ?? "";

// Each day is a button: press one, or Tab to the bars, move with the arrow keys and press Enter or
// Space, to show only that day; press it again to show every day. `selectedIndex` marks it.
export default function ChartBarPress() {
  const [day, setDay] = useState<number | null>(null);
  const picked = day === null ? undefined : data[day];
  return (
    <div {...stylex.props(layout.column)}>
      <ChartContainer
        aria-label="Tickets per day, by channel"
        summary="Busiest on weekdays, quiet at the weekends."
        data={data}
        xKey="day"
        xLabel="Day"
        config={{ email: { label: "Email" }, chat: { label: "Chat" } }}
        onRowClick={(_row, index) => {
          setDay(index === day ? null : index);
        }}
        selectedIndex={day}
        style={layout.wide}
      >
        <ChartGrid />
        <ChartXAxis valueFormatter={dayOnly} />
        <ChartYAxis />
        <ChartBar dataKey="email" stackId="channel" />
        <ChartBar dataKey="chat" stackId="channel" />
        <ChartTooltip />
        <ChartLegend />
      </ChartContainer>
      <p aria-live="polite" {...stylex.props(layout.words)}>
        {picked === undefined
          ? "Every day. Press a day to show only that one."
          : `Only ${picked.day}: ${picked.email + picked.chat} tickets.`}
      </p>
    </div>
  );
}
