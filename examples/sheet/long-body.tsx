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

const entries = Array.from({ length: 30 }, (_, index) => {
  const people = ["Amara Okafor", "Jonas Weber", "Lena Ruiz", "Sam Patel"];
  const actions = [
    "edited the summary",
    "added a comment",
    "shared the report",
    "changed the title",
  ];
  return `${people[index % 4]} ${actions[(index + 1) % 4]}, ${index + 1} ${index === 0 ? "hour" : "hours"} ago.`;
});

export default function SheetLongBody() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">History</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>History</SheetTitle>
          <SheetDescription>
            Every change to this report, newest first.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {entries.map((entry) => (
            <p key={entry}>{entry}</p>
          ))}
        </SheetBody>
        <SheetFooter>
          <SheetClose variant="default">Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
