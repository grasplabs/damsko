// Separator: two groups of content with a long line between them in the accent, and under it a
// row of three parts set apart by short upright lines of the same accent.
import type { Pen } from "../pen.ts";

export const separator = (pen: Pen) => {
  const w = 224;
  const x = 160 - w / 2;
  // The first group.
  pen.bar(x, 54, 96, "title", 7);
  pen.bar(x, 70, 160, "body", 5);
  // The line between.
  pen.line(x, 92, x + w, 92, "accent", 1);
  // A row of three, upright lines between.
  const part = 56;
  const gap = 28;
  for (let index = 0; index < 3; index += 1) {
    const px = x + index * (part + gap);
    pen.bar(px, 116, part, "title", 5);
    if (index > 0) {
      pen.line(px - gap / 2, 106, px - gap / 2, 126, "accent", 1);
    }
  }
};

export const draw = separator;
