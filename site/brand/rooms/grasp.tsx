"use client";

// Room 01, Grasp: what we are. Four walls: the meadow that grows from one seed (after the website's
// footer: transformation starts small), the promise, the method, and the paragraph about Grasp to
// take away.
import { graspWords } from "../content";
import { About, AboutPickup, Method, ThePromise } from "../exhibits-grasp";
import { Room, Wall } from "../frame";
import { Meadow } from "../meadow";

export default function GraspRoom() {
  return (
    <Room id="grasp">
      <Wall
        room="grasp"
        first
        ground="night"
        exhibit={<Meadow />}
        rule={graspWords.meadow}
      />
      <Wall
        room="grasp"
        ground="night"
        exhibit={<ThePromise />}
        rule={graspWords.promiseRule}
      />
      <Wall
        room="grasp"
        ground="light"
        exhibit={<Method />}
        rule={graspWords.method}
      />
      <Wall
        room="grasp"
        ground="light"
        exhibit={<About />}
        rule={graspWords.about}
        pickup={<AboutPickup />}
      />
    </Room>
  );
}
