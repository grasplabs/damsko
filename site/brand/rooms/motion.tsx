"use client";

// Room 08, motion: the room that moves. One thing moves on each wall, as the visitor arrives and
// again on Replay: the ease drawn as it runs, a panel arriving and leaving, the times, a page's
// opening, the working light, and a stepper whose light moves only at work.
import { motionWords } from "../content";
import {
  Arrival,
  Ease,
  Panel,
  StepperWorking,
  Times,
  Working,
} from "../exhibits-moving";
import { Room, Wall } from "../frame";

export default function MotionRoom() {
  return (
    <Room id="motion">
      <Wall
        room="motion"
        first
        ground="night"
        exhibit={<Ease />}
        rule={motionWords.ease}
      />
      <Wall
        room="motion"
        ground="light"
        exhibit={<Panel />}
        rule={motionWords.panel}
      />
      <Wall
        room="motion"
        ground="night"
        exhibit={<Times />}
        rule={motionWords.times}
      />
      <Wall
        room="motion"
        ground="light"
        exhibit={<Arrival />}
        rule={motionWords.arrive}
      />
      <Wall
        room="motion"
        ground="light"
        exhibit={<Working />}
        rule={motionWords.working}
      />
      <Wall
        room="motion"
        ground="night"
        exhibit={<StepperWorking />}
        rule={motionWords.stepper}
      />
    </Room>
  );
}
