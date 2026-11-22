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
  SheetTrigger,
} from "@grasp-os/ui/components/sheet";
import { useState } from "react";

import { pageAgent } from "../../site/behaviour/agent";

// For the spec only (tests/sheet.spec.ts), at /examples/sheet/agent; not on the page. It puts UI
// SDK's agent bridge on the window, so the spec can open a sheet by its trigger's name, read its
// title and press its actions by name. Sending always fails, so the spec can see a failure keep the
// sheet open and reach the agent with its words.
declare global {
  interface Window {
    sheetLog?: string[];
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (line: string) => {
  window.sheetLog = [...(window.sheetLog ?? []), line];
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
  work: () => Promise<void>;
  loadingLabel: string;
  errorLabel: string;
}

const Task = ({
  trigger,
  title,
  description,
  cancel,
  action,
  work,
  loadingLabel,
  errorLabel,
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary">{trigger}</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>{cancel}</SheetClose>
          <Button
            size="sm"
            onClick={run}
            loadingLabel={loadingLabel}
            errorLabel={errorLabel}
          >
            {action}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default function SheetAgent() {
  return (
    <>
      <Task
        trigger="Remind me tomorrow"
        title="Set a reminder"
        description="We will send it to your inbox at 9:00."
        cancel="Cancel"
        action="Set reminder"
        work={async () => {
          await wait(300);
          log("reminded");
        }}
        loadingLabel="Saving"
        errorLabel="Could not save"
      />
      <Task
        trigger="Send report"
        title="Send the report"
        description="Everyone on the list gets a copy."
        cancel="Not yet"
        action="Send now"
        work={async () => {
          await wait(300);
          throw new Error("The list could not be reached.");
        }}
        loadingLabel="Sending"
        errorLabel="Could not send"
      />
    </>
  );
}
