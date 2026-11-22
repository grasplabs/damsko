import { ChartPie } from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

const euros = new Intl.NumberFormat("en-NL", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Where October's operating costs went, in five parts. Every value to one decimal, so the column
// reads as one precision (€14.0K, not €14K under €24.1K). Hover a row or a part and the centre
// says it.
export default function ChartRingList() {
  return (
    <ChartPie
      aria-label="October's operating costs"
      summary="People cost €184k of €271k; rent, software and hosting most of the rest."
      values={{
        people: 184_200,
        rent: 38_500,
        software: 24_050,
        advice: 13_980,
        other: 10_000,
      }}
      config={{
        people: { label: "People" },
        rent: { label: "Rent and facilities" },
        software: { label: "Software and hosting" },
        advice: { label: "Legal and accounting" },
        other: { label: "Everything else" },
      }}
      caption="spent in October"
      valueFormatter={(value) => euros.format(value)}
      pattern="dither-pixels"
      style={layout.wide}
    />
  );
}
