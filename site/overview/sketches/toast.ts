// Toast: a small card at the lower corner of a faint page, a tick in the accent, a title, a line
// of body and a dismiss.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 236;
  const h = 128;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  // The page, faint.
  pen.fill(x, y, w, h, 10, "sheet");
  pen.box(x, y, w, h, 10, "hair");
  pen.bar(x + 18, y + 22, 92, "body", 7);
  pen.bar(x + 18, y + 42, 168, "body", 5);
  pen.bar(x + 18, y + 54, 140, "body", 5);
  pen.bar(x + 18, y + 66, 108, "body", 5);
  // The toast, at the corner.
  const tw = 136;
  const th = 46;
  const tx = x + w - 12 - tw;
  const ty = y + h - 12 - th;
  pen.fill(tx, ty, tw, th, 10, "sheet");
  pen.box(tx, ty, tw, th, 10);
  const cx = tx + 18;
  const cy = ty + th / 2;
  pen.box(cx - 7, cy - 7, 14, 14, 7, "accent");
  pen.tick(cx, cy, 3.4, "accent");
  pen.bar(tx + 34, ty + 17, 56, "title", 6);
  pen.bar(tx + 34, ty + 30, 78, "body", 5);
  pen.cross(tx + tw - 13, ty + 15, 2.8);
};
