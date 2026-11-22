// Number field: a label above a field with a short number in it and, at its end, a step down and a
// step up, the step up in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 196;
  const h = 46;
  const total = 12 + h;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  pen.bar(x + 2, y + 3, 64, "title");
  const fy = y + 12;
  const cy = fy + h / 2;
  pen.fill(x, fy, w, h, 10, "sheet");
  pen.box(x, fy, w, h, 10);
  pen.bar(x + 16, cy, 44, "title");
  // The steps, each its own part, a line before each.
  const sw = 40;
  const down = x + w - sw * 2;
  const up = x + w - sw;
  pen.line(down, fy + 2, down, fy + h - 2, "pen", 1);
  pen.line(up, fy + 2, up, fy + h - 2, "pen", 1);
  pen.line(down + sw / 2 - 6, cy, down + sw / 2 + 6, cy, "pen", 1);
  pen.line(up + sw / 2 - 6, cy, up + sw / 2 + 6, cy, "accent", 1);
  pen.line(up + sw / 2, cy - 6, up + sw / 2, cy + 6, "accent", 1);
};

export const numberField = draw;
