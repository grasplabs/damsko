import { ChartBarList } from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

const euros = new Intl.NumberFormat("en-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

// Where Contoso's October money went, by supplier: the names read where each bar starts.
const data = [
  { supplier: "Payroll and pension contributions", spend: 184_200 },
  { supplier: "Office rent, Kade 12", spend: 38_500 },
  { supplier: "Cloud hosting", spend: 21_740 },
  { supplier: "Software licences", spend: 12_310 },
  { supplier: "Legal and accounting advice", spend: 9860 },
  { supplier: "Travel and accommodation", spend: 4120 },
];

export default function ChartBarListPixels() {
  return (
    <ChartBarList
      aria-label="October spend by supplier"
      summary="Payroll took three quarters of October's €270,730; travel the least."
      data={data}
      nameKey="supplier"
      config={{ spend: { label: "Spend" } }}
      pattern="dither-pixels"
      valueFormatter={(value) => euros.format(value)}
      style={layout.wide}
    />
  );
}
