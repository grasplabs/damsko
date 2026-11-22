"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@grasp-os/ui/components/alert-dialog";
import { Button } from "@grasp-os/ui/components/button";
import { useState } from "react";

// A stand-in for a check that finds a fault: it sends nothing, so it does not say "Not sent". Given
// no errorLabel of its own, the button says the catalogue's neutral words.
const check = () =>
  new Promise((_, reject) =>
    setTimeout(() => {
      reject(new Error("The address did not answer."));
    }, 600)
  );

export default function AlertDialogCheckFailed() {
  const [open, setOpen] = useState(false);
  const test = async () => {
    await check();
    setOpen(false);
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Test the connection</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Test the connection</AlertDialogTitle>
          <AlertDialogDescription>
            It asks the address once and says whether it answered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button size="sm" onClick={test} loadingLabel="Testing">
            Test
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
