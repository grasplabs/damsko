import { ChartSparkline } from "@grasp-os/ui/components/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";

const euros = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

// Contoso's largest customers: twelve weeks of invoiced revenue as a spark beside the quarter's
// figure, each marked at its last week. The number says the value; the spark says the way it went.
const customers = [
  {
    name: "Tailspin Logistics",
    weeks: [38, 41, 40, 44, 47, 46, 49, 52, 51, 55, 58, 61],
    total: 582_000,
    change: "+18%",
  },
  {
    name: "Van Dijk Bouw",
    weeks: [52, 50, 51, 47, 45, 46, 43, 41, 42, 39, 37, 36],
    total: 529_000,
    change: "−21%",
  },
  {
    name: "Northgate Council",
    weeks: [31, 31, 32, 31, 31, 32, 32, 31, 32, 32, 31, 32],
    total: 378_000,
    change: "0%",
  },
  {
    name: "Kustlijn Retail",
    weeks: [18, 26, 21, 30, 19, 33, 24, 35, 22, 31, 27, 34],
    total: 320_000,
    change: "+9%",
  },
  {
    name: "Oosterpark Zorg",
    weeks: [22, 23, 25, 24, 27, 28, 27, 30, 31, 30, 33, 34],
    total: 334_000,
    change: "+14%",
  },
  {
    name: "Fernhill Software",
    weeks: [14, 15, 15, 16, 14, 13, 12, 12, 11, 12, 11, 10],
    total: 155_000,
    change: "−12%",
  },
];

export default function ChartSparkTable() {
  return (
    <Table caption="Revenue by customer, the last twelve weeks.">
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead align="end">Last 12 weeks</TableHead>
          <TableHead align="end">Revenue</TableHead>
          <TableHead align="end">Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.name}>
            <TableCell rowHeader>{customer.name}</TableCell>
            <TableCell align="end">
              <ChartSparkline
                aria-label={`${customer.name}, revenue by week`}
                summary={`${customer.change} over twelve weeks.`}
                values={customer.weeks}
                showHighlight="last"
              />
            </TableCell>
            <TableCell align="end">{euros.format(customer.total)}</TableCell>
            <TableCell align="end">{customer.change}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
