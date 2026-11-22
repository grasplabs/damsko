// App shell: a whole window in three parts, a narrow sidebar down the left, a top bar along the
// page, and the page under it with a title and two cards; the current row of the sidebar is the
// accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 232;
  const h = 128;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const side = 60;
  const top = 26;
  pen.fill(x, y, w, h, 10, "sheet");
  pen.box(x, y, w, h, 10);
  // The sidebar.
  pen.line(x + side, y + 4, x + side, y + h - 4, "pen", 1);
  pen.bar(x + 10, y + top / 2, 10, "title", 10);
  const lengths = [32, 38, 28, 34];
  for (const [index, length] of lengths.entries()) {
    const ry = y + 38 + index * 15;
    pen.bar(x + 10, ry, length, index === 0 ? "accent" : "body", 4.5);
  }
  // The top bar.
  const page = x + side;
  pen.line(page + 4, y + top, x + w - 4, y + top, "pen", 1);
  pen.bar(page + 12, y + top / 2, 44, "body", 4.5);
  pen.box(x + w - 24, y + top / 2 - 6, 12, 12, 6);
  // The page.
  pen.bar(page + 12, y + top + 18, 64, "title", 7);
  const cw = (w - side - 12 * 2 - 8) / 2;
  for (const index of [0, 1]) {
    const cx = page + 12 + index * (cw + 8);
    const cy = y + top + 32;
    pen.box(cx, cy, cw, h - top - 44, 8, "hair");
    pen.bar(cx + 9, cy + 14, cw * 0.55, "body", 4.5);
    pen.bar(cx + 9, cy + 26, cw * 0.75, "body", 4.5);
  }
};
