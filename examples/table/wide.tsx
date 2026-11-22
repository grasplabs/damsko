import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const teams = [
  { name: "Support", counts: [42, 38, 51, 47, 55, 60, 58, 63] },
  { name: "Sales", counts: [18, 22, 19, 25, 27, 24, 30, 33] },
  { name: "Operations", counts: [9, 11, 10, 14, 12, 15, 13, 16] },
];

export default function TableWide() {
  return (
    <Table caption="Requests closed per month, by team.">
      <TableHeader>
        <TableRow>
          <TableHead>Team</TableHead>
          {months.map((month) => (
            <TableHead key={month} align="end">
              {month}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.name}>
            <TableCell rowHeader>{team.name}</TableCell>
            {team.counts.map((count, index) => (
              <TableCell key={months[index]} align="end">
                {count}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
