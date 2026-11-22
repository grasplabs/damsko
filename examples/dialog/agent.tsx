"use client";

import { Button } from "@grasp-os/ui/components/button";
import type { ButtonVariant } from "@grasp-os/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";
import { useState } from "react";

import { pageAgent } from "../../site/behaviour/agent";

// For the spec only (tests/dialog.spec.ts), at /examples/dialog/agent; not on the page. It puts
// UI SDK's agent bridge on the window, with a yes the spec can give or withhold, so the spec can
// open the dialogs by their triggers' names, read their titles and press their actions by name.
// Deleting needs the person's yes (a destructive Button asks with its own words). Publishing always
// fails, so the spec can see a failure keep the dialog open and reach the agent with its words.
declare global {
  interface Window {
    dialogLog?: string[];
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (line: string) => {
  window.dialogLog = [...(window.dialogLog ?? []), line];
};

pageAgent();

interface TaskProps {
  trigger: string;
  title: string;
  description: string;
  cancel: string;
  action: string;
  variant: ButtonVariant;
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
  variant,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{trigger}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>{cancel}</DialogClose>
          <Button
            variant={variant}
            size="sm"
            onClick={run}
            loadingLabel={loadingLabel}
            errorLabel={errorLabel}
          >
            {action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function DialogAgent() {
  return (
    <>
      <Task
        trigger="Rename project"
        title="Rename the project"
        description="Everyone in the workspace sees the new name."
        cancel="Cancel"
        action="Save the name"
        variant="default"
        work={async () => {
          await wait(300);
          log("renamed");
        }}
        loadingLabel="Renaming"
        errorLabel="Could not rename"
      />
      <Task
        trigger="Delete project"
        title="Delete this project?"
        description="Its reports and files go too. This cannot be undone."
        cancel="Keep it"
        action="Delete forever"
        variant="destructive"
        work={async () => {
          await wait(300);
          log("deleted");
        }}
        loadingLabel="Deleting"
        errorLabel="Could not delete"
      />
      <Task
        trigger="Publish report"
        title="Publish the report"
        description="Everyone in the workspace can read it once it is published."
        cancel="Not yet"
        action="Publish now"
        variant="default"
        work={async () => {
          await wait(300);
          throw new Error("The report could not be reached.");
        }}
        loadingLabel="Publishing"
        errorLabel="Could not publish"
      />
    </>
  );
}
