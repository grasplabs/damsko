"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@grasp-os/ui/components/alert-dialog";
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

// For the spec only (tests/dialog.spec.ts), at /examples/dialog/nested; not on the page. A Dialog
// whose own button opens an Alert dialog by `open`, drawn only while it asks. Escape on the inner
// one gives focus back to that button inside the outer; Escape again, to the page's button. A plain
// Button in the footer is as tall as Close, and shares the line with it on a phone.
export default function DialogNested() {
  const [asking, setAsking] = useState<string | null>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit the report</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit the report</DialogTitle>
          <DialogDescription>
            Change its name, or delete it for good.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              setAsking("Delete the report?");
            }}
          >
            Delete it
          </Button>
        </DialogFooter>
        <AlertDialog
          open={asking !== null}
          onOpenChange={(next) => {
            if (!next) {
              setAsking(null);
            }
          }}
        >
          {asking !== null && (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{asking}</AlertDialogTitle>
                <AlertDialogDescription>
                  It goes for good, with its history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction variant="destructive" value="confirm">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
