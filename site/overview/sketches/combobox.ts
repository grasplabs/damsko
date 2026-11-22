// Combobox, open: a field with a search mark, a few typed letters and the caret in the accent, and
// under it the list, narrowed, each row starting with the letters it matched.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 160;
  const th = 30;
  const gap = 6;
  const row = 20;
  const rows = 3;
  const lh = rows * row + 8;
  const total = th + gap + lh;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  const cy = y + th / 2;
  // The field, with what is typed so far.
  pen.fill(x, y, w, th, 8, "sheet");
  pen.box(x, y, w, th, 8);
  pen.box(x + 10, cy - 5, 9, 9, 4.5);
  pen.line(x + 18, cy + 3, x + 21, cy + 6, "pen", 1);
  pen.bar(x + 30, cy, 26, "title");
  pen.line(x + 61, cy - 8, x + 61, cy + 8, "accent", 1);
  // The list, narrowed to what matches.
  const ly = y + th + gap;
  pen.fill(x, ly, w, lh, 10, "sheet");
  pen.box(x, ly, w, lh, 10);
  const rest = [58, 74, 44];
  for (const [index, length] of rest.entries()) {
    const ry = ly + 4 + index * row;
    if (index === 0) {
      pen.fill(x + 4, ry, w - 8, row, 6, "wash");
    }
    pen.bar(x + 12, ry + row / 2, 24, "title");
    pen.bar(x + 38, ry + row / 2, length, "body");
  }
};

export const combobox = draw;
