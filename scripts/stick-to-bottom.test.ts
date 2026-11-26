// The follower's glide (src/lib/stick-to-bottom.ts): frame by frame toward an end that moves, as a
// streamed answer grows a line now and then or a code block at once. It never passes the end, it
// keeps up with a fast stream, a line comes in over several frames rather than in one, and a
// burst is caught up within a few frames.
//
//   pnpm exec vp test scripts/stick-to-bottom.test.ts
import { describe, expect, test } from "vitest";

import { glide, still } from "../src/lib/stick-to-bottom.ts";
import type { Glide } from "../src/lib/stick-to-bottom.ts";

const FRAME = 1000 / 60;
const LINE = 24;

/** Follows `grow(frame)` pixels of growth a frame for `frames` frames, from the end. */
const follow = (grow: (frame: number) => number, frames: number) => {
  let end = 0;
  let top = 0;
  let motion: Glide = still;
  const steps: number[] = [];
  const gaps: number[] = [];
  for (let frame = 0; frame < frames; frame += 1) {
    end += grow(frame);
    const { top: at, glide: carried } = glide(
      top,
      end,
      frame * FRAME,
      FRAME,
      motion
    );
    steps.push(at - top);
    top = at;
    motion = carried;
    gaps.push(end - top);
  }
  return { steps, gaps };
};

describe(glide, () => {
  test("it never scrolls past the end, nor back up", () => {
    const { steps, gaps } = follow((frame) => (frame % 5 === 0 ? 200 : 3), 300);
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(0);
    expect(Math.min(...steps)).toBeGreaterThanOrEqual(0);
  });

  test("a fast stream, a line every few frames, is followed within a line", () => {
    const { gaps } = follow(
      (frame) =>
        (Math.floor((frame + 1) / 3.6) - Math.floor(frame / 3.6)) * LINE,
      600
    );
    expect(Math.max(...gaps.slice(60))).toBeLessThan(LINE);
  });

  test("a line glides in over several frames, and is all in view within half a second", () => {
    const { steps, gaps } = follow((frame) => (frame === 0 ? LINE : 0), 30);
    expect(Math.max(...steps)).toBeLessThan(LINE / 2);
    expect(steps.filter((step) => step > 0).length).toBeGreaterThan(3);
    expect(gaps.at(-1)).toBe(0);
  });

  test("a code block that lands at once is caught up within a few frames", () => {
    const { gaps } = follow((frame) => (frame === 0 ? 200 : 0), 40);
    // All of it within about 150ms: nine frames.
    expect(gaps[9]).toBe(0);
    expect(gaps.at(-1)).toBe(0);
  });

  test("a stalled frame counts as a short one, and uneven frames still end at the end", () => {
    expect(glide(0, 200, 1000, 1000, still).top).toBe(
      glide(0, 200, 100, 100, still).top
    );
    let top = 0;
    let motion: Glide = still;
    let now = 0;
    for (const ms of [
      8, 33, 8, 50, 16, 7, 120, 16, 16, 16, 33, 8, 16, 16, 16,
    ]) {
      now += ms;
      const { top: at, glide: carried } = glide(top, 300, now, ms, motion);
      expect(at).toBeGreaterThanOrEqual(top);
      expect(at).toBeLessThanOrEqual(300);
      top = at;
      motion = carried;
    }
    expect(top).toBe(300);
  });
});
