"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@grasp-os/ui/components/empty";

import { Place } from "./projects";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// No connection: not this person's doing and not a failure of the page. Say what is kept, what
// happens when the connection is back, and let them check now.
export default function Offline() {
  const check = async () => {
    await wait(1200);
    throw new Error("Still offline.");
  };
  return (
    <Place>
      <Empty size="lg">
        <EmptyHeader>
          <EmptyMedia illustration="offline" />
          <EmptyTitle>You are offline</EmptyTitle>
          <EmptyDescription>
            Your 2 changes are kept on this device and sent when you are back
            online.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            onClick={check}
            loadingLabel="Checking"
            successLabel="Back online"
            errorLabel="Still offline"
          >
            Check again
          </Button>
        </EmptyContent>
      </Empty>
    </Place>
  );
}
