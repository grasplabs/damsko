"use client";

import { AudioPlayer } from "@grasp-os/ui/components/audio-player";
import type { AudioPlayerHandle } from "@grasp-os/ui/components/audio-player";
import { Button } from "@grasp-os/ui/components/button";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";

const styles = stylex.create({
  column: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: space["4"],
    width: "100%",
    maxWidth: size.promptInputWidth,
    justifyItems: "start",
  },
  row: { display: "flex", flexWrap: "wrap", gap: space["2"] },
  said: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
  },
});

// A moment of the file: it plays from four seconds and stops at six. The page hears where the
// sound is, and sends it elsewhere from its own buttons, through the player's ref.
export default function AudioPlayerMoment() {
  const player = useRef<AudioPlayerHandle | null>(null);
  const [heard, setHeard] = useState<number | null>(null);
  return (
    <div {...stylex.props(styles.column)}>
      <AudioPlayer
        src="/media/chime.wav"
        duration={16}
        aria-label="From 0:04 to 0:06"
        startTime={4}
        endTime={6}
        ref={player}
        onTimeUpdate={(seconds) => {
          setHeard(seconds);
        }}
      />
      <div {...stylex.props(styles.row)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            player.current?.seek(10);
          }}
        >
          Go to 0:10
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            player.current?.pause();
          }}
        >
          Pause it
        </Button>
      </div>
      <output data-slot="audio-heard" {...stylex.props(styles.said)}>
        {heard === null
          ? "Not heard yet"
          : `Heard at ${heard.toFixed(1)} seconds`}
      </output>
    </div>
  );
}
