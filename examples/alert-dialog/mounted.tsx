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
import { useState } from "react";

// For the check only (tests/alert-dialog.spec.ts), at /examples/alert-dialog/mounted; not on the page. The whole
// layer is drawn only while something is asked, and is always `open`: it never sees `open` turn
// false, it leaves the page still open. When it does, focus must go back to the button that asked.
export default function AlertDialogMounted() {
  const [asking, setAsking] = useState<string | null>(null);
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          setAsking("Send the report?");
        }}
      >
        Ask
      </Button>
      {asking !== null && (
        <AlertDialog
          open
          onOpenChange={(next) => {
            if (!next) {
              setAsking(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{asking}</AlertDialogTitle>
              <AlertDialogDescription>
                Everyone on the team gets it by email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <AlertDialogAction value="confirm">Send</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
