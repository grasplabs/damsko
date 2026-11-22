// Radio group: the question as a darker bar, then three round choices with their labels; the
// chosen one has its ring and dot in the accent.
import type { Pen } from "../pen.ts";

const ring = (
  pen: Pen,
  cx: number,
  cy: number,
  r: number,
  tone: "pen" | "accent"
) => {
  pen.fill(cx - r, cy - r, r * 2, r * 2, r, "sheet");
  pen.box(cx - r, cy - r, r * 2, r * 2, r, tone);
};

export const draw = (pen: Pen) => {
  const r = 12;
  const step = 32;
  const w = 176;
  const h = 18 + r * 2 + step * 2;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  pen.bar(x, y + 3, 112, "title", 7);
  const lengths = [96, 120, 76];
  const chosen = 1;
  for (const [index, length] of lengths.entries()) {
    const cy = y + 18 + r + index * step;
    ring(pen, x + r, cy, r, index === chosen ? "accent" : "pen");
    if (index === chosen) {
      pen.fill(x + r - 5, cy - 5, 10, 10, 5, "accent-fill");
    }
    pen.bar(x + r * 2 + 14, cy, length, "body");
  }
};

export const radioGroup = draw;
