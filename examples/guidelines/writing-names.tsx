import { AudioPlayer } from "@grasp-os/ui/components/audio-player";
import { Button } from "@grasp-os/ui/components/button";
import { Link } from "@grasp-os/ui/components/link";
import { I18nProvider, useI18n } from "@grasp-os/ui/lib/i18n";
import { CopyIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

// A control's name joined to its player's, so two players on a page are told apart: "Play, Shift
// planner at 0:05".
const control = (name: string, player: string) => `${name}, ${player}`;

/** The player's controls named for it, through the words the I18nProvider gives the player. */
const NamedFor = ({
  player,
  children,
}: {
  player: string;
  children: ReactNode;
}) => {
  const words = useI18n().audioPlayer;
  return (
    <I18nProvider
      locale="en-GB"
      catalog={{
        audioPlayer: {
          ...words,
          play: control(words.play, player),
          pause: control(words.pause, player),
          back: control(words.back, player),
          forward: control(words.forward, player),
          position: control(words.position, player),
          playbackRate: control(words.playbackRate, player),
          soundOn: control(words.soundOn, player),
          soundOff: control(words.soundOff, player),
        },
      }}
    >
      {children}
    </I18nProvider>
  );
};
const players = ["Shift planner at 0:05", "Shift planner at 0:11"];

// Under each control, in quiet words, what a screen reader says for it: the same words given to
// its name. Wrong: a name that says what it looks like, two players with one name, a link that
// needs its sentence.
export default function WritingNames() {
  const words = useI18n().audioPlayer;
  return (
    <Pair>
      <Write why="names that stand alone">
        <div {...stylex.props(writing.column)}>
          <div {...stylex.props(writing.named)}>
            <Button variant="outline" size="icon" aria-label="Copy">
              <Icon icon={CopyIcon} />
            </Button>
            <p {...stylex.props(writing.heard)}>Heard: “Copy, button”</p>
          </div>
          {players.map((player) => (
            <div key={player} {...stylex.props(writing.namedWide)}>
              <NamedFor player={player}>
                <AudioPlayer
                  src="/media/chime.wav"
                  duration={16}
                  aria-label={player}
                />
              </NamedFor>
              <p {...stylex.props(writing.heard)}>
                Heard: “{control(words.play, player)}, button”
              </p>
            </div>
          ))}
          <Link href="#words-we-use" variant="plain">
            Read the pricing notes
          </Link>
        </div>
      </Write>
      <Not why="names that need their place">
        <div {...stylex.props(writing.column)}>
          <div {...stylex.props(writing.named)}>
            <Button variant="outline" size="icon" aria-label="Icon">
              <Icon icon={CopyIcon} />
            </Button>
            <p {...stylex.props(writing.heard)}>Heard: “Icon, button”</p>
          </div>
          {players.map((player) => (
            <div key={player} {...stylex.props(writing.namedWide)}>
              <AudioPlayer
                src="/media/chime.wav"
                duration={16}
                aria-label={player}
              />
              <p {...stylex.props(writing.heard)}>
                Heard: “{words.play}, button”
              </p>
            </div>
          ))}
          <Link href="#words-we-use" variant="plain">
            Click here
          </Link>
        </div>
      </Not>
    </Pair>
  );
}
