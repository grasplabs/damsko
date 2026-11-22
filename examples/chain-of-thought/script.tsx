// A run a spec drives (tests/chain-of-thought.spec.ts): `window.chainOfThoughtScript.set` gives the
// steps their next statuses all at once, so a spec can finish two steps together, or add a step
// that is already done.
"use client";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import type { ChainOfThoughtStepData } from "@grasp-os/ui/components/chain-of-thought";
import { useEffect, useState } from "react";

interface Step extends ChainOfThoughtStepData {
  id: string;
}

declare global {
  interface Window {
    chainOfThoughtScript?: { set: (steps: Step[]) => void };
  }
}

export default function ChainOfThoughtScript() {
  const [steps, setSteps] = useState<Step[]>([
    { id: "plan", label: "Planned the answer", status: "complete" },
    { id: "search", label: "Searching the web", status: "active" },
    { id: "read", label: "Reading brief.md", status: "active" },
  ]);
  useEffect(() => {
    window.chainOfThoughtScript = { set: setSteps };
    return () => {
      delete window.chainOfThoughtScript;
    };
  }, []);
  return (
    <ChainOfThought defaultOpen>
      <ChainOfThoughtHeader>Planned, searched and read</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {steps.map(({ id, ...step }) => (
          <ChainOfThoughtStep key={id} {...step} />
        ))}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
