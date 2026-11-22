"use client";

import { Button } from "@grasp-os/ui/components/button";
import { IconTile } from "@grasp-os/ui/components/icon-tile";
import { WandSparklesIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space[4],
  },
  state: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// While the agent runs, the tile's light leans down once and stays; the words say it too.
export default function IconTileRunning() {
  const [loading, setLoading] = useState(false);
  return (
    <div {...stylex.props(layout.row)}>
      <IconTile icon={WandSparklesIcon} variant="gradient" loading={loading} />
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setLoading((was) => !was);
        }}
      >
        {loading ? "Stop" : "Run agent"}
      </Button>
      <p role="status" {...stylex.props(layout.state)}>
        {loading ? "Running" : "Idle"}
      </p>
    </div>
  );
}
