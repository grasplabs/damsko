// Input group: a label above one field with a prefix inside its start edge and a small button in
// the accent inside its end edge, read as one.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 224;
  const h = 46;
  const total = 12 + h;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  pen.bar(x + 2, y + 3, 64, "title");
  const fy = y + 12;
  pen.fill(x, fy, w, h, 10, "sheet");
  // The prefix, on a light wash, a line after it.
  const pw = 56;
  pen.fill(x + 1, fy + 1, pw, h - 2, 9, "wash");
  pen.box(x, fy, w, h, 10);
  pen.line(x + pw + 1, fy + 2, x + pw + 1, fy + h - 2, "pen", 1);
  pen.bar(x + 14, fy + h / 2, pw - 28, "body", 5);
  // What is typed.
  pen.bar(x + pw + 14, fy + h / 2, 66, "title");
  // The button inside the end edge.
  const bw = 52;
  const bh = 30;
  const bx = x + w - 8 - bw;
  const by = fy + (h - bh) / 2;
  pen.fill(bx, by, bw, bh, bh / 2, "accent-fill", 1);
  pen.box(bx, by, bw, bh, bh / 2);
  pen.bar(bx + 13, by + bh / 2, bw - 26, "on-accent", 4);
};

export const inputGroup = draw;
