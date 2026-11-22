// Progress: a label and its count above a long track, the part done filled in the accent, and a
// line of body under it. A lone control, drawn large.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 208;
  const x = 160 - w / 2;
  const th = 14;
  const ty = 90 - th / 2;
  pen.bar(x, ty - 18, 84, "title", 7);
  pen.bar(x + w - 26, ty - 18, 26, "body", 6);
  // The track, and the part done.
  pen.fill(x, ty, w, th, th / 2, "sheet");
  pen.fill(x, ty, w * 0.6, th, th / 2, "accent-fill", 1);
  pen.box(x, ty, w, th, th / 2);
  pen.bar(x, ty + th + 18, 116, "body", 5);
};
