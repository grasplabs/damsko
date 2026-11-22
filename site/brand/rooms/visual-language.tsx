"use client";

// Room 07, the visual language. Six walls: the library's drawings in the dither, the website's
// fine square dots drawing the mark, the lab's light (every look, as stills), the parts that wear
// the dither, and the website's embers and pixel icons. The glass has its own wall in room 03.
import { effectWords, lightWords, visualWords } from "../content";
import { Dither, EmbersWall, Looks, PixelIconsWall } from "../exhibits-light";
import { DotMark, Drawn } from "../exhibits-type";
import { Room, Wall } from "../frame";

export default function VisualRoom({ sketches }: { sketches: string[] }) {
  return (
    <Room id="visual-language">
      <Wall
        room="visual-language"
        first
        ground="light"
        exhibit={<Drawn sketches={sketches} />}
        rule={visualWords.drawn}
      />
      <Wall
        room="visual-language"
        ground="night"
        exhibit={<DotMark />}
        rule={visualWords.dots}
      />
      <Wall
        room="visual-language"
        ground="night"
        exhibit={<Looks />}
        rule={lightWords.light}
      />
      <Wall
        room="visual-language"
        ground="light"
        exhibit={<Dither />}
        rule={lightWords.dither}
      />
      <Wall
        room="visual-language"
        ground="night"
        exhibit={<EmbersWall />}
        rule={effectWords.embers}
      />
      <Wall
        room="visual-language"
        ground="night"
        exhibit={<PixelIconsWall />}
        rule={effectWords.pixels}
      />
    </Room>
  );
}
