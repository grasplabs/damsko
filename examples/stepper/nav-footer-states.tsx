"use client";

import { StepperNav } from "@grasp-os/ui/components/stepper";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: {
    display: "grid",
    gap: space["6"],
    width: "100%",
    maxWidth: "40rem",
  },
});

const stay = () => null;

// The first step (Back's room kept), one that waits for an answer (why, in Next's tooltip), and the
// last step working.
export default function StepperNavFooterStates() {
  return (
    <div {...stylex.props(layout.stack)}>
      <StepperNav step={0} total={7} onBack={stay} onNext={stay} />
      <StepperNav
        step={3}
        total={7}
        onBack={stay}
        onNext={stay}
        disabled
        disabledReason="Choose one to go on"
      />
      <StepperNav
        step={6}
        total={7}
        onBack={stay}
        onNext={stay}
        finishLabel="Create agent"
        loading
      />
    </div>
  );
}
