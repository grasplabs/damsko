"use client";

import { Button } from "@grasp-os/ui/components-tw/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@grasp-os/ui/components-tw/dialog";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { useState } from "react";

// For the spec only (tests/dialog.spec.ts), at /examples/dialog/by-prop-select; not on the page.
// As by-prop, with a Select inside: its list opens outside the dialog's panel, and once a choice is
// made and the dialog closes, focus must still go back to the button that asked.
export default function DialogByPropSelect() {
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
            <DialogBody>
              <Select items={["Everyone", "Managers"]} defaultValue="Everyone">
                <SelectTrigger aria-label="Send to">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent />
              </Select>
            </DialogBody>
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
