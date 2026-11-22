"use client";

// Room 13, downloads. Two walls: the files to take, and the colours' CSS as it is.
import { downloadWords } from "../content";
import { ColoursCss, Files } from "../exhibits-apply";
import { Room, Wall } from "../frame";

export default function DownloadsRoom() {
  return (
    <Room id="downloads">
      <Wall
        room="downloads"
        first
        ground="light"
        exhibit={<Files />}
        rule={downloadWords.files}
        detail={downloadWords.filesInk}
      />
      <Wall
        room="downloads"
        ground="night"
        exhibit={<ColoursCss />}
        rule={downloadWords.css}
      />
    </Room>
  );
}
