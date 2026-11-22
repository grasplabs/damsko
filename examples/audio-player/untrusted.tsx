"use client";

import { AudioPlayer } from "@grasp-os/ui/components/audio-player";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { display: "grid", gap: space["3"], width: "100%" },
});

// Sounds whose addresses came in a chat. A remote address does not play (loading it would tell its
// site who listened, and when) unless `allowRemote` says the source is trusted; nor does anything
// that is not sound. A sound written into the address plays.
export default function AudioPlayerUntrusted() {
  return (
    <div {...stylex.props(layout.column)}>
      <AudioPlayer
        src="https://media.example.com/voice-note.mp3"
        aria-label="Voice note from a link"
      />
      <AudioPlayer
        src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="
        aria-label="A drawing, not a sound"
      />
      <AudioPlayer
        src="data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA=="
        aria-label="Voice note written into the address"
      />
    </div>
  );
}
