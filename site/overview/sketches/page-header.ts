// Page header: where the page sits as a short trail, its name as a large bar, one line under it,
// its actions at the end with the main one in the accent, and its tabs over a hairline.
import type { Pen } from "../pen.ts";

/** A small chevron pointing right, centred on (cx, cy). */
const next = (pen: Pen, cx: number, cy: number, size: number) => {
  pen.line(cx - size * 0.5, cy - size, cx + size * 0.5, cy, "pen", 1);
  pen.line(cx + size * 0.5, cy, cx - size * 0.5, cy + size, "pen", 1);
};

export const draw = (pen: Pen) => {
  const w = 224;
  const x = 160 - w / 2;
  const y = 40;
  // The trail.
  pen.bar(x, y, 26, "body", 4);
  next(pen, x + 34, y, 3);
  pen.bar(x + 42, y, 34, "body", 4);
  // The name and its line.
  pen.bar(x, y + 22, 104, "title", 10);
  pen.bar(x, y + 42, 136, "body", 5);
  // The actions, the main one last.
  const bh = 20;
  const by = y + 22 - bh / 2;
  const bw = 40;
  const primary = x + w - bw;
  const quiet = primary - 8 - bw;
  pen.box(quiet, by, bw, bh, bh / 2);
  pen.bar(quiet + 10, by + bh / 2, bw - 20, "body", 4);
  pen.fill(primary, by, bw, bh, bh / 2, "accent-fill", 1);
  pen.box(primary, by, bw, bh, bh / 2);
  pen.bar(primary + 10, by + bh / 2, bw - 20, "on-accent", 4);
  // The tabs.
  const ty = y + 70;
  const lengths = [30, 38, 28];
  let left = x;
  for (const [index, length] of lengths.entries()) {
    pen.bar(left, ty, length, index === 0 ? "title" : "body", 5);
    if (index === 0) {
      pen.line(left - 2, ty + 12, left + length + 2, ty + 12, "pen", 1);
    }
    left += length + 18;
  }
  pen.line(x, ty + 12, x + w, ty + 12, "hair", 1);
};
