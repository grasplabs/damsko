import { Button } from "@grasp-os/ui/components/button";
import {
  Trace,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
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
});

const steps = [
  {
    done: "Searched the web",
    running: "Searching the web",
    next: "Search the web",
  },
  {
    done: "Read pricing-2026.pdf",
    running: "Reading pricing-2026.pdf",
    next: "Read pricing-2026.pdf",
  },
  {
    done: "Wrote pricing-brief.md",
    running: "Writing pricing-brief.md",
    next: "Write pricing-brief.md",
  },
];

// Steps as they happen: press Next to finish the running step. A step that finishes is said once.
export default function TraceLive() {
  const [current, setCurrent] = useState(0);
  return (
    <div {...stylex.props(layout.column)}>
      <Trace>
        {steps.map((step, index) => {
          if (index < current) {
            return (
              <TraceLine key={step.done}>
                <TraceIcon />
                <TraceTitle>{step.done}</TraceTitle>
              </TraceLine>
            );
          }
          const running = index === current;
          return (
            <TraceLine key={step.done} status={running ? "running" : "pending"}>
              <TraceIcon />
              <TraceTitle>{running ? step.running : step.next}</TraceTitle>
            </TraceLine>
          );
        })}
      </Trace>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setCurrent((was) => (was > steps.length - 1 ? 0 : was + 1));
        }}
      >
        {current > steps.length - 1 ? "Start again" : "Next"}
      </Button>
    </div>
  );
}
