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

// A stand-in for a check that finds a fault: it sends nothing, so it does not say "Not sent". Given
// no errorLabel of its own, the button says the catalogue's neutral words, and the dialog stays open.
const check = () =>
  new Promise((_, reject) =>
    setTimeout(() => {
      reject(new Error("The address did not answer."));
    }, 600)
  );

export default function DialogCheckFailed() {
  const [open, setOpen] = useState(false);
  const test = async () => {
    await check();
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Test the connection</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test the connection</DialogTitle>
          <DialogDescription>
            It asks the address once and says whether it answered.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button size="sm" onClick={test} loadingLabel="Testing">
            Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
