"use client";

// Room 06, voice and tone. Four walls: the statement landing in three beats, the four principles,
// two sheets side by side, and a sheet that checks a sentence.
import { voiceWords } from "../content";
import { Checker, Principles, Sheets, Statement } from "../exhibits";
import { Room, Wall } from "../frame";

export default function VoiceRoom() {
  return (
    <Room id="voice">
      <Wall
        room="voice"
        first
        ground="night"
        exhibit={<Statement />}
        rule={voiceWords.statement}
      />
      <Wall
        room="voice"
        ground="night"
        exhibit={<Principles />}
        rule={voiceWords.principles}
        detail={voiceWords.principlesDraft}
      />
      <Wall
        room="voice"
        ground="night"
        exhibit={<Sheets />}
        rule={voiceWords.sheets}
      />
      <Wall
        room="voice"
        ground="light"
        exhibit={<Checker />}
        rule={voiceWords.checker}
      />
    </Room>
  );
}
