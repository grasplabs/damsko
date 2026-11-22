// Pagination: where you are as a short line, the page's number in the accent, and two square
// buttons with chevrons for Previous and Next.
import type { Pen } from "../pen.ts";

/** A chevron pointing left or right, centred on (cx, cy). */
const side = (
  pen: Pen,
  cx: number,
  cy: number,
  size: number,
  left: boolean
) => {
  const dx = (left ? -1 : 1) * size * 0.5;
  pen.line(cx - dx, cy - size, cx + dx, cy, "pen", 1);
  pen.line(cx + dx, cy, cx - dx, cy + size, "pen", 1);
};

export const draw = (pen: Pen) => {
  const s = 44;
  const words = [38, 11, 18, 11];
  const text =
    words.reduce((sum, length) => sum + length, 0) + 6 * (words.length - 1);
  const total = text + 24 + s + 8 + s;
  let left = 160 - total / 2;
  // "Page 2 of 5", the page in the accent.
  for (const [index, length] of words.entries()) {
    pen.bar(left, 90, length, index === 1 ? "accent" : "body", 8);
    left += length + 6;
  }
  left += 18;
  // Previous and Next.
  for (const back of [true, false]) {
    pen.fill(left, 90 - s / 2, s, s, 10, "sheet");
    pen.box(left, 90 - s / 2, s, s, 10);
    side(pen, left + s / 2, 90, 5.5, back);
    left += s + 8;
  }
};
