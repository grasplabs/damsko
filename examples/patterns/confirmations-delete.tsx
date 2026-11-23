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

// A stand-in for the real request: it takes a moment, so the action shows that it is working.
const deleteProject = () => new Promise((resolve) => setTimeout(resolve, 1200));

// A grave loss asks first, in an alert dialog. The question names the thing and what is lost; the
// action repeats the verb, in danger, and Keep it is the quiet way out, where focus starts.
export default function ConfirmationsDelete() {
  const [open, setOpen] = useState(false);
  const [removeWorking, setRemoveWorking] = useState(false);
  const remove = async () => {
    setRemoveWorking(true);
    await deleteProject().finally(() => {
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
          Delete project
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Quarterly review?</AlertDialogTitle>
          <AlertDialogDescription>
            Its 14 reports and their comments are deleted for everyone. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <Button
            variant="destructive"
            size="sm"
            onClick={remove}
            loadingText="Deleting"
            errorText="Could not delete"
            agentConfirm="Deletes the project Quarterly review and its 14 reports"
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
