"use client";

import { Stepper } from "@grasp-os/ui/components/stepper";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  stepper: { width: "100%", maxWidth: 560 },
});

// With onValueChange a done step is a button: pressing it goes back to that step. Docs and the stepper
// spec (tests/stepper.spec.ts).
export default function StepperSelect() {
  const [current, setCurrent] = useState(2);
  return (
    <Stepper
      aria-label="Setting up the workspace"
      value={current}
      onValueChange={setCurrent}
      steps={[
        { label: "Details" },
        { label: "Members" },
        { label: "Billing" },
        { label: "Review" },
      ]}
      style={layout.stepper}
    />
  );
}
