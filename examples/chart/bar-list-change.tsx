import { ChartBarList } from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

const euros = new Intl.NumberFormat("en-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

// A value below zero is written with a real minus sign (−), as people read it: the number format
// writes a hyphen.
const signed = (value: number) => euros.format(value).replace("-", "\u2212");

// Budget left at the end of October, by team: two teams are over, and their bars run the other
// way from zero.
const data = [
  { team: "Engineering", left: 18_400 },
  { team: "Customer success", left: 7950 },
  { team: "Finance and operations", left: 3200 },
  { team: "Marketing", left: -2780 },
  { team: "Sales", left: -6150 },
];

export default function ChartBarListChange() {
  return (
    <ChartBarList
      aria-label="Budget left by team, October"
      summary="Three teams are under budget; sales is €6,150 over and marketing €2,780."
      data={data}
      nameKey="team"
      config={{ left: { label: "Budget left" } }}
      pattern="dither-pixels"
      valueFormatter={signed}
      style={layout.wide}
    />
  );
}
