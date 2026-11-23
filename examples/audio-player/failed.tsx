"use client";

import { AudioPlayer } from "@grasp-os/ui/components/audio-player";

export default function AudioPlayerFailed() {
  return (
    <AudioPlayer
      src="data:audio/mpeg;base64,AAAA"
      aria-label="Recording that was moved"
      errorText="Could not play this file. It may have been moved."
    />
  );
}
