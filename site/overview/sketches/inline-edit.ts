// Inline edit: a title read as words above, and below it the same title opened as a field, its
// words chosen and the caret in the accent at their end.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 196;
  const h = 40;
  const x = 160 - w / 2;
  const top = 90 - (16 + 14 + h) / 2;
  pen.bar(x + 2, top + 6, 92, "title", 6);
  const fy = top + 30;
  const cy = fy + h / 2;
  pen.fill(x, fy, w, h, 10, "sheet");
  pen.box(x, fy, w, h, 10);
  pen.fill(x + 12, cy - 9, 96, 18, 3, "wash");
  pen.bar(x + 16, cy, 88, "title");
  pen.line(x + 112, cy - 9, x + 112, cy + 9, "accent", 1);
};

export const inlineEdit = draw;
