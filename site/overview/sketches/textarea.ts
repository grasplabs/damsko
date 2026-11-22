// Textarea: a label above a tall field holding three lines of text, the caret in the accent at the
// end of the last, and a grip in the corner.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 216;
  const h = 92;
  const total = 12 + h;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  pen.bar(x + 2, y + 3, 64, "title");
  const fy = y + 12;
  pen.fill(x, fy, w, h, 10, "sheet");
  pen.box(x, fy, w, h, 10);
  const lengths = [180, 164, 96];
  for (const [index, length] of lengths.entries()) {
    pen.bar(x + 16, fy + 20 + index * 18, length, "title", 5);
  }
  // The caret after the last line.
  const ly = fy + 20 + 2 * 18;
  pen.line(x + 118, ly - 8, x + 118, ly + 8, "accent", 1);
  // The grip in the corner.
  const gx = x + w - 8;
  const gy = fy + h - 8;
  pen.line(gx - 10, gy, gx, gy - 10, "hair", 1);
  pen.line(gx - 5, gy, gx, gy - 5, "hair", 1);
};

export const textarea = draw;
