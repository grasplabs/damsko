// Switch: two settings, each a name and a line of help with its switch at the end; the first is on,
// its track in the accent, the second off.
import type { Pen } from "../pen.ts";

const knob = (pen: Pen, cx: number, cy: number, r: number) => {
  pen.fill(cx - r, cy - r, r * 2, r * 2, r, "sheet");
  pen.box(cx - r, cy - r, r * 2, r * 2, r);
};

export const draw = (pen: Pen) => {
  const w = 228;
  const x = 160 - w / 2;
  const tw = 48;
  const th = 28;
  const tx = x + w - tw;
  const rows = [90 - 30, 90 + 30];
  for (const [index, cy] of rows.entries()) {
    pen.bar(x, cy - 8, 92, "title");
    pen.bar(x, cy + 8, 128, "body", 5);
    const ty = cy - th / 2;
    if (index === 0) {
      pen.fill(tx, ty, tw, th, th / 2, "accent-fill", 1);
      pen.box(tx, ty, tw, th, th / 2);
      knob(pen, tx + tw - th / 2, cy, th / 2 - 4);
    } else {
      pen.fill(tx, ty, tw, th, th / 2, "wash");
      pen.box(tx, ty, tw, th, th / 2);
      knob(pen, tx + th / 2, cy, th / 2 - 4);
    }
  }
  pen.line(x, 90, x + w, 90, "hair", 1);
};

export const switchSketch = draw;
