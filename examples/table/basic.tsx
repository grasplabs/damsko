import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";

const reports = [
  {
    name: "Quarterly summary",
    owner: "Amara Okafor",
    edited: "12 Nov",
    pages: 14,
  },
  {
    name: "Supplier list for the spring",
    owner: "Jonas Weber",
    edited: "9 Nov",
    pages: 6,
  },
  {
    name: "Team survey results",
    owner: "Lena Ruiz",
    edited: "2 Nov",
    pages: 22,
  },
  { name: "Office move plan", owner: "Sam Patel", edited: "28 Oct", pages: 9 },
];

export default function TableBasic() {
  return (
    <Table caption="Reports shared with the team this quarter.">
      <TableHeader>
        <TableRow>
          <TableHead>Report</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Last edited</TableHead>
          <TableHead align="end">Pages</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.name}>
            <TableCell rowHeader>{report.name}</TableCell>
            <TableCell>{report.owner}</TableCell>
            <TableCell>{report.edited}</TableCell>
            <TableCell align="end">{report.pages}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
