"use client";

import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import { Button } from "@grasp-os/ui/components/button";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: { display: "grid", justifyItems: "start", gap: space[3] },
});

// The work starts before its name is known: unnamed, the mark says nothing; once named, it is a
// status that says the name, and keeps moving.
const AgentIndicatorNamedLater = () => {
  const [label, setLabel] = useState("");
  return (
    <div {...stylex.props(layout.column)}>
      <AgentIndicator aria-label={label} />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setLabel("Filling the column");
        }}
      >
        Name the work
      </Button>
    </div>
  );
};

export default AgentIndicatorNamedLater;
