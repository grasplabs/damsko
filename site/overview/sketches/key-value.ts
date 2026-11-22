// Key and value rows: facts in two columns, each a small quiet name over its darker value, rows
// apart by hairlines; one value, a status, in the accent.
import type { Pen } from "../pen.ts";

export const keyValue = (pen: Pen) => {
  const w = 216;
  const row = 34;
  const rows = 3;
  const h = rows * row;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const columns = [x + 4, x + w / 2 + 8];
  for (let index = 0; index < rows; index += 1) {
    const ry = y + index * row;
    if (index > 0) {
      pen.line(x, ry, x + w, ry, "hair", 1);
    }
    for (const [column, left] of columns.entries()) {
      pen.bar(left, ry + 11, 34 + pen.random() * 20, "body", 4);
      const chosen = index === 0 && column === 1;
      pen.bar(
        left,
        ry + 23,
        chosen ? 58 : 60 + pen.random() * 30,
        chosen ? "accent" : "title",
        6
      );
    }
  }
};

export const draw = keyValue;
