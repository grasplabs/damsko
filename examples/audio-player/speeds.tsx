"use client";

import { AudioPlayer } from "@grasp-os/ui/components/audio-player";

export default function AudioPlayerSpeeds() {
  return (
    <AudioPlayer
      src="/media/chime.wav"
      duration={16}
      aria-label="Four-note chime"
      playbackRates={[1, 0.75, 0.5]}
    />
  );
}
