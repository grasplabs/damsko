import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";

const costs = [
  { item: "Venue hire", category: "Events", amount: "€2,400.00" },
  { item: "Printing", category: "Materials", amount: "€310.50" },
  { item: "Travel", category: "Team", amount: "€1,125.00" },
];

export default function TableFooterExample() {
  return (
    <Table caption="Costs for the spring workshop.">
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Category</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {costs.map((cost) => (
          <TableRow key={cost.item}>
            <TableCell rowHeader>{cost.item}</TableCell>
            <TableCell>{cost.category}</TableCell>
            <TableCell align="end">{cost.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell align="end">€3,835.50</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
