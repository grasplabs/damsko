"use client";

// Room 05, type. Three walls: the two faces, the scale with a real line at each size, and a
// statement with its quiet second half.
import { typeWords } from "../content";
import { Faces, LeadAndQuiet, Scale, ScalePickup } from "../exhibits-type";
import { Room, Wall } from "../frame";

export default function TypeRoom() {
  return (
    <Room id="type">
      <Wall
        room="type"
        first
        ground="light"
        exhibit={<Faces />}
        rule={typeWords.faces}
      />
      <Wall
        room="type"
        ground="light"
        exhibit={<Scale />}
        rule={typeWords.scale}
        pickup={<ScalePickup />}
      />
      <Wall
        room="type"
        ground="night"
        exhibit={<LeadAndQuiet />}
        rule={typeWords.statement}
      />
    </Room>
  );
}
