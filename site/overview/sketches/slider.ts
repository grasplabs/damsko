// Slider: its name and value on one line, the track below, filled up to the thumb, the thumb and
// the filled part in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 224;
  const x = 160 - w / 2;
  const ty = 90 + 12;
  pen.bar(x, 90 - 22, 72, "title");
  pen.bar(x + w - 28, 90 - 22, 28, "title");
  // The track, and the part already set.
  const th = 8;
  const at = x + w * 0.62;
  pen.fill(x, ty - th / 2, w, th, th / 2, "wash");
  pen.box(x, ty - th / 2, w, th, th / 2);
  pen.fill(x, ty - th / 2, at - x, th, th / 2, "accent-fill");
  // The thumb.
  const r = 13;
  pen.fill(at - r, ty - r, r * 2, r * 2, r, "sheet");
  pen.box(at - r, ty - r, r * 2, r * 2, r, "accent");
};

export const slider = draw;
