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
import { useState } from "react";

// A stand-in for the real request: it takes a moment, so the action shows that it is working.
const publishReport = () => new Promise((resolve) => setTimeout(resolve, 1200));

// The action is a Button whose press returns a Promise: it works with the dialog open, and closes it once done.
// While it works the dialog holds: Escape, the shade and the close button wait.
export default function DialogBasic() {
  const [open, setOpen] = useState(false);
  const [publishWorking, setPublishWorking] = useState(false);
  const publish = async () => {
    setPublishWorking(true);
    await publishReport().finally(() => {
      setPublishWorking(false);
    });
    setOpen(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        if (publishWorking) {
          details.cancel();
          return;
        }
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Publish report</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish the report</DialogTitle>
          <DialogDescription>
            Everyone in the workspace can read it once it is published.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            onClick={publish}
            loadingText="Publishing"
            errorText="Could not publish"
          >
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
