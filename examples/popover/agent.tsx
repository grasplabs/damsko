import { Button } from "@grasp-os/ui/components/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import { useState } from "react";

import { pageAgent } from "../../site/behaviour/agent";

// For the spec only (tests/popover.spec.ts), at /examples/popover/agent; not on the page. It puts
// UI SDK's agent bridge on the window, so the spec can open a popover by its trigger's name, read
// it, and press its actions by name. Publishing always fails, so a failure reaches the agent with
// its words.
declare global {
  interface Window {
    popoverLog?: string[];
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (line: string) => {
  window.popoverLog = [...(window.popoverLog ?? []), line];
};

pageAgent();

const Share = () => {
  const [open, setOpen] = useState(false);
  const send = async () => {
    await wait(300);
    log("sent");
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary">Share</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Share this report</PopoverTitle>
          <PopoverDescription>
            The people you invite can read it and leave comments.
          </PopoverDescription>
        </PopoverHeader>
        <PopoverFooter>
          <PopoverClose asChild>
            <Button variant="outline">Cancel</Button>
          </PopoverClose>
          <Button
            variant="default"
            onClick={send}
            loadingLabel="Sending"
            errorLabel="Could not send"
          >
            Send invite
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

const Publish = () => {
  const publish = async () => {
    await wait(300);
    throw new Error("The report could not be reached.");
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Publish</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Publish the report</PopoverTitle>
          <PopoverDescription>
            Everyone in the workspace can read it once it is published.
          </PopoverDescription>
        </PopoverHeader>
        <PopoverFooter>
          <PopoverClose asChild>
            <Button variant="outline">Not yet</Button>
          </PopoverClose>
          <Button
            variant="default"
            onClick={publish}
            loadingLabel="Publishing"
            errorLabel="Could not publish"
          >
            Publish now
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default function PopoverAgent() {
  return (
    <>
      <Share />
      <Publish />
    </>
  );
}
