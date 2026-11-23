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

// The thing exists and this person may not open it: say so without blame, name who can change
// that, and let them ask from here. The button says it has asked.
export default function NoAccess() {
  const ask = () => wait(1200);
  return (
    <Place>
      <Empty size="lg">
        <EmptyHeader>
          <EmptyMedia illustration="locked" />
          <EmptyTitle>You do not have access to Pricing 2027</EmptyTitle>
          <EmptyDescription>
            Maya Okafor owns this project and can add you.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            onClick={ask}
            loadingText="Asking"
            successText="Asked Maya"
            errorText="Not sent"
          >
            Ask for access
          </Button>
        </EmptyContent>
      </Empty>
    </Place>
  );
}
