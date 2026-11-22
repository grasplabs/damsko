"use client";

import { AudioPlayer } from "@grasp-os/ui/components/audio-player";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  // One track no wider than the stage, so each bar's 100% cap is the stage's width.
  column: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: space["4"],
    width: "100%",
    justifyItems: "center",
  },
  medium: { maxWidth: "min(26rem, 100%)" },
  small: { maxWidth: "min(18rem, 100%)" },
});

export default function AudioPlayerNarrow() {
  return (
    <div {...stylex.props(layout.column)}>
      <AudioPlayer
        src="/media/chime.wav"
        duration={16}
        aria-label="Four-note chime, medium bar"
        style={layout.medium}
      />
      <AudioPlayer
        src="/media/chime.wav"
        duration={16}
        aria-label="Four-note chime, small bar"
        style={layout.small}
      />
    </div>
  );
}
