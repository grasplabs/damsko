"use client";

import { Button } from "@grasp-os/ui/components-tw/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@grasp-os/ui/components-tw/dialog";
import { useState } from "react";

// For the spec only (tests/dialog.spec.ts), at /examples/dialog/mounted; not on the page. The whole
// layer is drawn only while something is asked, and is always `open`: it never sees `open` turn
// false, it leaves the page still open. When it does, focus must go back to the button that asked.
export default function DialogMounted() {
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
      {asking !== null && (
        <Dialog
          open
          onOpenChange={(next) => {
            if (!next) {
              setAsking(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{asking}</DialogTitle>
              <DialogDescription>
                Everyone on the team gets it by email.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>Not yet</DialogClose>
              <DialogClose value="confirm">Send</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
