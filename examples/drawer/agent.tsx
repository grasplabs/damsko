"use client";

import { Button } from "@grasp-os/ui/components/button";
import type { ButtonVariant } from "@grasp-os/ui/components/button";
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

import { pageAgent } from "../../site/behaviour/agent";

// For the spec only (tests/drawer.spec.ts), at /examples/drawer/agent; not on the page. It puts
// UI SDK's agent bridge on the window, so the spec can open a drawer by its trigger's name, read
// its title and press its actions by name. Sending always fails, so the spec can see a failure keep
// the drawer open and reach the agent with its words.
declare global {
  interface Window {
    drawerLog?: string[];
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (line: string) => {
  window.drawerLog = [...(window.drawerLog ?? []), line];
};

pageAgent();
if (typeof window !== "undefined") {
  window.damskoAgentYes = true;
}

interface TaskProps {
  trigger: string;
  title: string;
  description: string;
  cancel: string;
  action: string;
  variant: ButtonVariant;
  work: () => Promise<void>;
  loadingText: string;
  errorText: string;
}

const Task = ({
  trigger,
  title,
  description,
  cancel,
  action,
  variant,
  work,
  loadingText,
  errorText,
}: TaskProps) => {
  const [open, setOpen] = useState(false);
  const [runWorking, setRunWorking] = useState(false);
  const run = async () => {
    setRunWorking(true);
    await work().finally(() => {
      setRunWorking(false);
    });
    setOpen(false);
  };
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">{trigger}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>{cancel}</DrawerClose>
          <Button
            variant={variant}
            size="sm"
            onClick={run}
            loadingText={loadingText}
            errorText={errorText}
          >
            {action}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default function DrawerAgent() {
  return (
    <>
      <Task
        trigger="Remind me tomorrow"
        title="Set a reminder"
        description="We will send it to your inbox at 9:00."
        cancel="Cancel"
        action="Set reminder"
        variant="default"
        work={async () => {
          await wait(300);
          log("reminded");
        }}
        loadingText="Saving"
        errorText="Could not save"
      />
      <Task
        trigger="Send report"
        title="Send the report"
        description="Everyone on the list gets a copy."
        cancel="Not yet"
        action="Send now"
        variant="default"
        work={async () => {
          await wait(300);
          throw new Error("The list could not be reached.");
        }}
        loadingText="Sending"
        errorText="Could not send"
      />
    </>
  );
}
