// Frames for a test that streams into a Markdown in happy-dom, where motion is allowed, so its pace
// and its fade run (pace.ts, reveal.tsx): requestAnimationFrame and performance.now on a clock of
// the test's own, a frame each 1/60 s, each frame's updates drawn before the next.
import { act } from "react";
import { afterEach, beforeEach, vi } from "vitest";

export const FRAME = 1000 / 60;

/** Puts the frames on the test's clock before each test, and back after it. */
export const onFakeFrames = () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });
};

/** Lets `count` frames go by. */
export const frames = (count = 1) => {
  for (let frame = 0; frame < count; frame += 1) {
    act(() => {
      vi.advanceTimersByTime(FRAME);
    });
  }
};

/**
 * Lets frames go by until the Markdowns in `container` are written and their words have faded in
 * (none busy, no word a span), and gives how many it took; at most `most`, as long as an answer can
 * run on after its stream ends (stream-lag) and its last words fade (duration-stream), with room.
 */
export const settle = (container: Element, most = 120): number => {
  for (let count = 0; count < most; count += 1) {
    if (
      container.querySelector("[aria-busy=true], [data-at]") === null &&
      vi.getTimerCount() === 0
    ) {
      return count;
    }
    frames();
  }
  return most;
};
