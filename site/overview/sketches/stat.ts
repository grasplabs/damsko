// Stat: three figures side by side in one card, each a small name, a large value and how it
// moved; the first one's rise in the accent.
import type { Pen } from "../pen.ts";

export const stat = (pen: Pen) => {
  const w = 236;
  const h = 90;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const cell = w / 3;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  for (let index = 0; index < 3; index += 1) {
    const cx = x + index * cell;
    if (index > 0) {
      pen.line(cx, y + 10, cx, y + h - 10, "hair", 1);
    }
    const left = cx + 14;
    pen.bar(left, y + 20, 34 + pen.random() * 14, "body", 4);
    pen.bar(left, y + 44, 44 + pen.random() * 10, "title", 11);
    const rise = index !== 2;
    const tone = index === 0 ? "accent" : "pen";
    pen.chevron(left + 4, y + 69, 3.5, tone, rise);
    pen.bar(left + 12, y + 69, 20, index === 0 ? "accent" : "body", 4);
  }
};

export const draw = stat;
