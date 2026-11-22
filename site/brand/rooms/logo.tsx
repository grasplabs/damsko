"use client";

import { logoWords } from "../content";
// Room 03, the logo and the mark. Four walls: the logo under the glass, its clear space, its
// smallest sizes, the mark as the app wears it.
import {
  ClearSpace,
  FilePickup,
  LogoUnderGlass,
  MarkTiles,
  Sizes,
} from "../exhibits";
import { Room, Wall } from "../frame";

export default function LogoRoom() {
  return (
    <Room id="logo">
      <Wall
        room="logo"
        first
        ground="night"
        exhibit={<LogoUnderGlass />}
        rule={logoWords.glass}
        detail={logoWords.ink}
        pickup={
          <>
            <FilePickup id="logo-white" />
            <FilePickup id="logo-ink" />
          </>
        }
      />
      <Wall
        room="logo"
        ground="light"
        exhibit={<ClearSpace />}
        rule={logoWords.clear}
      />
      <Wall
        room="logo"
        ground="light"
        exhibit={<Sizes />}
        rule={logoWords.sizes}
      />
      <Wall
        room="logo"
        ground="light"
        exhibit={<MarkTiles />}
        rule={logoWords.mark}
        detail={logoWords.olderA}
        pickup={
          <>
            <FilePickup id="mark-white" />
            <FilePickup id="mark-ink" />
          </>
        }
      />
    </Room>
  );
}
