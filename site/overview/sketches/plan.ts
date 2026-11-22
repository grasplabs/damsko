// Plan: its line (a mark, the goal, the progress and a chevron turned up) and under it the steps on
// a faint rail: two ticked, the running one in the accent, the rest faint.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 62;
  const top = 40;
  // The mark, the goal, the progress and the chevron.
  pen.box(x, top - 5, 10, 10, 2);
  pen.bar(x + 20, top, 96, "title", 7);
  pen.bar(x + 126, top, 34, "body", 5);
  pen.chevron(x + 174, top, 4, "pen", true);
  // The steps.
  const rail = x + 5;
  const gap = 24;
  const first = top + 28;
  const lengths = [112, 88, 128, 96];
  const current = 2;
  pen.line(rail, first, rail, first + gap * (lengths.length - 1), "hair", 1);
  for (const [index, length] of lengths.entries()) {
    const sy = first + index * gap;
    pen.fill(rail - 6, sy - 6, 12, 12, 6, "sheet");
    if (index < current) {
      pen.tick(rail, sy, 3.6);
      pen.bar(x + 20, sy, length, "body", 5);
    } else if (index === current) {
      pen.bar(rail, sy, 0, "accent", 8);
      pen.bar(x + 20, sy, length, "title", 5);
    } else {
      pen.box(rail - 4, sy - 4, 8, 8, 4, "hair");
      pen.bar(x + 20, sy, length, "body", 4);
    }
  }
};
