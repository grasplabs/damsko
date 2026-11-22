import { Button } from "@grasp-os/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";

const changes = [
  "The summary now opens with the three decisions the team took this quarter.",
  "The timeline moves the second review from March to April, after the workshop.",
  "Two charts are merged into one, so the costs and the hours read side by side.",
  "The section on risks names an owner for each risk, and the date it is checked again.",
  "Every figure in the appendix links to the sheet it comes from.",
  "The glossary gains four terms that the new members of the team asked about.",
  "The list of open questions is shorter: five were answered in the last meeting.",
  "The cover names the report's owner and the date it was last changed.",
  "Comments that were resolved are removed from the margins.",
  "The closing section says what happens next, and who does it.",
];

export default function DialogLongBody() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Review changes</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review changes</DialogTitle>
          <DialogDescription>
            Ten changes since the report was last shared.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {changes.map((change) => (
            <p key={change}>{change}</p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <DialogClose variant="default">Share the report</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
