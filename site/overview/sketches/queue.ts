// Queue: two sections, each a line with its mark, its count and a chevron; under the first, to-dos
// on a faint rail, each a circle, the first running in the accent; the second folded.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 62;
  const top = 38;
  // The first section's line.
  pen.box(x, top - 5, 10, 10, 2);
  pen.bar(x + 20, top, 52, "title", 7);
  pen.chevron(x + 86, top, 4, "pen", true);
  // Its to-dos.
  const rail = x + 5;
  const gap = 22;
  const first = top + 26;
  const lengths = [128, 104, 140];
  pen.line(rail, first, rail, first + gap * (lengths.length - 1), "hair", 1);
  for (const [index, length] of lengths.entries()) {
    const sy = first + index * gap;
    pen.fill(rail - 6, sy - 6, 12, 12, 6, "sheet");
    pen.box(rail - 5, sy - 5, 10, 10, 5, index === 0 ? "accent" : "pen");
    pen.bar(x + 20, sy, length, index === 0 ? "title" : "body", 5);
  }
  // The second section's line, folded.
  const second = first + gap * lengths.length + 6;
  pen.box(x, second - 5, 10, 10, 2);
  pen.bar(x + 20, second, 72, "title", 7);
  pen.chevron(x + 106, second, 4, "pen");
};
