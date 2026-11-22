import { ChartPie } from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

// How Contoso's October invoices arrived: three parts, named in the list beside the ring, the
// total in its centre.
export default function ChartRingNamed() {
  return (
    <ChartPie
      aria-label="October's incoming invoices, by how they arrived"
      summary="Half of 1,217 invoices came as e-invoices; one in eight still on paper."
      values={{ einvoice: 612, email: 455, paper: 150 }}
      config={{
        einvoice: { label: "E-invoice" },
        email: { label: "PDF by email" },
        paper: { label: "Paper, scanned" },
      }}
      caption="invoices in October"
      style={layout.wide}
    />
  );
}
