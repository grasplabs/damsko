// Table: a plain table with no frame and no controls, a header of darker bars over an accent rule,
// rows of lighter bars between hairlines, the last column set to the right as numbers are.
import type { Pen } from "../pen.ts";

export const table = (pen: Pen) => {
  const w = 224;
  const head = 22;
  const row = 22;
  const rows = 4;
  const h = head + rows * row;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const right = x + w - 4;
  // The header, and the rule under it in the accent.
  pen.bar(x + 4, y + head / 2, 46, "title");
  pen.bar(x + 92, y + head / 2, 36, "title");
  pen.bar(right - 30, y + head / 2, 30, "title");
  pen.line(x, y + head, x + w, y + head, "accent", 1);
  // The rows, the last column ending at the right.
  for (let index = 0; index < rows; index += 1) {
    const ry = y + head + index * row;
    if (index > 0) {
      pen.line(x + 2, ry, x + w - 2, ry, "hair", 1);
    }
    pen.bar(x + 4, ry + row / 2, 44 + pen.random() * 30, "body", 5);
    pen.bar(x + 92, ry + row / 2, 30 + pen.random() * 34, "body", 5);
    const number = 22 + pen.random() * 12;
    pen.bar(right - number, ry + row / 2, number, "body", 5);
  }
  pen.line(x + 2, y + h, x + w - 2, y + h, "hair", 1);
};

export const draw = table;
