"use client";

// Room 10, layout. Two walls: a page drawn small (night, paper, night), and a wide window beside a
// phone, each with its one column and its gutters.
import { layoutWords } from "../content";
import { Column, Rhythm } from "../exhibits-product";
import { Room, Wall } from "../frame";

export default function LayoutRoom() {
  return (
    <Room id="layout">
      <Wall
        room="layout"
        first
        ground="light"
        exhibit={<Rhythm />}
        rule={layoutWords.rhythm}
      />
      <Wall
        room="layout"
        ground="light"
        exhibit={<Column />}
        rule={layoutWords.column}
      />
    </Room>
  );
}
