import { Button } from "@grasp-os/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@grasp-os/ui/components/drawer";

const changes = [
  "Reports can now be shared with people outside the workspace, with a link that ends after a week.",
  "The list of members can be sorted by the date they joined.",
  "Exports keep the order of columns you chose in the table.",
  "Reminders arrive at the time of day you set, wherever you are.",
  "A report in the archive can be brought back by anyone in the workspace.",
  "Comments show who has read them.",
  "The search finds words inside attached files.",
  "Two people editing one report now see each other's changes as they type.",
  "Notifications can be paused for a day from the account menu.",
  "Long titles wrap rather than being cut off.",
  "Tables can be printed with their footer on every page.",
  "A member can leave a workspace from their own settings.",
  "Files up to 2 GB can be attached to a report.",
  "The calendar shows the week number.",
  "Links to a report open at the section they point to.",
  "Archived reports can be found by search.",
];

export default function DrawerLongBody() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">What is new</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>What is new this month</DrawerTitle>
          <DrawerDescription>
            Sixteen changes since your last visit.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          {changes.map((change) => (
            <p key={change}>{change}</p>
          ))}
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose variant="default">Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
