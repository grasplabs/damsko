// Context: a bare toolbar button with a small ring a quarter full and its share, and under it the card
// it opens: a heading and a figure, a bar a little filled, and three rows of a label and a number.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  // The trigger.
  const bx = 112;
  const by = 22;
  pen.box(bx + 9, by + 7, 10, 10, 5, "hair");
  pen.line(bx + 14, by + 7, bx + 19, by + 12, "accent", 2);
  pen.bar(bx + 26, by + 12, 58, "title", 5);
  pen.cursor(bx + 70, by + 20);
  // The card.
  const x = 92;
  const y = 56;
  const w = 136;
  pen.fill(x, y, w, 92, 10, "sheet");
  pen.box(x, y, w, 92, 10);
  pen.bar(x + 12, y + 14, 44, "title", 5);
  pen.bar(x + w - 52, y + 14, 40, "body", 4);
  pen.fill(x + 12, y + 26, w - 24, 6, 3, "wash");
  pen.fill(x + 12, y + 26, 22, 6, 3, "accent-fill");
  for (const [index, length] of [30, 38, 46].entries()) {
    const ry = y + 46 + index * 14;
    pen.bar(x + 12, ry, length, "body", 4);
    pen.bar(x + w - 36, ry, 24, "title", 4);
  }
};
