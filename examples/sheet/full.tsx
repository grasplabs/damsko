import { Button } from "@grasp-os/ui/components/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@grasp-os/ui/components/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const teams = [
  { name: "Support", counts: [42, 38, 51, 47, 55, 60, 58, 63, 61, 66, 70, 68] },
  { name: "Sales", counts: [18, 22, 19, 25, 27, 24, 30, 33, 31, 29, 35, 38] },
  {
    name: "Operations",
    counts: [9, 11, 10, 14, 12, 15, 13, 16, 18, 17, 19, 21],
  },
  { name: "Finance", counts: [6, 8, 7, 9, 11, 10, 12, 9, 13, 14, 12, 15] },
  { name: "People", counts: [4, 5, 7, 6, 8, 7, 9, 10, 8, 11, 12, 10] },
  { name: "Legal", counts: [3, 2, 4, 5, 3, 6, 4, 5, 7, 6, 5, 8] },
  {
    name: "Facilities",
    counts: [12, 10, 13, 11, 14, 16, 15, 13, 17, 18, 16, 19],
  },
  {
    name: "Engineering",
    counts: [25, 28, 31, 29, 33, 35, 32, 36, 38, 37, 40, 42],
  },
  { name: "Design", counts: [7, 9, 8, 10, 12, 11, 13, 12, 14, 15, 13, 16] },
  { name: "Research", counts: [5, 6, 5, 7, 8, 9, 7, 10, 9, 11, 10, 12] },
  {
    name: "Marketing",
    counts: [14, 16, 15, 18, 17, 20, 19, 22, 21, 23, 25, 24],
  },
  { name: "Partners", counts: [8, 7, 9, 10, 9, 12, 11, 13, 12, 14, 15, 16] },
  { name: "Security", counts: [6, 7, 6, 8, 9, 8, 10, 11, 10, 12, 11, 13] },
  { name: "Data", counts: [10, 12, 11, 13, 15, 14, 16, 15, 17, 18, 19, 20] },
  { name: "Training", counts: [3, 4, 4, 5, 6, 5, 7, 6, 8, 7, 9, 8] },
  { name: "Procurement", counts: [5, 6, 7, 6, 8, 9, 8, 10, 9, 11, 10, 12] },
  { name: "Quality", counts: [4, 5, 6, 5, 7, 6, 8, 9, 8, 10, 9, 11] },
  {
    name: "Logistics",
    counts: [11, 13, 12, 14, 16, 15, 17, 18, 16, 19, 20, 22],
  },
  { name: "Community", counts: [2, 3, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7] },
  { name: "Events", counts: [1, 2, 3, 5, 4, 6, 8, 7, 5, 4, 3, 6] },
];

// A table opened in full: the year by team, with room for every month on one line.
export default function SheetFull() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Open the year in full</Button>
      </SheetTrigger>
      <SheetContent size="full">
        <SheetHeader>
          <SheetTitle>Requests closed this year</SheetTitle>
          <SheetDescription>Every team, month by month.</SheetDescription>
        </SheetHeader>
        <SheetBody>
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
        </SheetBody>
        <SheetFooter>
          <SheetClose>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
