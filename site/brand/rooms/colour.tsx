"use client";

// Room 04, colour. Two walls: the light as one strip of reeded glass, and every pair that carries
// words, measured as drawn.
import { Button } from "@grasp-os/ui/components/button";
import { DownloadIcon, Icon } from "@grasp-os/ui/lib/icons";

import { colourWords } from "../content";
import { Pairs, TheLight } from "../exhibits";
import { Room, Wall } from "../frame";

export default function ColourRoom() {
  return (
    <Room id="colour">
      <Wall
        room="colour"
        first
        ground="bleed"
        exhibit={<TheLight />}
        rule={colourWords.light}
        detail={colourWords.logoInk}
        beside={
          <Button variant="outline" size="sm" asChild>
            <a href={colourWords.cssHref} download>
              <Icon icon={DownloadIcon} />
              {colourWords.css}
            </a>
          </Button>
        }
      />
      <Wall
        room="colour"
        ground="light"
        exhibit={<Pairs />}
        rule={colourWords.pairs}
      />
    </Room>
  );
}
