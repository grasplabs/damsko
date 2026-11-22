"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Stepper } from "@grasp-os/ui/components/stepper";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const steps = [
  { label: "Workspace" },
  { label: "Company" },
  { label: "Team" },
  { label: "Roles" },
  { label: "Tools" },
  { label: "Data" },
  { label: "Agents" },
  { label: "Billing" },
  { label: "Review" },
];

const layout = stylex.create({
  frame: {
    display: "grid",
    rowGap: space["8"],
    justifyItems: "start",
    width: "100%",
    maxWidth: 880,
  },
  part: {
    display: "grid",
    rowGap: space["3"],
    justifyItems: "start",
    width: "100%",
  },
  name: {
    margin: 0,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  wide: { width: "100%" },
  controls: { display: "flex", flexWrap: "wrap", gap: space["2"] },
});

// The marks alone (hideLabels): nine steps of a setup wizard's foot, each step's name its tooltip
// on hover and on focus, and the same with names. Back to step 3 from step 6, every step up to the furthest reached
// (reached) is a way there, forward as well as back. Docs and the stepper spec
// (tests/stepper.spec.ts).
export default function StepperMarks() {
  const [at, setAt] = useState(2);
  const [furthest, setFurthest] = useState(5);
  const go = (step: number) => {
    setAt(step);
    setFurthest((was) => Math.max(was, step));
  };
  return (
    <div {...stylex.props(layout.frame)}>
      <div {...stylex.props(layout.part)}>
        <p {...stylex.props(layout.name)}>Reached step 6, back on step 3</p>
        <Stepper
          aria-label="Setting up Grasp"
          hideLabels
          value={at}
          reached={furthest}
          onValueChange={go}
          steps={steps}
        />
        <div {...stylex.props(layout.controls)}>
          <Button
            size="sm"
            focusableWhenDisabled
            variant="secondary"
            disabled={at === 0}
            onClick={() => {
              go(Math.max(0, at - 1));
            }}
          >
            Back
          </Button>
          <Button
            size="sm"
            focusableWhenDisabled
            variant="secondary"
            disabled={at >= steps.length}
            onClick={() => {
              go(Math.min(steps.length, at + 1));
            }}
          >
            Next
          </Button>
        </div>
      </div>
      <div {...stylex.props(layout.part)}>
        <p {...stylex.props(layout.name)}>The same, with names</p>
        <Stepper
          aria-label="Setting up Grasp"
          value={at}
          reached={furthest}
          onValueChange={go}
          steps={steps}
          style={layout.wide}
        />
      </div>
      <div {...stylex.props(layout.part)}>
        <p {...stylex.props(layout.name)}>In progress</p>
        <Stepper
          aria-label="Setting up Grasp"
          hideLabels
          value={3}
          loading
          steps={steps}
        />
      </div>
      <div {...stylex.props(layout.part)}>
        <p {...stylex.props(layout.name)}>Failed on Data</p>
        <Stepper
          aria-label="Setting up Grasp"
          hideLabels
          value={5}
          steps={steps.map((step, index) =>
            index === 5 ? { ...step, status: "error" as const } : step
          )}
        />
      </div>
    </div>
  );
}
