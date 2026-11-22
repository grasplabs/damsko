// Inline citation: two lines of an answer, the second ending in a small filled chip the pointer
// rests on, and under it the card it opens: a title, a line about the source, and a short link.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 56;
  // The answer, the cited words and the chip after them.
  pen.bar(x, 30, 196, "body", 6);
  pen.fill(x - 2, 40, 128, 12, 3, "wash");
  pen.bar(x, 46, 124, "body", 6);
  pen.fill(x + 132, 38, 50, 16, 8, "sheet");
  pen.box(x + 132, 38, 50, 16, 8);
  pen.bar(x + 140, 46, 34, "title", 4);
  pen.cursor(x + 164, 52);
  // The card.
  const cx = x + 84;
  const cy = 64;
  const w = 140;
  pen.fill(cx, cy, w, 70, 10, "sheet");
  pen.box(cx, cy, w, 70, 10);
  pen.bar(cx + 12, cy + 16, 78, "title", 6);
  pen.bar(cx + 12, cy + 32, 112, "body", 4);
  pen.bar(cx + 12, cy + 42, 88, "body", 4);
  pen.bar(cx + 12, cy + 56, 46, "accent", 4);
};
