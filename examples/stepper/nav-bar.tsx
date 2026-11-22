"use client";

import { StepperNav } from "@grasp-os/ui/components/stepper";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({ column: { width: "100%", maxWidth: "40rem" } });

// The quiet bar at the top of a guided flow: Back, how far through, Next, as ghost arrows either
// side of the progress. On the last step Next is the words for what it does.
export default function StepperNavBar() {
  const [at, setAt] = useState(2);
  const total = 7;
  return (
    <div {...stylex.props(layout.column)}>
      <StepperNav
        variant="bar"
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
    </div>
  );
}
