// Data table: a header row of darker bars, then rows of lighter bars in columns, hairlines between
// them, and a sort mark beside the first heading as the accent.
import type { Pen } from "../pen.ts";

export const dataTable = (pen: Pen) => {
  const w = 216;
  const head = 24;
  const row = 20;
  const rows = 4;
  const h = head + rows * row;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const columns = [x + 14, x + 94, x + 160];
  const widths = [58, 46, 40];
  pen.fill(x, y, w, h, 10, "sheet");
  pen.box(x, y, w, h, 10);
  // The header, and the sort mark on the first column.
  pen.bar(columns[0] ?? 0, y + head / 2, 42, "title");
  pen.chevron((columns[0] ?? 0) + 52, y + head / 2 - 0.5, 3.4, "accent", true);
  pen.bar(columns[1] ?? 0, y + head / 2, 34, "title");
  pen.bar(columns[2] ?? 0, y + head / 2, 28, "title");
  pen.line(x + 4, y + head, x + w - 4, y + head, "pen", 1);
  // The rows, each a little different in length.
  for (let index = 0; index < rows; index += 1) {
    const ry = y + head + index * row;
    if (index > 0) {
      pen.line(x + 6, ry, x + w - 6, ry, "hair", 1);
    }
    for (const [column, left] of columns.entries()) {
      const full = widths[column] ?? 40;
      pen.bar(
        left,
        ry + row / 2,
        full * (0.55 + pen.random() * 0.45),
        "body",
        5
      );
    }
  }
};

/** The overview finds it by this name (./index.ts). */
export const draw = dataTable;
