"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Plan,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
} from "@grasp-os/ui/components/plan";
import {
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import {
  ClipboardListIcon,
  CircleCheckIcon,
  CircleIcon,
  Icon,
} from "@grasp-os/ui/lib/icons";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: {
    display: "grid",
    justifyItems: "start",
    gap: space["3"],
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.6)`,
  },
  plan: { width: "100%" },
});

const steps = [
  "Install the new primitives",
  "Replace the old imports",
  "Rename asChild to render",
  "Run the type checker",
];

// A plan as it is worked through: the line runs until every step is done, and each step that
// finishes is said once. Press Next to finish the running step.
export default function PlanLive() {
  const [current, setCurrent] = useState(0);
  const finished = current >= steps.length;
  return (
    <div {...stylex.props(layout.column)}>
      <Plan defaultOpen isStreaming={!finished} style={layout.plan}>
        <PlanHeader icon={ClipboardListIcon}>
          <PlanTitle>Plan: move the dialogs to the new primitives</PlanTitle>
          <PlanDescription>
            {Math.min(current, steps.length)} of {steps.length} done
          </PlanDescription>
        </PlanHeader>
        <PlanContent>
          {steps.map((step, index) => {
            const done = index < current;
            return (
              <TraceLine
                key={step}
                status={
                  done ? undefined : index === current ? "running" : "pending"
                }
              >
                <TraceIcon>
                  <Icon icon={done ? CircleCheckIcon : CircleIcon} />
                </TraceIcon>
                <TraceTitle>{step}</TraceTitle>
              </TraceLine>
            );
          })}
        </PlanContent>
      </Plan>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setCurrent((was) => (was >= steps.length ? 0 : was + 1));
        }}
      >
        {finished ? "Start again" : "Next"}
      </Button>
    </div>
  );
}
