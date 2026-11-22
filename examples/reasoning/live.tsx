"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@grasp-os/ui/components/reasoning";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const thoughts =
  "The question is about terms, not prices alone, so payment days and notice periods count too. Three contracts were renewed this quarter. Tailspin Logistics is the only one whose price list changed; the other two changed their notice period.";

// Words a tick, and how long a tick is: the thinking takes about three seconds.
const STEP = 12;
const TICK = 150;

const layout = stylex.create({
  column: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: space["3"],
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.6)`,
  },
  think: { justifySelf: "start" },
});

// Think streams the thoughts in: the line says Thinking and the thoughts open; once they are all
// in, it settles into how long it thought and closes, unless you opened or closed it meanwhile.
export default function ReasoningLive() {
  const [run, setRun] = useState(0);
  const [length, setLength] = useState(0);
  const isStreaming = run > 0 && length < thoughts.length;
  useEffect(() => {
    if (!isStreaming) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setLength(Math.min(length + STEP, thoughts.length));
    }, TICK);
    return () => {
      clearTimeout(timer);
    };
  }, [isStreaming, length]);
  return (
    <div {...stylex.props(layout.column)}>
      {run > 0 && (
        <Reasoning key={run} isStreaming={isStreaming}>
          <ReasoningTrigger />
          <ReasoningContent>{thoughts.slice(0, length)}</ReasoningContent>
        </Reasoning>
      )}
      <Button
        variant="outline"
        size="sm"
        style={layout.think}
        disabled={isStreaming}
        onClick={() => {
          setLength(0);
          setRun(run + 1);
        }}
      >
        Think
      </Button>
    </div>
  );
}
