// Avatar: a round picture, dithered where a face would be, with its initials as a bar and a small
// status dot in the accent at its foot, beside a name and a line under it.
import type { Pen } from "../pen.ts";

export const avatar = (pen: Pen) => {
  const d = 76;
  const gap = 18;
  const name = 100;
  const total = d + gap + name;
  const x = 160 - total / 2;
  const y = 90 - d / 2;
  const cx = x + d / 2;
  // The picture: light from above, falling off toward its foot.
  pen.fill(x, y, d, d, d / 2, "sheet");
  pen.fade(x, y, d, d, { from: 2, to: 11, r: d / 2 });
  pen.box(x, y, d, d, d / 2);
  // The status dot at its foot.
  pen.fill(cx + 18, 108, 16, 16, 8, "sheet");
  pen.fill(cx + 21, 111, 10, 10, 5, "accent");
  // The name beside it.
  const nx = x + d + gap;
  pen.bar(nx, 81, name, "title", 8);
  pen.bar(nx, 99, 72, "body", 5);
};

/** The overview finds it by this name (./index.ts). */
export const draw = avatar;
