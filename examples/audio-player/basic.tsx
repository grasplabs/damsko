"use client";

import { AudioPlayer } from "@grasp-os/ui/components/audio-player";

export default function AudioPlayerBasic() {
  return (
    <AudioPlayer
      src="/media/chime.wav"
      duration={16}
      aria-label="Four-note chime"
    />
  );
}
