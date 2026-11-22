// Checkbox: three choices, each a square box and its label, two of them checked; the checked boxes
// and their ticks in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const s = 24;
  const step = 38;
  const rows = 3;
  const w = 176;
  const h = s + step * (rows - 1);
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const lengths = [104, 132, 84];
  const checked = [true, false, true];
  for (const [index, length] of lengths.entries()) {
    const by = y + index * step;
    pen.fill(x, by, s, s, 6, "sheet");
    if (checked[index]) {
      pen.box(x, by, s, s, 6, "accent");
      pen.tick(x + s / 2, by + s / 2, 6, "accent");
    } else {
      pen.box(x, by, s, s, 6);
    }
    pen.bar(x + s + 14, by + s / 2, length, "title");
  }
};

export const checkbox = draw;
