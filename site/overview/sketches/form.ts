// Form: fields down one column with their labels, two side by side where they belong together, and
// the buttons at the end, the primary one in the accent. No card around it.
import type { Pen } from "../pen.ts";

const field = (
  pen: Pen,
  x: number,
  y: number,
  w: number,
  label: number,
  value: number
) => {
  pen.bar(x + 1, y + 3, label, "title", 5);
  pen.fill(x, y + 10, w, 24, 7, "sheet");
  pen.box(x, y + 10, w, 24, 7);
  if (value) {
    pen.bar(x + 10, y + 22, value, "body", 5);
  }
};

export const draw = (pen: Pen) => {
  const w = 208;
  const h = 122;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  field(pen, x, y, w, 44, 92);
  const half = (w - 10) / 2;
  field(pen, x, y + 42, half, 36, 50);
  field(pen, x + half + 10, y + 42, half, 40, 0);
  // The buttons at the end.
  const bw = 44;
  const bh = 18;
  const by = y + h - bh;
  const primary = x + w - bw;
  const second = primary - 8 - bw;
  pen.box(second, by, bw, bh, bh / 2);
  pen.bar(second + 11, by + bh / 2, bw - 22, "body", 4);
  pen.fill(primary, by, bw, bh, bh / 2, "accent-fill", 1);
  pen.box(primary, by, bw, bh, bh / 2);
  pen.bar(primary + 11, by + bh / 2, bw - 22, "on-accent", 4);
};

export const form = draw;
