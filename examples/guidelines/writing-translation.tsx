import { AudioPlayer } from "@grasp-os/ui/components/audio-player";
import {
  Message,
  MessageContent,
  MessageError,
} from "@grasp-os/ui/components/message";
import { I18nProvider } from "@grasp-os/ui/lib/i18n";
import type { I18nCatalog } from "@grasp-os/ui/lib/i18n";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

// A duration in Dutch, its plural chosen by the language, not by an English "s".
const unit = (count: number, name: "minute" | "second") =>
  new Intl.NumberFormat("nl", {
    style: "unit",
    unit: name,
    unitDisplay: "long",
  }).format(count);
const spoken = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  return minutes > 0
    ? `${unit(minutes, "minute")} ${unit(whole % 60, "second")}`
    : unit(whole, "second");
};

// The message's and the player's every word in Dutch, as the product gives them through its
// I18nProvider. "1×" stays as it is.
const dutch: Partial<I18nCatalog> = {
  message: {
    actions: "Berichtacties",
    assistant: "Assistent",
    done: "Antwoord klaar",
    error: "Kon niet antwoorden",
    retry: "Opnieuw proberen",
    stopped: "Gestopt",
    streaming: "Aan het schrijven",
    user: "Jij",
  },
  audioPlayer: {
    play: "Afspelen",
    pause: "Pauzeren",
    back: "10 seconden terug",
    forward: "10 seconden vooruit",
    position: "Positie",
    playbackRate: "Snelheid",
    soundOn: "Geluid aan",
    soundOff: "Geluid uit",
    loading: "Het geluid laden",
    error: "Dit bestand kan niet worden afgespeeld",
    timeOf: (now, length) => `${spoken(now)} van ${spoken(length)}`,
  },
};

// Every word passed in the product's language. Wrong: one word left out, so it stays in English.
export default function WritingTranslation() {
  return (
    <Pair>
      <Write why="every word passed">
        <div lang="nl" {...stylex.props(writing.column)}>
          <I18nProvider locale="nl-NL" catalog={dutch}>
            <Message status="error">
              <MessageContent>
                <MessageError onRetry={() => {}}>
                  Kon niet antwoorden. De agenda reageerde niet.
                </MessageError>
              </MessageContent>
            </Message>
            <AudioPlayer
              src="/media/chime.wav"
              duration={16}
              aria-label="Gesprek met het ontwerpteam"
            />
          </I18nProvider>
        </div>
      </Write>
      <Not why="one word left in English">
        <div lang="nl" {...stylex.props(writing.column)}>
          <Message status="error">
            <MessageContent>
              <MessageError onRetry={() => {}}>
                Kon niet antwoorden. De agenda reageerde niet.
              </MessageError>
            </MessageContent>
          </Message>
        </div>
      </Not>
    </Pair>
  );
}
