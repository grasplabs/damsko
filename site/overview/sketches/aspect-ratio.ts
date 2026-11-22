// Aspect ratio: a wide frame holding the room of a picture (hills and a sun, washed), with its
// width and its height measured along two sides in the accent.
import type { Pen } from "../pen.ts";

export const aspectRatio = (pen: Pen) => {
  const w = 176;
  const h = 99;
  const x = 160 - (w + 16) / 2;
  const y = 90 - (h + 16) / 2;
  pen.fill(x, y, w, h, 8, "wash");
  pen.box(x, y, w, h, 8);
  // The picture's room: hills and a sun.
  pen.line(x + 14, y + h - 18, x + 56, y + 44, "pen", 1);
  pen.line(x + 56, y + 44, x + 86, y + 70, "pen", 1);
  pen.line(x + 86, y + 70, x + 116, y + 48, "pen", 1);
  pen.line(x + 116, y + 48, x + 160, y + h - 18, "pen", 1);
  pen.box(x + 124, y + 14, 18, 18, 9);
  // The measures: a width along the foot, a height along the right.
  const mx = y + h + 12;
  pen.line(x, mx, x + w, mx, "accent", 1);
  pen.line(x, mx - 4, x, mx + 4, "accent", 1);
  pen.line(x + w, mx - 4, x + w, mx + 4, "accent", 1);
  const my = x + w + 12;
  pen.line(my, y, my, y + h, "accent", 1);
  pen.line(my - 4, y, my + 4, y, "accent", 1);
  pen.line(my - 4, y + h, my + 4, y + h, "accent", 1);
};

export const draw = aspectRatio;
