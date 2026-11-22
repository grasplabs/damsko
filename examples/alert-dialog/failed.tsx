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
import { Icon, TrashIcon } from "@grasp-os/ui/lib/icons";
import { useState } from "react";

// A stand-in for a request that takes a moment and then fails, so the action shows its work and
// then says plainly that nothing was deleted.
const deleteArchive = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  throw new Error("The archive is still being exported.");
};

// While the work runs, the alert dialog stays open and Escape waits. When it fails, the action
// says so and the alert dialog stays open to try again or cancel.
export default function AlertDialogFailed() {
  const [open, setOpen] = useState(false);
  const [removeWorking, setRemoveWorking] = useState(false);
  const remove = async () => {
    setRemoveWorking(true);
    await deleteArchive().finally(() => {
      setRemoveWorking(false);
    });
    setOpen(false);
  };
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next, details) => {
        if (removeWorking) {
          details.cancel();
          return;
        }
        setOpen(next);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Icon icon={TrashIcon} />
          Delete archive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete the 2025 archive?</AlertDialogTitle>
          <AlertDialogDescription>
            Its 1,180 reports are deleted for everyone. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <Button
            variant="destructive"
            size="sm"
            onClick={remove}
            loadingLabel="Deleting"
            errorLabel="Could not delete"
            agentConfirm="Deletes the 2025 archive and its 1,180 reports"
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
