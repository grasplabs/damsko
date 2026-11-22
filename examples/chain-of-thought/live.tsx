"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import type { ChainOfThoughtStepStatus } from "@grasp-os/ui/components/chain-of-thought";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

// A run as it happens: each step waits, works, then finishes, and the line follows the work. It
// opens held on its second step, the same on every load, so the page reads the same each time it
// is looked at; Play runs it, and it starts again a few seconds after it ends.
const plan = [
  {
    id: "plan",
    done: "Planned the answer",
    doing: "Planning the answer",
    time: 900,
  },
  {
    id: "search",
    done: "Searched the web",
    doing: "Searching the web",
    description: "quarterly churn benchmarks",
    time: 2100,
  },
  {
    id: "read-1",
    done: "Read churn-q3.csv",
    doing: "Reading churn-q3.csv",
    description: "1,204 rows",
    time: 800,
  },
  {
    id: "read-2",
    done: "Read board-notes.md",
    doing: "Reading board-notes.md",
    time: 600,
  },
  {
    id: "chart",
    done: "Made a chart",
    doing: "Making a chart",
    description: "make_chart",
    time: 1700,
  },
];

const statusAt = (index: number, at: number): ChainOfThoughtStepStatus => {
  if (index < at) {
    return "complete";
  }
  return index === at ? "active" : "pending";
};

/** How long the run stays at step `at`: the step's time, or a rest once it is done. */
const waitAt = (at: number) => {
  const step = plan[at];
  return step === undefined ? 5000 : step.time + 400;
};

const layout = stylex.create({
  column: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: space["3"],
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.6)`,
  },
  play: { justifySelf: "start" },
});

export default function ChainOfThoughtLive() {
  const [at, setAt] = useState(1);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setAt(at < plan.length ? at + 1 : 0);
    }, waitAt(at));
    return () => {
      clearTimeout(timer);
    };
  }, [at, playing]);
  return (
    <div {...stylex.props(layout.column)}>
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader>
          Planned, searched once, read 2 files and made a chart
        </ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          {plan.map((step, index) => {
            const status = statusAt(index, at);
            return (
              <ChainOfThoughtStep
                key={step.id}
                label={status === "active" ? step.doing : step.done}
                description={step.description}
                status={status}
              />
            );
          })}
        </ChainOfThoughtContent>
      </ChainOfThought>
      <Button
        variant="outline"
        size="sm"
        style={layout.play}
        onClick={() => {
          setPlaying(!playing);
        }}
      >
        {playing ? "Pause" : "Play"}
      </Button>
    </div>
  );
}
