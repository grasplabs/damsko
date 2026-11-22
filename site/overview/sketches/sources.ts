// Sources: a few lines of an answer, then the pile under it (three marks overlapping, the count
// and a chevron), and the list it opens: a row per source, its mark, a title over a quieter line.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 56;
  const w = 208;
  // The answer.
  pen.bar(x, 30, 180, "body", 6);
  pen.bar(x, 46, 148, "body", 6);
  // The pile.
  for (let index = 2; index >= 0; index -= 1) {
    const mx = x + index * 12;
    pen.fill(mx, 62, 16, 16, 4, "sheet");
    pen.box(mx, 62, 16, 16, 4);
  }
  pen.bar(x + 48, 70, 52, "title", 5);
  pen.chevron(x + 110, 70, 3);
  // The list it opens.
  const lengths = [96, 120, 80];
  for (const [index, length] of lengths.entries()) {
    const ry = 98 + index * 22;
    pen.box(x, ry - 8, 16, 16, 4, "hair");
    pen.bar(x + 24, ry - 3, length, "title", 4);
    pen.bar(x + 24, ry + 5, length / 2, "body", 3);
  }
  pen.line(x, 86, x + w, 86, "hair", 1);
};
