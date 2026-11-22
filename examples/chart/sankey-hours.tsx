import { ChartSankey } from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 760 },
});

// Where the finance team's October hours went, by process, and how much of each the agents now
// do. The nodes are dithered; by hand is the quiet end.
const nodes = [
  { id: "team", label: "Finance team" },
  { id: "invoicing", label: "Invoicing" },
  { id: "collections", label: "Collections" },
  { id: "close", label: "Month-end close" },
  { id: "reporting", label: "Reporting" },
  { id: "agents", label: "Done by agents" },
  { id: "hand", label: "Done by hand", muted: true },
];

const links = [
  { source: "team", target: "invoicing", value: 420 },
  { source: "team", target: "collections", value: 310 },
  { source: "team", target: "close", value: 290 },
  { source: "team", target: "reporting", value: 220 },
  { source: "invoicing", target: "agents", value: 260 },
  { source: "invoicing", target: "hand", value: 160 },
  { source: "collections", target: "agents", value: 140 },
  { source: "collections", target: "hand", value: 170 },
  { source: "close", target: "agents", value: 90 },
  { source: "close", target: "hand", value: 200 },
  { source: "reporting", target: "agents", value: 150 },
  { source: "reporting", target: "hand", value: 70 },
];

export default function ChartSankeyHours() {
  return (
    <ChartSankey
      aria-label="The finance team's October hours, by process"
      summary="Of 1,240 hours, agents did 640; month-end close is still mostly by hand."
      nodes={nodes}
      links={links}
      pattern="dither-pixels"
      valueFormatter={(value) => `${value.toLocaleString("en-GB")} h`}
      style={layout.wide}
    />
  );
}
