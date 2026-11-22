// Skeleton: a card holding the shape of what is loading: a round avatar, two lines beside it, an
// image block and a last short line, all in dither. Nothing is loaded, so nothing is in the
// accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 200;
  const h = 116;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 16;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The avatar and its two lines: the dither stands for what is still to come.
  pen.dither(x + pad, y + pad, 28, 28, 14, 7);
  pen.dither(x + pad + 40, y + pad + 2, 92, 10, 5, 7);
  pen.dither(x + pad + 40, y + pad + 16, 60, 10, 5, 7);
  // The image, where the light passes: denser in its middle. Then the last line.
  pen.fade(x + pad, y + 54, (w - 2 * pad) / 2, 30, {
    from: 4,
    to: 10,
    dir: "right",
  });
  pen.fade(x + pad + (w - 2 * pad) / 2, y + 54, (w - 2 * pad) / 2, 30, {
    from: 10,
    to: 4,
    dir: "right",
  });
  pen.dither(x + pad, y + 92, 124, 10, 5, 7);
};
