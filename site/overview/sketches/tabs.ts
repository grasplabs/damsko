// Tabs: a row of names over a hairline, the chosen one in the accent with its line under it, and
// the shown panel's text below.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 216;
  const x = 160 - w / 2;
  const ty = 44;
  const lengths = [38, 46, 34, 42];
  const chosen = 1;
  let left = x + 6;
  for (const [index, length] of lengths.entries()) {
    if (index === chosen) {
      pen.bar(left, ty, length, "accent", 6);
      pen.bar(left - 3, ty + 15, length + 6, "accent", 3);
    } else {
      pen.bar(left, ty, length, "title", 6);
    }
    left += length + 20;
  }
  pen.line(x, ty + 16, x + w, ty + 16, "hair", 1);
  // The panel shown.
  pen.bar(x + 6, ty + 38, 92, "title", 7);
  pen.bar(x + 6, ty + 58, 196, "body");
  pen.bar(x + 6, ty + 72, 172, "body");
  pen.bar(x + 6, ty + 86, 118, "body");
};
