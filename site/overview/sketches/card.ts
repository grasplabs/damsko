// Card: one raised surface holding one thing, a small mark in the accent at its corner, a title
// and two lines of text.
import type { Pen } from "../pen.ts";

export const card = (pen: Pen) => {
  const w = 176;
  const h = 116;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 18;
  pen.fill(x, y, w, h, 14, "sheet");
  pen.box(x, y, w, h, 14);
  // The mark of the thing it holds.
  pen.fill(x + pad, y + pad, 26, 26, 8, "accent-fill", 1);
  pen.box(x + pad, y + pad, 26, 26, 8);
  // Its name and two lines about it.
  pen.bar(x + pad, y + 66, 96, "title", 7);
  pen.bar(x + pad, y + 84, 136, "body");
  pen.bar(x + pad, y + 97, 100, "body");
};

export const draw = card;
