"use client";

// Room 02, names. Three walls: the names as a specimen, Stephen as the platform draws him, and the
// same words in English and Dutch.
import { namesWords } from "../content";
import { Languages, Names, Stephen } from "../exhibits-grasp";
import { Room, Wall } from "../frame";

export default function NamesRoom() {
  return (
    <Room id="names">
      <Wall
        room="names"
        first
        ground="light"
        exhibit={<Names />}
        rule={namesWords.names}
      />
      <Wall
        room="names"
        ground="night"
        exhibit={<Stephen />}
        rule={namesWords.stephen}
      />
      <Wall
        room="names"
        ground="light"
        exhibit={<Languages />}
        rule={namesWords.dutch}
      />
    </Room>
  );
}
