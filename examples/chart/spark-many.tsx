import { ChartSparkline } from "@grasp-os/ui/components/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";

// Fifty cost centres, four sparks each: 200 on one page, to see what many cost. The values are
// made from the row's number, the same on the server and in the browser.
const wave = (row: number, column: number) =>
  Array.from(
    { length: 12 },
    (_, week) =>
      50 +
      Math.round(
        20 * Math.sin((week + row) / (2 + column)) +
          ((row * 7 + week * 3 + column) % 9)
      )
  );

const rows = Array.from({ length: 50 }, (_, row) => ({
  name: `Cost centre ${String(row + 101)}`,
  row,
}));
const columns = ["Hours", "Invoices", "Spend", "Margin"];

export default function ChartSparkMany() {
  return (
    <Table caption="Fifty cost centres, the last twelve weeks.">
      <TableHeader>
        <TableRow>
          <TableHead>Cost centre</TableHead>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ name, row }) => (
          <TableRow key={name}>
            <TableCell rowHeader>{name}</TableCell>
            {columns.map((column, index) => (
              <TableCell key={column}>
                <ChartSparkline
                  aria-label={`${name}, ${column.toLowerCase()} by week`}
                  summary="Twelve weeks."
                  values={wave(row, index)}
                  showHighlight="last"
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
