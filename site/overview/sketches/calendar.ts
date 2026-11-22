// Calendar: a month on a card, its name and the arrows to the months either side, the weekdays,
// then the days as short marks; the chosen day a round mark in the accent.
import type { Pen } from "../pen.ts";

/** An arrow head pointing left or right, from two strokes of the pen. */
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
  const w = 184;
  const h = 132;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 12;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The month and the arrows.
  pen.bar(x + pad + 4, y + 17, 60, "title");
  side(pen, x + w - 40, y + 17, 4, false);
  side(pen, x + w - 20, y + 17, 4, true);
  // The weekdays, then five weeks.
  const cell = (w - pad * 2) / 7;
  const row = 17;
  const top = y + 36;
  for (let day = 0; day < 7; day += 1) {
    pen.bar(x + pad + day * cell + cell / 2 - 4, top, 8, "title", 4);
  }
  const first = 3;
  const days = 31;
  const chosen = 17;
  for (let index = 0; index < days; index += 1) {
    const slot = index + first;
    const cx = x + pad + (slot % 7) * cell + cell / 2;
    const cy = top + 17 + Math.floor(slot / 7) * row;
    if (index === chosen) {
      pen.fill(cx - 9, cy - 9, 18, 18, 9, "accent-fill", 0.6);
      pen.bar(cx - 4, cy, 8, "on-accent", 4.5);
    } else {
      pen.bar(cx - 4.5, cy, 9, "body", 4.5);
    }
  }
};

export const calendar = draw;
