"use client";

import { StepperNav } from "@grasp-os/ui/components/stepper";
import { useState } from "react";

// The foot of a guided flow: Back, how far through, and Next as the step's one action. On the last
// step Next says what it does.
export default function StepperNavFooter() {
  const [at, setAt] = useState(2);
  const total = 7;
  return (
    <StepperNav
      step={at}
      total={total}
      showCount
      onBack={() => {
        setAt(Math.max(0, at - 1));
      }}
      onNext={() => {
        setAt(Math.min(total - 1, at + 1));
      }}
      finishLabel="Create agent"
    />
  );
}
