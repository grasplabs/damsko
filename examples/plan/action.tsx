"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanFooter,
  PlanHeader,
  PlanTitle,
} from "@grasp-os/ui/components/plan";
import {
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import { ClipboardListIcon, CircleIcon, Icon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

const steps = [
  "Export the subscribers to a file",
  "Remove the addresses that bounced",
  "Import the rest into the new list",
];

// A plan waiting for a yes: an action on the whole plan beside its line, and under it the button
// that starts it.
export default function PlanActionExample() {
  const [started, setStarted] = useState(false);
  return (
    <Plan defaultOpen isStreaming={started} style={layout.column}>
      <PlanHeader icon={ClipboardListIcon}>
        <PlanTitle>Plan: move the mailing list</PlanTitle>
        <PlanDescription>
          {started ? `0 of ${steps.length} done` : `${steps.length} steps`}
        </PlanDescription>
      </PlanHeader>
      <PlanAction>
        <Button variant="ghost" size="xs" disabled={started}>
          Edit
        </Button>
      </PlanAction>
      <PlanContent>
        {steps.map((step) => (
          <TraceLine key={step} status="pending">
            <TraceIcon>
              <Icon icon={CircleIcon} />
            </TraceIcon>
            <TraceTitle>{step}</TraceTitle>
          </TraceLine>
        ))}
      </PlanContent>
      <PlanFooter>
        <Button
          size="sm"
          disabled={started}
          onClick={() => {
            setStarted(true);
          }}
        >
          Start the plan
        </Button>
      </PlanFooter>
    </Plan>
  );
}
