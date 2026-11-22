"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Stepper } from "@grasp-os/ui/components/stepper";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const steps = [
  { label: "Details", description: "Name and address" },
  { label: "Members", description: "Who works here" },
  { label: "Billing", description: "A card or an invoice" },
  { label: "Review", description: "Check and send" },
];

const layout = stylex.create({
  frame: {
    display: "grid",
    rowGap: space["8"],
    width: "100%",
    maxWidth: 640,
  },
  pair: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))",
    gap: space["8"],
    alignItems: "start",
  },
  part: {
    display: "grid",
    rowGap: space["3"],
  },
  name: {
    margin: 0,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
  },
});

/**
 * The Stepper across with its move playable, down beside a stepper with a failed step, and every
 * step it can be on. Docs only.
 */
export const StepperLookFixture = () => {
  const [at, setAt] = useState(1);
  const [failed, setFailed] = useState(false);
  const [working, setWorking] = useState(false);
  const shown = failed
    ? steps.map((step, index) =>
        index === at ? { ...step, status: "error" as const } : step
      )
    : steps;
  return (
    <div {...stylex.props(layout.frame)}>
      <div {...stylex.props(layout.part)}>
        <p {...stylex.props(layout.name)}>
          Across: press Next to watch it move
        </p>
        <Stepper
          aria-label="Setting up the workspace"
          value={at}
          steps={shown}
          loading={working}
          onValueChange={(index) => {
            setAt(index);
          }}
        />
        {/* Each keeps its stop when it cannot be pressed: Next pressed on the last step keeps focus
            there, instead of dropping it to the page. */}
        <div {...stylex.props(layout.controls)}>
          <Button
            size="sm"
            focusableWhenDisabled
            variant="outline"
            disabled={at === 0}
            onClick={() => {
              setFailed(false);
              setAt((step) => Math.max(0, step - 1));
            }}
          >
            Back
          </Button>
          <Button
            size="sm"
            focusableWhenDisabled
            variant="outline"
            disabled={at >= steps.length}
            onClick={() => {
              setFailed(false);
              setAt((step) => Math.min(steps.length, step + 1));
            }}
          >
            Next
          </Button>
          <Button
            size="sm"
            focusableWhenDisabled
            variant="outline"
            disabled={at >= steps.length}
            onClick={() => {
              setFailed((was) => !was);
            }}
          >
            {failed ? "Clear failure" : "Fail this step"}
          </Button>
          <Button
            size="sm"
            focusableWhenDisabled
            variant="outline"
            disabled={at >= steps.length || failed}
            onClick={() => {
              setWorking((was) => !was);
            }}
          >
            {working ? "Waiting" : "In progress"}
          </Button>
        </div>
      </div>
      <div {...stylex.props(layout.pair)}>
        <div {...stylex.props(layout.part)}>
          <p {...stylex.props(layout.name)}>Down, the same steps</p>
          <Stepper
            orientation="vertical"
            aria-label="Setting up the workspace"
            value={at}
            steps={shown}
            loading={working}
            onValueChange={(index) => {
              setAt(index);
            }}
          />
        </div>
        <div {...stylex.props(layout.part)}>
          <p {...stylex.props(layout.name)}>Failed on Billing</p>
          <Stepper
            orientation="vertical"
            aria-label="Setting up the workspace"
            value={2}
            steps={steps.map((step, index) =>
              index === 2 ? { ...step, status: "error" as const } : step
            )}
          />
        </div>
      </div>
      <div {...stylex.props(layout.part)}>
        <p {...stylex.props(layout.name)}>Finished</p>
        <Stepper
          aria-label="Setting up the workspace"
          value={steps.length}
          steps={steps}
        />
      </div>
    </div>
  );
};

export default function StepperFixtureLight() {
  return <StepperLookFixture />;
}
