"use client";

import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import { Button } from "@grasp-os/ui/components/button";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: { display: "grid", justifyItems: "start", gap: space[3] },
  row: {
    display: "flex",
    alignItems: "center",
    gap: space[2],
    margin: 0,
    color: colors.foreground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// Working, then finished: the mark stops at once and a tick is drawn in where it stood.
const AgentIndicatorDone = () => {
  const [done, setDone] = useState(false);
  return (
    <div {...stylex.props(layout.column)}>
      <p role="status" {...stylex.props(layout.row)}>
        <AgentIndicator success={done} />
        {done ? "Filled the column" : "Filling the column"}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDone(!done);
        }}
      >
        {done ? "Start again" : "Finish"}
      </Button>
    </div>
  );
};

export default AgentIndicatorDone;
