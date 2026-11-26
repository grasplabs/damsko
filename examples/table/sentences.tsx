import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";

const rows = [
  {
    step: "Draft",
    what: "The writer drafts the report from last quarter's numbers and the team's notes.",
    days: 3,
  },
  {
    step: "Review",
    what: "Two people read it and leave comments; the writer answers each one.",
    days: 2,
  },
  {
    step: "שליחה",
    what: "הדוח נשלח לכל הצוות ולהנהלה.",
    days: 1,
  },
];

// Sentences in cells: the heads and cells with `wrap` let their words run onto more lines, so the
// table fits a narrow column; the column of figures stays on one line. `dir="auto"` lets a row in
// Hebrew read from the right.
export default function TableSentences() {
  return (
    <Table caption="The steps of the quarterly report.">
      <TableHeader>
        <TableRow>
          <TableHead wrap>Step</TableHead>
          <TableHead wrap>What happens</TableHead>
          <TableHead align="end">Days</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.step}>
            <TableCell wrap dir="auto">
              {row.step}
            </TableCell>
            <TableCell wrap dir="auto">
              {row.what}
            </TableCell>
            <TableCell align="end">{row.days}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
