// App building at work on the showcase, its cursors putting a screen together. In a module of its
// own, apart from Live.tsx: the first screen's cards start as the entrance ends, and they load App
// building alone, not every live piece's components.
"use client";

import { AppBuilding } from "./app-building/app-building";
import type { AppBuildingLook } from "./app-building/parts";

/** App building at work, its cursors putting a screen together; it runs only while it is seen. */
export const Building = ({
  look,
  step,
  seed,
}: {
  look: AppBuildingLook;
  step: string;
  seed: number;
}) => (
  <div className="sc-building">
    <AppBuilding variant={look} step={step} seed={seed} />
  </div>
);
