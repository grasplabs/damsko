"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import { Slider } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { effort } from "./effort-levels";

const layout = stylex.create({
  panel: { width: "min(20rem, calc(100vw - 2rem))" },
});

// The small size in a popup: the trigger says the level, the panel holds the track of dots.
export default function SliderLevelsPopup() {
  const [level, setLevel] = useState("high");
  const label = effort.find((each) => each.id === level)?.label ?? "";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{`Effort: ${label}`}</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div {...stylex.props(layout.panel)}>
          <Slider
            variant="levels"
            label="Effort"
            size="sm"
            levels={effort}
            value={level}
            onValueChange={setLevel}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
