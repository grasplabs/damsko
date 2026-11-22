// Button group: three buttons joined on one surface, a line between each, the first one's label in
// the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 216;
  const h = 48;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const part = w / 3;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The joins between the buttons.
  pen.line(x + part, y + 3, x + part, y + h - 3, "pen", 1);
  pen.line(x + part * 2, y + 3, x + part * 2, y + h - 3, "pen", 1);
  const lengths = [40, 32, 38];
  for (const [index, length] of lengths.entries()) {
    const centre = x + part * index + part / 2;
    pen.bar(centre - length / 2, 90, length, index === 0 ? "accent" : "title");
  }
};

export const buttonGroup = draw;
