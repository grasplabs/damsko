"use client";

import { Stepper } from "@grasp-os/ui/components/stepper";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  stepper: { width: "100%", maxWidth: 560 },
});

const steps = [
  { label: "Details" },
  { label: "Members" },
  { label: "Billing" },
  { label: "Review" },
];

// With reached, every step up to the furthest one reached is a button, forward as well as back:
// gone back to Members from Review, Billing and Review are still a press away. Docs and the stepper
// spec (tests/stepper.spec.ts).
export default function StepperReached() {
  const [current, setCurrent] = useState(1);
  return (
    <Stepper
      aria-label="Setting up the workspace"
      value={current}
      reached={3}
      onValueChange={setCurrent}
      steps={steps}
      style={layout.stepper}
    />
  );
}
