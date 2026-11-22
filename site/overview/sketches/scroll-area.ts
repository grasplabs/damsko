// Scroll area: a box of rows that runs on past its foot, and along its right side a thin track
// with the thumb in the accent.
import type { Pen } from "../pen.ts";

export const scrollArea = (pen: Pen) => {
  const w = 200;
  const h = 116;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  pen.fill(x, y, w, h, 10, "sheet");
  pen.box(x, y, w, h, 10);
  // The rows; the last one runs under the foot, as content that goes on.
  const leading = 16;
  for (let index = 0; index < 7; index += 1) {
    const ry = y + 16 + index * leading;
    pen.bar(
      x + 14,
      ry,
      90 + pen.random() * 60,
      index % 3 === 0 ? "title" : "body",
      5
    );
  }
  // The track and the thumb.
  const tx = x + w - 12;
  pen.line(tx, y + 10, tx, y + h - 10, "hair", 1);
  pen.fill(tx - 3, y + 20, 6, 40, 3, "accent-fill");
};

export const draw = scrollArea;
