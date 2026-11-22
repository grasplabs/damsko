// Reasoning: one quiet line, open, with its chevron; under it the thoughts beside a hairline down
// their start edge, a bold step title over its words.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 62;
  const top = 38;
  // The line.
  pen.bar(x, top, 96, "body", 7);
  pen.chevron(x + 110, top, 4, "pen", true);
  // The thoughts, beside their edge.
  const edge = x + 2;
  pen.line(edge, top + 20, edge, top + 104, "hair", 1);
  pen.bar(x + 16, top + 30, 84, "title", 5);
  const lengths = [168, 150, 120];
  for (const [index, length] of lengths.entries()) {
    pen.bar(x + 16, top + 48 + index * 16, length, "body", 5);
  }
};
