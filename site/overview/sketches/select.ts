// Select, open: the trigger with its value and a chevron, and under it the list, whole, with one
// chosen row in the accent and a tick.
import type { Pen } from "../pen.ts";

export const select = (pen: Pen) => {
  const w = 160;
  const th = 28;
  const gap = 6;
  const row = 20;
  const rows = 4;
  const lh = rows * row + 8;
  const total = th + gap + lh;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  // The trigger.
  pen.fill(x, y, w, th, 8, "sheet");
  pen.box(x, y, w, th, 8);
  pen.bar(x + 12, y + th / 2, 62, "title");
  pen.chevron(x + w - 16, y + th / 2, 4.5);
  // The list, open under it.
  const ly = y + th + gap;
  pen.fill(x, ly, w, lh, 10, "sheet");
  pen.box(x, ly, w, lh, 10);
  const lengths = [70, 88, 56, 78];
  const chosen = 1;
  for (const [index, length] of lengths.entries()) {
    const ry = ly + 4 + index * row;
    if (index === chosen) {
      pen.fill(x + 4, ry, w - 8, row, 6, "wash");
      pen.bar(x + 12, ry + row / 2, length, "accent");
      pen.tick(x + w - 17, ry + row / 2, 4.5, "accent");
    } else {
      pen.bar(x + 12, ry + row / 2, length, "body");
    }
  }
};

/** The overview finds it by this name (./index.ts). */
export const draw = select;
