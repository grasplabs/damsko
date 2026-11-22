"use client";

import { AudioPlayer } from "@grasp-os/ui/components/audio-player";
import { I18nProvider } from "@grasp-os/ui/lib/i18n";

/** "1 minuut 5 seconden": a time as a Dutch screen reader says it. */
const gesproken = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  const part = `${rest} ${rest === 1 ? "seconde" : "seconden"}`;
  return minutes > 0
    ? `${minutes} ${minutes === 1 ? "minuut" : "minuten"} ${part}`
    : part;
};

// Every word it says, in another language, from the product's catalogue: each button, the
// timeline's thumb, where the sound is, said in that language's order, and why it cannot play.
const dutch = {
  audioPlayer: {
    back: "10 seconden terug",
    error: "Dit bestand kan niet worden afgespeeld",
    forward: "10 seconden vooruit",
    loading: "Het geluid wordt geladen",
    pause: "Pauzeren",
    play: "Afspelen",
    playbackRate: "Snelheid",
    position: "Positie",
    soundOn: "Geluid aan",
    soundOff: "Geluid uit",
    timeOf: (now: number, length: number) =>
      `${gesproken(now)} van ${gesproken(length)}`,
  },
};

export default function AudioPlayerLabels() {
  return (
    <I18nProvider locale="nl-NL" catalog={dutch}>
      <AudioPlayer
        src="/media/chime.wav"
        duration={16}
        aria-label="Klokkenspel in vier tonen"
      />
    </I18nProvider>
  );
}
