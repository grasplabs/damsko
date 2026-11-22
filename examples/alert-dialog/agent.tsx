"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@grasp-os/ui/components/alert-dialog";
import { Button } from "@grasp-os/ui/components/button";
import type { ButtonVariant } from "@grasp-os/ui/components/button";
import { useState } from "react";

import { pageAgent } from "../../site/behaviour/agent";

// For the spec only (tests/alert-dialog.spec.ts), at /examples/alert-dialog/agent; not on the page.
// It puts the page's one agent bridge (`window.damskoAgent`) on the window, with a yes the spec can
// give or withhold, so the spec can open each alert dialog by its trigger's name, read its title
// and press its action by name. Deleting needs the person's yes (a destructive Button asks with its
// own words); clearing always fails, so the spec can hear the failure's words.
declare global {
  interface Window {
    alertDialogLog?: string[];
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (line: string) => {
  window.alertDialogLog = [...(window.alertDialogLog ?? []), line];
};

pageAgent();

interface AskProps {
  trigger: string;
  title: string;
  description: string;
  action: string;
  variant: ButtonVariant;
  work: () => Promise<void>;
  loadingLabel: string;
  errorLabel: string;
  agentConfirm?: string;
}

const Ask = ({
  trigger,
  title,
  description,
  action,
  variant,
  work,
  loadingLabel,
  errorLabel,
  agentConfirm,
}: AskProps) => {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const run = async () => {
    setWorking(true);
    await work().finally(() => {
      setWorking(false);
    });
    setOpen(false);
  };
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next, details) => {
        if (working) {
          details.cancel();
          return;
        }
        setOpen(next);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant={variant === "destructive" ? variant : "secondary"}>
          {trigger}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <Button
            variant={variant}
            size="sm"
            onClick={run}
            loadingLabel={loadingLabel}
            errorLabel={errorLabel}
            agentConfirm={agentConfirm}
          >
            {action}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default function AlertDialogAgent() {
  return (
    <>
      <Ask
        trigger="Delete workspace"
        title="Delete Northwind?"
        description="Its 12 projects and 340 files are deleted for everyone."
        action="Delete"
        variant="destructive"
        work={async () => {
          await wait(300);
          log("deleted");
        }}
        loadingLabel="Deleting"
        errorLabel="Could not delete"
      />
      <Ask
        trigger="Clear history"
        title="Clear the whole history?"
        description="Every past version of every report is removed."
        action="Clear everything"
        variant="default"
        work={async () => {
          await wait(300);
          throw new Error("The history is locked by an export.");
        }}
        loadingLabel="Clearing"
        errorLabel="Could not clear"
        agentConfirm="Clears every past version of every report"
      />
    </>
  );
}
