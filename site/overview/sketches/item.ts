// Item: one row of a list, drawn large: a leading mark, the thing's name over a line about it, and
// at its end the one thing to do with it as a small pill in the accent.
import type { Pen } from "../pen.ts";

export const item = (pen: Pen) => {
  const w = 236;
  const h = 72;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 16;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The leading mark.
  const m = 40;
  pen.fill(x + pad, y + (h - m) / 2, m, m, 10, "wash");
  pen.box(x + pad, y + (h - m) / 2, m, m, 10);
  // The name and the line about it.
  const text = x + pad + m + 14;
  pen.bar(text, y + h / 2 - 9, 82, "title", 7);
  pen.bar(text, y + h / 2 + 9, 110, "body", 5);
  // The action.
  const bw = 40;
  const bh = 20;
  const bx = x + w - pad - bw;
  const by = y + (h - bh) / 2;
  pen.fill(bx, by, bw, bh, bh / 2, "accent-fill", 1);
  pen.box(bx, by, bw, bh, bh / 2);
  pen.bar(bx + 10, by + bh / 2, bw - 20, "on-accent", 4);
};

export const draw = item;
