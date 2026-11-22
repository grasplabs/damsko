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
} from "@grasp-os/ui/components/dialog";
import { useState } from "react";

// For the spec only (tests/dialog.spec.ts), at /examples/dialog/by-prop;
// not on the page. It is opened by `open`, with no trigger of its own: a plain button sets what
// is asked, and the panel is drawn only while something is asked, so it leaves the page in the same
// draw that closes it. When it closes, focus must go back to that button.
export default function DialogByProp() {
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
      <Dialog
        open={asking !== null}
        onOpenChange={(next) => {
          if (!next) {
            setAsking(null);
          }
        }}
      >
        {asking !== null && (
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
        )}
      </Dialog>
    </>
  );
}
