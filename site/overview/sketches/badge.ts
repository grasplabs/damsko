// Badge: three small pills in a row, each a short word, the first filled in the accent and the
// others quiet washes.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const widths = [70, 58, 78];
  const h = 30;
  const gap = 12;
  const total =
    widths.reduce((sum, w) => sum + w, 0) + gap * (widths.length - 1);
  let x = 160 - total / 2;
  const y = 90 - h / 2;
  for (const [index, w] of widths.entries()) {
    if (index === 0) {
      pen.fill(x, y, w, h, h / 2, "accent-fill", 1);
      pen.box(x, y, w, h, h / 2);
      pen.bar(x + 16, 90, w - 32, "on-accent", 6);
    } else {
      pen.fill(x, y, w, h, h / 2, "wash");
      pen.box(x, y, w, h, h / 2);
      pen.bar(x + 16, 90, w - 32, "title", 6);
    }
    x += w + gap;
  }
};
