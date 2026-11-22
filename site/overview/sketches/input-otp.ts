// Input OTP: six squares in two threes with a dash between, three filled, the fourth waiting with
// the caret, its square in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const s = 32;
  const h = 44;
  const gap = 6;
  const dash = 24;
  const w = s * 6 + gap * 4 + dash;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  for (let index = 0; index < 6; index += 1) {
    const sx = x + index * (s + gap) + (index >= 3 ? dash - gap : 0);
    pen.fill(sx, y, s, h, 8, "sheet");
    if (index === 3) {
      pen.box(sx, y, s, h, 8, "accent");
      pen.line(sx + s / 2, 90 - 9, sx + s / 2, 90 + 9, "accent", 1);
    } else {
      pen.box(sx, y, s, h, 8);
    }
    if (index < 3) {
      pen.bar(sx + s / 2 - 5, 90, 10, "title", 7);
    }
  }
  // The dash between the two threes.
  const mid = x + 3 * (s + gap) - gap + (dash - 0) / 2;
  pen.line(mid - 5, 90, mid + 5, 90, "pen", 1);
};

export const inputOtp = draw;
