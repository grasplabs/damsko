import { ChartSankey } from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 760 },
});

// Where Contoso's October invoices went: matched by themselves or by a person, approved or
// disputed, then paid or still waiting. Disputed and waiting are the quiet ends.
const nodes = [
  { id: "received", label: "Received" },
  { id: "auto", label: "Matched automatically" },
  { id: "person", label: "Needs a person" },
  { id: "approved", label: "Approved" },
  { id: "disputed", label: "Disputed", muted: true },
  { id: "paid", label: "Paid" },
  { id: "waiting", label: "Waiting", muted: true },
];

const links = [
  { source: "received", target: "auto", value: 812 },
  { source: "received", target: "person", value: 405 },
  { source: "auto", target: "approved", value: 798 },
  { source: "auto", target: "disputed", value: 14 },
  { source: "person", target: "approved", value: 358 },
  { source: "person", target: "disputed", value: 47 },
  { source: "approved", target: "paid", value: 1021 },
  { source: "approved", target: "waiting", value: 135 },
];

export default function ChartSankeyInvoices() {
  return (
    <ChartSankey
      aria-label="Where October's incoming invoices went"
      summary="Of 1,217 invoices, two in three matched an order by themselves; 1,021 are paid, 135 wait and 61 are disputed."
      nodes={nodes}
      links={links}
      style={layout.wide}
    />
  );
}
