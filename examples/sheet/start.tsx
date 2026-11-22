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

const folders = ["Reports", "Shared with me", "Templates", "Archive"];

export default function SheetStart() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Folders</Button>
      </SheetTrigger>
      <SheetContent side="start">
        <SheetHeader>
          <SheetTitle>Folders</SheetTitle>
          <SheetDescription>
            Places to go stand along the start, where reading begins.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {folders.map((folder) => (
            <p key={folder}>{folder}</p>
          ))}
        </SheetBody>
        <SheetFooter>
          <SheetClose>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
