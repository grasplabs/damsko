// Chain of thought: one quiet line, open, with its chevron, what it did and the time; under it the
// steps on a faint rail, the done ones ticked and the current one a dot in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 62;
  const top = 38;
  // The line.
  pen.chevron(x + 6, top, 4, "pen", true);
  pen.bar(x + 20, top, 104, "title", 7);
  pen.bar(x + 168, top, 28, "body", 5);
  // The steps.
  const rail = x + 6;
  const gap = 24;
  const first = top + 26;
  const lengths = [118, 92, 136, 76];
  const current = 3;
  pen.line(rail, first, rail, first + gap * (lengths.length - 1), "hair", 1);
  for (const [index, length] of lengths.entries()) {
    const sy = first + index * gap;
    if (index === current) {
      pen.fill(rail - 7, sy - 7, 14, 14, 7, "sheet");
      pen.bar(rail, sy, 0, "accent", 10);
      pen.bar(x + 20, sy, length, "title", 5);
    } else {
      pen.fill(rail - 6, sy - 6, 12, 12, 6, "sheet");
      pen.tick(rail, sy, 3.6);
      pen.bar(x + 20, sy, length, "body", 5);
    }
  }
};
