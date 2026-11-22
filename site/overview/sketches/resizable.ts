// Resizable: two panels in one frame with the line between them, and on that line the handle a
// pointer drags, in the accent.
import type { Pen } from "../pen.ts";

export const resizable = (pen: Pen) => {
  const w = 232;
  const h = 112;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const split = x + 86;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  pen.line(split, y + 2, split, y + h - 2);
  // The handle on the line.
  pen.fill(split - 4, 90 - 13, 8, 26, 4, "accent-fill");
  pen.box(split - 4, 90 - 13, 8, 26, 4, "accent");
  // The left panel, a short list.
  pen.bar(x + 14, y + 20, 44, "title", 6);
  for (let index = 0; index < 4; index += 1) {
    pen.bar(x + 14, y + 40 + index * 15, 36 + pen.random() * 22, "body", 5);
  }
  // The right panel, a title and text.
  pen.bar(split + 18, y + 20, 80, "title", 6);
  pen.bar(split + 18, y + 40, 112, "body", 5);
  pen.bar(split + 18, y + 55, 100, "body", 5);
  pen.bar(split + 18, y + 70, 72, "body", 5);
};

export const draw = resizable;
