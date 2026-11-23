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
import { useState } from "react";

import { Place, ProjectList } from "./projects";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The request failed: an error in the list's place, never an empty list. Try again works in the
// button itself: it says it is loading, then that it could not, or the list arrives. Here the
// first try fails again and the second gets through, as a patchy connection does.
export default function DidNotLoad() {
  const [tries, setTries] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const retry = async () => {
    await wait(1200);
    setTries(tries + 1);
    if (tries === 0) {
      throw new Error("The projects did not load.");
    }
    setLoaded(true);
  };
  return (
    <Place>
      {loaded ? (
        <ProjectList arrived />
      ) : (
        <Empty size="lg" variant="destructive">
          <EmptyHeader>
            <EmptyMedia illustration="broken" />
            <EmptyTitle>The projects did not load</EmptyTitle>
            <EmptyDescription>
              Nothing is lost. Check your connection, then try again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              loadingText="Trying again"
              successText="Loaded"
              errorText="Not loaded"
            >
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </Place>
  );
}
