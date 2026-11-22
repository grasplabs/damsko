import { ChartBarList } from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

// Days Contoso's customers took to pay, this quarter against the same quarter last year, by
// sector. Last year is the quieter bar under each; the first row names both.
const data = [
  { sector: "Public sector and education", now: 52, before: 61 },
  { sector: "Construction", now: 47, before: 44 },
  { sector: "Wholesale", now: 38, before: 42 },
  { sector: "Healthcare", now: 34, before: 39 },
  { sector: "Software", now: 21, before: 26 },
];

export default function ChartBarListCompare() {
  return (
    <ChartBarList
      aria-label="Days to be paid, by sector"
      summary="Every sector paid faster than a year ago except construction, up from 44 to 47 days."
      data={data}
      nameKey="sector"
      config={{ now: { label: "Q3 2026" }, before: { label: "Q3 2025" } }}
      valueFormatter={(value) => `${value} days`}
      style={layout.wide}
    />
  );
}
