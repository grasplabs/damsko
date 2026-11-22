// Breadcrumb: one line of names with small chevrons between them, from the top of the site down to
// the page you are on, which is in the accent.
import type { Pen } from "../pen.ts";

/** A small chevron pointing right, centred on (cx, cy). */
const next = (pen: Pen, cx: number, cy: number, size: number) => {
  pen.line(cx - size * 0.5, cy - size, cx + size * 0.5, cy, "pen", 1);
  pen.line(cx + size * 0.5, cy, cx - size * 0.5, cy + size, "pen", 1);
};

export const draw = (pen: Pen) => {
  const lengths = [32, 44, 38, 54];
  const gap = 24;
  const total =
    lengths.reduce((sum, length) => sum + length, 0) +
    gap * (lengths.length - 1);
  let left = 160 - total / 2;
  for (const [index, length] of lengths.entries()) {
    const last = index === lengths.length - 1;
    pen.bar(left, 90, length, last ? "accent" : "title", 8);
    if (!last) {
      next(pen, left + length + gap / 2, 90, 4.5);
    }
    left += length + gap;
  }
};
