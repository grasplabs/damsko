"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@grasp-os/ui/components/drawer";
import { useState } from "react";

// A stand-in for a check that finds a fault: it sends nothing, so it does not say "Not sent". Given
// no errorLabel of its own, the button says the catalogue's neutral words, and the drawer stays open.
const check = () =>
  new Promise((_, reject) =>
    setTimeout(() => {
      reject(new Error("The address did not answer."));
    }, 600)
  );

export default function DrawerCheckFailed() {
  const [open, setOpen] = useState(false);
  const test = async () => {
    await check();
    setOpen(false);
  };
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary">Test the connection</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Test the connection</DrawerTitle>
          <DrawerDescription>
            It asks the address once and says whether it answered.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>Cancel</DrawerClose>
          <Button size="sm" onClick={test} loadingLabel="Testing">
            Test
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
