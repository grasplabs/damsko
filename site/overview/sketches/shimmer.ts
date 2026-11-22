// Shimmer: a line that says what is working, light crossing its words as a band of dither,
// densest where the light is now.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 200;
  const x = 160 - w / 2;
  // The light's band, passing to the right: it thins to both sides.
  pen.fade(x + 40, 64, 60, 32, {
    from: 0,
    to: 11,
    dir: "right",
    tone: "accent",
  });
  pen.fade(x + 100, 64, 60, 32, {
    from: 11,
    to: 0,
    dir: "right",
    tone: "accent",
  });
  // The words, in three runs; the light lies on the middle one.
  pen.bar(x, 80, 56, "body", 8);
  pen.bar(x + 64, 80, 72, "accent", 8);
  pen.bar(x + 144, 80, 56, "body", 8);
  // A second line under it, settled: plain words.
  pen.bar(x, 112, 132, "body", 5);
};

export const shimmer = draw;
