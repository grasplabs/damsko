"use client";

// Room 09, icons and marks. Two walls: the icon set drawn large, and the Company Brain's mark.
// Other companies' marks are the product's (BrandIcon takes them from it), so the book shows none.
import { iconWords } from "../content";
import { BrainMark, Icons, IconsPickup } from "../exhibits-motion";
import { Room, Wall } from "../frame";

export default function IconsRoom() {
  return (
    <Room id="icons">
      <Wall
        room="icons"
        first
        ground="light"
        exhibit={<Icons />}
        rule={iconWords.icons}
        pickup={<IconsPickup />}
      />
      <Wall
        room="icons"
        ground="night"
        exhibit={<BrainMark />}
        rule={iconWords.brain}
      />
    </Room>
  );
}
