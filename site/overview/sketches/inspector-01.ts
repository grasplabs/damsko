// Inspector: one record's panel on its own. An icon tile in the accent over its name, a hairline,
// then its facts as rows of a quiet label and a value, and one card of related rows.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 148;
  const h = 144;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  pen.fill(x, y, w, h, 14, "sheet");
  pen.box(x, y, w, h, 14);
  // The head: the record's tile, its name and a line under it.
  pen.fill(x + 14, y + 14, 22, 22, 6, "accent-fill");
  pen.bar(x + 46, y + 20, 56, "title", 6);
  pen.bar(x + 46, y + 32, 40, "body");
  pen.line(x, y + 48, x + w, y + 48, "hair", 1);
  // Its facts: a label, then its value.
  for (const [index, value] of [44, 30, 52].entries()) {
    const ry = y + 62 + index * 14;
    pen.bar(x + 14, ry, 28, "body");
    pen.bar(x + 58, ry, value, "title", 5);
  }
  // A card of related rows.
  pen.box(x + 14, y + 102, w - 28, 30, 8);
  pen.bar(x + 24, y + 112, 60, "title", 5);
  pen.bar(x + 24, y + 123, 44, "body");
};
