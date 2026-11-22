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

// A stand-in for the real request: it takes a moment, so the action shows that it is working.
const send = () => new Promise((resolve) => setTimeout(resolve, 1200));

// Grave, but nothing is deleted: the action is default, not destructive, and still repeats the
// verb. Its work is a Button whose press returns a Promise: the alert dialog stays open while it runs, Escape
// waits, and it closes once the work is done.
export default function AlertDialogConfirm() {
  const [open, setOpen] = useState(false);
  const [sendingWorking, setSendingWorking] = useState(false);
  const sending = async () => {
    setSendingWorking(true);
    await send().finally(() => {
      setSendingWorking(false);
    });
    setOpen(false);
  };
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next, details) => {
        if (sendingWorking) {
          details.cancel();
          return;
        }
        setOpen(next);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline">Send release notes</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Email 2,400 customers?</AlertDialogTitle>
          <AlertDialogDescription>
            The release notes go to every customer at once. A sent email cannot
            be called back.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <Button
            size="sm"
            onClick={sending}
            loadingLabel="Sending"
            errorLabel="Could not send"
            agentConfirm="Emails the release notes to 2,400 customers"
          >
            Send to everyone
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
