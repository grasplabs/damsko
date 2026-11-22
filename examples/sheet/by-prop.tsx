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

// For the spec only (tests/sheet.spec.ts), at /examples/sheet/by-prop;
// not on the page. It is opened by `open`, with no trigger of its own: a plain button sets what
// is asked, and the panel is drawn only while something is asked, so it leaves the page in the same
// draw that closes it. When it closes, focus must go back to that button.
export default function SheetByProp() {
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
      <Sheet
        open={asking !== null}
        onOpenChange={(next) => {
          if (!next) {
            setAsking(null);
          }
        }}
      >
        {asking !== null && (
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
        )}
      </Sheet>
    </>
  );
}
