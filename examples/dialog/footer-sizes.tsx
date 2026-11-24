"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";
import { HoldButton } from "@grasp-os/ui/components/hold-button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";

// For the spec only (tests/dialog.spec.ts), at /examples/dialog/footer-sizes; not on the page. The
// footer's own actions that name no size are small, a HoldButton's too; one that names `default`
// keeps it; and a popover opened from the footer draws its own plain Button at its own size.
export default function DialogFooterSizes() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Share the report</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share the report</DialogTitle>
          <DialogDescription>Who can read it, and how.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">More ways</Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>More ways to share</PopoverTitle>
              <Button variant="outline">Copy the link</Button>
            </PopoverContent>
          </Popover>
          <HoldButton>Stop sharing</HoldButton>
          <Button size="default">Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
