// Tooltip: a square icon button, and above it a short dark label in the accent that points down
// at it.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const lw = 124;
  const lh = 32;
  const gap = 12;
  const s = 48;
  const total = lh + gap + s;
  const y = 90 - total / 2;
  // The label, dark, with its point.
  const lx = 160 - lw / 2;
  pen.fill(lx, y, lw, lh, 9, "accent-fill", 1);
  pen.box(lx, y, lw, lh, 9);
  pen.bar(160 - 36, y + lh / 2, 72, "on-accent", 6);
  pen.chevron(160, y + lh + 3, 5.5, "accent");
  // The control it names: a square button with a plus.
  const by = y + lh + gap;
  pen.fill(160 - s / 2, by, s, s, 12, "sheet");
  pen.box(160 - s / 2, by, s, s, 12);
  pen.line(160, by + s / 2 - 8, 160, by + s / 2 + 8, "pen", 1);
  pen.line(152, by + s / 2, 168, by + s / 2, "pen", 1);
};
