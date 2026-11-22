// Tags input: a label above one field holding tags that wrap onto a second line, each a small pill
// with its x, and the caret in the accent after the last.
import type { Pen } from "../pen.ts";

const tag = (pen: Pen, x: number, cy: number, length: number) => {
  const w = length + 30;
  const h = 22;
  pen.fill(x, cy - h / 2, w, h, h / 2, "wash");
  pen.box(x, cy - h / 2, w, h, h / 2);
  pen.bar(x + 9, cy, length, "title", 5);
  pen.cross(x + w - 10, cy, 2.6);
  return w;
};

export const draw = (pen: Pen) => {
  const w = 224;
  const h = 72;
  const total = 12 + h;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  pen.bar(x + 2, y + 3, 64, "title");
  const fy = y + 12;
  pen.fill(x, fy, w, h, 10, "sheet");
  pen.box(x, fy, w, h, 10);
  let tx = x + 8;
  const first = fy + 8 + 11;
  for (const length of [30, 42, 26]) {
    tx += tag(pen, tx, first, length) + 6;
  }
  const second = first + 28;
  const last = tag(pen, x + 8, second, 36);
  pen.line(
    x + 8 + last + 10,
    second - 8,
    x + 8 + last + 10,
    second + 8,
    "accent",
    1
  );
};

export const tagsInput = draw;
