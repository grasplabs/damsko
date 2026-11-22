"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@grasp-os/ui/components/sheet";
import { useState } from "react";

// For the spec only (tests/sheet.spec.ts), at /examples/sheet/mounted; not on the page. The whole
// layer is drawn only while something is asked, and is always `open`: it never sees `open` turn
// false, it leaves the page still open. When it does, focus must go back to the button that asked.
export default function SheetMounted() {
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
        <Sheet
          open
          onOpenChange={(next) => {
            if (!next) {
              setAsking(null);
            }
          }}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{asking}</SheetTitle>
              <SheetDescription>
                Everyone on the team gets it by email.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose>Not yet</SheetClose>
              <SheetClose variant="default" value="confirm">
                Send
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
