// Date picker, open: a field with a date and a small calendar mark, and under it the month it
// opened, whole, the chosen day a round mark in the accent.
import type { Pen } from "../pen.ts";

const side = (
  pen: Pen,
  cx: number,
  cy: number,
  size: number,
  right: boolean
) => {
  const dx = (right ? 1 : -1) * size * 0.5;
  pen.line(cx - dx, cy - size, cx + dx, cy, "pen", 1);
  pen.line(cx + dx, cy, cx - dx, cy + size, "pen", 1);
};

export const draw = (pen: Pen) => {
  const w = 156;
  const th = 28;
  const gap = 6;
  const ph = 100;
  const total = th + gap + ph;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  const cy = y + th / 2;
  // The field, with the date and the calendar mark.
  pen.fill(x, y, w, th, 8, "sheet");
  pen.box(x, y, w, th, 8);
  pen.bar(x + 12, cy, 64, "title");
  const ix = x + w - 24;
  pen.box(ix, cy - 6, 13, 12, 2.5);
  pen.line(ix + 1, cy - 2, ix + 12, cy - 2, "pen", 1);
  pen.line(ix + 4, cy - 9, ix + 4, cy - 5, "pen", 1);
  pen.line(ix + 9, cy - 9, ix + 9, cy - 5, "pen", 1);
  // The month, open under it.
  const py = y + th + gap;
  const pad = 10;
  pen.fill(x, py, w, ph, 10, "sheet");
  pen.box(x, py, w, ph, 10);
  pen.bar(x + pad + 3, py + 14, 46, "title", 5);
  side(pen, x + w - 34, py + 14, 3.4, false);
  side(pen, x + w - 18, py + 14, 3.4, true);
  const cell = (w - pad * 2) / 7;
  const row = 14;
  const top = py + 32;
  const first = 2;
  const chosen = 12;
  for (let index = 0; index < 30; index += 1) {
    const slot = index + first;
    const dx = x + pad + (slot % 7) * cell + cell / 2;
    const dy = top + Math.floor(slot / 7) * row;
    if (index === chosen) {
      pen.fill(dx - 7, dy - 7, 14, 14, 7, "accent-fill", 0.5);
      pen.bar(dx - 3, dy, 6, "on-accent", 3.5);
    } else {
      pen.bar(dx - 3, dy, 6, "body", 3.5);
    }
  }
};

export const datePicker = draw;
