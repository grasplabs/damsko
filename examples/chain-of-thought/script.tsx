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
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

// As wide as an answer, as the other examples are: on its own the run would be only as wide as
// its line, and the line would wrap.
const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

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
    <ChainOfThought defaultOpen style={layout.column}>
      <ChainOfThoughtHeader>Planned, searched and read</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {steps.map(({ id, ...step }) => (
          <ChainOfThoughtStep key={id} {...step} />
        ))}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
