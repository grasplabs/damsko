// Toggle: three alignment toggles on one track, the middle one pressed, raised out of the track,
// its lines in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 180;
  const h = 54;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 6;
  const gap = 4;
  pen.fill(x, y, w, h, 14, "wash");
  pen.box(x, y, w, h, 14, "hair");
  const iw = (w - pad * 2 - gap * 2) / 3;
  const ih = h - pad * 2;
  // Each icon is three lines, aligned to the start, the centre and the end.
  const lengths = [22, 14, 18];
  const pressed = 1;
  for (let index = 0; index < 3; index += 1) {
    const ix = x + pad + index * (iw + gap);
    const cx = ix + iw / 2;
    const tone = index === pressed ? "accent" : "pen";
    if (index === pressed) {
      pen.fill(ix, y + pad, iw, ih, 9, "sheet");
      pen.box(ix, y + pad, iw, ih, 9);
    }
    for (const [row, length] of lengths.entries()) {
      const ly = 90 - 7 + row * 7;
      const start =
        index === 0
          ? cx - 11
          : index === 1
            ? cx - length / 2
            : cx + 11 - length;
      pen.line(start, ly, start + length, ly, tone, 1);
    }
  }
};

export const toggle = draw;
