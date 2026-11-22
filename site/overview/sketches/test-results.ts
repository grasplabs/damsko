// Test results: the run's line, a flask, its counts and the chevron; under it a suite's line open
// on its tests, a tick or a cross at each, the failed one in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 62;
  const top = 36;
  // The run.
  pen.box(x, top - 6, 12, 12, 3);
  pen.bar(x + 22, top, 104, "title", 6);
  pen.chevron(x + 140, top, 4, "pen", true);
  // A suite.
  const sx = x + 14;
  const sy = top + 24;
  pen.box(sx, sy - 5, 10, 10, 2);
  pen.bar(sx + 18, sy, 70, "title", 5);
  pen.bar(sx + 94, sy, 40, "body", 4);
  // Its tests.
  const tests = [
    [92, false],
    [118, false],
    [84, true],
    [104, false],
  ] as const;
  for (const [index, [length, failed]] of tests.entries()) {
    const ty = sy + 22 + index * 20;
    if (failed) {
      pen.cross(sx + 20, ty, 3, "accent");
    } else {
      pen.tick(sx + 20, ty, 3);
    }
    pen.bar(sx + 32, ty, length, failed ? "accent" : "body", 5);
  }
};
