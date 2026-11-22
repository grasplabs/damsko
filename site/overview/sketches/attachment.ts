// Attachment: a row of three small file cards, each a square mark, a name over a shorter size,
// and a small cross at its end; the last is cut by the row's edge.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const y = 66;
  const h = 36;
  const widths = [104, 92, 104];
  let x = 40;
  for (const [index, w] of widths.entries()) {
    pen.fill(x, y, w, h, 10, "sheet");
    pen.box(x, y, w, h, 10);
    // The mark.
    pen.box(x + 6, y + 6, 24, 24, 6, "hair");
    pen.bar(x + 36, y + 13, w - 64 - index * 6, "title", 4);
    pen.bar(x + 36, y + 23, 22, "body", 3);
    pen.cross(x + w - 13, y + h / 2, 3);
    x += w + 8;
  }
};
