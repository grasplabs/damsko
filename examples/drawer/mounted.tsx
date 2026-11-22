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

// For the spec only (tests/drawer.spec.ts), at /examples/drawer/mounted; not on the page. The whole
// layer is drawn only while something is asked, and is always `open`: it never sees `open` turn
// false, it leaves the page still open. When it does, focus must go back to the button that asked.
export default function DrawerMounted() {
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
        <Drawer
          open
          onOpenChange={(next) => {
            if (!next) {
              setAsking(null);
            }
          }}
        >
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
        </Drawer>
      )}
    </>
  );
}
