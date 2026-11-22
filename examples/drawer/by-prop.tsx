"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
} from "@grasp-os/ui/components/drawer";
import { useState } from "react";

// For the spec only (tests/drawer.spec.ts), at /examples/drawer/by-prop;
// not on the page. It is opened by `open`, with no trigger of its own: a plain button sets what
// is asked, and the panel is drawn only while something is asked, so it leaves the page in the same
// draw that closes it. When it closes, focus must go back to that button.
export default function DrawerByProp() {
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
      <Drawer
        open={asking !== null}
        onOpenChange={(next) => {
          if (!next) {
            setAsking(null);
          }
        }}
      >
        {asking !== null && (
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{asking}</DrawerTitle>
              <DrawerDescription>
                Everyone on the team gets it by email.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Not yet</DrawerClose>
              <DrawerClose value="confirm">Send</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        )}
      </Drawer>
    </>
  );
}
