// Kbd: two keys inside a sentence, each a raised cap with its edge line, a plus between them, the
// second key's mark in the accent.
import type { Pen } from "../pen.ts";

const key = (
  pen: Pen,
  x: number,
  y: number,
  w: number,
  h: number,
  tone: "title" | "accent"
) => {
  pen.fill(x, y, w, h, 9, "sheet");
  pen.box(x, y, w, h, 9);
  // The cap's lower edge, as a key is printed.
  pen.line(x + 6, y + h - 8, x + w - 6, y + h - 8, "hair", 1);
  pen.bar(x + w / 2 - 10, y + (h - 8) / 2 + 1, 20, tone, 8);
};

export const draw = (pen: Pen) => {
  const kw = 60;
  const kh = 56;
  const y = 90 - kh / 2;
  const before = 32;
  const after = 28;
  const total = before + 12 + kw + 28 + kw + 12 + after;
  const x = 160 - total / 2;
  pen.bar(x, 90, before, "body");
  const k1 = x + before + 12;
  key(pen, k1, y, kw, kh, "title");
  // The plus between the keys.
  const px = k1 + kw + 14;
  pen.line(px - 6, 86, px + 6, 86, "pen", 1);
  pen.line(px, 80, px, 92, "pen", 1);
  const k2 = k1 + kw + 28;
  key(pen, k2, y, kw, kh, "accent");
  pen.bar(k2 + kw + 12, 90, after, "body");
};

export const kbd = draw;
