// Input: a label above one field, its value and the caret in the accent, a line of help under it.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 216;
  const h = 44;
  const total = 12 + h + 18;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  pen.bar(x + 2, y + 3, 64, "title");
  const fy = y + 12;
  pen.fill(x, fy, w, h, 10, "sheet");
  pen.box(x, fy, w, h, 10);
  pen.bar(x + 16, fy + h / 2, 96, "title");
  // The caret, just after what is typed.
  pen.line(x + 120, fy + 12, x + 120, fy + h - 12, "accent", 1);
  pen.bar(x + 2, fy + h + 15, 132, "body", 5);
};

export const input = draw;
