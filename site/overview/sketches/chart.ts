// Chart: bars on a baseline under faint grid lines with their scale at the left. Each bar is the
// charts' own dither fill, lit at its value and thinning to the floor; the tallest is solid.
import type { Pen } from "../pen.ts";

export const chart = (pen: Pen) => {
  const base = 140;
  const grid = [110, 80, 50];
  const left = 44;
  const plot = 66;
  const end = 276;
  // The scale and the grid.
  for (const gy of grid) {
    pen.line(plot, gy, end, gy, "hair");
    pen.bar(left, gy, 14, "body", 4);
  }
  pen.bar(left, base, 10, "body", 4);
  // The bars.
  const heights = [36, 56, 44, 72, 60, 88, 52];
  const bw = 20;
  const gap = 8;
  const span = heights.length * bw + (heights.length - 1) * gap;
  const start = plot + (end - plot - span) / 2;
  const chosen = 5;
  for (const [index, height] of heights.entries()) {
    const bx = start + index * (bw + gap);
    const by = base - height;
    if (index === chosen) {
      pen.fill(bx, by, bw, height, 0, "accent-fill");
    } else {
      pen.fade(bx, by, bw, height, { from: 15, to: 7, tone: "accent", r: 0 });
    }
  }
  pen.line(plot, base, end, base);
};

/** The overview finds it by this name (./index.ts). */
export const draw = chart;
