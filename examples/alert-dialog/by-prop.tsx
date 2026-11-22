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

// For the check only (tests/alert-dialog.spec.ts), at /examples/alert-dialog/by-prop;
// not on the page. It is opened by `open`, with no trigger of its own: a plain button sets what
// is asked, and the panel is drawn only while something is asked, so it leaves the page in the same
// draw that closes it. When it closes, focus must go back to that button.
export default function AlertDialogByProp() {
  const [asking, setAsking] = useState<string | null>(null);
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setAsking("Send the report?");
        }}
      >
        Ask
      </Button>
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
                Everyone on the team gets it by email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <AlertDialogAction value="confirm">Send</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  );
}
