"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Shimmer } from "@grasp-os/ui/components/shimmer";
import { font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const styles = stylex.create({
  // One width for every line it says, so the button under it stays put as the words change.
  column: {
    display: "grid",
    gap: space["4"],
    justifyItems: "start",
    width: "14rem",
    maxWidth: "100%",
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

const steps = ["Thinking", "Searching 3 sources", "Reading the contract"];

// The words change as the work does, and the line settles to plain words when it ends. Press
// Next step to move the work on (a press, not a clock, so the page is the same whenever it is read).
export default function ShimmerSettled() {
  const [at, setAt] = useState(0);
  const working = at < steps.length;
  return (
    <div {...stylex.props(styles.column)}>
      <Shimmer active={working}>
        {working ? (steps[at] ?? "Thinking") : "Thought for 7 seconds"}
      </Shimmer>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          setAt((now) => (now + 1) % (steps.length + 1));
        }}
      >
        {working ? "Next step" : "Start again"}
      </Button>
    </div>
  );
}
