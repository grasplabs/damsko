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

// A stand-in for the real request: it takes a moment, so the action shows that it is working.
const remind = () => new Promise((resolve) => setTimeout(resolve, 1200));

// The action is a Button whose press returns a Promise: it works with the drawer open, and closes it once done.
// While it works the drawer holds: Escape, the shade and a drag down wait.
export default function DrawerBasic() {
  const [open, setOpen] = useState(false);
  const [saveWorking, setSaveWorking] = useState(false);
  const save = async () => {
    setSaveWorking(true);
    await remind().finally(() => {
      setSaveWorking(false);
    });
    setOpen(false);
  };
  return (
    <Drawer
      open={open}
      onOpenChange={(next, details) => {
        if (saveWorking) {
          details.cancel();
          return;
        }
        setOpen(next);
      }}
    >
      <DrawerTrigger asChild>
        <Button variant="outline">Remind me tomorrow</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Remind me tomorrow</DrawerTitle>
          <DrawerDescription>
            We will send a reminder about this report to your inbox at 9:00.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>Cancel</DrawerClose>
          <Button
            size="sm"
            onClick={save}
            loadingLabel="Saving"
            errorLabel="Could not save"
          >
            Set reminder
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
