import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";
import type { TableSortDirection } from "@grasp-os/ui/components/table";

// One row or one head of a table, in one state. The docs draw it once per state; hover and
// keyboard focus are forced from the table's own CSS.
export default function TableState({
  part = "row",
  selected = false,
  sortDirection,
}: {
  part?: "row" | "head";
  selected?: boolean;
  sortDirection?: TableSortDirection;
}) {
  if (part === "head") {
    return (
      <Table aria-label="Reports">
        <TableHeader>
          <TableRow>
            <TableHead
              sortDirection={sortDirection ?? "none"}
              onSort={() => {}}
            >
              Report
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
  }
  return (
    <Table aria-label="Reports">
      <TableBody>
        <TableRow selected={selected}>
          <TableCell rowHeader>Quarterly summary</TableCell>
          <TableCell align="end">14</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
