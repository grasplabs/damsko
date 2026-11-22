// Navigation menu: a row of triggers with small chevrons, the first one open, and under it a wide
// panel of links in two columns, each a name and a line; the hovered link is in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const labels = [30, 36, 28, 32];
  const gap = 18;
  const each = (length: number) => length + 12;
  const row =
    labels.reduce((sum, length) => sum + each(length), 0) +
    gap * (labels.length - 1);
  const x = 160 - row / 2;
  const ty = 34;
  // The triggers; the first is open.
  let left = x;
  for (const [index, length] of labels.entries()) {
    if (index === 0) {
      pen.fill(left - 8, ty - 10, each(length) + 14, 20, 10, "wash");
    }
    pen.bar(left, ty, length, "title", 5);
    pen.chevron(left + length + 8, ty, 3, "pen", index === 0);
    left += each(length) + gap;
  }
  // The panel, two columns of two links.
  const w = 184;
  const h = 92;
  const py = ty + 16;
  pen.fill(x - 8, py, w, h, 10, "sheet");
  pen.box(x - 8, py, w, h, 10);
  const cw = (w - 12) / 2;
  for (let column = 0; column < 2; column += 1) {
    for (let line = 0; line < 2; line += 1) {
      const lx = x - 8 + 6 + column * cw;
      const ly = py + 6 + line * 40;
      const hovered = column === 0 && line === 0;
      if (hovered) {
        pen.fill(lx, ly, cw - 2, 36, 7, "wash");
      }
      pen.bar(
        lx + 9,
        ly + 12,
        40 + pen.random() * 16,
        hovered ? "accent" : "title",
        5
      );
      pen.bar(lx + 9, ly + 24, 56 + pen.random() * 10, "body", 4);
    }
  }
};
