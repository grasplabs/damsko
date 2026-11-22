"use client";

import { AudioPlayer } from "@grasp-os/ui/components/audio-player";
import { Button } from "@grasp-os/ui/components/button";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const styles = stylex.create({
  column: {
    display: "grid",
    gap: space["4"],
    width: "100%",
    maxWidth: size.promptInputWidth,
    justifyItems: "start",
  },
});

// Two recordings in one bar, and the same file with no length given: for trying a change of file
// (the speed chosen stays) and a bar that reads its length from the file.
export default function AudioPlayerSwitch() {
  const [second, setSecond] = useState(false);
  return (
    <div {...stylex.props(styles.column)}>
      <AudioPlayer
        src={second ? "/media/chime.wav?take=2" : "/media/chime.wav"}
        duration={16}
        aria-label={second ? "Second take" : "First take"}
      />
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          setSecond((now) => !now);
        }}
      >
        {second ? "First take" : "Second take"}
      </Button>
      <AudioPlayer
        src="/media/chime.wav?unmeasured"
        aria-label="No length given"
      />
    </div>
  );
}
