// Data grid: a spreadsheet. A dithered header and gutter, cells ruled by hairlines, a chosen range
// in the accent's dither, and the active cell ringed in the accent with its fill handle.
import type { Pen } from "../pen.ts";

export const dataGrid = (pen: Pen) => {
  const gutter = 24;
  const col = 64;
  const cols = 3;
  const head = 24;
  const row = 24;
  const rows = 4;
  const w = gutter + cols * col;
  const h = head + rows * row;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  pen.fill(x, y, w, h, 8, "sheet");
  // The header row and the gutter, shaded as a sheet's edges are.
  pen.dither(x, y, w, head, 0, 6);
  pen.dither(x, y + head, gutter, h - head, 0, 6);
  // The chosen range: two columns by two rows.
  const sx = x + gutter;
  const sy = y + head + row;
  pen.dither(sx, sy, col * 2, row * 2, 0, 8, "accent");
  pen.box(x, y, w, h, 8);
  // The rules: every column and every row.
  for (let index = 0; index < cols; index += 1) {
    const cx = x + gutter + index * col;
    pen.line(cx, y + 1, cx, y + h - 1, "hair");
  }
  for (let index = 0; index < rows; index += 1) {
    const ry = y + head + index * row;
    pen.line(x + 1, ry, x + w - 1, ry, "hair");
  }
  // Column names, short bars in their heads.
  for (let index = 0; index < cols; index += 1) {
    pen.bar(x + gutter + index * col + 8, y + head / 2, 24, "title", 4);
  }
  // The values, some cells left empty, numbers set to the right.
  const filled = [
    [true, true, true],
    [true, true, false],
    [true, false, true],
    [false, true, true],
  ];
  for (const [r, cells] of filled.entries()) {
    for (const [c, has] of cells.entries()) {
      if (!has) {
        continue;
      }
      const left = x + gutter + c * col;
      const length = 20 + Math.round(pen.random() * 5) * 4;
      const cy = y + head + r * row + row / 2;
      if (c === 0) {
        pen.bar(left + 8, cy, length, "body", 5);
      } else {
        pen.bar(left + col - 8 - length, cy, length, "body", 5);
      }
    }
  }
  // The active cell, ringed in the accent, its fill handle at the range's corner.
  pen.box(sx, sy, col, row, 0, "accent");
  pen.fill(sx + col * 2 - 4, sy + row * 2 - 4, 8, 8, 2, "accent");
};

/** The overview finds it by this name (./index.ts). */
export const draw = dataGrid;
